import { MAP_ART_REVISION,cellsWhere,compileBoundaryRuns,rect,line,circle,label,entityCommands } from './continuous-map.js';
const SAMPLE_MAPS=Object.freeze({
 'B-07':['^^^^^^^^^^^','^...^^^...^','^.........^','^...^^^...^','^...^^^...^','^...^^^...^','^...^^^...^','^...^^^...^','^.........^','^...^^^...^','^^^^^^^^^^^'],
 'B-09':['^^^^~~~^^^^','^...~~~...^','^...~~~...^','^...~~~...^','^...~~~...^','^.........^','^...~~~...^','^...~~~...^','^...~~~...^','^...~~~...^','^^^^~~~^^^^']
});
export const FOREST_MAP_SIDECAR=Object.freeze({artRevision:MAP_ART_REVISION,source:'candidate-b-art-plan/map-space-contract.json; authored FOREST_GEOGRAPHY',rulesContentHash:'a12cd07ee1ccc762',samples:Object.freeze(Object.keys(SAMPLE_MAPS))});
function bridge(s,{id,y,root=false,fixed=false,publicReady=false,timber=false}){const a=3.7,b=7.3;
 s.surfaces.push({id:id+'-continuous-surface',material:publicReady&&timber?'warm-planks':root?'root-bark':'dry-stone',polygon:[[a,y+.05],[b,y+.05],[b,y+.95],[a,y+.95]],uv:publicReady&&timber?{origin:[a,y+.05],periodX:4,height:.9}:root?{domain:[a,y+.05,b-a,.9],rotate:90}:{}});
 s.structures.push(rect(a,y+.05,b-a,.9,null,'#3c3c32',.04,{structureId:id,state:publicReady?'public':fixed?'person':'closed'}));
 if(root){for(const dy of[.19,.44,.7])s.structures.push(line([[a,y+dy],[4.7,y+dy+.035],[6.2,y+dy-.025],[b,y+dy]],'#ab8551',.095));}
 else for(let x=a+.12;x<b;x+=.45)s.structures.push(line([[x,y+.08],[x,y+.9]],'#534b3c',.022));
 // Real bearing seats extend onto both existing banks, never create a third crossing.
 for(const x of[a,b-.22])s.structures.push(rect(x,y,.22,1,'#7b8074','#353c35',.04));
 if(fixed&&root)for(const x of[4.1,6.85]){s.structures.push(rect(x,y+.03,.15,.94,'#756547','#c4ad78',.025));s.structures.push(line([[x-.035,y+.4],[x+.2,y+.5]],'#d6c18b',.065));}
 if(publicReady){if(timber)for(let x=a+.22;x<b-.22;x+=.24)s.structures.push(rect(x,y+.09,.2,.8,null,'#5e4e3c',.018));for(const yy of[y+.04,y+.96])s.boundaryRuns.push({kind:'rail',points:[[a,yy],[b,yy]]});}
 if(fixed&&!publicReady&&!root&&id.startsWith('b07'))s.structures.push(line([[5.2,y+.16],[5.36,y+.12],[5.53,y+.17]],'#5a5350',.06),rect(6.2,y+.12,.18,.1,'#746858'));
 if(!fixed&&root){s.structures.push(line([[4.12,y+.12],[4.87,y+.82]],'#633d35',.13),line([[4.12,y+.82],[4.87,y+.12]],'#d0a576',.075));}
}
export function projectForestScene(runtime,state){const view=runtime.projectView(state),r=view.region;
 if(!SAMPLE_MAPS[r.id]||r.map.join('\n')!==SAMPLE_MAPS[r.id].join('\n'))return null;
 const scene={campaign:'B',regionId:r.id,width:11,height:11,artRevision:MAP_ART_REVISION,rulesContentHash:runtime.identity.contentHash,topologyHash:r.map.join('|'),surfaces:[],boundaryRuns:[],structures:[],objects:[],visibleEntities:[],passability:r.map.map((row,y)=>[...row].map((_,x)=>runtime.passable(state,x,y)))};
 const rock=cellsWhere(r.map,t=>t==='^'),land=cellsWhere(r.map,t=>t==='.'),water=cellsWhere(r.map,t=>t==='~');scene.surfaces.push({id:'low-ground',material:r.id==='B-09'?'water':'dark-rock',cells:cellsWhere(r.map,()=>true)},{id:'banks-and-paths',material:'earth-moss',cells:land},{id:'rock-divider',material:'dark-rock',cells:rock});scene.boundaryRuns.push(...compileBoundaryRuns(rock,'wall'));
 if(water.length)scene.boundaryRuns.push(...compileBoundaryRuns(water,'shore'));
 if(r.id==='B-07'){
  const original=Boolean(state.flags['b07.originalCleared']),root=Boolean(state.flags['b07.rootFixed']);
  bridge(scene,{id:'b07-original-stone-span',y:2,fixed:original,publicReady:Boolean(state.flags['b07.originalWorksDone'])});
  bridge(scene,{id:'b07-existing-root-span',y:8,root:true,timber:true,fixed:root,publicReady:Boolean(state.flags['b07.rootWorksDone'])});
  scene.routeStates={original:state.flags['b07.originalWorksDone']?'public':original?'person':'closed',root:state.flags['b07.rootWorksDone']?'public':root?'person':'closed'};
 }else{
  const built=Boolean(state.flags['b09.realBridgeBuilt']);bridge(scene,{id:'b09-real-trestle-span',y:5,timber:true,fixed:built,publicReady:built});
  if(!built){scene.structures.push(rect(6.07,5.06,.83,.88,'#253b42'),line([[6.1,5.17],[6.91,5.17]],'#a3875c',.13),line([[6.1,5.82],[6.91,5.82]],'#a3875c',.13),line([[6.2,5.17],[6.75,5.8]],'#d0aa70',.065));}
  scene.routeStates={bridge:built?'public':'construction'};
 }
 const rendered=new Set();for(const e of view.entities.filter(e=>runtime.meets(state,e.visibleWhen))){scene.visibleEntities.push(e.id);if(e.completed)continue;if(e.kind==='operation'&&(/fixRoot|rootWorks|originalWorks|bridgeWorks/.test(e.id)))continue;const k=`${e.x},${e.y}`;if(rendered.has(k)&&e.kind!=='enemy')continue;scene.objects.push(...entityCommands(e).map(c=>({...c,entityId:e.id})));rendered.add(k);}
 scene.objects.push(...entityCommands(state.location,{hero:true}));return scene;
}
