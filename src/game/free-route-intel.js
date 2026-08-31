/**
 * 免费路线情报
 *
 * Fixed-number tower games ask the player to plan around irreversible card,
 * gold and MP decisions. Hiding the facts behind a paid hint only rewards
 * making a save, scouting ahead, and loading it again. This module is
 * deliberately read-only: it exposes authored facts before a decision, but
 * never grants a stat, a card, a reroll, or a route bypass.
 */

import { CARD_LABELS, ENEMIES, FLOORS, ITEMS } from './data.js';
import { getEffectiveEnemy } from './engine.js';
import {
  getCardGateRequirements,
  getDefeatedBossIds,
  getFloorExitGuardianIds,
  getGuardianGateRequirements
} from './progression-rules.js';
import { WAR_COUNCIL_ALLIES, WAR_COUNCIL_LOYALISTS } from './war-council.js';
import { getAllianceBond, isAllianceBonded } from './alliance-bonds.js';
import { getChallengeContractBriefing } from './challenge-contracts.js';
import { getRouteDoctrineBriefing } from './route-doctrines.js';
import { getAct3CharterBriefing } from './act3-charters.js';
import { getAct3HandoffBriefing } from './act3-handoff-priorities.js';
import { getBossProtocolBriefing } from './boss-protocols.js';

export const FREE_ROUTE_INTEL_ID = 'free-route-intel-v1';
export const FREE_ROUTE_INTEL_LOOKAHEAD = 2;

const GATE_NAMES = Object.freeze({
  f11LunarTrace: '月痕上行门',
  twinChordVault: '双谱宝库',
  f13StarConduit: '星导管',
  f13MoonBypass: '月相旁路',
  f14TriuneSeal: '三矢封印',
  f15ArchiveSeal: '档案封卷',
  f16PrismThreshold: '棱镜门槛',
  mirrorReservoirVault: '镜泉宝库',
  f17CrownSeal: '三冠封印',
  f18SunBridge: '日桥',
  f18StarChannel: '星渠',
  f19ThroneLicense: '王座执照',
  f19RegentSeal: '摄政封印',
  f20SovereignSeal: '主权者封印',
  f22ShelterAnnex: '夜航侧库',
  f23AuditAnnex: '逐页校验室',
  f24RelayAnnex: '灯塔接力室',
  f25MissingSeal: '缺页封条',
  f27RelaySeal: '接力校场封锁',
  f29IndexSeal: '最后索引封锁',
  tri: '三相结界'
});

const ROUTE_NOTES = Object.freeze({
  1: '先拿图鉴。敌人、门和道具都可悬停查看；卡门会立刻消耗卡。',
  2: '主路可直接上行。双钥宝库是可选奖励，不是通关条件。',
  3: '两枚潮汐开关都要踩亮；魔法反击无视防御。',
  4: '锻炉的魔刃提高攻击。攻击不够时，先别挑战高防敌人。',
  5: '商店只在这里。三名核心守卫全部落败后才能上行。',
  6: '符文顺序是新月 → 半月 → 满月；踩错只重置进度。',
  7: '双相结界要月卡和星卡；最后一张日曜卡留给王座。',
  8: '两枚开关加维拉是上行条件；双卫宝库可选。',
  9: '月辉卡开启校准台；符文顺序为月蚀 → 晨辉 → 星落。',
  10: '日曜卡开启王座结界。门后没有商店，确认后再进入。',
  11: '离开前必须选一条专家路线；选择不扣资源，但其余两条会关闭。',
  12: '双谱宝库是可选双守卫战，奖励是 MP 容量。',
  13: '星卡开容量导管；月卡开可选旁路。两者都不挡上行。',
  14: '三名竞技场守卫全是上行条件；先用图鉴比较耗血和 MP。',
  15: '本章唯一商店。星蚀卡 ×2 的书库是可选投资。',
  16: '双镜殿仅对应路线可进；开启后必须打完双守卫才能离开。',
  17: 'F18 上行要日曜卡 ×1；星蚀卡 ×2 只开可选星渠。',
  18: '日桥是上行门；星渠是可选挑战。为 F19 留两张月辉卡。',
  19: '王座执照要月辉卡 ×2；击败摄政官后才能上 F20。',
  20: '会战可以无限预演，不耗主角 MP；之后是固定两相终局。',
  21: '上行前必须选一份章程。选择不扣资源，但只开启一座侧库。',
  22: '夜航侧库要月辉卡 ×2；完成后终局每阶段少三次反击。',
  23: '校验侧库要星蚀卡 ×2；完成后会削弱 F30 两个阶段。',
  24: '接力侧库要日、月卡各 1 张；完成后现在补 MP，F27 后再补一次。',
  25: '缺页封条固定要日曜 ×1、月辉 ×2、星蚀 ×1。',
  26: '本幕唯一商店：每次购买立即生效，下一次价格上升。',
  27: '三名校场守卫都必须打。第一个击败的守卫锁定终局支援。',
  28: '主路可上行；侧路提供可选生命或 MP 补给。',
  29: '两名索引守卫都要击败；卡片和 MP 留给 F30。',
  30: '守望者后立刻进入勘误核心；章程与校场支援会显示在敌方信息中。'
});

