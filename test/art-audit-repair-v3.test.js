import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { AUDIT_VERSION, CG_SCENES } from '../public/art-audit/registry.js';
import { dialoguePresentation, portraitUrl } from '../src/game/anime-portraits.js';

const ROOT = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/art-audit-repair-v3-manifest.json', ROOT), 'utf8'));

test('audit repair v3 keeps transparent standees and publishes every revised binary', async () => {
  assert.equal(manifest.auditVersion, '2026-09-04-art-audit-repair-v3');
  assert.equal(manifest.standees.length, 4);
  assert.equal(manifest.avatars.length, 2);
  assert.equal(manifest.cgs.length, 12);
  for (const asset of [...manifest.standees, ...manifest.avatars, ...manifest.mapUnits, ...manifest.cgs]) {
    await access(new URL(asset.runtime, ROOT));
    assert.match(asset.sha256, /^[a-f0-9]{64}$/);
  }
  for (const asset of manifest.standees) {
    assert.equal(asset.alphaRequired, true);
    assert.ok(asset.alphaMin < 255, `${asset.id} must preserve transparency`);
    await access(new URL(asset.source, ROOT));
  }
});

test('identity notes resolve to the requested runtime sources', async () => {
  assert.match(portraitUrl('hero'), /liyue-avatar-embers-cel\.webp/);
  assert.match(portraitUrl('echo_regent'), /echo-regent-dialogue-grave\.webp/);
  assert.match(portraitUrl('arcane_sovereign'), /arcane-sovereign-dialogue-regret\.webp/);
  assert.match(portraitUrl('act3_archive_warden'), /archive-warden-dialogue-duty\.webp/);
  assert.match(dialoguePresentation('whale_boss', 'lament').avatar, /whale-boss-avatar-lament-audit-v3\.webp/);
  assert.match(dialoguePresentation('dragon_boss', 'embers').avatar, /dragon-boss-avatar-embers-audit-v3\.webp/);
  assert.match(dialoguePresentation('sword_boss', 'stern').stage, /serena-dialogue-stern-audit-v3\.webp/);
  assert.match(dialoguePresentation('palace_warden_v2', 'duty').stage, /vela-dialogue-duty-audit-v3\.webp/);
  assert.match(dialoguePresentation('black_seal_keeper_v2', 'watchful').stage, /seph-dialogue-watchful-audit-v3\.webp/);
  assert.match(dialoguePresentation('act3_last_custodian', 'grave').stage, /last-custodian-dialogue-release-audit-v3\.webp/);
  const mapManifest = JSON.parse(await readFile(new URL('public/assets/anime/map/manifest.json', ROOT), 'utf8'));
  const enemyManifest = JSON.parse(await readFile(new URL('public/assets/anime/enemies/manifest.json', ROOT), 'utf8'));
  assert.equal(mapManifest.atlases.heroPortraitV4.file, 'atlases/runtime/hero-portrait-v4.webp');
  const heroMapPortrait = await readFile(new URL('public/assets/anime/map/atlases/runtime/hero-portrait-v4.webp', ROOT));
  assert.ok(heroMapPortrait.includes(Buffer.from('ALPH')) || heroMapPortrait.includes(Buffer.from('VP8L')));
  assert.equal(enemyManifest.assets.shadow_boss.file, 'enemies/v3/shadow-boss-map-audit-v3.webp');
});

test('all twelve reviewed CG records use cache-busted audit-v3 binaries', () => {
  assert.equal(AUDIT_VERSION, '2026-09-04-art-audit-repair-v3');
  const ids = new Set(manifest.cgs.map(({ id }) => id));
  const revised = CG_SCENES.filter(({ id }) => ids.has(id));
  assert.equal(revised.length, 12);
  for (const scene of revised) assert.match(scene.path, /-audit-v3\.webp$/);
});
