/** Presentation-only facts. Never advance progression, grant rewards, infer a
 * boss defeat from the current floor, or write a save/seen marker here. */
import { getWarCouncilAllies } from './war-council.js';
import { scene as catFirstMeeting } from './cat-first-meeting.js';
import { prologueTurns } from './story-prologue.js';

export const CORE_BOSS_IDS = Object.freeze(['catBoss', 'foxBoss', 'whaleBoss', 'swordBoss', 'dragonBoss', 'astralBoss', 'shadowBoss']);
const ALLY_NAMES = Object.freeze({ milu: '米露', lanin: '澜音', yanli: '焰璃', yayu: '鸦羽' });
const ALLY_BOSSES = Object.freeze({ milu: 'catBoss', lanin: 'whaleBoss', yanli: 'dragonBoss', yayu: 'shadowBoss' });

// This is an explicit coverage inventory, including retained legacy keys. A
// new dialogue key must receive a review policy before the coverage test passes.
export const STORY_FACT_POLICIES = Object.freeze({
  prologue: 'bounded-human-revision', floor2: 'actual-location', floor3: 'optional-records', floor4: 'actual-location', floor5: 'same-floor-order', floor6: 'actual-location', floor7: 'same-floor-order', floor8: 'actual-cores', floor9: 'guaranteed-main-route', floor10: 'actual-cores',
  bossCat: 'legacy-eight-floor', bossFox: 'legacy-eight-floor', bossWhale: 'legacy-eight-floor', bossSword: 'legacy-eight-floor', bossDragon: 'legacy-eight-floor', bossAstral: 'legacy-eight-floor', bossShadow: 'legacy-eight-floor', queenPhase: 'legacy-eight-floor',
  bossCatPreDemo: 'bounded-human-revision', bossCatPostDemo: 'same-floor-order', bossFoxPreDemo: 'optional-guard', bossFoxPostDemo: 'optional-records', bossWhalePreDemo: 'self-contained', bossWhalePostDemo: 'same-floor-order', bossSwordPreDemo: 'same-floor-order', bossSwordPostDemo: 'same-floor-order', bossDragonPreDemo: 'self-contained', bossDragonPostDemo: 'same-floor-order', bossAstralPreDemo: 'optional-records', bossAstralPostDemo: 'same-floor-order', bossShadowPreDemo: 'self-contained', bossShadowPostDemo: 'actual-cores', bossPalacePreDemo: 'actual-cores', bossPalacePostDemo: 'actual-cores', bossBlackSealPreDemo: 'guaranteed-main-route', bossBlackSealPostDemo: 'guaranteed-main-route', bossQueenPreDemo: 'actual-cores', queenPhaseDemo: 'actual-cores', bossQueenPostDemo: 'actual-cores-and-content-end',
  floor11: 'guaranteed-main-route', floor12: 'actual-allies', floor13: 'guaranteed-main-route', floor14: 'pending-three-guards', floor15: 'guaranteed-main-route', floor16: 'actual-allies', floor17: 'guaranteed-main-route', floor18: 'main-route-receipt', floor19: 'main-route-receipt', floor20: 'pending-council-and-content-end', warCouncil: 'actual-allies-and-wheel-rules', bondMilu: 'no-deployment-promise', bondLanin: 'no-deployment-promise', bondYanli: 'conditional-bond', bondYayu: 'conditional-bond', bossEchoRegentPost: 'guaranteed-main-route', bossArcaneSovereignPost: 'actual-council-outcome', bossOriginCorePost: 'content-end',
  floor21: 'guaranteed-main-route', floor22: 'actual-companion-status', floor23: 'actual-companion-status', floor24: 'actual-companion-status', floor25: 'optional-lancer', floor26: 'gate-not-lancer', floor27: 'actual-companion-status', floor28: 'geometrically-required-index-beast', floor29: 'actual-left-right-guards', floor30: 'actual-records', bossArchiveWardenPost: 'phase-and-actual-witnesses', ending: 'actual-cores-and-companions'
});

// Ordinary enemies are deliberately absent from defeatedBossIds. A cleared
// authored spawn tile on the selected scene floor is their existing engine evidence; malformed/absent map
// data is unknown, never invented victory or continued activity.
export function getAuthoredEnemyStatus(state, floors, enemyId, floorNumber = null) {
  const spawns = [];
  floors.forEach((floor, floorIndex) => {
    if (floorNumber != null && floor.number !== floorNumber) return;
    floor.map?.forEach((row, y) => row.forEach((token, x) => {
    if (token === `enemy:${enemyId}`) spawns.push({ floorIndex, x, y });
    }));
  });
  if (spawns.length !== 1) return 'unknown';
  const { floorIndex, x, y } = spawns[0];
  const token = state?.floorStates?.[floorIndex]?.map?.[y]?.[x];
  if (token === `enemy:${enemyId}`) return 'active';
  if (token === '.') return 'defeated';
  return 'unknown';
}

