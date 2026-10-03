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
  enemies.archiveWarden.phaseDialogue = 'bossArchiveWardenPost';
  enemies.errataCore.defeatDialogue = 'ending';
}

function turn(speaker, portrait, text, extras = {}) { return Object.freeze({ speaker, portrait, text, ...extras }); }
function sequence(title, turns) { return Object.freeze({ title, turns: Object.freeze(turns) }); }

function installDialogues(dialogues) {
  Object.assign(dialogues, {
    floor21: sequence('第二十一阵：余烬登记库', [
      turn('旁白', null, '起源核心沉寂后，旧升降梯又向上爬了一段。门缝刚亮，成捆信匣便从塔顶夹层滑落，蜡封上全是三年前的灰。', { kind: 'narration' }),
      turn('旁白', null, '这里不像王庭或炉室，倒像一座被仓促遗弃的邮局。墙上三枚灯牌分别写着“护送”“校验”“接力”，它们通往不同的侧库，却都指向最高处的余烬灯塔。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '陛下，扶住脚边那只信匣。上面还堆着旧命令的抄本，蜡封也三年没拆过；这些信一封都没走出去。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '这张封面写着北辰七号，船号和我们带来的回执一样。先别撕蜡，边上的地址快磨掉了。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '我总想着，让灯多亮一天，外面就多一分获救的机会。可这些信离我这么近，我竟没有过去翻过。', { expression: 'regret' }),
      turn('残响精灵·纱雾', 'guide', '信匣的去向要由外面的哨站回填。先驱当年截住回执以后，空着的地方就一直空着。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '那就先找这只该送到哪儿。主权者，帮我看看地址，别让纸碰到落灰的地面。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '灯塔在最高处，三座哨站都连着它。只有把结案从那里送出去，外面才会撤下旧夜班。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '我知道那条路。旧修复章程还挂在墙上，我们把信匣安稳放下，我带你们认门。', { expression: 'regret' }),
      turn('无声女王·诺克缇娅', 'final_queen', '这只信匣上写着“北辰七号，四十七人，全部抵达北岸”。三年来，我听见的只有“等待确认”……真到了要拆开它的时候，手反而不听使唤。', { expression: 'sorrow' }),
      turn('无声女王·诺克缇娅', 'final_queen', '地址就在这里，我却一直没有看。等送到北岸，我想亲自听听收信的人怎样回答。', { expression: 'sorrow' }),
      turn('残响精灵·纱雾', 'guide', '先别熄这里的灯。抄本还没封存，重新亮起时，它们会把旧命令再抄一遍，信件也会重新掉回求援那一栏。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '先护住这些信，再给它们补上去向。墙上的三份修复章程能帮忙，但这一轮只能签一份、打开对应的侧库。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '“护送”门边都是烧焦的封套；“校验”门里，两张相反的记录还在互相挤；“接力”通向外面的灯全暗着。先修哪处，要看我们能拿什么过去。', { expression: 'gentle' }),
      turn('残响精灵·纱雾', 'guide', '侧库的卡费写在门牌上：护送要月辉两张，校验要星蚀两张，接力要日曜、月辉各一张。先把手里的卡点清，再落笔。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '护送印能替最后两战挡住一些反击；校验簿能削弱守卫靠错页维持的防护。签过章程以后，还得进对应侧库拿到它，准备才算做完。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '接力电容能多装魔力，装上时充一次，校场总管倒下后再补满一次。它不会削弱守卫，但能让我们在连战里多撑一阵。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '都要修，可眼下只能先接一份。我先看看卡和伤势：是更怕扛不住攻击，还是魔力到不了最后？', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '签章程本身不花卡，开侧库才付门牌上的费用。我们在这里定下一份，再往上走；另外两处这次先留下。', { expression: 'resolve' })
    ]),
    floor22: sequence('第二十二阵：夜航侧库', [
      turn('旁白', null, '夜航书架沿墙排成一条窄巷。每只信匣都写着收件地，却没有送达印；守柜人的枪尖仍对准所有出口。', { kind: 'narration' }),
      turn('旁白', null, '灰烬保管人守在主回廊上，身后是通往逐页校验室的灯桥；另一名夜航守柜人站在侧库内，脚边放着一枚尚未启用的护送印。两人不争夺信件，只是都在等一份能通过旧警戒的完整移交记录。', { kind: 'narration' }),
      turn('猫卫长·米露', 'cat_boss', '那一夜，警报会攻击所有离塔的东西，连报平安的回执也不例外。我们只能抱着信匣躲回侧库，眼看最后一班船离岸。'),
      turn('猫卫长·米露', 'cat_boss', '我把回执藏进盔甲，也试过通风井。每次越过白线，火就追过来，认定我在把“未经复核的结案证据”带出塔。你看，这只护腕就是那时烧的。'),
      turn('猫卫长·米露', 'cat_boss', '后来我一听见开门声就紧张。箱子还在，我能看住；一送出去，我就怕再捡回一把灰。'),
      turn('旁白', null, '璃从最上层抽出一匣。寄件人在正面写了三次“母亲收”，第四次改成“若无人签收，请放在旧码头的石狮下”。她没有说安慰的话，只把脱落的蜡屑拢进纸袋，连同信匣一起放稳。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '“母亲收”这几个字留着。我把行程单夹在封蜡外，记下从哪里取、交给谁；过白线时，就把这张给警戒看。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '若选了夜航章程，侧库用两张月辉卡开，里面还有守柜人。主回廊的灰烬保管人挡着上楼的灯桥，先把两处看清。', { expression: 'focus' }),
      turn('猫卫长·米露', 'cat_boss', '护送印能记住信匣经过的路，火阵也就有了可查的行程。最后两战，它还能替我们挡几次追击。两张月辉卡，够的话就再看看守柜人的枪。'),
      turn('猫卫长·米露', 'cat_boss', '他出枪时不会躲着信匣。进去以前，先看清要挨多少下；我不想又抱着焦掉的封套回来。'),
      turn('绫星·璃', 'hero', '先把信匣送到归档口。米露，手别攥得那么紧，封蜡已经硌进护腕了。', { expression: 'resolve' }),
      turn('旁白', null, '她将信匣放回原位，把行程单的空白夹在蜡封下。主回廊的灰烬保管人同时举枪；无论是否进侧库，想上楼都要先让它承认，这批记录有了新的经手人。', { kind: 'narration' })
    ]),
    floor23: sequence('第二十三阵：逐页校验室', [
      turn('旁白', null, '灰烬保管人的钥匙在灯桥上转过半圈，夜航书架终于停止封锁上行口。米露留在后方重新点数信匣，璃则带着第一份行程记录进入校验室。', { kind: 'narration' }),
      turn('旁白', null, '校验室的长桌上，同一个名字常有两页：左页写“等待救援”，右页却盖着船号与北岸抵达时刻。两页都是真纸，只有来源不同。', { kind: 'narration' }),
      turn('深蓝歌姬·澜音', 'whale_boss', '起源核心重新誊抄记录时复制了旧求援页，却没带上被虚空先驱截走的回执。新副本印章更晚，持簿执行官便把右页当成伪造。'),
      turn('深蓝歌姬·澜音', 'whale_boss', '执行官每次都把印章较晚的那页推到上面。可你听，船长的声音还在旧页里，后面有港钟，也有我的回唱。我想让它把这一段放完。'),
      turn('旁白', null, '澜音逐字唱出船号。水镜先响起缆绳摩擦木桩的声音，随后是北岸港钟，再之后才是船长的回话。她在最后一个音节落下后停了很久——三年来，她第一次听见这条航线真正结束。', { kind: 'narration' }),
      turn('旁白', null, '水镜里，最后一艘撤离船的缆绳离开灰港，穿过整夜风浪，在停战次日凌晨抵达北岸。船长报出“四十七人全部抵达北岸”时，澜音的鲸歌在背景里给出了回应；声音、船号和港务时钟三者恰好对上。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '这一句报船号，这一声是北岸港钟。把回执挪过来，姓名和时刻都在这里，别让那张新抄的求援页把它盖住。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '如果我们签的是校验章程，两张星蚀卡可以开启内室；如果没有，就把星卡留给后面的路。拿到校验簿后，最后两名守卫靠错误记录撑起的防护也会被一并拆掉一部分。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '持簿执行官守着上楼的桥，魔法反击能穿过护甲。先看清预计耗血；侧库那本校验簿若能拿到，灯塔两名守卫的护甲和魔法反击都会弱一些。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '对上的几行先夹好，还有冲突的地方留个记号。两张纸一起带走；下一层再翻到这份旧求援，也能同时看见船已靠岸的回执。', { expression: 'resolve' }),
      turn('深蓝歌姬·澜音', 'whale_boss', '桥那边的咒音快起了，别只指望护甲。我把原音收好，等你过来，我们一起送进索引。'),
      turn('深蓝歌姬·澜音', 'whale_boss', '上行装订桥就在执行官身后，去不去校验侧库，都要经过它。等桥打开，我亲手把船长这段声音封进去。')
    ]),
    floor24: sequence('第二十四阵：灯塔接力室', [
      turn('旁白', null, '持簿执行官倒下后，装订桥把回执、船长印和澜音的声音编成了同一条索引。索引已经证明灰港船队到岸，但灯塔外的三座哨站还没有任何一座收到结案。', { kind: 'narration' }),
      turn('旁白', null, '接力台仍在播报“灰港救援中”。远方哨站不敢撤下三年前的夜班，新的船也只能绕开这条已经空出的航线。', { kind: 'narration' }),
      turn('旁白', null, '第一座哨站的指示灯偶尔闪一下，第二座完全沉默，第三座则把所有传讯反射回高塔。墙角堆着三年份的值夜表，同一批名字被重复书写，连笔迹都因疲惫变得越来越浅。', { kind: 'narration' }),
      turn('龙姬·焰璃', 'dragon_boss', '听，外面还在报“救援中”。起源核心已经停了，他们的夜班还没撤。我把第一段接头找出来。'),
      turn('龙姬·焰璃', 'dragon_boss', '先给一号送同一个结案编号，等它回话。再接二号、三号，最后到新码头。别一下把火全灌进去，哪儿断了得听清。'),
      turn('旁白', null, '焰璃把手贴上冷透的传能管。她的炉火烧了三年，却没有一簇火真正照到等消息的人那里。掌心的余温沿铜管散开，很快便被冰冷的金属吞掉。', { kind: 'narration' }),
      turn('龙姬·焰璃', 'dragon_boss', '冷得这么快……再加火也送不过去。璃，替我看下一个接头，我留着这一点热，先让一号回答。'),
      turn('残响精灵·纱雾', 'guide', '如果我们签的是接力章程，就用日曜、月辉各一张打开内室；没有签的话，沿主路继续上行即可。接力电容会扩大共鸣容量，并在装上时立刻充入一轮魔力。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '接力导体会连续攻击；这条路线偏向魔力，并不代表它会少要我们的生命。电容装上后，共鸣上限会多出六十点，并尝试注入一百六十点储量；装得太早、原本就接近满值，多出来的那部分就会白白溢掉。', { expression: 'focus' }),
      turn('龙姬·焰璃', 'dragon_boss', '取到电容的话，校场总管倒下时还能再补满一次。记着那个时刻，别让最后两战开打时，手里只剩一点余火。'),
      turn('龙姬·焰璃', 'dragon_boss', '守望者后面还有勘误核心，得给后一场留下火。我烧得稳些，你也看好还剩多少魔力。'),
      turn('绫星·璃', 'hero', '一站一站来。我在这里等“收到”，你们听见了，就把下一段接上。', { expression: 'resolve' }),
      turn('旁白', null, '焰璃把第一段管线烧到暗红，接力台终于吐出一声清晰的回音：“一号哨站收到。”只有一站，还不是结束；但三年来，这是第一次有消息没有原路退回。', { kind: 'narration' })
    ]),
    floor25: sequence('第二十五阵：缺页庭', [
      turn('旁白', null, '接力导体停止拦截后，一号哨站的回音被收进灯塔索引。可当索引想添上“已收到”，登记库立刻亮起红印：主卷中找不到允许补记去向的条款。错误指向了上方的缺页庭。', { kind: 'narration' }),
      turn('旁白', null, '庭院中央那卷归档旧规缺了最后一页。断口不是刀痕：勘误核心判定“归档”与“持续救援”冲突后，便把这一页自行拆出了主卷。', { cg: '/assets/anime/cg/liyue-noctia-missing-page-cg-audit-v3.webp', cgHold: 8, kind: 'narration' }),
      turn('旁白', null, '璃从碎页里读出“警报停止不影响原件保管”。再往下，是追加新证据的空位，还有撤销命令时要留签名和日期的地方。她将页角转过来，递给诺克缇娅看。', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '我的命令压在这页上面。勘误核心拆它时，只看见“归档”和“无限救援”撞在一起，就保住了我位阶更高的那道印。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '我试着拼回去，它还在往外推。看，这里烫手，正好是我签名的位置。得先取回整页，再由我动笔。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '旧规本来写着：停警报，留原件，改动处留下签名。把这一页带到灯塔，我就能用原签名撤掉无限延长。'),
      turn('绫星·璃', 'hero', '那一笔留给你。我把纸护到灯塔，你亲手签；原来的命令也一并留下。', { expression: 'resolve' }),
      turn('旁白', null, '诺克缇娅蹲下，把散落的页角逐片转正。她一度想帮主权者按住断口，碰到发烫的签名又停了手，只将下一片递到他掌边。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我那时要是能看见这一页……也许还是会怕，却至少知道关上警报以后，该去哪里继续找人。把它带好。', { expression: 'sorrow' }),
      turn('残响精灵·纱雾', 'guide', '缺页封条需要日曜一张、月辉两张、星蚀一张。这是三条章程都绕不过的共同成本；卡片不够，就无法取得原签名。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '四色封条不是多余的门票。日曜认签署人，两张月辉分别封住原卷和撤销前副本，星蚀记下两版的先后。四者同时在场，核心才不能把这次撤销再说成一笔来路不明的改动。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '封条还没解，别硬拉断口。我们先凑齐那四张卡，把缺页完整带到灯塔。', { expression: 'resolve' }),
      turn('旁白', null, '庭院尽头，折页枪卫的枪尖重重落地，吹起一阵碎纸。上行门前的缺页封条还亮着日、月、星三色光。璃将散页拢到一起，向那道门走去。', { kind: 'narration' })
    ]),
    floor26: sequence('第二十六阵：折角集市', [
      turn('旁白', null, '缺页封条解开后，奥术主权者将缺页的断口与原卷逐纹对齐。归档条款没有立即生效：它被收进等待誊录的新卷，要等灯塔前的撤销签名到齐，才能取代无限延长。', { kind: 'narration' }),
      turn('旁白', null, '折角集市原是夜班人员换药、修护甲的地方。旧订单循环扣货后，柜台大多空了，珂珂还习惯性地把每只空瓶擦得发亮。', { kind: 'narration' }),
      turn('旁白', null, '瓶子按进货日期排了整整三面墙，却只有最后一排还存着药水。柜台上的红帐每天自己写下同一句：“北辰七号，需配药二十四人，今夜出发。”可这批药早在三年前就随最后一船交付完毕。', { kind: 'narration' }),
      turn('阵间商人·珂珂', 'merchant', '三年前，登记网每天都替早已不存在的救援队下单。我不能停止扣货，也不能把账面上“已预留”的药交给真正路过的人。'),
      turn('阵间商人·珂珂', 'merchant', '头一个月，我会在每只空箱里塞张纸，写“人已经离港，请停止预留”。第二天红帐还是照扣。后来我把纸改成短信，又改成大字牌，都被当成“新的现场求援”送了回去。'),
      turn('阵间商人·珂珂', 'merchant', '起源核心停下后，那些三年前的旧订单终于不再每天自己刷新。疗伤、磨刃、加固护甲，还有补充或扩充魔力容量的东西，我都重新标了价。至少这一次，柜台上的数字对应的是你现在真的要走的路。'),
      turn('阵间商人·珂珂', 'merchant', '药补眼前的伤，刃和甲让后面的仗省点力气。魔力也有补充和扩容两种，价签在这儿。钱有限，先想好最缺哪一件。'),
      turn('绫星·璃', 'hero', '灯塔那两场仗，会一直耗着手里的生命和魔力。我先看伤势，再点钱，别买了才发现最缺的那样没留够。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '这些空瓶擦得真干净。我刚才还以为整面墙都有药……珂珂，最后那排的价签给我看看。', { expression: 'guarded' }),
      turn('阵间商人·珂珂', 'merchant', '看清再买，别替我清仓。我只要你拿着买的东西走到灯塔，能把那份回执送出来。'),
      turn('奥术主权者', 'arcane_sovereign', '我说“不惜代价”时，没看过你的货架。每天都扣走多少，你记在哪里？等这趟走完，我过来一笔笔看。', { expression: 'regret' }),
      turn('阵间商人·珂珂', 'merchant', '那就别只看空瓶。等灯塔收到结案，你要和我一起核对欠下的补给，先把现在还需要药的地方补上。道歉可以等，新的伤员不能。'),
      turn('阵间商人·珂珂', 'merchant', '等最终回执送到，我就合上这本空账，去灰港新码头开家真正会打烊的店。你们若来得太晚，可别敲后门。')
    ]),
    floor27: sequence('第二十七阵：接力校场', [
      turn('旁白', null, '离开集市时，珂珂撕下红帐最后一页，改写成“等待灯塔回执后重新盘点”。那页纸被钉在门口，不再自行扣货。前方的校场里，三组守卫正为唯一一枚备用核心对峙。', { kind: 'narration' }),
      turn('旁白', null, '校场过去训练夜航队：第一棒护送信匣，第二棒核对内容，第三棒跑完最后一段。如今三组守卫都在争抢同一份备用能源。', { kind: 'narration' }),
      turn('旁白', null, '边注决斗者守在月白跑道，以抢先出剑重现护送途中的突然拦截；勘误咏唱者占据中央法阵，用穿透甲胄的咒音重现错误记录的反噬；接力总管披着格外厚重的护壳，只看队伍能不能撑到传讯完成。', { kind: 'narration' }),
      turn('影织姬·鸦羽', 'shadow_boss', '三条跑道都在抢同一枚备用核心，所以哪一条都吃不饱。第一剑落在哪条线上，核心就跟哪条走。就这么简单。'),
      turn('影织姬·鸦羽', 'shadow_boss', '别找机关。先击败谁，就是选择谁。核心一旦嵌进通行印，就不会自己换到另一条跑道。看清楚，再出第一剑。'),
      turn('残响精灵·纱雾', 'guide', '备用核心被三条线扯住了。它只会落进最先停下的那条线；环廊的契约、登记库的章程都照原来的保留，这里只添一份临战术式。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '先前陪谁查过的那段，仍放在见证卷里。别为这枚核心翻乱它，眼下要看的只是前面三种攻击。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '签过名字还不算完成见证。那位同行者必须亲自取回信物，也要从起源魔源前的会战里活着回来。只有真的走完这段路，她才能在结案后留下自己的话；否则档案不会替她编一页不存在的证词。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '带来的护送印、校验簿或电容，各有各的用处。眼前这份备用术式可以另选，先让我看看哪一种最能补眼前的缺口。', { expression: 'resolve' }),
      turn('影织姬·鸦羽', 'shadow_boss', '章程选过什么，不妨碍这一剑。想多挡追击，就先看左边；想压住法术，看中央；缺魔力，再看总管。'),
      turn('影织姬·鸦羽', 'shadow_boss', '决斗者先倒，后面少两轮追击；咏唱者先倒，守望者的术式会弱，勘误核心也少一次连续反击；总管先倒，就等清完场再补满魔力。'),
      turn('影织姬·鸦羽', 'shadow_boss', '左边先出剑，中央的咒音穿甲，总管那层壳最难啃。都看清了？先吃哪一下，由你定。'),
      turn('影织姬·鸦羽', 'shadow_boss', '三名守卫都得打倒，上行口才开。只有最先倒下的那位留下术式，别出剑以后才想换。'),
      turn('残响精灵·纱雾', 'guide', '若已取回接力电容，总管倒下时还能按接力章程额外补满一次。那次回充仍在，别和校场清场后的备用支援记混。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '先看好第一场，再把另外两场的力气留出来。后记等走出灯塔再写，我不催谁现在落笔。', { expression: 'resolve' })
    ]),
    floor28: sequence('第二十八阵：归档风暴', [
      turn('旁白', null, '三名守卫都已停下，通行印只剩一道备用术式还在亮。璃把它收进衣内，才跨出校场，迎面一张信纸就贴上了她的肩。', { kind: 'narration' }),
      turn('旁白', null, '书页风暴撞过回廊，反复念着：“船已靠岸”“名单少一人”“请替我告诉家里”。每句话后面，本该填写投递结果的栏都空着。', { kind: 'narration' }),
      turn('旁白', null, '船票和公函在风里相互撞击，家书薄得几乎贴不住墙。每一页都有原文，投递结果却空着；先驱当年截断的回话，至今没有补回来。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '这封已经写了“船已靠岸”，为什么还在喊救援？……是后面空着。它一直在等一个收信人的回答。', { expression: 'sorrow' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我听过这几句，几乎每晚都能听见。我以为又有人来信，便继续下令。可这道折痕，这个破口，三年前就已经在了。', { expression: 'sorrow' }),
      turn('旁白', null, '一张写给孩子的短信擦过诺克缇娅肩头。她伸手去接，纸页却再次卷回风里；那动作和三年前守在王座时一模一样。', { kind: 'narration' }),
      turn('旁白', null, '诺克缇娅解下披风，和璃一起挡住墙角的风。刚才那张信落下来时，她双手合拢，将它拢进披风内侧。等纸不再发抖，她才低头找原来的编号。', { cg: '/assets/anime/cg/liyue-noctia-archive-storm-cg-audit-v3.webp', cgHold: 3, kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '字先别动。我在旁边记送到了哪儿：收到了，等着重送，或暂时找不到收件人。每走一趟，添一次日期。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '这封给孩子的信只写着灰港旧址，那里已经搬迁。先记“收件人不明”，再请新码头查家属去向；查过哪天、谁去的，都写在旁边。', { expression: 'focus' }),
      turn('绫星·璃', 'hero', '这一封放进待送的匣里。陛下，披风再往里折一点，别让它飞回去。', { expression: 'resolve' }),
      turn('旁白', null, '索引兽堵在通往上层的风眼中，把投递栏空白的信吞下，又吐成红色求援卷。璃将信匣推到墙根，拔剑挡住扑来的纸页。要带着这些信上楼，得先让它停下。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '索引兽后面就是上行阶。旁边有疗伤和共鸣补给，需要再去拿；灯塔两战会接着耗你的生命和魔力，缺什么先补什么。', { expression: 'gentle' })
    ]),
    floor29: sequence('第二十九阵：最后索引', [
      turn('旁白', null, '索引兽破碎后，回廊里的信终于不再复制。诺克缇娅留在风暴尽头，按原编号收集散页；璃和纱雾带着已经分类的第一批记录登上最后索引室。', { kind: 'narration' }),
      turn('旁白', null, '最后索引只有“完整”和“作废”两格。少一个签名或日期，整份记录便会被退回救援队列，从第一步重新执行。', { kind: 'narration' }),
      turn('旁白', null, '三号船上的孩子因为家长签名被水晕开，整页盖了作废印。另一页记着一名已确认罹难的医师，却因缺了离港时刻，又被退到“等待救援”。璃将两页并排展开，保管人伸手挡住了右下角。', { kind: 'narration' }),
      turn('最后保管人', 'act3_last_custodian', '那一角……先别看。我在日期那里补过字。留着空白，整页就会被退走，我想保住已经查清的那几行。'),
      turn('最后保管人', 'act3_last_custodian', '我猜过一次日期，纸就过去了。后来再翻到它，我却不敢告诉别人那一天是真的。笔迹是我的，连我自己都想把它当成查到的。'),
      turn('奥术主权者', 'arcane_sovereign', '是我定的规矩，少一处就退回整页。我那时怕遗漏伤人，结果让你只能在这里补一个自己都不相信的日期。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '那一笔先留着痕迹。我会在旁边写清，旧规是我留下的；你把没有查到的地方告诉我们，别再一个人替它填满。', { expression: 'regret' }),
      turn('旁白', null, '璃翻到索引旁的空白处，写下“待核实”，再将孩子的两份名单放在它下面。保管人松开挡住日期的手，慢慢把笔挪到那一格旁。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '孩子在三号船名单和北岸到港名单里都找到了。家长签名还看不清，就留着，七日后请新码头登记员拿船长副本来核对。今天先写我们查到的这些。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '把改过的日期、缘由和你原来写的字留在旁边。下一个接手的人看见，才知道这一处还要继续问。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '医师这一页回到已确认的罹难记录；这边还有待核实和待投递的页，都有位置了。新消息来时添在旁边，旧字先封存。', { expression: 'focus' }),
      turn('最后保管人', 'act3_last_custodian', '这把钥匙，你们可以带上去了。但左廊由我先出手，右廊的接力总管也不会让路。护好刚写的这些，胜过我们，封底门才开。'),
      turn('旁白', null, '最后保管人守在左廊，先制封印已亮起；接力总管挡住右廊。两人都还在守着上行结界，必须让他们停下，封底门才会打开。', { kind: 'narration' })
    ]),
    floor30: sequence('第三十阵：余烬灯塔', [
      turn('旁白', null, '封底钥匙转动，索引室向两侧打开。新索引、缺失的归档页、抵达回执和名簿核验副本沿升降轨送向灯塔。璃走在前面，奥术主权者与诺克缇娅抬着沉重的卷册，经过门槛时各换了一次手。', { cg: '/assets/anime/cg/liyue-archive-warden-entry-cg-audit-v3.webp', cgHold: 5, kind: 'narration' }),
      turn('旁白', null, '灯塔镜面朝向灰港，镜中仍是三年前的暴风夜。旧规面对互相矛盾的记录只有三种动作：先封住、再抹掉、最后照旧抄本重录；每次重录，求援也会跟着重来。', { kind: 'narration' }),
      turn('旁白', null, '镜面下方守着两道关。外面的档案守望者护着原件，更深处的勘误核心会抹掉与“无限救援”相冲的记录。守望者一停，核心就会醒来，先前耗掉的生命和魔力也仍得自己设法补上。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '我按守望旧规保护原件。只要仍有一项矛盾，勘误核心就会把冲突内容全部抹掉，再照旧抄本重录；若整塔熄灭，它也会在复明时把“持续救援”重新写回来。', { expression: 'duty' }),
      turn('档案守望者', 'act3_archive_warden', '把原件收稳。我会全力拦截；若在枪下丢了一页，或换进一份说不清来处的回执，勘误核心就会把冲突记录一并抹掉。你们得带着开战前的这些，完整走到台前。', { expression: 'duty' }),
      turn('奥术主权者', 'arcane_sovereign', '我的延长令在这一卷里。三席被挪走的回答、先驱截信的命令也都带来了。守望者，你验吧，我的签名就在封面下面。', { expression: 'regret' }),
      turn('奥术主权者', 'arcane_sovereign', '这卷我抬。哪怕到了台前，我也不能只把印交给璃；撤令那一笔，仍得由我来写。', { expression: 'regret' }),
      turn('绫星·璃', 'hero', '先稳住手，我们一起过这道门。枪尖过来时，卷册贴在身后，别朝它让出去。', { expression: 'resolve' }),
      turn('无声女王·诺克缇娅', 'final_queen', '回执、名簿核验副本和归档条款都在。停止警报以后，名字会留下；我想亲眼看着它们进灯塔。', { expression: 'grave' }),
      turn('无声女王·诺克缇娅', 'final_queen', '北辰七号的到岸页夹好了，罹难和待核实的页在后面。谁的消息还没查清，七天后我接着查。', { expression: 'grave' }),
      turn('残响精灵·纱雾', 'guide', '誊录台就在枪后面。旧卷先封存，新消息写在旁边；主权者签撤销，陛下接下复查。到了那里，各自做自己的这一件。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '求援和那道错令也一起带进去。璃，硬皮夹的扣子收紧，别让旧页滑出来。', { expression: 'focus' }),
      turn('残响精灵·纱雾', 'guide', '新索引留着添消息的地方，时间、来由和动笔的人都要写下。现在先合上，等过了长枪再展开。', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '我的原签名还在缺页上。我会在它旁边写撤销，只停守卫、补给和警报。旧令留在那里，让来查的人看见。', { expression: 'acceptance' }),
      turn('无声女王·诺克缇娅', 'final_queen', '我负责把结案送进灯塔，也负责七天后的第一次复查。原来的封塔令留着，和我的名字放在一起。', { expression: 'grave' }),
      turn('绫星·璃', 'hero', '守望者停手，勘误核心就会接上来。到台前以后别散开，我们得护住刚写的那几行，撑到消息送出去。', { expression: 'resolve' }),
      turn('绫星·璃', 'hero', '别指望守望者倒下，伤势和魔力就能恢复。先看看手里真正带来的准备，再上前。', { expression: 'resolve' }),
      turn('残响精灵·纱雾', 'guide', '章程里修好的东西带稳，校场通行印也放在伸手能摸到的地方。两样可以一起用，别到交手时才忙着找。', { expression: 'focus' }),
      turn('旁白', null, '璃将抵达回执扣进胸前的硬皮夹，用两条封带系牢背后的名簿核验副本。她侧过身试了一步，确认卷册没有松动，才抬眼看长枪的落点。守望者也将枪尖转了过来。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '先带着原件穿过我的枪。我停手后，勘误核心就会醒来；它不会等你们恢复力气，誊录台上的东西一定要护住。', { expression: 'duty' })
    ]),
    bossArchiveWardenPost: sequence('灯塔：守望者收枪', [
      turn('旁白', null, '守望者的长枪落地，镜面却没有熄灭。更深处的红光沿书架亮起，所有矛盾页同时浮出“即将抹除”。', { kind: 'narration' }),
      turn('旁白', null, '璃单膝撑在誊录台前，先摸到胸前硬皮夹里的回执，再解开背后两条封带。死亡名簿页码连续，缺失的归档页也仍在透明封袋中。守望者的检验结束了——她没有丢掉任何一份原件。', { kind: 'narration' }),
      turn('档案守望者', 'act3_archive_warden', '原件无误，守望旧规到此为止。勘误核心已经醒来；镜面上的红光熄到最后一格时，它仍会抹掉冲突记录，再照旧抄本重录。', { expression: 'duty' }),
      turn('档案守望者', 'act3_archive_warden', '原件是你们带来的这些，我已经看清。快写，红光就要落到台面了！', { expression: 'duty' }),
      turn('旁白', null, '纱雾将光笔插进誊录台，旧文字沉入透明封层。她紧贴着纸边展开新的一页，给每份材料留出写明来处和后来改动的地方。红光掠过台沿，璃立即伸手压住被卷起的纸角。', { cg: '/assets/anime/cg/liyue-traceable-revocation-cg-audit-v3.webp', cgHold: 9, kind: 'narration' }),
      turn('旁白', null, '蓝白色的索引线从光笔下展开。“灰港-终卷”作为新编号建立，抵达回执标为船长原件，死亡名簿标为回响王庭原件，三段核验时序与澜音的水镜证言分别挂在来源栏下。原卷中的每一行仍保持原样。', { kind: 'narration' }),
      turn('残响精灵·纱雾', 'guide', '北辰七号，四十七人已抵达。名簿里已经确认的罹难者照原样留着；名单还对不上的，写“待核实，七日后复查”。这些家书另放，等着投递。璃，压住这一边！', { expression: 'focus' }),
      turn('奥术主权者', 'arcane_sovereign', '我用原签名撤销无限延长，只撤强制命令，不撤档案。今后的新求援另编新号，不能再冒充灰港旧案。', { expression: 'acceptance' }),
      turn('旁白', null, '主权者的手按回三年前的签名。原来的“无限延长”仍在，旁边却多出他刚写下的撤销：回执已找回，三席答复被错接，归档条款已经补齐。他写到自己的名字时，红光擦过了手背。', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '签好了。旧的那一道也留着，别遮住我的名字。灯塔还没送出去，我就在这里守着。', { expression: 'acceptance' }),
      turn('旁白', null, '诺克缇娅展开三位本人见证留下的镜印，又将自己的名字写在复查人一栏。她不再用沉默替灰港回答。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '这三枚镜印只证明她们各自亲口留下的那一段见证，没有替任何人扩大范围。主权者刚才的撤销，由他的原签名和新留下的撤销记录自己证明。我的名字写在旁边，是为了另一件事：封塔是我做的，七天后的复查也不能因为我走出塔门，就忽然变成无人负责。', { expression: 'knowing' }),
      turn('旁白', null, '勘误核心在内环完全醒来。它读到了撤销令，却仍按旧规把这份“与无限救援相冲的新结论”列作最后一项错误。数百道红色校对线拢向誊录台，准备在灯塔正式向外送出结案前将它抹掉。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '原件在，撤销令签了，见证也在场。最后一步不是砸掉档案，而是挡住勘误核心，别让它抹掉这份来路清楚的新结论。只要撑到灯塔把结案送出，每一座哨站都会收到同一份回答。', { expression: 'resolve' })
    ]),
    ending: sequence('终章：未投递的信', [
      turn('旁白', null, '勘误核心碎裂后，余烬灯塔没有熄灭。它换了一种平静的灯语：“已收到，编号灰港-终卷，值守人纱雾，七日后复查。”', { kind: 'narration' }),
      turn('旁白', null, '红色校对线一根根熄灭，蓝白色的结案光线则继续穿过镜面。灰港三年前的求援没有被删除，无限延长也仍保留在旧卷原文中；但它们都不再命令现在的守卫、补给柜和哨站重复当年的一夜。', { kind: 'narration' }),
      turn('旁白', null, '沿途哨站逐一回亮确认。旧警报第一次没有重播，未投递的信也不再从书架上飞回求援队列。', { kind: 'narration' }),
      turn('旁白', null, '一号哨站回复“记录收到”，二号哨站回复“旧夜班撤销，保留一人轮值复查”，三号哨站则把结案送进灰港新码头的收件钟。钟声从远处传回来，每响一次，灯塔便在经手注记旁添上一枚真正收到的时间印。', { kind: 'narration' }),
      turn('无声女王·诺克缇娅', 'final_queen', '北辰七号这页终于有了到岸的地方。后面还夹着没找到家属的名字……七天后，我从这里继续。', { expression: 'knowing' }),
      turn('无声女王·诺克缇娅', 'final_queen', '已经罹难的人，要把消息和遗物送回家；住处还没找着的，也得去问。给我一份地址吧，我想先知道出塔以后该往哪边走。', { expression: 'knowing' }),
      turn('旁白', null, '诺克缇娅摘下王冠旁那枚从未熄灭的警报石，放在灰港终卷边。那块石头三年来一直贴着她的脉搏震动，提醒她“还有人没有回来”。现在它第一次安静。她没有立刻戴回王冠，只把披风收紧了一点——等名单整理完，她会亲自走出这座塔。', { cg: '/assets/anime/cg/liyue-noctia-afterlight-cg.webp', cgHold: 2, kind: 'narration' }),
      turn('旁白', null, '她的手指离开警报石后，下意识地又收了回去，像是少了那一点持续的震动，就不知道该把手放在哪里。璃没有催她，只把第一批待投递的信匣放到两人中间。诺克缇娅低头看了很久，最后拿起的不是王冠，而是写有新码头地址的行程单。', { kind: 'narration' }),
      turn('奥术主权者', 'arcane_sovereign', '复查那天，把我也叫来。旧令和撤销令上都是我的名字，有人问起，我自己回答。', { expression: 'acceptance' }),
      turn('奥术主权者', 'arcane_sovereign', '珂珂的旧扣货账也留着。我答应去和她核对，再看看哪里现在缺药、缺炉火。先前浪费的那些，不能悄悄算进一批新货里。', { expression: 'acceptance' }),
      turn('残响精灵·纱雾', 'guide', '灯塔能照常接信了。先修好的那处，就先接下第一班工作，其他的以后继续补。', { expression: 'gentle' }),
      turn('残响精灵·纱雾', 'guide', '夜航护送章程若走到了最后，米露会把护送印重新挂回灯塔入口；逐页校验完成后，那本校验簿会留在工作台上，成为日常复查的工具；若修好灯塔接力，接力电容会被拆成许多小灯，交给值夜人和信使。三条路都发生在完整结案之后，只是大家恢复日常时迈出的第一步不同。', { expression: 'gentle' }),
      turn('残响精灵·纱雾', 'guide', '如果此前签下见证契约的那位同行者取回了自己的信物，也从起源魔源前的会战中活着归来，她还会亲手留下一页自己的话。那一页不改变今天的结案，只是不让那段同行被最后的记录省略。', { expression: 'gentle' }),
      turn('绫星·璃', 'hero', '后记的空页先夹好。今天已经有太多话要送出去，想添上自己的那一页时，再慢慢写。', { expression: 'resolve' }),
      turn('旁白', null, '灯塔大门在清晨前打开。外面没有三年前的暴风，只有潮水退后湿润的石路，以及从新码头方向赶来的第一辆邮车。车夫没有带剑，他跳下车，展开一张空白签收表，问谁来交接第一批信。', { backdrop: 'emberLighthouse', cg: '/assets/anime/cg/liyue-lighthouse-archive-cg.webp', cgHold: 3, kind: 'narration' }),
      turn('旁白', null, '璃抱起最上面一只信匣。它比任何一枚核心都轻，里面却装着三年来始终没有抵达收件人手里的声音。她试着哼了一下重新完整的七段咏唱，最后没有把它唱成命令，只把信匣抱稳了一点。', { kind: 'narration' }),
      turn('绫星·璃', 'hero', '走吧，去送第一批回信。', { expression: 'resolve' }),
      turn('旁白', null, '诺克缇娅抱起第二只信匣，走到车门前，又低头确认了一遍地址。奥术主权者展开签收表，让车夫看清第一处收件地。纱雾留亮复查灯，赶上璃的肩头；车轮碾过湿石路，信匣在车厢里轻轻碰了一声。', { kind: 'narration' })
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
