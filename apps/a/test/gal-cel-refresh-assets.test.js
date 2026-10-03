import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8 ') {
    assert.equal(buffer.subarray(23, 26).toString('hex'), '9d012a');
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    assert.equal(buffer[20], 0x2f);
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
  }
  throw new Error(`unsupported WebP chunk ${JSON.stringify(chunk)}`);
}

test('event CG turns suppress standing sprites while ordinary turns retain the actor layer', async () => {
  const [main, css] = await Promise.all([
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../ui-v10-cinematics.css', import.meta.url), 'utf8')
  ]);

  assert.match(main, /gal-dialogue \$\{isNarration \? 'is-narration' : ''\} \$\{cg \? 'has-cg' : ''\}/);
  assert.match(main, /\$\{cg \? `<div class="gal-cg"/);
  assert.match(css, /\.gal-dialogue\.has-cg \.gal-actor[^\{]*\{display:none\}/);
  assert.doesNotMatch(css, /\.gal-dialogue\.has-cg \.gal-portrait[^\{]*\{display:none\}/);
});

test('an explicit production QA query can open any authored GAL scene without marking story progress', async () => {
  const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

  assert.match(main, /PREVIEW_DIALOGUE = BOOT_PARAMS\.get\('gal-preview'\)/);
  assert.match(main, /dialogueId && getDialogue\(dialogueId\) \? dialogueId : null/);
  assert.match(main, /if \(!PRESENTATION_ONLY && difficultySession\.mode === 'new'\) await autoSave\(\)/);
  assert.match(main, /previewDialogueId\s*\? \(showDialogue\(previewDialogueId, previewAfter\), true\)\s*: difficultySession\?\.mode === 'continue' \? false : initialGalDialogue\(releaseIntoTower\)/);
});
