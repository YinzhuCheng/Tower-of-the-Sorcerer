import {HERO_MOTION_ASSET} from './hero-neutral.js';
import {createFastNativeSupportSampler} from './native-support-fast.mjs';
import {FOREST_GROUND_MESH} from './forest-ground-mesh.js';
import {NativeFootPointIndex} from './fine-presentation.mjs';
import {ForestHeroPresentation,forestBridgeSnapshot} from './forest-bridge-presentation.mjs';
import {SoftwareHero} from './software-hero.mjs';
import {SoftwareFootShadows} from './foot-shadows.mjs';
import {HeroCanvasLayer} from './canvas-layer.mjs';
import {fineCapsuleHitsPolygon,hasFineForest} from './forest-fine-navigation.js';
import {FOREST_FINE_WORLD_COLLISION} from './forest-fine-world-collision.js';
import {nativeGroundSupportAt} from './forest-ground-support.js';
import {NATIVE_FOREST_WORLD as camera} from './forest-world-contract.js';
export const HERO_WORLD_ASSETS=Object.freeze([{id:'hero-world-mesh',file:'assets/hero-world/hero-mesh.json',sha256:'f3153f50c5e69a016b45997197b5d167a8b95fe8a340cac8d4dd79be5a20d53d'}]);
const shadowSupport=createFastNativeSupportSampler(FOREST_GROUND_MESH,camera);
const sourceTexture=new URL('../../assets/hero-motion/hero-four-views.png',import.meta.url).href;
async function loadTexture(){const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Hero source texture failed'));image.src=sourceTexture;});if(image.naturalWidth!==HERO_MOTION_ASSET.width||image.naturalHeight!==HERO_MOTION_ASSET.height)throw Error('Hero source texture dimensions differ from canonical source');const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0);return{width:canvas.width,height:canvas.height,data:context.getImageData(0,0,canvas.width,canvas.height).data};}
export function createHeroWorldRuntime(runtime,onReady=()=>{},dependencies={}){
 const index=new NativeFootPointIndex(FOREST_FINE_WORLD_COLLISION.colliders),anchor=camera.cells.find(c=>c.sourceRegionId==='B-01'&&c.localX===1&&c.localY===5),support=p=>nativeGroundSupportAt(anchor,p[0]-anchor.worldFootM[0],p[1]-anchor.worldFootM[1]);
 const actorLayer=new HeroCanvasLayer(dependencies),shadowLayer=new HeroCanvasLayer(dependencies);let controller=null,lease=null,generation=0,tickId=0,assets=null,assetPromise=null,loadingGeneration=null,renderer=null,shadows=null,native=null,error=null,lastPaint=null,disabled=false;
 const load=dependencies.loadAssets??(async()=>{const [response,texture]=await Promise.all([fetch(new URL('../../assets/hero-world/hero-mesh.json',import.meta.url)),loadTexture()]);if(!response.ok)throw Error('Hero mesh failed: '+response.status);return{model:await response.json(),texture};});
 function fail(e){error=e?.message??String(e);disabled=true;renderer=null;shadows=null;lastPaint=null;}
 function notify(){try{onReady();}catch(e){fail(e);}}
 function prepare(loaded=assets){if(disabled||!loaded)return false;try{if(!native){assets=loaded;return false;}const nextRenderer=new SoftwareHero(loaded.model,{camera,texture:loaded.texture,terrainDepth:{width:camera.width,height:camera.height,data:native.depth,nearM:camera.depthEncoding.nearM,farM:camera.depthEncoding.farM}}),nextShadows=new SoftwareFootShadows({camera,terrainDepth:nextRenderer.terrainDepth,supportAtPixel:shadowSupport.nativeSupportAtPixel});assets=loaded;renderer=nextRenderer;shadows=nextShadows;error=null;return true;}catch(e){assets=null;fail(e);return false;}}
 function ensureAssets(){if(!controller||disabled||loadingGeneration===generation)return;loadingGeneration=generation;const mine=generation,owner=controller;if(assets){prepare();return;}assetPromise??=Promise.resolve().then(load);owner.loadAssets(()=>assetPromise,({assets:loaded})=>{if(mine!==generation||owner!==controller||disabled)return;prepare(loaded);notify();}).catch(e=>{if(mine!==generation||owner!==controller||disabled)return;fail(e);notify();});}
 function reset(){generation++;controller?.dispose();controller=null;lease=null;loadingGeneration=null;renderer=null;shadows=null;lastPaint=null;error=null;disabled=false;if(!assets)assetPromise=null;}
 function sync(fine,geometry,nextNative,coarse=null){
  const bridge=!fine?.active?forestBridgeSnapshot(coarse,controller?.bridge):null;
  if(!bridge&&(!fine?.active||!fine.physical||!hasFineForest(fine.state.location.regionId))){if(controller)reset();return;}
  if(fine?.active&&controller&&(controller.regionId!==fine.state.location.regionId||controller.geometry!==geometry||controller.bridge)&&!controller.resumeFine(fine,geometry))reset();
  if(disabled)return;
  try{
   const changedNative=native!==nextNative;native=nextNative;if(assets&&native&&changedNative)prepare();
   if(!controller){controller=new ForestHeroPresentation({geometry,support,staticPointBlocked:p=>index.blocked(p),passable:(s,n)=>runtime.passable(s,n.source.x,n.source.y),capsuleHits:fineCapsuleHitsPolygon});tickId=0;lease=bridge?controller.enterBridge({sceneToken:`hero-world-${generation}`,snapshot:bridge}):controller.bind({sceneToken:`hero-world-${generation}`,snapshot:fine,reason:'scene-bind'});}
   else if(bridge)lease=controller.enterBridge({sceneToken:`hero-world-${generation}`,snapshot:bridge});
   ensureAssets();
  }catch(e){fail(e);}
 }
 function tick(snapshot,{paused=false,dt=0}={}){if(!controller||disabled)return;try{if(controller.bridge)controller.tickBridge({lease,snapshot:controller.bridge,paused,dt,tickId:++tickId});else controller.tick({lease,snapshot,paused,dt,tickId:++tickId});}catch(e){fail(e);}}
 function drawNative(ctx,{zoom=1}={}){const pose=controller?.poseForDraw(lease);if(disabled||!pose||!renderer||!shadows)return null;try{const start=performance.now(),scale=2*zoom,shadow=shadows.render(pose,{scale}),frame=renderer.render(pose,{scale});shadowLayer.draw(ctx,shadow);actorLayer.draw(ctx,frame);lastPaint={ms:performance.now()-start,poseTravelM:pose.travelM,phase:pose.phase,mode:pose.mode,paused:pose.paused,rootM:pose.rootM,feet:pose.legs.map(l=>({side:l.side,stance:l.stance,center:l.center,yaw:l.yaw,lift:l.lift})),raster:[frame.width,frame.height],scale,depthPixels:frame.stats.occluded??0,shadowPixels:shadow.stats.clipped};return lastPaint;}catch(e){fail(e);return null;}}
 return{sync,tick,reset,drawNative,handoffFine(snapshot){if(!controller||disabled)return;try{controller.finishFineApproach(snapshot);}catch(e){fail(e);}},get ready(){return Boolean(!disabled&&controller?.poseForDraw(lease)&&renderer&&shadows);},snapshot:()=>({mode:disabled?'failed-fallback':controller&&renderer?'cpu-world-rig':'loading-or-fallback',generation,ready:Boolean(!disabled&&controller?.poseForDraw(lease)&&renderer),disabled,error,lastPaint,source:'new-depth-bearing-modeled-rig',bindings:controller?.stats.binds??0,bridge:controller?.bridge?{id:controller.bridge.id,progress:controller.bridge.progress}:null})};
}
