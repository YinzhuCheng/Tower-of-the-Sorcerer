import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the game-level shortcut router owns movement and renderers ignore already-routed keys', async () => {
  const [main, canvas, phaser] = await Promise.all([
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/game/anime-canvas-scene.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/game/scene.js', import.meta.url), 'utf8')
  ]);

  assert.match(main, /const KEYBOARD_DIRECTIONS = Object\.freeze/);
  assert.match(main, /const direction = KEYBOARD_DIRECTIONS\[key\];[\s\S]*?scene\?\.move\(direction\)/);
  assert.match(main, /elements\.galRoot\.classList\.contains\('hidden'\)[\s\S]*?KEYBOARD_DIRECTIONS\[key\]/);
  assert.match(canvas, /handleKeydown\(event\) \{[\s\S]*?if \(event\.defaultPrevented\) return;/);
  assert.match(phaser, /this\.input\.keyboard\.on\('keydown', \(event\) => \{[\s\S]*?if \(event\.defaultPrevented\) return;/);
});
