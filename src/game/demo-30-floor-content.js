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
      turn('旁白', null, '起源核心停机后，旧升降梯又向上爬了一段。门缝刚亮，成捆信匣便从塔顶夹层滑落，蜡封上全是三年前的灰。', { kind: 'narration' }),
      turn('旁白', null, '这里不像王庭或机房，倒像一座被仓促遗弃的邮局。墙上三枚灯牌分别写着“护送”“校验”“接力”，它们通往不同的侧库，却都指向最高处的余烬灯塔。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '现在可以把篡改链说完整了：奥术主权者删去三日期限，起源核心挪用三席旧确认，虚空先驱又截走离港回执。不是灰港没有结案，是结案被拆散了。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '第一步发生在风暴断讯时。奥术主权者怕三天后还有生还者没被找到，所以把“三日后复核撤销”改成“无限延长”。他想防止过早收队，却没写新的停止条件。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '我当时以为，多等一天只会多烧几盏灯。我没有下到灰港，也没有看见塔中每一个守卫、每一笔补给都会被那句话无限征用。我把自己的担心写成了别人无法退出的命令。', { expression: 'regret' }),
      turn('残响精灵·纱雾', 'guide', '第二步是起源核心的自动补写。航路、补给、名簿三席曾在停电后各自同意“临时继续救援”；核心为了让无限延长通过校验，把那三份晚了十七分钟、本来只针对停电的回答，挪到了主权者的命令下面。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '所以它没伪造笔迹，也没编一句新话。它只是拿了三句真话，剪掉原来的时间和用途，拼出一份从未被三席同意过的总印。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '第三步是虚空先驱。它不是另一个藏在后面的人，而是旧命令留在航渠里的截留器。“全员安全前，任何结案回执均不可信”——它照这条规则把真回执引进主权权限链，标成了待复核。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '发令的人是我，挪用确认的是核心，截留回执的是它产生的先驱。三者没有在密室里共谋，可三个错误首尾相接，才把灰港的一夜困了三年。', { expression: 'regret' }),
      turn('无声女王·诺克缇娅', 'final_queen', '诺克缇娅捧起一只写着“全员离港”的信匣，指尖迟迟没敢碰蜡封。三年来，她听见的只有等待确认。', { expression: 'sorrow' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我封塔，是因为我以为警报一停，这些名字就会被当成从未存在。现在我才看见，真正没有被听见的，恰恰是他们已经离港、已经罹难，或仍需查找的不同回答。', { expression: 'sorrow' }),
      turn('残响精灵·纱雾', 'guide', '起源核心刚才停下的只是执行层。这里还存着命令副本和未投递原件；直接断电，副本会在复电后重启，信匣的投递状态也会一起丢失。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '更糟的是，断电会留下一批只有原文、没有状态的信。复电后，勘误核心会把每一句“请回答”重新判成求援，再按无限延长的副本召回所有守卫。我们要做的是换好这套记录方法，不是把记录和灯一起砸掉。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '所以要先选一套修复章程：护送把回执送达，校验拆穿假警报，接力把结案传回各地。三者都能完成归档，只是先处理的风险不同。', { expression: 'gentle' }),
      turn('残响精灵·纱雾', 'guide', '夜航护送章程先解决“信会在路上被烧掉”：在 F22 消耗两张月辉卡，打开护送侧库，让守柜人检验我们能否把原件完整带过警戒线。成功后会获得生命和防御补强，最后两战每阶段少承受三次反击。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '逐页校验章程先解决“真回执被当成伪件”：在 F23 消耗两张星蚀卡，进内室打败持簿执行官，建立逐项对照表。成功后会提高攻防，并把最后两个核心的生命、防御和魔法反击一起削弱。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '灯塔接力章程先解决“结案发出去却没人收到”：在 F24 消耗一张日曜卡和一张月辉卡，重接三座哨站。它会提高 MP 上限并充能，在 F27 打败接力总管后再补满一次；但它不直接削弱最终敌人。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '换句话说：护送路线用更厚的生存余量换终战减击；校验路线承担一场魔法强敌，换最直接的敌人削弱；接力路线依赖 MP 规划，换两次充能机会。三条路都能到结案，不是三个真假答案。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '签章程本身不扣资源；真正代价写在对应侧库，另外两座侧库会留到下一次。主路不会封，先把收益、卡片和终局风险都看清。', { expression: 'resolve' })
    ]),
    floor22: sequence('第二十二阵：夜航侧库', [
      turn('旁白', null, '夜航书架沿墙排成一条窄巷。每只信匣都写着收件地，却没有送达印；守柜人的枪尖仍对准所有出口。', { kind: 'narration' }),
      turn('旁白', null, '灰烬保管人守在主回廊上，身后是通往 F23 的灯桥；另一名夜航守柜人站在侧库内，脚边放着一枚尚未启用的护送印。两人不争夺信件，只是都在等一份能通过旧警戒的完整移交记录。', { kind: 'narration' }),
      turn('猫卫长·米露', 'cat_boss', '那一夜，警报会攻击所有离塔的东西，连报平安的回执也不例外。我们只能抱着信匣躲回侧库，眼看最后一班船离岸。'),
      turn('猫卫长·米露', 'cat_boss', '我试过把回执系在盔甲里，也试过从通风井送出去。每次一越过白线，火阵就认定我在携带“未经复核的结案证据”逃离。我不是没送过；是我送一次，它就烧一次。'),
      turn('猫卫长·米露', 'cat_boss', '米露扯了扯已经磨白的护腕。她守了三年，不是舍不得这些箱子，是怕一开门，最后的回信又被当成敌人烧掉。'),
      turn('绫星·璃', 'hero', '璃从最上层抽出一匣。寄件人在正面写了三次“母亲收”，第四次改写成“若无人签收，请放在旧码头的石狮下”。她没有说安慰的话，只把已经脱落的蜡屑收进纸袋。', { expression: 'guarded' }),
      turn('绫星·璃', 'hero', '护送章程不会改这封信的一个字。它只在外面添一张行程单：谁从哪台取件，经过哪道检查，与谁同行，最后由谁签收。警戒线可以检查这张单，不再有理由烧掉原件。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '若签了夜航章程，就用两张月辉卡开启侧库并击败守柜人；没签则沿主路上行，既不扣卡，也不会被挡住。', { expression: 'focus' }),
      turn('猫卫长·米露', 'cat_boss', '护送印会替每只信匣登记路线和同行者，让它通过警戒线。它也会在终局两阶段各替你挡住三次反击。'),
      turn('猫卫长·米露', 'cat_boss', '守柜人的攻击就是检验。如果你在他的连续拦截下保不住自己，印章也不会承认你能安全护住信匣。先查战斗预估，再决定是否支付两张月辉卡；这不是用剧情逼你走的必经之路。'),
      turn('绫星·璃', 'hero', '我们不销毁警报，也不强迫守柜人放行。先证明回执能被护到归档口，再让米露亲手送出第一匣。', { expression: 'resolve' }),
      turn('旁白', null, '她将信匣放回原位，把行程单的空白夹在蜡封下。主回廊的灰烬保管人同时举枪；无论是否进侧库，想上楼都要先让它承认，这批记录有了新的经手人。', { kind: 'narration' })
    ]),
    floor23: sequence('第二十三阵：逐页校验室', [
      turn('旁白', null, '灰烬保管人的钥匙在灯桥上转过半圈，夜航书架终于停止封锁上行口。米露留在后方重新点数信匣，璃则带着第一份行程记录进入校验室。', { kind: 'narration' }),
      turn('旁白', null, '校验室的长桌上，同一个名字常有两页：左页写“等待救援”，右页却盖着船号与离港时刻。两页都是真纸，只有来源不同。', { kind: 'narration' }),
      turn('深蓝歌姬·澜音', 'whale_boss', '起源核心重建记录时复制了旧求援页，却没带上被虚空先驱截走的回执。新副本印章更晚，持簿执行官便把右页当成伪造。'),
      turn('深蓝歌姬·澜音', 'whale_boss', '它的判断方法看似谨慎：只信目前登记网内日期最新的版本。但那份“最新”正是断电后从旧求援页复制出来的，而真回执因为被截留，反而保留着更早的船长印。只排日期，就会把错的副本永远放在最上面。'),
      turn('深蓝歌姬·澜音', 'whale_boss', '澜音逐字唱出船号，水镜里浮出当夜的靠岸声。她停了一会儿——那是她三年来第一次听见航线真正结束。'),
      turn('旁白', null, '水镜里，最后一艘撤离船的缆绳离开灰港，半夜前抵达北岸。船长报出“全员离港”时，澜音的鲸歌在背景里给出了回应；声音、船号和港务时钟三者恰好对上。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '这就是校验不能只问“哪页更新”的原因。我们要逐项看姓名、船号、时刻、产生地点、经手人和传输路径。六项能对上的先确认；对不上的标明具体冲突，不把整份记录一笔作废。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '若签了校验章程，两张星蚀卡可开启内室；没签就保留星卡走主路。拿到校验簿，终局两相的错误增幅也会被削弱。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '这里的代价不止两张卡。持簿执行官会用魔法反击追加耗血，你要先确认自己能不能承担。换来的校验簿会让 F30 的档案守望者和勘误核心各自降低百分之二十一生命、十五防御和五十五魔法伤害。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '具体做法是把姓名、船号、时间、来源逐项对齐，再把冲突标成“待核实”。不覆盖旧页，也不靠印章的新旧替任何一页判死刑。', { expression: 'resolve' }),
      turn('深蓝歌姬·澜音', 'whale_boss', '先看执行官的魔法耗血。赢下来的不是一份方便的答案，而是让证据彼此说得上话的机会。'),
      turn('深蓝歌姬·澜音', 'whale_boss', '无论你是否走校验侧库，主路上的执行官都会守住上行装订桥。它要核对你带来的回执副本；打开之后，我会把水镜里的原始声音一起封进索引，不让下一层只收到没有来源的一句结论。')
    ]),
    floor24: sequence('第二十四阵：灯塔接力室', [
      turn('旁白', null, '持簿执行官倒下后，装订桥把回执、船长印和澜音的声音编成了同一条索引。索引已经证明灰港船队到岸，但灯塔外的三座哨站还没有任何一座收到结案。', { kind: 'narration' }),
      turn('旁白', null, '接力台仍在播报“灰港救援中”。远方哨站不敢撤下三年前的夜班，新的船也只能绕开这条已经空出的航线。', { kind: 'narration' }),
      turn('旁白', null, '第一座哨站的指示灯偶尔闪一下，第二座完全沉默，第三座则把所有传讯反射回高塔。墙角堆着三年份的值夜表，同一批名字被重复书写，连笔迹都因疲惫变得越来越浅。', { kind: 'narration' }),
      turn('龙姬·焰璃', 'dragon_boss', '灰港的结案早已存在，只是灯塔没把它送过最后三座哨站。这里修的不是档案内容，而是别人能否收到它。'),
      turn('龙姬·焰璃', 'dragon_boss', '具体做法不是把功率开到最大。我们先把同一份结案编号送到第一站，等它回答“收到”；再由第一站转给第二站，带回两枚回执；最后送到第三站和灰港新码头。任何一段断开，只重发那一段，不再把整件事倒回三年前。'),
      turn('龙姬·焰璃', 'dragon_boss', '焰璃把手贴上冷透的传能管。她的炉火烧了三年，却没有一簇火照到真正等消息的人那里。'),
      turn('龙姬·焰璃', 'dragon_boss', '我以前总以为，只要炉心还热，至少能证明我没有离开岗位。现在看着这些冷管子，我才明白“我仍在工作”和“消息真的送到了”是两回事。'),
      turn('残响精灵·纱雾', 'guide', '若签了接力章程，用日曜、月辉各一张开启内室；没签便从主路上行。电容会提高魔力上限并立即充能。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '接力内室的接力导体会连续攻击，不会因为这条路线偏向 MP 就少要生命。取得电容时，最大 MP 增加六十，并恢复一百六十 MP，但恢复不会超过新上限。如果当前 MP 接近满值，立即充能的一部分就会溢出。', { expression: 'focus' }),
      turn('龙姬·焰璃', 'dragon_boss', '击败 F27 接力总管后，电容还会补满一次。那之后的 MP 要留给灯塔；这条路线不直接削弱终局敌人。'),
      turn('龙姬·焰璃', 'dragon_boss', '也别把“补满”听成“以后随便用”。F27 之后不再有章程回充，档案守望者和勘误核心又会连续出现。这条路给你的是一次明确的蓄能时机，不是无限的魔力。'),
      turn('绫星·璃', 'hero', '我们要逐站收到回执，再发送“救援已结束、原件仍保留”。晚了三年的话，不能再只停在发送键上。', { expression: 'resolve' }),
      turn('旁白', null, '焰璃把第一段管线烧到暗红，接力台终于吐出一声清晰的回音：“一号哨站收到。”只有一站，还不是结束；但三年来，这是第一次有消息没有原路退回。', { kind: 'narration' })
    ]),
    floor25: sequence('第二十五阵：缺页庭', [
      turn('旁白', null, '接力导体停止拦截后，一号哨站的回音被收进灯塔索引。可当索引尝试写入“已收到”，登记库立即报错：主卷中找不到允许改写状态的条款。错误指向了上方的缺页庭。', { kind: 'narration' }),
      turn('旁白', null, '庭院中央的协议缺了最后一页。断口不是刀痕：勘误核心判定“归档”与“持续救援”冲突后，自动把这一页拆出了主卷。', { cg: '/assets/anime/cg/liyue-noctia-missing-page-cg.webp', cgHold: 8, kind: 'narration' }),
      turn('旁白', null, '散落的页角上还能辨认出几句话：“警报停止不影响原件保管”“结案后仍可追加新证据”“撤销命令须保留签署人和日期”。正是这些句子，能让“结束执行”与“继续记住”同时成立。', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '是我删掉三日期限，也是我的命令触发了这次拆页。我当时只想多等一条求援，没想到核心会把临时命令当成永远。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '勘误核心的任务是保证同一卷不能同时命令“永久救援”和“完成归档”。它没有权限否决我的主权命令，就把权限较低的归档页判成异常附件，从主卷里剥了出来。从那一刻起，整套系统只剩下启动，没有安全收尾。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '原协议其实允许归档：警报停止，原件保留，每次改动留下签名。把这一页拿回去，我的原签名才能撤销无限延长。'),
      turn('绫星·璃', 'hero', '为什么一定要原签名？因为无限延长是以你的主权权限写入的。我们可以打碎守卫，却不能伪装成你去撤令；那只会再造出一份来路不明的命令，让后来人无法判断哪一次改动才是真的。', { expression: 'resolve' }),
      turn('旁白', null, '诺克缇娅蹲下，将散落的页角一片片拼回断口。她终于明白，结束救援和忘记灰港从来不是同一件事。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '三年前，如果有人把这一页放到我面前，我还是会害怕。但我至少会知道，关掉警报后，名字依然在，新消息依然可以追记。我就不会用封住所有人的方式，逼自己继续等一个已经到达的回答。', { expression: 'sorrow' }),
      turn('残响精灵·纱雾', 'guide', '缺页封条需要日曜一张、月辉两张、星蚀一张。这是三条章程都绕不过的共同成本；卡片不够，就无法取得原签名。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '四色封条不是多余的门票。日曜验证签署人，两张月辉分别锁住原卷和撤销前副本，星蚀记下两版的先后。四者同时在场，核心才无法把撤销误判成又一次未授权篡改。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '直接关机只会把未结案记录送回重建。取回原页，我们才能把流程改成：保留原件、标明状态、记录修改、按期复查。', { expression: 'resolve' }),
      turn('旁白', null, '折页枪卫拖着一卷沉重的封条从庭院尽头走来，枪尖每一次落地，破碎的归档页就会被风卷走一小片。要带着缺页上行，必须先从它手中抢回封条，再让奥术主权者亲自核对断口。', { kind: 'narration' })
    ]),
    floor26: sequence('第二十六阵：折角集市', [
      turn('旁白', null, '折页枪卫失去封条后，奥术主权者将缺页的断口与原卷逐纹对齐。归档条款没有立即生效：它被收进可写入的新卷，要等灯塔前的撤销签名到齐，才能取代无限延长。', { kind: 'narration' }),
      turn('旁白', null, '折角集市原是夜班人员换药、修护甲的地方。旧订单循环扣货后，柜台大多空了，珂珂还习惯性地把每只空瓶擦得发亮。', { kind: 'narration' }),
      turn('旁白', null, '瓶子按进货日期排了整整三面墙，却只有最后一排还存着药水。柜台上的红帐每天自动写下同一句：“灰港救援队二十四人，今夜出发。”可这支队伍早在三年前就完成了最后一次任务。', { kind: 'narration' }),
      turn('阵间商人·珂珂', 'merchant', '三年前，系统每天替不存在的救援队下单。我不能停止扣货，也不能把账面上“已预留”的药交给真正路过的人。'),
      turn('阵间商人·珂珂', 'merchant', '头一个月，我会在每只空箱里塞张纸，写“人已经离港，请停止预留”。第二天红帐还是照扣。后来我把纸改成短信，又改成大字牌，都被当成“新的现场求援”送了回去。'),
      turn('阵间商人·珂珂', 'merchant', '起源核心停下后，旧订单终于不再刷新。血、刃、甲、补 MP、扩 MP 的效果和价格，我都重新写在柜台上。'),
      turn('阵间商人·珂珂', 'merchant', '这次账本不会替你做决定。生命用来承受必然的损耗，攻防用来改变每一战的耗血，补 MP 是当下恢复，扩 MP 是提高以后每次回充的容量。先打开战斗详情看数字，别只因为柜台上有亮光就买。'),
      turn('绫星·璃', 'hero', '璃翻了翻钱袋，又望向通往校场的门。终局连续两阶段，中间没有休整；现在多买一项，就少一份之后补错短板的余地。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '她很想把每一只空瓶都换成能用的药，像是那样就能把浪费的三年一起补回来。可钱袋的重量提醒她：遗憾不会因为买空柜台就变小，而前面还有必须真正走完的路。', { expression: 'guarded' }),
      turn('阵间商人·珂珂', 'merchant', '别为了让我清仓而买。先看下一层敌人的耗血和自己的魔力，买能把你送到灯塔的那一件。'),
      turn('奥术主权者', 'arcane_sovereign', '我签下无限延长时，从没算过这些每天被预留、却永远送不出去的药。我把“不惜代价”说得太轻易，因为代价不是从我的柜台上扣。', { expression: 'regret' }),
      turn('阵间商人·珂珂', 'merchant', '那就别只看空瓶。等灯塔收到结案，你要和我一起核对欠下的补给，先把现在还需要药的地方补上。道歉可以等，新的伤员不能。'),
      turn('阵间商人·珂珂', 'merchant', '等最终回执送到，我就合上这本空账，去灰港新码头开家真正会打烊的店。你们若来得太晚，可别敲后门。')
    ]),
    floor27: sequence('第二十七阵：接力校场', [
      turn('旁白', null, '离开集市时，珂珂撕下红帐最后一页，改写成“等待灯塔回执后重新盘点”。那页纸被钉在门口，不再自动扣货。前方的校场里，三组守卫正为唯一一枚备用核心对峙。', { kind: 'narration' }),
      turn('旁白', null, '校场过去训练夜航队：第一棒护送信匣，第二棒核对内容，第三棒跑完最后一段。如今三组守卫都在争抢同一份备用能源。', { kind: 'narration' }),
      turn('旁白', null, '边注决斗者守在月白跑道，其先制剑势可以模拟护送途中的突然拦截；勘误咏唱者占据中央法阵，用无视甲胄的咒音模拟错误记录的反噬；接力总管则抱着高生命的厚重机壳，测试队伍能否撑到传讯完成。', { kind: 'narration' }),
      turn('影织姬·鸦羽', 'shadow_boss', '旧系统把三项工作同时标成最高优先，谁都拿不到足够资源。你先击败谁，校场就把备用程序交给谁。'),
      turn('影织姬·鸦羽', 'shadow_boss', '这里没有额外按钮。你走到哪一名守卫面前并先击败它，就等于用实战锁定了那一项交接优先级。锁定后不能重选，因为备用核心会立即装入对应跑道。'),
      turn('残响精灵·纱雾', 'guide', '别混淆三种承诺：F11 的见证契约选的是谁亲自证明事实；F21 的修复章程选的是先修哪段流程；这一层选的是终战前先拿哪种支援。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', 'F11 的见证契约在第二幕已经锁定了赤焰、潮汐或影线其一条专精路线。它决定哪位盟友有资格用本人经历补足档案：焰璃证明封印如何留下可检查的裂口，澜音证明危险信号如何提前预唱，鸦羽证明权限影线如何被查看和校准。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '契约本身还不足以触发隐藏后日谈。那位见证者还必须在对应专精区取得自己的信物，并在 F20 共鸣会战中存活。只签了名、没完成信物，或完成了却没能走出会战，都不会凭空多出她亲笔写下的那一页。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '修复章程则是这一幕的工程选择。它决定我们优先带回护送印、校验簿还是接力电容，因此会改变 F30 的战斗条件和通关后首先恢复的工作。它与 F11 契约可以是不同方向，不需要为了凑“同一主题”而重开。', { expression: 'resolve' }),
      turn('影织姬·鸦羽', 'shadow_boss', '校场优先级又是另一层：它不改写契约，也不改变你已经完成的章程。它只把一份战场备用程序带到灯塔。你可以走校验章程，却先拿护送备用；也可以走护送章程，在这里先拿校验备用。'),
      turn('影织姬·鸦羽', 'shadow_boss', '先打决斗者，两阶段各少两次反击；先打咏唱者，守望者魔法变弱、核心失去二连击；先打总管，清场后补满 MP。'),
      turn('影织姬·鸦羽', 'shadow_boss', '这三个选择的实际代价也不一样。决斗者有先制，护送支援要先吃下它的开场损耗；咏唱者无视防御，校验支援要用生命付清魔法战的代价；总管生命最高，接力支援要先打最长的一战，并且必须把另外两人也清掉后才会回充。'),
      turn('影织姬·鸦羽', 'shadow_boss', '三名守卫最终都要落败，另外两种支援却不会再加载。先查看他们的规则和预计耗血，再决定第一战。'),
      turn('残响精灵·纱雾', 'guide', '若你完成了接力章程，击败总管还会触发章程自己的那次回充。它和校场优先级是两份不同的准备。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', 'F11 的见证者若完成信物并活着走过会战，结案后还会留下只有她能写的后日谈。那不是额外门锁，是一路选择真正留下的痕迹。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '普通结局不会因为没有这一页就变成失败。只要打开灯塔、完成归档，灰港都会结案，未投递的信都会重新上路。隐藏结局不是更高等级的胜利，它只让那位一路亲身见证、也真正活下来的同行者，有机会用自己的话说明她会怎样使用那份经历。', { expression: 'resolve' })
    ]),
    floor28: sequence('第二十八阵：归档风暴', [
      turn('旁白', null, '校场的三名守卫先后停止运转。最先落败的那一名守卫已把备用程序写入灯塔通行印；另外两套程序随着校场停机，只留下不再发光的线路。这场选择已经做完，后面只需记住自己带走了哪份支援。', { kind: 'narration' }),
      turn('旁白', null, '书页风暴撞过回廊，反复念着：“船已靠岸”“名单少一人”“请替我告诉家里”。每句话后面，本该填写投递结果的栏都空着。', { kind: 'narration' }),
      turn('旁白', null, '风中有港务员的公函，有船员临时撕下的票根，也有字迹歪斜的家书。它们在进入登记库时都只有“原文”栏，投递结果本应由后续节点填写；可虚空先驱截断了后续，这些空栏便被旧系统统一解释成“对方仍未收到救援”。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '系统把没有回执的句子一律当成新求援，再拿它们驱动守卫。连一句报平安，也会变成下一次警报。', { expression: 'sorrow' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我在王座上听到这些句子时，以为它们一次次证明灰港还有人。我没有看到空白的投递栏，也不知道同一封信每晚都会被当成新信重播。我把重复当成了人还在等。', { expression: 'sorrow' }),
      turn('旁白', null, '一张写给孩子的短信擦过诺克缇娅肩头。她伸手去接，纸页却再次卷回风里；那动作和三年前守在王座时一模一样。', { kind: 'narration' }),
      turn('旁白', null, '这一次，诺克缇娅没有追着那张纸走进风里。她解下披风，和璃一起把近处的信挡在墙角，又用封条将它们按原有编号排好。抓住一封信不能让它完成投递，但至少能先防止它又被撕成新的警报。', { cg: '/assets/anime/cg/liyue-noctia-archive-storm-cg.webp', cgHold: 3, kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '我们把“写了什么”和“送到哪里”分开保存：原文不改，另标已收到、待重送或收件人不明，并给每次重送留下记录。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '例如这封写给孩子的信：原文永久保留；收件地先记为灰港旧址；因旧址已经迁移，状态改为“收件人不明”；接着由新码头查询家属去向，每次查询都留日期和经手人。找不到的时候，它是一封尚未送达的信，不是一条新求援。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '这样没人替写信的人改口，也不会让一句旧话永远拉响警钟。无法送达可以诚实写明，不能假装它从未存在。', { expression: 'resolve' }),
      turn('旁白', null, '索引兽从风眼里爬出，不断吞下投递栏空白的纸页，又把它们吐成闪着红光的求援卷。击败它，就能让风暴停止自我复制；但真正给每封信填上状态，还要靠下一层的新索引。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '上行阶已经开放。生命与 MP 夹层都是可选补给；终局没有休整，按自己的缺口取用，不必为了清图再受伤。', { expression: 'gentle' })
    ]),
    floor29: sequence('第二十九阵：最后索引', [
      turn('旁白', null, '索引兽破碎后，回廊里的信终于不再复制。诺克缇娅与澜音留在风暴尽头，按原编号收集散页；璃和纱雾带着已经分类的第一批记录登上最后索引室。', { kind: 'narration' }),
      turn('旁白', null, '最后索引只有“完整”和“作废”两格。少一个签名或日期，整份记录便会被退回救援队列，从第一步重新执行。', { kind: 'narration' }),
      turn('旁白', null, '一名已确认登上三号船的孩子，因为家长签名在水里晕开，整页被打上了作废印；一名已在死亡名簿中确认身份的医师，因为缺少离港时刻，又被送回了“等待救援”。索引强迫每一页假装完美，否则就当它什么都没能证明。', { kind: 'narration' }),
      turn('最后保管人', 'act3_last_custodian', '我知道许多人已经离港，却不能在空白处写“待补”。旧规则逼我在伪造完整与抹掉整页之间选一个。'),
      turn('最后保管人', 'act3_last_custodian', '我试过把不清楚的部分空着。索引兽会叼走整页，把它重新发给已经不存在的救援队。我也试过填上猜测的日期，那页虽然通过了，我却再也无法分辨上面哪一部分是证据，哪一部分是我为了让它通过而填的话。'),
      turn('奥术主权者', 'arcane_sovereign', '这是我留下的设计。我怕一次遗漏害死人，便不允许记录带着空白结案；结果所有不完整记录都成了永远不能结束的警报。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '我把空白只当成玩忽职守，没有给“目前真的不知道”留位置。所以保管人想诚实，就必须让整页作废；想保住已知的部分，又只能用猜测补满。这不是她一个人的过错，是我把错误的两选一写进了她的岗位。', { expression: 'regret' }),
      turn('绫星·璃', 'hero', '璃将回执副本压在索引旁。新索引增加“待核实”：先保留已确认事实，再写清缺什么、由谁补、何时复查。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '那名孩子的记录可以写成：“已确认三号船登船名单与北岸到港名单均有此人；家长签名受潮，待与船长副本核对；七日后由新码头登记员复查。”既不说我们已知道不知道的事，也不把已经对上的两份名单丢掉。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '任何人修改状态，都要留下时间、理由与旧版本。以后若再有人截走回执，追查会停在那次改动，不会把整座塔拖回灾难当夜。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '新索引因此有四种可读状态：已离港、已罹难、待核实、待投递。它们不是对人的等级，只是告诉下一个经手人现在知道什么、接下来要做什么。记录可以随新证据变更，但旧状态和改动原因都不会被覆盖。', { expression: 'focus' }),
      turn('最后保管人', 'act3_last_custodian', '保管人终于松开封底钥匙。击败左右索引守卫，我便把它交给你们——请让后来的人能承认“不知道”，也仍有办法继续查。'),
      turn('旁白', null, '左侧索引守卫驱使重影书页连续夹击，右侧最后保管人则以先制封印护住钥匙。两道阻拦都是灯塔前的必经校验：前者检验新索引能否承受重复记录，后者确认开启者真的知道钥匙会释放什么。', { kind: 'narration' })
    ]),
    floor30: sequence('第三十阵：余烬灯塔', [
      turn('旁白', null, '最后保管人的封底钥匙转动时，整座索引室向两侧打开。新索引、缺失的归档页、离港回执和死亡名簿被同一道升降轨送向灯塔。璃走在最前，奥术主权者与诺克缇娅亲自抬着最重的原卷。', { cg: '/assets/anime/cg/liyue-archive-warden-entry-cg.webp', cgHold: 5, kind: 'narration' }),
      turn('旁白', null, '灯塔镜面朝向灰港，镜中仍是三年前的暴风夜。旧协议只给矛盾记录三步：冻结、清零、重建；每次重建都会再次发出求援。', { kind: 'narration' }),
      turn('旁白', null, '镜面下方有两具守卫机构。档案守望者站在外环，确保任何人不能在战斗中偷换原件；勘误核心藏在内环，一旦守望者停机，它就会立即开始清理所有与“无限救援”冲突的状态。两者是连续的两道程序，中间不会留出休整时间。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '我按旧协议保护原件。只要仍有一项矛盾，勘误核心就会清零重算；若整塔断电，它会在复电时从命令副本恢复“持续救援”。', { expression: 'duty' }),
      turn('档案守望者', 'act3_archive_warden', '所以我不能因为你们带来了好消息就自行离岗。如果新卷在攻击中损坏，或有人趁我停机替换回执，勘误核心会在无法分辨真伪的情况下一次性清零。我必须先亲自验证，你们能在我全力拦截时仍保住原件完整。', { expression: 'duty' }),
      turn('奥术主权者', 'arcane_sovereign', '不必再找一个藏在幕后的敌人。删去期限的人是我；三席同意是核心擅自补写；离港回执则被虚空先驱按错误命令截入权限链。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '我的目的是不让断讯中的最后一名求援者被三日期限提前放弃；核心的目的是让我的命令凑齐三席确认，继续合法执行；虚空先驱的任务是在“全员安全”得到上层承认前，截住所有结案回执。每一环都有可以说出口的理由，正因如此，它们才在没人敢停下来检查的时候运转了三年。', { expression: 'regret' }),
      turn('绫星·璃', 'hero', '这场灾难没有第四个人在暗处等着现身。有的是一道没有停止条件的命令、一次为了通过校验而挪动时序的自动操作，以及一台不会质疑上级指令的截留器。我们现在要修的，就是让这三种错误不能再首尾相接。', { expression: 'resolve' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我们带来了那份回执、死亡名簿和被拆走的归档条款。它们证明灰港可以结案，也证明停止警报不会删除任何一个名字。', { expression: 'grave' }),
      turn('无声女王·诺克缇娅', 'final_queen', '离港回执证明船队有了去处，死亡名簿证明不能再把罹难者当成等待回应的求援者，归档条款则证明原件可以在警报停止后继续保存和补充。它们三份缺一不可：只有回执会漏掉罹难者，只有名簿无法证明船队到岸，只有条款则没有足够事实可以结案。', { expression: 'grave' }),
      turn('残响精灵·纱雾', 'guide', '交接分四步：锁住旧原件，另建状态与追溯栏，由原签署人撤销无限延长，再让本人见证把结案送进灯塔。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '第一步，将灰港原卷设为只读。所有求援、离港回执、名簿与过去的错误印记都保持原样，谁也不能靠改原文来制造一份比真相更好看的结案。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '第二步，在原卷外新建状态栏和追溯栏。状态栏写已离港、已罹难、待核实或待投递；追溯栏写记录编号、证据来源、经手人、修改时间、修改理由和上一版。新证据只更新状态，不覆盖旧记录。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '第三步由我来做。我用缺页上保留的原签名撤销“无限延长”，只结束它对守卫、补给和警报的强制执行，不删原命令，也不删除我为什么签它。撤销与错误命令会并列保存，以后每个查看者都能看见我做了什么。', { expression: 'acceptance' }),
      turn('无声女王·诺克缇娅', 'final_queen', '第四步由我与亲身见证者一起完成。我是三年前执行封塔命令的人，不能在结案时又藏到名簿后面。我会亲自确认每类名单的去处，将结案送入灯塔，并在七日后参加第一次复查。', { expression: 'grave' }),
      turn('绫星·璃', 'hero', '这四步做完，登记网才会从“紧急救援模式”转到“归档模式”。直接断电跳过任何一步，都会让它在复电时从旧副本重来，或留下没有投递状态的孤立原件。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '章程决定哪段修复先替我们承压，校场首战决定终局先加载哪份支援。之前省下或花掉的卡、生命和 MP，都会在两阶段里兑现。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '三套修复章程不会在此刻同时生效：只有你在 F21 签署并在对应侧库完成的那一套，会将它的终局效果带进这两战。F27 的交接支援与它叠加，但同样只有首战锁定的那一种。免得开战后猜数字，先在敌人详情里确认它们已经反映到守望者和核心上。', { expression: 'focus' }),
      turn('旁白', null, '璃将离港回执收进胸前的硬皮夹，又用两条封带把死亡名簿固定在背后。她知道守望者不是最后的幕后真凶，也没有期待几句说服就能让它违背保护原件的职责。这一战要回答的问题很具体：她能不能在这柄长枪面前，不丢掉任何一页地走到写入口。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '先让我验证你们能在攻击中守住原件。若我停机，勘误核心会立刻接管；它清零前只有一次交接机会，中间不会休整。', { expression: 'duty' })
    ]),
    bossArchiveWardenPost: sequence('灯塔：守望者停机', [
      turn('旁白', null, '守望者的长枪落地，镜面却没有熄灭。更深处的红光沿书架亮起，所有矛盾页同时浮出“即将清零”。', { kind: 'narration' }),
      turn('旁白', null, '璃单膝撑在写入口前，先摸到胸前硬皮夹里的回执，再解开背后两条封带。死亡名簿的页码连续，缺失的归档页也仍在透明封袋中。守望者的检验已经结束，她没有丢掉任何一份原件。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '原件验证通过，守望协议结束。勘误核心已接管；倒计时结束时，它仍会清空冲突状态并从旧副本重建。', { expression: 'duty' }),
      turn('档案守望者', 'act3_archive_warden', '我的长枪不会再指向你们。但我也无法代替你们写入新状态：我只能证明进入写入口的东西与你们开战前带来的原件一致。接下来的每一个字，都必须由真正承担它的人填写。', { expression: 'duty' }),
      turn('旁白', null, '纱雾把光笔插进写入口：记录编号、来源、当前状态、经手人、修改时间、修改理由。旧版本全部转为只读，不再覆盖。', { cg: '/assets/anime/cg/liyue-traceable-revocation-cg.webp', cgHold: 9, kind: 'narration' }),
      turn('旁白', null, '蓝白色的索引线从光笔下展开。“灰港-终卷”作为新编号建立，离港回执标为船长原件，死亡名簿标为回响王庭原件，三段校验时序与澜音的水镜证言分别挂在来源栏下。原卷中的每一行仍保持原样。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '状态栏开始逐名分流：有离港与到岸双重记录的，标为“已离港”；死亡名簿中已确认身份的，标为“已罹难”；两份名单仍有冲突的，标为“待核实，七日后复查”；家书则按收件地进入“待投递”。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '我用原签名撤销无限延长，只撤强制命令，不撤档案。今后的新求援另编新号，不能再冒充灰港旧案。', { expression: 'acceptance' }),
      turn('旁白', null, '奥术主权者将手按在自己三年前的签名上。光线没有擦除那道笔迹，而是在旁边生成一条新记录：“撤销无限延长；理由：离港回执已找回，三席确认时序错置，归档条款已恢复；签署人：奥术主权者。”', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '我不会把当年的断讯和恐惧当成借口删掉，也不会把今天的撤销写成一次从未犯错的正确决断。两份记录放在一起，后来人才知道哪一个念头造成了什么后果，又是根据什么证据终止的。', { expression: 'acceptance' }),
      turn('旁白', null, '诺克缇娅展开三位本人见证留下的镜印，又将自己的名字写在复查人一栏。她不再用沉默替灰港回答。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '这三枚镜印证明，会战中活着走出来的同行者亲眼见到了回执、名簿和主权者的撤销。我的签名则承认，封塔是我当年做出的选择，复查不会在我走出塔门后又变成没人负责的空栏。', { expression: 'knowing' }),
      turn('旁白', null, '勘误核心在内环完全醒来。它读到了撤销令，却仍按旧协议将这份“与无限救援冲突的新状态”列为最后一项错误。数百道红色校对线拢向写入口，准备在归档模式正式向外投递前将它删除。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '追溯栏已接通，撤销令已签，见证也在场。最后一步不是砸掉档案，而是击败还在执行旧清零程序的勘误核心，护住这次已经有原件、签名和追溯的写入，让灯塔把新状态送到每一座哨站。', { expression: 'resolve' })
    ]),
    ending: sequence('终章：未投递的信', [
      turn('旁白', null, '勘误核心碎裂后，余烬灯塔没有熄灭。它换了一种平静的灯语：“已收到，编号灰港-终卷，值守人纱雾，七日后复查。”', { kind: 'narration' }),
      turn('旁白', null, '红色校对线一根根熄灭，蓝白色的状态线则继续穿过镜面。灰港三年前的求援没有被删除，无限延长也仍保留在历史版本中；但它们都不再命令现在的守卫、商店和哨站重复当年的一夜。', { kind: 'narration' }),
      turn('旁白', null, '沿途哨站逐一回亮确认。旧警报第一次没有重播，未投递的信也不再从书架上飞回求援队列。', { kind: 'narration' }),
      turn('旁白', null, '一号哨站回复“记录收到”，二号哨站回复“旧夜班撤销，保留一人轮值复查”，三号哨站则把结案送进灰港新码头的收件钟。钟声从远处传回来，每响一次，灯塔便在追溯栏里增加一枚实际收到的时间印。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '离港者写明航次，罹难者回到名簿，仍待联系的人保留复查日期。没有谁再被一句“等待确认”困在同一夜。', { expression: 'knowing' }),
      turn('无声女王·诺克缇娅', 'final_queen', '已离港不等于从此无事，已罹难也不等于只留一个句号。前者还要确认在新居所的安置，后者要把消息和遗物送到家人手中，待核实的名字则要在每个复查日之后带着新证据继续查。“结案”结束的是那道无限命令，不是对人的后续照顾。', { expression: 'knowing' }),
      turn('旁白', null, '诺克缇娅摘下王冠旁那枚从未熄灭的警报石，放在灰港终卷边。等名单整理完，她会亲自走出这座塔。', { cg: '/assets/anime/cg/liyue-noctia-afterlight-cg.webp', cgHold: 2, kind: 'narration' }),
      turn('旁白', null, '她的手指离开警报石后，下意识地又收了回去，像是少了那一点持续的震动，就不知道该把手放在哪里。璃没有催她，只把第一批待投递的信匣放到两人中间。诺克缇娅低头看了很久，最后拿起的不是王冠，而是写有新码头地址的行程单。', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '我的签署、误判和撤销都留在追溯栏里。回声摄政官与最后保管人会逐页迁移旧档案，我负责回答每一次复查。', { expression: 'acceptance' }),
      turn('奥术主权者', 'arcane_sovereign', '折角集市的空账也会单独迁移。先确认哪些地方仍需要药和炉火，再重新安排补给，不用新订单去假装过去没有被浪费。我会把每一笔旧扣货的来源一起留下，让账本说明发生过什么，不再替我藏起代价。', { expression: 'acceptance' }),
      turn('残响精灵·纱雾', 'guide', '所有通关者都会看到灰港结案。完成的 F21 章程会决定灯塔先留下护送、校验或接力的后日谈，这是本次修复付出的选择。', { expression: 'gentle' }),
      turn('残响精灵·纱雾', 'guide', '如果完成夜航护送章程，后日谈会记录米露如何把护送印放回灯塔入口；如果完成逐页校验章程，会看到校验簿如何成为新工作台的日常工具；如果完成灯塔接力章程，会看到接力电容如何被拆成小灯，交给值夜人和信使。三者都是完整结案之后的不同第一步。', { expression: 'gentle' }),
      turn('残响精灵·纱雾', 'guide', '若 F11 选中的见证者完成了自己的信物、又从会战中活着归来，还会多出她亲手留下的一页。它不改变胜负，只让那段同行没有被省略。', { expression: 'gentle' }),
      turn('绫星·璃', 'hero', '所以普通结局的结果已经完整：灰港结案，警报停止，名单和原件保留，信件重新投递，所有待核实者有了明确复查人。隐藏见证结局不会否定这个结果，也不是把普通结局改叫坏结局。它只会在此后追加焰璃、澜音或鸦羽其中一人的亲笔后日谈，让玩家看见那份契约最后在她的生活里变成了什么。', { expression: 'resolve' }),
      turn('旁白', null, '灯塔大门在清晨前打开。外面没有三年前的暴风，只有潮水退后湿润的石路，以及从新码头方向赶来的第一辆邮车。车夫没有带剑，他跳下车，展开一张空白签收表，问谁来交接第一批信。', { backdrop: 'emberLighthouse', cg: '/assets/anime/cg/liyue-lighthouse-archive-cg.webp', cgHold: 3, kind: 'narration' }),
      turn('绫星·璃', 'hero', '璃抱起最上面一只信匣，重量比任何核心都轻。记录留下，命令结束；新求援有人接，旧错误也找得到来路。走吧，去送第一批回信。', { expression: 'resolve' }),
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
