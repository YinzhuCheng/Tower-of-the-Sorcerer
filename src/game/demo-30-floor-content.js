import { ACT3_CHARTERS, getAct3CharterForGate } from './act3-charters.js';
import { DEMO20_CONTENT_ID } from './demo-20-floor-content.js';

export const DEMO30_CONTENT_ID = 'demo-30f-afterlight-registry-v1';
export const DEMO30_NUMERIC_BASELINE_ID = 'demo-30f-afterlight-route-baseline-v2';

const GRID_SIZE = 11;

function parseMap(text) {
  const rows = text.trim().split('\n').map((row) => row.trim().split(/\s+/));
  if (rows.length !== GRID_SIZE || rows.some((row) => row.length !== GRID_SIZE)) {
    throw new Error(`Act III floor maps must remain 11×11 (rows=${rows.length}; widths=${rows.map((row) => row.length).join(',')}).`);
  }
  return rows;
}

function floor({ number, title, objective, intro, map, roomPlan, puzzles = {}, exitGuardians = [], boss, theme, shopOptionIds, shopEffectMultiplier }) {
  return {
    id: number - 1,
    number,
    title,
    objective,
    intro,
    map: parseMap(map),
    roomPlan,
    puzzles,
    exitGuardians,
    boss,
    theme,
    shopOptionIds,
    shopEffectMultiplier,
    demoContentId: DEMO30_CONTENT_ID
  };
}

const THEMES = Object.freeze([
  { floor: 0x27333d, floorAlt: 0x455660, wall: 0x75838b, glow: 0xffd892, fog: 0x151b1e },
  { floor: 0x263640, floorAlt: 0x3b5963, wall: 0x67868d, glow: 0x9ae9e0, fog: 0x101d20 },
  { floor: 0x37283b, floorAlt: 0x5b3c63, wall: 0x946e9b, glow: 0xffbddc, fog: 0x211422 },
  { floor: 0x263448, floorAlt: 0x3d5574, wall: 0x6888ad, glow: 0x9bc8ff, fog: 0x111a2c },
  { floor: 0x3a3027, floorAlt: 0x62503c, wall: 0x9f855b, glow: 0xffdb85, fog: 0x21190f },
  { floor: 0x2b2c46, floorAlt: 0x474a6c, wall: 0x787dad, glow: 0xc8ccff, fog: 0x16172a },
  { floor: 0x203a40, floorAlt: 0x35636a, wall: 0x5a99a1, glow: 0x8fffe8, fog: 0x0e2224 },
  { floor: 0x402839, floorAlt: 0x69425b, wall: 0xaa708e, glow: 0xff9ec6, fog: 0x25121d },
  { floor: 0x2d273e, floorAlt: 0x4b4164, wall: 0x8476a7, glow: 0xe0c7ff, fog: 0x171321 },
  { floor: 0x211d30, floorAlt: 0x3c3152, wall: 0x76628d, glow: 0xffd27f, fog: 0x110d19 }
]);

export const DEMO30_NUMERIC_BASELINE = Object.freeze({
  cinderScribe: { hp: 4600, atk: 326, def: 252, gold: 1450 },
  ashCustodian: { hp: 7200, atk: 344, def: 270, gold: 2100, boss: true },
  shelterWarden: { hp: 7600, atk: 352, def: 274, gold: 2500, special: 'firstStrike' },
  auditBailiff: { hp: 6900, atk: 338, def: 268, gold: 2600, boss: true, special: 'magic', magicPower: 270 },
  relayRunner: { hp: 5200, atk: 334, def: 260, gold: 1650, special: 'firstStrike' },
  relayConductor: { hp: 7800, atk: 354, def: 276, gold: 2400, boss: true, special: 'doubleHit' },
  ledgerMage: { hp: 5600, atk: 342, def: 266, gold: 1750, special: 'magic', magicPower: 245 },
  archiveLancer: { hp: 8300, atk: 362, def: 278, gold: 2800, boss: true, special: 'firstStrike' },
  shelfWarden: { hp: 6100, atk: 350, def: 272, gold: 1900 },
  triageKnight: { hp: 6500, atk: 366, def: 280, gold: 2000, special: 'doubleHit' },
  // F27's commitment is now expensive in the fight where it is made: a
  // player cannot take the finale benefit without paying a real first-battle
  // cost on that guardian.
  marginDuelist: { hp: 7100, atk: 381, def: 282, gold: 2250, boss: true, special: 'firstStrike' },
  errataCantor: { hp: 6800, atk: 354, def: 276, gold: 2200, boss: true, special: 'magic', magicPower: 294 },
  archiveMarshal: { hp: 9000, atk: 385, def: 286, gold: 3100, boss: true },
  indexBeast: { hp: 8000, atk: 378, def: 288, gold: 2600, special: 'doubleHit' },
  lastCustodian: { hp: 9400, atk: 384, def: 292, gold: 3300, boss: true, special: 'firstStrike' },
  archiveWarden: { hp: 13_728, atk: 400, def: 310, gold: 0, boss: true, special: 'magic', magicPower: 443, phaseNext: 'errataCore' },
  errataCore: { hp: 16_016, atk: 515, def: 310, gold: 0, boss: true, finalBoss: true, special: 'doubleHit' }
});

