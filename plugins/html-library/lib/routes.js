/**
 * HTML 知识库 —— 宿主侧 HTTP 路由（Web GUI 唯一的数据通道）。
 *
 * 两条路由：
 *  - `/api/dsh-html-library/*`  JSON API（快照 / 列表检索 / 目录管理 / 元数据）；
 *  - `/api/dsh-html-library/site/<rootId>/<相对路径>` 只读静态资源，
 *    按字节原样返回 HTML 与其相对 CSS / 图片 / 字体 —— 预览保真的关键。
 *
 * 准入：JSON 路由优先委托官方 `connection.requestRejection()`（Host/Origin 检查 +
 * 浏览器会话鉴权，与官方 `/api` 同一套口径），服务缺席时退回纯回环判定。
 * 静态资源额外接受沙箱 iframe 的 `Origin: null` 子资源请求，但仍只服务本机回环
 * 且只读、且必须落在已配置的根目录内。
 *
 * @module dsh-html-library/routes
 */

import { promises as fs } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { buildPreview } from './preview.js';
import { decodeBuffer, mimeFor, isTextualPath, normalizeCharset } from './mime.js';
import { LibraryError } from './library.js';

export const ROUTE_PREFIX = '/api/dsh-html-library';
export const SITE_PREFIX = `${ROUTE_PREFIX}/site`;
const MAX_BODY_BYTES = 1024 * 1024;

/**
 * 文档的实际来源（scheme://host:port）。
 *
 * iframe 带 `sandbox`（不给 allow-same-origin）时文档源是不透明源，
 * CSP 里的 `'self'` 未必能匹配到它自己的相对资源；因此按请求的 Host 生成
 * 显式来源，既保住完整沙箱，又让相对 CSS / 图片 / 字体照常加载。
 */
function requestOrigin(req) {
  const host = req.headers.host;
  if (typeof host !== 'string' || host === '') return null;
  try {
    if (!isLoopbackHostname(new URL(`http://${host}`).hostname)) return null;
  } catch {
    return null;
  }
  const forwarded = req.headers['x-forwarded-proto'];
  const proto = typeof forwarded === 'string' && forwarded.split(',')[0].trim() === 'https' ? 'https' : 'http';
  return `${proto}://${host}`;
}

/**
 * 文档的 CSP：禁脚本、禁远程资源、允许自身相对资源与内联样式。
 *
 * 刻意**不写 `frame-ancestors`**：宿主页面可能通过自定义协议（Electron）加载，
 * 与 HTTP 来源不一致，写死来源会让 iframe 直接空白。这个路由只读、只对本机回环
 * 开放，被同源页面嵌入没有额外收益，因此不锁祖先。
 * `'self'` 与请求来源同时给出：沙箱 iframe 即使失去了同源身份，相对资源仍可命中。
 */
export function documentCsp(origin) {
  const sources = origin === null || origin === undefined || origin === '' ? "'self'" : `'self' ${origin}`;
  return [
    `default-src ${sources}`,
    "base-uri 'self'",
    "form-action 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "script-src 'none'",
    `style-src ${sources} 'unsafe-inline'`,
    `img-src ${sources} data: blob:`,
    `font-src ${sources} data:`,
    `media-src ${sources} data: blob:`,
    "connect-src 'none'",
  ].join('; ');
}

/** 只接受本机回环连接与回环 Host 头。 */
export function isLoopbackRequest(req) {
  const address = req.socket?.remoteAddress ?? '';
  if (!isLoopbackAddress(address)) return false;
  let hostname;
  try {
    hostname = new URL(`http://${req.headers.host ?? ''}`).hostname;
  } catch {
    return false;
  }
  return isLoopbackHostname(hostname);
}

function isLoopbackAddress(address) {
  return address === '::1' || address.startsWith('127.') || address.startsWith('::ffff:127.');
}

function isLoopbackHostname(hostname) {
  return hostname === 'localhost' || hostname === '[::1]' || /^127\./.test(hostname);
}

/**
 * JSON 路由准入。返回 `401 | 403 | undefined`。
 *
 * @param {() => object | undefined} getConnection 惰性读取 `connection` 服务。
 */
export function createAuthorize(getConnection = () => undefined) {
  return function authorize(req) {
    let connection;
    try {
      connection = getConnection();
    } catch {
      connection = undefined;
    }
    if (connection === undefined || typeof connection.requestRejection !== 'function') {
      return isLoopbackRequest(req) ? undefined : 403;
    }
    let rejection;
    try {
      rejection = connection.requestRejection({ headers: req.headers ?? {} });
    } catch {
      return isLoopbackRequest(req) ? undefined : 403;
    }
    if (rejection === undefined) return undefined;
    if (rejection === 401 || rejection === 403) return rejection;
    return isLoopbackRequest(req) ? undefined : 403;
  };
}

