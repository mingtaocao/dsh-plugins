import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createLibrary } from '../lib/library.js';
import { buildPreview } from '../lib/preview.js';

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
