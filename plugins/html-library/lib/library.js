/**
 * HTML 知识库 —— 宿主侧核心：目录配置、扫描索引、中文检索、收藏 / 标签 / 阅读记录。
 *
 * 取舍（与设计稿 §5 对齐，但 V1 刻意更轻）：
 *  - 索引常驻内存（标题 / 小标题 / 正文 / 路径），元数据落 `library.json`；
 *    不引入 SQLite / FTS5 原生依赖 —— 中文检索用「归一化 + 子串 + 词项与」，
 *    千级文档的搜索延迟在毫秒量级，且不依赖分词词典。
 *  - 扫描按 `size + mtime` 复用上次结果，只重读变化过的文件；Watcher 用
 *    定时补偿扫描（新增 / 修改 / 删除 / 重启后漏掉的变更一次覆盖）。
 *  - 源 HTML 只读：这里没有任何写用户文件的代码路径。
 *
 * @module dsh-html-library/library
 */

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { decodeBuffer, isHtmlPath, extensionOf } from './mime.js';
import { extractDocument } from './parse.js';

const TRASH = '.dsh-html-trash';
const STATE_VERSION = 1;
const DEFAULT_MAX_DOCUMENTS = 5_000;
const DEFAULT_MAX_FILE_BYTES = 8 * 1024 * 1024;
const DEFAULT_WATCH_INTERVAL_MS = 5_000;
// 单篇入库正文上限：再长的文档也只检索前 8 万字符，避免万篇级索引吃光内存。
const MAX_TEXT_LENGTH = 80_000;
const SEARCH_LIMIT_MAX = 1_000;
const EXCLUDED_NAMES = new Set(['.git', '.svn', '.hg', 'node_modules', '.cache', '__pycache__', '.venv', 'venv']);

/** 带错误码的业务异常：路由层据此决定 HTTP 状态。 */
export class LibraryError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'LibraryError';
    this.code = code;
  }
}

/** 插件数据目录：`$DSH_HOME/dsh-html-library`（与 dsh-todos 的约定一致）。 */
export function resolveDataDir() {
  const home = typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME.trim() !== ''
    ? process.env.DSH_HOME.trim()
    : path.join(os.homedir(), '.dsh');
  return path.join(home, 'dsh-html-library');
}

/** 真实路径是否在目录内（含目录本身）。 */
export function isInside(parent, child) {
  if (child === parent) return true;
  const base = parent.endsWith(path.sep) ? parent : `${parent}${path.sep}`;
  return child.startsWith(base);
}

/** 统一成 `/` 分隔的相对路径，去掉开头的 `./`。 */
function toPosix(relPath) {
  return relPath.split(path.sep).join('/').replace(/^\.\//, '');
}

/** 稳定 id：同一个根 + 同一个相对路径，跨重启不变。 */
function hashId(prefix, seed) {
  return `${prefix}${createHash('sha1').update(seed).digest('hex').slice(0, 16)}`;
}

/** 本地通配符 → 正则（只支持 `*`、`**`、`?`）。 */
function compileGlob(pattern) {
  const escaped = String(pattern)
    .trim()
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/\u0000/g, '.*');
  if (escaped === '') return null;
  return new RegExp(`^${escaped}$`, 'i');
}

/** NFKC + 小写：全角字母、兼容字符与大小写差异都不会漏检。 */
function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLowerCase();
}

/** 查询词项：按空白切分、去重、限长。 */
function termsOf(query) {
  const terms = [];
  for (const raw of normalize(query).split(/\s+/)) {
    if (raw === '') continue;
    if (raw.length > 64) continue;
    if (!terms.includes(raw)) terms.push(raw);
    if (terms.length >= 8) break;
  }
  return terms;
}

function clampNumber(value, min, max, fallback) {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.max(min, Math.min(max, n));
}

/**
 * 创建知识库实例。同步返回；内部状态在第一次调用任何方法时异步载入。
 *
 * @param {object} options
 * @param {string} [options.dir] 数据目录，默认 `resolveDataDir()`。
 * @param {object} [options.config] patch 行 config（roots / exclude / maxDocuments / maxFileBytes）。
 * @param {(message: string) => void} [options.log] 日志回调。
 */