const ACT3_FLOORS = Object.freeze([
  floor({
    number: 21, title: '余烬信库', intro: 'floor21',
    objective: '上行前选择一条送信古道；本轮只会开启一座侧库。',
    roomPlan: ['余烬入口', '未投递信箱', '三份章程台', '补给回廊', '上行记录门'],
    theme: THEMES[0],
    map: `
      # # # # # # # # # # #
      # item:act3Restorative . item:sun . . . item:star . U #
      # . # # # . # # . . #
      # . . . enemy:cinderScribe . . . # . #
      # . # . # # # . # . #
      # item:moon . . # item:act3Dual . . . . #
      # . # . # . # . # . #
      # . # . . . # . . . #
      # . # # # . # # # # #
      # D . enemy:cinderScribe . item:act3Mana . enemy:relayRunner . . #
      # # # # # # # # # # #
    `
  }),
  floor({
    number: 22, title: '夜航侧库', intro: 'floor22',
    objective: '击败灰烬保管人上行；夜航侧库需要月辉卡 ×2。',
    roomPlan: ['夜航落点', '主书架回廊', '护送侧库', '月卡前室', '上行灯桥'],
    theme: THEMES[1], exitGuardians: ['ashCustodian'], boss: 'ashCustodian',
    puzzles: { cardGates: { f22ShelterAnnex: { moon: 2 } } },
    map: `
      # # # # # # # # # # #
      # item:shelterAegis gate:f22ShelterAnnex enemy:shelterWarden # . . . . U #
      # # . # . # . # # . #
      # item:moon . . # . . . # . #
      # . # # # # # . # . #
      # . . item:act3Def . . . enemy:cinderScribe . . #
      # . # . # # # . # # #
      # . # . . . # . . . #
      # . # # # . # # # . #
      # D . enemy:ashCustodian . item:act3Hp . enemy:relayRunner . . #
      # # # # # # # # # # #
    `
  }),
  floor({
    number: 23, title: '星镜辨真室', intro: 'floor23',
    objective: '击败持镜守官上行；星镜侧库需要星蚀卡 ×2。',
    roomPlan: ['校验落点', '错误边注廊', '逐页内室', '星卡前台', '上行装订桥'],
    theme: THEMES[2], exitGuardians: ['auditBailiff'], boss: 'auditBailiff',
    puzzles: { cardGates: { f23AuditAnnex: { star: 2 } } },
    map: `
      # # # # # # # # # # #
      # . . . # item:auditLedger gate:f23AuditAnnex enemy:auditBailiff . . #
      # . # . # # # . # . #
      # item:star . . . . # . . . #
      # . # # # . # # . . #
      # . . enemy:ledgerMage . . . # . . #
      # # . # # # . # . # #
      # . . . # item:act3Atk . # . . #
      # . # . # . # . # . #
      # D . enemy:auditBailiff U item:moon . enemy:shelfWarden . . #
      # # # # # # # # # # #
    `
  }),
  floor({
    number: 24, title: '赤焰传火室', intro: 'floor24',
    objective: '击败传火守卫上行；传火侧库需要日、月卡各 1 张。',
    roomPlan: ['接力落点', '信号折返线', '灯塔内室', '双色门槛', '上行发报台'],
    theme: THEMES[3], exitGuardians: ['relayConductor'], boss: 'relayConductor',
    puzzles: { cardGates: { f24RelayAnnex: { sun: 1, moon: 1 } } },
    map: `
      # # # # # # # # # # #
      # item:relayCapacitor gate:f24RelayAnnex enemy:relayRunner # . . . . U #
      # # . # . # . # # . #
      # item:sun . . # . . . . . #
      # . # # # # # . # . #
      # . . . enemy:ledgerMage . . . # . #
      # . # . # # # . # . #
      # . # . . item:act3Mana # . . . #
      # . # # # . # . # # #
      # D . enemy:relayConductor . item:star . enemy:cinderScribe . . #
      # # # # # # # # # # #
    `
  }),
  floor({
    number: 25, title: '断誓庭', intro: 'floor25',
    objective: '缺页封条需要日曜 ×1、月辉 ×2、星蚀 ×1。',
    roomPlan: ['缺页入口', '三色索引廊', '药剂夹层', '封条门庭', '上行缝隙'],
    theme: THEMES[4],
    puzzles: { cardGates: { f25MissingSeal: { sun: 1, moon: 2, star: 1 } } },
    map: `
      # # # # # # # # # # #
      # . . . # U # . . . #
      # . # . # gate:f25MissingSeal # . # . #
      # . # . . . . . # . #
      # . # # # . # # # . #
      # item:act3Restorative . enemy:archiveLancer . item:act3Dual . . . . #
      # . # . # . # . # . #
      # . # . . enemy:ledgerMage . . # . #
      # . # # # . # # # . #
      # D . item:moon enemy:shelfWarden . item:star . item:sun . #
      # # # # # # # # # # #
    `
  }),
  floor({
    number: 26, title: '折角集市', intro: 'floor26',
    objective: '本幕唯一商店；购买效果与价格都写在柜台上。',
    roomPlan: ['集市入口', '折角柜台', '高阶咏唱架', '余烬补给线', '上行账台'],
    theme: THEMES[5], shopOptionIds: ['hp', 'atk', 'def', 'mpRestore', 'maxMp'], shopEffectMultiplier: 2.85,
    map: `
      # # # # # # # # # # #
      # item:act3Def . . # . . . . U #
      # . # . # . # # # . #
      # . # . . . # shop # . #
      # . # # # . # shop # . #
      # . . enemy:triageKnight . . . . . . #
      # # . # # # . # . # #
      # . . . # item:act3Hp . # . . #
      # . # . # . # . # . #
      # D . enemy:marginDuelist . item:act3Atk . enemy:errataCantor . . #
      # # # # # # # # # # #
    `
  }),
  floor({
    number: 27, title: '三道校场', intro: 'floor27',
    objective: '三名校场守卫全部落败后上行；首战决定终局支援。',
    roomPlan: ['校场落点', '刃线跑道', '咏线跑道', '总管中央台', '上行鸣钟'],
    theme: THEMES[6], exitGuardians: ['marginDuelist', 'errataCantor', 'archiveMarshal'], boss: 'archiveMarshal',
    puzzles: { guardianGates: { f27RelaySeal: ['marginDuelist', 'errataCantor', 'archiveMarshal'] } },
    map: `
      # # # # # # # # # # #
      # . . . # U # . . . #
      # . # . # gate:f27RelaySeal # . # . #
      # . # . . . . . # . #
      # . # # # . # # # . #
      # . enemy:marginDuelist . # . # . enemy:errataCantor . #
      # . # . # . # . # . #
      # . # . . enemy:archiveMarshal . . # . #
      # . # # # . # # # . #
      # D . item:act3Mana enemy:triageKnight . item:act3Dual . item:act3Hp . #
      # # # # # # # # # # #
    `
  }),
  floor({
    number: 28, title: '书页风暴', intro: 'floor28',
    objective: '上行阶梯已经开放；可选区域提供生命或 MP 补给。',
    roomPlan: ['风暴入口', '重排书架', '生命夹层', '魔力夹层', '上行静室'],
    theme: THEMES[7],
    map: `
      # # # # # # # # # # #
      # item:act3Restorative . . # U # . . item:act3Mana #
      # . # . # . # . # . #
      # . # . . enemy:indexBeast . . # . #
      # . # # # . # # # . #
      # . . . # . # . . . #
      # # . # . # . # . # #
      # . . . # item:act3Atk . # . . #
      # . # . # . # . # . #
      # D . enemy:lastCustodian . item:moon . enemy:errataCantor . . #
      # # # # # # # # # # #
    `
  }),
  floor({
    number: 29, title: '最后名册', intro: 'floor29',
    objective: '击败两名索引守卫后上行；为 F30 预留资源。',
    roomPlan: ['索引落点', '左页守卫廊', '右页守卫廊', '封底门庭', '终局上行阶'],
    theme: THEMES[8], exitGuardians: ['lastCustodian', 'archiveMarshal'], boss: 'lastCustodian',
    puzzles: { guardianGates: { f29IndexSeal: ['lastCustodian', 'archiveMarshal'] } },
    map: `
      # # # # # # # # # # #
      # # . . # U # . . . #
      # . # . # gate:f29IndexSeal # . # . #
      # . # . . enemy:indexBeast . . # . #
      # . # # # . # # # . #
      # . enemy:lastCustodian . # . # . enemy:archiveMarshal . #
      # . # . # . # . . . #
      # . # . . enemy:ledgerMage . . # . #
      # . # # # . # # # . #
      # D . item:act3Hp enemy:triageKnight . item:act3Mana . item:star . #
      # # # # # # # # # # #
    `
  }),
  floor({
    number: 30, title: '余烬灯塔', intro: 'floor30',
    objective: '依次击败灯塔守望者与错誓之核。',
    roomPlan: ['灯塔落点', '余烬补给环', '守望者前庭', '勘误封印桥', '双相终局台'],
    theme: THEMES[9], boss: 'errataCore',
    map: `
      # # # # # # # # # # #
      # item:act3Dual . . # enemy:errataCore # . . item:act3Hp #
      # . # . # . # . # . #
      # . # . # enemy:archiveWarden # . # . #
      # . # . # . # . # . #
      # . . enemy:indexBeast . item:act3Mana . enemy:errataCantor . . #
      # . # . # . # . # . #
      # . # . . . # . . . #
      # . # # # . # # # . #
      # D . enemy:triageKnight . item:act3Restorative . enemy:marginDuelist . . #
      # # # # # # # # # # #
    `
  })
]);

