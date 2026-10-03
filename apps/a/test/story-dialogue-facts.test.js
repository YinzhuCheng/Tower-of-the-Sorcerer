import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTwentyFloorContent } from '../src/game/demo-20-floor-content.js';
import { applyDemoThirtyFloorContent } from '../src/game/demo-30-floor-content.js';
import { CORE_BOSS_IDS, STORY_FACT_POLICIES, getStoryFacts, resolveStoryDialogue } from '../src/game/story-dialogue-facts.js';
import { createInitialState, getDialogue, tryMove, deserializeState, serializeState } from '../src/game/engine.js';
import { getWarCouncilAllies, simulateWarCouncil, enumerateWarCouncilPlans } from '../src/game/war-council.js';


const seed = structuredClone({ dialogues: DIALOGUES, enemies: ENEMIES, floors: FLOORS, items: ITEMS, gridSize: GRID_SIZE });
function overlay(c, count) {
  for (const fn of [applyDemoTenFloorContent, applyDemoTenFloorProgressionTopology, applyDemoTenFloorSpatialRedesign, applyDemoTenFloorProgressionGrammar, applyDemoTenFloorPalaceSpatialRedesign, applyDemoTenFloorHardMode]) fn(c);
  if (count >= 20) applyDemoTwentyFloorContent(c);
  if (count >= 30) applyDemoThirtyFloorContent(c);
  return c;
}
const editions = Object.fromEntries([10, 20, 30].map(n => [n, overlay(structuredClone(seed), n)]));
overlay({ dialogues: DIALOGUES, enemies: ENEMIES, floors: FLOORS, items: ITEMS, gridSize: GRID_SIZE }, 30);
const { createTowerAdapter } = await import('../src/solver/tower-adapter.js');
function stateWith(ids = [], cores = ids.filter(id => CORE_BOSS_IDS.includes(id)).length) {
  const s = createInitialState();
  s.floorStates[0].defeatedBossIds = [...ids];
  s.cores = cores;
  return s;
}
const text = (id, s, count = 30) => resolveStoryDialogue(id, editions[count].dialogues[id], s, { floors: editions[count].floors }).turns.map(t => t.text).join('\n');
const fullState = () => stateWith(CORE_BOSS_IDS);
const required = ['whaleBoss', 'swordBoss', 'dragonBoss', 'astralBoss', 'shadowBoss'];

function deepFreeze(object) {
  if (object && typeof object === 'object' && !Object.isFrozen(object)) {
    Object.freeze(object); Object.values(object).forEach(deepFreeze);
  }
  return object;
}

test('all 69 keys have explicit coverage; legacy keys are not active demo triggers', () => {
  assert.equal(Object.keys(DIALOGUES).length, 69);
  assert.deepEqual(Object.keys(STORY_FACT_POLICIES).sort(), Object.keys(DIALOGUES).sort());
  const active = new Set(FLOORS.map(f => f.introDialogue));
  for (const e of Object.values(ENEMIES)) for (const key of ['preBattleDialogue','phaseDialogue','defeatDialogue']) if (e[key]) active.add(e[key]);
  for (const [id, policy] of Object.entries(STORY_FACT_POLICIES)) if (policy === 'legacy-eight-floor') assert.ok(!active.has(id), id);
});

test('every scene resolves under all 128 core-boss subsets without mutating state, canonical content, choices or IDs', () => {
  const original = JSON.stringify(DIALOGUES);
  for (let mask = 0; mask < 128; mask++) {
    const ids = CORE_BOSS_IDS.filter((_, i) => mask & (1 << i));
    const s = deepFreeze(stateWith(ids)); const before = JSON.stringify(s);
    for (const id of Object.keys(DIALOGUES)) {
      const d = getDialogue(id, s);
      assert.equal(d.title, DIALOGUES[id].title, id);
      assert.ok(d.turns?.length || STORY_FACT_POLICIES[id] === 'legacy-eight-floor', id);
      for (const turn of d.turns ?? []) assert.ok(turn.speaker && turn.text, id);
      assert.deepEqual((d.turns ?? []).flatMap(t => t.choices ?? []), (DIALOGUES[id].turns ?? []).flatMap(t => t.choices ?? []), id);
    }
    assert.equal(JSON.stringify(s), before);
  }
  assert.equal(JSON.stringify(DIALOGUES), original);
});

