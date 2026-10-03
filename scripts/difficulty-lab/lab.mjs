// Offline numeric screening only. Never imported by a shipped application.
import assert from 'node:assert/strict';

export const POLICY = Object.freeze({
  b: Object.freeze({campaignId:'forest-b', contentHash:'a12cd07ee1ccc762',
    enemyIds:Object.freeze(['b05.sluicePuppet','b06.sawPuppet','b09.foundationRig','b11.returnPuppet','b15.cablePuppet'])}),
  c: Object.freeze({campaignId:'voyage-c', contentHash:'c5a5f809d5548f36',
    enemyIds:Object.freeze(['c.machine1','c.machine2'])})
});
export const DELTAS = Object.freeze([-2,-1,0,1,2]);
export const probeId = delta => delta === 0 ? 'normal' : `probe-atk-${delta < 0 ? 'minus' : 'plus'}${Math.abs(delta)}`;

// Compare every property except the exact permitted numeric edits and namespace.
export function assertLocked(base, candidate, policy, delta) {
  assert.ok(DELTAS.includes(delta), 'Unreviewed numeric delta');
  const restored = structuredClone(candidate);
  assert.equal(candidate.difficulty, delta === 0 ? base.difficulty : probeId(delta));
  assert.equal(candidate.version, delta === 0 ? base.version : `${base.version}/numeric-probe-r1/${probeId(delta)}`);
  restored.difficulty = base.difficulty;
  restored.version = base.version;
  for (const id of policy.enemyIds) {
    const original = base.regions.flatMap(r => r.entities).find(e => e.id === id);
    const changed = restored.regions.flatMap(r => r.entities).find(e => e.id === id);
    assert.ok(original && changed, `Missing reviewed enemy ${id}`);
    assert.equal(original.kind, 'enemy');
    assert.equal(changed.enemy.atk, original.enemy.atk + delta);
    assert.ok(Number.isSafeInteger(changed.enemy.atk) && changed.enemy.atk >= 0);
    changed.enemy.atk = original.enemy.atk;
  }
  assert.deepEqual(restored, base, 'Numeric probe changed locked content');
}

export function makeProbe({base, createCampaign, candidate, delta}) {
  const policy = POLICY[candidate];
  assert.ok(policy, 'Only existing B/C campaigns are supported');
  assert.ok(DELTAS.includes(delta), 'Unreviewed numeric delta');
  const identity = createCampaign(base).identity;
  assert.equal(identity.campaignId, policy.campaignId, 'Campaign drift');
  assert.equal(identity.contentHash, policy.contentHash, 'Baseline content drift; review policy first');
  const spec = structuredClone(base);
  for (const region of spec.regions) for (const entity of region.entities) {
    if (policy.enemyIds.includes(entity.id)) entity.enemy.atk += delta;
  }
  if (delta !== 0) {
    spec.difficulty = probeId(delta);
    spec.version = `${base.version}/numeric-probe-r1/${probeId(delta)}`;
  }
  assertLocked(base, spec, policy, delta);
  return createCampaign(spec);
}

export function measureActions(runtime, actions) {
  let state = runtime.initialState(), minimumHpFraction = state.stats.hp / state.stats.maxHp;
  let totalBattleDamage = 0, battles = 0;
  for (const [index,action] of actions.entries()) {
    const result = runtime.dispatch(state, action);
    if (!result.ok) return {ok:false, failedAt:index, failedAction:action, reason:result.reason,
      completedActions:index, minimumHpFraction, hpBeforeFailure:state.stats.hp};
    state = result.state;
    minimumHpFraction = Math.min(minimumHpFraction, state.stats.hp / state.stats.maxHp);
    for (const event of result.events) if (event.type === 'battle') {
      battles++; totalBattleDamage += event.battle.totalDamage;
    }
  }
  return {ok:state.victory, actions:actions.length, finalHp:state.stats.hp, maxHp:state.stats.maxHp,
    minimumHpFraction, battles, totalBattleDamage, finalResources:state.resources,
    finalStateHash:runtime.stateHash(state), claim:'this action sequence reaches the goal; no optimality claim'};
}

export function certifyAndReplay(runtime, actions, replayApi, source) {
  const result = replayApi.certifyCampaignActions(runtime, actions, {source, coverage:'existence-only'});
  assert.equal(result.ok, true, result.reason);
  const replay = replayApi.replayCampaignCertificate(runtime, result.certificate);
  assert.equal(replay.ok, true, replay.reason);
  return result.certificate;
}

export function summarizeCorpus(rows) {
  const wins = rows.filter(row => row.ok);
  const zeroWedge = rows.filter(row => row.file?.includes('zero-wedge'));
  return {routes:rows.length, wins:wins.length, failures:rows.length-wins.length,
    allKnownRoutesSurvive:wins.length === rows.length,
    zeroWedgeRoutes:zeroWedge.length,
    zeroWedgeRoutesSurvive:zeroWedge.length ? zeroWedge.every(row => row.ok) : null,
    minimumWinningHpFraction:wins.length ? Math.min(...wins.map(row => row.minimumHpFraction)) : null,
    maximumWinningHpFraction:wins.length ? Math.max(...wins.map(row => row.minimumHpFraction)) : null,
    coverage:'frozen known-route corpus; a failed replay is not proof of unsolvability'};
}