export function createLibrary(options = {}) {
  const config = options.config ?? {};
  const dataDir = options.dir ?? resolveDataDir();
  const stateFile = path.join(dataDir, 'library.json');
  const log = options.log ?? (() => {});
  const maxDocuments = clampNumber(config.maxDocuments, 1, 100_000, DEFAULT_MAX_DOCUMENTS);
  const maxFileBytes = clampNumber(config.maxFileBytes, 1024, 256 * 1024 * 1024, DEFAULT_MAX_FILE_BYTES);
  const excludePatterns = (Array.isArray(config.exclude) ? config.exclude : [])
    .map(compileGlob)
    .filter((pattern) => pattern !== null);

  /** @type {{version:number, roots:Array<{id:string,path:string,addedAt:string}>, favorites:Record<string,string>, tags:Record<string,string[]>, history:Record<string,{lastOpenedAt:number,scrollRatio:number}>}} */
  let state = { version: STATE_VERSION, roots: [], favorites: {}, tags: {}, history: {} };
  /** @type {Map<string, any>} id → 文档记录（含已丢失 / 解析失败的墓碑）。 */
  let documents = new Map();
  let loaded = false;
  let loading = null;
  let saving = null;
  let saveTimer = null;
  let scanning = null;
  let stats = { lastIndexAt: null, durationMs: 0, fileCount: 0, failed: 0, truncated: false, errors: [] };
  /** 上一次索引的内容指纹：没有变化时不要刷新 lastIndexAt，避免客户端无意义地重拉列表。 */
  let lastSignature = null;
  let lastIndexStamp = null;
  let scanQueued = false;
  let editing = null;
  let indexedFolders = [];

  // ---------------------------------------------------------------- 持久化

  function emptyState() {
    return { version: STATE_VERSION, roots: [], favorites: {}, tags: {}, history: {} };
  }

  function sanitizeState(raw) {
    const next = emptyState();
    if (raw === null || typeof raw !== 'object') return next;
    if (Array.isArray(raw.roots)) {
      for (const root of raw.roots) {
        if (root === null || typeof root !== 'object') continue;
        if (typeof root.path !== 'string' || !path.isAbsolute(root.path)) continue;
        const normalizedPath = path.resolve(root.path);
        if (next.roots.some((entry) => entry.path === normalizedPath)) continue;
        next.roots.push({
          id: typeof root.id === 'string' && root.id !== '' ? root.id : hashId('r', normalizedPath),
          path: normalizedPath,
          addedAt: typeof root.addedAt === 'string' ? root.addedAt : new Date().toISOString(),
        });
      }
    }
    for (const key of ['favorites', 'tags', 'history']) {
      if (raw[key] !== null && typeof raw[key] === 'object' && !Array.isArray(raw[key])) {
        next[key] = raw[key];
      }
    }
    return next;
  }

  async function loadState() {
    if (loaded) return;
    try {
      const text = await fs.readFile(stateFile, 'utf8');
      state = sanitizeState(JSON.parse(text));
    } catch (error) {
      if (error?.code !== 'ENOENT') log(`读取数据文件失败，按空库启动：${String(error?.message ?? error)}`);
      state = emptyState();
      // 首次运行：把 patch 里配置的初始目录作为种子（之后以界面管理为准）。
      const seeds = Array.isArray(config.roots) ? config.roots : [];
      for (const seed of seeds) {
        if (typeof seed !== 'string' || seed.trim() === '') continue;
        const candidate = expandHomePath(seed.trim());
        if (!path.isAbsolute(candidate)) continue;
        try {
          const real = await fs.realpath(candidate);
          const info = await fs.stat(real);
          if (!info.isDirectory()) continue;
          if (state.roots.some((entry) => entry.path === real)) continue;
          state.roots.push({ id: hashId('r', real), path: real, addedAt: new Date().toISOString() });
        } catch {
          log(`初始目录不可用，已跳过：${candidate}`);
        }
      }
      if (state.roots.length > 0) await saveNow();
    }
    loaded = true;
  }

  function ensureLoaded() {
    if (loaded) return Promise.resolve();
    if (loading === null) loading = loadState();
    return loading;
  }

  function scheduleSave() {
    if (saveTimer !== null) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      saveNow().catch((error) => log(`保存数据失败：${String(error?.message ?? error)}`));
    }, 150);
    saveTimer.unref?.();
  }

  async function saveNow() {
    if (saveTimer !== null) { clearTimeout(saveTimer); saveTimer = null; }
    if (saving !== null) { await saving; return saveNow(); }
    const snapshot = JSON.stringify(
      {
        version: STATE_VERSION,
        roots: state.roots,
        favorites: state.favorites,
        tags: state.tags,
        history: state.history,
      },
      null,
      2,
    );
    saving = (async () => {
      await fs.mkdir(dataDir, { recursive: true });
      const temp = `${stateFile}.${process.pid}.tmp`;
      await fs.writeFile(temp, snapshot, 'utf8');
      await fs.rename(temp, stateFile);
    })().finally(() => {
      saving = null;
    });
    return saving;
  }

  // ---------------------------------------------------------------- 目录

  function expandHomePath(rawPath) {
    if (rawPath === '~') return os.homedir();
    if (rawPath.startsWith('~/')) return path.join(os.homedir(), rawPath.slice(2));
    return rawPath;
  }

  function rootById(rootId) {
    return state.roots.find((root) => root.id === rootId);
  }

  async function addRoot(rawPath) {
    await ensureLoaded();
    const requested = expandHomePath(String(rawPath ?? '').trim());
    if (requested === '' || !path.isAbsolute(requested)) {
      throw new LibraryError('invalid-path', '请填写绝对路径，例如 /Users/you/Documents/html');
    }
    let real;
    try {
      real = await fs.realpath(requested);
    } catch {
      throw new LibraryError('not-found', `目录不存在：${requested}`);
    }
    const info = await fs.stat(real);
    if (!info.isDirectory()) throw new LibraryError('not-directory', `不是目录：${requested}`);

    if (state.roots.some((root) => root.path === real)) {
      throw new LibraryError('duplicate-root', '这个目录已经在知识库里了');
    }
    for (const root of state.roots) {
      if (isInside(root.path, real) || isInside(real, root.path)) {
        throw new LibraryError('nested-root', `与已有目录互相包含：${root.path}`);
      }
    }

    const root = { id: hashId('r', real), path: real, addedAt: new Date().toISOString() };
    state.roots.push(root);
    scheduleSave();
    return { ...root, label: path.basename(real) };
  }

  async function removeRoot(rootId) {
    await ensureLoaded();
    const index = state.roots.findIndex((root) => root.id === rootId);
    if (index === -1) throw new LibraryError('not-found', '没有这个知识目录');
    const [removed] = state.roots.splice(index, 1);
    // 只删索引与附属元数据，**不碰磁盘文件**。
    for (const [id, doc] of documents) {
      if (doc.rootId === removed.id) {
        documents.delete(id);
        delete state.favorites[id];
        delete state.tags[id];
        delete state.history[id];
      }
    }
    scheduleSave();
    return { id: removed.id, path: removed.path };
  }

  // ---------------------------------------------------------------- 扫描

  function shouldSkip(relPath, name) {
    if (name === '' || name.startsWith('._') || name.startsWith('~$')) return true;
    if (name.toLowerCase() === TRASH || EXCLUDED_NAMES.has(name.toLowerCase())) return true;
    if (excludePatterns.length === 0) return false;
    const probes = [relPath, `/${relPath}`, name];
    return excludePatterns.some((pattern) => probes.some((probe) => pattern.test(probe)));
  }

  async function walkFiles(root, realRoot, folders) {
    /** @type {Array<{abs:string, rel:string}>} */
    const found = [];
    const visited = new Set();
    const stack = [{ dir: realRoot, rel: '' }];
    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) break;
      if (visited.has(current.dir)) continue;
      visited.add(current.dir);
      let entries;
      try {
        entries = await fs.readdir(current.dir, { withFileTypes: true });
      } catch (error) {
        stats.errors.push({ rootId: root.id, path: current.rel === '' ? realRoot : current.rel, message: `无法读取目录：${String(error?.message ?? error)}` });
        continue;
      }
      for (const entry of entries) {
        const rel = current.rel === '' ? entry.name : `${current.rel}/${entry.name}`;
        if (shouldSkip(rel, entry.name)) continue;
        const abs = path.join(current.dir, entry.name);
        if (entry.isDirectory()) {
          folders.push({ rootId: root.id, relDir: rel });
          stack.push({ dir: abs, rel });
          continue;
        }
        if (entry.isSymbolicLink()) {
          try {
            const real = await fs.realpath(abs);
            if (!isInside(realRoot, real) || isInside(path.join(realRoot, TRASH), real)) continue;
            const info = await fs.stat(real);
            if (info.isDirectory()) continue; // 不跟随目录链接，避免环
            if (!info.isFile() || !isHtmlPath(entry.name)) continue;
            found.push({ abs: real, rel });
          } catch {
            /* 断链跳过 */
          }
          continue;
        }
        if (entry.isFile() && isHtmlPath(entry.name)) found.push({ abs, rel });
      }
    }
    return found;
  }

  async function readDocument(root, file, previous) {
    const id = hashId('d', `${root.id}\u0000${file.rel}`);
    let info;
    try {
      info = await fs.stat(file.abs);
    } catch (error) {
      return {
        id, rootId: root.id, relPath: file.rel, folder: folderOf(file.rel), name: path.basename(file.rel),
        title: path.basename(file.rel), excerpt: '', headings: [], text: '', tags: [], favorite: false,
        mtime: 0, size: 0, hash: '', status: 'failed', error: `读取失败：${String(error?.message ?? error)}`,
      };
    }
    if (previous !== undefined && previous.status === 'ok' && previous.size === info.size && previous.mtime === info.mtimeMs) {
      return previous;
    }
    if (info.size > maxFileBytes) {
      return {
        id, rootId: root.id, relPath: file.rel, folder: folderOf(file.rel), name: path.basename(file.rel),
        title: path.basename(file.rel), excerpt: '', headings: [], text: '', tags: [], favorite: false,
        mtime: info.mtimeMs, size: info.size, hash: '', status: 'failed',
        error: `文件过大（${Math.round(info.size / 1024)} KB），超过 ${Math.round(maxFileBytes / 1024)} KB 上限`,
      };
    }
    let buffer;
    try {
      buffer = await fs.readFile(file.abs);
    } catch (error) {
      return {
        id, rootId: root.id, relPath: file.rel, folder: folderOf(file.rel), name: path.basename(file.rel),
        title: path.basename(file.rel), excerpt: '', headings: [], text: '', tags: [], favorite: false,
        mtime: info.mtimeMs, size: info.size, hash: '', status: 'failed',
        error: `读取失败：${String(error?.message ?? error)}`,
      };
    }
    const { text: html } = decodeBuffer(buffer);
    const extracted = extractDocument(html, {
      fallbackTitle: path.basename(file.rel, path.extname(file.rel)),
      maxTextLength: MAX_TEXT_LENGTH,
    });
    return {
      id,
      rootId: root.id,
      relPath: file.rel,
      folder: folderOf(file.rel),
      name: path.basename(file.rel),
      title: extracted.title,
      excerpt: extracted.excerpt,
      headings: extracted.headings,
      text: extracted.text,
      tags: [],
      favorite: false,
      mtime: info.mtimeMs,
      size: info.size,
      hash: createHash('sha1').update(buffer).digest('hex'),
      status: 'ok',
      error: null,
    };
  }

  function folderOf(relPath) {
    const index = relPath.lastIndexOf('/');
    return index === -1 ? '' : relPath.slice(0, index);
  }

  async function runScan() {
    const startedAt = Date.now();
    stats = { lastIndexAt: null, durationMs: 0, fileCount: 0, failed: 0, truncated: false, errors: [] };
    const next = new Map();
    const previous = documents;
    const folders = [];
    let truncated = false;

    for (const root of state.roots) {
      let realRoot = root.path;
      try {
        realRoot = await fs.realpath(root.path);
      } catch {
        stats.errors.push({ rootId: root.id, path: root.path, message: '目录不存在或不可访问' });
      }
      let files = [];
      try {
        files = await walkFiles(root, realRoot, folders);
      } catch (error) {
        stats.errors.push({ rootId: root.id, path: root.path, message: String(error?.message ?? error) });
      }
      files.sort((left, right) => left.rel.localeCompare(right.rel));
      for (const file of files) {
        if (next.size >= maxDocuments) {
          truncated = true;
          break;
        }
        const id = hashId('d', `${root.id}\u0000${file.rel}`);
        let doc;
        try {
          doc = await readDocument(root, file, previous.get(id));
        } catch (error) {
          doc = {
            id, rootId: root.id, relPath: file.rel, folder: folderOf(file.rel), name: path.basename(file.rel),
            title: path.basename(file.rel), excerpt: '', headings: [], text: '', tags: [], favorite: false,
            mtime: 0, size: 0, hash: '', status: 'failed', error: String(error?.message ?? error),
          };
        }
        next.set(id, decorate(doc));
      }
      if (truncated) break;
    }

    // 保留丢失文档的墓碑：历史标签 / 收藏不因一次删除就消失。
    for (const [id, doc] of previous) {
      if (next.has(id)) continue;
      if (rootById(doc.rootId) === undefined) continue;
      next.set(id, decorate({ ...doc, status: 'missing', error: '源文件已不在原路径' }));
    }

    indexedFolders = folders;
    documents = next;
    stats.fileCount = [...next.values()].filter((doc) => doc.status !== 'missing').length;
    stats.failed = stats.errors.length;
    stats.truncated = truncated;
    stats.durationMs = Date.now() - startedAt;

    // 内容指纹：id + mtime + size + status（外加错误数）。Watcher 每 5s 扫一次，
    // 没变化就不动 lastIndexAt —— 客户端只在它变化时重拉列表。
    const fingerprint = createHash('sha1');
    for (const doc of [...next.values()].sort((left, right) => left.id.localeCompare(right.id))) {
      fingerprint.update(`${doc.id}:${doc.mtime}:${doc.size}:${doc.status};`);
    }
    fingerprint.update(`errors:${stats.errors.length}`);
    const signature = fingerprint.digest('hex');
    if (signature === lastSignature && lastIndexStamp !== null) {
      stats.lastIndexAt = lastIndexStamp;
    } else {
      lastSignature = signature;
      lastIndexStamp = new Date().toISOString();
      stats.lastIndexAt = lastIndexStamp;
    }
    return stats;
  }

  function decorate(doc) {
    const tags = state.tags[doc.id];
    const history = state.history[doc.id];
    delete doc._hay;
    return {
      ...doc,
      tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
      favorite: Object.prototype.hasOwnProperty.call(state.favorites, doc.id),
      lastOpenedAt: history?.lastOpenedAt ?? null,
    };
  }

  function scan() {
    if (editing !== null) return editing.then(() => scan());
    if (scanning !== null) {
      // 已有扫描在跑：排队一次，跑完后立刻再来一轮，
      // 这样「扫描过程中新增目录」不会被这一轮漏掉。
      scanQueued = true;
      return scanning;
    }
    scanning = (async () => {
      await ensureLoaded();
      return runScan();
    })().finally(() => {
      scanning = null;
      if (scanQueued) {
        scanQueued = false;
        setImmediate(() => {
          scan().catch((error) => log(`排队的扫描失败：${String(error?.message ?? error)}`));
        });
      }
    });
    return scanning;
  }

  // ---------------------------------------------------------------- 视图与检索

  function summaryOf(doc) {
    return {
      id: doc.id,
      rootId: doc.rootId,
      rootLabel: path.basename(rootById(doc.rootId)?.path ?? ''),
      relPath: doc.relPath,
      absolutePath: path.join(rootById(doc.rootId)?.path ?? '', doc.relPath),
      folder: doc.folder,
      name: doc.name,
      title: doc.title,
      excerpt: doc.excerpt,
      tags: doc.tags,
      favorite: doc.favorite,
      mtime: doc.mtime,
      size: doc.size,
      status: doc.status,
      error: doc.error ?? null,
      lastOpenedAt: doc.lastOpenedAt ?? null,
    };
  }

  function haystackOf(doc) {
    if (doc._hay === undefined) {
      doc._hay = {
        title: normalize(doc.title),
        headings: normalize(doc.headings?.join('\n') ?? ''),
        text: normalize(doc.text ?? ''),
        path: normalize(doc.relPath),
        tags: normalize(doc.tags.join(' ')),
      };
    }
    return doc._hay;
  }

  function scoreOf(doc, terms) {
    if (terms.length === 0) return 0;
    const hay = haystackOf(doc);
    let score = 0;
    for (const term of terms) {
      if (hay.title.includes(term)) score += 120;
      else if (hay.headings.includes(term)) score += 45;
      else if (hay.tags.includes(term)) score += 35;
      else if (hay.text.includes(term)) score += 10;
      else if (hay.path.includes(term)) score += 6;
      else return null; // 所有词项都要命中（AND 语义）
    }
    return score;
  }

  function snippetOf(doc, terms) {
    const text = doc.text ?? '';
    if (terms.length === 0 || text === '') return doc.excerpt;
    const lower = text.toLowerCase();
    let at = -1;
    for (const term of terms) {
      const index = lower.indexOf(term);
      if (index !== -1 && (at === -1 || index < at)) at = index;
    }
    if (at === -1) return doc.excerpt;
    const start = Math.max(0, at - 46);
    const end = Math.min(text.length, at + 150);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < text.length ? '…' : '';
    return `${prefix}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${suffix}`;
  }

  function matchesView(doc, view) {
    const mode = view.mode ?? 'all';
    if (mode === 'favorites') return doc.favorite;
    if (mode === 'recent') return doc.lastOpenedAt !== null;
    if (mode === 'missing') return doc.status === 'missing';
    if (mode === 'root') return doc.rootId === view.rootId;
    if (mode === 'folder') {
      if (view.rootId !== undefined && doc.rootId !== view.rootId) return false;
      if (view.folder === undefined || view.folder === '') return true;
      return doc.folder === view.folder || doc.folder.startsWith(`${view.folder}/`);
    }
    if (mode === 'tag') return doc.tags.includes(view.tag);
    return true;
  }

  function sortDocuments(items, mode, scored) {
    const list = items.slice();
    if (mode === 'title') {
      list.sort((left, right) => left.summary.title.localeCompare(right.summary.title, 'zh-Hans-CN'));
    } else if (mode === 'mtime') {
      list.sort((left, right) => right.summary.mtime - left.summary.mtime);
    } else if (mode === 'opened') {
      list.sort((left, right) => (right.summary.lastOpenedAt ?? 0) - (left.summary.lastOpenedAt ?? 0));
    } else if (scored) {
      list.sort((left, right) => right.score - left.score || right.summary.mtime - left.summary.mtime);
    } else {
      list.sort((left, right) => right.summary.mtime - left.summary.mtime);
    }
    return list;
  }

  /**
   * 列表 / 搜索。所有筛选在宿主完成，返回的摘要已是可直接渲染的原文片段。
   *
   * @param {object} [params]
   * @param {string} [params.query] 关键词；空白分隔视为 AND。
   * @param {string} [params.mode] all | recent | favorites | missing | root | folder | tag
   * @param {string} [params.rootId]
   * @param {string} [params.folder]
   * @param {string} [params.tag]
   * @param {string} [params.sort] relevance | mtime | title | opened
   * @param {number} [params.limit]
   * @param {number} [params.offset]
   */
  async function listDocuments(params = {}) {
    await ensureLoaded();
    const terms = termsOf(params.query ?? '');
    const view = {
      mode: typeof params.mode === 'string' ? params.mode : 'all',
      rootId: typeof params.rootId === 'string' ? params.rootId : undefined,
      folder: typeof params.folder === 'string' ? params.folder : undefined,
      tag: typeof params.tag === 'string' ? params.tag : undefined,
    };
    const sort = typeof params.sort === 'string' ? params.sort : 'relevance';
    const limit = clampNumber(params.limit, 1, SEARCH_LIMIT_MAX, 300);
    const offset = clampNumber(params.offset, 0, 1_000_000, 0);

    const scored = [];
    for (const doc of documents.values()) {
      if (!matchesView(doc, view)) continue;
      const score = scoreOf(doc, terms);
      if (score === null) continue;
      scored.push({ doc, score, summary: summaryOf(doc) });
    }
    const ordered = sortDocuments(scored, sort, terms.length > 0);
    const total = ordered.length;
    const page = ordered.slice(offset, offset + limit).map((entry) => ({
      ...entry.summary,
      snippet: snippetOf(entry.doc, terms),
    }));
    return { items: page, total, terms, query: String(params.query ?? '') };
  }

  function folderFacets() {
    /** @type {Map<string, {rootId:string, rootLabel:string, relDir:string, label:string, depth:number, count:number}>} */
    const folders = new Map();
    for (const doc of documents.values()) {
      if (doc.status !== 'ok') continue;
      const root = rootById(doc.rootId);
      const rootLabel = root === undefined ? '' : path.basename(root.path);
      // 逐级累加：一行「nested」应当包含 nested/deep 里的文档，点击时也是子树语义。
      const chain = [''];
      if (doc.folder !== '') {
        const parts = doc.folder.split('/');
        for (let depth = 1; depth <= parts.length; depth += 1) {
          chain.push(parts.slice(0, depth).join('/'));
        }
      }
      for (const relDir of chain) {
        const key = `${doc.rootId}\u0000${relDir}`;
        const existing = folders.get(key);
        if (existing !== undefined) {
          existing.count += 1;
          continue;
        }
        folders.set(key, {
          rootId: doc.rootId,
          rootLabel,
          relDir,
          label: relDir === '' ? rootLabel : relDir.split('/').pop() ?? relDir,
          depth: relDir === '' ? 0 : relDir.split('/').length,
          count: 1,
        });
      }
    }
    for (const entry of indexedFolders) {
      const root = rootById(entry.rootId);
      const key = `${entry.rootId}\u0000${entry.relDir}`;
      if (root && !folders.has(key)) folders.set(key, { ...entry, rootLabel: path.basename(root.path),
        label: path.posix.basename(entry.relDir), depth: entry.relDir.split('/').length, count: 0 });
    }
    return [...folders.values()].sort((left, right) => {
      const byRoot = left.rootLabel.localeCompare(right.rootLabel, 'zh-Hans-CN');
      if (byRoot !== 0) return byRoot;
      return left.relDir.localeCompare(right.relDir, 'zh-Hans-CN');
    });
  }

  function tagFacets() {
    const counts = new Map();
    for (const doc of documents.values()) {
      for (const tag of doc.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, 'zh-Hans-CN'));
  }

  /** 首屏快照：目录、计数、索引状态、分类与标签。 */
  async function snapshot() {
    await ensureLoaded();
    const roots = state.roots.map((root) => {
      let count = 0;
      let missing = 0;
      for (const doc of documents.values()) {
        if (doc.rootId !== root.id) continue;
        if (doc.status === 'ok') count += 1;
        else if (doc.status === 'missing') missing += 1;
      }
      return { id: root.id, path: root.path, label: path.basename(root.path), addedAt: root.addedAt, count, missing };
    });
    let okCount = 0;
    let missingCount = 0;
    let favoriteCount = 0;
    for (const doc of documents.values()) {
      if (doc.status === 'ok') okCount += 1;
      else if (doc.status === 'missing') missingCount += 1;
      if (doc.favorite) favoriteCount += 1;
    }
    const tags = tagFacets();
    return {
      apiVersion: 2,
      roots,
      counts: { documents: okCount, missing: missingCount, favorites: favoriteCount, tags: tags.length },
      index: {
        lastIndexAt: stats.lastIndexAt,
        durationMs: stats.durationMs,
        fileCount: stats.fileCount,
        failed: stats.failed,
        truncated: stats.truncated,
        scanning: scanning !== null,
        errors: stats.errors.slice(0, 10),
      },
      treeDocuments: [...documents.values()].map(({ id, rootId, folder, name, title, relPath, status }) =>
        ({ id, rootId, folder, name, title, relPath, status })),
      facets: { folders: folderFacets(), tags },
    };
  }

  // ---------------------------------------------------------------- 元数据

  async function setFavorite(fileId, enabled) {
    await ensureLoaded();
    const doc = documents.get(fileId);
    if (doc === undefined) throw new LibraryError('not-found', '没有这篇文档');
    if (enabled) state.favorites[fileId] = new Date().toISOString();
    else delete state.favorites[fileId];
    doc.favorite = enabled;
    scheduleSave();
    return { id: fileId, favorite: enabled };
  }

  async function setTags(fileId, rawTags) {
    await ensureLoaded();
    const doc = documents.get(fileId);
    if (doc === undefined) throw new LibraryError('not-found', '没有这篇文档');
    const tags = [];
    for (const raw of Array.isArray(rawTags) ? rawTags : []) {
      if (typeof raw !== 'string') continue;
      const value = raw.trim().replace(/\s+/g, ' ').slice(0, 40);
      if (value === '') continue;
      if (!tags.includes(value)) tags.push(value);
      if (tags.length >= 12) break;
    }
    if (tags.length === 0) delete state.tags[fileId];
    else state.tags[fileId] = tags;
    doc.tags = tags;
    delete doc._hay;
    scheduleSave();
    return { id: fileId, tags };
  }

  async function recordRead(fileId, scrollRatio = 0) {
    await ensureLoaded();
    const doc = documents.get(fileId);
    if (doc === undefined) throw new LibraryError('not-found', '没有这篇文档');
    state.history[fileId] = {
      lastOpenedAt: Date.now(),
      scrollRatio: clampNumber(scrollRatio, 0, 1, 0),
    };
    doc.lastOpenedAt = state.history[fileId].lastOpenedAt;
    scheduleSave();
    return { id: fileId };
  }

  async function getDocument(fileId) {
    await ensureLoaded();
    const doc = documents.get(fileId);
    if (doc === undefined) throw new LibraryError('not-found', '没有这篇文档');
    return summaryOf(doc);
  }

  function withFileEdit(operation) {
    if (editing !== null) throw new LibraryError('busy', '已有文件操作正在进行，请稍后重试');
    editing = (async () => {
      await ensureLoaded();
      if (scanning !== null) await scanning;
      return operation();
    })().finally(() => { editing = null; });
    return editing;
  }

  /** Rename one HTML file within its folder; never replace an existing target. */
  function renameDocument(fileId, rawName) {
    return withFileEdit(async () => {
      const doc = documents.get(fileId);
      if (!doc || doc.status !== 'ok') throw new LibraryError('not-found', '源文件不可用');
      const name = String(rawName ?? '').trim();
      if (!name || name === '.' || name === '..' || /[\\/\x00-\x1f]/.test(name) || Buffer.byteLength(name) > 255 || !isHtmlPath(name)) {
        throw new LibraryError('bad-request', '请输入有效的 HTML 文件名，不要包含路径');
      }
      if (name === doc.name) return summaryOf(doc);
      const root = rootById(doc.rootId);
      const source = await resolveSitePath([doc.rootId, ...doc.relPath.split('/')].map(encodeURIComponent).join('/'));
      const lexical = path.join(root.path, doc.relPath);
      if ((await fs.lstat(lexical)).isSymbolicLink()) throw new LibraryError('forbidden', '请对实际文件重命名，不支持重命名软链接');
      const relPath = doc.folder ? `${doc.folder}/${name}` : name;
      const target = path.join(path.dirname(source.absolutePath), name);
      try { await fs.link(source.absolutePath, target); }
      catch (error) {
        if (error.code === 'EEXIST') throw new LibraryError('duplicate-name', '同名文件已存在，未覆盖任何文件');
        throw error;
      }
      try { await fs.unlink(source.absolutePath); }
      catch (error) { await fs.unlink(target); throw error; }
      const id = hashId('d', `${doc.rootId}\u0000${relPath}`);
      for (const key of ['favorites', 'tags', 'history']) {
        if (key === 'tags') {
          const tags = [...new Set([...(state.tags[id] ?? []), ...(state.tags[fileId] ?? [])])];
          if (tags.length) state.tags[id] = tags;
        } else if (state[key][fileId] !== undefined) state[key][id] = state[key][fileId];
        delete state[key][fileId];
      }
      documents.delete(fileId);
      documents.set(id, decorate({ ...doc, id, relPath, name }));
      await runScan();
      await saveNow();
      return summaryOf(documents.get(id));
    });
  }

  function validName(value) {
    return typeof value === 'string' && value.length > 0 && value !== '.' && value !== '..' &&
      !/[<>:"/\\|?*\x00-\x1f]/.test(value) && !/[ .]$/.test(value) &&
      !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(value) && Buffer.byteLength(value) <= 255;
  }

  async function checkedFolder(rootId, folder) {
    const root = rootById(rootId);
    if (!root || typeof folder !== 'string') throw new LibraryError('bad-request', '无效的知识目录');
    let current = root.path;
    const parts = folder === '' ? [] : folder.split('/');
    if (parts.some((part, idx) => !validName(part) || shouldSkip(parts.slice(0, idx + 1).join('/'), part))) {
      throw new LibraryError('forbidden', '目录不可操作');
    }
    for (const part of ['', ...parts]) {
      current = path.join(current, part);
      const stat = await fs.lstat(current);
      if (!stat.isDirectory() || stat.isSymbolicLink() || await fs.realpath(current) !== current) {
        throw new LibraryError('forbidden', '请选择知识库内的实际目录');
      }
    }
    return current;
  }

  function editEntry({ action, kind, rootId, folder, name }) {
    return withFileEdit(async () => {
      if (!['file', 'folder'].includes(kind) || !['create', 'delete'].includes(action) ||
          !validName(name) || (kind === 'file' && !isHtmlPath(name))) {
        throw new LibraryError('bad-request', '请输入有效的目录名或 HTML 文件名');
      }
      const parent = await checkedFolder(rootId, folder);
      const relPath = folder ? folder + '/' + name : name;
      if (shouldSkip(relPath, name)) throw new LibraryError('forbidden', '此名称已被知识库排除');
      const target = path.join(parent, name);
      if (action === 'create') {
        try {
          if (kind === 'folder') await fs.mkdir(target);
          else {
            const title = name.replace(/\.[^.]+$/, '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
            await fs.writeFile(target, `<!doctype html>\n<html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1></body></html>\n`, { flag: 'wx' });
          }
        } catch (error) {
          if (error.code === 'EEXIST') throw new LibraryError('duplicate-name', '同名文件或目录已存在');
          throw error;
        }
      } else {
        const indexed = kind === 'folder'
          ? indexedFolders.some(entry => entry.rootId === rootId && entry.relDir === relPath)
          : documents.has(hashId('d', `${rootId}\u0000${relPath}`));
        if (!indexed) throw new LibraryError('not-found', '请刷新后选择已索引的文件或目录');
        if (kind === 'folder' && state.roots.some(root => isInside(target, root.path))) {
          throw new LibraryError('forbidden', '目录内含有已配置的知识根目录');
        }
        const stat = await fs.lstat(target);
        if (stat.isSymbolicLink() || (kind === 'file' ? !stat.isFile() : !stat.isDirectory())) {
          throw new LibraryError('forbidden', '文件类型已改变，请刷新');
        }
        const trash = path.join(rootById(rootId).path, TRASH);
        await fs.mkdir(trash, { recursive: true });
        if (await fs.realpath(trash) !== trash || !(await fs.lstat(trash)).isDirectory()) {
          throw new LibraryError('forbidden', '回收目录不可用');
        }
        const batch = await fs.mkdtemp(path.join(trash, 'removed-'));
        const destination = path.join(batch, relPath);
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.rename(target, destination);
        for (const [id, doc] of documents) {
          if (doc.rootId !== rootId || (doc.relPath !== relPath && !doc.relPath.startsWith(relPath + '/'))) continue;
          documents.delete(id);
          delete state.favorites[id];
          delete state.tags[id];
          delete state.history[id];
        }
        await saveNow();
      }
      await runScan();
      return { rootId, relPath };
    });
  }

  // ---------------------------------------------------------------- 静态资源

  function decodeSegment(raw) {
    try {
      return decodeURIComponent(raw);
    } catch {
      throw new LibraryError('bad-request', '路径编码不合法');
    }
  }

  /**
   * 把 `/site/<rootId>/<相对路径>` 解析成磁盘文件，并完成越权校验。
   * 拒绝 `..`、编码斜杠、软链接逃逸、未配置根目录。
   */
  async function resolveSitePath(remainder) {
    await ensureLoaded();
    const raw = String(remainder ?? '').replace(/^\/+/, '');
    if (raw === '') throw new LibraryError('bad-request', '缺少文件路径');
    const parts = raw.split('/');
    if (parts.length < 2) throw new LibraryError('bad-request', '缺少文件名');
    const root = rootById(decodeSegment(parts[0]));
    if (root === undefined) throw new LibraryError('forbidden', '未配置的知识目录');
    const segments = parts.slice(1).map(decodeSegment);
    for (const segment of segments) {
      if (segment.toLowerCase() === TRASH || segment === '' || segment === '.' || segment === '..' || segment.includes('/') || segment.includes('\\') || segment.includes('\0')) {
        throw new LibraryError('forbidden', '路径不合法');
      }
    }
    const lexical = path.resolve(root.path, ...segments);
    if (!isInside(root.path, lexical)) throw new LibraryError('forbidden', '路径越界');
    let realRoot;
    let real;
    try {
      realRoot = await fs.realpath(root.path);
      real = await fs.realpath(lexical);
    } catch {
      throw new LibraryError('not-found', '文件不存在');
    }
    if (!isInside(realRoot, real) || isInside(path.join(realRoot, TRASH), real)) throw new LibraryError('forbidden', '路径越界（软链接）');
    let info;
    try {
      info = await fs.stat(real);
    } catch {
      throw new LibraryError('not-found', '文件不存在');
    }
    if (!info.isFile()) throw new LibraryError('not-found', '不是文件');
    return {
      absolutePath: real,
      rootPath: realRoot,
      rootId: root.id,
      relPath: segments.join('/'),
      name: segments[segments.length - 1],
      size: info.size,
      mtimeMs: info.mtimeMs,
    };
  }

  // ---------------------------------------------------------------- Watcher

  /** 定时补偿扫描：新增 / 修改 / 删除 / 重启期间的变更都会在下一次扫描里收敛。 */
  function startWatching(intervalMs = DEFAULT_WATCH_INTERVAL_MS) {
    const period = clampNumber(intervalMs, 1_000, 120_000, DEFAULT_WATCH_INTERVAL_MS);
    const timer = setInterval(() => {
      if (state.roots.length === 0) return;
      if (scanning !== null) return;
      scan().catch((error) => log(`自动扫描失败：${String(error?.message ?? error)}`));
    }, period);
    timer.unref?.();
    return () => clearInterval(timer);
  }

  return {
    dataDir,
    stateFile,
    ensureLoaded,
    scan,
    startWatching,
    addRoot,
    removeRoot,
    listDocuments,
    snapshot,
    setFavorite,
    setTags,
    recordRead,
    getDocument,
    renameDocument,
    editEntry,
    resolveSitePath,
    flush: saveNow,
    isScanning: () => scanning !== null,
    extensionOf,
  };
}
