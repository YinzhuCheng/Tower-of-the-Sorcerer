import { DIRECTIONS, clone } from '../core/campaign.js';
import { hashValue, stableStringify } from './state.js';

// Every macro below is only a path compression. All steps dispatch canonical
// atomic commands; unknown pickups and reversible operations remain explicit.
export function reachablePaths(runtime,state) {
  const start=state.location, key=(x,y)=>`${x},${y}`;
  const paths=new Map([[key(start.x,start.y),[]]]), queue=[{x:start.x,y:start.y}];
  for (let head=0;head<queue.length;head++) {
    const p=queue[head];
    for (const [direction,[dx,dy]] of Object.entries(DIRECTIONS)) {
      const x=p.x+dx,y=p.y+dy,k=key(x,y);
      if (paths.has(k)||!runtime.passable(state,x,y)) continue;
      paths.set(k,[...paths.get(key(p.x,p.y)),{type:'move',direction}]); queue.push({x,y});
    }
  }
  return paths;
}
export function createCampaignAdapter(runtime,{allowAction=()=>true,coverage='complete-macro',priority=null}={}) {
  const resourceFields=[...Object.keys(runtime.initialState().stats),...Object.keys(runtime.initialState().resources)].sort();
  const resources=state=>({...state.stats,...state.resources});
  const structuralKey=state=>{
    const paths=reachablePaths(runtime,state);
    const component=[...paths.keys()].sort()[0];
    return stableStringify({identity:state.identity,region:state.location.regionId,component,flags:state.flags,cleared:state.cleared,visited:[...state.visited].sort(),boat:state.boat,victory:state.victory});
  };
  return {
    coverage,objectiveType:'terminal_hp',resourceFields,stateEncoding:'campaign-json-v1',
    createInitialState:runtime.initialState,cloneState:clone,resources,structuralKey,
    summarizeState:clone,isGoal:state=>state.victory,objectiveValue:state=>state.stats.hp,
    rulesVersion:()=>runtime.identity.rulesVersion,contentHash:()=>runtime.identity.contentHash,
    priority:priority??(state=>state.cleared.length*10000+state.visited.length*100+state.stats.hp),
    stageKey:state=>`${state.location.regionId}/${state.boat?.dock??''}`,
    enumerateActions(state) {
      const paths=reachablePaths(runtime,state), actions=[];
      for (const action of runtime.listInteractions(state,{all:true})) {
        if (!allowAction(action,state)) continue;
        const entity=runtime.entity(action.anchor);
        const approach=[...paths.entries()].filter(([key])=>{const [x,y]=key.split(',').map(Number);return Math.abs(x-entity.x)+Math.abs(y-entity.y)<=1;}).sort((a,b)=>a[1].length-b[1].length)[0];
        if (!approach) continue;
        const [x,y]=approach[0].split(',').map(Number);
        const nearby={...state,location:{...state.location,x,y}};
        const command=Object.fromEntries(Object.entries(action).filter(([key])=>!['title','anchor'].includes(key)));
        if (!runtime.preview(nearby,command).legal) continue;
        actions.push({kind:'campaign-macro',eventId:action.entityId??action.edgeId??`ballast:${action.weightId}:${action.slot}`,command,path:approach[1]});
      }
      return actions;
    },
    applyAction(state,macro) {
      const steps=[];
      for (const action of [...macro.path,macro.command]) {
        const before=state, result=runtime.dispatch(state,action);
        if (!result.ok) return {ok:false,state:before,reason:result.reason};
        state=result.state;
        steps.push({kind:'campaign-action',eventId:action.entityId??action.edgeId??action.type,action:clone(action),resourcesBefore:resources(before),resourcesAfter:resources(state),structuralBefore:hashValue(JSON.parse(structuralKey(before))),structuralAfter:hashValue(JSON.parse(structuralKey(state))),stateBeforeHash:runtime.stateHash(before),stateAfterHash:runtime.stateHash(state)});
      }
      return {ok:true,state,steps};
    }
  };
}
