import test from 'node:test';
import assert from 'node:assert/strict';
import { legacyAnimeFallbackUrl, loadAnimeAsset } from '../src/game/anime-assets.js';

test('legacy anime fallback is a deterministic inline image for every supported sheet', () => {
  for (const name of ['portraits', 'chibi', 'items', 'tiles']) {
    const url = legacyAnimeFallbackUrl(name);
    assert.match(url, /^data:image\/svg\+xml;charset=utf-8,/);
    assert.equal(url, legacyAnimeFallbackUrl(name));
  }
});

test('missing legacy b64 sheet resolves to fallback instead of rejecting module preload', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 404 });
  try {
    const url = await loadAnimeAsset('portraits');
    assert.match(url, /^data:image\/svg\+xml;charset=utf-8,/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
