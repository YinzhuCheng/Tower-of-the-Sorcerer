import { FOREST_STORY_CONTENT as C } from './content.js';
import { forestTurnStage, FOREST_ASSET_POLICY, FOREST_CAST } from './presentation.js';
import { calculateBattle } from '../../../core/battle.js';
export { C as FOREST_STORY_CONTENT, FOREST_ASSET_POLICY, FOREST_CAST };
export const FOREST_STORY_IDS=Object.freeze([...C.order]);
const copy=x=>structuredClone(x), flag=(s,id)=>s.flags[id]===true, clear=(s,id)=>s.cleared.includes(id);
const freeze=x=>{if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);Object.values(x).forEach(freeze);}return x;};freeze(C);
const fail=message=>{throw new Error(message);};
const b=n=>`b${String(n).padStart(2,'0')}`;
const RESPONSES=new Set(['b02_choice','b12_choice','b23_shawu_reply']);
const WARM_SCENES={b17_offer:'greenhouse',b18_offer:'pear',b19_offer:'lodge',b17_revisit:'greenhouse',b18_revisit:'pear',b19_revisit:'lodge'};
const ROOT_SCENES={b07_choice:7,b16_route:16,b21_route:21,b24_route:24};
const HEAT_ENDS={5:'b30_heat_greenhouse_lodge',3:'b30_heat_greenhouse_pear',6:'b30_heat_lodge_pear'};
const PRE_ENEMIES={b01_pre:'b01.timberPuppet',b05_pre:'b05.sluicePuppet',b06_pre:'b06.sawPuppet',b09_pre:'b09.foundationRig',b11_pre:'b11.returnPuppet',b15_pre:'b15.cablePuppet',b28_pre:'b28.guardDrive'};
/** No gameplay state, effects, currency or callbacks are owned by this module.
 * Give it the SAME immutable runtime used by the screen's dispatch. */
