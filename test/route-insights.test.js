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
