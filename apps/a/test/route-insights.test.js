import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveRouteInsights } from '../src/solver/route-insights.js';

test('route insights explain a real commitment, a resource fork, council plan, and pressure point', () => {
  const insights = deriveRouteInsights({
    doctrine: { title: '影线公开路线' },
    steps: [
      { kind: 'doctrine', action: { doctrineId: 'shadow' } },
      { kind: 'tile', action: { token: 'gate:f16PrismThreshold' } },
      { kind: 'council', action: { order: ['milu', 'yanli', 'yayu'], allocations: { milu: 60, yanli: 40, yayu: 20 } } }
    ],
    battleLog: [
      { eventId: 'safe', floor: 15, enemyName: '镜轮巡卫', normalizedHpMargin: 0.42 },
      { eventId: 'pressure', floor: 17, enemyName: '三冠阶庭', normalizedHpMargin: 0.08 }
    ]
  });
  assert.deepEqual(insights.map((entry) => entry.kind), ['route', 'resource', 'council', 'pressure']);
  assert.match(insights.at(-1).text, /F17/);
  assert.match(insights.find((entry) => entry.kind === 'council').text, /milu → yanli → yayu/);
});

test('route insights call out the Act III charter and its explicit card fork', async () => {
  const { deriveRouteInsights } = await import('../src/solver/route-insights.js');
  const insights = deriveRouteInsights({
    charter: { title: '灯塔接力章程' },
    steps: [
      { kind: 'charter', action: { charterId: 'relay' } },
      { kind: 'tile', action: { token: 'gate:f24RelayAnnex' } }
    ]
  });
  assert.ok(insights.some((entry) => entry.id === 'charter:relay'));
  assert.ok(insights.some((entry) => entry.id === 'gate:f24RelayAnnex'));
});

test('route insights read the authoritative missing-seal card budget from replay', () => {
  const insights = deriveRouteInsights({
    steps: [{
      kind: 'tile',
      action: { token: 'gate:f25MissingSeal' },
      engine: { events: [{ type: 'cardGate', gateId: 'f25MissingSeal', requirements: { sun: 1, moon: 2, star: 1 } }] }
    }]
  });
  const budget = insights.find((entry) => entry.id === 'gate:f25MissingSeal');
  assert.match(budget.text, /日曜 ×1、月辉 ×2、星蚀 ×1/);
});

test('route insights explain the two-phase MP split rather than only the final HP total', () => {
  const insights = deriveRouteInsights({
    battleLog: [
      { floor: 30, enemyId: 'archiveWarden', battle: { magicCost: 60, totalDamage: 18_000 }, normalizedHpMargin: 0.4 },
      { floor: 30, enemyId: 'errataCore', battle: { magicCost: 200, totalDamage: 14_000 }, normalizedHpMargin: 0.2 }
    ]
  });
  const budget = insights.find((entry) => entry.id === 'finale-magic-budget');
  assert.deepEqual(budget.magicCosts, [60, 200]);
  assert.match(budget.text, /60 MP.*200 MP/);
});
