import { calculateBattle } from './battle.js';
import { hashValue, stableStringify } from '../solver/state.js';

export const CAMPAIGN_RULES_VERSION = 'fixed-campaign-v1.1';
export const DIRECTIONS = Object.freeze({up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]});
export const clone = (value) => structuredClone(value);
export function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const integer = (n) => Number.isSafeInteger(n);
const distance = (a,b) => Math.abs(a.x-b.x)+Math.abs(a.y-b.y);

export function createCampaign(input) {
  const spec = clone(input);
  assert(spec.id && spec.difficulty && spec.version, 'Campaign identity is required');
  assert(spec.goal && typeof spec.goal==='object', 'Campaign goal is required');
  assert(Array.isArray(spec.regions) && spec.regions.length, 'Regions are required');
  const regions = new Map(), entities = new Map(), transitions = new Map();
  for (const region of spec.regions) {
    assert(!regions.has(region.id), `Duplicate region: ${region.id}`);
    assert(region.map?.length && region.map.every(row => typeof row === 'string' && row.length === region.map[0].length), `Invalid grid: ${region.id}`);
    regions.set(region.id, region);
    for (const entity of region.entities ?? []) {
      assert(!entities.has(entity.id), `Duplicate entity: ${entity.id}`);
      assert(integer(entity.x) && integer(entity.y) && region.map[entity.y]?.[entity.x] != null, `Invalid entity: ${entity.id}`);
      assert(!(['enemy','pickup'].includes(entity.kind)&&entity.once===false), `Repeatable enemy/pickup is forbidden: ${entity.id}`);
      if(entity.kind==='shop') assert(integer(entity.price)&&entity.price>=0&&(entity.once!==false||(entity.price>0&&(entity.effects?.stats?.gold??0)<entity.price)), `Unbounded shop: ${entity.id}`);
      if(entity.once===false&&entity.kind!=='shop') assert(!Object.values(entity.effects?.resources??{}).some(n=>n>0)&&!Object.values(entity.effects?.stats??{}).some(n=>n>0), `Repeatable resource reward: ${entity.id}`);
      if(entity.interactionAt) assert(region.map[entity.interactionAt.y]?.[entity.interactionAt.x]==='.'&&distance(entity,entity.interactionAt)<=1, `Invalid interaction stand: ${entity.id}`);
      entities.set(entity.id, {...entity, regionId:region.id});
    }
  }
  for (const edge of spec.transitions ?? []) {
    assert(!transitions.has(edge.id), `Duplicate transition: ${edge.id}`);
    assert(entities.has(edge.anchor), `Missing transition anchor: ${edge.id}`);
    assert(edge.to === '@dock' || regions.has(edge.to), `Missing transition target: ${edge.id}`);
    assert(Object.values(edge.cost ?? {}).every(n=>integer(n)&&n>=0), `Invalid transition cost: ${edge.id}`);
    transitions.set(edge.id, edge);
  }
  assert(regions.has(spec.initial.location.regionId), 'Missing initial region');
  const contentHash = hashValue(spec);
  const identity = deepFreeze({campaignId:spec.id, difficultyId:spec.difficulty, contentVersion:spec.version, rulesVersion:CAMPAIGN_RULES_VERSION, contentHash});
  deepFreeze(spec);
  for (const entity of entities.values()) deepFreeze(entity);

  function initialState() {
    const state = {identity:clone(identity), revision:0, location:clone(spec.initial.location), stats:{hp:100,maxHp:100,atk:10,def:0,gold:0,...spec.initial.stats}, resources:{...spec.initial.resources}, flags:{...spec.initial.flags}, cleared:[], visited:[spec.initial.location.regionId], boat:clone(spec.initial.boat ?? null), victory:false};
    assertValidState(state); return state;
  }
  function assertValidState(state) {
    assert(stableStringify(state.identity) === stableStringify(identity), 'Campaign/difficulty/content identity mismatch');
    assert(integer(state.revision) && state.revision >= 0, 'Invalid revision');
    assert(regions.has(state.location?.regionId), 'Invalid location');
    assert(integer(state.location.x) && integer(state.location.y), 'Invalid position');
    assert(regions.get(state.location.regionId).map[state.location.y]?.[state.location.x] === '.', 'Position is not a floor tile');
    assert(Object.values(state.stats).every(n=>integer(n)&&n>=0) && state.stats.hp>0 && state.stats.hp<=state.stats.maxHp, 'Invalid combat resources');
    assert(!Object.keys(state.resources).some(id=>Object.hasOwn(state.stats,id)), 'Resource/stat IDs must not overlap');
    assert(Object.values(state.resources).every(n=>integer(n)&&n>=0), 'Invalid campaign resources');
    assert(Array.isArray(state.cleared) && new Set(state.cleared).size === state.cleared.length && state.cleared.every(id=>entities.has(id)), 'Invalid cleared entities');
    assert(state.flags && typeof state.flags === 'object' && Object.values(state.flags).every(v=>['boolean','string','number'].includes(typeof v)), 'Invalid flags');
    assert(Array.isArray(state.visited) && state.visited.every(id=>regions.has(id)), 'Invalid visited regions');
    if (spec.ballast) {
      assert(state.boat && regions.has(state.boat.dock), 'Invalid dock');
      assert(typeof state.boat.moored==='boolean', 'Invalid mooring state');
      const ids=Object.keys(spec.ballast.weights), positions=state.boat.positions;
      assert(positions && Object.keys(positions).sort().join()===ids.sort().join(), 'Missing or duplicate ballast ID');
      assert(new Set(Object.values(positions)).size===ids.length && Object.values(positions).every(slot=>Object.hasOwn(spec.ballast.slots,slot)), 'Invalid ballast slots');
      assert(Object.hasOwn(spec.ballast.cargoTorques,state.boat.cargo), 'Invalid cargo pose');
    }
    return true;
  }
  function balanced(state) {
    if (!spec.ballast || !state.boat) return false;
    return Object.entries(spec.ballast.weights).reduce((v,[id,mass])=>v+mass*spec.ballast.slots[state.boat.positions[id]],spec.ballast.cargoTorques[state.boat.cargo])===0;
  }
  function meets(state, condition) {
    if (condition == null) return true;
    if (Array.isArray(condition)) return condition.every(c=>meets(state,c));
    if (condition.all) return condition.all.every(c=>meets(state,c));
    if (condition.any) return condition.any.some(c=>meets(state,c));
    if (condition.not) return !meets(state,condition.not);
    if (condition.flag) return (state.flags[condition.flag] ?? false)===(condition.value ?? true);
    if (condition.resource) {
      const reserve=(condition.reserveUntrueFlags ?? []).filter(id=>!state.flags[id]).length;
      return (state.resources[condition.resource] ?? 0)>=(condition.min ?? 0)+reserve;
    }
    if (condition.stat) return (state.stats[condition.stat] ?? 0)>=(condition.min ?? 0);
    if (condition.cleared) return state.cleared.includes(condition.cleared);
    if (condition.dock) return state.boat?.dock===condition.dock;
    if (condition.moored != null) return state.boat?.moored===condition.moored;
    if (condition.cargo) return state.boat?.cargo===condition.cargo;
    if (condition.balance != null) return balanced(state)===condition.balance;
    throw new Error(`Unsupported condition: ${JSON.stringify(condition)}`);
  }
  function explainMissing(state,condition) {
    if(condition==null||meets(state,condition))return [];
    if(Array.isArray(condition))return condition.flatMap(c=>explainMissing(state,c));
    if(condition.all)return condition.all.flatMap(c=>explainMissing(state,c));
    if(condition.any)return [`需任选一项：${condition.any.map(c=>explainMissing(state,c).join('、')).join('；或')}`];
    if(condition.not)return ['这项操作要求对应事项尚未完成'];
    if(condition.balance!=null)return [condition.balance?'配重未平衡，请在甲板调整三枚铁块':'当前配重已平衡'];
    if(condition.moored!=null)return [condition.moored?'请先完成系泊确认':'船已完成系泊'];
    if(condition.dock)return [`请先抵达${regions.get(condition.dock)?.title??condition.dock}`];
    if(condition.cargo)return [`灯座须处于${{center:'中线货架',left:'左侧绞盘作业位',right:'右舷吊装位',ashore:'已上岸状态'}[condition.cargo]??condition.cargo}`];
    if(condition.cleared)return [`请先清除${entities.get(condition.cleared)?.title??condition.cleared}`];
    if(condition.resource){const reserved=(condition.reserveUntrueFlags??[]).filter(id=>!state.flags[id]).length;const label=spec.resourceLabels?.[condition.resource]??({fuel:'船油',heat:'热脂',wedges:'根楔'}[condition.resource]??condition.resource);return [`${label}不足：本次需${condition.min??0}${reserved?`，另须为主线保留${reserved}`:''}，现有${state.resources[condition.resource]??0}`];}
    if(condition.stat)return [`${condition.stat}至少需要${condition.min??0}，现有${state.stats[condition.stat]??0}`];
    if(condition.flag){const source=[...entities.values()].find(e=>Object.hasOwn(e.effects?.flags??{},condition.flag)&&e.effects.flags[condition.flag]===(condition.value??true));const label=spec.flagLabels?.[condition.flag]??source?.title??'对应前置作业';return [(condition.value??true)===false?`须保持“${label}”未完成`:`请先完成：${label}`];}
    return ['对应前置条件尚未满足'];
  }
  function remainingEntity(state, entity) { return !state.cleared.includes(entity.id); }
  function passable(state,x,y) {
    const region=regions.get(state.location.regionId);
    if (region?.map[y]?.[x]!=='.') return false;
    return !(region.entities ?? []).some(e=>e.x===x&&e.y===y&&e.blocking===true&&remainingEntity(state,e));
  }
  function atEntity(state,entity) { return Boolean(entity && entity.regionId===state.location.regionId && distance(state.location,entity)<=1 && (!entity.interactionAt || state.location.x===entity.interactionAt.x&&state.location.y===entity.interactionAt.y)); }
  function applyEffects(state,effect={}) {
    for (const [id,delta] of Object.entries(effect.resources ?? {})) { assert(integer(delta),'Noninteger resource delta'); state.resources[id]=(state.resources[id]??0)+delta; }
    const stats=effect.stats ?? {};
    if (stats.maxHp) state.stats.maxHp+=stats.maxHp;
    if (stats.hp) state.stats.hp=Math.min(state.stats.maxHp,state.stats.hp+stats.hp);
    for (const id of ['atk','def','gold']) if (stats[id]) state.stats[id]+=stats[id];
    for (const [id,value] of Object.entries(effect.flags ?? {})) state.flags[id]=value;
    if (effect.cargo) { assert(state.boat,'Cargo without boat'); state.boat.cargo=effect.cargo; }
    if (effect.moored != null) { assert(state.boat,'Mooring without boat'); state.boat.moored=effect.moored; }
  }
  function deny(state,reason) { return {ok:false,state,reason,events:[]}; }
  function transition(state,action) {
    if (!action || typeof action!=='object') return deny(state,'无效操作');
    if (action.expectedRevision!=null && action.expectedRevision!==state.revision) return deny(state,'状态已改变，请重新确认');
    if (state.victory) return deny(state,'本次主线已完成');
    const next=clone(state), events=[];
    if (action.type==='move') {
      const dir=DIRECTIONS[action.direction];
      if (!dir) return deny(state,'无效方向');
      const x=state.location.x+dir[0],y=state.location.y+dir[1];
      if (!passable(state,x,y)) return deny(state,'此处不可步行');
      next.location.x=x; next.location.y=y;
    } else if (action.type==='interact') {
      const entity=entities.get(action.entityId);
      if (!atEntity(state,entity)) return deny(state,'请先到目标旁边');
      if (!remainingEntity(state,entity)) return deny(state,'该事项已完成，不能重复领取或结算');
      if (!meets(state,entity.requires)) return deny(state,[entity.blockedReason,...explainMissing(state,entity.requires)].filter(Boolean).join('；'));
      if (entity.kind==='enemy') {
        const battle=calculateBattle(state.stats,entity.enemy);
        if (!battle.winnable) return {...deny(state,battle.reason),battle};
        next.stats.hp-=battle.totalDamage;
        next.stats.gold+=entity.enemy.gold ?? 0;
        events.push({type:'battle',entityId:entity.id,battle});
      } else if (!['pickup','operation','shop'].includes(entity.kind)) return deny(state,'请使用该处的对应操作');
      if (entity.kind==='shop') {
        if (state.stats.gold<(entity.price ?? 0)) return deny(state,'金币不足');
        next.stats.gold-=entity.price ?? 0;
      }
      applyEffects(next,entity.effects);
      if (entity.once!==false) next.cleared.push(entity.id);
      events.push({type:entity.kind,entityId:entity.id,title:entity.title,storyId:entity.storyId ?? null});
    } else if (action.type==='traverse') {
      const edge=transitions.get(action.edgeId);
      if (!edge || !atEntity(state,entities.get(edge.anchor))) return deny(state,'请先到路线的指定出发点');
      if (!meets(state,edge.requires)) return deny(state,[edge.blockedReason,...explainMissing(state,edge.requires)].filter(Boolean).join('；'));
      for (const [id,cost] of Object.entries(edge.cost ?? {})) if ((state.resources[id]??0)<cost) return deny(state,`${spec.resourceLabels?.[id]??({fuel:'船油',heat:'热脂',wedges:'根楔'}[id]??id)}不足，需要${cost}，目前${state.resources[id]??0}`);
      let to=edge.to==='@dock'?state.boat?.dock:edge.to;
      if (!regions.has(to)) return deny(state,'没有有效的目的地');
      for (const [id,cost] of Object.entries(edge.cost ?? {})) next.resources[id]-=cost;
      if (edge.departure) {
        if (!state.boat || edge.departure.from!==state.boat.dock) return deny(state,'船已不在这个泊位');
        next.boat.dock=edge.departure.to;
        next.boat.moored=false;
      }
      applyEffects(next,edge.effects);
      const destination=edge.at ?? regions.get(to).arrival;
      next.location={regionId:to,...destination};
      if (!next.visited.includes(to)) next.visited.push(to);
      events.push({type:edge.departure?'departure':'traverse',edgeId:edge.id,cost:clone(edge.cost??{}),storyId:edge.storyId??null});
    } else if (action.type==='moveBallast') {
      if (!spec.ballast || state.boat?.moored!==true || state.location.regionId!==spec.ballast.deckRegion || !atEntity(state,entities.get(spec.ballast.control))) return deny(state,'请在系泊甲板的配重控制位操作');
      if (!Object.hasOwn(spec.ballast.weights,action.weightId) || !Object.hasOwn(spec.ballast.slots,action.slot)) return deny(state,'不存在的配重或槽位');
      if (Object.values(state.boat.positions).includes(action.slot)) return deny(state,'目标槽已占用');
      next.boat.positions[action.weightId]=action.slot;
      events.push({type:'ballast',weightId:action.weightId,slot:action.slot});
    } else return deny(state,'未知操作');
    next.revision++;
    next.cleared.sort();
    next.victory=meets(next,spec.goal);
    try { assertValidState(next); } catch(error) { return deny(state,`状态约束：${error.message}`); }
    return {ok:true,state:next,events,receipt:{action:clone(action),before:hashValue(state),after:hashValue(next)}};
  }
  function dispatch(state,action) {
    try { assertValidState(state); return transition(state,action); }
    catch(error) { return deny(state,error.message); }
  }
  function preview(state,action) {
    const result=dispatch(state,action);
    return {legal:result.ok,reason:result.reason??null,events:result.events,battle:result.battle??result.events.find(event=>event.type==='battle')?.battle??null,receipt:result.receipt??null,nextState:result.ok?result.state:null};
  }
  const slotNames={L1:'左前槽',L2:'左后槽',C1:'中前槽',C2:'中后槽',R1:'右前槽',R2:'右后槽'};
  function ballastView(state){
    if(!spec.ballast)return null;
    const cargoTorque=spec.ballast.cargoTorques[state.boat.cargo];
    let leftMoment=Math.max(0,-cargoTorque),rightMoment=Math.max(0,cargoTorque);
    for(const[id,mass]of Object.entries(spec.ballast.weights)){const moment=mass*spec.ballast.slots[state.boat.positions[id]];leftMoment+=Math.max(0,-moment);rightMoment+=Math.max(0,moment);}
    return {balanced:balanced(state),weights:clone(spec.ballast.weights),positions:clone(state.boat.positions),cargo:state.boat.cargo,slotNames:clone(slotNames),leftMoment,rightMoment};
  }
  function listInteractions(state,{all=false}={}) {
    const actions=[];
    for (const entity of entities.values()) if ((all||atEntity(state,entity)) && entity.regionId===state.location.regionId && meets(state,entity.visibleWhen) && remainingEntity(state,entity) && ['enemy','pickup','operation','shop'].includes(entity.kind)) {
      actions.push({type:'interact',entityId:entity.id,title:entity.title,anchor:entity.id});
    }
    for (const edge of transitions.values()) {
      const entity=entities.get(edge.anchor);
      if ((all||atEntity(state,entity)) && entity.regionId===state.location.regionId && (!edge.departure||edge.departure.from===state.boat?.dock)) actions.push({type:'traverse',edgeId:edge.id,title:edge.title,anchor:entity.id});
    }
    if (spec.ballast && state.location.regionId===spec.ballast.deckRegion && (all||atEntity(state,entities.get(spec.ballast.control)))) {
      for (const weightId of Object.keys(spec.ballast.weights)) for (const slot of Object.keys(spec.ballast.slots)) if (!Object.values(state.boat.positions).includes(slot)) actions.push({type:'moveBallast',weightId,slot,title:`${Object.keys(spec.ballast.weights).indexOf(weightId)+1}号铁块（质量${spec.ballast.weights[weightId]}，当前${slotNames[state.boat.positions[weightId]]??state.boat.positions[weightId]}）→${slotNames[slot]??slot}`,anchor:spec.ballast.control});
    }
    return actions;
  }
  function projectView(state) {
    assertValidState(state);
    const region=regions.get(state.location.regionId);
    return {identity,state:clone(state),region:clone(region),entities:[...entities.values()].filter(e=>e.regionId===region.id).map(e=>({...clone(e),completed:state.cleared.includes(e.id)})),interactions:listInteractions(state).map(action=>({...action,preview:preview(state,action)})),balance:ballastView(state)};
  }
  function deserialize(text) { const state=JSON.parse(text); assertValidState(state); return state; }
  return Object.freeze({spec,identity,initialState,dispatch,preview,listInteractions,projectView,passable,balanced,meets,explainMissing,inReach:(state,id)=>atEntity(state,entities.get(id)),assertValidState,entity:id=>entities.get(id),region:id=>regions.get(id),serialize:state=>{assertValidState(state);return JSON.stringify(state);},deserialize,stateHash:hashValue});
}

