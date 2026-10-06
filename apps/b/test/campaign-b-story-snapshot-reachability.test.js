import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { createForestCampaign } from '../src/campaigns/b/content.js';
import { buildForestWitness, createForestWalker } from '../src/campaigns/b/witness.js';
import { createForestStory, FOREST_STORY_CONTENT as C } from '../src/campaigns/b/story/index.js';
import { NEW_OPENING_REVISION } from '../src/campaigns/b/story/opening-revision.js';
import { FOREST_STORY_SOURCE_HASH, readForestTurnSnapshot, forestRouteVisualState } from '../src/campaigns/b/story/state-snapshot.js';
import { certifyCampaignActions, replayCampaignCertificate } from '../src/solver/campaign-replay.js';

const sha = text => createHash('sha256').update(text).digest('hex');
const runtime = createForestCampaign();
const sites = ['07', '16', '21', '24'];
const routeKeys = ['originalCleared', 'originalWorksDone', 'rootFixed', 'rootWorksDone'];
const allReady = Object.fromEntries(routeKeys.map(key => [key, true]));
const sidecar = JSON.parse(readFileSync(new URL('./fixtures/b-story-snapshot-reachability-sidecar.json', import.meta.url)));
const certificateDirectory = new URL('../artifacts/campaigns/', import.meta.url);

function assertSnapshot(turn, scene, state) {
  const snapshot = turn.storySnapshot;
  const authored = C.scenes[scene.sceneId].turns.find(source => source.id === turn.id);
  assert.ok(authored, `Authored turn ${turn.id}`);
  assert.ok(snapshot, `Missing snapshot on ${turn.id}`);
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.origin, 'runtime-resolve');
  assert.equal(snapshot.revision, state.revision, turn.id);
  assert.equal(snapshot.stateHash, runtime.stateHash(state), turn.id);
  assert.equal(snapshot.storyVersion, C.id);
  assert.equal(snapshot.openingRevision, NEW_OPENING_REVISION);
  assert.equal(snapshot.sourceHash, FOREST_STORY_SOURCE_HASH);
  assert.equal(snapshot.sceneId, scene.sceneId);
  assert.equal(snapshot.turnId, turn.id);
  assert.equal(snapshot.sourceLine, turn.sourceLine);
  assert.equal(snapshot.branch, turn.branch);
  assert.equal(snapshot.phase, turn.phase ?? null);
  assert.equal(snapshot.authoredTextSha256, sha(authored.text), turn.id);
  assert.equal(snapshot.resolvedTextSha256, sha(turn.text), turn.id);
  assert.equal(snapshot.adaptationId, turn.boundaryAdaptation?.id ?? null);
  assert.deepEqual(Object.keys(snapshot.routes).sort(), sites);
  for (const site of sites) {
    assert.deepEqual(snapshot.routes[site], Object.fromEntries(routeKeys.map(key => [key, state.flags[`b${site}.${key}`] === true])));
    assert.equal(Object.isFrozen(snapshot.routes[site]), true);
  }
  assert.deepEqual(snapshot.warm, {
    greenhouse: state.flags['b.warm.greenhouse'] === true,
    pear: state.flags['b.warm.pear'] === true,
    lodge: state.flags['b.warm.lodge'] === true,
    frozen: state.flags['b26.heatPlanFrozen'] === true,
  });
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.routes), true);
  assert.equal(Object.isFrozen(snapshot.warm), true);
  assert.deepEqual(readForestTurnSnapshot(turn, { sceneId: scene.sceneId }), snapshot);
}

