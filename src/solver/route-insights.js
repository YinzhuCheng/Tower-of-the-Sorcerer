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
  f19ThroneLicense: '保留两张月辉卡作为王座执照，不能把它们误投到可选支线。',
  f22ShelterAnnex: '把两张月辉卡投入夜航侧库，换取 F30 的稳定反击减免。',
  f23AuditAnnex: '把两张星蚀卡投入逐页校验，换取终局两相的公开弱点。',
  f24RelayAnnex: '把日曜与月辉卡投入灯塔接力，换取一次现在和一次 F27 后的 MP 回充。'
});

const CARD_NAMES = Object.freeze({ sun: '日曜', moon: '月辉', star: '星蚀' });

function cardBudgetText(requirements = {}) {
  return Object.entries(requirements)
    .filter(([, amount]) => Number(amount) > 0)
    .map(([card, amount]) => `${CARD_NAMES[card] ?? card} ×${Number(amount)}`)
    .join('、');
}

function gateInsightText(gateId, step) {
  if (gateId === 'f25MissingSeal') {
    const cardGate = step.engine?.events?.find((event) => event.type === 'cardGate' && event.gateId === gateId);
    const budget = cardBudgetText(cardGate?.requirements ?? {});
    return `为缺页封条保留${budget || '公开卡片预算'}，不能只按眼前收益花卡。`;
  }
  return GATE_INSIGHTS[gateId] ?? null;
}

function uniqueById(entries) {
  const seen = new Set();
  return entries.filter((entry) => !seen.has(entry.id) && seen.add(entry.id));
}

export function deriveRouteInsights({ steps = [], battleLog = [], doctrine = null, charter = null, handoff = null } = {}) {
  const insights = [];
  const doctrineStep = steps.find((step) => step.kind === 'doctrine');
  if (doctrineStep) {
    insights.push({
      id: `doctrine:${doctrineStep.action?.doctrineId ?? 'unknown'}`,
      kind: 'route',
      title: '路线承诺',
      text: doctrine ? `签署「${doctrine.title}」，路线宝库从此互斥。` : '在 F11 签署见证契约，路线宝库从此互斥。'
    });
  }
  const charterStep = steps.find((step) => step.kind === 'charter');
  if (charterStep) {
    insights.push(Object.freeze({
      id: `charter:${charterStep.action?.charterId ?? 'unknown'}`,
      kind: 'route',
      title: '第三幕章程',
      text: charter ? `签署「${charter.title}」，其余两座侧库从此互斥。` : '在 F21 签署修复章程，三座第三幕侧库从此互斥。'
    }));
  }
  if (handoff) {
    insights.push(Object.freeze({
      id: `handoff:${handoff.id}`,
      kind: 'route',
      title: '校场先后手',
      text: `F27 先击败${handoff.triggerEnemyId === 'marginDuelist' ? '边注决斗者' : handoff.triggerEnemyId === 'errataCantor' ? '勘误咏唱者' : '接力总管'}，锁定「${handoff.title}」；另外两种校场支援从此错失。`
    }));
  }

  for (const step of steps) {
    if (step.kind !== 'tile' || !String(step.action?.token ?? '').startsWith('gate:')) continue;
    const gateId = String(step.action.token).slice('gate:'.length);
    const text = gateInsightText(gateId, step);
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

  const finaleBattles = battleLog.filter((entry) => entry.floor === 30
    && ['archiveWarden', 'errataCore'].includes(entry.enemyId));
  if (finaleBattles.length >= 2) {
    const [warden, core] = finaleBattles;
    insights.push({
      id: 'finale-magic-budget',
      kind: 'finale',
      title: '终局 MP 分账',
      text: `F30 以 ${warden.battle?.magicCost ?? 0} MP 处理守望者、以 ${core.battle?.magicCost ?? 0} MP 处理勘误核心；两相都不能只按单场最低损伤贪心。`,
      magicCosts: Object.freeze([warden.battle?.magicCost ?? 0, core.battle?.magicCost ?? 0]),
      totalDamage: (warden.battle?.totalDamage ?? 0) + (core.battle?.totalDamage ?? 0)
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
