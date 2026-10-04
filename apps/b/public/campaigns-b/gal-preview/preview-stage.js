import {CENWEI_CONTENT} from './cenwei-content.js';
import {CENWEI_ART_BINDINGS} from './cenwei-art-contract.js';
import {FOREST_CAST_ART} from '../../src/rendering/forest-cast-art.js';
import {FOREST_GAL_STORY_LOCATIONS} from '../../src/rendering/forest-gal-assets.js';
import {forestStoryTextSha256} from '../../src/rendering/forest-gal-story-locations.js';

// Exact R5 asset descriptors, kept private to this read-only entry. The ordinary
// game's character table and story registry are never extended by this module.
export const PREVIEW_PORTRAIT=Object.freeze({name:'岑苇',file:'assets/forest-canonical/cenwei-japanese-vn-r3.png',sha256:'d6aaf1450ebdfbd14f0d8bf56b292e9e063df0e50d1ce971fbfdeb2605480c6e',width:1254,height:1254});
export const PREVIEW_FOREST=Object.freeze({id:'B_ENV_06',file:'assets/forest-gal/environments/b06-cenwei-neutral.webp',sha256:'452934f5565e4f8f728d19b3eeffd232754c6dba10f483bf1f7f5295c922db79',width:1536,height:1024,label:'杉林歇脚处 · 中性空景',alt:'雨后的杉林与林边歇脚空地，静态背景没有人物、圆篓、小兽或布卷；对白中的动作仅由文字叙述'});
const portraits=Object.freeze({hero:FOREST_CAST_ART.hero,guide:FOREST_CAST_ART.guide,forest_cenwei:PREVIEW_PORTRAIT});
const rows=new Map(CENWEI_ART_BINDINGS.map(row=>[row.id,row])),bindings=new WeakMap();
const urlFor=art=>new URL('../../'+art.file,import.meta.url).href;
export function cenweiPreviewBackdrop(scene,turn){
 const source=CENWEI_CONTENT.scenes[scene?.sceneId],row=rows.get(turn?.id),original=source?.turns.find(t=>t.id===turn?.id);
 if(!row||!original||row.sceneId!==scene.sceneId||scene.backdropAssetId!==row.backdropAssetId)return null;
 for(const key of ['id','sourceLine','branch','speaker','portrait','kind'])if(turn[key]!==row[key])return null;
 if((turn.phase??null)!==row.phase||turn.text!==original.text||forestStoryTextSha256(turn.text)!==row.textSha256)return null;
 const stage=turn.stage;
 if(!stage||stage.locationId!==row.locationId||stage.backdropAssetId!==row.backdropAssetId||stage.camera!==row.camera||stage.winterClothing||Object.keys(stage.actors??{}).length)return null;
 return row.assetId==='B_ENV_06'?PREVIEW_FOREST:FOREST_GAL_STORY_LOCATIONS.B_ENV_05;
}
function clearImage(image){bindings.delete(image);image.onload=null;image.onerror=null;image.hidden=true;image.removeAttribute('src');image.dataset.assetStatus='inactive';}
// Same identity-guarded image lifecycle as the frozen shared GAL stage, narrowed
// to a neutral backdrop and one speaking avatar; there is no actor/body layer.
function bindImage(image,art,onStatus=()=>{}){
 const url=art?urlFor(art):null;let binding=bindings.get(image);
 if(binding?.url===url){binding.notify=onStatus;image.hidden=binding.status!=='ready';onStatus(binding.status);return;}
 binding={url,status:art?'loading':'unavailable',notify:onStatus};bindings.set(image,binding);image.onload=null;image.onerror=null;image.hidden=true;image.dataset.assetStatus=binding.status;onStatus(binding.status);
 if(!art){image.removeAttribute('src');return;}
 const settle=status=>{if(bindings.get(image)!==binding)return;binding.status=status;image.hidden=status!=='ready';image.dataset.assetStatus=status;binding.notify(status);};
 image.onload=()=>settle(image.naturalWidth===art.width&&image.naturalHeight===art.height?'ready':'failed');image.onerror=()=>settle('failed');image.src=url;if(image.complete)image.onload();
}
export function presentCenweiPreview({backdrop,actors,portrait,label,stage,dialog},scene,turn){
 const asset=cenweiPreviewBackdrop(scene,turn);stage.dataset.artPresentation=asset?'story-location':'environment';dialog.dataset.artPresentation=stage.dataset.artPresentation;
 bindImage(backdrop,asset,status=>{stage.dataset.artStatus=status;label.textContent=asset?(status==='ready'?asset.label:status==='loading'?asset.label+' · 背景载入中':asset.label+' · 背景加载失败'):'本句仅以文字呈现';});backdrop.alt=asset?.alt??'';
 actors.replaceChildren();actors.dataset.count='0';actors.dataset.hasSpeaker='false';
 const source=CENWEI_CONTENT.scenes[scene?.sceneId],original=source?.turns.find(t=>t.id===turn?.id);
 const valid=original&&['id','sourceLine','branch','speaker','portrait','kind','text'].every(key=>original[key]===turn[key]);
 const face=valid&&turn.stage?.portraitAllowed!==false?portraits[turn.portrait]??null:null;
 bindImage(portrait,face);portrait.alt=face?.name??'';portrait.dataset.characterId=face?turn.portrait:'';
 return asset;
}
export function clearCenweiPreview({backdrop,actors,portrait,stage,dialog}){clearImage(backdrop);clearImage(portrait);portrait.dataset.characterId='';actors.replaceChildren();stage.dataset.artStatus='inactive';stage.dataset.artPresentation='environment';dialog.dataset.artPresentation='environment';}
