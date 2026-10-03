import {FOREST_STORY_CONTENT} from '../campaigns/b/story/content.js';
import {FOREST_CAST_ART} from './forest-cast-art.js';
import {FOREST_GAL_BACKDROP,FOREST_GAL_CAST} from './forest-gal-assets.js';
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
 const asset=locationId==='B-01'&&expected&&backdropAssetId===expected?FOREST_GAL_BACKDROP:null;
 return {locationId,regionId,backdropAssetId,asset};
}
export function forestGalActors(turn){
 const stage=turn?.stage;
 if(!stage||stage.camera==='exterior-empty-shot')return [];
 // Never persist a previous actor set, infer a hero, use an offscreen voice, or
 // turn an unapproved winter fullbody into an interior costume substitute.
 if(stage.winterClothing)return [];
 return Object.entries(stage.actors??{}).filter(([id])=>FOREST_GAL_CAST[id]&&!stage.offscreen?.[id]).map(([id,placement])=>({id,art:FOREST_GAL_CAST[id],position:placement.position??'',speaking:turn.portrait===id&&stage.portraitAllowed!==false}));
}
function invalidateImage(image){bindings.delete(image);image.onload=null;image.onerror=null;image.hidden=true;image.removeAttribute('src');}
function bindImage(image,art,onStatus=()=>{}){
 const url=art?urlFor(art):null;let binding=bindings.get(image);
 const update=()=>{if(bindings.get(image)!==binding)return;image.hidden=binding.status!=='ready';image.dataset.assetStatus=binding.status;onStatus(binding.status);};
 if(binding?.url===url){binding.notify=onStatus;image.hidden=binding.status!=='ready';onStatus(binding.status);return binding;}
 binding={url,status:art?'loading':'unavailable',notify:onStatus};bindings.set(image,binding);image.onload=null;image.onerror=null;update();
 if(!art){image.removeAttribute('src');return binding;}
 const settle=status=>{if(bindings.get(image)!==binding)return;binding.status=status;image.hidden=status!=='ready';image.dataset.assetStatus=status;binding.notify(status);};
 image.onload=()=>settle(image.naturalWidth===art.width&&image.naturalHeight===art.height?'ready':'failed');image.onerror=()=>settle('failed');image.src=url;if(image.complete)image.onload();return binding;
}
export function presentForestGal({backdrop,actors,portrait,label,stage},scene,turn){
 const model=forestGalBackdrop(scene,turn);
 bindImage(backdrop,model.asset,status=>{stage.dataset.artStatus=status;label.textContent=status==='ready'?'南坡村口 · 雨后暖林':status==='loading'?'南坡村口 · 背景载入中':status==='failed'?'南坡村口 · 背景加载失败':'本区背景待制作';});
 backdrop.alt=model.asset?'雨后的南坡村口：滴雨屋檐、歪石阶与通往暖林村落的坡路':'';
 const visible=forestGalActors(turn);let cast=casts.get(actors);if(!cast){cast=new Map();casts.set(actors,cast);}
 const wanted=new Set(visible.map(a=>a.id));for(const[id,entry]of cast)if(!wanted.has(id)){invalidateImage(entry.image);cast.delete(id);}
 for(const actor of visible){let entry=cast.get(actor.id);if(!entry){const image=document.createElement('img');image.className='story-actor';image.alt=actor.art.name;image.dataset.characterId=actor.id;image.draggable=false;entry={image};cast.set(actor.id,entry);}entry.image.dataset.speaking=String(actor.speaking);entry.image.dataset.position=actor.position;bindImage(entry.image,actor.art);}
 visible.forEach((actor,i)=>{const image=cast.get(actor.id).image;image.dataset.slot=String(i);image.style.left=`${visible.length===1?50:visible.length===2?27+i*46:18+i*64/(visible.length-1)}%`;});
 const images=visible.map(actor=>cast.get(actor.id).image);if(images.length!==actors.children.length||images.some((image,i)=>actors.children[i]!==image))actors.replaceChildren(...images);
 let listener=0;for(const actor of visible)cast.get(actor.id).image.dataset.mobileSlot=actor.speaking?'speaker':String(listener++);
 actors.dataset.count=String(visible.length);actors.dataset.hasSpeaker=String(visible.some(a=>a.speaking));
 const permitted=turn.stage?.portraitAllowed!==false&&!turn.stage?.offscreen?.[turn.portrait];const face=permitted?FOREST_CAST_ART[turn.portrait]??null:null;
 bindImage(portrait,face);portrait.alt=face?face.name:'';portrait.dataset.characterId=face?turn.portrait:'';
 return model;
}
export function clearForestGal({backdrop,actors,portrait,stage}){
 invalidateImage(backdrop);invalidateImage(portrait);for(const entry of casts.get(actors)?.values()??[])invalidateImage(entry.image);casts.delete(actors);actors.replaceChildren();stage.dataset.artStatus='inactive';
}
