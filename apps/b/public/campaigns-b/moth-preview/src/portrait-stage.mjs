import {createBossPresentationGate} from '../vendor/dual-form/boss-presentation.mjs';
import {createVerifiedAssetLoader} from '../vendor/dual-form/verified-asset-loader.mjs';
import {createPreviewArtRegistry,PORTRAITS} from './portrait-contract.mjs';
import {portraitRequestForTurn} from './preview-model.mjs';

export function createBrowserDependencies(window){
 return {
  fetchAsset:(url,options)=>window.fetch(url,{...options,credentials:'omit',mode:'same-origin',redirect:'error'}),
  sha256:async bytes=>Array.from(new Uint8Array(await window.crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join(''),
  async decode(bytes,mime){
   const url=window.URL.createObjectURL(new window.Blob([bytes],{type:mime})),image=new window.Image();
   try{image.src=url;await image.decode();return {image:{src:url,dispose:()=>window.URL.revokeObjectURL(url)},width:image.naturalWidth,height:image.naturalHeight};}
   catch(error){window.URL.revokeObjectURL(url);throw error;}
  }
 };
}
// Existing compact img node is kept; standing uses a separate preview-only
// frame. No combat, storage, session, campaign or save dependency is accepted.
export function createMothPortraitStage(nodes,{dependencies}={}){
 const {portrait,actors,backdrop,label,stage,dialog,standing,largePortrait}=nodes;
 let ticket=0,currentKey=null,pending=Promise.resolve(),disposed=false,gate=null;
 const resources=new Set();
 function newGate(expressionId){return createBossPresentationGate(createPreviewArtRegistry(expressionId),async(asset,url)=>{
  const generation=ticket,decoded=new Set();
  const managed={...dependencies,async decode(bytes,mime){
   const result=await dependencies.decode(bytes,mime);
   if(result?.image)decoded.add(result.image);
   if(disposed||generation!==ticket)throw new Error('Superseded preview image');
   return result;
  }};
  try{const result=await createVerifiedAssetLoader(managed)(asset,url);if(disposed||generation!==ticket)throw new Error('Superseded preview image');for(const resource of decoded)resources.add(resource);return result;}
  catch(error){for(const resource of decoded)resource.dispose?.();throw error;}
 });}
 gate=newGate('neutral');
 function release(){for(const resource of resources)resource.dispose?.();resources.clear();}
 function conceal(status='inactive'){
  for(const image of [portrait,standing,largePortrait].filter(Boolean)){image.hidden=true;image.removeAttribute('src');image.alt='';image.dataset.characterId='';image.dataset.expressionId='';image.dataset.assetStatus=status;}
  backdrop.hidden=true;backdrop.removeAttribute('src');actors.replaceChildren();actors.dataset.count='0';actors.dataset.hasSpeaker='false';
  stage.dataset.artPresentation='portrait-preview';dialog.dataset.artPresentation='portrait-preview';stage.dataset.artStatus=status;
 }
 function setStatus(status){for(const image of [portrait,standing,largePortrait].filter(Boolean))image.dataset.assetStatus=status;stage.dataset.artStatus=status;label.textContent=status==='ready'?'已接入头像与中性全身 · 整图缩放':status==='loading'?'美术校验与解码中':status==='failed'?'美术加载失败 · 不显示替代图':'此句只显示文字 · 不借用其他角色美术';}
 function clear(){ticket++;currentKey=null;gate.invalidate();conceal();release();setStatus('inactive');}
 function fail(){ticket++;currentKey=null;gate.invalidate();conceal('failed');release();setStatus('failed');}
 function present(scene,turn,{expressionId='neutral'}={}){
  if(disposed)return Promise.resolve({status:'disposed'});
  const request=scene?.turns?.some(t=>t.id===turn?.id&&JSON.stringify(t)===JSON.stringify(turn))?portraitRequestForTurn(turn):null;
  if(!Object.hasOwn(PORTRAITS,expressionId)){clear();setStatus('failed');return Promise.resolve({status:'failed',reason:'Unknown preview expression'});}
  const key=request?JSON.stringify([request,expressionId]):null;
  if(key&&key===currentKey)return pending;
  clear();if(!request)return Promise.resolve({status:'inactive'});
  currentKey=key;gate=newGate(expressionId);const ownGate=gate,ownTicket=ticket;
  const requests=[request,...(standing?[{...request,role:'dialogue-standing'}]:[])];
  conceal('loading');setStatus('loading');
  pending=(async()=>{
   const result=await ownGate.preload(requests);
   if(disposed||ownTicket!==ticket||ownGate!==gate)return {status:'superseded'};
   if(result.status!=='ready'){fail();return result;}
   try{
   const renders=requests.flatMap(r=>{
    const handle=ownGate.getHandle(r),ready=ownGate.get(handle);
    if(!ready)throw new Error('Missing verified render handle');
    const targets=r.role==='portrait'?[portrait,largePortrait].filter(Boolean):[standing];
    return targets.map(image=>({image,handle,ready}));
   });
    await Promise.all(renders.map(async({image,ready})=>{image.src=ready.image.src;await image.decode();}));
    if(disposed||ownTicket!==ticket||ownGate!==gate||renders.some(({handle})=>!ownGate.get(handle)))return {status:'superseded'};
    for(const {image,ready} of renders)if(image.naturalWidth!==ready.asset.width||image.naturalHeight!==ready.asset.height)throw new Error('Displayed dimensions mismatch');
    for(const {image,ready} of renders){image.alt=ready.asset.role==='dialogue-standing'?'缚杉冠蛾拟人形态，中性表情完整全身':'缚杉冠蛾拟人头像：'+expressionId;image.dataset.characterId='BBOSS-001-ANTHRO';image.dataset.expressionId=ready.asset.role==='dialogue-standing'?'neutral-fixed':expressionId;image.hidden=false;}
    setStatus('ready');return {status:'ready'};
   }catch(error){if(disposed||ownTicket!==ticket)return {status:'superseded'};fail();return {status:'failed',reason:String(error.message)};}
  })();return pending;
 }
 return Object.freeze({present,clear,snapshot:()=>({...gate.snapshot(),displayStatus:portrait.dataset.assetStatus}),dispose(){if(disposed)return;clear();disposed=true;}});
}