/**
 * 静态资源准入：只认本机回环。
 *
 * 沙箱 iframe（不带 `allow-same-origin`）的子资源请求来源是不透明源，
 * `Sec-Fetch-Site` 会显示为跨站、`Origin` 可能是 `null`；这不是越权，
 * 所以这里不套用会话判定，只守住「本机 + 已配置目录 + 只读」三条。
 */
export function assetRejection(req) {
  return isLoopbackRequest(req) ? undefined : 403;
}

function writeJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

function writeFailure(res, status, code, message) {
  writeJson(res, status, { ok: false, error: { code, message } });
}

function statusForCode(code) {
  if (code === 'not-found') return 404;
  if (code === 'forbidden') return 403;
  if (code === 'duplicate-name' || code === 'busy' || code === 'duplicate-root' || code === 'nested-root') return 409;
  if (code === 'internal') return 500;
  return 400;
}

function rejectionStatus(authorize, req) {
  const rejection = authorize(req);
  if (rejection === 401) return 401;
  if (rejection === 403) return 403;
  return undefined;
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new LibraryError('payload-too-large', '请求体过大');
    chunks.push(chunk);
  }
  if (size === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new LibraryError('invalid-json', '请求体不是合法 JSON');
  }
}

function queryOf(req) {
  try {
    return new URL(req.url ?? '', 'http://localhost').searchParams;
  } catch {
    return new URLSearchParams();
  }
}

function htmlContentType(charset) {
  const name = normalizeCharset(charset) ?? 'utf-8';
  return `text/html; charset=${name}`;
}

/** Open the validated local preview URL in the system browser, without a shell. */
async function openInBrowser(file) {
  const run = promisify(execFile);
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'rundll32.exe' : 'xdg-open';
  const args = process.platform === 'win32' ? ['url.dll,FileProtocolHandler', file] : [file];
  await run(command, args, { timeout: 15000 });
}