// Every narrative witness in this file comes from real initial-state dispatches,
// their receipts and location catch-up. No branch-forced resolve is reachability evidence.
function observe(story, state, action, seenIds = []) {
  const beforeBytes = runtime.serialize(state);
  const result = runtime.dispatch(state, action);
  assert.equal(result.ok, true, `${JSON.stringify(action)}: ${result.reason}`);
  const afterBytes = runtime.serialize(result.state);
  const narration = story.fromDispatch({
    stateBefore: state, stateAfter: result.state,
    events: result.events, receipt: result.receipt, seenIds,
  });
  assert.equal(runtime.serialize(state), beforeBytes);
  assert.equal(runtime.serialize(result.state), afterBytes);
  assert.deepEqual(narration.narrativeConflicts, []);
  assert.equal(new Set(narration.seenIds).size, narration.seenIds.length);
  for (const scene of narration.scenes) for (const turn of scene.turns) {
    assert.equal(seenIds.includes(turn.id), false, `Historical turn re-emitted: ${turn.id}`);
    const hash = turn.storySnapshot?.stateHash;
    assert.ok(hash === result.receipt.before || hash === result.receipt.after, `Unrelated state on ${turn.id}`);
    assertSnapshot(turn, scene, hash === result.receipt.before ? state : result.state);
  }
  return { before: state, state: result.state, action, result, narration };
}

function replayWithStory(certificate, { requireGoal = true } = {}) {
  const certificateBytes = JSON.stringify(certificate);
  assert.equal(replayCampaignCertificate(runtime, certificate, { requireGoal }).ok, true);
  const story = createForestStory(runtime);
  let state = runtime.initialState();
  const opening = story.location(state);
  for (const scene of opening.scenes) for (const turn of scene.turns) assertSnapshot(turn, scene, state);
  let seenIds = opening.seenIds;
  const rows = [];
  for (const step of certificate.steps) {
    assert.equal(runtime.stateHash(state), step.before);
    const row = observe(story, state, step.action, seenIds);
    assert.equal(runtime.stateHash(row.state), step.after);
    assert.deepEqual(row.result.events, step.events);
    state = row.state;
    seenIds = row.narration.seenIds;
    rows.push(row);
  }
  assert.deepEqual(state, certificate.final);
  assert.equal(JSON.stringify(certificate), certificateBytes);
  return { story, state, seenIds, rows };
}

function makeBothRoute(site, order) {
  const base = `b${site}`;
  const prefix = buildForestWitness({ runtime, stopBefore: `${base}.originalEnemy` });
  const walker = createForestWalker(runtime, prefix.state);
  const suffixes = order === 'original-then-root'
    ? ['originalEnemy', 'originalWorks', 'fixRoot', 'rootWorks']
    : ['fixRoot', 'rootWorks', 'originalEnemy', 'originalWorks'];
  for (const suffix of suffixes) walker.interact(`${base}.${suffix}`);
  if (site === '24') walker.interact('b24.retrieveHandrail');
  const certified = certifyCampaignActions(runtime, [...prefix.actions, ...walker.actions], {
    source: 'story-snapshot-reachability-test-v1', coverage: `both-${site}-${order}`, requireGoal: false,
  });
  assert.equal(certified.ok, true);
  return { certificate: certified.certificate, prefixLength: prefix.actions.length };
}

function summarizeRoute(site, order, certificate, rows, prefixLength) {
  return {
    site, order, claim: certificate.claim, certificateHash: certificate.certificateHash,
    initialStateHash: certificate.initialStateHash, finalStateHash: runtime.stateHash(certificate.final),
    stepCount: certificate.steps.length,
    interactions: rows.slice(prefixLength).filter(row => row.action.type === 'interact').map(row => ({
      entityId: row.action.entityId, before: row.result.receipt.before, after: row.result.receipt.after,
      scenes: row.narration.scenes.map(scene => ({
        sceneId: scene.sceneId, branch: scene.branch,
        turns: scene.turns.map(turn => ({
          turnId: turn.id, branch: turn.storySnapshot.branch, phase: turn.storySnapshot.phase,
          revision: turn.storySnapshot.revision, stateHash: turn.storySnapshot.stateHash,
          routeState: forestRouteVisualState(readForestTurnSnapshot(turn), site),
        })),
      })),
    })),
  };
}

