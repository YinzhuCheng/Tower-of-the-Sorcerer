import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
test('all shipped runtime payloads match the frozen core inventory', async () => {
  const contract = JSON.parse(await readFile(new URL('test/fixtures/runtime-art-contract.json', root)));
  assert.ok(contract.files.length > 200);
  const expected = new Set(contract.files.map(item => item.path));
  for (const entry of contract.files) {
    const bytes = await readFile(new URL(entry.path, root));
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
  }
  const files = await readdir(new URL('public/assets/', root), {recursive:true, withFileTypes:true});
  assert.equal(files.filter(item => item.isFile()).length, expected.size, 'no untracked payloads');
});
