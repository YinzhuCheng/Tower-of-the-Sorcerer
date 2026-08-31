import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('dedicated enemy identities and visual semantics cannot silently fall back to reused art', async () => {
  const [actOne, actTwoTopology, actThree, scene, manifest] = await Promise.all([
    readFile(join(root, 'src/game/demo-10-floor-content.js'), 'utf8'),
    readFile(join(root, 'src/game/demo-20-floor-progression-topology.js'), 'utf8'),
    readFile(join(root, 'src/game/demo-30-floor-content.js'), 'utf8'),
    readFile(join(root, 'src/game/canvas-scene.js'), 'utf8'),
    readFile(join(root, 'public/assets/anime/enemies/manifest.json'), 'utf8')
  ]);

  assert.match(actOne, /palaceWarden:[\s\S]{0,180}portrait: 'palace_warden_v2'/);
  assert.match(actOne, /blackSealKeeper:[\s\S]{0,180}portrait: 'black_seal_keeper_v2'/);
  assert.match(actTwoTopology, /arcaneGatekeeper:[\s\S]{0,180}portrait: 'arcane_gatekeeper'/);

  for (const key of [
    'act3_shelter_warden', 'act3_relay_runner', 'act3_ledger_mage', 'act3_shelf_warden',
    'act3_triage_knight', 'act3_index_beast', 'act3_last_custodian'
  ]) assert.match(actThree, new RegExp(`: '${key}'`), `${key} must be assigned by Act III`);
  assert.doesNotMatch(actThree, /shelterWarden: 'crown_blade'|relayRunner: 'mirror_huntress'|ledgerMage: 'resonance_cantor'|shelfWarden: 'spectrum_marshal'|triageKnight: 'mirror_duelist'|indexBeast: 'void_herald'|lastCustodian: 'crown_magus'/);

  for (const key of ['void_core', 'echo_regent', 'arcane_sovereign', 'palace_warden_v2', 'black_seal_keeper_v2']) {
    assert.match(manifest, new RegExp(`"${key}"`), `${key} must resolve to a map sprite`);
  }

  assert.match(scene, /tideA: 'switch-tide'/);
  assert.match(scene, /forge: 'switch-forge'/);
  assert.match(scene, /emberA: 'switch-ember'/);
  assert.match(scene, /hushA: 'switch-hush'/);
  assert.match(scene, /function cardCostForGate/);
  assert.match(scene, /seal-charter-archive/);
  assert.match(scene, /seal-protocol/);
  assert.match(scene, /ITEM_PIPELINE_ASSET/);
  assert.match(scene, /manaFlask: \{ asset: 'mana-flask'/);
  assert.match(scene, /compass: \{ asset: 'moon-compass'/);
  assert.match(scene, /codex: \{ asset: 'astral-codex'/);
  assert.match(scene, /holy: \{ asset: 'holy-elixir'/);
  assert.match(scene, /drawDualResource/);
});
