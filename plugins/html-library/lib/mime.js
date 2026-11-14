/**
 * HTML 知识库 —— 文件类型、编码与 MIME 判定。
 *
 * 保真读取的底线：**按字节原样返回**文件内容，只补正确的 `Content-Type`。
 * 不做 CSS 重写、不做 HTML 重排、不做 sanitizer（隔离交给 iframe sandbox + CSP）。
 *
 * @module dsh-html-library/mime
 */

/** 扩展名 → MIME。只登记预览需要的类型；未知类型按 application/octet-stream 返回。 */
const MIME_BY_EXT = new Map([
  ['html', 'text/html'],
  ['htm', 'text/html'],
  ['xhtml', 'application/xhtml+xml'],
  ['css', 'text/css'],
  ['js', 'text/javascript'],
  ['mjs', 'text/javascript'],
  ['json', 'application/json'],
  ['map', 'application/json'],
  ['txt', 'text/plain'],
  ['md', 'text/markdown'],
  ['xml', 'application/xml'],
  ['svg', 'image/svg+xml'],
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['gif', 'image/gif'],
  ['webp', 'image/webp'],
  ['avif', 'image/avif'],
  ['ico', 'image/x-icon'],
  ['bmp', 'image/bmp'],
  ['woff', 'font/woff'],
  ['woff2', 'font/woff2'],
  ['ttf', 'font/ttf'],
  ['otf', 'font/otf'],
  ['eot', 'application/vnd.ms-fontobject'],
  ['mp4', 'video/mp4'],
  ['webm', 'video/webm'],
  ['mp3', 'audio/mpeg'],
  ['wav', 'audio/wav'],
  ['pdf', 'application/pdf'],
]);

/** 已知的文本扩展名：这些类型可以安全地补 charset。 */
const TEXTUAL_EXT = new Set([
  'html', 'htm', 'xhtml', 'css', 'js', 'mjs', 'json', 'map', 'txt', 'md', 'xml', 'svg',
]);

/** 是否是要索引的 HTML 文档。 */
export function isHtmlPath(filePath) {
  return /\.(html?|xhtml)$/i.test(filePath);
}

/** 小写扩展名（不含点）；没有扩展名时返回空串。 */
export function extensionOf(filePath) {
  const match = /\.([^./\\]+)$/.exec(filePath);
  return match === null ? '' : match[1].toLowerCase();
}

/** 文件内容的 MIME。 */
export function mimeFor(filePath) {
  return MIME_BY_EXT.get(extensionOf(filePath)) ?? 'application/octet-stream';
}

/** 是否是文本类资源（决定是否补 charset 参数）。 */
export function isTextualPath(filePath) {
  return TEXTUAL_EXT.has(extensionOf(filePath));
}

/**
 * 把页面自报的 charset 归一成 TextDecoder 认识的名字。
 * gb2312 / gbk / gb18030 一律按 gb18030 解（超集，能覆盖三者）。
 */
export function normalizeCharset(raw) {
  const name = String(raw ?? '').trim().toLowerCase().replace(/^["']|["']$/g, '');
  if (name === '') return null;
  if (name === 'gb2312' || name === 'gbk' || name === 'gb18030' || name === 'cp936') return 'gb18030';
  if (name === 'utf8' || name === 'utf-8' || name === 'unicode-1-1-utf-8') return 'utf-8';
  if (name === 'big5' || name === 'big5-hkscs') return 'big5';
  if (name === 'shift_jis' || name === 'sjis' || name === 'x-sjis') return 'shift_jis';
  if (name === 'iso-8859-1' || name === 'latin1' || name === 'latin-1') return 'windows-1252';
  return name;
}

/**
 * 从字节前缀猜文档编码：BOM → `<meta charset>` → `<meta http-equiv>` → utf-8。
 *
 * @param {Buffer|Uint8Array} buffer 文件内容（至少读前 8KB 才够判断）。
 * @returns {string} TextDecoder 可用的编码名。
 */
export function detectCharset(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return 'utf-8';
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return 'utf-16le';
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return 'utf-16be';

  const head = Buffer.from(bytes.subarray(0, 8192)).toString('latin1');
  const direct = /<meta[^>]+charset\s*=\s*["']?\s*([\w.:-]+)/i.exec(head);
  if (direct !== null) {
    const normalized = normalizeCharset(direct[1]);
    if (normalized !== null) return normalized;
  }
  const httpEquiv = /<meta[^>]+content\s*=\s*["'][^"']*charset\s*=\s*([\w.:-]+)/i.exec(head);
  if (httpEquiv !== null) {
    const normalized = normalizeCharset(httpEquiv[1]);
    if (normalized !== null) return normalized;
  }
  return 'utf-8';
}

/**
 * 按检测到的编码解码字节。未知编码退回 utf-8（宽松解码，不抛错）。
 *
 * @param {Buffer|Uint8Array} buffer
 * @returns {{ text: string, charset: string }}
 */
export function decodeBuffer(buffer) {
  const charset = detectCharset(buffer);
  try {
    return { text: new TextDecoder(charset, { fatal: false }).decode(buffer), charset };
  } catch {
    return { text: new TextDecoder('utf-8', { fatal: false }).decode(buffer), charset: 'utf-8' };
  }
}
