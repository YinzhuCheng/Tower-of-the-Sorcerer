import test from 'node:test';
import assert from 'node:assert/strict';
import {
  schedulePreHolyBoundarySeeds,
  scorePreHolyBoundarySeed
} from '../src/analyzer/pre-holy-seed-scheduler.js';

function seed(id, resources, { verified = true, shopPurchases = 2 } = {}) {
  return {
    verified,
    resources: {
      hp: 1000,
      maxHp: 9500,
      atk: 104,
      def: 96,
      gold: 2300,
      sun: 4,
      moon: 4,
      star: 1,
      ...resources
    },
    state: {
      shopPurchases,
      relics: { codex: false, compass: true, lucky: true, ward: false, holy: false }
    },
    certificate: { certificateHash: id }
  };
}

test('boss-affordability scheduler can promote a later stronger boundary seed', () => {
  const early = seed('early', { hp: 1054, def: 96, gold: 2375 });
  const attack = seed('attack', { hp: 800, atk: 119, def: 96, gold: 2600 });
  const rich = seed('rich', { hp: 940, def: 100, gold: 3241, star: 0 });
  const ignored = seed('unverified', { hp: 99999, atk: 999, def: 999, gold: 99999 }, { verified: false });

  const earlyScore = scorePreHolyBoundarySeed(early);
  const richScore = scorePreHolyBoundarySeed(rich);
  assert.equal(earlyScore.schedulable, true);
  assert.equal(richScore.schedulable, true);
  assert.ok(richScore.optimisticBossMargin > earlyScore.optimisticBossMargin);

  const schedule = schedulePreHolyBoundarySeeds([early, attack, rich, ignored], { limit: 2 });
  assert.equal(schedule.scheduler, 'astral-boss-affordability-v1');
  assert.equal(schedule.candidateCount, 3);
  assert.equal(schedule.scheduledCount, 2);
  const hashes = schedule.diagnostics.map((entry) => entry.certificateHash);
  assert.ok(hashes.includes('rich'));
  assert.ok(!hashes.includes('unverified'));
});

test('seed scheduling remains a bounded ordering operation over verified candidates', () => {
  const seeds = [
    seed('a', { atk: 104, def: 96, gold: 2400, star: 2 }),
    seed('b', { atk: 109, def: 96, gold: 2300, star: 0 }),
    seed('c', { atk: 104, def: 100, gold: 2500, star: 1 }),
    seed('d', { hp: 1374, atk: 104, def: 96, gold: 2200, star: 1 })
  ];
  const schedule = schedulePreHolyBoundarySeeds(seeds, { limit: 3 });
  assert.equal(schedule.candidateCount, 4);
  assert.equal(schedule.scheduledCount, 3);
  assert.equal(new Set(schedule.diagnostics.map((entry) => entry.certificateHash)).size, 3);
  assert.ok(schedule.diagnostics.every((entry) => Number.isFinite(entry.optimisticBossMargin)));
});
