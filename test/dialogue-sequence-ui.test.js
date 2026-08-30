import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('the dialogue modal renders authored exchanges one turn at a time', async () => {
  const source = await readFile(join(root, 'src/main.js'), 'utf8');
  assert.match(source, /Array\.isArray\(dialogue\.turns\) && dialogue\.turns\.length > 0/);
  assert.match(source, /下一句/);
  assert.match(source, /上一句/);
  assert.match(source, /turn\.portrait/);
  assert.match(source, /after\?\.\(\)/);
});
