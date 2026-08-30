/**
 * Turns an authoritative replay into a short, player-readable decision
 * briefing.  This is explanation, never a policy oracle: it reports what the
 * proven witness actually chose and where its HP margin was smallest.
 */

const GATE_INSIGHTS = Object.freeze({
  f13StarConduit: '把两张星蚀卡投入潮汐导管，而不是保留给后段星渠。',
  f15ArchiveSeal: '把两张星蚀卡留到档案封卷，换取赤焰蓄能。',
  f16PrismThreshold: '把两张月辉卡投入镜轮宝库，并承担双 Boss 压力。',
  f18StarChannel: '花两张星蚀卡完成虚空审计，削弱 F19 回声摄政官。',
  f19ThroneLicense: '保留两张月辉卡作为王座执照，不能把它们误投到可选支线。'
});

function uniqueById(entries) {
  const seen = new Set();
  return entries.filter((entry) => !seen.has(entry.id) && seen.add(entry.id));
}

export function deriveRouteInsights({ steps = [], battleLog = [], doctrine = null } = {}) {
  const insights = [];
  const doctrineStep = steps.find((step) => step.kind === 'doctrine');
  if (doctrineStep) {
    insights.push({
      id: `doctrine:${doctrineStep.action?.doctrineId ?? 'unknown'}`,
      kind: 'route',
      title: '路线承诺',
      text: doctrine ? `签署「${doctrine.title}」，专家宝库从此互斥。` : '在 F11 签署路线盟约，专家宝库从此互斥。'
    });
  }

  for (const step of steps) {
    if (step.kind !== 'tile' || !String(step.action?.token ?? '').startsWith('gate:')) continue;
    const gateId = String(step.action.token).slice('gate:'.length);
    const text = GATE_INSIGHTS[gateId];
    if (!text) continue;
    insights.push({ id: `gate:${gateId}`, kind: 'resource', title: '资源分流', text });
  }

  const council = steps.find((step) => step.kind === 'council');
  if (council) {
    const order = council.action?.order ?? [];
    const allocations = council.action?.allocations ?? {};
    insights.push({
      id: 'council',
      kind: 'council',
      title: '王座前部署',
      text: `出战顺序为 ${order.join(' → ')}；共鸣 MP 为 ${order.map((id) => `${id} ${allocations[id] ?? 0}`).join('、')}。`
    });
  }

  const closest = [...battleLog]
    .filter((entry) => Number.isFinite(entry.normalizedHpMargin))
    .sort((left, right) => left.normalizedHpMargin - right.normalizedHpMargin)[0];
  if (closest) {
    insights.push({
      id: `pressure:${closest.eventId}`,
      kind: 'pressure',
      title: '最低容错点',
      text: `F${closest.floor} 的 ${closest.enemyName} 让此路线剩余生命裕量最低；这一步最不适合用贪心 MP 或随意商店购买处理。`,
      normalizedHpMargin: closest.normalizedHpMargin
    });
  }

  return Object.freeze(uniqueById(insights).map((entry) => Object.freeze(entry)));
}
