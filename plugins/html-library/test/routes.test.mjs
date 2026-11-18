import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createLibrary } from '../lib/library.js';
import { createRoutes, createLegacySiteRoute, documentCsp, ROUTE_PREFIX, SITE_PREFIX } from '../lib/routes.js';

const tempDirs = new Set();

async function makeTemp(prefix) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `dshl-${prefix}-`));
  tempDirs.add(dir);
  return dir;
}

test.after(async () => {
  await Promise.all([...tempDirs].map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

async function write(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

function createRes() {
  return {
    statusCode: 0,
    headers: new Map(),
    body: null,
    setHeader(name, value) {
      this.headers.set(String(name).toLowerCase(), String(value));
    },
    end(body) {
      this.body = body === undefined ? null : body;
    },
  };
}

async function call(route, options = {}) {
  const { method = 'GET', url = '/', headers = {}, body = undefined, remoteAddress = '127.0.0.1' } = options;
  if (route.fetch) {
    const response = await route.fetch(new Request(new URL(url, 'http://localhost'), { method, headers, body }));
    return { statusCode: response.status, headers: response.headers, body: await response.text() };
  }
  const request = {
    method,
    url,
    headers: { host: '127.0.0.1:50988', ...headers },
    socket: { remoteAddress },
    async *[Symbol.asyncIterator]() {
      if (typeof body === 'string') yield Buffer.from(body, 'utf8');
    },
  };
  const response = createRes();
  await route.handler(request, response);
  return response;
}

function jsonOf(response) {
  return JSON.parse(String(response.body));
}

async function setup() {
  const corpus = await makeTemp('routes-corpus');
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>样式保真样本</title>
    <link rel="stylesheet" href="./style.css"></head>
    <body><h1>缓存一致性</h1><p>相对 CSS 与图片必须按原目录加载。</p>
    <img src="./assets/icon.svg" alt="图标"><script>window.x=1</script></body></html>`;
  await write(path.join(corpus, 'page.html'), html);
  await write(path.join(corpus, 'style.css'), 'body { background: #fff; color: #111; }');
  await write(
    path.join(corpus, 'assets', 'icon.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" fill="#3f6ad8"/></svg>',
  );
  await write(path.join(corpus, 'plain.txt'), 'not html');

  const dataDir = await makeTemp('routes-data');
  const library = createLibrary({ dir: dataDir, config: {}, log: () => {} });
  await library.addRoot(corpus);
  await library.scan();
  const snapshot = await library.snapshot();
  const rootId = snapshot.roots[0].id;
  const routes = createRoutes(library);
  const site = createLegacySiteRoute(library);
  const endpoint = (suffix) => routes.find((route) => route.path === `${ROUTE_PREFIX}${suffix}`);
  return { corpus, library, dataDir, rootId, site, endpoint, html };
}

test('static route returns HTML bytes unchanged with faithful headers', async () => {
  const { corpus, site, rootId, html } = await setup();
  const response = await call(site, { url: `${SITE_PREFIX}/${rootId}/page.html` });
  const original = await fs.readFile(path.join(corpus, 'page.html'));

  assert.equal(response.statusCode, 200);
  assert.equal(Buffer.compare(response.body, original), 0);
  assert.equal(response.body.toString('utf8'), html);
  assert.match(response.headers.get('content-type'), /^text\/html; charset=utf-8$/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const csp = response.headers.get('content-security-policy');
  assert.match(csp, /script-src 'none'/);
  // 显式来源与 'self' 同时给出，沙箱/自定义协议下相对资源都能命中。
  assert.match(csp, /default-src 'self' http:\/\/127\.0\.0\.1:50988/);
  assert.ok(!csp.includes('frame-ancestors'));
  assert.match(csp, /connect-src 'none'/);
  assert.match(csp, /frame-src 'none'/);
  assert.equal(response.headers.get('access-control-allow-origin'), undefined);
});

test('static route serves relative CSS and SVG with correct MIME and conditional GET', async () => {
  const { site, rootId } = await setup();

  const css = await call(site, { url: `${SITE_PREFIX}/${rootId}/style.css` });
  assert.equal(css.statusCode, 200);
  assert.equal(css.headers.get('content-type'), 'text/css; charset=utf-8');
  assert.match(css.body.toString('utf8'), /background: #fff/);

  const svg = await call(site, { url: `${SITE_PREFIX}/${rootId}/assets/icon.svg` });
  assert.equal(svg.headers.get('content-type'), 'image/svg+xml; charset=utf-8');
  assert.match(svg.body.toString('utf8'), /<svg/);

  const etag = css.headers.get('etag');
  assert.ok(typeof etag === 'string' && etag.length > 0);
  const cached = await call(site, {
    url: `${SITE_PREFIX}/${rootId}/style.css`,
    headers: { 'if-none-match': etag },
  });
  assert.equal(cached.statusCode, 304);
  assert.equal(cached.body, null);
});

test('sandboxed iframe font requests get a null-origin CORS reply only', async () => {
  const { site, rootId } = await setup();
  const fromSandbox = await call(site, {
    url: `${SITE_PREFIX}/${rootId}/assets/icon.svg`,
    headers: { origin: 'null' },
  });
  assert.equal(fromSandbox.headers.get('access-control-allow-origin'), 'null');

  const fromSite = await call(site, {
    url: `${SITE_PREFIX}/${rootId}/assets/icon.svg`,
    headers: { origin: 'https://evil.example' },
  });
  assert.equal(fromSite.headers.get('access-control-allow-origin'), undefined);
});

test('static route rejects traversal, unknown roots, missing files and non-loopback peers', async () => {
  const { site, rootId } = await setup();

  const traversal = await call(site, { url: `${SITE_PREFIX}/${rootId}/..%2F..%2Fetc%2Fpasswd` });
  assert.equal(traversal.statusCode, 403);
  assert.equal(jsonOf(traversal).error.code, 'forbidden');

  const unknownRoot = await call(site, { url: `${SITE_PREFIX}/r0000000000000000/page.html` });
  assert.equal(unknownRoot.statusCode, 403);

  const missing = await call(site, { url: `${SITE_PREFIX}/${rootId}/nope.html` });
  assert.equal(missing.statusCode, 404);

  const remote = await call(site, {
    url: `${SITE_PREFIX}/${rootId}/page.html`,
    remoteAddress: '203.0.113.7',
  });
  assert.equal(remote.statusCode, 403);

  const wrongMethod = await call(site, { method: 'POST', url: `${SITE_PREFIX}/${rootId}/page.html` });
  assert.equal(wrongMethod.statusCode, 405);
});

test('JSON endpoints: snapshot, search, favorite and method guard', async () => {
  const { endpoint, library } = await setup();

  const snapshot = await call(endpoint('/snapshot'));
  assert.equal(snapshot.statusCode, 200);
  const snapshotBody = jsonOf(snapshot);
  assert.equal(snapshotBody.ok, true);
  assert.equal(snapshotBody.value.counts.documents, 1);
  assert.equal(snapshotBody.value.index.lastIndexAt !== null, true);

  const search = await call(endpoint('/documents'), {
    url: `${ROUTE_PREFIX}/documents?q=${encodeURIComponent('缓存')}`,
  });
  const searchBody = jsonOf(search);
  assert.equal(searchBody.ok, true);
  assert.equal(searchBody.value.total, 1);
  assert.equal(searchBody.value.items[0].title, '缓存一致性');
  assert.match(searchBody.value.items[0].snippet, /缓存/);

  const docId = searchBody.value.items[0].id;
  const favorite = await call(endpoint('/favorite'), {
    method: 'POST',
    url: `${ROUTE_PREFIX}/favorite`,
    body: JSON.stringify({ id: docId, enabled: true }),
  });
  assert.equal(favorite.statusCode, 200);
  assert.equal(jsonOf(favorite).value.favorite, true);

  const favorites = await call(endpoint('/documents'), {
    url: `${ROUTE_PREFIX}/documents?mode=favorites`,
  });
  assert.equal(jsonOf(favorites).value.total, 1);

  const tags = await call(endpoint('/tags'), {
    method: 'POST',
    url: `${ROUTE_PREFIX}/tags`,
    body: JSON.stringify({ id: docId, tags: ['样式', '保真'] }),
  });
  assert.deepEqual(jsonOf(tags).value.tags, ['样式', '保真']);
  const tagged = await call(endpoint('/documents'), {
    url: `${ROUTE_PREFIX}/documents?mode=tag&tag=${encodeURIComponent('保真')}`,
  });
  assert.equal(jsonOf(tagged).value.total, 1);

  assert.deepEqual(endpoint('/snapshot').methods, ['GET']);
  assert.deepEqual(endpoint('/favorite').methods, ['POST']);

  const health = jsonOf(await call(endpoint('/health')));
  assert.equal(health.value.plugin, 'dsh-html-library');
  assert.equal(typeof health.value.dataFile, 'string');

  // 反向确认：收藏确实落在库实例里，而不是只回显。
  const again = await library.listDocuments({ mode: 'favorites' });
  assert.equal(again.total, 1);
});

test('CSP falls back to self when the origin is unknown', () => {
  assert.match(documentCsp(null), /default-src 'self'/);
  assert.match(documentCsp(''), /style-src 'self'/);
  assert.ok(!documentCsp('').includes('frame-ancestors'));
});

test('directory mutations reject oversized and malformed JSON before touching the library', async () => {
  const { endpoint, library } = await setup();
  const add = endpoint('/roots/add');
  const before = await library.snapshot();
  for (const [body, code] of [['{', 'invalid-json'], ['x'.repeat(1024 * 1024 + 1), 'payload-too-large']]) {
    assert.equal(jsonOf(await call(add, { method: 'POST', body })).error.code, code);
  }
  assert.deepEqual((await library.snapshot()).roots, before.roots);
});

test('browser open validates indexed files, and reports launcher failures', async () => {
  const { library, corpus, rootId } = await setup();
  const doc = (await library.listDocuments()).items[0];
  const opened = [];
  const route = (options = {}) => createRoutes(library, {
    openExternal: async url => opened.push(url), ...options,
  }).find(entry => entry.path === `${ROUTE_PREFIX}/open`);
  const request = { method: 'POST', body: JSON.stringify({ id: doc.id }) };
  assert.equal((await call(route(), request)).statusCode, 200);
  assert.deepEqual(opened, [pathToFileURL(await fs.realpath(path.join(corpus, 'page.html'))).href]);
  const failure = await call(route({ openExternal: async () => { throw new Error('launcher unavailable'); } }), request);
  assert.equal(failure.statusCode, 500);
  assert.match(jsonOf(failure).error.message, /launcher unavailable/);
  await fs.rm(path.join(corpus, 'page.html'));
  assert.equal((await call(route(), request)).statusCode, 404);
  assert.equal(opened.length, 1);
  assert.equal((await call(route(), { method: 'POST', body: JSON.stringify({ id: 'unknown', path: '/etc/passwd' }) })).statusCode, 404);
});

test('snapshot tree includes indexed HTML files but excludes static assets', async () => {
  const { library, rootId } = await setup();
  const snapshot = await library.snapshot();
  assert.deepEqual(snapshot.treeDocuments.map(doc => ({ rootId: doc.rootId, folder: doc.folder, name: doc.name })),
    [{ rootId, folder: '', name: 'page.html' }]);
});
