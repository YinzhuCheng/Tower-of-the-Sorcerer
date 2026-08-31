/**
 * Player-facing copy rules.
 *
 * The game keeps its numbers deterministic, so the words around a decision
 * should be just as deterministic: say what happens, when it happens, and
 * what it costs.  Story can be suggestive; rules cannot.
 */

export const PLAYER_COPY_VERSION = 'decision-first-v1';

export function combatRuleCopy(enemy, { compact = false } = {}) {
  if (enemy?.special === 'magic') {
    const value = Number(enemy.magicPower ?? enemy.atk ?? 0);
    return compact
      ? `魔法反击 ${value}/次（无视防御）`
      : `魔法：每次反击固定造成 ${value} 点伤害，不受防御影响。`;
  }
  if (enemy?.special === 'firstStrike') {
    return compact
      ? '先制（开战前多攻击 1 次）'
      : '先制：开战前会额外攻击 1 次。';
  }
  if (enemy?.special === 'doubleHit') {
    return compact
      ? '二连（每次反击 2 段）'
      : '二连：每次反击会造成 2 段伤害。';
  }
  return compact ? '普通反击' : '普通：主角先攻击，敌人随后反击。';
}

export function irreversibleLabel({ required = false, optional = false } = {}) {
  if (required) return '必须完成';
  if (optional) return '可选；不会阻挡上行';
  return '查看条件';
}

export const HELP_SECTIONS = Object.freeze([
  Object.freeze({
    title: '先看这三件事',
    lines: Object.freeze([
      '靠近敌人或悬停地图单位：先看“预计耗血”和“战后剩余生命”。',
      '穿过卡牌结界会立刻消耗对应卡；先在“路线情报”确认后两层需要什么。',
      '带“必须完成”的守护者不倒，上行阶梯不会开放；宝库和支线会明确标为可选。'
    ])
  }),
  Object.freeze({
    title: '战斗怎么算',
    lines: Object.freeze([
      '没有随机数，主角永远先攻击。攻击不高于敌方防御时，无法破防。',
      '先制会在开战前多打一次；二连让每次反击变成两段；魔法反击无视防御。'
    ])
  }),
  Object.freeze({
    title: '什么时候该读说明',
    lines: Object.freeze([
      '商店、路线盟约、修复章程、会战和终局前：阅读完整面板，因为它们会改变整局路线。',
      '普通敌人、物品、门和机关：直接悬停或触摸查看；理解后不需要再读教程。'
    ])
  })
]);
