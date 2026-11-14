/**
 * HTML 知识库 —— 从原始 HTML 中抽取可检索文本（只读，绝不改写源文件）。
 *
 * 抽取目标：标题、各级小标题、正文、摘要。跳过 script/style/SVG/模板等
 * 不承载知识文本的节点，避免把图表坐标或样式规则塞进索引。
 *
 * 这里不做 DOM 解析：预览始终用原始文件，抽取只是"检索用的影子文本"，
 * 因此用正则足够，且对残缺 HTML 更宽容。
 *
 * @module dsh-html-library/parse
 */

const NAMED_ENTITIES = new Map([
  ['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"],
  ['nbsp', '\u00a0'], ['ensp', '\u2002'], ['emsp', '\u2003'], ['thinsp', '\u2009'],
  ['mdash', '\u2014'], ['ndash', '\u2013'], ['hellip', '\u2026'], ['middot', '\u00b7'],
  ['ldquo', '\u201c'], ['rdquo', '\u201d'], ['lsquo', '\u2018'], ['rsquo', '\u2019'],
  ['laquo', '\u00ab'], ['raquo', '\u00bb'], ['copy', '\u00a9'], ['reg', '\u00ae'],
  ['trade', '\u2122'], ['times', '\u00d7'], ['divide', '\u00f7'], ['plusmn', '\u00b1'],
  ['deg', '\u00b0'], ['sect', '\u00a7'], ['para', '\u00b6'], ['bull', '\u2022'],
  ['larr', '\u2190'], ['rarr', '\u2192'], ['uarr', '\u2191'], ['darr', '\u2193'],
  ['harr', '\u2194'], ['le', '\u2264'], ['ge', '\u2265'], ['ne', '\u2260'],
  ['infin', '\u221e'], ['sum', '\u2211'], ['radic', '\u221a'], ['check', '\u2713'],
]);

/** 把命名实体与数字实体还原成字符。 */
export function decodeEntities(input) {
  const text = String(input ?? '');
  if (!text.includes('&')) return text;
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]{1,31});/g, (whole, body) => {
    if (body.startsWith('#')) {
      const hex = body[1] === 'x' || body[1] === 'X';
      const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return whole;
      try {
        return String.fromCodePoint(code);
      } catch {
        return whole;
      }
    }
    return NAMED_ENTITIES.get(body.toLowerCase()) ?? whole;
  });
}

/** 去掉标签，仅留文本（块级边界折成空格，避免单词粘连）。 */
export function stripTags(html) {
  return String(html ?? '').replace(/<[^>]*>/g, ' ');
}

/** 折叠空白：所有连续空白（含换行）压成一个空格，并 trim。 */
export function collapseWhitespace(text) {
  return String(text ?? '').replace(/[\s\u00a0\u200b\ufeff]+/g, ' ').trim();
}

/** 隐藏节点：hidden 属性、aria-hidden="true"、display:none 的内联样式。整段剔除。 */
function removeHiddenNodes(html) {
  return html.replace(
    /<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*?(?:\bhidden\b|aria-hidden\s*=\s*["']true["']|display\s*:\s*none)[^>]*)>[\s\S]*?<\/\1>/gi,
    ' ',
  );
}

/** 剔除不承载正文的整段节点。 */
function removeNoiseNodes(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<template\b[\s\S]*?<\/template>/gi, ' ')
    .replace(/<canvas\b[\s\S]*?<\/canvas>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, ' ');
}

/** 取第一个匹配元素的文本。 */
function firstTextOf(html, tag) {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(html);
  return match === null ? '' : collapseWhitespace(decodeEntities(stripTags(match[1])));
}

/** 所有 h1–h4 文本，按出现顺序、去重、限长。 */
function collectHeadings(html) {
  const seen = new Set();
  const headings = [];
  const pattern = /<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match = pattern.exec(html);
  while (match !== null) {
    const text = collapseWhitespace(decodeEntities(stripTags(match[2])));
    if (text !== '' && text.length <= 200 && !seen.has(text)) {
      seen.add(text);
      headings.push(text);
      if (headings.length >= 60) break;
    }
    match = pattern.exec(html);
  }
  return headings;
}

/**
 * 正文纯文本：块级标签边界变成换行，其余标签去掉，再折叠空白。
 * 保留换行是为了让摘要更像原文段落，而不是一长串。
 */
function extractBodyText(html) {
  const blocked = html.replace(
    /<\s*(?:br|hr)\s*\/?\s*>|<\s*\/\s*(?:p|div|section|article|li|ul|ol|h[1-6]|tr|td|th|blockquote|pre|figure|figcaption|header|footer|main|aside|nav|table)\s*>/gi,
    '\n',
  );
  const text = decodeEntities(stripTags(blocked));
  return text
    .split('\n')
    .map((line) => collapseWhitespace(line))
    .filter((line) => line !== '')
    .join('\n');
}

/**
 * 从 HTML 源码抽取检索用的元数据。**不修改输入**。
 *
 * @param {string} html 原始 HTML 文本。
 * @param {object} options
 * @param {string} [options.fallbackTitle] 没有 h1/title 时用的名字（通常是文件名）。
 * @param {number} [options.maxTextLength] 正文入库上限，默认 200k 字符。
 * @param {number} [options.excerptLength] 摘要长度，默认 220 字符。
 * @returns {{title:string, headings:string[], text:string, excerpt:string}}
 */
export function extractDocument(html, options = {}) {
  const source = String(html ?? '');
  const maxTextLength = options.maxTextLength ?? 200_000;
  const excerptLength = options.excerptLength ?? 220;

  const documentTitle = firstTextOf(source, 'title');
  const bodyMatch = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(source);
  const body = bodyMatch === null ? source : bodyMatch[1];

  const visible = removeHiddenNodes(removeNoiseNodes(body));
  const headings = collectHeadings(visible);
  const h1 = firstTextOf(visible, 'h1');
  const title = pickTitle([h1, documentTitle, options.fallbackTitle ?? '']);

  const text = extractBodyText(visible).slice(0, maxTextLength);
  const isContent = value => value !== '' && value !== title &&
    !headings.includes(value) && !/^(?:generated by\b|runtime note$|knowledge note(?:\s*[·|]|$))/i.test(value);
  const paragraphs = [...visible.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(match => collapseWhitespace(decodeEntities(stripTags(match[1])))).filter(isContent);
  const lines = text.split('\n').filter(isContent);
  const excerptSource = paragraphs.find(line => line.length >= 12) ?? paragraphs[0] ??
    lines.find(line => line.length >= 12) ?? lines[0] ?? '';

  let description = '';
  for (const meta of source.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...meta[0].matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
      .map((match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? match[4]]));
    if (attrs.name?.toLowerCase() === 'description') {
      description = collapseWhitespace(decodeEntities(attrs.content ?? ''));
      if (description && isContent(description)) break;
      description = '';
    }
  }
  const excerpt = (description || excerptSource).slice(0, excerptLength).trim();

  return { title, headings, text, excerpt };
}

/** 标题优先级：h1 > <title> > 文件名。过短的 h1（如「首页」）仍优先，遵循用户目录的实际写法。 */
function pickTitle(candidates) {
  for (const candidate of candidates) {
    const value = collapseWhitespace(candidate);
    if (value !== '') return value.slice(0, 300);
  }
  return '未命名文档';
}
