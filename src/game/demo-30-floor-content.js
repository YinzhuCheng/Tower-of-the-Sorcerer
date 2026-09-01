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
    number: 21, title: '余烬登记库', intro: 'floor21',
    objective: '上行前选择一份章程；本轮只会开启一座侧库。',
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
    number: 23, title: '逐页校验室', intro: 'floor23',
    objective: '击败持簿执行官上行；校验侧库需要星蚀卡 ×2。',
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
    number: 24, title: '灯塔接力室', intro: 'floor24',
    objective: '击败接力导体上行；接力侧库需要日、月卡各 1 张。',
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
    number: 25, title: '缺页庭', intro: 'floor25',
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
    number: 27, title: '接力校场', intro: 'floor27',
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
    number: 28, title: '归档风暴', intro: 'floor28',
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
    number: 29, title: '最后索引', intro: 'floor29',
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
    objective: '依次击败档案守望者与勘误核心。',
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
  act3Atk: { name: '校订刃签', kind: 'stat', atk: 13, relic: '校订刃签', description: '攻击 +13。' },
  act3Def: { name: '护页封蜡', kind: 'stat', def: 13, relic: '护页封蜡', description: '防御 +13。' },
  act3Dual: { name: '双栏校样', kind: 'stat', atk: 10, def: 10, relic: '双栏校样', description: '攻击、防御各 +10。' },
  act3Mana: { name: '灯塔余能', kind: 'stat', mp: 100, relic: '灯塔余能', description: '恢复 100 MP。' },
  shelterAegis: { name: '夜航护送印', kind: 'stat', hp: 13_000, maxHp: 13_000, def: 16, relic: '夜航护送印', description: '生命上限与当前生命 +13000，防御 +16；F30 每阶段少结算 3 次反击。' },
  auditLedger: { name: '逐页校验簿', kind: 'stat', atk: 20, def: 8, relic: '逐页校验簿', description: '攻击 +20，防御 +8；F30 两相均获得校验削弱。' },
  relayCapacitor: { name: '灯塔接力电容', kind: 'stat', maxMp: 60, mp: 160, relic: '灯塔接力电容', description: '最大 MP +60 并恢复 160 MP；F27 总管落败后再次补满。' }
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
    cinderScribe: '余烬抄写员', ashCustodian: '灰烬保管人', shelterWarden: '夜航守柜人',
    auditBailiff: '持簿执行官', relayRunner: '接力信使', relayConductor: '接力导体',
    ledgerMage: '账页术士', archiveLancer: '折页枪卫', shelfWarden: '书架守卫',
    triageKnight: '分诊骑士', marginDuelist: '边注决斗者', errataCantor: '勘误咏唱者',
    archiveMarshal: '接力总管', indexBeast: '索引兽', lastCustodian: '最后保管人',
    archiveWarden: '档案守望者', errataCore: '勘误核心'
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
      name: names[id], portrait: portraits[id], faction: '余烬登记库', floor: floorByEnemy[id],
      ...numeric,
      description: '余烬登记库的守卫。悬停即可查看战斗规则、当前数值和预计耗血。'
    };
  }
  enemies.archiveWarden.defeatDialogue = 'bossArchiveWardenPost';
  enemies.errataCore.defeatDialogue = 'ending';
}

function turn(speaker, portrait, text, extras = {}) { return Object.freeze({ speaker, portrait, text, ...extras }); }
function sequence(title, turns) { return Object.freeze({ title, turns: Object.freeze(turns) }); }

