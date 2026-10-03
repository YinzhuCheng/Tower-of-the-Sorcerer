/**
 * A small, deterministic tactical adviser for search ordering.  It previews
 * only a bounded number of legal successors, scores the *shape* of the
 * resulting position, then returns every action in a stable order.
 *
 * This is intentionally not a pruning rule and is never written into a proof
 * certificate.  A bad intuition can cost search time, never delete a legal
 * player route.  Keeping that boundary clear matters in a fixed-number tower:
 * authored strategy may be surprising, but a release proof must remain
 * replayable without trusting a taste-based heuristic.
 */

const COMMITMENT_KINDS = new Set(['doctrine', 'charter', 'council']);

function number(value) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function resourceSpend(before, after) {
  return {
    hp: Math.max(0, number(before.hp) - number(after.hp)),
    mp: Math.max(0, number(before.mp) - number(after.mp)),
    gold: Math.max(0, number(before.gold) - number(after.gold)),
    cards: ['sun', 'moon', 'star'].reduce((sum, card) => sum + Math.max(0, number(before[card]) - number(after[card])), 0)
  };
}

function actionRole(action) {
  if (COMMITMENT_KINDS.has(action.kind)) return 'commitment';
  if (action.kind === 'shop') return 'investment';
  if (action.kind === 'sequence') return 'puzzle';
  if (action.kind === 'teleport') return 'travel';
  if (action.kind !== 'tile') return action.kind ?? 'action';
  if (action.token === 'U') return 'advance';
  if (action.parsed?.type === 'gate' || action.parsed?.type === 'door') return 'resource-spend';
  if (action.parsed?.type === 'enemy') return action.parsed?.id?.includes('Core') || action.parsed?.id?.includes('core')
    ? 'finale-battle'
    : 'battle';
  if (action.parsed?.type === 'item') return 'resource-gain';
  return action.parsed?.type ?? 'action';
}

function intrinsicScore(action) {
  const role = actionRole(action);
  if (role === 'commitment') return 800;
  if (role === 'advance') return 700;
  if (role === 'puzzle') return 620;
  if (role === 'resource-spend') return 560;
  if (role === 'finale-battle') return 520;
  if (role === 'investment') return 380;
  if (role === 'resource-gain') return 300;
  if (role === 'battle') return 170;
  if (role === 'travel') return 10;
  return 80;
}

function scoreTransition(beforeState, afterState, before, after, action) {
  const spend = resourceSpend(before, after);
  const floorProgress = number(afterState?.floor) - number(beforeState?.floor);
  const stats = (number(after.atk) - number(before.atk)) * 16
    + (number(after.def) - number(before.def)) * 12
    + (number(after.maxHp) - number(before.maxHp)) / 120
    + (number(after.mp) - number(before.mp)) * 2
    + (number(after.maxMp) - number(before.maxMp)) * 3;
  const reserve = number(after.gold) / 30
    + (number(after.sun) + number(after.moon) + number(after.star)) * 10;
  const pressure = spend.hp / 120 + spend.mp * 2 + spend.gold / 45 + spend.cards * 55;
  return intrinsicScore(action) + floorProgress * 2_000 + stats + reserve - pressure;
}

function describe(action, spend) {
  const role = actionRole(action);
  if (role === 'commitment') return '不可逆路线承诺，优先评估其后续资源账本。';
  if (role === 'resource-spend' && spend.cards > 0) return `消耗 ${spend.cards} 张卡，必须与后续封条预算一起判断。`;
  if (role === 'investment' && spend.gold > 0) return `投入 ${spend.gold} 金币，比较即时属性与终局资源缺口。`;
  if ((role === 'battle' || role === 'finale-battle') && (spend.hp > 0 || spend.mp > 0)) {
    return `预计承受 ${spend.hp} 生命与 ${spend.mp} MP 的压力；先检查是否推进关键区域。`;
  }
  if (role === 'advance') return '推进到下一层，会把当前资源选择锁进后续关卡。';
  if (role === 'resource-gain') return '补给会改变后续卡门、MP 与战斗的可行组合。';
  return '作为排序参考，不会删除任何合法分支。';
}

