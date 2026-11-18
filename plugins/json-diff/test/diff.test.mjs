import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = vm.createContext({ window: { __ModuleLoader__: { load() {} } } });
vm.runInContext(readFileSync(new URL('../client.js', import.meta.url), 'utf8'), ctx);
const lines = input => Array.from(ctx.jsonDiffLines(input, true));
const types = (a, b, json = true) => Array.from(ctx.jsonDiffRows(a, b, json), row => row.type);
test('JSON formatting ignores layout and preserves numeric literals, escapes and duplicate keys', () => {
  assert.deepEqual(lines(' { "id": 9007199254740993 , "id" : "a, b", "x":[] } '),
    ['{', '  "id": 9007199254740993,', '  "id": "a, b",', '  "x": []', '}']);
  assert.throws(() => lines('{"id":}'));
});
test('aligns unchanged lines around field addition and deletion', () => {
  const a = lines('{"x":1}'), b = lines('{"x":1,"y":2}');
  assert.deepEqual(types(a,b), ['same','same','add','same']);
  assert.deepEqual(types(b,a), ['same','same','remove','same']);
  assert.deepEqual(types(lines('[1,2]'),lines('[1,3]')), ['same','same','change','same']);
});
test('plain text handles empty inputs, CRLF and literal commas', () => {
  assert.deepEqual(Array.from(ctx.jsonDiffLines('',false)), []);
  assert.deepEqual(Array.from(ctx.jsonDiffLines('A\r\nB',false)), ['A','B']);
  assert.deepEqual(types(['a,'],['a'],false), ['change']);
  assert.deepEqual(types([],['a','b'],false), ['add','add']);
});
test('rejects excessively expensive comparisons before allocating the table', () => {
  assert.throws(() => types(Array(3000).fill('a'), Array(3000).fill('b')));
});