export function createSaveRepository(storage,runtime,{validatePresentation=()=>true}={}) {
  const prefix=`campaign:${runtime.identity.campaignId}:${runtime.identity.difficultyId}:${runtime.identity.rulesVersion}:${runtime.identity.contentHash}`;
  const key=slot=>`${prefix}:${slot}`;
  function inspect(slot) {
    const raw=storage.getItem(key(slot));
    if(raw==null) return {status:'missing',slot};
    try { const parsed=JSON.parse(raw); const envelope=parsed?.$campaignSave===1; if(envelope)assert(validatePresentation(parsed.presentation??null),'Invalid presentation state'); const state=runtime.deserialize(envelope?JSON.stringify(parsed.state):raw); return {status:'valid',slot,state,presentation:envelope?clone(parsed.presentation??null):null}; }
    catch(error) { return {status:'invalid',slot,raw,reason:error.message}; }
  }
  function restore({preferred='auto',fallback='manual'}={}) {
    const issues=[]; let state=null,source=null,presentation=null;
    for(const slot of [...new Set([preferred,fallback].filter(Boolean))]) {
      const result=inspect(slot);
      if(result.status==='valid'&&!state) {state=result.state;source=slot;presentation=result.presentation;}
      if(result.status==='invalid') {
        const digest=hashValue(result.raw),backup=key(`corrupt:${slot}:${digest}`);
        if(storage.getItem(backup)==null) storage.setItem(backup,result.raw);
        issues.push({slot,reason:result.reason,backup});
      }
    }
    return {state,source,presentation,issues,allowAutoSave:Boolean(state)||issues.length===0};
  }
  return Object.freeze({key,inspect,restore,save(slot,state,presentation=null){const raw=runtime.serialize(state);storage.setItem(key(slot),presentation==null?raw:JSON.stringify({$campaignSave:1,state:JSON.parse(raw),presentation:clone(presentation)}));},load(slot){const result=inspect(slot);if(result.status==='invalid')throw new Error(result.reason);return result.state??null;},remove(slot){storage.removeItem(key(slot));}});
}