const ACT3_ITEMS = Object.freeze({
  act3Restorative: { name: '余烬药函', kind: 'stat', hp: 11_000, maxHp: 11_000, relic: '余烬药函', description: '生命上限与当前生命 +11000。' },
  act3Hp: { name: '编页药露', kind: 'stat', hp: 6200, maxHp: 6200, relic: '编页药露', description: '生命上限与当前生命 +6200。' },
  act3Atk: { name: '星纹刃签', kind: 'stat', atk: 13, relic: '校订刃签', description: '攻击 +13。' },
  act3Def: { name: '月蜡护符', kind: 'stat', def: 13, relic: '护页封蜡', description: '防御 +13。' },
  act3Dual: { name: '双纹护符', kind: 'stat', atk: 10, def: 10, relic: '双栏校样', description: '攻击、防御各 +10。' },
  act3Mana: { name: '灯塔余能', kind: 'stat', mp: 100, relic: '灯塔余能', description: '恢复 100 MP。' },
  shelterAegis: { name: '月影护信印', kind: 'stat', hp: 13_000, maxHp: 13_000, def: 16, relic: '夜航护送印', description: '生命上限与当前生命 +13000，防御 +16；F30 每阶段少结算 3 次反击。' },
  auditLedger: { name: '星镜辨真簿', kind: 'stat', atk: 20, def: 8, relic: '逐页校验簿', description: '攻击 +20，防御 +8；F30 两相均获得校验削弱。' },
  relayCapacitor: { name: '赤焰传火炉心', kind: 'stat', maxMp: 60, mp: 160, relic: '灯塔接力电容', description: '最大 MP +60 并恢复 160 MP；F27 总管落败后再次补满。' }
});

