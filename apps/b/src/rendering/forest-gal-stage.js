import {forestGalSceneStateRow} from './forest-gal-scene-state-contract.js';
import {forestGalFinalBackgroundRow} from './forest-gal-final-background-contract.js';
import {forestMothPortrait} from './forest-moth-portrait.js';
import {forestReviewedPortrait} from './forest-reviewed-portraits.js';
import {forestGalRemainingArtRow,forestGalMissingArtRow} from './forest-gal-remaining-contract.js';
import {forestGalReuseArtRow} from './forest-gal-reuse-contract.js';
import {forestGalStatefulArtRow} from './forest-gal-stateful-contract.js';
import {FOREST_GAL_SAFE_ENVIRONMENT_CONTRACT} from './forest-gal-safe-environment-contract.js';
import {forestStoryLocationPresentation,forestStoryLocationForTurn,forestStoryLocationPortraitAllowed} from './forest-gal-story-locations.js';
import {forestReviewedEnvironment,forestReviewedActorArt} from './forest-gal-art-policy.js';
import {FOREST_STORY_CONTENT} from '../campaigns/b/story/content.js';
import {FOREST_CAST_ART} from './forest-cast-art.js';
import {FOREST_GAL_BACKGROUND_CONTRACT,FOREST_GAL_CG_CONTRACT,forestGalExactArtRow} from './forest-gal-cg-contract.js';
import {FOREST_GAL_ASSETS,FOREST_GAL_BACKDROP,FOREST_GAL_CAST,FOREST_GAL_CGS,FOREST_GAL_SAFE_ENVIRONMENTS,FOREST_GAL_STATEFUL_ENVIRONMENTS} from './forest-gal-assets.js';
const urlFor=art=>new URL('../../'+art.file,import.meta.url).href;
const bindings=new WeakMap(),casts=new WeakMap();
// A resolved historical queue need not have scene.regionId. The authored turn's
// location wins; old stage-less queues may resolve location from the source only.
export function forestGalBackdrop(scene,turn){
 const source=FOREST_STORY_CONTENT.scenes[scene?.sceneId],stage=turn?.stage;
 const locationId=stage?.locationId??source?.regionId??null;
 const regionId=typeof locationId==='string'?locationId.match(/^B-\d{2}(?=\.|$)/)?.[0]??null:null;
 const backdropAssetId=stage?.backdropAssetId??scene?.backdropAssetId??source?.backdropAssetId??null;
 const expected={b01_enter:'B_ENV_01:enter',b01_pre:'B_ENV_01:pre',b01_post:'B_ENV_01:post'}[scene?.sceneId];
 const locationArt=forestStoryLocationPresentation({sceneId:scene?.sceneId,turn,locationId,backdropAssetId});
 const reviewed=locationArt??forestReviewedEnvironment({sceneId:scene?.sceneId,locationId,backdropAssetId,turnId:turn?.id});
 const environmentContract=reviewed?.presentation==='object-insert'?null:forestGalExactArtRow(FOREST_GAL_SAFE_ENVIRONMENT_CONTRACT,scene,turn);
 const candidate=reviewed?.asset??(locationId==='B-01'&&expected&&backdropAssetId===expected?FOREST_GAL_BACKDROP:null);
 const legacyAsset=reviewed?.presentation==='object-insert'||forestGalExactArtRow(FOREST_GAL_BACKGROUND_CONTRACT,scene,turn)?candidate:null;
 const statefulContract=forestGalStatefulArtRow(scene,turn);
 const reuseContract=reviewed?.presentation==='object-insert'?null:forestGalReuseArtRow(scene,turn);
 const remainingContract=reviewed?.presentation==='object-insert'?null:(forestGalRemainingArtRow(scene,turn)??forestGalMissingArtRow(scene,turn));
 const existingAsset=statefulContract?FOREST_GAL_STATEFUL_ENVIRONMENTS[statefulContract.stateKey]:environmentContract?FOREST_GAL_SAFE_ENVIRONMENTS[environmentContract.assetId]:reuseContract?FOREST_GAL_ASSETS.find(asset=>asset.id===reuseContract.assetId):remainingContract?FOREST_GAL_ASSETS.find(asset=>asset.id===remainingContract.assetId):legacyAsset;
 const finalBackgroundContract=existingAsset||reviewed?.presentation==='object-insert'?null:forestGalFinalBackgroundRow(scene,turn);
 const sceneStateContract=existingAsset||finalBackgroundContract||reviewed?.presentation==='object-insert'?null:forestGalSceneStateRow(scene,turn);
 const asset=existingAsset??(sceneStateContract?FOREST_GAL_ASSETS.find(a=>a.id===sceneStateContract.assetId):null)??(finalBackgroundContract?FOREST_GAL_ASSETS.find(a=>a.id===finalBackgroundContract.assetId):null);
 // Keep the original actor/portrait contract separate from background identity.
 return {locationId,regionId,backdropAssetId,asset,presentation:statefulContract||environmentContract||reuseContract||remainingContract||finalBackgroundContract||sceneStateContract?'environment':reviewed?.presentation??'environment',contract:locationArt?.contract??null,statefulContract,environmentContract,reuseContract,remainingContract,finalBackgroundContract,sceneStateContract,semanticLocationId:sceneStateContract?.semanticLocationId??finalBackgroundContract?.semanticLocationId??environmentContract?.semanticLocationId??reuseContract?.semanticLocationId??remainingContract?.semanticLocationId??null};
}
export function forestGalPresentation(scene,turn){
 const environment=forestGalBackdrop(scene,turn),row=forestGalExactArtRow(FOREST_GAL_CG_CONTRACT,scene,turn);
 return row?{...environment,asset:FOREST_GAL_CGS[row.assetId],presentation:'full-frame-cg',cgContract:row,fallback:environment}:environment;
}
export function forestGalActors(turn,locationModel=forestStoryLocationForTurn(turn)){
 const stage=turn?.stage;
 if(locationModel?.presentation==='full-frame-cg')return [];
 if(!stage||stage.camera==='exterior-empty-shot')return [];
 // Never persist a previous actor set, infer a hero, use an offscreen voice, or
 // turn an unapproved winter fullbody into an interior costume substitute.
 if(stage.winterClothing)return [];
 // Exact story-location rows choose their own body subset; absent reviewed bust
 // assets never fall through to an unrelated standing sprite. Future approved
 // busts must provide explicit asset descriptors and a per-turn actor allowlist.
 const body=locationModel?.contract?.body;
 if(body&&(body.mode==='empty'||!body.reviewedAssets.length))return [];
 return Object.entries(stage.actors??{}).filter(([id])=>FOREST_GAL_CAST[id]&&!stage.offscreen?.[id]&&(!body||(body.actorIds.includes(id)&&locationModel.contract.nearActorIds.includes(id)&&!locationModel.contract.distantActorIds.includes(id)&&!locationModel.contract.offscreenActorIds.includes(id)))).map(([id,placement])=>({id,art:body?body.reviewedAssets.find(art=>art.characterId===id)??null:forestReviewedActorArt(id,turn),position:placement.position??'',speaking:turn.portrait===id&&stage.portraitAllowed!==false})).filter(actor=>actor.art);
}
// Stable stage geography: a change of speaker never swaps actors' sides.
// Only explicit horizontal positions are honored; prose staging is not guessed.
export function forestGalComposition(visible){
 const count=visible.length,positions=count===1?[50]:count===2?[30,73]:[22,49,79];
 const original=visible.map((actor,index)=>({left:23,center:50,right:77})[actor.position]??positions[index]??50);
 // Halve center-to-center gaps, recenter the group, never resize the artwork.
 const midpoint=(Math.min(...original)+Math.max(...original))/2;
 return visible.map((actor,index)=>({id:actor.id,slot:index,
  left:count>1?50+(original[index]-midpoint)/2:original[index],
  depth:count===1?'near':count===2?(index===0?'near':'far'):index===1?'near':index===0?'middle':'far'
 }));
}
function invalidateImage(image){bindings.delete(image);image.onload=null;image.onerror=null;image.hidden=true;image.removeAttribute('src');}
function bindImage(image,art,onStatus=()=>{}){
 const url=art?urlFor(art):null;let binding=bindings.get(image);
 const update=()=>{if(bindings.get(image)!==binding)return;image.hidden=binding.status!=='ready';image.dataset.assetStatus=binding.status;onStatus(binding.status);};
 if(binding?.url===url){binding.notify=onStatus;image.hidden=binding.status!=='ready';onStatus(binding.status);return binding;}
 binding={url,status:art?'loading':'unavailable',notify:onStatus};bindings.set(image,binding);image.onload=null;image.onerror=null;update();
 if(!art){image.removeAttribute('src');return binding;}
 const settle=status=>{if(bindings.get(image)!==binding||binding.status!=='loading')return;binding.status=status;image.hidden=status!=='ready';image.dataset.assetStatus=status;if(status==='failed'){image.onload=null;image.onerror=null;image.removeAttribute('src');}binding.notify(status);};
 image.onload=()=>settle(image.naturalWidth===art.width&&image.naturalHeight===art.height?'ready':'failed');image.onerror=()=>settle('failed');image.src=url;if(image.complete)image.onload();return binding;
}
export function presentForestGal({backdrop,actors,portrait,label,stage,dialog},scene,turn){
 const model=forestGalPresentation(scene,turn);
 const showBackdrop=(current)=>{
  stage.dataset.artPresentation=current.presentation;if(dialog)dialog.dataset.artPresentation=current.presentation;
  const labelText=current.asset?.label??'南坡村口 · 雨后暖林';
  backdrop.alt=current.asset?(current.asset.alt??'雨后的南坡村口：滴雨屋檐、歪石阶与通往暖林村落的坡路'):'';
  bindImage(backdrop,current.asset,status=>{
   if(status==='failed'&&current.presentation==='full-frame-cg'){
    // Re-resolve this immutable turn's environment; never use the preceding CG.
    // Keep its bodies and portrait cleared even if only the CG image failed.
    showBackdrop(model.fallback);return;
   }
   stage.dataset.artStatus=status;label.textContent=status==='ready'?labelText:status==='loading'?`${labelText} · 背景载入中`:status==='failed'?`${labelText} · 背景加载失败`:'本区背景待制作';
  });
 };
 showBackdrop(model);
 const visible=['object-insert','full-frame-cg'].includes(model.presentation)?[]:forestGalActors(turn,model);let cast=casts.get(actors);if(!cast){cast=new Map();casts.set(actors,cast);}
 const wanted=new Set(visible.map(a=>a.id));for(const[id,entry]of cast)if(!wanted.has(id)){invalidateImage(entry.image);cast.delete(id);}
 for(const actor of visible){let entry=cast.get(actor.id);if(!entry){const image=document.createElement('img');image.className='story-actor';image.alt=actor.art.name;image.dataset.characterId=actor.id;image.draggable=false;entry={image};cast.set(actor.id,entry);}entry.image.dataset.speaking=String(actor.speaking);entry.image.dataset.position=actor.position;bindImage(entry.image,actor.art);}
 for(const placement of forestGalComposition(visible)){const image=cast.get(placement.id).image;image.dataset.slot=String(placement.slot);image.dataset.depth=placement.depth;image.style.left=`${placement.left}%`;}
 const images=visible.map(actor=>cast.get(actor.id).image);if(images.length!==actors.children.length||images.some((image,i)=>actors.children[i]!==image))actors.replaceChildren(...images);
 actors.dataset.count=String(visible.length);actors.dataset.hasSpeaker=String(visible.some(a=>a.speaking));
 const permitted=!['object-insert','full-frame-cg'].includes(model.presentation)&&forestStoryLocationPortraitAllowed(model,turn)&&turn.stage?.portraitAllowed!==false&&!turn.stage?.offscreen?.[turn.portrait];const face=forestMothPortrait(scene,turn)??(permitted?FOREST_CAST_ART[turn.portrait]??forestReviewedPortrait(scene,turn):null);
 portrait.dataset.portraitCrop=face?.crop??'';
 bindImage(portrait,face);portrait.alt=face?face.name:'';portrait.dataset.characterId=face?(turn.portrait??'cedar-crown-moth') :'';
 return model;
}
export function clearForestGal({backdrop,actors,portrait,stage,dialog}){
 invalidateImage(backdrop);invalidateImage(portrait);for(const entry of casts.get(actors)?.values()??[])invalidateImage(entry.image);casts.delete(actors);actors.replaceChildren();actors.dataset.count='0';actors.dataset.hasSpeaker='false';portrait.dataset.characterId='';portrait.dataset.portraitCrop='';stage.dataset.artStatus='inactive';stage.dataset.artPresentation='environment';if(dialog)dialog.dataset.artPresentation='environment';
}
