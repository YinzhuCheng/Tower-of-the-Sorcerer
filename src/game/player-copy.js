/**
 * Player-facing copy rules.
 *
 * The game keeps its numbers deterministic, so the words around a decision
 * should be just as deterministic: say what happens, when it happens, and
 * what it costs.  Story can be suggestive; rules cannot.
 */

export const PLAYER_COPY_VERSION = 'object-facts-v2';

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

export const HELP_SECTIONS = Object.freeze([
  Object.freeze({
    title: '查看地图单位',
    lines: Object.freeze([
      '悬停或触摸地图单位，会显示它的效果、条件、消耗与当前状态。',
      '穿过卡牌结界会立刻消耗对应卡；结界本身会显示实际消耗与当前持有数量。',
      '相同的Ⅰ、A 等标记表示同一组守卫、封印、奖励或机关；悬停任一标记会高亮整组。',
      '上行阶梯被封锁时，悬停阶梯可查看仍在维持封锁的守护者或选择条件。',
      '触摸对象时，第一次只查看；在短时间内再次触摸同一格才行动。键盘可按 V 查看四邻对象。'
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
    title: '选择面板',
    lines: Object.freeze([
      '商店、专家盟约、修复章程、会战和终局：面板会列出选择、代价、结果与触发条件。',
      '普通敌人、物品、门和机关：直接悬停或触摸查看；规则都写在对应对象上。'
    ])
  })
]);