function positiveInteger(value) {
  const number = Math.floor(Number(value) || 0);
  return number > 0 ? number : 0;
}

function cardRequirementLabel(requirements = {}) {
  return Object.entries(requirements)
    .filter(([, amount]) => positiveInteger(amount) > 0)
    .map(([card, amount]) => `${CARD_LABELS[card] ?? card}×${positiveInteger(amount)}`)
    .join('、');
}

function tokenId(token, kind) {
  const prefix = `${kind}:`;
  return typeof token === 'string' && token.startsWith(prefix) ? token.slice(prefix.length) : null;
}

function uniqueInOrder(values) {
  return [...new Set(values.filter(Boolean))];
}

function mapFor(state, floorIndex, floor) {
  const stateMap = state?.floor === floorIndex ? state?.floorStates?.[floorIndex]?.map : null;
  return Array.isArray(stateMap) ? stateMap : floor.map;
}

function enemyFacts(enemyId) {
  const enemy = ENEMIES[enemyId];
  if (!enemy) return null;
  return Object.freeze({
    id: enemyId,
    name: enemy.name,
    hp: enemy.hp,
    atk: enemy.atk,
    def: enemy.def,
    special: enemy.special ?? 'normal',
    magicPower: enemy.magicPower ?? 0,
    boss: Boolean(enemy.boss),
    finalBoss: Boolean(enemy.finalBoss)
  });
}

function itemFacts(itemId) {
  const item = ITEMS[itemId];
  if (!item) return null;
  return Object.freeze({ id: itemId, name: item.name, description: item.description });
}

function gateTarget(floor, gateId) {
  const barrier = `gate:${gateId}`;
  const target = (floor.protectedBarriers ?? []).find((entry) => entry.barrier === barrier)?.target;
  if (!target) return null;
  const itemId = tokenId(target, 'item');
  const enemyId = tokenId(target, 'enemy');
  if (itemId && ITEMS[itemId]) return ITEMS[itemId].name;
  if (enemyId && ENEMIES[enemyId]) return ENEMIES[enemyId].name;
  if (target === 'U') return '上行阶梯';
  return target;
}

function gateFacts(state, floorIndex, floor) {
  const floorState = state?.floorStates?.[floorIndex];
  const defeated = getDefeatedBossIds(floorState, floor);
  const gateIds = uniqueInOrder([
    ...Object.keys(floor.puzzles?.cardGates ?? {}),
    ...Object.keys(floor.puzzles?.guardianGates ?? {}),
    ...(floor.puzzles?.triGate ? [floor.puzzles.triGate] : [])
  ]);
  return Object.freeze(gateIds.map((id) => {
    const cards = getCardGateRequirements(floor, id);
    const guardians = getGuardianGateRequirements(floor, id);
    const target = gateTarget(floor, id);
    if (cards) {
      return Object.freeze({
        id,
        name: GATE_NAMES[id] ?? id,
        type: 'cards',
        requirement: cardRequirementLabel(cards),
        cards: Object.freeze({ ...cards }),
        target
      });
    }
    return Object.freeze({
      id,
      name: GATE_NAMES[id] ?? id,
      type: 'guardians',
      guardians: Object.freeze((guardians ?? []).map((enemyId) => Object.freeze({
        id: enemyId,
        name: ENEMIES[enemyId]?.name ?? enemyId,
        defeated: defeated.has(enemyId)
      }))),
      target
    });
  }));
}