export function getStoryFacts(state, { floors = [] } = {}) {
  const defeated = new Set((state?.floorStates ?? []).flatMap(floor => floor?.defeatedBossIds ?? []));
  const coreCount = Math.max(0, Math.min(7, Math.trunc(Number(state?.cores) || 0)));
  const availableAllies = getWarCouncilAllies(state).map(ally => ally.id);
  const council = state?.council;
  const deployed = council?.plan?.order ?? council?.outcome?.plan?.order ?? [];
  const records = council?.outcome?.records ?? [];
  const councilKnown = Array.isArray(council?.plan?.order ?? council?.outcome?.plan?.order) && Array.isArray(council?.outcome?.records) && Array.isArray(council?.outcome?.survivors);
  const survivors = (council?.outcome?.survivors ?? []).filter(ally => ally.hp > 0).map(ally => ally.id);
  const allyStatus = Object.fromEntries(Object.entries(ALLY_BOSSES).map(([id, bossId]) => {
    if (!defeated.has(bossId)) return [id, 'unavailable'];
    if (!council?.completed) return [id, 'available'];
    if (!councilKnown) return [id, 'unconfirmed'];
    if (!deployed.includes(id)) return [id, 'not-deployed'];
    const ownDuels = records.filter(record => record.left?.id === id);
    if (!ownDuels.length) return [id, 'not-engaged'];
    if (ownDuels.at(-1).left.hp <= 0) return [id, 'incapacitated'];
    if (survivors.includes(id)) return [id, 'combat-ready'];
    return [id, 'unconfirmed'];
  }));
  return { defeated, heraldStatus: getAuthoredEnemyStatus(state, floors, 'voidHerald', 18), coreCount, allCores: coreCount === 7, councilKnown, availableAllies, deployed: [...deployed], survivors, allyStatus, floorCount: floors.length };
}

const narration = text => ({ kind: 'narration', speaker: '旁白', portrait: null, text });
const hero = text => ({ speaker: '绫星·璃', portrait: 'hero', expression: 'resolve', text });
const guide = text => ({ speaker: '残响精灵·纱雾', portrait: 'guide', expression: 'focus', text });
const nameList = ids => ids.map(id => ALLY_NAMES[id]).filter(Boolean).join('、');

