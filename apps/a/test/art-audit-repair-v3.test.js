import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { dialoguePresentation, portraitUrl } from '../src/game/anime-portraits.js';

const ROOT = new URL('../', import.meta.url);

test('identity notes resolve to the requested runtime sources', async () => {
  assert.match(portraitUrl('hero'), /liyue-avatar-embers-cel\.webp/);
  assert.match(portraitUrl('echo_regent'), /echo-regent-avatar-grave\.webp/);
  assert.match(portraitUrl('arcane_sovereign'), /arcane-sovereign-avatar-regret\.webp/);
  assert.match(portraitUrl('act3_archive_warden'), /archive-warden-avatar-duty\.webp/);
  assert.match(dialoguePresentation('whale_boss', 'lament').avatar, /whale-boss-avatar-lament-audit-v3\.webp/);
  assert.match(dialoguePresentation('dragon_boss', 'embers').avatar, /dragon-boss-avatar-embers-audit-v3\.webp/);
  assert.match(dialoguePresentation('sword_boss', 'stern').stage, /sword-boss-stern-b2\.webp/);
  assert.match(dialoguePresentation('palace_warden_v2', 'duty').stage, /palace-warden-duty-b2\.webp/);
  assert.match(dialoguePresentation('black_seal_keeper_v2', 'watchful').stage, /black-seal-keeper-watchful-b2\.webp/);
  assert.match(dialoguePresentation('act3_last_custodian', 'grave').stage, /last-custodian-release-b2\.webp/);
  const mapManifest = JSON.parse(await readFile(new URL('public/assets/anime/map/manifest.json', ROOT), 'utf8'));
  const enemyManifest = JSON.parse(await readFile(new URL('public/assets/anime/enemies/manifest.json', ROOT), 'utf8'));
  assert.equal(mapManifest.atlases.heroPortraitV4.file, 'atlases/runtime/hero-portrait-v4.webp');
  const heroMapPortrait = await readFile(new URL('public/assets/anime/map/atlases/runtime/hero-portrait-v4.webp', ROOT));
  assert.ok(heroMapPortrait.includes(Buffer.from('ALPH')) || heroMapPortrait.includes(Buffer.from('VP8L')));
  assert.equal(enemyManifest.assets.shadow_boss.file, 'enemies/canonical-gal-20260930/shadow-boss-map.webp');
});

