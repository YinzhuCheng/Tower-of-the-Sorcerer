/** Accepted GAL identities only; forest sets/CGs remain semantic asset IDs.
 * A winter exterior NEVER falls back to the characters' light-clothes art. */
import { FOREST_STORY_CONTENT as C } from './content.js';
export const FOREST_CAST=Object.freeze(C.cast);
export const FOREST_ASSET_POLICY=Object.freeze({status:'awaiting-forest-art-validation',allowLegacyBackdropFallback:false,allowImplicitHero:false,backgroundUrl:null,cgUrl:null,characterResolver:'src/game/anime-portraits.js#dialoguePresentation',winterPolicy:'interior-closeup, dressing-sound and exterior-empty-shot; winter fullbody requires separate approval'});
export function forestTurnStage(sceneId,turn,state) {
  const source=C.scenes[sceneId],n=Number(sceneId.slice(1,3)),line=turn.sourceLine;
  let locationId=source.regionId,backdropAssetId=source.backdropAssetId,cgAssetId=null,camera='scene',actors={},offscreen={},portraitAllowed=true;
  // Explicit cast derived from each frozen scene, never an implicit protagonist.
  const cast=[...new Set(source.turns.map(t=>t.portrait).filter(Boolean))];
  for(const id of cast)actors[id]={position:'scene-'+id};
  if(sceneId.startsWith('b20_')){delete actors.final_queen;offscreen.final_queen='B-03.fixed-speaking-tube';}
  if(sceneId==='b25_noctia'||sceneId==='b25_exit'||sceneId==='b26_review'||sceneId==='b26_noctia')locationId='B-03';
  if(sceneId==='b14_greenhouse')locationId='B-14.riverbank-greenhouse';
  if(sceneId==='b16_exit')locationId='B-17.greenhouse-door';
  if(sceneId==='b22_after')offscreen.guide='B-22.watermark-table';
  if(sceneId==='b30_enter'){
    if(line<1829){actors={};camera='exterior-empty-shot';portraitAllowed=false;locationId='B-30.village-roots';}
    else{actors={final_queen:{position:'window'},cat_boss:{position:'door'}};camera='interior-closeup';locationId='B-29.home';}
  }
  if(n===30&&sceneId.includes('_heat_')){
    camera='winter-interior-closeup';
    if(sceneId==='b30_heat_partial'){
      const b=turn.branch;
      locationId=b.startsWith('greenhouse')?'B-17':b.startsWith('pear')?'B-18':b.startsWith('lodge')?'B-19':'B-03';
      if(b.startsWith('pear')){actors={};camera='exterior-empty-shot';portraitAllowed=false;offscreen={hero:'winter-clothed-outside-frame',guide:'winter-clothed-outside-frame'};}
    }else{
      if(sceneId==='b30_heat_greenhouse_lodge'){
        locationId=line<1851?'B-17':line<1853?'B-19':'B-18';
        actors=line<1851?{fox_boss:{position:'greenhouse-inner-room'}}:{};
      }
      if(sceneId==='b30_heat_greenhouse_pear'){
        locationId=line<1879?'B-18':line<1887?'B-19':line<1895?'B-18':'B-03';
        actors=line>=1879&&line<1887?{hero:{position:'lodge-door'},cat_boss:{position:'ordinary-stove'}}:{};
      }
      if(sceneId==='b30_heat_lodge_pear'){
        locationId=line===1913?'B-18':'B-17';
        actors={hero:{position:'greenhouse-outer-room'},guide:{position:'greenhouse-outer-room'},fox_boss:{position:'specimen-table'}};
      }
      const exterior=sceneId==='b30_heat_greenhouse_lodge'?line>=1853:sceneId==='b30_heat_greenhouse_pear'?(line<1879||line>=1887&&line<1895):line===1913;
      if(exterior){actors={};camera='exterior-empty-shot';portraitAllowed=false;offscreen={hero:'winter-clothed-outside-frame',guide:'winter-clothed-outside-frame'};}
    }
    backdropAssetId=`B_ENV_${locationId.slice(2,4)}:winter-${turn.branch==='common'?sceneId.replace('b30_heat_',''):turn.branch}`;
  }
  if(sceneId==='b30_relationship_offer'||sceneId.startsWith('b30_end_')){
    locationId='B-30.shawu-room';camera='interior-closeup';actors={hero:{position:'door'},guide:{position:'map-table'}};
    if(sceneId==='b30_end_together'&&line>=1991&&line<1997){locationId='B-30.departure-road';actors={};offscreen={hero:'winter-clothed-outside-frame',guide:'winter-clothed-outside-frame',cat_boss:'doorway-offscreen'};portraitAllowed=false;camera='exterior-empty-shot';}
    if(sceneId==='b30_end_together'&&line>=1997){locationId='B-14.inn-table';if(line===2009){actors={};portraitAllowed=false;camera='exterior-empty-shot';locationId='B-30.winter-village';}}
    if(sceneId==='b30_end_two_ends'&&line>=2039){locationId=line<2047?'B-14.riverbank-greenhouse':'B-14.inn-table';}
    cgAssetId=sceneId==='b30_relationship_offer'?null:`B_CG_${sceneId}:approved-canon-interior`;
  }
  if(sceneId==='b07_choice'&&turn.branch==='root')cgAssetId='B_CG_B07:hand-on-fixed-root-before-public-works';
  if(sceneId==='b29_home')cgAssetId='B_CG_B29:own-room-open-window';
  if(offscreen[turn.portrait])portraitAllowed=false;
  return {locationId,actors,offscreen,camera,portraitAllowed,backdropAssetId,cgAssetId,assetStatus:'pending-validation',clearActors:true,allowImplicitHero:false,allowLegacyBackdropFallback:false,backgroundUrl:null,cgUrl:null,winterClothing:n===30?'worn-outside-not-rendered-in-unapproved-art':null};
}
