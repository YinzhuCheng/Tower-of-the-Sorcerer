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

// These are intent notes, not hidden mechanics. They call out choices that
// are easiest to discover only after an irreversible card spend.
const ROUTE_NOTES = Object.freeze({
  11: '先看清 F13 的两条卡片分流：星导管通向容量遗物，月相旁路只通向额外战斗。',
  12: '双谱宝库不是过路税；它是可选双 Boss 投资，回报为以太棱镜（最大 MP）。',
  13: '星卡 ×2 换导管书典的容量提升；月卡 ×2 只换一场可选决斗。上行路线不要求二选一。',
  14: '三名竞技场守卫全部为强制目标；在开战前可按下方固定数值检查攻击与 MP 档位。',
  15: '本章唯一商店在此。档案封卷的星卡 ×2 是通往蓄能书库的可选投资，不是通关门票。',
  16: '影线盟约会将月卡 ×2 的棱镜门变为强制双镜远征：公开获得棱镜续航，但必须击败双守卫、取得镜泉信物后才能上行。其他路线仍把此处视为封印的专家支线。',
  17: '下一层日卡 ×1 是上行刚需，星卡 ×2 只开启可选星渠；月卡要为 F19 的王座执照保留两张。',
  18: '日桥（日卡 ×1）是唯一上行门槛。星渠（星卡 ×2）仅通向虚空先驱与可选收益。',
  19: '王座执照必须消耗月卡 ×2，之后还要击败回声摄政官才能上 F20；不要把这两张月卡误投到无关支路。',
  20: '会战与两阶段终局均为固定数值。可在确认前无限次预演，不消耗主角 MP 或任何探索资源。'
  ,21: '在上行阶梯前必须选一份免费公开的修复章程。选择不扣资源，但只会让其中一座侧库保持开放。'
  ,22: '夜航章程消耗月卡 ×2，换取生命/防御与 F30 每阶段三次反击减免；非夜航路线无法开启。'
  ,23: '校验章程消耗星卡 ×2 并要打持簿执行官，换取对 F30 两阶段的公开削弱。'
  ,24: '接力章程消耗日卡 ×1、月卡 ×1，换取容量、立即补魔与 F27 后的第二次满额回充。'
  ,25: '缺页封条强制消耗日、月、星各一张。不要在 F21–24 的选择中把颜色账本用空。'
  ,26: '本幕唯一高阶商店已公开标价；可以把 F21–25 的战利品转成生命、攻防或 MP 容量。'
  ,27: '三名校场守卫都是上行强制目标；最先击败的一人会永久锁定护送、校验或接力优先程序。先后顺序本身就是公开的终局取舍。'
  ,28: '两场高压战守着不同补给；主路并不强迫全拿，决定是否绕行本身就是终局资源取舍。'
  ,29: '最后索引由两名守卫维持。上楼前的卡片与 MP 都应按 F30 的公开双相数值预留。'
  ,30: '档案守望者 → 勘误核心为固定两相战。完成的章程效果、会战幸存者效果与敌方数值全部可查看。'
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
    routeNote: ROUTE_NOTES[floor.number] ?? '此层没有额外的前瞻提示；门、敌人与奖励仍完整公开。',
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
      ? '三份章程、F30 两阶段基础数值与全部卡片门槛均为公开信息；章程选择不会购买或隐藏任何情报。'
      : '敌方顺序、配额与两阶段基础数值均为公开信息；会战可以无限预演，且不会扣除探索资源。',
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
    notice: '查看不会消耗卡片、金币、HP、MP 或回合；情报只提前公开固定规则，路线代价仍由你承担。',
    doctrines: currentNumber >= 11 ? getRouteDoctrineBriefing(state) : null,
    charters: currentNumber >= 21 ? getAct3CharterBriefing(state) : null,
    handoffs: currentNumber >= 21 ? getAct3HandoffBriefing(state) : null,
    current,
    upcoming: Object.freeze(upcoming),
    finale: currentNumber >= 11 ? finaleFacts(state) : null
  });
}