/** 组装路由表。 */
export function createRoutes(library, options = {}) {
  const authorize = options.authorize ?? createAuthorize();

  /** JSON 端点包装：准入 → 方法 → 信封 → 错误归一。 */
  function endpoint(method, suffix, handle) {
    return {
      kind: 'exact',
      path: `${ROUTE_PREFIX}${suffix}`,
      handler: async (req, res) => {
        const rejection = rejectionStatus(authorize, req);
        if (rejection !== undefined) {
          writeFailure(res, rejection, rejection === 401 ? 'unauthorized' : 'forbidden', '请从 DSH 页面内访问');
          return;
        }
        if (req.method !== method) {
          res.setHeader('allow', method);
          writeFailure(res, 405, 'method-not-allowed', `请用 ${method}`);
          return;
        }
        try {
          const body = method === 'GET' ? {} : await readJsonBody(req);
          const value = await handle(body, req);
          writeJson(res, 200, { ok: true, value });
        } catch (error) {
          const code = error instanceof LibraryError ? error.code : 'internal';
          if (code === 'internal') {
            options.log?.(`请求处理失败：${String(error?.stack ?? error)}`);
          }
          writeFailure(res, statusForCode(code), code, String(error?.message ?? error));
        }
      },
    };
  }

  const routes = [
    endpoint('GET', '/health', async () => ({
      plugin: 'dsh-html-library',
      serverTime: new Date().toISOString(),
      dataFile: library.stateFile,
    })),

    endpoint('GET', '/snapshot', async () => library.snapshot()),

    endpoint('GET', '/documents', async (_body, req) => {
      const params = queryOf(req);
      return library.listDocuments({
        query: params.get('q') ?? '',
        mode: params.get('mode') ?? 'all',
        rootId: params.get('rootId') ?? undefined,
        folder: params.get('folder') ?? undefined,
        tag: params.get('tag') ?? undefined,
        sort: params.get('sort') ?? 'relevance',
        limit: Number(params.get('limit') ?? '300'),
        offset: Number(params.get('offset') ?? '0'),
      });
    }),

    endpoint('GET', '/document', async (_body, req) => {
      const id = queryOf(req).get('id') ?? '';
      return library.getDocument(id);
    }),

    endpoint('POST', '/roots/add', async (body) => {
      const root = await library.addRoot(body.path);
      // 索引在后台跑，界面轮询快照看到结果；不要挡住这次响应。
      library.scan().catch(() => {});
      return { root };
    }),

    endpoint('POST', '/roots/remove', async (body) => {
      if (typeof body.id !== 'string' || body.id === '') throw new LibraryError('bad-request', '缺少目录 id');
      return library.removeRoot(body.id);
    }),

    endpoint('POST', '/preview', async body => {
      if (typeof body.id !== 'string' || !body.id) throw new LibraryError('bad-request', '缺少文档 id');
      return buildPreview(library, body.id);
    }),

    endpoint('POST', '/rename', async body => {
      if (typeof body.id !== 'string' || !body.id) throw new LibraryError('bad-request', '缺少文档 id');
      return library.renameDocument(body.id, body.name);
    }),

    endpoint('POST', '/open', async (body, req) => {
      if (typeof body.id !== 'string' || body.id === '') throw new LibraryError('bad-request', '缺少文档 id');
      const doc = await library.getDocument(body.id);
      if (doc.status !== 'ok') throw new LibraryError('not-found', '源文件不可用，请重新索引');
      const routePath = [doc.rootId, ...doc.relPath.split('/')].map(encodeURIComponent).join('/');
      const local = await library.resolveSitePath(routePath);
      const url = pathToFileURL(local.absolutePath).href;
      try {
        await (options.openExternal ?? openInBrowser)(url);
      } catch (error) {
        throw new LibraryError('internal', `无法打开系统浏览器：${String(error?.message ?? error)}`);
      }
      return { id: doc.id, opened: true };
    }),

    endpoint('POST', '/scan', async () => {
      const stats = await library.scan();
      return stats;
    }),

    endpoint('POST', '/favorite', async (body) => {
      if (typeof body.id !== 'string' || body.id === '') throw new LibraryError('bad-request', '缺少文档 id');
      return library.setFavorite(body.id, body.enabled !== false);
    }),

    endpoint('POST', '/tags', async (body) => {
      if (typeof body.id !== 'string' || body.id === '') throw new LibraryError('bad-request', '缺少文档 id');
      return library.setTags(body.id, body.tags);
    }),

    endpoint('POST', '/read', async (body) => {
      if (typeof body.id !== 'string' || body.id === '') throw new LibraryError('bad-request', '缺少文档 id');
      return library.recordRead(body.id, Number(body.scrollRatio ?? '0'));
    }),
  ];

  // 只读静态资源：与文档同目录的相对 URL 才能保住 CSS / 图片 / 字体。
  if (options.legacyStatic === true) routes.push({
    kind: 'prefix',
    path: SITE_PREFIX,
    handler: async (req, res) => {
      const rejection = assetRejection(req);
      if (rejection !== undefined) {
        writeFailure(res, rejection, 'forbidden', '只允许本机访问');
        return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('allow', 'GET, HEAD');
        writeFailure(res, 405, 'method-not-allowed', '只支持 GET');
        return;
      }
      const pathname = (() => {
        try {
          return new URL(req.url ?? '', 'http://localhost').pathname;
        } catch {
          return '';
        }
      })();
      if (!pathname.startsWith(`${SITE_PREFIX}/`)) {
        writeFailure(res, 404, 'not-found', '未找到资源');
        return;
      }
      const remainder = pathname.slice(SITE_PREFIX.length);
      let file;
      try {
        file = await library.resolveSitePath(remainder);
      } catch (error) {
        const code = error instanceof LibraryError ? error.code : 'internal';
        writeFailure(res, statusForCode(code), code, String(error?.message ?? error));
        return;
      }

      let buffer;
      try {
        buffer = await fs.readFile(file.absolutePath);
      } catch (error) {
        writeFailure(res, 404, 'not-found', `读取失败：${String(error?.message ?? error)}`);
        return;
      }

      const etag = `W/"${file.size.toString(16)}-${Math.floor(file.mtimeMs).toString(16)}"`;
      const ifNoneMatch = req.headers['if-none-match'];
      if (typeof ifNoneMatch === 'string' && ifNoneMatch === etag) {
        res.statusCode = 304;
        res.setHeader('etag', etag);
        res.end();
        return;
      }

      const isHtml = /\.(html?|xhtml)$/i.test(file.name);
      const mime = mimeFor(file.name);
      let contentType = mime;
      if (isHtml) {
        contentType = htmlContentType(decodeBuffer(buffer.subarray(0, 8192)).charset);
      } else if (isTextualPath(file.name)) {
        contentType = `${mime}; charset=utf-8`;
      }

      res.statusCode = 200;
      res.setHeader('content-type', contentType);
      res.setHeader('content-length', String(buffer.length));
      res.setHeader('etag', etag);
      res.setHeader('x-content-type-options', 'nosniff');
      res.setHeader('referrer-policy', 'no-referrer');
      res.setHeader('cache-control', isHtml ? 'no-store' : 'no-cache');

      if (isHtml) {
        // 文档自身只能加载同源（本插件静态前缀）下的相对资源；脚本一律禁止。
        res.setHeader('content-security-policy', documentCsp(requestOrigin(req)));
      }

      // 沙箱 iframe 的字体请求是 CORS 模式、来源为 `null`；只对这类来源回 CORS，
      // 其它跨站页面拿不到响应体。
      const origin = req.headers.origin;
      if (typeof origin === 'string' && (origin === 'null' || isLoopbackOrigin(origin))) {
        res.setHeader('access-control-allow-origin', origin);
        res.setHeader('vary', 'origin');
      }

      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      res.end(buffer);
    },
  });

  return routes;
}

function isLoopbackOrigin(origin) {
  try {
    return isLoopbackHostname(new URL(origin).hostname);
  } catch {
    return false;
  }
}