test('current floor cannot manufacture boss victories, core count, or allies', () => {
  const s = stateWith(); s.floor = 29; s.visitedFloors = Array.from({length:30}, (_,i)=>i);
  const f = getStoryFacts(s, { floors: FLOORS });
  assert.equal(f.coreCount, 0); assert.equal(f.allCores, false); assert.deepEqual(f.availableAllies, []);
  assert.doesNotMatch(text('floor8', s), /七枚核心/);
  assert.doesNotMatch(text('floor12', s), /米露用指甲|猫卫长·米露/);
  assert.equal(f.allyStatus.milu, 'unavailable');
});

test('actual boss positions remain F2 cat/fox, F5 whale/sword/dragon, F7 astral/shadow', () => {
  const at = id => FLOORS.filter(f=>f.map.flat().includes(`enemy:${id}`)).map(f=>f.number);
  assert.deepEqual(at('catBoss'), [2]); assert.deepEqual(at('foxBoss'), [2]);
  for (const id of ['whaleBoss','swordBoss','dragonBoss']) assert.deepEqual(at(id), [5]);
  for (const id of ['astralBoss','shadowBoss']) assert.deepEqual(at(id), [7]);
  assert.match(text('prologue',stateWith()), /第二层两翼/);
  assert.match(text('bossCatPreDemo',stateWith()), /月白侧厅/);
  assert.doesNotMatch(text('bossCatPreDemo',stateWith()), /挡住.*楼梯|第一层/);
  assert.doesNotMatch(text('floor3',stateWith()), /森罗核心确认|澜音按住喉咙/);
  assert.doesNotMatch(text('floor4',stateWith()), /潮汐核心恢复后|塞蕾娜试着侧身/);
});

test('both optional F2 orders and all F5/F7 orders speak only to acquired records', () => {
  assert.match(text('bossCatPostDemo',stateWith(['catBoss'])), /另一翼/);
  assert.match(text('bossCatPostDemo',stateWith(['catBoss','foxBoss'])), /交出的森罗记录/);
  assert.match(text('bossFoxPostDemo',stateWith(['foxBoss'])), /米露那边的记录，我们还没有取到/);
  assert.match(text('bossFoxPostDemo',stateWith(['foxBoss','catBoss'])), /米露的录音/);
  const permutations = xs => xs.length ? xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(rest=>[x,...rest])) : [[]];
  for (const order of permutations(['whaleBoss','swordBoss','dragonBoss'])) {
    const defeated=[];
    for(const id of order) {
      const s=stateWith(defeated);
      if(id==='swordBoss') assert.equal(text('bossSwordPreDemo',s).includes('澜音已经让我们听清'), defeated.includes('whaleBoss'));
      defeated.push(id); const post=stateWith(defeated);
      if(id==='whaleBoss') assert.equal(text('bossWhalePostDemo',post).includes('塞蕾娜交出的副本'), defeated.includes('swordBoss'));
      if(id==='swordBoss') assert.equal(text('bossSwordPostDemo',post).includes('焰璃留下的炉记'), defeated.includes('dragonBoss'));
      if(id==='dragonBoss') assert.equal(text('bossDragonPostDemo',post).includes('三份记录可以放在一起了'), defeated.includes('whaleBoss') && defeated.includes('swordBoss'));
    }
  }
  assert.match(text('bossAstralPostDemo',stateWith([...required.filter(id=>id!=='shadowBoss')])), /同层的虚影区/);
  assert.match(text('bossShadowPostDemo',stateWith(['whaleBoss','swordBoss','dragonBoss','shadowBoss'])), /露米还在同层/);
});

