import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.resolve(here, '..', 'fixtures', 'demo');

function createFakeContext() {
  const routes = [];
  const effects = [];
  const track = (dispose) => {
    if (typeof dispose === 'function') effects.push(dispose);
    return dispose;
  };
  const connection = {
    fetch: {
      register(route) {
        routes.push(route);
        return track(() => routes.splice(routes.indexOf(route), 1));
      },
    },
  };
  const ctx = {
    logger: { info() {}, warn() {}, error() {} },
    effect(fn) {
      return track(fn());
    },
    inject(names, callback) {
      if (names.includes('connection')) callback({ connection });
    },
  };
  return { ctx, routes, effects };
}

async function call(route, { method = 'GET', url = route.path, body } = {}) {
  const response = await route.fetch(new Request(new URL(url, 'http://localhost'), { method, body }));
  return { body: await response.text() };
}

async function waitFor(check, timeoutMs = 6000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await check();
    if (value !== undefined) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('timed out waiting for the plugin to finish indexing');
}

test('apply() wires routes, scans fixtures and serves bytes through the real entry', async () => {
  const dataHome = await fs.mkdtemp(path.join(os.tmpdir(), 'dshl-plugin-home-'));
  process.env.DSH_HOME = dataHome;

  const { apply } = await import('../index.js');
  const { ctx, routes, effects } = createFakeContext();
  apply(ctx, { roots: [fixtures], watchIntervalMs: 60_000 });

  assert.equal(routes.length, 14);
  assert.ok(!routes.some((route) => route.path === '/api/dsh-html-library/site'));
  assert.ok(routes.some((route) => route.path === '/api/dsh-html-library/snapshot'));

  try {
    const snapshotRoute = routes.find((route) => route.path === '/api/dsh-html-library/snapshot');
    const value = await waitFor(async () => {
      const response = await call(snapshotRoute);
      const payload = JSON.parse(String(response.body));
      return payload.value?.counts?.documents > 0 ? payload.value : undefined;
    });

    assert.equal(value.counts.documents, 4);
    assert.equal(value.counts.missing, 0);
    assert.equal(value.roots.length, 1);
    assert.equal(value.roots[0].path, await fs.realpath(fixtures));

    const documentsRoute = routes.find((route) => route.path === '/api/dsh-html-library/documents');
    const listed = JSON.parse(
      String((await call(documentsRoute, { url: '/api/dsh-html-library/documents?mode=all' })).body),
    );
    const titles = listed.value.items.map((item) => item.title);
    assert.deepEqual(titles.sort(), [
      'Agent Harness 设计速览',
      '分布式锁的三次迭代',
      '工具链速记（只有 title 没有 h1）',
      '缓存一致性：从 MESI 到 Caffeine',
    ].sort());

    const search = JSON.parse(String((await call(routes.find((route) => route.path === '/api/dsh-html-library/documents'), {
      url: `/api/dsh-html-library/documents?q=${encodeURIComponent('看门狗')}`,
    })).body));
    assert.equal(search.value.total, 1);
    assert.equal(search.value.items[0].title, '分布式锁的三次迭代');
    assert.match(search.value.items[0].snippet, /看门狗/);

    const doc = listed.value.items.find(item => item.name === 'index.html');
    const previewRoute = routes.find(route => route.path === '/api/dsh-html-library/preview');
    const preview = JSON.parse(String((await call(previewRoute, {
      method: 'POST', body: JSON.stringify({ id: doc.id }),
    })).body));
    assert.equal(preview.ok, true);
    assert.match(preview.value.html, /data:text\/css/);
    assert.match(preview.value.html, /data:image\/svg/);
    assert.deepEqual(preview.value.warnings, []);

    // 数据文件落在 DSH home 下，而不是用户的知识目录里。
    const dataFile = path.join(dataHome, 'dsh-html-library', 'library.json');
    const saved = JSON.parse(await fs.readFile(dataFile, 'utf8'));
    assert.equal(saved.roots.length, 1);
    assert.equal(saved.roots[0].path, await fs.realpath(fixtures));
  } finally {
    for (const dispose of effects) dispose();
    delete process.env.DSH_HOME;
    await fs.rm(dataHome, { recursive: true, force: true });
  }
});
