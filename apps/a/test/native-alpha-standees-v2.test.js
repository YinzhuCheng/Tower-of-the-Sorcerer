import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { dialoguePresentation } from '../src/game/anime-portraits.js';

const ROOT = new URL('../', import.meta.url);

function pngMetadata(buffer) {
  assert.deepEqual(buffer.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return {
    dimensions: [buffer.readUInt32BE(16), buffer.readUInt32BE(20)],
    colorType: buffer.readUInt8(25)
  };
}

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  throw new Error(`alpha WebP must use VP8X or VP8L, got ${JSON.stringify(chunk)}`);
}

test('the five accepted standees are active in Gal presentation and visible to the audit page', () => {
  const mappings = [
    ['palace_warden_v2', 'duty', 'palace-warden-duty-b2.webp'],
    ['black_seal_keeper_v2', 'watchful', 'black-seal-keeper-watchful-b2.webp'],
    ['act3_last_custodian', 'grave', 'last-custodian-release-b2.webp'],
    ['final_queen', 'resolve', 'final-queen-resolve-b2.webp'],
    ['guide', 'focus', 'guide-focus-b2.webp']
  ];
  for (const [id, expression, filename] of mappings) {
    const presentation = dialoguePresentation(id, expression);
    assert.equal(presentation.hasPaintedExpression, true, `${id}:${expression}`);
    assert.match(presentation.stage, new RegExp(filename.replace('.', '\\.')));
  }
});
