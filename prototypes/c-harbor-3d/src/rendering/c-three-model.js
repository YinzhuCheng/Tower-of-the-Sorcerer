import { VOYAGE_VESSEL_GEOMETRY as G, voyageDeckToVessel } from '../campaigns/c/content.js';
import { projectVoyageScene } from './c-adapter.js';
export const REQUIRED_CONTENT_HASH='c5a5f809d5548f36';
export const GEOMETRY=G;
export const deckPoint=([x,y],height=G.hull.deckY)=>{const p=voyageDeckToVessel([x,y]);p[1]=height;return p;};
export const berthPoint=([x,y],height=G.hull.deckY)=>[x-G.berthSampling.hullOriginGrid[0],height,y-G.berthSampling.hullOriginGrid[1]];
export function logicalPoint(regionId,x,y,height=G.hull.deckY){return regionId==='C-D01'?deckPoint([x,y],height):berthPoint([x,y],height);}
export function metricToCell(regionId,[X,Y,Z]){return regionId==='C-D01'?{x:Math.floor(5+X/.6+.5),y:Math.floor((Z+2.7)/.6+.5)}:{x:Math.floor(X+5+.5),y:Math.floor(Z+5.5+.5)};}
export function rigidYaw(point,yaw){const c=Math.cos(yaw),s=Math.sin(yaw),[x,y,z]=point;return [c*x-s*z,y,s*x+c*z];}
// Origin is a local metric frame. Yaw follows the contract's right-handed X east/Y up/Z south.
export const berthYaw=dock=>dock==='C-M04'?Math.PI:0;
export function buildViewModel(runtime,state){
 if(runtime.identity.contentHash!==REQUIRED_CONTENT_HASH)throw new Error('3D geometry requires C v1.2; content identity mismatch');
 const view=runtime.projectView(state),deck=view.region.id==='C-D01',at=p=>deckPoint(p),readOnly=projectVoyageScene(runtime,state);
 const slots=Object.entries(runtime.spec.ballast.slotCoordinates).map(([id,p])=>({id,position:at(p),mounting:'flush'}));
 const weights=Object.entries(state.boat.positions).map(([id,slot])=>({id,mass:runtime.spec.ballast.weights[id],slot,position:at(runtime.spec.ballast.slotCoordinates[slot])}));
 const cargoPos=G.fixtures.cargoRack.poses[state.boat.cargo];
 const cargo={id:'one-lamp-cargo',pose:state.boat.cargo,position:cargoPos?at(cargoPos):berthPoint(state.flags['c.cargoAtLamp']?[9,2]:[8,5])};
 const winchVisible=state.boat.dock==='C-M03'&&state.boat.cargo==='left';
 const devices=[];
 if(winchVisible)devices.push({id:'one-gate-winch',body:at(G.fixtures.gateWinch.body),handle:at(G.fixtures.gateWinch.handle),cable:G.fixtures.gateWinch.cablePathXZ.map(([x,z])=>[x,1,z])});
 if(state.boat.dock==='C-M05')devices.push({id:'one-cargo-davit',...G.fixtures.cargoDavit,stowed:Boolean(state.flags['c.craneStowed'])});
 const visible=view.entities.filter(e=>runtime.meets(state,e.visibleWhen));
 const targets=visible.filter(e=>!e.completed).map(e=>({id:e.id,title:e.title,kind:e.kind,cell:[e.x,e.y],position:logicalPoint(view.region.id,e.x,e.y),inReach:runtime.inReach(state,e.id),interactionAt:e.interactionAt}));
 return {regionId:view.region.id,dock:state.boat.dock,deck,yaw:berthYaw(state.boat.dock),revision:state.revision,hash:runtime.stateHash(state),title:view.region.title,map:view.region.map,geometryId:G.geometryId,slots,weights,cargo,devices,moored:state.boat.moored,barrierOpen:Boolean(state.flags['c.barrierOpen']),lampInstalled:Boolean(state.flags['c.lampInstalled']),bothLamps:Boolean(state.flags['c.bothLamps']),hero:logicalPoint(view.region.id,state.location.x,state.location.y),targets,passability:view.region.map.map((row,y)=>[...row].map((_,x)=>runtime.passable(state,x,y))),sharedSemantics:readOnly?{geometryId:readOnly.geometryId,visibleEntities:readOnly.visibleEntities,fixtures:readOnly.fixtures}:null};
}