test('five-core main route never claims seven acquired cores or complete song; seven-core branch remains', () => {
  for(const id of ['floor7','floor8','floor10','bossShadowPostDemo','bossPalacePreDemo','bossPalacePostDemo','bossQueenPreDemo','queenPhaseDemo','bossQueenPostDemo','ending']) {
    const t=text(id,stateWith(required));
    assert.doesNotMatch(t,/七枚核心都已|七枚核心都回|带回了七枚核心|七个残缺音节终于接成|重新完整的七段咏唱/,id);
  }
  assert.match(text('ending',fullState()),/重新完整的七段咏唱/);
  assert.match(text('ending',stateWith(required)),/取回的5段/);
  assert.equal(getStoryFacts(stateWith(CORE_BOSS_IDS,4)).allCores,false,'core count is read from the save, never overwritten from inferred route');
});

test('F18 main route acquires receipt independently of optional herald and F19 reports only actual victory', () => {
  const active=stateWith(required);
  assert.equal(getStoryFacts(active,{floors:FLOORS}).heraldStatus,'active');
  assert.match(text('floor18',active),/主航桥下[\s\S]*封袋/,'receipt is taken from the main bridge');
  assert.match(text('floor18',active),/桥下的原始回执已经取回/);
  assert.match(text('floor18',active),/主航桥是上行的路，日曜卡/,'sun card belongs to required main bridge');
  assert.match(text('floor18',active),/星卡开的是先驱那条侧渠，去不去另作打算/,'star-side herald remains optional');
  assert.doesNotMatch(text('floor18',stateWith(required)),/击败虚空先驱，就能/);
  assert.match(text('floor19',stateWith(required)),/先驱还在侧渠结界后徘徊/);
  const cleared=stateWith(required);cleared.floorStates[17].map[6][3]='.';
  assert.match(text('floor19',cleared),/先驱也已停下/);
  assert.ok(!FLOORS[17].exitGuardians?.includes('voidHerald'));
});

test('council availability, actual wheel rules and bonded preparations do not promise deployment', () => {
  const s=stateWith(required);
  assert.deepEqual(getStoryFacts(s).availableAllies,getWarCouncilAllies(s).map(a=>a.id));
  assert.doesNotMatch(text('warCouncil',s),/候选人有米露|四位|谁就去接谁|米露能证明/);
  assert.match(text('warCouncil',s),/胜者带着剩下的伤势继续接下一人/);
  assert.match(text('warCouncil',s),/一百二十点共鸣，一人最多接六十/);
  for(const id of ['bondMilu','bondLanin']) assert.doesNotMatch(text(id,s),/把你安排上场|我会把你排进阵列/);
});

test('council states distinguish unavailable, not deployed, not engaged, incapacitated and combat-ready; none imply death', () => {
  const s=fullState();
  s.council={ completed:true, plan:{order:['milu','lanin','yanli']}, outcome:{ survivors:[{id:'milu',hp:1}], records:[{left:{id:'milu',hp:1}},{left:{id:'lanin',hp:0}}] } };
  const f=getStoryFacts(s);
  assert.deepEqual(f.allyStatus,{milu:'combat-ready',lanin:'incapacitated',yanli:'not-engaged',yayu:'not-deployed'});
  for(const id of ['floor23','floor24','floor27']) assert.doesNotMatch(text(id,s),/澜音逐字唱|焰璃把手贴|焰璃把第一段|鸦羽.*站在|战死|阵亡|已经死/);
  assert.match(getDialogue('floor23',s).turns[1].text,/澜音在前庭受的伤还需要照料/);
  assert.ok(!getDialogue('floor23',s).turns.some(t=>t.portrait==='whale_boss'),'recorded injury does not force an active companion performance');
  assert.match(getDialogue('floor24',s).turns[1].text,/璃停下脚步[\s\S]*两人看清眼前/);
  assert.ok(!getDialogue('floor24',s).turns.some(t=>t.portrait==='dragon_boss'),'unengaged branch stays focused on current hero/guide action');
  assert.match(getDialogue('floor27',s).turns[1].text,/纱雾将光移到前面/);
  assert.ok(!getDialogue('floor27',s).turns.some(t=>t.portrait==='shadow_boss'),'omitted ally is not forced into the scene');
  const post=text('bossArchiveWardenPost',s);
  assert.match(post,/米露的支援术式仍在亮着/,'only recorded positive-HP survivor supports the rite');
  assert.doesNotMatch(post,/(?:澜音|焰璃|鸦羽)的支援术式仍在亮着/);
  const empty=fullState();empty.council={completed:true,plan:{order:[]},outcome:{records:[],survivors:[]}};
  assert.equal(getStoryFacts(empty).councilKnown,true);
  for(const id of ['bossArchiveWardenPost','bossArcaneSovereignPost']) {
    assert.doesNotMatch(text(id,empty),/伤员|阵亡|战死|仍在亮着|0人/,'empty survivors does not manufacture injury, death or support');
  }
  assert.doesNotMatch(text('bossArchiveWardenPost',s),/三枚镜印|三位本人见证/);
});