function installItems(items) {
  for (const [id, entry] of Object.entries(ACT3_ITEMS)) {
    if (!items[id]) items[id] = { ...entry };
  }
}

function installEnemies(enemies) {
  const portraits = {
    cinderScribe: 'act3_cinder_scribe', ashCustodian: 'act3_ash_custodian', shelterWarden: 'act3_shelter_warden',
    auditBailiff: 'act3_audit_bailiff', relayRunner: 'act3_relay_runner', relayConductor: 'act3_relay_conductor',
    ledgerMage: 'act3_ledger_mage', archiveLancer: 'act3_archive_lancer', shelfWarden: 'act3_shelf_warden',
    triageKnight: 'act3_triage_knight', marginDuelist: 'act3_margin_duelist', errataCantor: 'act3_errata_cantor',
    archiveMarshal: 'act3_archive_marshal', indexBeast: 'act3_index_beast', lastCustodian: 'act3_last_custodian',
    archiveWarden: 'act3_archive_warden', errataCore: 'act3_errata_core'
  };
  const names = {
    cinderScribe: '余烬抄写灵', ashCustodian: '灰烬保管人', shelterWarden: '夜航守柜人',
    auditBailiff: '持镜守官', relayRunner: '传火信使', relayConductor: '传火守卫',
    ledgerMage: '页灵术士', archiveLancer: '折页枪卫', shelfWarden: '书架守卫',
    triageKnight: '分诊骑士', marginDuelist: '边注决斗者', errataCantor: '错誓咏唱者',
    archiveMarshal: '传火统领', indexBeast: '噬信兽', lastCustodian: '最后保管人',
    archiveWarden: '灯塔守望者', errataCore: '错誓之核'
  };
  const floorByEnemy = {
    cinderScribe: 21, ashCustodian: 22, shelterWarden: 22, auditBailiff: 23, relayRunner: 24,
    relayConductor: 24, ledgerMage: 25, archiveLancer: 25, shelfWarden: 25, triageKnight: 26,
    marginDuelist: 27, errataCantor: 27, archiveMarshal: 27, indexBeast: 28, lastCustodian: 28,
    archiveWarden: 30, errataCore: 30
  };
  for (const [id, numeric] of Object.entries(DEMO30_NUMERIC_BASELINE)) {
    if (enemies[id]) continue;
    enemies[id] = {
      name: names[id], portrait: portraits[id], faction: '余烬信库', floor: floorByEnemy[id],
      ...numeric,
      description: '余烬信库的守卫。悬停即可查看战斗规则、当前数值和预计耗血。'
    };
  }
  enemies.archiveWarden.defeatDialogue = 'bossArchiveWardenPost';
  enemies.errataCore.defeatDialogue = 'ending';
}

