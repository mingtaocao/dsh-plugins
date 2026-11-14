/** Build a self-contained render copy. Source HTML/CSS and assets are never written. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse, serialize, defaultTreeAdapter as tree } from 'parse5';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import { decodeBuffer, mimeFor } from './mime.js';
import { LibraryError, isInside } from './library.js';

const CSP = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline' data:; img-src data: blob:; font-src data:; media-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'";
const HTML_NS = 'http://www.w3.org/1999/xhtml';
const attr = (node, name) => node.attrs?.find(entry => entry.name === name);
const set = (node, name, value) => { const old = attr(node, name); if (old) old.value = value; else node.attrs.push({ name, value }); };

export async function buildPreview(library, id, limits = {}) {
  const doc = await library.getDocument(id);
  if (doc.status !== 'ok') throw new LibraryError('not-found', doc.error || '源文件不可用');
  const locate = relative => library.resolveSitePath([doc.rootId, ...relative.split('/')].map(encodeURIComponent).join('/'));
  const main = await locate(doc.relPath);
  const root = main.rootPath;
  const maxAsset = limits.maxAssetBytes ?? 8 * 1024 * 1024;
  const maxTotal = limits.maxTotalBytes ?? 32 * 1024 * 1024;
  const maxAssets = limits.maxAssets ?? 128;
  let total = 0;
  const warnings = [];
  const cache = new Map();
  const addWarning = (reference, error) => {
    if (warnings.length < 30) warnings.push({ path: String(reference).slice(0, 300), message: String(error.message ?? error) });
  };
  const read = async (file, max = maxAsset) => {
    // Read at most max + 1 bytes even if the source grows during the read.
    const handle = await fs.open(file.absolutePath, 'r');
    try {
      const info = await handle.stat();
      if (info.size > max || total + info.size > maxTotal) throw new Error('资源超过预览大小上限，请在浏览器中打开');
      const buffer = Buffer.alloc(info.size + 1);
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
      if (bytesRead > info.size) throw new Error('文件正在变化，请刷新');
      total += bytesRead;
      return buffer.subarray(0, bytesRead);
    } finally { await handle.close(); }
  };
  const resolve = async (reference, base) => {
    const url = new URL(reference, base);
    if (url.protocol !== 'file:') throw new Error('远程资源默认禁用');
    const target = fileURLToPath(url);
    if (!isInside(root, target)) throw new Error('资源超出所选目录');
    return { file: await locate(path.relative(root, target).split(path.sep).join('/')), url };
  };
  const resource = async (reference, base, asCss = false, stack = []) => {
    if (!reference || reference.startsWith('#') || /^data:/i.test(reference)) return reference;
    try {
      const { file, url } = await resolve(reference, base);
      const key = `${file.absolutePath}:${asCss}`;
      if (stack.includes(key)) throw new Error('循环引用的样式表');
      if (!cache.has(key)) {
        if (cache.size >= maxAssets) throw new Error('资源数量超过预览上限');
        cache.set(key, (async () => {
          const bytes = await read(file);
          const css = asCss ? await rewriteCss(decodeBuffer(bytes).text, url, [...stack, key]) : null;
          return `data:${asCss ? 'text/css;charset=utf-8' : mimeFor(file.name)};base64,${(css === null ? bytes : Buffer.from(css)).toString('base64')}`;
        })());
      }
      return `${await cache.get(key)}${url.hash}`;
    } catch (error) { addWarning(reference, error); return 'data:,'; }
  };
  const rewriteValue = async (value, base, stack) => {
    const parsed = valueParser(value);
    const urls = [];
    parsed.walk(node => { if (node.type === 'function' && node.value.toLowerCase() === 'url') { urls.push(node); return false; } });
    for (const node of urls) {
      const reference = node.nodes.length === 1 && node.nodes[0].type === 'string' ? node.nodes[0].value : valueParser.stringify(node.nodes).trim();
      const replaced = await resource(reference, base, false, stack);
      node.nodes = [{ type: 'string', quote: '"', value: replaced }];
    }
    return parsed.toString();
  };
  const rewriteCss = async (text, base, stack = []) => {
    const css = postcss.parse(text);
    const imports = [];
    css.walkAtRules(/^import$/i, node => imports.push(node));
    for (const node of imports) {
      const parsed = valueParser(node.params);
      const first = parsed.nodes.find(entry => entry.type !== 'space' && entry.type !== 'comment');
      if (!first) continue;
      const reference = first.type === 'string' ? first.value : first.type === 'function' && first.value.toLowerCase() === 'url' ? valueParser.stringify(first.nodes).replace(/^["']|["']$/g, '') : null;
      if (reference !== null) {
        const url = await resource(reference, base, true, stack);
        Object.assign(first, { type: 'string', quote: '"', value: url });
        delete first.nodes;
        node.params = parsed.toString();
      }
    }
    const declarations = [];
    css.walkDecls(node => declarations.push(node));
    for (const node of declarations) node.value = await rewriteValue(node.value, base, stack);
    return css.toString();
  };
  const source = decodeBuffer(await read(main, maxAsset)).text;
  const dom = parse(source, { scriptingEnabled: false });
  const base = pathToFileURL(path.join(root, doc.relPath));
  const nodes = [];
  const walk = node => { nodes.push(node); for (const child of node.childNodes ?? []) walk(child); };
  walk(dom);
  for (const node of nodes) {
    if (!node.tagName) continue;
    if (['base', 'script', 'iframe', 'object', 'embed'].includes(node.tagName) || (node.tagName === 'meta' && /^(refresh|content-security-policy)$/i.test(attr(node, 'http-equiv')?.value ?? ''))) {
      tree.detachNode(node); continue;
    }
    if (node.tagName === 'style') {
      try {
        const text = await rewriteCss((node.childNodes ?? []).map(child => child.value ?? '').join(''), base);
        node.childNodes = []; tree.insertText(node, text);
      } catch (error) { addWarning('inline style', error); }
    }
    const style = attr(node, 'style');
    if (style) style.value = await rewriteValue(style.value, base, []);
    if (node.tagName === 'link') {
      if (/\bstylesheet\b/i.test(attr(node, 'rel')?.value ?? '')) set(node, 'href', await resource(attr(node, 'href')?.value, base, true));
      else tree.detachNode(node);
    }
    if (['img', 'source', 'video', 'audio', 'input', 'track', 'image', 'use'].includes(node.tagName)) {
      for (const name of ['src', 'poster', 'href']) {
        const item = attr(node, name); if (item) item.value = await resource(item.value, base);
      }
      const srcset = attr(node, 'srcset');
      if (srcset && !/^data:/i.test(srcset.value)) {
        srcset.value = (await Promise.all(srcset.value.split(',').map(async entry => {
          const [url, ...descriptor] = entry.trim().split(/\s+/);
          return [await resource(url, base), ...descriptor].join(' ');
        }))).join(', ');
      }
    }
    if (node.tagName === 'a') {
      const href = attr(node, 'href');
      if (href && href.value && !href.value.startsWith('#')) {
        try {
          const url = new URL(href.value, base);
          if (url.protocol === 'file:' && isInside(root, fileURLToPath(url))) set(node, 'data-library-path', path.relative(root, fileURLToPath(url)).split(path.sep).join('/'));
        } catch { /* Invalid links stay inert in the preview. */ }
        set(node, 'data-library-link', href.value); href.value = '#';
      }
    }
  }
  const head = nodes.find(node => node.tagName === 'head');
  const meta = tree.createElement('meta', HTML_NS, [{ name: 'http-equiv', value: 'Content-Security-Policy' }, { name: 'content', value: CSP }]);
  if (head.childNodes.length) tree.insertBefore(head, meta, head.childNodes[0]); else tree.appendChild(head, meta);
  return { id, html: serialize(dom), warnings, bytes: total, assets: cache.size };
}