function installDialogues(dialogues) {
  Object.assign(dialogues, {
    floor21: sequence('第二十一阵：余烬登记库', [
      turn('残响精灵·纱雾', 'guide', '余烬登记库没有敌人名单，只有未投递的信、离港回执和三套修复章程。', { expression: 'gentle' }),
      turn('无声女王·诺克缇娅', 'final_queen', '它一次只能先接通一条修复线：护送、校验，或灯塔接力。', { expression: 'sorrow' }),
      turn('绫星·璃', 'hero', '不是决定谁更重要，而是决定先用哪种方法，让记录不再伤人。', { expression: 'resolve' })
    ]),
    floor22: sequence('第二十二阵：夜航侧库', [
      turn('猫卫长·米露', 'cat_boss', '夜航章程把仍在路上的回执护送到归档口，不再让它们被警报截走。'),
      turn('绫星·璃', 'hero', '月辉卡和战斗，是为这条安全路径付出的代价。完成后，终局每阶段少三次反击。')
    ]),
    floor23: sequence('第二十三阵：逐页校验室', [
      turn('深蓝歌姬·澜音', 'whale_boss', '校验章程逐页比对求援与离港记录，能把伪造的“仍待救援”标出来。'),
      turn('绫星·璃', 'hero', '两张星蚀卡换来两相削弱。先看执行官的魔法耗血。')
    ]),
    floor24: sequence('第二十四阵：灯塔接力室', [
      turn('龙姬·焰璃', 'dragon_boss', '接力章程重启灯塔，把已确认的结案送给仍在等待回应的地区。'),
      turn('绫星·璃', 'hero', '日、月卡各一张换来接力电容；F27 后会再补满一次魔力，留给终局。')
    ]),
    floor25: sequence('第二十五阵：缺页庭', [
      turn('残响精灵·纱雾', 'guide', '缺页封条锁着最后的签署原件。必须用日曜一张、月辉两张、星蚀一张才能补齐。'),
      turn('绫星·璃', 'hero', '这是所有修复线都绕不过的支出。原件会告诉我们如何终止，而不清空记录。')
    ]),
    floor26: sequence('第二十六阵：折角集市', [
      turn('阵间商人·珂珂', 'merchant', '三年前，我的价签被系统锁死；今天终于能自己决定把补给交给谁。'),
      turn('绫星·璃', 'hero', '价签都写着：血、刃、甲、补 MP、扩 MP。先算清哪一项能撑到 F30。')
    ]),
    floor27: sequence('第二十七阵：接力校场', [
      turn('影织姬·鸦羽', 'shadow_boss', '三位校场守卫分别承接护送、校验和接力。首战决定终局优先加载哪一种支援。'),
      turn('绫星·璃', 'hero', '三人仍都要打；先后只决定有限的准备顺序，不决定谁被放弃。'),
      turn('残响精灵·纱雾', 'guide', '具体效果和预计耗血，都写在各自的战斗说明里。')
    ]),
    floor28: sequence('第二十八阵：归档风暴', [
      turn('无声女王·诺克缇娅', 'final_queen', '风暴里飘着没能送达的最后一句话。它们不该再被系统拿去驱动守卫。', { expression: 'sorrow' }),
      turn('残响精灵·纱雾', 'guide', '上行阶梯已经开放；可选区域有生命和 MP 补给。', { expression: 'gentle' }),
      turn('绫星·璃', 'hero', '拿不拿，要看终局还缺什么。', { expression: 'resolve' })
    ]),
    floor29: sequence('第二十九阵：最后索引', [
      turn('最后保管人', 'crown_magus', '我们被命令保护“不完整的记录”，因为系统认定缺一页就必须从头重算。'),
      turn('绫星·璃', 'hero', '记录可以标注缺失，不能因此抹掉所有已经确认的事。'),
      turn('最后保管人', 'crown_magus', '击败两名索引守卫后，灯塔楼梯会显现。')
    ]),
    floor30: sequence('第三十阵：余烬灯塔', [
      turn('旁白', null, '灯塔的镜面朝向灰港。最旧的协议在光里展开：冻结、清零、重建。没有一条写着“归还”。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '原始协议规定：发现矛盾记录时，先冻结，再由勘误核心清零重建。执行即是守护。', { expression: 'duty' }),
      turn('无声女王·诺克缇娅', 'final_queen', '这就是我一直害怕的“结案”。可原件已经证明，还有归档模式。', { expression: 'grave' }),
      turn('绫星·璃', 'hero', '你守的是旧条文；我们守的是被条文困住的人。先过守望者，再阻止勘误核心。', { expression: 'resolve' }),
      turn('档案守望者', 'act3_archive_warden', '若你们能写出不清零的答案，我会让出灯塔。', { expression: 'duty' })
    ]),
    bossArchiveWardenPost: sequence('灯塔：守望者停机', [
      turn('档案守望者', 'act3_archive_warden', '守望协议结束。勘误核心仍会按旧规则，将矛盾记录清零。', { expression: 'duty' }),
      turn('残响精灵·纱雾', 'guide', '现在。把见证者留下的名字写进归档栏。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '第二阶段。我要在它清零前写入归档。', { expression: 'resolve' })
    ]),
    ending: sequence('终章：未投递的信', [
      turn('旁白', null, '余烬灯塔亮起新的灯语。它没有命令任何人留下，只向远方回答：已收到。', { cg: '/assets/anime/cg/liyue-lighthouse-archive-cg.webp', kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '灯塔转入归档。未投递的信不再被重放，将等待能收到它们的人。', { expression: 'gentle' }),
      turn('无声女王·诺克缇娅', 'final_queen', '灰港的名字都在：离港者、罹难者、等待的人。它们终于不必再证明自己存在。', { expression: 'knowing' }),
      turn('绫星·璃', 'hero', '记录留下，命令结束。以后由活着的人决定怎样继续。', { expression: 'resolve' })
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
