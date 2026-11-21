import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchScript } from '../lib/script-download.js';

test('Windows delegates script downloads to the system proxy transport and preserves binary bytes', async () => {
  const url = 'https://cdn.jsdelivr.net/npm/sm-crypto@0.3.13/dist/sm2.min.js';
  const bytes = Buffer.from([0, 127, 128, 255]);
  const execute = async (program, args, options) => {
    assert.match(program, /\\WindowsPowerShell\\v1\.0\\powershell\.exe$/i);
    assert.match(args.at(-1), /GetSystemWebProxy\(\)/);
    assert.equal(options.env.DSH_SCRIPT_URL, url);
    assert.equal(options.maxBuffer, 128);
    return { stdout: bytes };
  };
  const response = await fetchScript(url, 128, { platform: 'win32', execute });
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
});
