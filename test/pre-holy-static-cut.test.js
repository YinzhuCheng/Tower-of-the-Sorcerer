import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DELAYED_HOLY_POLICIES,
  PRE_HOLY_STATIC_CUT_MODEL,
  optimisticBossAdjacencyReachability,
  provePreHolyCore6StaticCut,
  staticCutAppliesToHolyPolicy
} from '../src/analyzer/pre-holy-static-cut.js';

test('canonical F6 proves a STATIC_CUT for every core6-or-later Holy policy', () => {
  const proof = provePreHolyCore6StaticCut();
  assert.equal(proof.type, 'STATIC_CUT');
  assert.equal(proof.model, PRE_HOLY_STATIC_CUT_MODEL);
  assert.equal(proof.proven, true);
  assert.equal(proof.strictRelaxation.reachable, false);
  assert.equal(typeof proof.certificateHash, 'string');
  assert.ok(proof.certificateHash.length > 0);
  assert.deepEqual(proof.appliesToPolicies, [...DELAYED_HOLY_POLICIES]);
  for (const policy of DELAYED_HOLY_POLICIES) {
    assert.equal(staticCutAppliesToHolyPolicy(policy, proof), true, policy);
  }
  assert.equal(staticCutAppliesToHolyPolicy('immediate', proof), false);
});

test('canonical cut is explained by Holy on the left and boss-locked U on the right', () => {
  const proof = provePreHolyCore6StaticCut();
  assert.equal(proof.minimalityWitnesses.allowHoly.reachable, true);
  assert.equal(proof.minimalityWitnesses.unlockUpperStair.reachable, true);

  const reasons = new Set(proof.strictRelaxation.blockedSpecialCells.map((cell) => cell.reason));
  assert.ok(reasons.has('policy_forbidden_holy_before_core6'));
  assert.ok(reasons.has('boss_locked_upper_stair_before_boss_defeat'));

  const holyPath = proof.minimalityWitnesses.allowHoly.path;
  const stairPath = proof.minimalityWitnesses.unlockUpperStair.path;
  assert.ok(Array.isArray(holyPath) && holyPath.length > 1);
  assert.ok(Array.isArray(stairPath) && stairPath.length > 1);
});

test('optimistic relaxation refuses to prove a cut when a free side route exists', () => {
  const map = [
    ['#', '#', '#', '#', '#', '#'],
    ['#', '.', '.', '.', 'enemy:astralBoss', '#'],
    ['#', '.', '#', '.', 'U', '#'],
    ['#', 'D', 'item:holy', '.', '.', '#'],
    ['#', '#', '#', '#', '#', '#']
  ];
  const result = optimisticBossAdjacencyReachability({
    map,
    allowForbiddenItem: false,
    lockUpperStair: true
  });
  assert.equal(result.reachable, true);
  assert.ok(Array.isArray(result.path));
});

test('optimistic relaxation deliberately ignores enemies, doors and puzzle blockers', () => {
  const map = [
    ['#', '#', '#', '#', '#', '#', '#'],
    ['#', 'D', 'enemy:mote', 'door:star', 'gate:mirror', '.', '#'],
    ['#', '#', '#', '#', '#', 'enemy:astralBoss', '#'],
    ['#', 'item:holy', '.', '.', '.', 'U', '#'],
    ['#', '#', '#', '#', '#', '#', '#']
  ];
  const result = optimisticBossAdjacencyReachability({
    map,
    allowForbiddenItem: false,
    lockUpperStair: true
  });
  assert.equal(result.reachable, true);
});