function turn(speaker, portrait, text, extras = {}) { return Object.freeze({ speaker, portrait, text, ...extras }); }
function sequence(title, turns) { return Object.freeze({ title, turns: Object.freeze(turns) }); }

function installDialogues(dialogues) {
  Object.assign(dialogues, {
    floor21: sequence('第二十一阵：余烬信库', [
      turn('旁白', null, '七灯熄灭以后，高塔没有变得空荡。相反，三年来被困在誓火里的纸片、船票、名牌与家书全从墙缝里落了出来，堆成一座没有尽头的信库。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '守夜已经结束，可这些话还没有抵达该去的人手里。余烬灯塔能送它们出去，但通往灯塔的三条古道都坏了。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '月影道护住信物，星镜道分辨真伪，赤焰道负责把灯火一站站传出去。当年它们本来就是一起工作的。', { expression: 'regret' }),
      turn('绫星·璃', 'hero', '我们没办法一次把三条路都修好。先选一条最适合现在这支队伍的，其他两条留给主路自己撑过去。', { expression: 'resolve' }),
      turn('无声女王·诺克缇娅', 'final_queen', '不管选哪一条，最后都要把这些信送到灯塔。三年前我们没听完别人的声音，这一次不要再让它们停在半路。', { expression: 'grave' })
    ]),
    floor22: sequence('第二十二阵：夜航侧库', [
      turn('旁白', null, '夜航侧库里堆着最脆弱的一批信匣。旧警戒火仍会攻击任何试图把东西带出塔的人，仿佛离开高塔本身就是背叛。', { kind: 'narration' }),
      turn('猫卫长·米露', 'cat_boss', '我三年前试过把几封报平安的信绑在盔甲里送出去。每次跨过白线，火阵都把它们当成敌人。'),
      turn('猫卫长·米露', 'cat_boss', '月影护信印能让火阵看见：这封信从谁手里来、要送到哪里、一路由谁护着。不是为了盘问，是为了让它别再把回家的东西烧掉。'),
      turn('绫星·璃', 'hero', '先把主路打开。若我们选了月影道，就再进侧库把护信印拿走。', { expression: 'resolve' })
    ]),
    floor23: sequence('第二十三阵：星镜辨真室', [
      turn('旁白', null, '长桌上摆着互相矛盾的纸页：同一个名字，一张说仍在灰港，另一张却盖着北岸船印。纸张都是真的，差别只在它们来自不同的时刻。', { kind: 'narration' }),
      turn('深蓝歌姬·澜音', 'whale_boss', '别只看哪张纸更新。海上的旧钟声比后来重抄的红字更早，可它有船号、港钟和我的鲸歌一起作证。'),
      turn('旁白', null, '澜音唱出北辰七号的船号。水镜先映出缆绳，随后是北岸钟楼，再之后才是船长的回答。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '星镜不替我们选“喜欢的答案”。它只是把同一件事留下的痕迹摆在一起，让谎言没法只靠更亮的墨水压住旧声。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '若我们走的是星镜道，侧库里的辨真簿能让最后守塔的怪物失去一部分护身咒。', { expression: 'focus' })
    ]),
    floor24: sequence('第二十四阵：赤焰传火室', [
      turn('旁白', null, '三座远方哨塔的火盆全是冷的。灰港早已安静，可外面的守望者仍不知道守夜已经结束。', { kind: 'narration' }),
      turn('龙姬·焰璃', 'dragon_boss', '这一次别一口气把火推到最远。先点亮第一座，让它回一声；再让第一座去点第二座。火要有人接，才算真的传出去。'),
      turn('旁白', null, '焰璃把掌心贴上铜管，第一座哨塔终于亮起一簇小小的橙火。远处传回一声钟响。', { kind: 'narration' }),
      turn('龙姬·焰璃', 'dragon_boss', '听见没？这才叫送到。'),
      turn('残响精灵·纱雾', 'guide', '若我们走赤焰道，侧库里的传火炉心会扩大共鸣容量，并在后面的三道校场再补满一次。', { expression: 'focus' })
    ]),
    floor25: sequence('第二十五阵：断誓庭', [
      turn('旁白', null, '庭院中央漂着一页被撕碎的古誓。上面还能辨认出最后一句：“钟响之后，名字留存，守夜终止，后来之事可再补记。”', { cg: '/assets/anime/cg/liyue-noctia-missing-page-cg-audit-v3.webp', cgHold: 7, kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '是我的续夜之印让这一页失去了位置。它和“永远守夜”无法同时存在，所以高塔把结束仪式当成了矛盾。', { expression: 'regret' }),
      turn('无声女王·诺克缇娅', 'final_queen', '把它拼回去。不是为了抹掉过去，而是让后来的人知道：守夜本来就可以结束。', { expression: 'grave' }),
      turn('绫星·璃', 'hero', '四枚封蜡正好压住四处断口。把它带到灯塔，那里会成为新的誓尾。', { expression: 'resolve' })
    ]),
    floor26: sequence('第二十六阵：折角集市', [
      turn('旁白', null, '折角集市终于第一次准备打烊。珂珂把三年来积下的空瓶全堆到门边，柜台后只留下真正还能用的药。', { kind: 'narration' }),
      turn('阵间商人·珂珂', 'merchant', '别为了替我清仓乱买。看前面还要打什么，再看自己还剩多少命。'),
      turn('奥术主权者', 'arcane_sovereign', '三年前我说“不惜代价”，却从没站在你的柜台后面数过这些空瓶。', { expression: 'regret' }),
      turn('阵间商人·珂珂', 'merchant', '那就别数了。等灯塔把最后一批信送出去，你来帮我把真正欠下的药送到现在还需要的人手里。')
    ]),
    floor27: sequence('第二十七阵：三道校场', [
      turn('旁白', null, '三条跑道同时亮起：月影、星镜、赤焰。三名守卫分别握着一枚临战祝福，谁先倒下，哪一种祝福就先跟随队伍上灯塔。', { kind: 'narration' }),
      turn('影织姬·鸦羽', 'shadow_boss', '别找什么开关。第一剑砍谁，就是你选谁。'),
      turn('残响精灵·纱雾', 'guide', '月影能少吃几轮追击；星镜会削弱终局守卫；赤焰不会削敌，但会把共鸣重新灌满。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '这是临战选择，不会改掉我们前面走过的古道。看清楚代价，再出第一剑。', { expression: 'resolve' })
    ]),
    floor28: sequence('第二十八阵：书页风暴', [
      turn('旁白', null, '书页风暴撞进回廊。纸上反复响起三年前没能送达的句子：“船已靠岸”“名单少一人”“请告诉家里我没事”。', { kind: 'narration' }),
      turn('旁白', null, '有港务公函，也有孩子写歪的家书。它们没有目的地，便被旧誓一次次卷回塔内，久而久之，连一句报平安都被当成新的求救。', { cg: '/assets/anime/cg/liyue-noctia-archive-storm-cg-audit-v3.webp', cgHold: 4, kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我三年来听见的许多“求救”，原来只是没人替它们把最后一段路走完。', { expression: 'sorrow' }),
      turn('绫星·璃', 'hero', '先让风停。然后一封封送。不能因为不知道收件人在哪，就让它永远变成警钟。', { expression: 'resolve' })
    ]),
    floor29: sequence('第二十九阵：最后名册', [
      turn('旁白', null, '最后名册只接受“完整”与“作废”两种答案。少一处墨迹，整页就会被风吹回书页风暴。', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '这是我留下的坏习惯。我总觉得不知道就必须先填满，于是保管人宁可猜，也不敢写“尚未找到”。', { expression: 'regret' }),
      turn('绫星·璃', 'hero', '那就在名册里给“不知道”留位置。一个人的去向还没找到，不代表她从没存在，也不代表整页都该烧掉。', { expression: 'resolve' }),
      turn('旁白', null, '诺克缇娅与澜音在风里逐页收拢纸张，璃把已知与未知分开压上不同的蜡印。名册第一次不再要求所有故事都必须有结尾。', { kind: 'narration' })
    ]),
    floor30: sequence('第三十阵：余烬灯塔', [
      turn('旁白', null, '余烬灯塔的镜面朝向灰港与更远的北岸。最后保管人转动封底钥匙，成捆的家书与名牌沿着升降轨缓缓升向塔顶。', { cg: '/assets/anime/cg/liyue-archive-warden-entry-cg-audit-v3.webp', cgHold: 5, kind: 'narration' }),
      turn('旁白', null, '灯塔守望者挡在外环。它守的并不是某一条旧命令，而是所有被带到这里的原物：谁也不能为了让故事更顺利，就在最后一战偷偷换掉不方便的那一页。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '那就不换。我们带来的是什么，就让灯塔看见什么。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '守望者之后还有错誓之核。它是三年守夜留下的最后一团执念，会把任何矛盾重新拖回“继续守夜”。两场会连在一起。', { expression: 'focus' })
    ]),
    bossArchiveWardenPost: sequence('灯塔：守望者退剑', [
      turn('旁白', null, '灯塔守望者的长枪垂下。璃身后的信匣没有少一只，断誓残页也还完整夹在封带中。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '你们带来的东西没有被换过。我的职责到这里结束。'),
      turn('档案守望者', 'act3_archive_warden', '接下来那团错誓不会听我。它只知道矛盾必须被消灭，而最简单的办法，是让一切回到三年前。')
    ]),
    ending: sequence('终章：未寄之信', [
      turn('旁白', null, '错誓之核碎裂时，灯塔镜面第一次映出现在的灰港，而不是三年前的暴风夜。', { cg: '/assets/anime/cg/liyue-traceable-revocation-cg-audit-v3.webp', cgHold: 4, kind: 'narration' }),
      turn('旁白', null, '诺克缇娅把断誓残页放回古卷末尾。奥术主权者亲手在续夜之印旁刻下第二道印记：守夜已终，名字长存。', { kind: 'narration' }),
      turn('旁白', null, '月影护着第一批信匣穿过夜空；星镜把真假纠缠的纸页照成清楚的两面；赤焰从一座哨塔传向下一座，像一条终于学会向前走的火河。', { kind: 'narration' }),
      turn('旁白', null, '远方陆续传回钟声。有人收到三年前迟到的报平安，有人收到告别，也有人只得到“仍在寻找”的消息。没有一种回答被强迫变得更圆满。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我以前以为只要灯还亮着，就算没有放弃谁。现在才知道，真正要做的是把每个人的话送到该去的地方。', { cg: '/assets/anime/cg/liyue-noctia-afterlight-cg.webp', cgHold: 5, expression: 'sorrow' }),
      turn('阵间商人·珂珂', 'merchant', '北岸那边回信了。有人说要来灰港找旧码头，也有人只让我替他们把一束花放到海边。看吧，终于有新事要忙了。'),
      turn('旁白', null, '天亮时，余烬灯塔最后一次大放光芒。那不是警报，也不是求援，只是一束把信送向远方的普通灯火。', { cg: '/assets/anime/cg/liyue-lighthouse-archive-cg.webp', cgHold: 6, kind: 'narration' }),
      turn('绫星·璃', 'hero', '走吧。塔终于不是为了困住谁才亮着了。', { expression: 'resolve' })
    ])
  });
}

function validateActThree({ floors, enemies, items }) {
  const violations = [];
  const act3 = floors.filter((entry) => entry?.demoContentId === DEMO30_CONTENT_ID);
  if (act3.length !== 10 || act3.map((entry) => entry.number).join(',') !== '21,22,23,24,25,26,27,28,29,30') violations.push('floor-set');
  for (const entry of act3) {
    if (entry.map.length !== GRID_SIZE || entry.map.some((row) => row.length !== GRID_SIZE)) violations.push(`F${entry.number}:grid`);
    if (entry.number < 30 && !entry.map.flat().includes('U')) violations.push(`F${entry.number}:upper-stair`);
    if (entry.number === 30 && entry.map.flat().includes('U')) violations.push('F30:upper-stair');
    for (const guardian of entry.exitGuardians ?? []) {
      if (!entry.map.flat().includes(`enemy:${guardian}`)) violations.push(`F${entry.number}:guardian:${guardian}`);
      if (!enemies[guardian]?.boss) violations.push(`F${entry.number}:guardian-not-boss:${guardian}`);
    }
    const start = entry.map.flat().indexOf('D');
    const end = entry.map.flat().indexOf('U');
    if (entry.number < 30 && (start < 0 || end < 0 || !hasOpenMapPath(entry.map, start, end))) {
      violations.push(`F${entry.number}:sealed-layout`);
    }
  }
  for (const charter of ACT3_CHARTERS) {
    if (!items[charter.itemId]) violations.push(`item:${charter.itemId}`);
    if (!getAct3CharterForGate(charter.gateId)) violations.push(`gate:${charter.gateId}`);
  }
  if (!enemies.errataCore?.finalBoss || enemies.originCore?.finalBoss) violations.push('final-boss-contract');
  return Object.freeze({ id: DEMO30_CONTENT_ID, ok: violations.length === 0, violations: Object.freeze(violations) });
}

/** Checks only room connectivity with gates conceptually open.  Combat and
 * card feasibility are intentionally left to the replayed solver. */
function hasOpenMapPath(map, startIndex, endIndex) {
  const width = map[0]?.length ?? 0;
  if (!width) return false;
  const queue = [startIndex];
  const seen = new Set(queue);
  while (queue.length) {
    const index = queue.shift();
    if (index === endIndex) return true;
    const x = index % width;
    const y = Math.floor(index / width);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const next = ny * width + nx;
      if (nx < 0 || ny < 0 || nx >= width || ny >= map.length || seen.has(next) || map[ny][nx] === '#') continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return false;
}

/** Builds on the verified Act II runtime.  This module owns the F20 → F21
 * transition, so the old twenty-floor content and its topology validator stay
 * reproducible on their own. */
export function applyDemoThirtyFloorContent({ enemies, floors, items, dialogues } = {}) {
  if (!enemies || !Array.isArray(floors) || !items || !dialogues) throw new Error('30F runtime requires enemies, floors, items and dialogues.');
  if (floors.length === 30 && floors[29]?.demoContentId === DEMO30_CONTENT_ID) {
    return Object.freeze({ applied: false, id: DEMO30_CONTENT_ID, floors });
  }
  if (floors.length !== 20 || floors[19]?.demoContentId !== DEMO20_CONTENT_ID) {
    throw new Error('30F runtime expects the assembled twenty-floor campaign.');
  }
  installItems(items);
  installEnemies(enemies);
  installDialogues(dialogues);

  // F20 was the previous release ending.  It now heals and recharges just
  // enough to make Act III a new strategic chapter rather than an exhausted
  // victory lap; the stair appears exactly on core defeat.
  enemies.originCore.finalBoss = false;
  enemies.originCore.revealStair = true;
  enemies.originCore.reward = { hp: 36_000, maxHp: 4_000, maxMp: 40, mp: 160 };
  enemies.originCore.defeatDialogue = 'bossOriginCorePost';
  const f20 = floors[19];
  f20.objective = '完成会战并击败主权者与起源核心，前往第三幕。';
  f20.boss = 'originCore';

  floors.push(...ACT3_FLOORS.map((entry) => ({ ...entry, map: entry.map.map((row) => [...row]) })));
  const validation = validateActThree({ floors, enemies, items });
  if (!validation.ok) throw new Error(`30F content rejected: ${validation.violations.join(', ')}`);
  return Object.freeze({ applied: true, id: DEMO30_CONTENT_ID, numericBaselineId: DEMO30_NUMERIC_BASELINE_ID, floors: Object.freeze(ACT3_FLOORS), validation });
}

export function validateDemoThirtyFloorContent({ floors, enemies, items } = {}) {
  return validateActThree({ floors: floors ?? [], enemies: enemies ?? {}, items: items ?? {} });
}
