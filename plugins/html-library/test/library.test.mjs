import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createLibrary, LibraryError } from '../lib/library.js';

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
  await fs.writeFile(file, content, 'utf8');
}

async function makeCorpus(withDrafts = false) {
  const corpus = await makeTemp('corpus');
  await write(
    path.join(corpus, 'alpha.html'),
    `<!doctype html><html><head><meta charset="utf-8"><title>Alpha 文档</title></head>
     <body><h1>缓存一致性实战</h1><p>MESI 协议与失效广播，是理解多核可见性的起点。</p>
     <h2>写时失效</h2><p>失效只传 key，不传值。</p></body></html>`,
  );
  await write(
    path.join(corpus, 'nested', 'beta.htm'),
    `<!doctype html><html><head><meta charset="utf-8"><title>Draft Beta</title></head>
     <body><p>Window TinyLFU frequency sketch 的最小实现思路。</p></body></html>`,
  );
  await write(
    path.join(corpus, 'nested', 'deep', 'gamma.html'),
    `<!doctype html><html><head><meta charset="utf-8"><title>Gamma</title></head>
     <body><h1>分布式锁</h1><p>看门狗续期与栅栏令牌，解决租约过期后的脑裂。</p></body></html>`,
  );
  await write(path.join(corpus, 'notes.txt'), '不该被索引的纯文本');
  await write(path.join(corpus, 'node_modules', 'evil.html'), '<h1>依赖目录里的页面</h1>');
  await write(path.join(corpus, '.git', 'secret.html'), '<h1>版本库里的页面</h1>');
  if (withDrafts) await write(path.join(corpus, 'drafts', 'wip.html'), '<h1>草稿目录</h1>');
  return corpus;
}

async function makeLibrary(corpus, config = {}) {
  const dataDir = await makeTemp('data');
  const library = createLibrary({ dir: dataDir, config, log: () => {} });
  await library.addRoot(corpus);
  await library.scan();
  return { library, dataDir };
}

test('scan indexes html / htm recursively and skips noise', async () => {
  const corpus = await makeCorpus();
  const { library } = await makeLibrary(corpus);
  const snapshot = await library.snapshot();

  assert.equal(snapshot.counts.documents, 3);
  assert.equal(snapshot.counts.missing, 0);
  assert.equal(snapshot.roots.length, 1);
  assert.equal(snapshot.roots[0].count, 3);

  const items = (await library.listDocuments({ mode: 'all' })).items;
  const titles = items.map((item) => item.title).sort();
  assert.deepEqual(titles, ['Draft Beta', '分布式锁', '缓存一致性实战']);

  const where = new Map(items.map((item) => [item.title, item]));
  assert.equal(where.get('缓存一致性实战').folder, '');
  assert.equal(where.get('Draft Beta').relPath, 'nested/beta.htm');
  assert.equal(where.get('分布式锁').folder, 'nested/deep');
  assert.ok(!where.has('不该被索引的纯文本'));
  assert.ok(items.every((item) => !item.relPath.includes('node_modules')));
  assert.ok(items.every((item) => !item.relPath.startsWith('.git')));

  const folders = snapshot.facets.folders.map((folder) => folder.relDir).sort();
  assert.deepEqual(folders, ['', 'nested', 'nested/deep']);
  // 目录计数是「子树」口径：nested 包含 nested/deep。
  const byFolder = new Map(snapshot.facets.folders.map((folder) => [folder.relDir, folder.count]));
  assert.equal(byFolder.get(''), 3);
  assert.equal(byFolder.get('nested'), 2);
  assert.equal(byFolder.get('nested/deep'), 1);
});

test('exclude globs remove matching paths', async () => {
  const corpus = await makeCorpus(true);
  const { library } = await makeLibrary(corpus, { exclude: ['**/drafts/**'] });
  const items = (await library.listDocuments({ mode: 'all' })).items;
  assert.equal(items.length, 3);
  assert.ok(items.every((item) => !item.relPath.includes('drafts')));
});

test('Chinese search matches title, body and headings with AND semantics', async () => {
  const corpus = await makeCorpus();
  const { library } = await makeLibrary(corpus);

  const titleHit = await library.listDocuments({ query: '缓存一致性' });
  assert.equal(titleHit.total, 1);
  assert.equal(titleHit.items[0].title, '缓存一致性实战');
  assert.ok(titleHit.items[0].snippet.includes('缓存一致性'));
  assert.deepEqual(titleHit.terms, ['缓存一致性']);

  const bodyHit = await library.listDocuments({ query: '看门狗' });
  assert.equal(bodyHit.total, 1);
  assert.equal(bodyHit.items[0].title, '分布式锁');
  assert.ok(bodyHit.items[0].snippet.includes('看门狗'));

  const headingHit = await library.listDocuments({ query: '写时失效' });
  assert.equal(headingHit.total, 1);
  assert.equal(headingHit.items[0].title, '缓存一致性实战');

  const ascii = await library.listDocuments({ query: 'frequency sketch' });
  assert.equal(ascii.total, 1);
  assert.equal(ascii.items[0].title, 'Draft Beta');

  const andMiss = await library.listDocuments({ query: '缓存 看门狗' });
  assert.equal(andMiss.total, 0);

  const none = await library.listDocuments({ query: '不存在的词条xyz' });
  assert.equal(none.total, 0);

  // 路径也参与检索，但权重最低。
  const byPath = await library.listDocuments({ query: 'gamma' });
  assert.equal(byPath.total, 1);
});

