import {createBossPresentationRegistry} from '../vendor/dual-form/boss-presentation.mjs';
import {PRODUCTION_CONTRACT} from './contract-data.mjs';
const freeze=value=>{if(value&&typeof value==='object'){for(const v of Object.values(value))freeze(v);Object.freeze(value);}return value;};
export const PORTRAIT=freeze({
 assetId:'BBOSS-001-anthro-avatar-v3-style-preview',enemyId:'b06.sideTender',
 identityRef:{designId:'BBOSS-001',formId:'BBOSS-001-ANTHRO',revision:2},
 role:'portrait',view:'neutral',file:'BBOSS-001_anthro-avatar_v3-style.png',
 sha256:'cd921b34a9c704e30f63fbfc4409eaf62208996f7a3958e2a7f138959454d50e',
 mime:'image/png',width:1254,height:1254,
 previewOnly:true,productionReady:false,productionTopMargin:'HOLD',
 topMarginPixels:12,bottomCrop:'intentional portrait framing',
 safeCrop:{x:0,y:0,width:1254,height:1254},
});
// The frozen production manifest is not changed to READY. This adapter is
// deliberately preview-specific; it never exports a replacement game manifest.
export function createPreviewPortraitRegistry(){
 const production=createBossPresentationRegistry(PRODUCTION_CONTRACT);
 return Object.freeze({productionReport:production.report,resolve(request){
  const baseline=production.resolve(request);
  if(baseline.status!=='HOLD'||!baseline.selection||request.role!=='portrait'||request.view!=='neutral'||!['before','after'].includes(request.phase)||baseline.selection.identityRef.formId!==PORTRAIT.identityRef.formId)return baseline;
  return freeze({status:'READY',selection:baseline.selection,asset:PORTRAIT,url:new URL('../../../assets/moth-preview/'+PORTRAIT.file,import.meta.url).href,mayRender:false,mayUseLegacyPlaceholder:false,previewOnly:true,productionReady:false});
 }});
}
export const EXPRESSIONS=freeze([
 {id:'neutral',label:'中性'}, {id:'alert',label:'警戒'}, {id:'gentle-smile',label:'缓和微笑'},
]);
export const PORTRAITS=freeze({
 neutral:PORTRAIT,
 alert:{...PORTRAIT,assetId:'BBOSS-001-expression-alert-preview',file:'BBOSS-001_anthro-expression_alert_v1.png',sha256:'0d0a39076f2dc72efbcc0e7de134e650499b856f04d1db5bf1df32c352758fac',expressionId:'alert',topMarginPixels:11},
 'gentle-smile':{...PORTRAIT,assetId:'BBOSS-001-expression-gentle-smile-preview',file:'BBOSS-001_anthro-expression_gentle-smile_v1.png',sha256:'75f289406330052eb970d3d0eaad6863d1bc872672b35ad434833bf1d966fc1e',expressionId:'gentle-smile',topMarginPixels:11},
});
export const STANDING=freeze({
 assetId:'BBOSS-001-anthro-standing-v2-preview',enemyId:'b06.sideTender',
 identityRef:{designId:'BBOSS-001',formId:'BBOSS-001-ANTHRO',revision:2},
 role:'dialogue-standing',view:'neutral',file:'BBOSS-001_anthro-standing_v2.png',
 sha256:'0494a03a02eb3f401145a479f8f6f5cdbfd5939760c6cb7a03eb3be54e72e8ed',
 mime:'image/png',width:1024,height:1536,previewOnly:true,productionReady:false,
 sourcePadding:'HOLD_NATIVE_TEN_PERCENT',layout:'complete-image-contain-with-external-padding',
 expressionId:'neutral-fixed',safeCrop:{x:0,y:0,width:1024,height:1536},
});
export function createPreviewArtRegistry(expressionId='neutral'){
 if(!Object.hasOwn(PORTRAITS,expressionId))throw new Error('Unknown preview expression');
 const production=createBossPresentationRegistry(PRODUCTION_CONTRACT);
 return Object.freeze({productionReport:production.report,resolve(request){
  const baseline=production.resolve(request);
  if(baseline.status!=='HOLD'||!baseline.selection||!['portrait','dialogue-standing'].includes(request.role)||request.view!=='neutral'||!['before','after'].includes(request.phase)||baseline.selection.identityRef.formId!==PORTRAIT.identityRef.formId)return baseline;
  const asset=request.role==='portrait'?PORTRAITS[expressionId]:STANDING;
  return freeze({status:'READY',selection:baseline.selection,asset,url:new URL('../../../assets/moth-preview/'+asset.file,import.meta.url).href,mayRender:false,mayUseLegacyPlaceholder:false,previewOnly:true,productionReady:false});
 }});
}