test('actual engine council outcomes use the same fact resolution and leave all outcomes unchanged', () => {
  const s=fullState(); const plans=enumerateWarCouncilPlans(s);
  for(const p of plans) {
    const outcome=simulateWarCouncil(s,p.plan);
    const state={...s,council:{completed:true,plan:p.plan,outcome}};
    const before=JSON.stringify(state); const f=getStoryFacts(state);
    assert.deepEqual(f.survivors,outcome.survivors.filter(a=>a.hp>0).map(a=>a.id));
    for(const id of ['bossArcaneSovereignPost','floor22','floor23','floor24','floor27','bossArchiveWardenPost','ending']) text(id,state);
    assert.equal(JSON.stringify(state),before);
  }
  assert.equal(plans.length,240);
});

test('10F and 20F conclusions never invent upward stairs; 30F continues unchanged', () => {
  const s=fullState();
  assert.match(text('bossQueenPostDemo',s,10),/封门仍然闭着/);
  assert.doesNotMatch(text('bossQueenPostDemo',s,10),/石阶.*亮起|那就一起上去/);
  assert.match(text('bossOriginCorePost',s,20),/身后没有新的阶梯亮起/);
  assert.doesNotMatch(text('bossOriginCorePost',s,20),/好。继续上行|升降梯却已经/);
  assert.match(text('bossOriginCorePost',s,30),/升降梯已经亮了/,'30F edition has upward continuation');
  assert.match(text('bossOriginCorePost',s,30),/余烬登记库里还留着命令抄本/);
  assert.doesNotMatch(text('bossOriginCorePost',s,20),/升降梯|带上去|继续上行|上面还有我写的抄本/,'no 30F continuation may leak through a base turn');
  assert.doesNotMatch(text('ending',s,10),/余烬灯塔|勘误核心|升降梯/);
  assert.doesNotMatch(text('ending',s,20),/余烬灯塔|勘误核心|升降梯/);
});

