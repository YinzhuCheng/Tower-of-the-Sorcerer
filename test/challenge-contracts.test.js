import test from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
applyDemoTwentyFloorContent({ enemies: ENEMIES, floors: FLOORS, items: ITEMS, dialogues: DIALOGUES });

const { createInitialState, resolveWarCouncil, serializeState } = await import('../src/game/engine.js');
const {
  getChallengeContractBriefing,
  previewChallengeContract,
  selectChallengeContract
} = await import('../src/game/challenge-contracts.js');
const { enumerateWarCouncilPlans } = await import('../src/game/war-council.js');
const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');

function preparedCouncilState() {
  const state = createInitialState();
  for (const enemyId of ['catBoss', 'whaleBoss', 'dragonBoss', 'shadowBoss']) {
    state.floorStates[ENEMIES[enemyId].floor - 1].defeatedBossIds.push(enemyId);
  }
  state.floor = 19;
  state.x = 5;
  state.y = 6;
  return state;
}

test('witness contracts expose their exact public council windows without modifying state', () => {
  const state = preparedCouncilState();
  const before = serializeState(state);
  const briefing = getChallengeContractBriefing(state);

  assert.equal(briefing.free, true);
  assert.equal(briefing.entries.length, 3);
  assert.equal(briefing.entries[0].totalWinningPlanCount, 22);
  assert.deepEqual(
    Object.fromEntries(briefing.entries.map((entry) => [entry.allyId, entry.matchingPlanCount])),
    { yanli: 12, lanin: 5, yayu: 5 }
  );
  assert.equal(serializeState(state), before, 'reading contract facts must not become a paid scouting action');
});

test('signing a witness contract costs no combat resource and locks only its own replay record', () => {
  const state = createInitialState();
  state.floor = 10;
  state.stats = { hp: 3456, maxHp: 3456, atk: 123, def: 87, gold: 91 };
  state.cards = { sun: 3, moon: 4, star: 5 };
  state.magic = { unlocked: true, mp: 77, maxMp: 120, tier: 2 };
  const resources = JSON.parse(JSON.stringify({ stats: state.stats, cards: state.cards, magic: state.magic, turns: state.turns }));

  const signed = selectChallengeContract(state, 'red-witness');
  assert.equal(signed.ok, true);
  assert.equal(state.challenge.selectedId, 'red-witness');
  assert.deepEqual({ stats: state.stats, cards: state.cards, magic: state.magic, turns: state.turns }, resources);
  assert.equal(selectChallengeContract(state, 'tide-witness').ok, false, 'a signed challenge is not switchable after route information is known');

  const early = createInitialState();
  assert.match(selectChallengeContract(early, 'red-witness').reason, /第十一阵/);
});

test('the authoritative council records a completed or missed witness contract without blocking the run', () => {
  const completed = preparedCouncilState();
  completed.alliance.bonds.yanli = true;
  assert.equal(selectChallengeContract(completed, 'red-witness').ok, true);
  const redPlan = enumerateWarCouncilPlans(completed, { winningOnly: true })
    .find((report) => report.survivors.some((unit) => unit.id === 'yanli'))?.plan;
  assert.ok(redPlan);
  const preview = previewChallengeContract(completed, enumerateWarCouncilPlans(completed, { winningOnly: true })
    .find((report) => report.survivors.some((unit) => unit.id === 'yanli')));
  assert.equal(preview.status, 'would-complete');
  const result = resolveWarCouncil(completed, redPlan);
  assert.equal(result.ok, true);
  assert.equal(result.challenge.result.status, 'completed');
  assert.deepEqual(completed.challenge.result.missing, []);

  const missed = preparedCouncilState();
  assert.equal(selectChallengeContract(missed, 'tide-witness').ok, true);
  const ordinaryPlan = enumerateWarCouncilPlans(missed, { winningOnly: true })
    .find((report) => report.survivors.some((unit) => unit.id === 'yanli'))?.plan;
  const missedResult = resolveWarCouncil(missed, ordinaryPlan);
  assert.equal(missedResult.ok, true, 'a missed optional challenge must never make the council or campaign fail');
  assert.equal(missed.challenge.result.status, 'missed');
  assert.match(missed.challenge.result.missing.join(' '), /潮汐导管/);
  assert.match(missed.challenge.result.missing.join(' '), /澜音/);
});

test('solver state keeps the signed contract and its outcome distinct across compact replay states', () => {
  const state = preparedCouncilState();
  state.alliance.bonds.yayu = true;
  assert.equal(selectChallengeContract(state, 'shadow-witness').ok, true);
  const plan = enumerateWarCouncilPlans(state, { winningOnly: true })
    .find((report) => report.survivors.some((unit) => unit.id === 'yayu'))?.plan;
  assert.ok(plan);
  assert.equal(resolveWarCouncil(state, plan).ok, true);

  const adapter = createTowerAdapter();
  const compact = adapter.compactState(state);
  const restored = adapter.materializeState(compact);
  assert.deepEqual(restored.challenge, state.challenge);

  const withoutContract = adapter.cloneState(compact);
  withoutContract.challenge = { selectedId: null, result: null };
  assert.notEqual(adapter.structuralKey(compact), adapter.structuralKey(withoutContract));
});
