import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = vm.createContext({ window: { __ModuleLoader__: { load() {} } } });
vm.runInContext(readFileSync(new URL('../client.js', import.meta.url), 'utf8'), ctx);
const lines = input => Array.from(ctx.textLines(input));
const types = (a, b) => Array.from(ctx.compareRows(lines(a), lines(b)), row => row.type);

test('compares literal text including blank lines, indentation, punctuation and invalid syntax', () => {
  assert.deepEqual(lines('A\r\n B\r'), ['A',' B','']);
  assert.deepEqual(types(' {oops,', ' {oops'), ['change']);
  assert.deepEqual(types('a', ' a'), ['change']);
  assert.deepEqual(types('a', 'a\n'), ['same','add']);
});

test('aligns mixed changes and one-sided inputs', () => {
  assert.deepEqual(types('A\n旧\nB', 'A\n新\nB\nC'), ['same','change','same','add']);
  assert.deepEqual(types('', 'a\nb'), ['add','add']);
  assert.deepEqual(types('a', ''), ['remove']);
  assert.deepEqual(types('', ''), []);
});

test('bounds input and alignment costs', () => {
  assert.throws(() => lines('a'.repeat(500001)));
  assert.throws(() => lines('\n'.repeat(5000)));
  assert.throws(() => types('a\n'.repeat(3000), 'b\n'.repeat(3000)));
});