test('folder / root / tag filters and sorting', async () => {
  const corpus = await makeCorpus();
  const { library } = await makeLibrary(corpus);
  const snapshot = await library.snapshot();
  const rootId = snapshot.roots[0].id;

  const nested = await library.listDocuments({ mode: 'folder', rootId, folder: 'nested' });
  assert.equal(nested.total, 2);

  const rootView = await library.listDocuments({ mode: 'root', rootId });
  assert.equal(rootView.total, 3);

  const byTitle = await library.listDocuments({ mode: 'all', sort: 'title' });
  // 中文按拼音排序（ICU zh 规则），拉丁标题排在其后。
  assert.deepEqual(
    byTitle.items.map((item) => item.title),
    ['分布式锁', '缓存一致性实战', 'Draft Beta'],
  );

  const doc = byTitle.items[0];
  await library.setTags(doc.id, [' 草稿 ', '草稿', 'LLM']);
  const tagged = await library.listDocuments({ mode: 'tag', tag: '草稿' });
  assert.equal(tagged.total, 1);
  assert.deepEqual(tagged.items[0].tags, ['草稿', 'LLM']);
  const tagFacets = (await library.snapshot()).facets.tags;
  assert.deepEqual(tagFacets.map((tag) => tag.name).sort(), ['LLM', '草稿']);
});

test('favorites, tags and reading history survive a restart', async () => {
  const corpus = await makeCorpus();
  const dataDir = await makeTemp('data');
  const library = createLibrary({ dir: dataDir, config: {}, log: () => {} });
  await library.addRoot(corpus);
  await library.scan();

  const doc = (await library.listDocuments({ query: '缓存一致性' })).items[0];
  await library.setFavorite(doc.id, true);
  await library.setTags(doc.id, ['重要', '缓存']);
  await library.recordRead(doc.id, 0.42);
  await library.flush();

  const revived = createLibrary({ dir: dataDir, config: {}, log: () => {} });
  await revived.scan();
  const again = (await revived.listDocuments({ mode: 'favorites' })).items[0];
  assert.equal(again.id, doc.id);
  assert.equal(again.favorite, true);
  assert.deepEqual(again.tags, ['重要', '缓存']);
  assert.ok(typeof again.lastOpenedAt === 'number' && again.lastOpenedAt > 0);

  const recent = await revived.listDocuments({ mode: 'recent' });
  assert.equal(recent.total, 1);
});

test('deleted files become missing tombstones that keep metadata', async () => {
  const corpus = await makeCorpus();
  const { library } = await makeLibrary(corpus);
  const doc = (await library.listDocuments({ query: '分布式锁' })).items[0];
  await library.setFavorite(doc.id, true);
  await library.setTags(doc.id, ['锁']);

  await fs.rm(path.join(corpus, 'nested', 'deep', 'gamma.html'));
  await library.scan();

  const snapshot = await library.snapshot();
  assert.equal(snapshot.counts.documents, 2);
  assert.equal(snapshot.counts.missing, 1);

  const missing = await library.listDocuments({ mode: 'missing' });
  assert.equal(missing.total, 1);
  assert.equal(missing.items[0].title, '分布式锁');
  assert.equal(missing.items[0].favorite, true);
  assert.deepEqual(missing.items[0].tags, ['锁']);
  assert.equal(missing.items[0].status, 'missing');
});

test('removeRoot drops the index but never touches files on disk', async () => {
  const corpus = await makeCorpus();
  const { library } = await makeLibrary(corpus);
  const snapshot = await library.snapshot();
  const rootId = snapshot.roots[0].id;

  await library.removeRoot(rootId);
  const after = await library.snapshot();
  assert.equal(after.roots.length, 0);
  assert.equal(after.counts.documents, 0);
  await fs.access(path.join(corpus, 'alpha.html'));
});

test('path containment rejects traversal, unknown roots and symlink escapes', async () => {
  const corpus = await makeCorpus();
  const { library } = await makeLibrary(corpus);
  const rootId = (await library.snapshot()).roots[0].id;

  const ok = await library.resolveSitePath(`/${rootId}/nested/beta.htm`);
  assert.equal(ok.relPath, 'nested/beta.htm');

  const traversal = await library.resolveSitePath(`/${rootId}/../etc/passwd`).then(
    () => null,
    (error) => error,
  );
  assert.ok(traversal instanceof LibraryError);
  assert.equal(traversal.code, 'forbidden');

  const encodedSlash = await library.resolveSitePath(`/${rootId}/..%2Fetc%2Fpasswd`).then(
    () => null,
    (error) => error,
  );
  assert.equal(encodedSlash.code, 'forbidden');

  const unknownRoot = await library.resolveSitePath('/unknown/alpha.html').then(
    () => null,
    (error) => error,
  );
  assert.equal(unknownRoot.code, 'forbidden');

  const outside = path.join(await makeTemp('outside'), 'secret.html');
  await write(outside, '<h1>root 之外的文件</h1>');
  await fs.symlink(outside, path.join(corpus, 'escape.html'));
  const escaped = await library.resolveSitePath(`/${rootId}/escape.html`).then(
    () => null,
    (error) => error,
  );
  assert.equal(escaped.code, 'forbidden');
});
