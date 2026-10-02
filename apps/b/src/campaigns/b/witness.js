// Existence witness only. Navigation is a BFS over real walkable cells and
// currently legal reciprocal portals; every returned action uses the shared reducer.
import { DIRECTIONS } from '../../core/campaign.js';
import { createForestCampaign, FOREST_WARM_POINTS } from './content.js';
const key=p=>`${p.regionId}:${p.x},${p.y}`;
const commandFor=id=>({type:'interact',entityId:id});

export function forestPathToEntity(runtime,state,entityId) {
  const target=runtime.entity(entityId);if(!target)throw new Error(`Unknown B target ${entityId}`);
  const queue=[{location:state.location,parent:-1,action:null}],seen=new Set([key(state.location)]);
  const edges=runtime.spec.transitions;
  for(let head=0;head<queue.length;head++){
    const node=queue[head],p=node.location;
    if(p.regionId===target.regionId&&Math.abs(p.x-target.x)+Math.abs(p.y-target.y)<=1){
      const actions=[];for(let i=head;queue[i].parent!==-1;i=queue[i].parent)actions.push(queue[i].action);return actions.reverse();
    }
    const local={...state,location:p};
    for(const [direction,[dx,dy]]of Object.entries(DIRECTIONS)){
      const location={...p,x:p.x+dx,y:p.y+dy},k=key(location);if(seen.has(k)||!runtime.passable(local,location.x,location.y))continue;
      seen.add(k);queue.push({location,parent:head,action:{type:'move',direction}});
    }
    for(const e of edges){const a=runtime.entity(e.anchor);if(a.regionId!==p.regionId||Math.abs(p.x-a.x)+Math.abs(p.y-a.y)>1)continue;
      const action={type:'traverse',edgeId:e.id},preview=runtime.preview(local,action);if(!preview.legal)continue;
      const location=preview.nextState.location,k=key(location);if(seen.has(k))continue;
      seen.add(k);queue.push({location,parent:head,action});
    }
  }
  throw new Error(`No real walking/portal route from ${key(state.location)} to ${entityId}`);
}
export function createForestWalker(runtime,state=runtime.initialState()){
  const actions=[],steps=[],checkpoints=[];
  function dispatch(action){const before=state,result=runtime.dispatch(state,action);if(!result.ok)throw new Error(`${JSON.stringify(action)} at ${key(state.location)}: ${result.reason} (hp ${state.stats.hp})`);state=result.state;actions.push(action);steps.push({action,before,state,events:result.events});return result;}
  function approach(entityId){for(const action of forestPathToEntity(runtime,state,entityId))dispatch(action);return state;}
  function interact(entityId){approach(entityId);const before=state,result=dispatch(commandFor(entityId));checkpoints.push({entityId,before,state});return result;}
  return {get state(){return state;},actions,steps,checkpoints,dispatch,approach,interact};
}

export function buildForestWitness({runtime=createForestCampaign(),warmPoints=['greenhouse','lodge'],wedges=[],ending='together',lateWarmPoints=false,clearBypassed=false,stopBefore=null}={}){
  if(new Set(wedges).size!==wedges.length||wedges.length>2||wedges.some(n=>![7,16,21,24].includes(n)))throw new Error('Choose up to two distinct canonical root sites');
  if(new Set(warmPoints).size!==warmPoints.length||warmPoints.some(id=>!FOREST_WARM_POINTS.some(w=>w.id===id))||FOREST_WARM_POINTS.filter(w=>warmPoints.includes(w.id)).reduce((n,w)=>n+w.cost,0)>4)throw new Error('Heat allocation exceeds four optional shares');
  const walker=createForestWalker(runtime),itinerary=[];
  const act=(...ids)=>itinerary.push(...ids);
  const route=n=>{const id=`b${String(n).padStart(2,'0')}`;act(...(wedges.includes(n)?[`${id}.fixRoot`,`${id}.rootWorks`]:[`${id}.originalEnemy`,`${id}.originalWorks`]));};
  const warm=id=>{const w=FOREST_WARM_POINTS.find(w=>w.id===id);if(warmPoints.includes(id))act(`b${w.region}.warm${id}`);};
  act('b01.timberPuppet','b01.guardPlate','b02.winterPlan','b03.heatBox','b03.routeBrief','b04.housing','b04.bandages','b05.sluicePuppet','b05.valve','b05.pipeWorks',
    'b06.edgeTool','b06.sawPuppet','b06.freightWorks','b06.resinFragments','b07.wedges');
  route(7);
  act('b08.campSupply','b08.firewood','b09.rivetGuard','b09.foundationRig','b09.bridgeWorks','b10.supportWorks','b10.valve','b11.returnPuppet','b11.roadWorks','b11.steelEdge','b12.overlook',
    'b13.freightManifest','b13.coatShop','b13.edgeShop','b14.lodging','b14.learningPlan','b15.cablePuppet','b15.cableWorks','b15.deliverWinter','b15.trailPack','b15.cableTool');
  route(16);
  act('b17.inspectSeeds');if(!lateWarmPoints)warm('greenhouse');act('b18.oldSeat');if(!lateWarmPoints)warm('pear');
  act('b19.lodgeWorks','b19.reservePack','b19.snowGuard');if(!lateWarmPoints)warm('lodge');act('b20.supportWorks','b20.valve');
  route(21);
  act('b22.inspectUpperRoad','b22.shareDuties','b22.windGuard','b23.acceptRing');route(24);
  act('b24.retrieveHandrail','b24.shutdownDiagram','b25.valve','b25.waterTest','b24.installHandrail','b26.readinessReview','b26.supper','b26.drawer');
  if(lateWarmPoints)for(const w of FOREST_WARM_POINTS)warm(w.id);
  if(clearBypassed)for(const n of wedges)act(`b${String(n).padStart(2,'0')}.originalEnemy`,`b${String(n).padStart(2,'0')}.originalWorks`);
  const mask=FOREST_WARM_POINTS.reduce((v,w,i)=>v|(warmPoints.includes(w.id)?1<<i:0),0);
  act(`b26.confirmHeat.${mask}`,'b27.packPersonalThings','b28.serviceLever','b28.guardDrive','b28.stopMainValve','b29.homecoming',`b30.${ending}`);
  for(const id of itinerary){if(id===stopBefore){walker.approach(id);return{runtime,...walker,state:walker.state,itinerary,stoppedBefore:id};}walker.interact(id);}
  return{runtime,...walker,state:walker.state,itinerary};
}