function floorFacts(state, floorIndex) {
  const floor = FLOORS[floorIndex];
  if (!floor) return null;
  const map = mapFor(state, floorIndex, floor);
  const enemies = uniqueInOrder(map.flat().map((token) => tokenId(token, 'enemy')))
    .map(enemyFacts)
    .filter(Boolean);
  const items = uniqueInOrder(map.flat().map((token) => tokenId(token, 'item')))
    .map(itemFacts)
    .filter(Boolean);
  const floorState = state?.floorStates?.[floorIndex];
  const defeated = getDefeatedBossIds(floorState, floor);
  const mandatory = getFloorExitGuardianIds(floor).map((id) => Object.freeze({
    id,
    name: ENEMIES[id]?.name ?? id,
    defeated: defeated.has(id)
  }));
  return Object.freeze({
    floorIndex,
    number: floor.number,
    title: floor.title,
    objective: floor.objective,
    routeNote: ROUTE_NOTES[floor.number] ?? '先看离开条件；可选奖励不会挡住主路。',
    gates: gateFacts(state, floorIndex, floor),
    mandatory: Object.freeze(mandatory),
    threats: Object.freeze(enemies),
    rewards: Object.freeze(items)
  });
}

function finaleFacts(state) {
  const atActThree = FLOORS[state?.floor]?.number >= 21;
  const finalEnemyIds = atActThree ? ['archiveWarden', 'errataCore'] : ['arcaneSovereign', 'originCore'];
  const finalEnemies = finalEnemyIds.map((id) => {
    const base = enemyFacts(id);
    const effective = state ? getEffectiveEnemy(state, id) : null;
    return base ? {
      ...base,
      hp: effective?.hp ?? base.hp,
      atk: effective?.atk ?? base.atk,
      def: effective?.def ?? base.def,
      magicPower: effective?.magicPower ?? base.magicPower,
      special: effective && Object.hasOwn(effective, 'special') ? (effective.special ?? 'normal') : base.special,
      rules: effective?.councilRules ?? null,
      modifierLabels: [
        ...(effective?.charterLabels ?? []),
        ...(effective?.handoffLabels ?? [])
      ]
    } : null;
  }).filter(Boolean);
  const contracts = getChallengeContractBriefing(state);
  return Object.freeze({
    title: atActThree ? '余烬灯塔公开情报' : '终局公开情报',
    premise: atActThree
      ? '三份章程、F30 两相数值和门槛都在这里；选择章程不会改变可见信息。'
      : '敌方顺序、配额和两相数值都在这里；会战可无限预演，不耗探索资源。',
    loyalists: Object.freeze(WAR_COUNCIL_LOYALISTS.map((unit, index) => Object.freeze({
      order: index + 1,
      id: unit.id,
      name: unit.name,
      role: unit.role,
      mp: unit.mp
    }))),
    allies: Object.freeze(WAR_COUNCIL_ALLIES.map((unit) => {
      const bond = getAllianceBond(unit.id);
      const bonded = isAllianceBonded(state, unit.id);
      return Object.freeze({
        id: unit.id,
        name: unit.name,
        role: unit.role,
        condition: `击败 ${ENEMIES[unit.enemyId]?.name ?? unit.enemyId} 后可在会战中选择`,
        bondTitle: bond?.title ?? null,
        bondRoute: bond?.route ?? null,
        bonded,
        bondActivation: bond?.activation ?? 'survive',
        bondEffect: bond?.finale?.label ?? null
      });
    })),
    contracts,
    bossProtocols: getBossProtocolBriefing(state),
    finalEnemies: Object.freeze(finalEnemies)
  });
}

/**
 * Returns a pure planning record. Calling it is intentionally incapable of
 * changing cards, gold, HP, MP, map tiles, turn count, save data or solver
 * state. The UI exposes this as a permanent “路线情报” action.
 */
export function getFreeRouteIntel(state, { lookahead = FREE_ROUTE_INTEL_LOOKAHEAD } = {}) {
  const floorIndex = Number.isInteger(state?.floor) ? state.floor : 0;
  const span = Math.max(0, Math.floor(Number(lookahead) || 0));
  const current = floorFacts(state, floorIndex);
  const upcoming = [];
  for (let offset = 1; offset <= span; offset += 1) {
    const facts = floorFacts(state, floorIndex + offset);
    if (facts) upcoming.push(facts);
  }
  const currentNumber = current?.number ?? 0;
  return Object.freeze({
    id: FREE_ROUTE_INTEL_ID,
    free: true,
    title: '免费路线情报',
    notice: '查看不会消耗卡片、金币、HP、MP 或回合。这里显示当前与后两层的决策事实：上行条件、卡牌支出、可选奖励和敌人数值。',
    doctrines: currentNumber >= 11 ? getRouteDoctrineBriefing(state) : null,
    charters: currentNumber >= 21 ? getAct3CharterBriefing(state) : null,
    handoffs: currentNumber >= 21 ? getAct3HandoffBriefing(state) : null,
    current,
    upcoming: Object.freeze(upcoming),
    finale: currentNumber >= 11 ? finaleFacts(state) : null
  });
}