test('four minimal fact fixes, real phase transition and existing v10 seen/save semantics survive', () => {
  assert.equal(ENEMIES.archiveWarden.phaseDialogue,'bossArchiveWardenPost');
  assert.equal(ENEMIES.archiveWarden.defeatDialogue,undefined);
  assert.equal(ENEMIES.archiveWarden.phaseNext,'errataCore');
  const s=fullState(); s.floor=29; s.x=5; s.y=4; s.stats={...s.stats,hp:1e7,maxHp:1e7,atk:1e7,def:1e7};s.storySeen=['prologue','floor30'];s.galSeen=['prologue','floor30'];
  const pre=serializeState(s); const loaded=deserializeState(pre); assert.deepEqual(loaded,s);
  const result=tryMove(loaded,0,-1);
  assert.equal(result.dialogue,'bossArchiveWardenPost');assert.equal(result.phaseChanged,true);
  assert.equal(loaded.floorStates[29].map[3][5],'enemy:errataCore');assert.equal(result.moved,false);
  assert.ok(loaded.storySeen.includes('bossArchiveWardenPost'));assert.ok(loaded.galSeen.includes('bossArchiveWardenPost'));
  const legacyPost=structuredClone(loaded);legacyPost.storySeen=legacyPost.storySeen.filter(x=>x!=='bossArchiveWardenPost');legacyPost.galSeen=legacyPost.galSeen.filter(x=>x!=='bossArchiveWardenPost');
  assert.deepEqual(deserializeState(serializeState(legacyPost)),legacyPost,'already-transformed old saves are not rewound or retroactively marked');
  assert.match(text('floor25',s),/四张封条/);assert.doesNotMatch(text('floor25',s),/四色封条|必须先从它手中/);
  assert.match(text('floor26',s),/^缺页封条解开后/);
  assert.match(text('floor29',s),/最后保管人守在左廊.*接力总管挡住右廊/);
  assert.deepEqual(FLOORS[24].puzzles.cardGates.f25MissingSeal,{sun:1,moon:2,star:1});
});

test('new content identity is explicit and runtime asks for state-aware dialogue', () => {
  assert.equal(createTowerAdapter().contentHash(),'bce284f9326a5f58');
  const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/const dialogue = getDialogue\(dialogueId, dialogueState\);/);
  assert.equal(getDialogue('missing',createInitialState()),null);
  assert.equal(getDialogue('prologue'),DIALOGUES.prologue,'legacy static callers remain backward compatible');
});

test('bounded Cat and prologue edits retain identities, existing assets, world facts and readable pacing', () => {
  const s=stateWith();const pro=getDialogue('prologue',s),cat=getDialogue('bossCatPreDemo',s);
  assert.equal(cat.turns.length,16);assert.equal(pro.turns.length,20);
  assert.match(text('prologue',s),/三年前[\s\S]*四十七[\s\S]*北辰七号/);
  assert.match(text('prologue',s),/夺走/);
  assert.doesNotMatch(text('prologue',s),/不是.*而是|两件事并不冲突|全知档案|第一层.*米露守/);
  assert.ok(cat.turns.some(t=>/小凳|长桌/.test(t.text)));
  for(const d of [pro,cat]) for(const t of d.turns) if(t.cg) assert.ok(fs.existsSync(new URL(`../public${t.cg}`,import.meta.url)));
});

test('every retained key resolves in 10F, 20F, and 30F editions', () => {
  for(const count of [10,20,30]) for(const id of Object.keys(editions[count].dialogues)) {
    const d=resolveStoryDialogue(id,editions[count].dialogues[id],fullState(),{floors:editions[count].floors});
    assert.ok(d,`${count}:${id}`);
    assert.ok(d.text || d.turns?.length,`${count}:${id}`);
  }
});

test('missing legacy council data is unknown, not zero witnesses or proof of non-deployment', () => {
  const s=fullState();s.council={completed:true,plan:null,outcome:null};
  const f=getStoryFacts(s);assert.equal(f.councilKnown,false);
  for(const id of ['floor22','floor23','floor24','floor27']) {
    const note=getDialogue(id,s).turns[1].text;
    assert.match(note,/璃向前走了一步[\s\S]*纱雾/,'unknown state uses present action');
    assert.doesNotMatch(note,/核对|结论|会战|未上场|离队|受伤|阵亡|战死/,'characters do not narrate missing save data or invent a companion status');
  }
  for(const status of Object.values(f.allyStatus)) assert.equal(status,'unconfirmed');
  for(const id of ['floor22','floor23','floor24','floor27','bossArcaneSovereignPost','bossArchiveWardenPost']) {
    assert.doesNotMatch(text(id,s),/没有列入前庭|没有轮到.*交手|0人|阵亡|战死/);
  }
});