test('B snapshots bind pre-battle/exit turns to before and committed work to after', () => {
  const story = createForestStory(runtime), witness = buildForestWitness({ runtime });
  for (const [entityId, preId, postId] of [
    ['b01.timberPuppet', 'b01_pre', 'b01_post'],
    ['b28.guardDrive', 'b28_pre', 'b28_post'],
  ]) {
    const step = witness.steps.find(row => row.action.entityId === entityId);
    const row = observe(story, step.before, step.action);
    for (const [sceneId, at] of [[preId, row.before], [postId, row.state]]) {
      const scene = row.narration.scenes.find(scene => scene.sceneId === sceneId);
      assert.ok(scene?.turns.length, sceneId);
      for (const turn of scene.turns) assertSnapshot(turn, scene, at);
    }
  }
  const exit = witness.steps.find(row => row.action.edgeId === 'b.edge.16-17');
  const row = observe(story, exit.before, exit.action);
  const scene = row.narration.scenes.find(scene => scene.sceneId === 'b16_exit');
  assert.ok(scene?.turns.length);
  for (const turn of scene.turns) assertSnapshot(turn, scene, row.before);

  for (const [entityId, sceneId, phase] of [
    ['b05.valve', 'b05_valve', 'valve'], ['b05.pipeWorks', 'b05_valve', 'pipeWorks'],
    ['b25.valve', 'b25_valve', 'valve'], ['b25.waterTest', 'b25_valve', 'waterTest'],
    ['b28.stopMainValve', 'b28_post', 'stopped'],
  ]) {
    const step = witness.steps.find(row => row.action.entityId === entityId);
    const row = observe(story, step.before, step.action);
    const scene = row.narration.scenes.find(scene => scene.sceneId === sceneId);
    assert.ok(scene.turns.some(turn => turn.phase === phase), `${entityId}: ${phase}`);
    for (const turn of scene.turns) assertSnapshot(turn, scene, row.state);
    if (phase === 'valve') assert.ok(scene.turns.every(turn => turn.phase === 'valve'));
  }
});

for (const site of sites) for (const order of ['original-then-root', 'root-then-original']) {
  test(`B${site} real ${order} route produces both facts without branch-forced reachability`, () => {
    const { certificate, prefixLength } = makeBothRoute(site, order);
    const replay = replayWithStory(certificate, { requireGoal: false });
    assert.deepEqual(Object.fromEntries(routeKeys.map(key => [key, replay.state.flags[`b${site}.${key}`]])), allReady);
    const summary = summarizeRoute(site, order, certificate, replay.rows, prefixLength);
    assert.deepEqual(summary, sidecar.cases.find(row => row.site === site && row.order === order));
    const interactions = replay.rows.slice(prefixLength).filter(row => row.action.type === 'interact');
    const finalInteraction = interactions.at(-1);
    const bothTurns = finalInteraction.narration.scenes.flatMap(scene => scene.turns)
      .filter(turn => forestRouteVisualState(readForestTurnSnapshot(turn), site) === 'both');
    assert.ok(bothTurns.length, `${site}/${order}: no actually emitted both turn`);
    for (const turn of bothTurns) assert.deepEqual(turn.storySnapshot.routes[site], allReady);

    if (site === '24') {
      assert.equal(finalInteraction.action.entityId, 'b24.retrieveHandrail');
      const route = finalInteraction.narration.scenes.find(scene => scene.sceneId === 'b24_route');
      assert.equal(route.branch, 'originalPost');
      assert.deepEqual(route.turns.map(turn => turn.id), ['b24_route.L1495', 'b24_route.L1497']);
      assert.ok(route.turns.every(turn => turn.branch === 'originalPost' && turn.phase === 'retrieved'));
      assert.ok(!interactions.flatMap(row => row.narration.scenes).flatMap(scene => scene.turns)
        .some(turn => turn.branch === 'root'), 'B24 completed-original history must not fabricate a root-branch both witness');
    } else if (order === 'original-then-root') {
      assert.ok(bothTurns.some(turn => turn.boundaryAdaptation?.id === 'B-EDGE-001'));
      assert.ok(bothTurns.some(turn => turn.storySnapshot.authoredTextSha256 !== turn.storySnapshot.resolvedTextSha256));
    }
  });
}

