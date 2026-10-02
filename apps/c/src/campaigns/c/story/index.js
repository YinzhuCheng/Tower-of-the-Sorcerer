import { VOYAGE_STORY_CONTENT } from './content.js';
import { voyageTurnStage, VOYAGE_ASSET_POLICY, VOYAGE_CAST } from './presentation.js';
import { calculateBattle } from '../../../core/battle.js';

export { VOYAGE_STORY_CONTENT, VOYAGE_ASSET_POLICY, VOYAGE_CAST };
export const VOYAGE_STORY_IDS = Object.freeze([...VOYAGE_STORY_CONTENT.order]);
const copy=value=>structuredClone(value);
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}
freeze(VOYAGE_STORY_CONTENT);
const has=(state,id)=>state.cleared.includes(id);
const flag=(state,id)=>state.flags[id];
const error=message=>{throw new Error(message);};
const routeKey=sceneId=>sceneId==='c06'?'c.route1':sceneId==='c09'?'c.route2':null;
const numeric=value=>Number.isSafeInteger(value)&&value>=0;
const numText=value=>value===2?'两':String(value);

/** Instantiate with the SAME runtime that owns dispatch; no singleton state,
 * no flags, resources, relation points or animation callbacks live here. */
export function createVoyageStory(runtime) {
  if(runtime.spec.id!=='voyage-c') error('C story requires the voyage-c runtime');
  const spec=runtime.spec;
  const transitions=new Map(spec.transitions.map(edge=>[edge.id,edge]));
  const supply=runtime.entity('c.supplies');
  const supplyFuel=supply?.effects?.resources?.fuel??0;
  if(!numeric(supplyFuel)) error('C supply fuel must be a finite nonnegative integer');

  function budget(state) {
    runtime.assertValidState(state);
    const departures=spec.transitions.filter(edge=>edge.departure);
    const memo=new Map();
    function minimumFrom(dock,visiting=new Set()) {
      if(dock==='C-M05')return 0;
      if(memo.has(dock))return memo.get(dock);
      if(visiting.has(dock))error('C fuel graph must be acyclic');
      const next=new Set(visiting);next.add(dock);
      const costs=departures.filter(edge=>edge.departure.from===dock).map(edge=>(edge.cost?.fuel??0)+minimumFrom(edge.departure.to,next));
      const value=costs.length?Math.min(...costs):null;
      if(value===null)error(`No authored fuel route from ${dock}`);
      memo.set(dock,value);return value;
    }
    const dock=state.boat.dock;
    const uncollectedAtReachableDock=(!has(state,'c.supplies')&&['C-M01','C-M02'].includes(dock))?supplyFuel:0;
    const remainingMinimum=minimumFrom(dock);
    return {currentFuel:state.resources.fuel,initialFuel:spec.initial.resources.fuel,
      fixedSupply:supplyFuel,uncollectedSupply:uncollectedAtReachableDock,
      totalAvailableAtStart:spec.initial.resources.fuel+supplyFuel,minimumWholeVoyage:minimumFrom('C-M01'),
      remainingMinimum,reserveAfterMinimum:state.resources.fuel+uncollectedAtReachableDock-remainingMinimum,
      destination:'C-M05',returnMethod:'次晨修港拖轮先清通装卸支道，再接空船',
      routes:departures.map(edge=>{
        const cost=edge.cost?.fuel??0,afterMinimum=minimumFrom(edge.departure.to);
        const current=edge.departure.from===dock;
        const affordable=state.resources.fuel>=cost;
        const futureSupply=(!has(state,'c.supplies')&&edge.departure.to==='C-M02')?supplyFuel:0;
        const canRetainKnownMinimum=state.resources.fuel-cost+futureSupply>=afterMinimum;
        const requirementsMet=runtime.meets(state,edge.requires);
        const action={type:'traverse',edgeId:edge.id,expectedRevision:state.revision};
        const preview=current?runtime.preview(state,action):null;
        return {id:edge.id,from:edge.departure.from,to:edge.departure.to,cost,afterMinimum,futureSupply,current,
          affordable,canRetainKnownMinimum,requirementsMet,
          confirmationEnabled:current&&preview?.legal===true&&canRetainKnownMinimum,
          blockedReason:!current?'船不在该泊位':!affordable?`船油不足，缺${cost-state.resources.fuel}份`:!canRetainKnownMinimum?`后续最短航段还需${afterMinimum}份，缺${afterMinimum-(state.resources.fuel-cost+futureSupply)}份`:preview?.reason??null,
          action,preview};
      })};
  }
  function routePanel(sceneId,state) {
    const b=budget(state),n=sceneId==='c06'?1:2;
    const ids=n===1?['c.sail23.short','c.sail23.bypass']:['c.sail34.short','c.sail34.bypass'];
    const enemyId=`c.machine${n}`,enemy=runtime.entity(enemyId);
    const battle=has(state,enemyId)?null:calculateBattle(state.stats,enemy.enemy);
    return {kind:'authoritative-route-preview',...b,choices:ids.map(id=>{
      const route=b.routes.find(r=>r.id===id);
      return {...route,label:id.endsWith('.short')?'停下检修车，走短道':'走外绕支道',
        enemyId,enemyAlreadyCleared:has(state,enemyId),battle:id.endsWith('.short')?battle:null,
        omittedBattleReward:id.endsWith('.bypass')&&!has(state,enemyId)?enemy.enemy.gold??0:0};
    })};
  }
  function ballastPanel(state) {
    const {weights,slots,cargoTorques}=spec.ballast;
    const torque=Object.entries(weights).reduce((sum,[id,mass])=>sum+mass*slots[state.boat.positions[id]],cargoTorques[state.boat.cargo]);
    return {cargo:state.boat.cargo,positions:copy(state.boat.positions),weights:copy(weights),slots:copy(slots),torque,balanced:runtime.balanced(state),
      heavierSide:torque===0?'balanced':torque<0?'left':'right',
      acceptsAllBalancedLayouts:true,charactersHaveNoMass:true,
      note:'示例不是唯一摆法。左右总力矩相抵即可；系泊时可以免费撤回与重排。'};
  }
  function branchFor(sceneId,state,options) {
    if(sceneId==='c04')return options.response??null;
    if(sceneId==='c19')return options.epilogue??null;
    const key=routeKey(sceneId);if(!key)return null;
    const selected=options[sceneId==='c06'?'route1':'route2'];
    if(selected&&!options.reviewMode&&selected!==state.flags[key])error('Route dialogue requires an authoritative route flag');
    return options.reviewMode?(selected??state.flags[key]??null):(state.flags[key]??null);
  }
  function resolve(id,state,options={}) {
    runtime.assertValidState(state);
    const sceneId=id.split('.')[0],source=VOYAGE_STORY_CONTENT.scenes[sceneId];
    if(!source)error(`Unknown C story scene ${id}`);
    if(['c19','c20'].includes(sceneId)&&!state.victory&&!options.reviewMode)error('The epilogue requires authoritative mainline victory');
    let branch=branchFor(sceneId,state,options),filter=source.fragments[id]??null;
    if(id!==sceneId&&!filter)error(`Unknown C story fragment ${id}`);
    if(id===`${sceneId}.short`||id===`${sceneId}.bypass`)branch=id.split('.')[1];
    if(id.startsWith('c09.short.'))branch='short';
    if(id==='c19.lampRoom'||id==='c19.bow')branch=id.split('.')[1];
    if(routeKey(sceneId)&&branch&&!options.reviewMode&&branch!==state.flags[routeKey(sceneId)]&&!options.committedBattle)
      error('A route fragment cannot approve or select a gameplay route');
    const extraClearingBypass=!options.reviewMode&&branch==='bypass'&&has(state,sceneId==='c06'?'c.machine1':'c.machine2');
    const selected=source.turns.filter(turn=>(!filter||filter.includes(turn.id))&&(turn.branch==='common'||turn.branch===branch));
    const presentationState=options.presentationState??state;
    runtime.assertValidState(presentationState);
    const turns=selected.map(turn=>{
      const {branch:_branch,textTemplate,...rest}=turn;
      let text=textTemplate?textTemplate.replaceAll('{{supplyFuel}}',numText(supplyFuel)):turn.text;
      // Camera/map labels are metadata, not words the narrator says. Expand the
      // one stand-alone arrival label to its frozen location title and remove
      // payment bookkeeping from the source's mixed scene direction.
      if(turn.kind==='narration') {
        text=text.replace(/^C-[MD]0\d(?:[→／]C-[MD]0\d)?。/,'').replace(/^航线选择前。/,'');
        text=text.replace('抵达C-M02，','').replace('抵达C-M04。','抵达近灯背面泊位。');
        text=text.replace('船仍在M03安全泊位，尚未支付下一航段。','船仍在安全泊位。');
      }
      let boundaryAdaptation=null;
      if(extraClearingBypass&&[349,495].includes(turn.sourceLine)){
        boundaryAdaptation={id:'C-EDGE-001',original:text,reason:'The authoritative record includes clearing this machine before bypassing'};
        text='这台已经停下了，仍按选定外绕航线走。';
      }
      if(extraClearingBypass&&turn.sourceLine===509){
        boundaryAdaptation={id:'C-EDGE-001',original:text,reason:'Do not claim avoidance of already incurred battle damage'};
        text='我能开外面那条。';
      }
      return {...copy(rest),text,...(boundaryAdaptation?{boundaryAdaptation}:{}),stage:voyageTurnStage(sceneId,turn,presentationState,options)};
    });
    const choices=[];
    if(sceneId==='c04'&&!branch&&!filter) {
      for(const choiceId of ['roles','disembark']) {
        const line=source.turns.find(turn=>turn.branch===choiceId);
        choices.push({id:choiceId,sourceTurnId:line.id,sourceLine:line.sourceLine,label:line.text,response:`璃：${line.text}`,presentationOnly:true});
      }
      // Keep choices at their authored position, before arriving at the old dock.
      const index=turns.findIndex(turn=>turn.sourceLine===273);
      const anchor=turns[Math.max(0,index-1)]; if(anchor)anchor.choices=copy(choices);
    }
    if(sceneId==='c19'&&!branch) {
      choices.push({id:'lampRoom',label:'留在灯室',sceneId:'c19.lampRoom',presentationOnly:true},
        {id:'bow',label:'去船头坐一会儿',sceneId:'c19.bow',presentationOnly:true});
      if(turns.length)turns.at(-1).choices=copy(choices);
    }
    return {id,sceneId,title:source.title,turns,choices,source:copy(source.source),
      boundaryNotice:extraClearingBypass?'此处敌机已经清除；绕行仍按实际成本耗油，既有战斗损伤不会退回。':null,
      presentationOnly:true,allowLegacyBackdropFallback:false,backdropAssetId:source.backdropAssetId,
      budget:['c01','c03','c06','c09','c14'].includes(sceneId)?budget(presentationState):null,
      routePanel:['c06','c09'].includes(sceneId)?routePanel(sceneId,presentationState):null,
      ballastPanel:['c03','c08','c16'].includes(sceneId)?ballastPanel(presentationState):null,
      presentationStateHash:runtime.stateHash(presentationState),
      reviewMode:options.reviewMode===true};
  }

  function resultBuilder(state,seenIds=[],options={}) {
    const seen=new Set(seenIds),scenes=[],conflicts=[];
    function add(id,atState=state,extra={}) {
      if(seen.has(id))return;
      try {
        const scene=resolve(id,atState,{...options,...extra});
        // Deduplicate individual authored turns even when a full scene was read.
        scene.turns=scene.turns.filter(turn=>!seen.has(turn.id));
        seen.add(id);scene.turns.forEach(turn=>seen.add(turn.id));
        if(scene.turns.length)scenes.push(scene);
      }catch(e){conflicts.push({sceneId:id,reason:e.message});}
    }
    return {add,finish:()=>({scenes,seenIds:[...seen],narrativeConflicts:conflicts})};
  }
  /** Optional read-only location prompts. Run after a dispatch or restored save.
   * State flags are observed, never inferred or written by reading a scene. */
  function location(state,{seenIds=[],...options}={}) {
    runtime.assertValidState(state);
    const out=resultBuilder(state,seenIds,options),dock=state.boat.dock;
    if(dock==='C-M01'&&state.location.regionId==='C-D01'&&flag(state,'c.crewReady')) {
      out.add('c03.intro');if(runtime.balanced(state))out.add('c03.ready');
    }
    if(dock==='C-M02'&&state.boat.moored){out.add('c05.arrival');if(flag(state,'c.bolts')){out.add('c05.supplies');out.add('c06.common');}}
    if(dock==='C-M03'&&flag(state,'c.barrierOpen'))out.add('c09.common');
    if(dock==='C-M04'&&state.boat.moored)out.add('c12');
    return out.finish();
  }
  /** Verify the caller's receipt against the reducer before showing committed
   * actions. Replay is pure and never writes a save. A forged/failed/stale result
   * cannot unlock a scene or pay a resource. Store only returned seenIds in a
   * presentation sidecar scoped by runtime.identity, separate from game state. */
  function fromDispatch({stateBefore,stateAfter,events,receipt,seenIds=[],...options}) {
    runtime.assertValidState(stateBefore);runtime.assertValidState(stateAfter);
    if(!receipt||receipt.before!==runtime.stateHash(stateBefore)||receipt.after!==runtime.stateHash(stateAfter))
      return {scenes:[],seenIds:[...seenIds],narrativeConflicts:[{reason:'Missing or mismatched authoritative dispatch receipt'}]};
    const proof=runtime.dispatch(stateBefore,receipt.action);
    if(!proof.ok||runtime.stateHash(proof.state)!==receipt.after||JSON.stringify(proof.events)!==JSON.stringify(events))
      return {scenes:[],seenIds:[...seenIds],narrativeConflicts:[{reason:'Dispatch events do not match the reducer receipt'}]};
    const out=resultBuilder(stateAfter,seenIds,options);
    for(const event of events) {
      switch(event.entityId) {
        case 'c.manifest':out.add('c01');break;
        case 'c.departureBrief':out.add('c02');break;
        case 'c.supplies':out.add('c05.arrival',stateBefore);out.add('c05.supplies');out.add('c06.common');break;
        case 'c.shoreLock':out.add('c08.shoreLock');break;
        case 'c.shiftLeft':out.add('c08.shiftLeft');break;
        case 'c.openBarrier':out.add('c08.openBarrier');out.add('c09.common');break;
        case 'c.handover':out.add('c12',stateBefore);out.add('c13.nearLamp');out.add('c13.handover');break;
        case 'c.moor2':out.add('c05.arrival');break;
        case 'c.moor3':out.add('c07');break;
        case 'c.moor4':out.add('c12');break;
        case 'c.moor5':out.add('c15.approach');out.add('c15.moored');break;
        case 'c.shiftRight':out.add('c16.shiftRight');break;
        case 'c.unload':out.add('c16.unload');break;
        case 'c.stow':out.add('c16.stow');break;
        case 'c.rollCargo':out.add('c16.rollCargo');break;
        case 'c.installLamp':out.add('c17');break;
        case 'c.signal':out.add('c18');out.add('c19.common');break;
      }
      if(event.type==='departure') {
        // Show committed route decisions in chronological order. The authored
        // scene stage denotes the departure's preceding shore/boat actions;
        // stateAfter is the receipt authority, never a request to teleport.
        if(event.edgeId==='c.sail12'){out.add('c03.intro',stateBefore);out.add('c03.ready',stateBefore);out.add('c04');}
        if(event.edgeId.startsWith('c.sail23.')) {
          out.add('c06.common',stateBefore);out.add(`c06.${stateAfter.flags['c.route1']}`,stateAfter,{presentationState:stateBefore});
          // c07 contains mooring, so play it only on c.moor3, not departure.
        }
        if(event.edgeId.startsWith('c.sail34.')) {
          out.add('c09.common',stateBefore);
          const route=stateAfter.flags['c.route2'];
          if(route==='short'){out.add('c09.short.before',stateAfter,{presentationState:stateBefore});out.add('c09.short.after',stateAfter,{presentationState:stateBefore});}else out.add('c09.bypass',stateAfter,{presentationState:stateBefore});
          out.add('c10',stateBefore);out.add('c11');
        }
        if(event.edgeId==='c.sail45')out.add('c14',stateAfter,{presentationState:stateBefore});
      }
    }
    const first=out.finish(),local=location(stateAfter,{seenIds:first.seenIds,...options});
    return {scenes:[...first.scenes,...local.scenes],seenIds:local.seenIds,narrativeConflicts:[...first.narrativeConflicts,...local.narrativeConflicts]};
  }
  /** Local story choices never call dispatch. Call c20 only after one completed
   * c19 branch; replaying either branch is allowed and keeps victory identical. */
  function epilogue(state,choiceId,{seenIds=[],...options}={}) {
    if(!['lampRoom','bow'].includes(choiceId))error('Choose lampRoom or bow');
    const out=resultBuilder(state,seenIds,options);
    out.add('c19.common');out.add(`c19.${choiceId}`);out.add('c20');return out.finish();
  }
  function referencePanels(state) {
    // Reuse already-frozen spoken information; never invent a new confession or
    // gate the mainline facts behind optional questions.
    const lines=(id,numbers)=>resolve(id,state,{reviewMode:true}).turns.filter(t=>numbers.includes(t.sourceLine)).map(t=>({speaker:t.speaker,text:t.text,sourceLine:t.sourceLine}));
    return {
      manifest:{label:'货单',turns:lines('c01',[92,96,106,110,114])},
      voyage:{label:'航线',budget:budget(state)},
      returnArrangement:{label:'归船安排',turns:lines('c01',[120,122,124,126,134])},
      nearLamp:{label:'近灯现在的情况？',turns:lines('c13',[645,647,651,653])},
      ferry:{label:'渡口需要我们留下什么？',turns:lines('c12',[597,601,603])}
    };
  }
  return Object.freeze({resolve,fromDispatch,location,epilogue,budget,routePanel,ballastPanel,referencePanels});
}