export function resolveStoryDialogue(id, source, state, { floors = [] } = {}) {
  if (!source || floors.length < 10 || !STORY_FACT_POLICIES[id]) return source;
  const f = getStoryFacts(state, { floors });
  const has = bossId => f.defeated.has(bossId);
  const present = allyId => ['available', 'combat-ready'].includes(f.allyStatus[allyId]);
  const cores = f.allCores ? '七枚核心' : `已收回的${f.coreCount}枚核心`;
  let turns = (source.turns ?? []).map(turn => ({ ...turn }));
  const put = (index, text, role = null) => {
    if (!turns[index]) throw new Error(`Unknown story turn: ${id}[${index}]`);
    turns[index] = { ...turns[index], ...(role ? role(text) : { text }) };
  };
  const replace = rows => { turns = rows; };

  switch (id) {
    case 'prologue': {
      replace(prologueTurns.map(turn => ({ ...turn })));
      const choices = (source.turns ?? []).flatMap(turn => turn.choices ?? []);
      if (choices.length) turns[18] = { ...turns[18], choices };
      break;
    }
    case 'bossCatPreDemo': replace(catFirstMeeting.turns); break;
    case 'floor2':
      put(0, `第二层的长廊分向两翼。${has('catBoss') ? '月白侧厅的铃声已经停了。' : '月白侧厅仍传来急促的铃声，米露的核心还在那里。'}${has('foxBoss') ? '绯叶的藤蔓也已松开，森罗记录收在璃的手边。' : '另一边的叶牌不断碰撞，绯叶仍守着森罗核心。'}通向上层的路从两处侧厅之间穿过。`);
      put(4, `这封平安信先收好。${has('catBoss') ? '月影录音已经取回，' : '米露守着离港时的录音，'}${has('foxBoss') ? '森罗名册的记录也在手里。' : '绯叶仍保管着乘员名册。'}把这些同船号和姓名逐一核对，就能继续往下找。`);
      put(6, '森罗核心掌管名单和门钥。我想知道最后一页被谁接走了。拿到那段记录，就能沿着去向继续找。');
      put(8, '猫狐两翼守着双钥宝库。先看看卡牌和伤势，再决定是否进去；主路通向第三层的旧导航台，那里也留下了航渠的去向。');
      break;
    case 'floor3':
      put(0, has('foxBoss') ? '森罗记录里的去向签指向这里：第三层的旧潮汐导航台。璃翻到北辰七号那一页，把四十七个名字压在台灯下。导航台已经空了，通往上方的传音管却还在轻轻振动。' : '第三层的旧导航台已经空了。璃拂开铜牌上的水锈，露出“北辰七号”四个字。台边的值守牌写着：潮汐守护者澜音，现驻第五层会合区。');
      put(2, '台边挂着旧航图，浮标从灰港一直排到北岸。璃循着它们看过去，仿佛又听见当夜岸上的人顶着风喊船名。', narration);
      put(3, '传音管里先响起船号，随即被警报淹没。璃侧耳等到下一轮，仍只听清“北辰七号”。她用指节敲了敲铜管，回声沿墙向上走。', narration);
      put(4, '纱雾贴近管口，银蓝的光被水纹震散。她退回璃肩边，指向通往第五层的潮汐支管。', narration);
      put(5, has('catBoss') ? '米露留下的录音说船队已经离港。这里还有它们的航路。我要听到船长后来怎样回答。' : '北岸纪念册里记着他们到岸后的生活。这段旧回声却断在这里；我们去找澜音，问问当夜的回话后来被送到了哪儿。');
      put(6, '澜音在第五层。先把这里的通路打开，带着船号去找她。');
      put(7, '两枚潮汐开关都要激活。层间罗盘能帮我们返回已经打通的地方；有想补查的侧厅，可以以后再回来。');
      break;
    case 'floor4':
      put(0, '离开旧导航台后，璃走进锋刃庭院。墙上的巡卫告示被潮气卷起一角：“风暴期间阻止无关人员上行；撤离确认后，护送巡卫与伤者下塔。”告示下的抄件却缺了最后一句。');
      put(1, '第四层曾是巡卫训练和交班的地方。石柱上布满剑痕，撤离通道的绳栏却整齐卷在墙边，早已没有等候的人。');
      put(2, '训练场里没有塞蕾娜。她的交班牌挂在剑架上，去向写着第五层。璃拿起旁边的工作副本，缺掉的终止栏边缘平整得不像破损。', narration);
      put(3, '原令还在墙上，副本却少了一句让人停手的话。我要把两份都带给塞蕾娜看看。', hero);
      put(4, '远处的训练剑自行升起，向空无一人的门道挥落。璃等它收回，才穿过石柱间的缺口。', narration);
      put(5, '这份副本现在还在驱使兵器。先留住它，再查是谁动过那一栏。');
      put(6, '塞蕾娜在第五层的锋刃支区。她每天拿着什么样的命令，只有找到她才能问清。');
      put(7, '庭院的锻炉机关会改变通路。辉月魔刃也在这里；拿取和交战都要算好代价，别把走到第五层的力气耗尽。');
      break;
    case 'floor5':
      put(0, `第五层的三条回廊汇在炉心前。${has('whaleBoss') ? '潮汐支区的警报已经停了，' : '潮汐支区仍传来被核心牵住的鲸歌，'}${has('swordBoss') ? '锋刃通道的剑印也已解开。' : '锋刃通道仍亮着塞蕾娜的剑印。'}${has('dragonBoss') ? '炉火已被焰璃调低，赤焰核心回到了璃身上。' : '焰璃站在供暖炉旁，赤焰核心还在逼她加火。'}`);
      if (has('dragonBoss')) put(5, '刚才查过的空屋先停火，守卫还在用的房间留着暖意。焰璃，我们再看看有没有漏掉的管线。');
      put(6, '炉心还记着每次加火的时刻。我们要把它和澜音的回声、塞蕾娜的命令副本放在一起，看看当夜究竟发生了什么。');
      put(7, has('dragonBoss') ? '火候已经降下来了。刚查过的空屋先停火，剩下的管线我会继续看着。你手里的炉记也别弄丢。' : '想靠近炉心，就先看好自己脚下。我能同你说话，手里的火却还不听我的。取回赤焰核心以后，我和你逐间查那些屋子。');
      break;
    case 'floor6':
      put(2, '书库的星镜还在重放露米的演算：一面烧去未结案的名字，一面映出永不停歇的战斗。镜旁写着同一个日期，纸页却叠了厚厚一摞。', narration);
      put(3, '璃翻开露米的稿纸，找到了“单独保存姓名”的一页。算式走到起源魔源的入口便断了，下面留着一道深深的笔痕。', narration);
      put(4, '椅背上搭着旧披肩，人却不在。书桌上的交接条将值守点指向第七层的星镜区，露米带着天穹核心去了那里。', narration);
      put(5, '她试过把名字留下来。这里的算式没能算完，我们去问问她卡在了哪一步。');
      put(6, '潮汐原音、锋刃副本和赤焰炉记都在。等星镜重新亮起来，就把三份记录放在一起核对。');
      put(7, '按新月、半月、满月唤醒三面星镜。这里负责把旧记录重新照出来；露米本人还在上一层。');
      break;
    case 'floor7':
      put(0, `第七层的星镜区与虚影织界隔着一道回廊。${has('astralBoss') ? '天穹核心已经取回，露米的镜子不再发起攻击。' : '露米的镜光落在地上，天穹核心仍牵着她。'}${has('shadowBoss') ? '另一侧的影线也已松开，虚影的咏唱正在璃身上轻轻回应。' : '鸦羽的影线从另一侧伸来，虚影核心仍藏在线结里。'}`);
      put(2, `璃掌中${cores}轻轻震动，回声沿影线分向不同的房间。她抬头看清那些交错的线结：七名守护者的契约都系向王庭。`);
      put(6, has('astralBoss') && has('shadowBoss') ? '露米核对了先后，鸦羽追到了发令的影线。带好她们交来的记录，我们可以继续往王庭走。' : '澜音的回话、塞蕾娜的副本和焰璃的炉记都指向上方。露米能核对先后，鸦羽能追查发令的来路。还没解开的核心，我们接着去取。');
      put(7, '天穹与虚影两处守卫都连着本层出口。月、星卡用来开结界，日曜卡留给王座；两边先走哪一处，按眼前的伤势决定。');
      break;
    case 'floor8':
      put(0, `${cores}在门上投出光纹。王庭外环的锁轻响了一声，门后却仍横着维拉的剑。`);
      put(1, '门缝里没有风，核验声一遍遍重读船号和抵达时刻。璃把船长原音靠近门锁，那句迟了三年的回答终于在王庭外响起来。');
      put(4, `璃试着推门，${cores}同时发烫。门后传来一道更古老的命令，压住了门锁刚刚响起的回声。`);
      break;
    case 'floor10':
      put(0, `王座上没有庆典，只有一封不断重播的求援。${cores}在璃身边亮起。`);
      put(4, `我带回了${f.coreCount}枚核心，也带回北辰七号真正的回话。你等了三年的答案就在这座塔里。`);
      break;
    case 'bossCatPostDemo':
      put(5, has('foxBoss') ? '绯叶交出的森罗记录就在我们手里。把它同月影录音放在一起，离港的船号便能逐一对上。' : '绯叶就在本层另一翼，森罗核心保管着乘员名册。想核对录音里的船号，可以去找她。');
      put(6, has('foxBoss') ? '这段录音我带上。米露，你先坐稳，等手不抖了，再去看看侧厅的其他人。' : '另一翼还有绯叶。米露，你先歇一会儿，别急着把所有人的事都揽回去。');
      break;
    case 'bossFoxPreDemo': put(6, '绯叶垂下眼，藤蔓却缠紧她的手腕，将法杖尖端强行对准璃。名册侧厅与双钥宝库仍在她身后的结界里，任何靠近的人都会惊动那些藤蔓。'); break;
    case 'bossFoxPostDemo':
      put(3, '最后一艘船的回签没被送回名册。澜音如今在第五层的潮汐支区；导航台的旧管线还从第三层经过。');
      put(4, has('catBoss') ? '米露的录音和这页名册对上了。四十七个人确实登上北辰七号，我还想听清船长后来怎样回答。' : '四十七个名字都在。先把名册带好，再去找船长的抵达原音。米露那边的记录，我们还没有取到。');
      put(5, '沿第三层旧导航台的管线向上，就能到第五层澜音值守的潮汐支区。');
      if (has('whaleBoss')) {
        put(3, '名册迟到的那一句，现在能补上了。澜音保存的船长原音已经在你手里，把船号同这一页对起来看看。');
        put(4, `四十七个名字和船长报的人数对上了。${has('catBoss') ? '米露的离港录音也能接进来。' : '米露那边的离港录音还没有取回。'}这一页先收好，不要再让它同回话分开。`);
        put(5, '旧导航管线仍连着第五层。我们已经沿它取回潮汐原音，这次带来的名册可以补到同一份记录里。');
        put(6, '终于放在一起了。绯叶，这一页我会带好，你先歇一歇。');
      }
      break;
    case 'bossWhalePostDemo':
      put(1, '我记得船长当年说完了整句话。可这些年一想重放，警报就把它盖住。现在……终于能让你也听清了。');
      put(5, has('swordBoss') ? '船长原音和塞蕾娜交出的副本都在。把时刻对上，就能看出封锁怎样错过了本该结束的时候。' : '塞蕾娜也在第五层。带着这段原音去锋刃支区，让她看看已经到岸的回话。');
      break;
    case 'bossSwordPreDemo': put(4, has('whaleBoss') ? '澜音已经让我们听清北辰七号的抵达回话。我会取回锋刃核心，把你剑上这道命令斩开。' : '原令让你在撤离确认后收剑，眼前的副本却把那一句挖掉了。我先取回锋刃核心，再和你一起查清改动。'); break;
    case 'bossSwordPostDemo':
      put(5, has('dragonBoss') ? '焰璃留下的炉记还在。锋刃副本上的改动时刻，可以同炉心的供能变化核对。' : '赤焰供暖炉就在本层。焰璃仍守着炉心，那里应该存着副本持续供能的记录。');
      put(6, has('dragonBoss') ? '把这份副本也收好。我们已经查过空屋，不能再让旧命令把炉火抬上去。' : '去炉心找焰璃。先看看那些屋子，也看看是什么还在逼她加火。');
      break;
    case 'bossDragonPostDemo': put(5, has('whaleBoss') && has('swordBoss') ? '三份记录可以放在一起了：船长回话已经进塔，封锁的终止栏却被换掉，炉火也没有停。星镜书库能帮我们查清这些改动的先后。' : '这份炉记先收好。澜音和塞蕾娜也在本层；还没取得的记录，等她们停下后再逐一核对。'); break;
    case 'bossAstralPreDemo': put(7, `把潮汐原音、锋刃编辑记录和赤焰炉记摆到镜前。${has('catBoss') ? '月影录音也在。' : ''}${has('foxBoss') ? '再加上森罗名册。' : ''}先核对这些记录里的时刻，看看是哪道命令挡住了回执。`); break;
    case 'bossAstralPostDemo':
      put(1, '带来的记录在镜中逐一对齐：北辰七号确已抵达北岸，潮汐回执也确实进入高塔，却在送到王庭前被截住。随后，一道来自王庭上方的命令将它判成“不可结案”，封锁的终止条件也被删除了。');
      put(5, has('shadowBoss') ? '鸦羽交出的影线与这道印权接上了。上层签名还被黯星黑印遮着，我们得去王庭外面继续追。' : '鸦羽就在这一层的虚影区。她能沿影线查清这道印权从哪里接进来。');
      put(6, has('shadowBoss') ? `本层的两道束缚都松开了。带上${cores}和这些记录，我们去王庭。` : '去同层的虚影区找鸦羽。先把她从影线里解出来，再带着查到的东西去王庭。');
      break;
    case 'bossShadowPostDemo':
      put(1, f.allCores ? '第七段咏唱回到璃体内，七个音节终于接成完整旋律。她试着接上最后一音，喉间久违的回响让她停了一瞬。' : `虚影这一段咏唱回到璃体内。她已经收回${f.coreCount}枚核心，旋律里仍有空缺；眼前这根通向上方的黑线，却终于不再躲开她的手。`);
      put(3, '我只能看见印权高于王座，名称仍被黯星印覆盖。先通过王庭外环，再到第九层找塞芙解除黑印，才能看清签名。');
      put(4, has('astralBoss') ? `${cores}带回的记录都收好了。露米的星镜与鸦羽的影线可以互相对照；王庭外环还要经过维拉。` : '露米还在同层的星镜区，天穹核心仍牵着她。先让她停下，我们才能越过本层出口。');
      break;
    case 'bossPalacePreDemo':
      put(2, `把你带来的记录展开。${cores}会留下各自的回声，我要听清它们的船号和时刻。`);
      put(3, '潮汐原音说船到了北岸，锋刃、赤焰、天穹与虚影则记录着回话进塔后的遭遇。我会逐一核对已有的证据，空着的位置也照实留下。');
      put(6, `${cores}依次亮起，门锁仍将维拉的剑推离剑鞘。外环的战斗检验尚未结束，她还不能让路。`);
      put(8, '带着这些记录通过我的剑。我确认过后，会把外环通行印交给你。');
      break;
    case 'bossPalacePostDemo':
      put(0, `维拉将剑插回门锁。${cores}留下的光纹沿剑脊汇合，密闭门随之退开半尺。`);
      put(1, '已有记录的船号和时刻对上了：北辰七号四十七人抵达北岸。我解除王庭外环。');
      put(2, '门上的“等待确认”逐字熄灭，换成清晰的抵达时刻。璃看着那行小字亮稳，才把手从船长原音上移开。');
      put(4, '外环只能核对这些记录，无法撤销高于王座的命令。北辰七号已经到岸，可整场灾难还有别的船次与名字要查。先看清无限延长令是谁签的。');
      break;
    case 'bossQueenPreDemo':
      put(6, `诺克缇娅看向${cores}。澜音保存的船长回话、露米核对过的时刻在殿中响起，她的剑尖第一次动摇。`);
      put(8, `北辰七号四十七人全部抵达北岸。澜音的原音还在，塞蕾娜、焰璃、露米和鸦羽留下的记录也彼此对得上。${has('catBoss') ? '米露的离港录音在这里。' : ''}${has('foxBoss') ? '绯叶保住的名单也在。' : ''}那份回答进过高塔，却没有送到你手里。`);
      break;
    case 'queenPhaseDemo':
      put(3, '璃，船长的回话和我们带来的记录都还在，眼前这些燃烧的名字只是幻象。我会扯开锁链，你看准核心。');
      put(4, `诺克缇娅反手扯断束缚自己的黑纹，为璃撕开一道狭窄缺口。${cores}沿缺口照亮黯星的裂缝。`);
      break;
    case 'bossQueenPostDemo':
      put(1, `诺克缇娅逐个触碰那些名字。${cores}的光照进卷册，四十七块姓名牌渐渐稳住。她又看了一遍船长的抵达时刻，没有移开手。`);
      put(2, '王庭的强制警报暂时停了。璃试着低哼，仍有音节接不上。侧厅里未取回的核心还牵着她的声音，她将来路牢牢记在心里。');
      if (f.allCores) put(2, '王庭发往各处的强制警报暂时停了。七段咏唱都已回到璃身上，她把声音放轻，听见殿外终于有了脚步之外的风声。');
      put(3, `我已经收回${f.coreCount}枚核心。原始签名指向更高处的起源魔源，还有事情要查。`);
      put(8, `王座后的石阶一节节亮起。璃回头看了一眼不再鸣警的十层，收拢已经取回的${f.coreCount}枚核心。灰港的原卷尚未完成最终归档，她还要带着它们往上走。`);
      if (f.floorCount === 10) {
        put(4, '封塔是我做的，拆走你的咏唱也是我做的。我会把经过写下来，亲自去向守护者说明。她们愿不愿意见我，由她们决定。');
        put(5, '今天先照看受伤的人，把王庭的记录收好。我不会再让你一个人替我善后。');
        put(6, '签名仍指向起源魔源。但这一段通路到王座为止，我们先把查明的记录带回去。');
        put(8, '王座后的封门仍然闭着。璃回头望向来时的长阶，警钟没有再次响起。十层的战斗结束了，灰港更深处的疑问留在她收好的卷册里。');
        put(9, '先回去。把这些带给还在等消息的人，也让大家歇一歇。');
      }
      break;
    case 'floor12':
      if (!has('catBoss')) {
        put(2, '温室外没有米露的铃声。璃推开被药瓶挡住的门，蹲下来捡起一支，瓶身还带着刚印过标签的热度。', narration);
        put(3, '第七船，二十四人的药。这里写着受领人的名字，对面的航次栏却空着。', hero);
        put(4, '璃用剑鞘拨开瓶底的蜡。旧日期下还有旧日期，连续三年的重印叠在同一张处方上。', narration);
        put(6, '这么多药，每天都在送往空屋。先把处方留好，等查清是谁一直在下单，才能让温室停下来。', hero);
        put(7, '璃把滚到门边的药瓶一支支摆回架上。她空出一块地方，将那支带着层叠日期的样本单独放好。', narration);
        put(10, '我记下这些编号。以后核对时，先看看药究竟交给了谁。', hero);
      }
      break;
    case 'floor16':
      put(2, `${has('catBoss') ? '米露带来了补给的线索；' : ''}焰璃要说炉火，鸦羽要说那根截住回执的影线。我想先让镜子听见船长。`);
      put(7, `前庭会战要选三人。${nameList(f.availableAllies)}现在都能加入；到阵前先试好顺序和共鸣，谁撑不住，后面的人就接上。`);
      put(8, '环廊那份约定还在。信物先收好，到了前庭再排阵列；无论最后谁上场，都别为了一份约定硬撑伤势。');
      break;
    case 'floor18': {
      put(4, f.heraldStatus === 'defeated' ? '绿光从静止的虚空先驱身边流过，再没有信被拽进去。璃取出硬皮夹里的封袋，鸦羽托着它往亮处挪了挪：船长印和旧港钟的时刻一点也没磨掉。' : `鸦羽伏低身子，把影线送进主航桥下。封袋沿着船长印记一点点靠近，旧港钟的时刻在袋口闪了一下。${f.heraldStatus === 'active' ? '旁侧星渠亮起绿光，虚空先驱还在截取流过的信件。璃收回目光，接住递来的封袋。' : '侧渠的光流遮住远处，璃先接住眼前的封袋，摸了摸完好的蜡封。'}`);
      delete turns[4].cg; delete turns[4].cgHold;
      put(5, f.heraldStatus === 'defeated' ? '船长的印还清楚。原件从封印里取回了，先驱也停了；把袋口合好，我们沿主桥继续走。' : `抓住袋口，别碰那条绿线。原件被拖进上层封印后，卡在主桥的回流里了。${f.heraldStatus === 'active' ? '先驱还在侧渠截信，顾不上我们手里这一份。' : ''}我收线了，把它拿稳。`);
      put(8, f.heraldStatus === 'defeated' ? '侧渠安静了。封袋扣紧些，桥下还有回流；这回别再让它离开你的手。' : `${f.heraldStatus === 'active' ? '先驱还在侧渠，进入那条支路要用星卡，先看好卡和伤势再去。' : '先把袋口扣好，侧渠深处隔着光流，等看清再作打算。'}手里这份原件，可以带去回响王庭了。`);
      put(9, f.heraldStatus === 'defeated' ? '日曜卡对应主航桥的锁。那边用星卡开的侧渠已经清过了，往上走就好，回执跟着我们。' : `主航桥是上行的路，日曜卡要留给那里的锁。${f.heraldStatus === 'active' ? '星卡开的是先驱那条侧渠，去不去另作打算。' : '星卡开的是旁侧支路，要不要回头查看，等我们决定。'}桥下的原始回执已经取回，先收好它。`);
      put(11, '封袋我来拿。我们去回响王庭，让那四十七个名字在名簿里添上抵达时刻，也看看还在等消息的是谁。');
      break;
    }
    case 'floor19':
      put(0, f.heraldStatus === 'defeated' ? '璃将航渠带回的原始抵达回执铺开。侧渠的虚空先驱也已停下，船长印、北岸港钟和四十七名乘员的抵达时刻清晰可辨，与澜音保存的回话逐一对上。' : `璃打开从主航桥下取回的封袋。${f.heraldStatus === 'active' ? '远处的虚空先驱还在侧渠结界后徘徊，' : ''}手中这份原件已经带出了回流：船长印、北岸港钟和四十七名乘员的抵达时刻，与澜音保存的回话逐一对上。`);
      break;
    case 'floor20':
      put(11, '回执和名簿都在，我们的人也准备好了。先安排前庭会战，再取回撤令的印权。我会守住这些纸页。');
      put(12, '先选三人参加前庭会战，分好共鸣，再从主权者手里拿到改令权，最后面对起源核心。撑不住的人退出，能继续的人接过来。');
      if (f.floorCount === 20) {
        put(13, '这一段通路的尽头就是起源核心。让它停下以后，先将这里查清的证据与遗留问题收好。');
        put(14, '先完成眼前这一战。之后照看受伤的人，再把我们找到的回答带出王庭。');
      }
      break;
    case 'warCouncil':
      put(1, '三道位置已经亮了。先把顺序排好，让镜轮试一遍；我守着这里，等你们过前庭。');
      put(2, `${nameList(f.availableAllies)}现在都能加入，选三人上场。我想把船长的回话亲自带过去，先看看我站哪一位。`);
      put(3, '对面依次是铁卫、咏唱者、执刑官。胜者带着剩下的伤势继续接下一人；谁撑不住，才换本方下一位。排在后面的人，也可能不用交手。');
      put(5, '先把共鸣线接上，看清镜里每一场会剩多少力气。后面还有主权者和核心，能多留一点支援，就多留一点。', guide);
      put(6, '会战结束后仍能作战的盟友，会把自己的术式带进后面的战斗。大多数信物也要由她继续支撑；米露的月镜例外，只要列入出场阵列，护幕就会留下。');
      put(7, `${has('catBoss') ? '米露，先站稳。' : ''}我的炉火还够烧一阵。让我看看前面的守卫，别把最后一点力气都押进第一场。`);
      put(8, '按镜里的结果调整。前面的人还站得住，后面就等；真撑不住了，接手的人一定要赶上。');
      put(9, '大家再看一次自己的位置。纸页收稳，共鸣接好；准备好了，我们就过去。');
      break;
    case 'bondMilu':
      put(1, '月镜先准备好。会战前我们再一起看阵列，由最后的出场安排决定。');
      if (!has('catBoss')) put(0, '这枚月镜可以交给米露。先收好；如果要让她带着它进入会战，还得回第二层解开月影核心对她的控制。', guide);
      break;
    case 'bondLanin': put(1, '把导管准备好。会战前我们再看完整的阵列，无论最后怎样排，你已经带回的原音都会留下。'); break;
    case 'bossArcaneSovereignPost':
      put(2, f.councilKnown ? (f.survivors.length ? `${nameList(f.survivors)}还在支撑术式。回执与名簿交给我，继续往前；受伤的人先退出阵列。` : '回执和名簿交给我，我来送到誊录台。前庭的出场记录先收好，别挤在封印旁。') : '前庭的记录还没有核对齐，先留在这里。回执与名簿交给我，不要挤在封印边上。');
      break;
    case 'bossOriginCorePost':
      if (f.floorCount === 20) {
        put(0, '核心停了，纸页也都在。先扶好受伤的人，我们从王庭回去。');
        put(3, '你要回答的，我也要回答的，都写下来。今天先让这里的人离开阵列，别让她们继续站着等。');
        put(4, '两人站在停止转动的印环前。王庭的门向来路打开，身后没有新的阶梯亮起。');
        put(5, '门朝来路开了。灰港的原件收在这里，没查清的几处也夹好了，我们带回去再看。');
        put(6, '我先去看看她们。回到门廊以后，再将封塔的经过说清楚。');
        put(7, '把我的签名也带上。有人问起，我会回答。');
        put(8, '走吧。外面还有人在等消息。');
      }
      break;
    case 'floor22':
      if (!present('milu')) {
        put(2, '璃站在白线外，试着将一片脱落的封蜡靠近出口。火阵立刻抬高，吓得她收回手。', narration);
        put(3, '护柜旧令还亮着：未经复核的结案证据不得离塔。烧焦的护腕压在柜脚，信匣上也有旧火痕。', narration);
        put(4, '这些箱子被拦了很久。先找能护住它们的办法，再试出口。', hero);
        put(8, '护送印能留下取件、经过和签收的记载，过火阵时就有行程可查。最后两战也能多挡几次追击；想取它，先看守柜人的枪。', guide);
        put(9, '两张月辉卡只花在护送侧库。先看伤势，再决定是否进去；上楼要过的是主回廊那名保管人。', guide);
        put(10, '这一匣我来拿。先送到归档口，过火线时替我看着左边。');
      }
      break;
    case 'floor23':
      put(0, present('milu') ? '灰烬保管人的钥匙在灯桥上转过半圈。米露留在后方点数信匣，璃带着主路的移交记录走进校验室。' : '灰烬保管人的钥匙在灯桥上转过半圈。璃回头确认信匣没有滑落，才带着主路的移交记录走进校验室。');
      put(4, present('lanin') ? '澜音再次唱出船号。缆绳摩擦木桩，北岸港钟响起，船长的回话跟着落下。她这次亲手让水镜停在最后一音，轻轻呼出一口气。' : '璃将保存的潮汐原音放进水镜。缆绳摩擦木桩，北岸港钟响起，船长的回话跟着落下。她等整段放完，才伸手去翻对应的那页记录。');
      if (!present('lanin')) {
        put(2, '两份纸上的印能看清：起源核心重抄的是旧求援页，被截留的抵达回执没有随它一同进来。', guide);
        put(3, '新印又把旧页推下去了。先把原音放完，船号和北岸港钟都在里面，回执就放在旁边。', hero);
        put(10, '执行官的咒音快起了，会直接穿过护甲。看清预计耗血，再往桥上走。', guide);
        put(11, '桥一打开，就把保存的原音送进去。让下一层也能听见船长，别只留一句转抄的话。', guide);
      }
      break;
    case 'floor24':
      put(0, '持簿执行官倒下后，装订桥把回执、船长印和保存的潮汐原音编在一起。北辰七号的抵达已经核对清楚，灯塔外的三座哨站却仍没有收到结案。');
      if (!present('yanli')) {
        put(3, '外面还在等这句话。先把同一个结案编号送到第一站，听见回答，再接下一站。', hero);
        put(4, '铜管上标着三站的去向。哪里断了就补哪里，别把全部火力压进同一根管子。', guide);
        put(5, '璃摸了摸传能管，冰得缩回手。管壁上仍有旧炉火烧出的深色痕迹，远处的灯却没有跟着亮。', narration);
        put(6, '火送到这里就散了。接头在哪？我们先找第一处。', hero);
        put(9, '接力章程完成后，校场的总管倒下还能再回充一次。之后的两场战斗，要靠留下的魔力撑过去。', guide);
        put(10, '回充会有上限，满着时多出来的魔力留不住。看好眼前的储量，再决定何时去拿电容。', guide);
        put(12, '纱雾沿第一段传讯线送出一缕微光。接力台终于回了一声“一号哨站收到”。璃抬头等着，第二站的灯还没有亮。', narration);
      }
      break;
    case 'floor25': put(10, '四张封条各有用处：日曜认签署人，两张月辉分别封住原卷和撤销前副本，星蚀记下两版的先后。凑齐之后，才能完整取出缺页。'); break;
    case 'floor27':
      if (!present('yayu')) {
        for (const i of [3, 4, 9, 10, 11, 12]) put(i, turns[i].text, guide);
      }
      put(7, '后记先夹着。约定的信物得带回来，本人也要列入会战阵列、战后仍能支撑术式，才能接着完成。别在这里急着落笔，等她自己来写。');
      break;
    case 'bossArchiveWardenPost':
      put(1, '璃单膝撑在誊录台前，先摸到胸前硬皮夹里的回执，再解开背后两条封带。名簿的核验副本页码连续，缺失的归档页也仍在透明封袋中。她一份份摸过去，没有少。');
      put(5, '蓝白色索引线从光笔下展开。回执标为船长原件，名簿标为回响王庭核验副本，三席时序和保存的潮汐原音也一同编入。每份材料的来处都还看得清。');
      put(10, f.councilKnown ? (f.survivors.length ? `诺克缇娅把已有的见证记录压到封层下。${nameList(f.survivors)}的支援术式仍在亮着；她照着前庭记录留下各人的经过，提笔写下七天后的复查日期。` : '诺克缇娅将已有的见证记录送入封层，前庭的出场记录放在一旁。她握稳光笔，在复查人一栏写下自己的姓名和七天后的日期。') : '诺克缇娅将已有的见证记录压到封层下。前庭的经过有一处还缺着，她留下一句“待核对”，随即翻到复查页，签下自己的名字和七天后的日期。');
      put(11, '封塔是我做的。七天后，我回来查这些名字。纱雾，把这一页也收进去。');
      put(13, '回执在，名簿副本也在，撤销令签好了。挡住勘误核心，别让它毁掉誊录台。灯塔还差最后一次向外送信。');
      break;
    case 'ending':
      if (f.floorCount < 30) {
        replace([narration(f.floorCount === 10 ? '王庭的警钟停了。璃收好北辰七号的回话，和诺克缇娅一同望向来时的长阶。十层的旅程在这里告一段落。' : '起源核心停下了，誊录台上的记录仍然完整。璃收好回执与名簿副本，回身去看前庭的人。二十层的战斗结束了。'), hero('先把消息带回去。还没有查完的，也一起记下来。')]);
        break;
      }
      put(11, '修好的护送印挂入口，完成的校验簿留桌上；若修好的是接力电容，就拆成小灯，交给值夜人和信使。哪一样还没做完，先把位置空着。');
      put(12, '契约和会战的记录夹在前面了。能完成见证的人，纸笔留给她；其他空页先收好，等她自己想说的话。');
      put(15, f.allCores ? '璃抱起最上面一只信匣，试着哼出重新完整的七段咏唱。最后一音落稳时，她把信匣往怀里又收了收，走向门外的邮车。' : `璃抱起最上面一只信匣，哼了两声。已经取回的${f.coreCount}段咏唱轻轻回应，缺下的音节她没有勉强接上。等信送到，她还要回侧厅，把遗落的核心带回来。`);
      break;
    default: break;
  }
  const companion = { floor22: 'milu', floor23: 'lanin', floor24: 'yanli', floor27: 'yayu' }[id];
  if (companion && !present(companion)) {
    const name = ALLY_NAMES[companion];
    const note = {
      unavailable: `璃把卷册往怀里收稳，和纱雾一同走向前面的通路。`,
      'not-deployed': `纱雾将光移到前面。璃循着那点亮处，先看清脚下的路。`,
      'not-engaged': `璃停下脚步，抬手示意纱雾靠近。两人看清眼前的情形，才继续往里走。`,
      incapacitated: `${name}在前庭受的伤还需要照料。璃收好她留下的记录，朝纱雾点点头，先接下眼前这段路。`,
      unconfirmed: `璃向前走了一步，纱雾的微光随即越过她的肩头，照亮了前路。`
    }[f.allyStatus[companion]];
    if (note) turns.splice(1, 0, narration(note));
  }
  return { ...source, turns };
}