test('migrated revisit intros respect already-defeated guardians without resetting seen or cores', () => {
  const s=fullState();s.galSeen=[];s.storySeen=['prologue','floor2','floor5','floor7'];
  const before=JSON.stringify(s);
  assert.doesNotMatch(text('floor2',s),/米露和绯叶仍守着各自的核心/);
  assert.doesNotMatch(text('floor5',s),/三人都还受核心牵制|手里的火却还不听我的|我们先斩断强制契约/);
  assert.doesNotMatch(text('floor7',s),/两枚核心仍分别牵着|先让她们从核心的控制里停下来/);
  assert.equal(JSON.stringify(s),before);
  assert.doesNotMatch(text('bossQueenPostDemo',stateWith(required)),/七名守护者也不再受旧命令驱使/);
});

test('stand-alone GAL examples follow real encounter grouping, use a real council result, and never alter game state', async () => {
  const {GAL_PREVIEW_ORDER,createGalPreviewStoryState}=await import('../src/game/story-preview-context.js');
  const position=id=>GAL_PREVIEW_ORDER.indexOf(id);
  assert.ok(position('floor2')<position('bossCatPreDemo'));
  assert.ok(position('floor5')<position('bossWhalePreDemo'));
  assert.ok(position('floor5')<position('bossSwordPreDemo'));
  assert.ok(position('floor7')<position('bossAstralPreDemo'));
  const game=deepFreeze(stateWith());const before=JSON.stringify(game);
  for(const id of GAL_PREVIEW_ORDER) {
    const preview=createGalPreviewStoryState(id);
    assert.ok(getDialogue(id,preview));
    if(position(id)>=position('floor8')) assert.equal(preview.cores,7);
    if(position(id)>position('warCouncil')) {
      assert.ok(preview.council.outcome.won);
      assert.ok(preview.council.outcome.records.length);
    }
  }
  assert.equal(JSON.stringify(game),before);
  const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
  assert.match(main,/requestedGalPreviewDialogue\(\) \? createGalPreviewStoryState\(dialogueId\) : state/);
  assert.match(main,/const historyKey = `\$\{historySceneKey\}:\$\{index\}`/);
  assert.match(main,/rememberGalLine\(historyKey, narratorName, String\(turn.text/);
});

test('F18 new main-bridge source does not reuse chest-extraction artwork', () => {
  const scene=getDialogue('floor18',fullState());
  assert.ok(!scene.turns.some(t=>t.cg?.includes('intercepted-receipt')));
});

test('late optional fox recovery does not forget already-recovered whale audio', () => {
  const t=text('bossFoxPostDemo',stateWith([...required,'foxBoss']));
  assert.match(t,/船长原音已经在你手里/);
  assert.doesNotMatch(t,/再去找船长的抵达原音|我们去听清楚那艘船的回答/);
});

test('non-text interactions stay byte-equivalent for every 69-key state variant', () => {
  const interactions = d => (d.turns ?? [d]).flatMap(t=>Object.entries(t).filter(([k])=>/choice|action|callback|reward|effect|next/i.test(k)).map(([k,v])=>({[k]:v})));
  for(const s of [stateWith(),stateWith(required),fullState()]) for(const id of Object.keys(DIALOGUES)) {
    assert.deepEqual(interactions(getDialogue(id,s)),interactions(DIALOGUES[id]),id);
  }
});


test('prologue separates present approach from one-turn storm memory without a seven-role lecture', () => {
  const pro=getDialogue('prologue',stateWith());
  assert.equal(pro.turns[0].backdrop,'forest');
  assert.equal(pro.turns[0].cg,undefined);
  assert.equal(pro.turns[1].cgHold,1);
  assert.match(pro.turns[1].text,/三年前/);
  assert.ok(pro.turns.every(t=>!t.cgHold||t.cgHold===1));
  assert.doesNotMatch(pro.turns.map(t=>t.text).join('\n'),/月影认人，森罗记名|船号、人数、到岸的时刻/);
});


test('F18 defeated-herald return and migrated save replay never reactivate optional guard', () => {
  const s=stateWith(required);s.floor=17;s.x=3;s.y=7;s.stats={...s.stats,hp:1e7,maxHp:1e7,atk:1e7,def:1e7};
  assert.equal(s.floorStates[17].map[6][3],'enemy:voidHerald');
  assert.equal(getStoryFacts(s,{floors:FLOORS}).heraldStatus,'active');
  const combat=tryMove(s,0,-1);assert.equal(combat.battle.enemyId,'voidHerald');assert.equal(combat.moved,true);
  assert.equal(s.floorStates[17].map[6][3],'.');assert.ok(!s.floorStates[17].defeatedBossIds.includes('voidHerald'));
  assert.equal(getStoryFacts(s,{floors:FLOORS}).heraldStatus,'defeated');
  s.storySeen=['floor18'];s.galSeen=[];
  const before=JSON.stringify(s);
  const scene=getDialogue('floor18',s); const t=scene.turns.map(t=>t.text).join('\n');
  assert.match(t,/静止的虚空先驱/,'real cleared spawn produces defeated scene');
  assert.match(t,/硬皮夹里的封袋/,'returning player already holds the receipt');
  assert.doesNotMatch(t,/先驱随绿光浮起|先驱还在侧渠重复截信|先驱还在拦侧渠|虚空先驱守在星卡/);
  assert.doesNotMatch(t,/击败虚空先驱，就能/);
  assert.doesNotMatch(t,/先驱还在|先驱[^。\n]*截取流过/,'cleared F18 map cannot narrate active interception');
  assert.equal(JSON.stringify(s),before);
  const fresh=text('floor18',stateWith(required));assert.match(fresh,/虚空先驱还在截取流过的信件/,'remaining F18 spawn remains active');
  assert.match(fresh,/桥下的原始回执已经取回/);
  assert.doesNotMatch(fresh,/静止的虚空先驱|先驱也停了/);
});


test('ordinary herald missing maps or fake boss IDs never invent victory or activity', () => {
  const s={cores:5,floorStates:[{defeatedBossIds:[...required,'voidHerald']}],council:{completed:false}};
  assert.equal(getStoryFacts(s,{floors:FLOORS}).heraldStatus,'unknown');
  for(const id of ['floor18','floor19']) {
    assert.doesNotMatch(text(id,s),/虚空先驱已经停下|先驱也已停下|先驱还在|虚空先驱随绿光浮起|虚空先驱守在星卡/);
  }
  const actual=stateWith(required);actual.floorStates[17].defeatedBossIds=['voidHerald'];
  assert.equal(getStoryFacts(actual,{floors:FLOORS}).heraldStatus,'active','actual authored tile wins over impossible fake boss marker');
});

test('same enemy template on F20 cannot change F18 herald fact; core-marker checks reference true bosses only', () => {
  const s=stateWith(required);s.floor=19;s.x=8;s.y=7;s.stats={...s.stats,hp:1e7,maxHp:1e7,atk:1e7,def:1e7};
  assert.equal(s.floorStates[19].map[6][8],'enemy:voidHerald');
  const result=tryMove(s,0,-1);assert.equal(result.battle.enemyId,'voidHerald');assert.equal(s.floorStates[19].map[6][8],'.');
  assert.equal(getStoryFacts(s,{floors:FLOORS}).heraldStatus,'active');
  s.floor=17;s.x=3;s.y=7;tryMove(s,0,-1);
  assert.equal(getStoryFacts(s,{floors:FLOORS}).heraldStatus,'defeated');
  const source=fs.readFileSync(new URL('../src/game/story-dialogue-facts.js',import.meta.url),'utf8');
  const markerIds=[...source.matchAll(/has\('([^']+)'\)/g)].map(m=>m[1]);
  assert.ok(markerIds.length);
  for(const id of new Set(markerIds)) {assert.ok(CORE_BOSS_IDS.includes(id),id);assert.equal(ENEMIES[id].boss,true,id);assert.equal(ENEMIES[id].phaseNext,undefined,id);}
});