/**
 * Returns the same actions in a deterministic, tactically informed order.
 * A preview failure receives a low score but is retained: authority stays
 * with the normal apply/normalize path in the actual search loop.
 */
export function rankActionsByStrategicIntuition({ adapter, state, actions = [], previewLimit = 18 } = {}) {
  if (!adapter || !state || !Array.isArray(actions)) return Object.freeze([]);
  const before = adapter.resources(state);
  const bounded = Math.max(0, Math.trunc(previewLimit));
  const ranked = actions.map((action, index) => {
    if (index >= bounded) {
      return Object.freeze({ action, index, previewed: false, score: intrinsicScore(action), role: actionRole(action), spend: Object.freeze({}), rationale: '超出本层预览预算；保留原分支，仅按动作语义排序。' });
    }
    try {
      const applied = adapter.applyAction(adapter.cloneState(state), action);
      if (!applied?.ok) {
        return Object.freeze({ action, index, previewed: true, score: Number.NEGATIVE_INFINITY, role: actionRole(action), spend: Object.freeze({}), rationale: '预演不能执行；实际搜索仍会按权威规则复核。' });
      }
      const normalized = adapter.normalize ? adapter.normalize(applied.state) : { state: applied.state };
      const nextState = normalized?.state ?? applied.state;
      const after = adapter.resources(nextState);
      const spend = resourceSpend(before, after);
      return Object.freeze({
        action,
        index,
        previewed: true,
        score: scoreTransition(state, nextState, before, after, action),
        role: actionRole(action),
        spend: Object.freeze(spend),
        rationale: describe(action, spend)
      });
    } catch {
      return Object.freeze({ action, index, previewed: true, score: Number.NEGATIVE_INFINITY, role: actionRole(action), spend: Object.freeze({}), rationale: '预演异常；实际搜索仍会按权威规则复核。' });
    }
  });
  ranked.sort((left, right) => right.score - left.score || left.index - right.index || String(left.action.eventId).localeCompare(String(right.action.eventId)));
  return Object.freeze(ranked);
}

/** Converts a ranked branch list into a compact author-facing decision note.
 * It deliberately exposes alternatives and their resource consequences rather
 * than presenting the top branch as an oracle answer. */
export function summarizeStrategicDecision(ranked = [], { maxAlternatives = 3 } = {}) {
  const meaningful = ranked.filter((entry) => entry.role !== 'travel').slice(0, Math.max(1, maxAlternatives));
  if (!meaningful.length) return null;
  const roles = new Set(meaningful.map((entry) => entry.role));
  const hasCommitment = meaningful.some((entry) => entry.role === 'commitment');
  const hasCardSpend = meaningful.some((entry) => Number(entry.spend.cards) > 0);
  const hasInvestment = meaningful.some((entry) => entry.role === 'investment');
  const magicTiers = new Set(meaningful.map((entry) => entry.action.magicTier).filter(Number.isFinite));
  const hasMagicAllocation = magicTiers.size >= 2;
  const critical = meaningful.length >= 2 && (hasCommitment || hasCardSpend || hasInvestment || hasMagicAllocation
    || (roles.has('battle') && roles.has('advance')));
  const criticalReason = hasCommitment
    ? '不可逆路线承诺'
    : hasCardSpend
      ? '卡片账本分流'
      : hasInvestment
        ? '金币与属性兑换'
        : hasMagicAllocation
          ? '同一战斗的 MP 档位分配'
          : roles.has('battle') && roles.has('advance')
            ? '先战斗还是先推进'
            : '一般分支';
  return Object.freeze({
    selectedEventId: meaningful[0].action.eventId,
    role: meaningful[0].role,
    rationale: meaningful[0].rationale,
    critical,
    criticalReason,
    alternatives: Object.freeze(meaningful.map((entry) => Object.freeze({
      eventId: entry.action.eventId,
      kind: entry.action.kind,
      token: entry.action.token ?? null,
      magicTier: entry.action.magicTier ?? null,
      role: entry.role,
      previewed: entry.previewed,
      spend: entry.spend,
      score: Number.isFinite(entry.score) ? entry.score : null,
      rationale: entry.rationale
    })))
  });
}