test('B historical seenIds preserve already emitted root snapshots after the original route becomes ready', () => {
  for (const site of sites) {
    const prefix = buildForestWitness({ runtime, stopBefore: `b${site}.originalEnemy` });
    const walker = createForestWalker(runtime, prefix.state);
    walker.interact(`b${site}.fixRoot`);
    walker.interact(`b${site}.rootWorks`);
    if (site === '24') walker.interact('b24.retrieveHandrail');
    const rootEnd = prefix.actions.length + walker.actions.length;
    walker.interact(`b${site}.originalEnemy`);
    walker.interact(`b${site}.originalWorks`);
    const { certificate } = certifyCampaignActions(runtime, [...prefix.actions, ...walker.actions], { requireGoal: false });
    const replay = replayWithStory(certificate, { requireGoal: false });
    const rootTurns = replay.rows.slice(prefix.actions.length, rootEnd).flatMap(row => row.narration.scenes)
      .flatMap(scene => scene.turns).filter(turn => turn.branch === 'root');
    assert.ok(rootTurns.length, `B${site}: root route was never actually narrated`);
    const historyBytes = JSON.stringify(rootTurns);
    for (const turn of rootTurns) {
      assert.equal(turn.storySnapshot.routes[site].originalCleared, false);
      assert.equal(turn.storySnapshot.routes[site].originalWorksDone, false);
      assert.equal(turn.storySnapshot.adaptationId, null);
      assert.equal(turn.storySnapshot.authoredTextSha256, turn.storySnapshot.resolvedTextSha256);
    }
    const laterIds = replay.rows.slice(rootEnd).flatMap(row => row.narration.scenes).flatMap(scene => scene.turns).map(turn => turn.id);
    assert.ok(rootTurns.every(turn => !laterIds.includes(turn.id)), 'No retroactive root-line adaptation/re-emission');
    const restoredSeen = JSON.parse(JSON.stringify(replay.seenIds));
    const catchup = replay.story.location(replay.state, { seenIds: [...restoredSeen, ...restoredSeen] });
    assert.equal(new Set(catchup.seenIds).size, catchup.seenIds.length);
    assert.deepEqual(catchup.seenIds, restoredSeen);
    assert.deepEqual(catchup.scenes, []);
    assert.equal(JSON.stringify(rootTurns), historyBytes);
    assert.deepEqual(Object.fromEntries(routeKeys.map(key => [key, replay.state.flags[`b${site}.${key}`]])), allReady);
  }
});

test('B all 16 frozen gameplay certificates retain exact replay while story snapshots form a separate read-only trace', t => {
  const files = readdirSync(certificateDirectory).filter(file => /^b-normal-.*\.certificate\.json$/.test(file)).sort();
  assert.equal(files.length, 16);
  let turns = 0, beforeTurns = 0, afterTurns = 0, bothTurns = 0;
  const warmMasks = new Set();
  for (const file of files) {
    const url = new URL(file, certificateDirectory), bytes = readFileSync(url);
    const certificate = JSON.parse(bytes);
    const replay = replayWithStory(certificate);
    assert.equal(replay.state.victory, true, file);
    for (const row of replay.rows) for (const scene of row.narration.scenes) for (const turn of scene.turns) {
      turns++;
      if (turn.storySnapshot.stateHash === row.result.receipt.before) beforeTurns++;
      else afterTurns++;
      if (sites.some(site => forestRouteVisualState(readForestTurnSnapshot(turn), site) === 'both')) bothTurns++;
      if (turn.storySnapshot.warm.frozen) warmMasks.add(['greenhouse', 'pear', 'lodge'].filter(key => turn.storySnapshot.warm[key]).join('+'));
    }
    assert.equal(sha(readFileSync(url)), sha(bytes), `${file}: certificate bytes changed`);
    assert.equal(replayCampaignCertificate(runtime, certificate).ok, true, file);
  }
  assert.ok(turns > 1000);
  assert.ok(beforeTurns > 0 && afterTurns > 0);
  assert.ok(bothTurns > 0, 'Frozen bypass-revisit certificate emits both facts');
  for (const mask of ['greenhouse+lodge', 'greenhouse+pear', 'pear+lodge']) assert.ok(warmMasks.has(mask), mask);
  t.diagnostic(`16 unchanged certificates; ${turns} dispatch-bound snapshots (${beforeTurns} before, ${afterTurns} after), ${bothTurns} both-fact snapshots`);
});

