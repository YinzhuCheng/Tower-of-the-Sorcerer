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
    objective: '主路可上行；侧路提供生命或 MP 的可选补给。',
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
    cinderScribe: 'act3_cinder_scribe', ashCustodian: 'act3_ash_custodian', shelterWarden: 'crown_blade',
    auditBailiff: 'act3_audit_bailiff', relayRunner: 'mirror_huntress', relayConductor: 'act3_relay_conductor',
    ledgerMage: 'resonance_cantor', archiveLancer: 'act3_archive_lancer', shelfWarden: 'spectrum_marshal',
    triageKnight: 'mirror_duelist', marginDuelist: 'act3_margin_duelist', errataCantor: 'act3_errata_cantor',
    archiveMarshal: 'act3_archive_marshal', indexBeast: 'void_herald', lastCustodian: 'crown_magus',
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
      description: '余烬登记库的守卫。战斗规则和当前数值可在图鉴中查看。'
    };
  }
  enemies.archiveWarden.defeatDialogue = 'bossArchiveWardenPost';
  enemies.errataCore.defeatDialogue = 'ending';
}

function turn(speaker, portrait, text) { return Object.freeze({ speaker, portrait, text }); }
function sequence(title, turns) { return Object.freeze({ title, turns: Object.freeze(turns) }); }

function installDialogues(dialogues) {
  Object.assign(dialogues, {
    floor21: sequence('第二十一阵：余烬登记库', [
      turn('残响精灵·纱雾', 'guide', '上面是仍在运转的余烬登记库。它只允许带走一套修复工具。'),
      turn('绫星·璃', 'hero', '夜航、校验、接力：成本和效果都写在章程面板里。')
    ]),
    floor22: sequence('第二十二阵：夜航侧库', [
      turn('猫卫长·米露', 'cat_boss', '夜航侧库要两张月辉卡和一场战斗。完成后，终局每阶段少三次反击。'),
      turn('绫星·璃', 'hero', '代价明确，就看它值不值。')
    ]),
    floor23: sequence('第二十三阵：逐页校验室', [
      turn('深蓝歌姬·澜音', 'whale_boss', '校验侧库要两张星蚀卡。完成后会削弱 F30 两个阶段。'),
      turn('绫星·璃', 'hero', '先看执行官的魔法耗血。')
    ]),
    floor24: sequence('第二十四阵：灯塔接力室', [
      turn('龙姬·焰璃', 'dragon_boss', '接力侧库要日、月卡各一张；拿到后现在补满 MP，F27 后再补一次。'),
      turn('绫星·璃', 'hero', '那次补魔要留给终局。')
    ]),
    floor25: sequence('第二十五阵：缺页庭', [
      turn('绫星·璃', 'hero', '缺页封条要日曜一张、月辉两张、星蚀一张。'),
      turn('残响精灵·纱雾', 'guide', '这是所有路线都绕不过的支出。')
    ]),
    floor26: sequence('第二十六阵：折角集市', [
      turn('阵间商人·珂珂', 'merchant', '价签都写着：血、刃、甲、补 MP、扩 MP。买一次，下一次就涨价。'),
      turn('绫星·璃', 'hero', '先算清哪一项能撑到 F30。')
    ]),
    floor27: sequence('第二十七阵：接力校场', [
      turn('影织姬·鸦羽', 'shadow_boss', '先击败哪名守卫，就锁定哪一项终局支援。三人仍都要打。'),
      turn('绫星·璃', 'hero', '先看三场战斗，再定顺序。')
    ]),
    floor28: sequence('第二十八阵：归档风暴', [
      turn('残响精灵·纱雾', 'guide', '主路已经通；侧路是生命和 MP 补给。'),
      turn('绫星·璃', 'hero', '拿不拿，要看终局还缺什么。')
    ]),
    floor29: sequence('第二十九阵：最后索引', [
      turn('最后保管人', 'crown_magus', '两名索引守卫都倒下，灯塔楼梯才会显现。'),
      turn('绫星·璃', 'hero', '最后的卡片和 MP，都留给上面。')
    ]),
    floor30: sequence('第三十阵：余烬灯塔', [
      turn('档案守望者', 'act3_archive_warden', '先过我，再过勘误核心。两相连续，没有补给。'),
      turn('绫星·璃', 'hero', '所有终局支援都已经写明。开始吧。')
    ]),
    bossArchiveWardenPost: sequence('灯塔：守望者停机', [
      turn('档案守望者', 'act3_archive_warden', '守望协议结束。勘误核心接管。'),
      turn('绫星·璃', 'hero', '第二阶段。')
    ]),
    ending: sequence('终章：未投递的信', [
      turn('残响精灵·纱雾', 'guide', '灯塔熄下来了。未投递的信终于不会再被重放。'),
      turn('绫星·璃', 'hero', '记录留下，命令结束。')
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