export function createForestStory(runtime) {
  if(runtime.spec.id!=='forest-b')fail('B story requires forest-b runtime');
  const spec=runtime.spec,heatSpec=spec.semantics.heat,wedgesSpec=spec.semantics.wedges;
  const warmPoints=heatSpec.warmPoints.map(w=>({...w,entityId:`${b(w.region)}.warm${w.id}`,flag:`b.warm.${w.id}`}));
  const actualCost=id=>-(runtime.entity(id)?.effects?.resources?.heat??0);
  const valves=heatSpec.valves.map(id=>({flag:id,entityId:id.replace('Closed',''),cost:actualCost(id.replace('Closed',''))}));
  const isPublic=(s,n)=>flag(s,`${b(n)}.originalCleared`)&&flag(s,`${b(n)}.originalWorksDone`)||flag(s,`${b(n)}.rootFixed`)&&flag(s,`${b(n)}.rootWorksDone`);
  const warmMask=s=>warmPoints.reduce((v,w,i)=>v|(flag(s,w.flag)?1<<i:0),0);
  function budget(state) {
    runtime.assertValidState(state);
    const reserve=valves.filter(v=>!flag(state,v.flag)).reduce((sum,v)=>sum+v.cost,0),frozen=flag(state,'b26.heatPlanFrozen');
    const current=state.resources.heat??0,available=Math.max(0,current-reserve),mask=warmMask(state);
    const points=warmPoints.map(w=>{
      const entity=runtime.entity(w.entityId),cost=actualCost(w.entityId),action={type:'interact',entityId:w.entityId,expectedRevision:state.revision};
      const preview=runtime.preview(state,action),invested=flag(state,w.flag),affordable=available>=cost;
      return {...w,cost,invested,affordable,action,preview,confirmationEnabled:preview.legal,canInvest:!frozen&&!invested&&affordable,
        blockedReason:invested?'已投入，不重复扣除':frozen?'已确认停机方案，暖点不再调整':!affordable?`须为未关支阀保留${reserve}份；可分配量还缺${cost-available}份`:preview.reason};
    });
    const combinations=[];
    for(let candidate=0;candidate<1<<points.length;candidate++){
      if((candidate&mask)!==mask)continue;
      const extra=points.reduce((sum,p,i)=>sum+((candidate&(1<<i))&&!(mask&(1<<i))?p.cost:0),0),feasible=!frozen?extra<=available:candidate===mask;
      if(feasible)combinations.push({mask:candidate,selected:points.filter((_,i)=>candidate&(1<<i)).map(p=>p.id),additionalCost:extra,remaining:frozen?(state.resources.publicHeat??0):available-extra});
    }
    return {kind:'authoritative-heat-budget',currentHeat:current,closedValves:valves.filter(v=>flag(state,v.flag)).length,
      requiredValveReserve:reserve,availableOptionalHeat:available,publicHeat:state.resources.publicHeat??0,frozen,mask,
      boxTotal:runtime.entity('b03.heatBox')?.effects?.resources?.heat??0,points,combinations,
      wedges:{remaining:state.resources.wedges??0,total:runtime.entity('b07.wedges')?.effects?.resources?.wedges??0,
        sites:wedgesSpec.sites.map(n=>({region:`B-${String(n).padStart(2,'0')}`,site:n,rootFixed:flag(state,`${b(n)}.rootFixed`),rootWorksDone:flag(state,`${b(n)}.rootWorksDone`),originalCleared:flag(state,`${b(n)}.originalCleared`),originalWorksDone:flag(state,`${b(n)}.originalWorksDone`),publicReady:isPublic(state,n)}))}};
  }
  function actionPanel(state,entityId) {
    const entity=runtime.entity(entityId);if(!entity)return null;
    const action={type:'interact',entityId,expectedRevision:state.revision},preview=runtime.preview(state,action),completed=clear(state,entityId);
    return {entityId,title:entity.title,kind:entity.kind,action,preview,completed,confirmationEnabled:preview.legal,
      cost:copy(entity.effects?.resources??{}),price:entity.price??null,effects:copy(entity.effects??{}),
      battle:entity.kind==='enemy'&&!completed?calculateBattle(state.stats,entity.enemy):null,
      once:entity.once!==false,reward:entity.kind==='enemy'&&!completed?(entity.enemy.gold??0):0};
  }
  function routePanel(sceneId,state) {
    const n=ROOT_SCENES[sceneId]??(['b07_rules','b07_revisit'].includes(sceneId)?7:null);if(!n)return null;
    return {kind:'authoritative-root-route-preview',...budget(state).wedges,
      fixedOnlyMeans:'仅人物可以通过；公共交通须另行完成真实施工',bypassesDoNotClearEnemies:true,oldEnemyPersists:!flag(state,`${b(n)}.originalCleared`),
      choices:['originalEnemy','fixRoot','originalWorks','rootWorks'].map(suffix=>actionPanel(state,`${b(n)}.${suffix}`))};
  }
  function checklist(state) {
    return {ring:spec.semantics.ringRequirements.map(condition=>({condition:copy(condition),met:runtime.meets(state,condition)})),
      shutdown:spec.semantics.readyRequirements.map(condition=>({condition:copy(condition),met:runtime.meets(state,condition)})),
      noUnrequestedRefill:true,noRealtimeWeather:spec.semantics.noRealtimeWeather,
      finalBattle:actionPanel(state,'b28.guardDrive'),confirmations:spec.regions.flatMap(r=>r.entities).filter(e=>e.id.startsWith('b26.confirmHeat.')&&runtime.meets(state,e.visibleWhen)).map(e=>actionPanel(state,e.id))};
  }
  function authoritativeBranch(id,state,options={}) {
    const budgetState=budget(state),requested=options.branch;
    if(options.reviewMode)return requested??'common';
    if(RESPONSES.has(id)){
      if(requested&&!C.scenes[id].choices.some(c=>c.id===requested))fail('Unknown presentation response');
      return requested??null;
    }
    if(id==='b07_revisit')return flag(state,'b07.rootFixed')?(flag(state,'b07.rootWorksDone')?'rootReady':'rootPending'):(state.resources.wedges>0?'rootAvailable':'rootUnavailable');
    if(WARM_SCENES[id]){
      const p=budgetState.points.find(p=>p.id===WARM_SCENES[id]);
      if(id.endsWith('_revisit'))return p.invested?'invested':id==='b19_revisit'?'uninvested':p.affordable&&!budgetState.frozen?'affordable':'unaffordable';
      if(requested==='invest'&&!p.invested)fail('Investment dialogue requires an authoritative warm-point transaction');
      if(requested==='defer'&&(p.invested||budgetState.frozen))fail('Cannot defer an already committed heat decision');
      return p.invested?'invest':requested==='defer'?'defer':null;
    }
    if(ROOT_SCENES[id]){
      const n=ROOT_SCENES[id],base=b(n);
      if(requested==='root'&&!flag(state,`${base}.rootFixed`))fail('Root dialogue requires authoritative rootFixed');
      if(requested==='originalPost'&&!flag(state,`${base}.originalWorksDone`))fail('Public road dialogue requires authoritative originalWorksDone');
      if(requested==='originalPre'&&flag(state,`${base}.originalCleared`))fail('Cannot narrate a future battle after this enemy was cleared');
      return requested??(flag(state,`${base}.originalWorksDone`)?'originalPost':flag(state,`${base}.rootFixed`)?'root':null);
    }
    if(id==='b26_review'){
      if(requested==='confirm'&&!budgetState.frozen)fail('Confirmation dialogue requires the reducer heat-plan transaction');
      if(requested==='return'&&budgetState.frozen)fail('Heat plan already frozen');
      return budgetState.frozen?'confirm':requested==='return'?'return':null;
    }
    return requested??'common';
  }
  const SCENE_FACTS={
    b01_post:s=>flag(s,'b01.basicEntrance'), b02_enter:s=>flag(s,'b02.winterPlanKnown'),b02_choice:s=>flag(s,'b02.winterPlanKnown'),
    b03_rules:s=>flag(s,'b03.heatBoxOwned'),b03_exit:s=>flag(s,'b03.routeBriefKnown'),b04_enter:s=>flag(s,'b04.housingReady'),b04_exit:s=>flag(s,'b04.housingReady'),
    b05_valve:s=>flag(s,'b05.valveClosed'),b05_revisit:s=>flag(s,'b05.waterInsulated'),b06_post:s=>flag(s,'b06.freightCleared'),
    b07_rules:s=>flag(s,'b07.wedgesOwned'),b07_stone_post:s=>flag(s,'b07.originalWorksDone'),b08_night:s=>flag(s,'b08.morningWoodKept'),
    b09_post:s=>flag(s,'b09.realBridgeBuilt'),b10_enter:s=>flag(s,'b10.supportsInstalled'),b10_valve:s=>flag(s,'b10.valveClosed'),b10_exit:s=>flag(s,'b10.valveClosed'),
    b11_post:s=>flag(s,'b11.roadRepaired'),b13_enter:s=>flag(s,'b13.freightPlanned'),b13_depart:s=>flag(s,'b13.freightPlanned'),
    b14_enter:s=>flag(s,'b14.residentLodgingAgreed'),b14_after:s=>flag(s,'b14.residentLodgingAgreed'),b14_greenhouse:s=>flag(s,'b14.shawuLearningAgreed'),
    b15_post:s=>flag(s,'b15.winterSuppliesDelivered')&&flag(s,'b14.shawuLearningAgreed'),b15_exit:s=>flag(s,'b15.winterSuppliesDelivered'),
    b16_exit:s=>isPublic(s,16),b19_enter:s=>flag(s,'b19.ordinaryLodgeReady'),b20_enter:s=>flag(s,'b20.supportsInstalled'),b20_valve:s=>flag(s,'b20.valveClosed')&&flag(s,'b14.shawuLearningAgreed'),b20_exit:s=>flag(s,'b20.valveClosed'),
    b22_enter:s=>flag(s,'b22.dutiesShared')&&flag(s,'b22.upperRoadChecked'),b22_after:s=>flag(s,'b22.dutiesShared'),
    b23_enter:s=>flag(s,'b23.ringOpen'),b23_home:s=>flag(s,'b23.ringOpen'),b23_shawu_reply:s=>flag(s,'b23.ringOpen'),
    b24_warning:s=>flag(s,'b24.shutdownSequenceKnown'),b25_valve:s=>flag(s,'b25.valveClosed'),b25_noctia:s=>flag(s,'b25.gravityWaterTested'),b25_exit:s=>flag(s,'b25.gravityWaterTested'),
    b26_enter:s=>flag(s,'b26.supperDone'),b26_shawu:s=>flag(s,'b26.drawerPacked'),b26_review:s=>flag(s,'b26.drawerPacked')&&flag(s,'b26.shutdownReady'),b26_noctia:s=>flag(s,'b26.keyHandedOver'),
    b27_enter:s=>flag(s,'b26.keyHandedOver')&&flag(s,'b24.handrailInstalled'),b27_before:s=>flag(s,'b26.keyHandedOver'),b28_pre:s=>flag(s,'b28.serviceLeverSet'),b28_post:s=>clear(s,'b28.guardDrive'),
    b29_enter:s=>flag(s,'b28.mainValveStopped'),b29_home:s=>flag(s,'b29.noctiaHome'),b29_shawu:s=>flag(s,'b29.noctiaHome'),b30_enter:s=>flag(s,'b29.noctiaHome'),
    b30_relationship_offer:s=>flag(s,'b29.noctiaHome')&&flag(s,'b14.shawuLearningAgreed')&&flag(s,'b22.dutiesShared'),
    b30_end_together:s=>s.flags['b30.ending']==='together',b30_end_two_ends:s=>s.flags['b30.ending']==='patrol'
  };
  function turnAvailable(sceneId,t,state,branch,options) {
    if(options.reviewMode)return true;
    if(sceneId==='b12_choice'&&!branch&&t.sourceLine>=717)return false;
    if(sceneId==='b05_valve'&&t.phase==='pipeWorks')return flag(state,'b05.waterInsulated');
    if(sceneId==='b25_valve'&&t.phase==='waterTest')return flag(state,'b25.gravityWaterTested');
    if(sceneId==='b27_enter'&&t.phase==='packed')return flag(state,'b27.personalThingsPacked');
    if(sceneId==='b28_post'&&t.phase==='stopped')return flag(state,'b28.mainValveStopped');
    if(ROOT_SCENES[sceneId]&&t.branch==='root'&&t.phase==='works')return flag(state,`${b(ROOT_SCENES[sceneId])}.rootWorksDone`);
    if(sceneId==='b24_route'&&t.phase==='retrieved')return flag(state,'b24.handrailRetrieved');
    return true;
  }
  function resolve(id,state,options={}) {
    runtime.assertValidState(state);
    const [sceneId,...fragment]=id.split('.'),source=C.scenes[sceneId];if(!source)fail(`Unknown B scene ${id}`);
    if(fragment.length)options={...options,branch:fragment[0],...(fragment[1]?{phase:fragment[1]}:{})};
    if(!options.reviewMode){
      if(SCENE_FACTS[sceneId]&&!SCENE_FACTS[sceneId](state))fail(`Scene ${sceneId} requires authoritative gameplay facts`);
      if(PRE_ENEMIES[sceneId]&&clear(state,PRE_ENEMIES[sceneId]))fail('Pre-battle scene cannot revive a cleared enemy');
      if(sceneId.startsWith('b30_heat_')){
        if(!flag(state,'b29.noctiaHome')||!flag(state,'b26.heatPlanFrozen'))fail('Heat epilogue requires the actual frozen plan and homecoming');
        if(sceneId!==(HEAT_ENDS[warmMask(state)]??'b30_heat_partial'))fail('Heat epilogue contradicts the actual warm-point combination');
      }
    }
    const branch=authoritativeBranch(sceneId,state,options),bud=budget(state);
    let modules=null;
    if(sceneId==='b30_heat_partial')modules=options.reviewMode&&options.modules?options.modules:bud.points.map(p=>p.id+(p.invested?'On':'Off')).concat(bud.publicHeat>0?'reserve':[]);
    const selected=source.turns.filter(t=>(modules?modules.includes(t.branch):(t.branch==='common'||t.branch===branch||options.reviewMode&&options.allBranches))&&(!options.phase||t.phase===options.phase)&&turnAvailable(sceneId,t,state,branch,options));
    const turns=selected.map(turn=>{
      let text=turn.text.replace('{{feiyeWinterWorkplace}}',flag(state,'b.warm.greenhouse')?'温室':'普通苗圃'),boundaryAdaptation=null;
      // Both paths may genuinely be completed. Remove only claims that the
      // already-cleared original machine remains active; no refunds or rewards.
      const n=ROOT_SCENES[sceneId];
      if(n&&turn.branch==='root'&&flag(state,`${b(n)}.originalCleared`)){
        const changed={421:'这边铺好以后，行李和分批的小车从下边走。上面的旧路也要认准施工记录。',423:'拦绳留着。旧口的施工另记，别走错。',965:'旧口的标记别拆。那边的施工也要查清。',1301:'以后往返走下面。上段旧口的施工另记，先留着拦绳。',1485:'侧口转得开。正门另按验收过的线路走，别为了少走两步钻进去。'}[turn.sourceLine];
        if(changed){boundaryAdaptation={id:'B-EDGE-001',original:text,reason:'Original enemy already cleared in authoritative state'};text=changed;}
      }
      if(sceneId==='b19_revisit'&&turn.branch==='uninvested'&&bud.frozen){boundaryAdaptation={id:'B-EDGE-002',original:text,reason:'Final heat allocation is sealed; the lodge cannot solicit a new investment'};text='门不响了，日间班次也排好。暖槽按已经确认的普通方案留空，柴炉照常用。';}
      const stage=forestTurnStage(sceneId,turn,state);
      return {...copy(turn),text,...(boundaryAdaptation?{boundaryAdaptation}:{}),stage,...(!stage.portraitAllowed?{portrait:null,voicePortrait:turn.portrait}:{}),presentationOnly:true};
    });
    let choices=[];
    if(!options.phase&&!branch||branch==='common')choices=copy(source.choices);
    if(RESPONSES.has(sceneId))choices=branch?[]:copy(source.choices).map(c=>({...c,presentationOnly:true}));
    if(WARM_SCENES[sceneId]&&sceneId.endsWith('_offer')&&!branch){const p=bud.points.find(p=>p.id===WARM_SCENES[sceneId]);choices=source.choices.map(c=>({...copy(c),presentationOnly:c.id==='defer',...(c.id==='invest'?{action:p.action,preview:p.preview,confirmationEnabled:p.confirmationEnabled,canInvest:p.canInvest,blockedReason:p.blockedReason}:{})}));}
    if(bud.frozen&&WARM_SCENES[sceneId])choices=[];
    if(sceneId==='b07_choice'&&!branch)choices=source.choices.map(c=>({...copy(c),presentationOnly:false,...actionPanel(state,c.id==='root'?'b07.fixRoot':'b07.originalEnemy')}));
    if(sceneId==='b26_review'&&!branch)choices=source.choices.map(c=>({...copy(c),presentationOnly:c.id==='return',...(c.id==='confirm'?{actions:checklist(state).confirmations}:{})}));
    if(sceneId==='b30_relationship_offer')choices=source.choices.map(c=>({...copy(c),presentationOnly:false,...actionPanel(state,c.id==='together'?'b30.together':'b30.patrol')}));
    if(turns.length&&choices.length)turns.at(-1).choices=copy(choices);
    return {id,sceneId,title:source.title,turns,choices,source:copy(source.source),branch,phase:options.phase??null,presentationOnly:true,
      allowLegacyBackdropFallback:false,backdropAssetId:source.backdropAssetId,reviewMode:options.reviewMode===true,
      budget:['b03_rules','b07_rules','b17_offer','b18_offer','b19_offer','b26_review'].includes(sceneId)?bud:null,
      stateNotice:sceneId==='b07_revisit'&&branch==='rootPending'?'侧根已固定，仅人物可以通过；公共铺板补栏尚未完成':null,
      routePanel:routePanel(sceneId,state),battlePanel:PRE_ENEMIES[sceneId]?actionPanel(state,PRE_ENEMIES[sceneId]):['b24_warning','b27_before'].includes(sceneId)?actionPanel(state,'b28.guardDrive'):null,
      shopPanel:sceneId==='b13_shop'?spec.regions.flatMap(r=>r.entities).filter(e=>e.kind==='shop').map(e=>actionPanel(state,e.id)):null,
      checklist:sceneId==='b26_review'?checklist(state):null,stateHash:runtime.stateHash(state)};
  }
  function builder(state,seenIds=[],options={}) {
    const seen=new Set(seenIds),scenes=[],conflicts=[];
    function add(id,at=state,extra={}) {
      try{
        const sc=resolve(id,at,{...options,...extra}),key=[id,sc.branch??'',sc.phase??''].join('|');
        sc.turns=sc.turns.filter(t=>!seen.has(t.id));
        const newChoice=sc.choices.length&&!seen.has(key);if(!sc.turns.length&&!newChoice)return;
        sc.turns.forEach(t=>seen.add(t.id));seen.add(key);scenes.push(sc);
      }catch(e){conflicts.push({sceneId:id,reason:e.message});}
    }
    return {add,finish:()=>({scenes,seenIds:[...seen],narrativeConflicts:conflicts})};
  }
  /** Location/restored-save catch-up observes facts; it never completes work. */
  function location(state,{seenIds=[],...options}={}) {
    runtime.assertValidState(state);const out=builder(state,seenIds,options),n=Number(state.location.regionId.slice(2));
    const maybe=(id,condition=true,extra={})=>{if(condition)out.add(id,state,extra);};
    switch(n){
      case 1:maybe('b01_enter',!flag(state,'b01.basicEntrance'));maybe('b01_pre',!clear(state,'b01.timberPuppet'));break;
      case 2:maybe('b02_enter',flag(state,'b02.winterPlanKnown'));maybe('b02_choice',flag(state,'b02.winterPlanKnown'));break;
      case 3:
        maybe('b03_enter',!flag(state,'b03.heatBoxOwned'));maybe('b03_rules',flag(state,'b03.heatBoxOwned')&&!flag(state,'b25.gravityWaterTested'));maybe('b03_exit',flag(state,'b03.routeBriefKnown')&&!flag(state,'b25.gravityWaterTested'));
        maybe('b25_noctia',flag(state,'b25.gravityWaterTested')&&!flag(state,'b26.keyHandedOver'));maybe('b25_exit',flag(state,'b25.gravityWaterTested')&&!flag(state,'b26.keyHandedOver'));
        maybe('b26_review',flag(state,'b26.drawerPacked'));maybe('b26_noctia',flag(state,'b26.keyHandedOver'));break;
      case 4:maybe('b04_enter',flag(state,'b04.housingReady'));break;
      case 5:maybe('b05_pre',!clear(state,'b05.sluicePuppet'));break;
      case 6:maybe('b06_enter',!clear(state,'b06.sawPuppet'));maybe('b06_pre',!clear(state,'b06.sawPuppet'));break;
      case 7:maybe('b07_enter',!flag(state,'b07.wedgesOwned'));maybe('b07_choice',flag(state,'b07.wedgesOwned'));break;
      case 8:maybe('b08_enter');break;
      case 9:maybe('b09_enter',!flag(state,'b09.realBridgeBuilt'));maybe('b09_pre',!clear(state,'b09.foundationRig'));break;
      case 10:maybe('b10_enter',flag(state,'b10.supportsInstalled'));break;
      case 11:maybe('b11_enter',!clear(state,'b11.returnPuppet'));maybe('b11_pre',!clear(state,'b11.returnPuppet'));break;
      case 12:maybe('b12_enter');maybe('b12_choice');break;
      case 13:maybe('b13_enter',flag(state,'b13.freightPlanned'));break;
      case 14:maybe('b14_enter',flag(state,'b14.residentLodgingAgreed'));maybe('b14_after',flag(state,'b14.residentLodgingAgreed'));maybe('b14_greenhouse',flag(state,'b14.shawuLearningAgreed'));break;
      case 15:maybe('b15_enter',!clear(state,'b15.cablePuppet'));maybe('b15_pre',!clear(state,'b15.cablePuppet'));break;
      case 16:maybe('b16_enter',!flag(state,'b16.rootFixed')&&!flag(state,'b16.originalCleared'));maybe('b16_route');break;
      case 17:maybe('b17_enter');maybe('b17_offer');break;
      case 18:maybe('b18_enter',!flag(state,'b.warm.pear'));maybe('b18_offer');break;
      case 19:maybe('b19_enter',flag(state,'b19.ordinaryLodgeReady'));maybe('b19_offer',flag(state,'b19.ordinaryLodgeReady'));break;
      case 20:maybe('b20_enter',flag(state,'b20.supportsInstalled'));break;
      case 21:maybe('b21_enter',!flag(state,'b21.rootFixed')&&!flag(state,'b21.originalCleared'));maybe('b21_route');break;
      case 22:maybe('b22_enter',flag(state,'b22.dutiesShared'));maybe('b22_after',flag(state,'b22.dutiesShared'));break;
      case 23:maybe('b23_enter',flag(state,'b23.ringOpen'));maybe('b23_home',flag(state,'b23.ringOpen'));maybe('b23_shawu_reply',flag(state,'b23.ringOpen'));break;
      case 24:maybe('b24_enter',!flag(state,'b24.rootFixed')&&!flag(state,'b24.originalCleared'));maybe('b24_route');break;
      case 25:maybe('b25_enter',!flag(state,'b25.valveClosed'));break;
      case 26:maybe('b26_enter',flag(state,'b26.supperDone'));maybe('b26_shawu',flag(state,'b26.drawerPacked'));break;
      case 27:maybe('b27_enter',flag(state,'b26.keyHandedOver'));break;
      case 28:maybe('b27_before',!flag(state,'b28.serviceLeverSet'));break;
      case 29:maybe('b29_enter',flag(state,'b28.mainValveStopped'));maybe('b29_home',flag(state,'b29.noctiaHome'));maybe('b29_shawu',flag(state,'b29.noctiaHome'));break;
      case 30:if(flag(state,'b29.noctiaHome')){maybe('b30_enter');maybe(HEAT_ENDS[warmMask(state)]??'b30_heat_partial');maybe('b30_relationship_offer');}break;
    }
    return out.finish();
  }
  /** Match exact reducer replay, including events. Nothing from a failed,
   * forged, stale or reordered transaction can unlock narration. */
  function fromDispatch({stateBefore,stateAfter,events,receipt,seenIds=[],...options}) {
    runtime.assertValidState(stateBefore);runtime.assertValidState(stateAfter);
    const deny=reason=>({scenes:[],seenIds:[...seenIds],narrativeConflicts:[{reason}]});
    if(!receipt||receipt.before!==runtime.stateHash(stateBefore)||receipt.after!==runtime.stateHash(stateAfter))return deny('Missing or mismatched authoritative dispatch receipt');
    const proof=runtime.dispatch(stateBefore,receipt.action);
    if(!proof.ok||runtime.stateHash(proof.state)!==receipt.after||JSON.stringify(proof.events)!==JSON.stringify(events))return deny('Dispatch events do not match the reducer receipt');
    const out=builder(stateAfter,seenIds,options);
    const entityScenes={
      'b01.timberPuppet':['b01_post'],'b02.winterPlan':['b02_enter','b02_choice'],'b03.heatBox':['b03_rules'],'b03.routeBrief':['b03_exit'],'b04.housing':['b04_enter'],
      'b05.valve':['b05_valve'],'b05.pipeWorks':['b05_valve'],'b06.freightWorks':['b06_post'],'b07.wedges':['b07_rules'],
      'b08.firewood':['b08_night'],'b09.bridgeWorks':['b09_post'],'b10.supportWorks':['b10_enter'],'b10.valve':['b10_valve'],
      'b11.roadWorks':['b11_post'],'b12.overlook':['b12_enter','b12_choice'],'b13.freightManifest':['b13_enter','b13_depart'],
      'b13.coatShop':['b13_shop'],'b13.edgeShop':['b13_shop'],'b13.bandageShop':['b13_shop'],
      'b14.lodging':['b14_enter','b14_after'],'b14.learningPlan':['b14_greenhouse'],'b15.deliverWinter':['b15_post'],
      'b17.inspectSeeds':['b17_enter'],'b18.oldSeat':['b18_private'],'b19.lodgeWorks':['b19_enter'],'b20.supportWorks':['b20_enter'],'b20.valve':['b20_valve'],
      'b22.shareDuties':['b22_enter','b22_after'],'b23.acceptRing':['b23_enter','b23_home','b23_shawu_reply'],'b24.shutdownDiagram':['b24_warning'],
      'b25.valve':['b25_valve'],'b25.waterTest':['b25_valve'],'b26.supper':['b26_enter'],'b26.drawer':['b26_shawu'],
      'b27.packPersonalThings':['b27_enter'],'b28.serviceLever':['b28_pre'],'b28.guardDrive':['b28_post'],'b28.stopMainValve':['b28_post'],
      'b29.homecoming':['b29_home','b29_shawu'],'b30.together':['b30_end_together'],'b30.patrol':['b30_end_two_ends']
    };
    for(const event of events){
      const id=event.entityId;
      // Intro/previews are resolved at the actual pre-action state, then the
      // committed effect is resolved at the actual post-action state.
      const previous=Object.entries(PRE_ENEMIES).find(([,enemy])=>enemy===id)?.[0];if(previous)out.add(previous,stateBefore);
      for(const sid of entityScenes[id]??[])out.add(sid);
      for(const p of warmPoints)if(id===p.entityId)out.add(`${b(p.region)}_offer`,stateAfter,{branch:'invest'});
      for(const n of wedgesSpec.sites){const base=b(n),sid=n===7?'b07_choice':`${base}_route`;
        if(id===`${base}.fixRoot`)out.add(sid,stateAfter,{branch:'root',phase:'fixed'});
        if(id===`${base}.rootWorks`&&n!==24)out.add(sid,stateAfter,{branch:'root',phase:'works'});
        if(id===`${base}.originalEnemy`&&[7,21,24].includes(n))out.add(sid,stateBefore,{branch:'originalPre'});
        if(id===`${base}.originalWorks`&&n!==24)out.add(n===7?'b07_stone_post':sid,stateAfter,{branch:'originalPost'});
      }
      if(id==='b24.retrieveHandrail')out.add('b24_route',stateAfter,{branch:flag(stateAfter,'b24.originalWorksDone')?'originalPost':'root'});
      if(id?.startsWith('b26.confirmHeat.')){out.add('b26_review',stateAfter,{branch:'confirm'});out.add('b26_noctia');}
      if(event.type==='traverse'){
        const exits={'b.edge.04-05':'b04_exit','b.edge.10-11':'b10_exit','b.edge.15-16':'b15_exit','b.edge.16-17':'b16_exit','b.edge.20-21':'b20_exit','b.edge.21-22':'b21_exit'};
        const sid=exits[event.edgeId];if(sid&&(!SCENE_FACTS[sid]||SCENE_FACTS[sid](stateBefore)))out.add(sid,stateBefore);
      }
    }
    const first=out.finish(),local=location(stateAfter,{seenIds:first.seenIds,...options});
    return {scenes:[...first.scenes,...local.scenes],seenIds:local.seenIds,narrativeConflicts:[...first.narrativeConflicts,...local.narrativeConflicts]};
  }
  function revisit(sceneId,state,options={}) {
    if(!['b05_revisit','b07_revisit','b17_revisit','b18_revisit','b19_revisit'].includes(sceneId))fail('Unknown B revisit');
    return resolve(sceneId,state,options);
  }
  function response(sceneId,choice,state,options={}) {
    if(!RESPONSES.has(sceneId)&&!['b17_offer','b18_offer','b19_offer','b26_review'].includes(sceneId))fail('This scene requires a gameplay transaction');
    if(!RESPONSES.has(sceneId)&&!['defer','return'].includes(choice))fail('This choice requires a gameplay transaction');
    return resolve(sceneId,state,{...options,branch:choice});
  }
  function epilogue(state,{seenIds=[],...options}={}) {
    if(!flag(state,'b29.noctiaHome'))fail('Epilogue requires authoritative homecoming');
    const out=builder(state,seenIds,options);out.add('b30_enter');out.add(HEAT_ENDS[warmMask(state)]??'b30_heat_partial');out.add('b30_relationship_offer');
    const ending=state.flags['b30.ending'];if(ending)out.add(ending==='together'?'b30_end_together':'b30_end_two_ends');return out.finish();
  }
  return Object.freeze({resolve,fromDispatch,location,revisit,response,epilogue,budget,routePanel,actionPanel,checklist});
}
