import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createLibrary } from '../lib/library.js';
import { buildPreview, resolvePreviewReference } from '../lib/preview.js';

async function setup(t) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-local-'));
  const root = path.join(tmp, 'files'); await fs.mkdir(root);
  const lib = createLibrary({ dir: path.join(tmp, 'state') });
  await lib.addRoot(root);
  t.after(async () => { await lib.flush(); await fs.rm(tmp, { recursive: true, force: true }); });
  return { root, lib, tmp };
}
test('memory preview bundles CSS imports, images and fonts without altering source files', async t => {
  const { root, lib } = await setup(t);
  const html = '<link rel="stylesheet" href="style.css"><h1>Title</h1><img src="image.svg"><script>parent.BAD=true</script>';
  await fs.writeFile(path.join(root, 'a.html'), html);
  await fs.writeFile(path.join(root, 'style.css'), '@import "theme.css";body{background:url(image.svg)}');
  await fs.writeFile(path.join(root, 'theme.css'), '@font-face{font-family:test;src:url(font.woff2)}');
  await fs.writeFile(path.join(root, 'font.woff2'), Buffer.from([0,1,2,3]));
  await fs.writeFile(path.join(root, 'image.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await lib.scan(); const doc = (await lib.listDocuments()).items[0];
  const preview = await buildPreview(lib, doc.id);
  assert.deepEqual(preview.warnings, []);
  assert.equal(preview.assets, 4);
  assert.match(preview.html, /data:text\/css/);
  assert.match(preview.html, /data:image\/svg/);
  assert.ok(!preview.html.includes('<script'));
  assert.match(preview.html, /script-src 'none'/);
  assert.equal(await fs.readFile(path.join(root, 'a.html'), 'utf8'), html);
});
test('preview refuses root escapes, remote and oversized resources with explicit warnings', async t => {
  const { root, lib, tmp } = await setup(t);
  await fs.writeFile(path.join(tmp, 'secret.svg'), 'private');
  await fs.writeFile(path.join(root, 'a.html'), '<img src="../secret.svg"><img src="https://example.com/x.png"><img src="large.png">');
  await fs.writeFile(path.join(root, 'large.png'), Buffer.alloc(1024));
  await lib.scan(); const preview = await buildPreview(lib, (await lib.listDocuments()).items[0].id, { maxAssetBytes: 256 });
  assert.equal(preview.warnings.length, 3);
  assert.ok(!preview.html.includes('private'));
});

test('preview resolves Windows file URLs with mixed drive or UNC server casing inside the selected root', () => {
  const driveRoot = String.raw`C:\Users\资料 库`;
  const driveBase = pathToFileURL(path.win32.join(driveRoot, '导出', 'page.html'), { windows: true });
  assert.equal(
    resolvePreviewReference('file:///c:/Users/资料%20库/导出/assets/cover.svg#icon', driveBase, driveRoot, true).relative,
    '导出/assets/cover.svg',
  );

  const shareRoot = String.raw`\\Server\Share\Library`;
  const shareBase = pathToFileURL(path.win32.join(shareRoot, 'page.html'), { windows: true });
  assert.equal(resolvePreviewReference('assets/cover.svg', shareBase, shareRoot, true).relative, 'assets/cover.svg');

  for (const reference of ['../outside.svg', 'file://server/other/Library/cover.svg', 'file://other/Share/Library/cover.svg']) {
    assert.throws(() => resolvePreviewReference(reference, shareBase, shareRoot, true), /资源超出所选目录/);
  }
  assert.throws(() => resolvePreviewReference('file:///D:/Users/资料%20库/cover.svg', driveBase, driveRoot, true), /资源超出所选目录/);
  assert.throws(() => resolvePreviewReference('https://example.com/cover.svg', driveBase, driveRoot, true), /远程资源默认禁用/);

  const posixRoot = '/home/user/Library';
  const posixBase = pathToFileURL(`${posixRoot}/page.html`, { windows: false });
  assert.throws(() => resolvePreviewReference('../library/cover.svg', posixBase, posixRoot, false), /资源超出所选目录/);
});

test('preview and in-library links use the same relative paths for encoded filenames', async t => {
  const { root, lib } = await setup(t);
  await fs.mkdir(path.join(root, '章节'));
  await fs.writeFile(path.join(root, '首页.html'), '<img src="章节/图片%20%231.svg"><a href="章节/下一页.html">Next</a>');
  await fs.writeFile(path.join(root, '章节', '图片 #1.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await fs.writeFile(path.join(root, '章节', '下一页.html'), '<h1>Next</h1>');
  await lib.scan();
  const { items } = await lib.listDocuments();
  const preview = await buildPreview(lib, items.find(doc => doc.name === '首页.html').id);
  assert.deepEqual(preview.warnings, []);
  assert.match(preview.html, /src="data:image\/svg\+xml;base64,/);
  assert.match(preview.html, /data-library-path="章节\/下一页\.html"/);
});
test('rename keeps metadata across restart, rejects collisions and traversal, and keeps file bytes', async t => {
  const { root, lib, tmp } = await setup(t);
  const html = '<h1>Original title</h1><p>Contents</p>';
  await fs.writeFile(path.join(root, 'a.html'), html);
  await fs.writeFile(path.join(root, 'exists.html'), 'Do not replace');
  await lib.scan(); const doc = (await lib.listDocuments({query:'Original'})).items[0];
  await lib.setTags(doc.id, ['keep']); await lib.setFavorite(doc.id, true); await lib.recordRead(doc.id, .5);
  await assert.rejects(lib.renameDocument(doc.id, '../escape.html'));
  await assert.rejects(lib.renameDocument(doc.id, 'exists.html'));
  const renamed = await lib.renameDocument(doc.id, 'renamed.html');
  assert.notEqual(renamed.id, doc.id);
  assert.equal(renamed.name, 'renamed.html'); assert.equal(renamed.title, 'Original title');
  assert.equal(renamed.favorite, true); assert.deepEqual(renamed.tags, ['keep']);
  assert.ok(renamed.lastOpenedAt > 0);
  assert.equal(await fs.readFile(path.join(root, 'renamed.html'), 'utf8'), html);
  await assert.rejects(fs.stat(path.join(root, 'a.html')));
  const revived = createLibrary({dir:path.join(tmp,'state')}); await revived.scan();
  assert.equal((await revived.listDocuments({mode:'favorites'})).items[0].id, renamed.id);
  assert.equal((await revived.listDocuments({mode:'missing'})).total, 0);
});

test('create, index and recover a folder tree without touching sibling files', async t => {
  const { root, lib } = await setup(t);
  const rootId = (await lib.snapshot()).roots[0].id;
  const edit = (action, kind, folder, name) => lib.editEntry({ rootId, action, kind, folder, name });
  await edit('create', 'folder', '', '新目录');
  assert.ok((await lib.snapshot()).facets.folders.some(folder => folder.relDir === '新目录' && folder.count === 0));
  await edit('create', 'file', '新目录', '例子.html');
  await assert.rejects(edit('create', 'file', '新目录', '例子.html'), /同名/);
  await assert.rejects(edit('create', 'file', '../', 'escape.html'));
  await assert.rejects(edit('delete', 'folder', '', ''));
  await assert.rejects(edit('create', 'file', '', 'CON.html'));
  await fs.writeFile(path.join(root, '新目录', 'image.svg'), '<svg/>');
  await edit('delete', 'folder', '', '新目录');
  assert.equal((await lib.snapshot()).treeDocuments.length, 0);
  const trash = path.join(root, '.dsh-html-trash');
  const [batch] = await fs.readdir(trash);
  assert.equal(await fs.readFile(path.join(trash, batch, '新目录', 'image.svg'), 'utf8'), '<svg/>');
  await assert.rejects(edit('delete', 'folder', '', '.dsh-html-trash'));
  await edit('create', 'file', '', 'note.html');
  await edit('delete', 'file', '', 'note.html');
  assert.equal((await lib.snapshot()).treeDocuments.length, 0);
});

test('interactive preview includes local JavaScript only when requested', async t => {
  const { root, lib } = await setup(t);
  await fs.writeFile(path.join(root, 'control.html'), '<script src="./control.js"></script><button onclick="activate()">Go</button>');
  await fs.writeFile(path.join(root, 'control.js'), 'function activate() { document.body.dataset.active = "yes"; }');
  await lib.scan();
  const id = (await lib.listDocuments()).items[0].id;
  assert.doesNotMatch((await buildPreview(lib, id)).html, /<script/);
  const preview = await buildPreview(lib, id, { interactive: true });
  assert.match(preview.html, /<script src="data:text\/javascript;base64,/);
  assert.match(preview.html, /connect-src 'none'/);
  assert.deepEqual(preview.warnings, []);
});

test('interactive preview resolves the pinned SM2 script offline only for its exact URL', async t => {
  const { root, lib } = await setup(t);
  const url = 'https://cdn.jsdelivr.net/npm/sm-crypto@0.3.13/dist/sm2.min.js';
  await fs.writeFile(path.join(root, 'sm2.html'), `<script src="${url}"></script><script src="${url}?v=2"></script><img src="${url}">`);
  await lib.scan();
  const { id } = (await lib.listDocuments()).items[0];
  const preview = await buildPreview(lib, id, { interactive: true });
  const bytes = await fs.readFile(new URL(import.meta.resolve('sm-crypto/dist/sm2.js')));
  assert.ok(preview.html.includes(bytes.toString('base64')));
  assert.deepEqual(preview.warnings.map(w => w.path), [url + '?v=2', url]);
  assert.equal(preview.assets, 1);
  const disabled = await buildPreview(lib, id, { interactive: true, bundledSm2: false });
  assert.equal(disabled.warnings.length, 3);
  assert.equal((await buildPreview(lib, id)).assets, 0);
});
