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
      turn('旁白', null, '起源核心沉寂后，旧升降梯又向上爬了一段。门缝刚亮，成捆信匣便从塔顶夹层滑落，蜡封上全是三年前的灰。', { kind: 'narration' }),
      turn('旁白', null, '这里不像王庭或炉室，倒像一座被仓促遗弃的邮局。墙上三枚灯牌分别写着“护送”“校验”“接力”，它们通往不同的侧库，却都指向最高处的余烬灯塔。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '现在可以把篡改链说完整了：奥术主权者删去三日期限，起源核心挪用三席旧确认，虚空先驱又截走离港回执。不是灰港没有结案，是结案被拆散了。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '第一步发生在风暴断讯时。奥术主权者怕三天后还有生还者没被找到，所以把“三日后复核撤销”改成“无限延长”。他想防止过早收队，却没写新的停止条件。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '我当时以为，多等一天不过是多烧几盏灯。可我没有站在灰港的雨里，没有看见米露的爪子、焰璃的炉火、那些每天被重新扣掉的药和守卫的三年。真正承担代价的人离我太远，所以我把自己的担心写成了一道别人无法退出的命令。', { expression: 'regret' }),
      turn('残响精灵·纱雾', 'guide', '第二步是起源核心擅自补写。航路、补给、名簿三席曾在停电后各自同意“临时继续救援”；核心为了让无限延长看起来已经通过三席核验，把那三份晚了十七分钟、本来只针对停电的回答，挪到了主权者的命令下面。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '所以它没伪造笔迹，也没编一句新话。它只是拿了三句真话，剪掉原来的时间和用途，拼出一份从未被三席同意过的总印。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '第三步是虚空先驱。它不是另一个藏在后面的人，而是旧命令留在航渠里的截留器。“全员安全前，任何结案回执均不可信”——它照这条规则把真回执引进主权上层封印，标成了待复核。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '发令的人是我，挪用确认的是核心，截留回执的是它产生的先驱。三者没有在密室里共谋，可三个错误首尾相接，才把灰港的一夜困了三年。', { expression: 'regret' }),
      turn('无声女王·诺克缇娅', 'final_queen', '这只信匣上写着“全员离港”。三年来，我听见的只有“等待确认”……真到了要拆开它的时候，手反而不听使唤。', { expression: 'sorrow' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我封塔，是因为我以为警报一停，这些名字就会被当成从未存在。现在我才看见，真正没有被听见的，恰恰是他们已经离港、已经罹难，或仍需查找的不同回答。', { expression: 'sorrow' }),
      turn('残响精灵·纱雾', 'guide', '起源核心刚才停下的只是那些强制命令。这里还存着旧命令的抄本和没送出去的原件。若现在一把熄掉整座塔，复明后旧抄本仍可能重新生效，信匣也会再次失去“送到哪里、有没有收到”的记载。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '更糟的是，断电会留下一批只有原文、没有去向记载的信。复电后，勘误核心会把每一句“请回答”重新判成求援，再按无限延长的副本召回所有守卫。我们要做的是换好这套记录方法，不是把记录和灯一起砸掉。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '我们现在不是在三条“真相”里选一条。真相已经查清了，接下来只是决定先补哪块最容易再次出事的地方：先保证回执送得到、先保证真伪分得清，还是先保证结案能一路传到外面的哨站。三条都能走到灯塔，只是先扛的风险不同。', { expression: 'gentle' }),
      turn('残响精灵·纱雾', 'guide', '夜航护送章程先解决“信会在路上被烧掉”。要打开那座侧库，需要两张月辉卡；守柜人会用实战确认我们能不能把原件完整护过警戒线。通过之后，护送印会把护幕撑得更厚；到了灯塔的两场硬仗，它还能替我们挡下几次迎面的反击。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '逐页校验先治的是另一种病：明明是真回执，却因为时间更早、格式不合，被当成假的。两张星蚀卡能打开校验内室。我们若在那里把姓名、船号、时间和来源一项项对齐，灯塔最后两名守卫靠错误记录维持的那层防护也会一起松掉。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '灯塔接力解决的是最朴素、也最容易被忽略的问题：我们把结案写好了，外面到底有没有人收到。日曜、月辉各一张能把三座哨站重新接起来。它不会让最后的守卫凭空变弱，却能让共鸣池容下更多魔力，并在后面的长战里多给我们两次喘息的机会。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '所以不是在三个“正确答案”里猜一个。护送是替我们挡，校验是先拆对面的防护，接力则让我们在长战里多几口魔力。先补哪一处，要看我们现在最怕哪一种风险。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '签下章程本身不会立刻拿走任何东西。真正的代价都在对应侧库门前写得清清楚楚；另外两座侧库也不会因此消失。先看手里的卡牌和还剩多少余地，再决定把哪一段修复放在最前面。', { expression: 'resolve' })
    ]),
    floor22: sequence('第二十二阵：夜航侧库', [
      turn('旁白', null, '夜航书架沿墙排成一条窄巷。每只信匣都写着收件地，却没有送达印；守柜人的枪尖仍对准所有出口。', { kind: 'narration' }),
      turn('旁白', null, '灰烬保管人守在主回廊上，身后是通往逐页校验室的灯桥；另一名夜航守柜人站在侧库内，脚边放着一枚尚未启用的护送印。两人不争夺信件，只是都在等一份能通过旧警戒的完整移交记录。', { kind: 'narration' }),
      turn('猫卫长·米露', 'cat_boss', '那一夜，警报会攻击所有离塔的东西，连报平安的回执也不例外。我们只能抱着信匣躲回侧库，眼看最后一班船离岸。'),
      turn('猫卫长·米露', 'cat_boss', '我试过把回执系在盔甲里，也试过从通风井送出去。每次一越过白线，火阵就认定我在携带“未经复核的结案证据”逃离。我不是没送过；是我送一次，它就烧一次。'),
      turn('猫卫长·米露', 'cat_boss', '护腕都磨白了。我守了三年，不是舍不得这些箱子，是怕门一开，最后的回信又被当成敌人烧掉。'),
      turn('旁白', null, '璃从最上层抽出一匣。寄件人在正面写了三次“母亲收”，第四次改成“若无人签收，请放在旧码头的石狮下”。她没有说安慰的话，只把脱落的蜡屑拢进纸袋，连同信匣一起放稳。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '护送章程不会改这封信的一个字。它只在外面添一张行程单：谁从哪台取件，经过哪道检查，与谁同行，最后由谁签收。警戒线可以检查这张单，不再有理由烧掉原件。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '如果我们签的是夜航章程，就用两张月辉卡打开侧库，接受守柜人的检验；如果没有签，也可以沿主路继续向上，不会有人因为没选这条路而强迫我们交卡。', { expression: 'focus' }),
      turn('猫卫长·米露', 'cat_boss', '护送印会把谁拿走信匣、从哪条路走、最后交给谁都记下来。警戒线有东西可查，就不会再把回信当成偷跑出去的敌人。至于最后那两场硬仗——它还能替我们多挡几次迎面的追击。'),
      turn('猫卫长·米露', 'cat_boss', '守柜人不会因为我们讲得有道理就放行。他要看的是：被拦下来的时候，我们还能不能把东西抱稳。先看看自己还剩多少力气，再决定要不要拿两张月辉卡走这条路。别为了证明勇敢，把信匣和自己一起摔在门口。'),
      turn('绫星·璃', 'hero', '我们不销毁警报，也不强迫守柜人放行。先证明回执能被护到归档口，再让米露亲手送出第一匣。', { expression: 'resolve' }),
      turn('旁白', null, '她将信匣放回原位，把行程单的空白夹在蜡封下。主回廊的灰烬保管人同时举枪；无论是否进侧库，想上楼都要先让它承认，这批记录有了新的经手人。', { kind: 'narration' })
    ]),
    floor23: sequence('第二十三阵：逐页校验室', [
      turn('旁白', null, '灰烬保管人的钥匙在灯桥上转过半圈，夜航书架终于停止封锁上行口。米露留在后方重新点数信匣，璃则带着第一份行程记录进入校验室。', { kind: 'narration' }),
      turn('旁白', null, '校验室的长桌上，同一个名字常有两页：左页写“等待救援”，右页却盖着船号与离港时刻。两页都是真纸，只有来源不同。', { kind: 'narration' }),
      turn('深蓝歌姬·澜音', 'whale_boss', '起源核心重新誊抄记录时复制了旧求援页，却没带上被虚空先驱截走的回执。新副本印章更晚，持簿执行官便把右页当成伪造。'),
      turn('深蓝歌姬·澜音', 'whale_boss', '它只听“最后响起的那一声”。偏偏断电后重印的旧求援比真回执更晚，于是那张错页每次都压在最上面。可时间晚，不等于声音真。船长的原音更早，却有船号、港钟和我的回声一起对得上。'),
      turn('旁白', null, '澜音逐字唱出船号。水镜先响起缆绳摩擦木桩的声音，随后是北岸港钟，再之后才是船长的回话。她在最后一个音节落下后停了很久——三年来，她第一次听见这条航线真正结束。', { kind: 'narration' }),
      turn('旁白', null, '水镜里，最后一艘撤离船的缆绳离开灰港，半夜前抵达北岸。船长报出“全员离港”时，澜音的鲸歌在背景里给出了回应；声音、船号和港务时钟三者恰好对上。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '这就是校验不能只问“哪页更新”的原因。我们要逐项看姓名、船号、时刻、产生地点、经手人和传输路径。六项能对上的先确认；对不上的标明具体冲突，不把整份记录一笔作废。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '如果我们签的是校验章程，两张星蚀卡可以开启内室；如果没有，就把星卡留给后面的路。拿到校验簿后，最后两名守卫靠错误记录撑起的防护也会被一并拆掉一部分。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '这里真正要付的不只是两张卡。持簿执行官会用魔法反击直接削掉生命，所以得先确认我们吃得下这场代价。若能把校验簿带走，我们就能提前拆掉灯塔守卫相当一部分维持术式，它们的护甲和魔法反击都会弱下来。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '别再问哪一页“看起来更新”。把姓名、船号、时间、来源一项项摆在桌上；对得上的先承认，对不上的就老老实实写“待核实”。旧页留着，新页也留着。我们不替任何一张纸编一个方便的结论。', { expression: 'resolve' }),
      turn('深蓝歌姬·澜音', 'whale_boss', '先听清里面的节奏再进去。执行官的术式会直接穿过护甲，第一轮就很重。我们要拿到的也不是一张更漂亮的结论，而是让两份互相打架的记录终于能被放在一起听完。'),
      turn('深蓝歌姬·澜音', 'whale_boss', '无论你是否走校验侧库，主路上的执行官都会守住上行装订桥。它要核对你带来的回执副本；打开之后，我会把水镜里的原始声音一起封进索引，不让下一层只收到没有来源的一句结论。')
    ]),
    floor24: sequence('第二十四阵：灯塔接力室', [
      turn('旁白', null, '持簿执行官倒下后，装订桥把回执、船长印和澜音的声音编成了同一条索引。索引已经证明灰港船队到岸，但灯塔外的三座哨站还没有任何一座收到结案。', { kind: 'narration' }),
      turn('旁白', null, '接力台仍在播报“灰港救援中”。远方哨站不敢撤下三年前的夜班，新的船也只能绕开这条已经空出的航线。', { kind: 'narration' }),
      turn('旁白', null, '第一座哨站的指示灯偶尔闪一下，第二座完全沉默，第三座则把所有传讯反射回高塔。墙角堆着三年份的值夜表，同一批名字被重复书写，连笔迹都因疲惫变得越来越浅。', { kind: 'narration' }),
      turn('龙姬·焰璃', 'dragon_boss', '灰港的结案早已存在，只是灯塔没把它送过最后三座哨站。这里修的不是档案内容，而是别人能否收到它。'),
      turn('龙姬·焰璃', 'dragon_boss', '别再像三年前那样一着急就把传讯火力推满。先把同一个结案编号送到第一站，等它真的回一句“收到”；再让第一站把它交给第二站，最后送到第三站和灰港新码头。哪一段断了，就只补那一段。我们不再因为一处没回话，就把整件事拖回风暴那一夜。'),
      turn('旁白', null, '焰璃把手贴上冷透的传能管。她的炉火烧了三年，却没有一簇火真正照到等消息的人那里。掌心的余温沿铜管散开，很快便被冰冷的金属吞掉。', { kind: 'narration' }),
      turn('龙姬·焰璃', 'dragon_boss', '我以前总以为，只要炉心还热，至少能证明我没有离开岗位。现在看着这些冷管子，我才明白“我仍在工作”和“消息真的送到了”是两回事。'),
      turn('残响精灵·纱雾', 'guide', '如果我们签的是接力章程，就用日曜、月辉各一张打开内室；没有签的话，沿主路继续上行即可。接力电容会扩大共鸣容量，并在装上时立刻充入一轮魔力。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '接力导体会连续攻击；这条路线偏向魔力，并不代表它会少要我们的生命。电容装上后，共鸣上限会多出六十点，并尝试注入一百六十点储量；装得太早、原本就接近满值，多出来的那部分就会白白溢掉。', { expression: 'focus' }),
      turn('龙姬·焰璃', 'dragon_boss', '校场那只总管倒下时，电容还能再灌满一次。再往后就没有炉子给我们添火了。那一口魔力最好留到灯塔——这条路是让我们烧得更久，不是替我们把最后的敌人烤软。'),
      turn('龙姬·焰璃', 'dragon_boss', '“补满”也只是一炉火，不是永远烧不尽。出了校场，再没人替我们添柴；守望者和勘误核心还会一前一后等着。把那次回充当成最后一口整火来用。'),
      turn('绫星·璃', 'hero', '我们要逐站收到回执，再发送“救援已结束、原件仍保留”。晚了三年的话，不能再只停在“已经送出”这一步。', { expression: 'resolve' }),
      turn('旁白', null, '焰璃把第一段管线烧到暗红，接力台终于吐出一声清晰的回音：“一号哨站收到。”只有一站，还不是结束；但三年来，这是第一次有消息没有原路退回。', { kind: 'narration' })
    ]),
    floor25: sequence('第二十五阵：缺页庭', [
      turn('旁白', null, '接力导体停止拦截后，一号哨站的回音被收进灯塔索引。可当索引想添上“已收到”，登记库立刻亮起红印：主卷中找不到允许补记去向的条款。错误指向了上方的缺页庭。', { kind: 'narration' }),
      turn('旁白', null, '庭院中央那卷归档旧规缺了最后一页。断口不是刀痕：勘误核心判定“归档”与“持续救援”冲突后，便把这一页自行拆出了主卷。', { cg: '/assets/anime/cg/liyue-noctia-missing-page-cg-audit-v3.webp', cgHold: 8, kind: 'narration' }),
      turn('旁白', null, '散落的页角上还能辨认出几句话：“警报停止不影响原件保管”“结案后仍可追加新证据”“撤销命令须保留签署人和日期”。正是这些句子，能让“结束执行”与“继续记住”同时成立。', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '是我删掉三日期限，也是我的命令触发了这次拆页。我当时只想多等一条求援，没想到核心会把临时命令当成永远。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '勘误核心的任务是保证同一卷不能同时命令“永久救援”和“完成归档”。它不能否决我盖下的主权印，便把位阶更低的归档页判成了异物，从主卷里剥了出来。从那一刻起，整座塔只记得怎样启动救援，却忘了怎样平安收尾。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '原来的归档旧规其实允许结案：警报停止，原件保留，每次改动留下签名。把这一页拿回去，我的原签名才能撤销无限延长。'),
      turn('绫星·璃', 'hero', '为什么一定要原签名？因为无限延长是用你的主权印刻下的。我们可以打碎守卫，却不能伪装成你去撤令；那只会再造出一份来路不明的命令，让后来人无法判断哪一次改动才是真的。', { expression: 'resolve' }),
      turn('旁白', null, '诺克缇娅蹲下，将散落的页角一片片拼回断口。她终于明白，结束救援和忘记灰港从来不是同一件事。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '三年前，如果有人把这一页放到我面前，我还是会害怕。但我至少会知道，关掉警报后，名字依然在，新消息依然可以追记。我就不会用封住所有人的方式，逼自己继续等一个已经到达的回答。', { expression: 'sorrow' }),
      turn('残响精灵·纱雾', 'guide', '缺页封条需要日曜一张、月辉两张、星蚀一张。这是三条章程都绕不过的共同成本；卡片不够，就无法取得原签名。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '四色封条不是多余的门票。日曜认签署人，两张月辉分别封住原卷和撤销前副本，星蚀记下两版的先后。四者同时在场，核心才不能把这次撤销再说成一笔来路不明的改动。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '直接熄塔只会让未结案记录被照旧抄本重新誊写。取回原页，我们才能把收尾方法改成：保留原件、写明现况、留下每次改动的来路、按期复查。', { expression: 'resolve' }),
      turn('旁白', null, '折页枪卫拖着一卷沉重的封条从庭院尽头走来，枪尖每一次落地，破碎的归档页就会被风卷走一小片。要带着缺页上行，必须先从它手中抢回封条，再让奥术主权者亲自核对断口。', { kind: 'narration' })
    ]),
    floor26: sequence('第二十六阵：折角集市', [
      turn('旁白', null, '折页枪卫失去封条后，奥术主权者将缺页的断口与原卷逐纹对齐。归档条款没有立即生效：它被收进等待誊录的新卷，要等灯塔前的撤销签名到齐，才能取代无限延长。', { kind: 'narration' }),
      turn('旁白', null, '折角集市原是夜班人员换药、修护甲的地方。旧订单循环扣货后，柜台大多空了，珂珂还习惯性地把每只空瓶擦得发亮。', { kind: 'narration' }),
      turn('旁白', null, '瓶子按进货日期排了整整三面墙，却只有最后一排还存着药水。柜台上的红帐每天自己写下同一句：“北辰七号，需配药二十四人，今夜出发。”可这批药早在三年前就随最后一船交付完毕。', { kind: 'narration' }),
      turn('阵间商人·珂珂', 'merchant', '三年前，登记网每天都替早已不存在的救援队下单。我不能停止扣货，也不能把账面上“已预留”的药交给真正路过的人。'),
      turn('阵间商人·珂珂', 'merchant', '头一个月，我会在每只空箱里塞张纸，写“人已经离港，请停止预留”。第二天红帐还是照扣。后来我把纸改成短信，又改成大字牌，都被当成“新的现场求援”送了回去。'),
      turn('阵间商人·珂珂', 'merchant', '起源核心停下后，那些三年前的旧订单终于不再每天自己刷新。疗伤、磨刃、加固护甲，还有补充或扩充魔力容量的东西，我都重新标了价。至少这一次，柜台上的数字对应的是你现在真的要走的路。'),
      turn('阵间商人·珂珂', 'merchant', '这次账本不会替你做决定。药是拿来撑过必然会挨的伤，刃和甲会改变之后每一场交锋的代价；补充魔力解决眼前的空缺，扩容则是为了让之后每一次回充装得更多。先看看前面的人会怎么打，再决定钱该花在哪儿。'),
      turn('绫星·璃', 'hero', '钱袋里的余量就这么多。灯塔前是两场连战，中间没有休整；现在多买一项，后面临时补缺口的余地就少一分。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '我也想把这些空瓶全换成能用的药，好像这样就能把浪费掉的三年补回来。可钱袋不会因为后悔就变重；前面还有必须走完的路。', { expression: 'guarded' }),
      turn('阵间商人·珂珂', 'merchant', '别为了让我清仓而买。看看下一道门后的敌人，再看看自己还剩多少生命和魔力；只买那件真正能把你送到灯塔的东西。'),
      turn('奥术主权者', 'arcane_sovereign', '我签下无限延长时，从没算过这些每天被预留、却永远送不出去的药。我把“不惜代价”说得太轻易，因为代价不是从我的柜台上扣。', { expression: 'regret' }),
      turn('阵间商人·珂珂', 'merchant', '那就别只看空瓶。等灯塔收到结案，你要和我一起核对欠下的补给，先把现在还需要药的地方补上。道歉可以等，新的伤员不能。'),
      turn('阵间商人·珂珂', 'merchant', '等最终回执送到，我就合上这本空账，去灰港新码头开家真正会打烊的店。你们若来得太晚，可别敲后门。')
    ]),
    floor27: sequence('第二十七阵：接力校场', [
      turn('旁白', null, '离开集市时，珂珂撕下红帐最后一页，改写成“等待灯塔回执后重新盘点”。那页纸被钉在门口，不再自行扣货。前方的校场里，三组守卫正为唯一一枚备用核心对峙。', { kind: 'narration' }),
      turn('旁白', null, '校场过去训练夜航队：第一棒护送信匣，第二棒核对内容，第三棒跑完最后一段。如今三组守卫都在争抢同一份备用能源。', { kind: 'narration' }),
      turn('旁白', null, '边注决斗者守在月白跑道，以抢先出剑重现护送途中的突然拦截；勘误咏唱者占据中央法阵，用穿透甲胄的咒音重现错误记录的反噬；接力总管披着格外厚重的护壳，只看队伍能不能撑到传讯完成。', { kind: 'narration' }),
      turn('影织姬·鸦羽', 'shadow_boss', '三条跑道都亮着“最高优先”，所以三条都吃不饱。第一剑落在哪条线上，备用核心就跟哪条走。就这么简单。'),
      turn('影织姬·鸦羽', 'shadow_boss', '别找机关。先击败谁，就是选择谁。核心一旦嵌进通行印，就不会自己换到另一条跑道。看清楚，再出第一剑。'),
      turn('残响精灵·纱雾', 'guide', '先把三件事分开。此前签下的见证契约，决定由谁亲自作证；登记库选的修复章程，决定先补哪一处旧伤；眼前这座校场，只决定进灯塔前先带哪一种临战支援。三件事互不替代。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '见证契约选中的，是焰璃、澜音或鸦羽中的一人。重要的不是多得一层助力，而是只有亲历者才能补上的那段证词：焰璃说封印，澜音说警兆，鸦羽说命令的来路。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '签过名字还不算完成见证。那位同行者必须亲自取回信物，也要从起源魔源前的会战里活着回来。只有真的走完这段路，她才能在结案后留下自己的话；否则档案不会替她编一页不存在的证词。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '修复章程处理的是另一件事：我们究竟先把护送、校验还是接力恢复到能用。带回的护送印、校验簿或接力电容，会直接改变灯塔最后两战里我们能承受什么、又能先恢复哪一种工作。它和见证者是谁互不捆绑。', { expression: 'resolve' }),
      turn('影织姬·鸦羽', 'shadow_boss', '还有，别把它和前面的契约、章程混在一起。那些已经写进记录了；这里选的只是临战备用。即使选了校验章程，也可以先带护送术式；选了护送章程，也可以先带校验术式。两件事互不冲突。'),
      turn('影织姬·鸦羽', 'shadow_boss', '先压倒决斗者，后面的追击会少两轮；先解决咏唱者，守望者的术式会变弱，勘误核心也少一次连续反击；先拿下总管，共鸣会在清场后重新充满。就这三种。'),
      turn('影织姬·鸦羽', 'shadow_boss', '代价也摆在眼前：决斗者抢先手，咏唱者穿护甲，总管最耐打。先吃哪一种亏，你来定。'),
      turn('影织姬·鸦羽', 'shadow_boss', '三个人最后都得倒。只有第一个会把术式留给我们。第一剑别出错。'),
      turn('残响精灵·纱雾', 'guide', '若你完成了接力章程，击败总管后，接力章程还会额外把共鸣重新灌满一次。这和校场先选哪份术式，是两份不同的准备。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '如果那位见证者取回了信物，也活着走过起源魔源前的会战，结案后她会留下只有自己能写的那一页。它不会把灰港带向另一种结案，只是让共同记录里真正留下她自己的声音。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '无论有没有额外的个人见证，只要灯塔重新送出结案，灰港就已经结束那场持续三年的警报，未投递的信也会重新上路。若某位同行者完整走完了自己的见证，她只是在共同记录之后再添上自己的那一页——不是另一种胜利，只是让她亲口说完自己的经历。', { expression: 'resolve' })
    ]),
    floor28: sequence('第二十八阵：归档风暴', [
      turn('旁白', null, '校场的三名守卫先后停止运转。最先落败的那一名守卫已把备用术式刻进灯塔通行印；另外两套术式随着校场沉寂，只留下不再发光的线路。这场选择已经做完，后面只需记住自己带走了哪份支援。', { kind: 'narration' }),
      turn('旁白', null, '书页风暴撞过回廊，反复念着：“船已靠岸”“名单少一人”“请替我告诉家里”。每句话后面，本该填写投递结果的栏都空着。', { kind: 'narration' }),
      turn('旁白', null, '风中有港务员的公函，有船员临时撕下的票根，也有字迹歪斜的家书。它们在进入登记库时都只有“原文”栏，投递结果本应由下一座哨站回填；可虚空先驱截断了后续，这些空栏便被旧规一律解释成“对方仍未收到救援”。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '登记网把没有回执的句子一律当成新求援，再拿它们驱动守卫。连一句报平安，也会变成下一次警报。', { expression: 'sorrow' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我在王座上听到这些句子时，以为它们一次次证明灰港还有人。我没有看到空白的投递栏，也不知道同一封信每晚都会被当成新信重播。我把重复当成了人还在等。', { expression: 'sorrow' }),
      turn('旁白', null, '一张写给孩子的短信擦过诺克缇娅肩头。她伸手去接，纸页却再次卷回风里；那动作和三年前守在王座时一模一样。', { kind: 'narration' }),
      turn('旁白', null, '这一次，诺克缇娅没有追着那张纸走进风里。她解下披风，和璃一起把近处的信挡在墙角，又用封条将它们按原有编号排好。抓住一封信不能让它完成投递，但至少能先防止它又被撕成新的警报。', { cg: '/assets/anime/cg/liyue-noctia-archive-storm-cg-audit-v3.webp', cgHold: 3, kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '我们把“写了什么”和“送到哪里”分开保存：原文不改，另标已收到、待重送或收件人不明，并给每次重送留下记录。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '例如这封写给孩子的信：原文永久保留；收件地先记为灰港旧址；因旧址已经迁移，另注为“收件人不明”；接着由新码头查询家属去向，每次查询都留日期和经手人。找不到的时候，它是一封尚未送达的信，不是一条新求援。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '这样没人替写信的人改口，也不会让一句旧话永远拉响警钟。无法送达可以诚实写明，不能假装它从未存在。', { expression: 'resolve' }),
      turn('旁白', null, '索引兽从风眼里爬出，不断吞下投递栏空白的纸页，又把它们吐成闪着红光的求援卷。击败它，就能让风暴不再把同一批纸越卷越多；但真正给每封信写明去向，还要靠下一层的新索引。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '上行阶已经打开。旁边的疗伤和共鸣补给都是可选的；灯塔里的两场战斗会连续发生，中间没有休整。缺什么就拿什么，别为了把每个角落都清干净，再平白添一道伤口。', { expression: 'gentle' })
    ]),
    floor29: sequence('第二十九阵：最后索引', [
      turn('旁白', null, '索引兽破碎后，回廊里的信终于不再复制。诺克缇娅与澜音留在风暴尽头，按原编号收集散页；璃和纱雾带着已经分类的第一批记录登上最后索引室。', { kind: 'narration' }),
      turn('旁白', null, '最后索引只有“完整”和“作废”两格。少一个签名或日期，整份记录便会被退回救援队列，从第一步重新执行。', { kind: 'narration' }),
      turn('旁白', null, '一名已确认登上三号船的孩子，因为家长签名在水里晕开，整页被打上了作废印；一名已在死亡名簿中确认身份的医师，因为缺少离港时刻，又被送回了“等待救援”。索引强迫每一页假装完美，否则就当它什么都没能证明。', { kind: 'narration' }),
      turn('最后保管人', 'act3_last_custodian', '我知道许多人已经离港，却不能在空白处写“待补”。旧规则逼我在伪造完整与抹掉整页之间选一个。'),
      turn('最后保管人', 'act3_last_custodian', '我试过把不清楚的部分空着。索引兽会叼走整页，把它重新发给已经不存在的救援队。我也试过填上猜测的日期，那页虽然通过了，我却再也无法分辨上面哪一部分是证据，哪一部分是我为了让它通过而填的话。'),
      turn('奥术主权者', 'arcane_sovereign', '这条规矩是我留下的。我当年把“空白”一律当成疏忽，觉得宁可整页退回，也不能放过一次可能害死人的遗漏。现在我看见结果了：只要世界没有给出完美答案，警报就永远有理由重来。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '“目前不知道”也是事实，可我当年没给它留格子。于是保管人想诚实，就只能让整页作废；想保住已经查清的部分，就只能拿猜测填空。这不是她失职，是我把她困在了两个都不诚实的选项里。', { expression: 'regret' }),
      turn('旁白', null, '璃将回执副本压在索引旁，在“完整”和“作废”之间添上第三格：待核实。下面只写三件事——已经确认什么，还缺什么，下一次由谁来查。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '那名孩子的记录可以写成：“已确认三号船登船名单与北岸到港名单均有此人；家长签名受潮，待与船长副本核对；七日后由新码头登记员复查。”既不说我们已知道不知道的事，也不把已经对上的两份名单丢掉。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '以后任何人改动一条判断，都要留下时间、理由和改动前的原文。这样再有人截走回执，我们就能追到那一次动笔，而不是让整座塔重新回到灾难当夜。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '新索引只写四种现况：已离港、已罹难、待核实、待投递。它们不是给人分等级，只是告诉下一个接手的人：我们现在知道什么，还欠哪一步。新证据可以改判断，但旧的判断和改动理由必须留下。', { expression: 'focus' }),
      turn('最后保管人', 'act3_last_custodian', '这把钥匙，我可以交了。左右两名索引守卫还会照旧拦你们；让它们停下，然后把钥匙带去灯塔。只求一件事——以后的人可以诚实写下“不知道”，而不是为了通过检查去编一个答案。'),
      turn('旁白', null, '左侧索引守卫驱使重影书页连续夹击，右侧最后保管人则以先制封印护住钥匙。两道阻拦都是灯塔前的必经校验：前者检验新索引能否承受重复记录，后者确认开启者真的知道钥匙会释放什么。', { kind: 'narration' })
    ]),
    floor30: sequence('第三十阵：余烬灯塔', [
      turn('旁白', null, '最后保管人的封底钥匙转动时，整座索引室向两侧打开。新索引、缺失的归档页、离港回执和死亡名簿被同一道升降轨送向灯塔。璃走在最前，奥术主权者与诺克缇娅亲自抬着最重的原卷。', { cg: '/assets/anime/cg/liyue-archive-warden-entry-cg-audit-v3.webp', cgHold: 5, kind: 'narration' }),
      turn('旁白', null, '灯塔镜面朝向灰港，镜中仍是三年前的暴风夜。旧规面对互相矛盾的记录只有三种动作：先封住、再抹掉、最后照旧抄本重录；每次重录，求援也会跟着重来。', { kind: 'narration' }),
      turn('旁白', null, '镜面下方守着两道关。外面的档案守望者防止任何人在交战中偷换原件；更深处的勘误核心则会抹掉一切与“无限救援”相冲的记录。前一道一停，后一道立刻发动，中间没有休整的空隙。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '我按守望旧规保护原件。只要仍有一项矛盾，勘误核心就会把冲突内容全部抹掉，再照旧抄本重录；若整塔熄灭，它也会在复明时把“持续救援”重新写回来。', { expression: 'duty' }),
      turn('档案守望者', 'act3_archive_warden', '所以我不能因为你们带来了好消息就自行让路。如果新卷在交战中损坏，或有人趁我倒下时替换回执，勘误核心会在无法分辨真伪的情况下把冲突记录一起抹掉。我必须先亲自确认：即使我全力拦截，你们也能把原件完整带到灯塔前。', { expression: 'duty' }),
      turn('奥术主权者', 'arcane_sovereign', '别再往黑暗里找第四个人了。三日期限是我删的；三席那枚“同意”是核心拿旧回答补出来的；真正的离港回执，则被虚空先驱按我留下的错误命令截进了上层封印。走到这里，我们已经把每一只手都看见了。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '我删期限，是怕漏掉最后一个求援者；核心替我的命令补齐三席回答，是为了让它继续成立；虚空先驱截住回执，则是在执行我留下的那句“全员安全前不得结案”。每一步都能说出一个理由。也正因为如此，我们竟让它们首尾相接地错了三年。', { expression: 'regret' }),
      turn('绫星·璃', 'hero', '这场灾难没有第四个人在暗处等着现身。有的是一道没有停止条件的命令、一次把三个临时回答错接到另一道命令上的误判，以及一台不会质疑上级指令的截留器。我们现在要修的，就是让这三种错误不能再首尾相接。', { expression: 'resolve' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我们带来了那份回执、死亡名簿和被拆走的归档条款。它们证明灰港可以结案，也证明停止警报不会删除任何一个名字。', { expression: 'grave' }),
      turn('无声女王·诺克缇娅', 'final_queen', '这三份东西谁也替不了谁。回执告诉我们船去了哪里，却不能替罹难者作答；名簿把罹难者和待核实者分开，却不能证明船真的到岸；归档条款则告诉我们，警报停下以后原件照样能留下。三份叠在一起，我们才不是靠一句“大家都没事了”草草收尾。', { expression: 'grave' }),
      turn('残响精灵·纱雾', 'guide', '交接分四步：封存旧原件，另添现况与经手注记，由原签署人撤销无限延长，再让本人见证把结案送进灯塔。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '先把灰港原卷封存起来，谁也不能改动原文。求援、离港回执、名簿，还有我们一路查到的那些错误印记，全都原样留下。谁都不能为了让今天看起来更体面，就回头把三年前改成一份漂亮的故事。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '然后在原卷旁另添两类注记：一类只写现在知道的情况——已离港、已罹难、待核实、待投递；另一类写明是谁根据什么证据改了判断、何时改、为什么改。以后有新证据，只改这些注记，不碰旧原文。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '第三步该由我亲手做。缺页上还留着我当年的签名，我会用它撤销“无限延长”。只让守卫、补给和警报停下来，不抹掉那道命令，也不抹掉我为什么会签。错误和撤销并排放着，后来的人才能知道我做过什么。', { expression: 'acceptance' }),
      turn('无声女王·诺克缇娅', 'final_queen', '最后一步我来见证。我是当年亲手执行封塔的人，不能到了结案时又躲到名簿后面。哪些人已离港，哪些人已罹难，哪些名字还要继续查，我会一项项确认；结案送进灯塔以后，七天后的第一次复查，我也会回来。', { expression: 'grave' }),
      turn('绫星·璃', 'hero', '四步都做完，登记网才会真正停止发令，只保留档案。现在若直接熄塔，复明后旧抄本还会把救援重新叫醒；那些没人标出去向的信，也会再次变成孤立原件。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '我们之前做过的选择，现在都会在灯塔里兑现：章程决定哪一段修复先替我们承压，校场最先锁定的备用术式则决定临战支援。一路省下或花掉的卡牌、生命和魔力，不会在门口凭空重置。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '登记库里真正修好的章程，到了灯塔仍然有效；校场带来的备用术式则另算一层支援。两份准备不必来自同一条路。开战前再确认一次，别把一路做过的准备忘在门外。', { expression: 'focus' }),
      turn('旁白', null, '璃将离港回执收进胸前的硬皮夹，又用两条封带把死亡名簿固定在背后。她知道守望者不是最后的幕后真凶，也没有期待几句说服就能让它违背保护原件的职责。这一战要回答的问题很具体：她能不能在这柄长枪面前，不丢掉任何一页地走到誊录台。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '先让我确认你们能在攻击中守住原件。我一停手，勘误核心就会立刻醒来；它动手抹除前只有一次交接机会，中间不会休整。', { expression: 'duty' })
    ]),
    bossArchiveWardenPost: sequence('灯塔：守望者停机', [
      turn('旁白', null, '守望者的长枪落地，镜面却没有熄灭。更深处的红光沿书架亮起，所有矛盾页同时浮出“即将抹除”。', { kind: 'narration' }),
      turn('旁白', null, '璃单膝撑在誊录台前，先摸到胸前硬皮夹里的回执，再解开背后两条封带。死亡名簿页码连续，缺失的归档页也仍在透明封袋中。守望者的检验结束了——她没有丢掉任何一份原件。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '原件无误，守望旧规到此为止。勘误核心已经醒来；镜面上的红光熄到最后一格时，它仍会抹掉冲突记录，再照旧抄本重录。', { expression: 'duty' }),
      turn('档案守望者', 'act3_archive_warden', '我的长枪不会再指向你们。但我也无法代替你们填写新的判断：我只能证明送进誊录台的东西与你们开战前带来的原件一致。接下来的每一个字，都必须由真正承担它的人填写。', { expression: 'duty' }),
      turn('旁白', null, '纱雾把光笔插进誊录台。卷宗编号、来源、当前判断、经手人、修改时间、修改理由依次亮起；旧文字则全部封存，不再被后来的笔迹覆盖。', { cg: '/assets/anime/cg/liyue-traceable-revocation-cg-audit-v3.webp', cgHold: 9, kind: 'narration' }),
      turn('旁白', null, '蓝白色的索引线从光笔下展开。“灰港-终卷”作为新编号建立，离港回执标为船长原件，死亡名簿标为回响王庭原件，三段核验时序与澜音的水镜证言分别挂在来源栏下。原卷中的每一行仍保持原样。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '新的现况注记开始逐名分流：有离港与到岸双重记录的，标为“已离港”；死亡名簿中已确认身份的，标为“已罹难”；两份名单仍有冲突的，标为“待核实，七日后复查”；家书则按收件地进入“待投递”。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '我用原签名撤销无限延长，只撤强制命令，不撤档案。今后的新求援另编新号，不能再冒充灰港旧案。', { expression: 'acceptance' }),
      turn('旁白', null, '奥术主权者将手按在自己三年前的签名上。光线没有擦除那道笔迹，而是在旁边生成一条新记录：“撤销无限延长；理由：离港回执已找回，三席确认时序错置，归档条款已恢复；签署人：奥术主权者。”', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '我不会把当年的断讯和恐惧删掉，好像它们从未影响过我的判断；也不会把今天这次撤销写成一个迟来的英明决定。两份记录必须并排放着：一份让后来的人看见，我当时为什么会做错；另一份让他们看见，究竟靠什么证据才有资格把错误停下来。', { expression: 'acceptance' }),
      turn('旁白', null, '诺克缇娅展开三位本人见证留下的镜印，又将自己的名字写在复查人一栏。她不再用沉默替灰港回答。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '这三枚镜印证明，她们亲眼看过回执、名簿，也看着主权者撤了令。我的名字写在旁边，是为了另一件事：封塔是我做的，七天后的复查也不能因为我走出塔门，就忽然变成无人负责。', { expression: 'knowing' }),
      turn('旁白', null, '勘误核心在内环完全醒来。它读到了撤销令，却仍按旧协议把这份“与无限救援相冲的新结论”列作最后一项错误。数百道红色校对线拢向誊录台，准备在灯塔正式向外送出结案前将它抹掉。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '原件在，撤销令签了，见证也在场。最后一步不是砸掉档案，而是挡住勘误核心，别让它抹掉这份来路清楚的新结论。只要撑到灯塔把结案送出，每一座哨站都会收到同一份回答。', { expression: 'resolve' })
    ]),
    ending: sequence('终章：未投递的信', [
      turn('旁白', null, '勘误核心碎裂后，余烬灯塔没有熄灭。它换了一种平静的灯语：“已收到，编号灰港-终卷，值守人纱雾，七日后复查。”', { kind: 'narration' }),
      turn('旁白', null, '红色校对线一根根熄灭，蓝白色的结案光线则继续穿过镜面。灰港三年前的求援没有被删除，无限延长也仍保留在旧卷原文中；但它们都不再命令现在的守卫、商店和哨站重复当年的一夜。', { kind: 'narration' }),
      turn('旁白', null, '沿途哨站逐一回亮确认。旧警报第一次没有重播，未投递的信也不再从书架上飞回求援队列。', { kind: 'narration' }),
      turn('旁白', null, '一号哨站回复“记录收到”，二号哨站回复“旧夜班撤销，保留一人轮值复查”，三号哨站则把结案送进灰港新码头的收件钟。钟声从远处传回来，每响一次，灯塔便在经手注记旁添上一枚真正收到的时间印。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '离港者写明航次，罹难者回到名簿，仍待联系的人保留复查日期。没有谁再被一句“等待确认”困在同一夜。', { expression: 'knowing' }),
      turn('无声女王·诺克缇娅', 'final_queen', '已离港不等于从此无事，已罹难也不等于只留一个句号。前者还要确认在新居所的安置，后者要把消息和遗物送到家人手中，待核实的名字则要在每个复查日之后带着新证据继续查。“结案”结束的是那道无限命令，不是对人的后续照顾。', { expression: 'knowing' }),
      turn('旁白', null, '诺克缇娅摘下王冠旁那枚从未熄灭的警报石，放在灰港终卷边。那块石头三年来一直贴着她的脉搏震动，提醒她“还有人没有回来”。现在它第一次安静。她没有立刻戴回王冠，只把披风收紧了一点——等名单整理完，她会亲自走出这座塔。', { cg: '/assets/anime/cg/liyue-noctia-afterlight-cg.webp', cgHold: 2, kind: 'narration' }),
      turn('旁白', null, '她的手指离开警报石后，下意识地又收了回去，像是少了那一点持续的震动，就不知道该把手放在哪里。璃没有催她，只把第一批待投递的信匣放到两人中间。诺克缇娅低头看了很久，最后拿起的不是王冠，而是写有新码头地址的行程单。', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '我的名字不会从这里消失。签下无限延长的是我，今天撤销它的也是我。以后每一次复查，只要有人问“为什么会变成这样”，这份记录都应该先把我叫回来回答。', { expression: 'acceptance' }),
      turn('奥术主权者', 'arcane_sovereign', '折角集市的空账也会单独迁移。先确认哪些地方仍需要药和炉火，再重新安排补给，不用新订单去假装过去没有被浪费。我会把每一笔旧扣货的来源一起留下，让账本说明发生过什么，不再替我藏起代价。', { expression: 'acceptance' }),
      turn('残响精灵·纱雾', 'guide', '灰港的结案不会因为我们选了哪套章程而改变。真正不同的，是灯塔在恢复日常时会先留下哪一种工作：护送、校验，或接力。那是我们这一路决定先修什么之后，自然延续下来的第一步。', { expression: 'gentle' }),
      turn('残响精灵·纱雾', 'guide', '夜航护送章程若走到了最后，米露会把护送印重新挂回灯塔入口；逐页校验完成后，那本校验簿会留在工作台上，成为日常复查的工具；若修好灯塔接力，接力电容会被拆成许多小灯，交给值夜人和信使。三条路都发生在完整结案之后，只是大家恢复日常时迈出的第一步不同。', { expression: 'gentle' }),
      turn('残响精灵·纱雾', 'guide', '如果此前签下见证契约的那位同行者取回了自己的信物，也从起源魔源前的会战中活着归来，她还会亲手留下一页自己的话。那一页不改变今天的结案，只是不让那段同行被最后的记录省略。', { expression: 'gentle' }),
      turn('绫星·璃', 'hero', '所以结案已经完整：警报停了，原件留下，信重新上路，待核实的人也有明确的复查人。若焰璃、澜音或鸦羽中的一人完成了自己的见证，她会在共同记录后再添一页自己的话。那一页不会改写今天的结论，只会说明这段经历后来在她的生活里留下了什么。', { expression: 'resolve' }),
      turn('旁白', null, '灯塔大门在清晨前打开。外面没有三年前的暴风，只有潮水退后湿润的石路，以及从新码头方向赶来的第一辆邮车。车夫没有带剑，他跳下车，展开一张空白签收表，问谁来交接第一批信。', { backdrop: 'emberLighthouse', cg: '/assets/anime/cg/liyue-lighthouse-archive-cg.webp', cgHold: 3, kind: 'narration' }),
      turn('旁白', null, '璃抱起最上面一只信匣。它比任何一枚核心都轻，里面却装着三年来始终没有抵达收件人手里的声音。她试着哼了一下重新完整的七段咏唱，最后没有把它唱成命令，只把信匣抱稳了一点。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '记录留下，命令结束；新的求援有人接，旧的错误也找得到来路。走吧，去送第一批回信。', { expression: 'resolve' }),
      turn('旁白', null, '诺克缇娅抱起第二只信匣，奥术主权者拿上签收表，纱雾则让灯塔的第一盏复查灯在身后继续亮着。他们没有等某个完美的时刻为这一切宣告结束；邮车的门已经打开，第一份投递记录可以从现在开始写。', { kind: 'narration' })
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
  f20.objective = '完成会战并击败主权者与起源核心，前往余烬登记库。';
  f20.boss = 'originCore';

  floors.push(...ACT3_FLOORS.map((entry) => ({ ...entry, map: entry.map.map((row) => [...row]) })));
  const validation = validateActThree({ floors, enemies, items });
  if (!validation.ok) throw new Error(`30F content rejected: ${validation.violations.join(', ')}`);
  return Object.freeze({ applied: true, id: DEMO30_CONTENT_ID, numericBaselineId: DEMO30_NUMERIC_BASELINE_ID, floors: Object.freeze(ACT3_FLOORS), validation });
}

export function validateDemoThirtyFloorContent({ floors, enemies, items } = {}) {
  return validateActThree({ floors: floors ?? [], enemies: enemies ?? {}, items: items ?? {} });
}
