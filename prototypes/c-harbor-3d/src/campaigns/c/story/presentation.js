/** Pure C-world presentation metadata. Accepted character identities only.
 * Harbor environments/CGs stay semantic IDs until the art review accepts files.
 * Callers MUST NOT apply legacy A floor-number/backdrop/hero-always-present fallbacks.
 */
import { VOYAGE_STORY_CONTENT } from './content.js';

export const VOYAGE_CAST = Object.freeze(VOYAGE_STORY_CONTENT.cast);
export const VOYAGE_ASSET_POLICY = Object.freeze({
  status:'awaiting-harbor-art-validation', allowLegacyBackdropFallback:false,
  allowImplicitHero:false, backgroundUrl:null, cgUrl:null,
  characterResolver:'src/game/anime-portraits.js#dialoguePresentation'
});
const actors = (pairs) => Object.fromEntries(pairs.map(([id,position])=>[id,{position}]));
const aboard = [['hero','deck-stern'],['guide','deck-helm'],['sword_boss','deck-helm-side']];
const far = [['hero','far-lamp-work-area'],['guide','far-lamp-work-area'],['whale_boss','far-lamp-work-area']];
const assets = {
  front:'C_ENV_M01:dusk-loaded-front', near:'C_ENV_M01:night-near-on-far-off-holding',
  deck:'C_ENV_D01:center-cargo-sailing', empty:'C_ENV_D01:empty-balanced-davit-stowed',
  far:'C_ENV_M05:far-off-ready-berth', room:'C_ENV_M05:low-room-installation',
  lit:'C_ENV_M05:both-on-first-inner-ferry'
};

export function voyageTurnStage(sceneId, turn, state, options={}) {
  const line=turn.sourceLine;
  let locationId=VOYAGE_STORY_CONTENT.scenes[sceneId].regionId;
  let assetId=VOYAGE_STORY_CONTENT.scenes[sceneId].backdropAssetId;
  let present=aboard, offscreen={}, cgAssetId=null;
  switch(sceneId) {
    case 'c01': present=[['hero','front-dock'],['merchant','loaded-deck']]; break;
    case 'c02': present=[...aboard,['cat_boss','front-dock-signals']]; break;
    case 'c03': present=[...aboard,['merchant','deck-ballast']]; break;
    case 'c04': offscreen={merchant:'C-M01.frontDock',cat_boss:'C-M01.nearLamp'};break;
    case 'c05': case 'c06':
      present=[['hero','safe-quay'],['guide','deck-small-hold'],['sword_boss','safe-quay']];
      if(state?.cleared?.includes('c.machine1')) assetId='C_ENV_M02:collected-machine-cleared-short';
      else if(state?.flags?.['c.bolts']) assetId='C_ENV_M02:collected-machine-present-bypass';
      break;
    case 'c07': cgAssetId='C_CG_C07:independent-mooring';break;
    case 'c08':
      present=[['hero','deck-winch'],['guide','deck-fixed-observer'],['sword_boss','shore-lock']];
      assetId=line<419?'C_ENV_M03:arrival-cargo-center':line<447?'C_ENV_M03:gate-closed-cargo-left-balanced':'C_ENV_M03:gate-open-side-pocket-cargo-left';
      cgAssetId='C_CG_C08:separate-shore-and-deck-stations';break;
    case 'c09':
      assetId=state?.boat?.cargo==='center'?'C_ENV_M03:gate-open-cargo-center-before-departure':'C_ENV_M03:gate-open-side-pocket-cargo-left';
      if(turn.branch==='short') present=[['hero','shore-machine2'],['guide','moored-deck-helm'],['sword_boss','shore-loose-panel']];
      break;
    case 'c12': present=[['hero','deck-stern'],['guide','deck-helm'],['sword_boss','near-lamp-stairs'],['cat_boss','near-lamp-doorway']]; break;
    case 'c13':
      if(line<667) {locationId='C-M04.nearLampDoor';present=[['cat_boss','near-lamp-doorway'],['sword_boss','near-lamp-doorway']];offscreen={hero:'C-D01.deck',guide:'C-D01.deck'};}
      else {present=[['hero','deck-stern'],['guide','deck-helm'],['sword_boss','shore-gangway']];offscreen={cat_boss:'C-M04.nearLampWindow'};}
      break;
    case 'c14':
      present=line<733?[['hero','deck-stern'],['guide','deck-helm'],['sword_boss','shore-last-line']]:[['hero','deck-stern'],['guide','deck-helm']];
      offscreen=line<733?{cat_boss:'C-M04.nearLampWindow'}:{sword_boss:'C-M04.nearLampWindow',cat_boss:'C-M01.ferryViaShorePath'};
      assetId=line<733?'C_ENV_M04:final-line-handoff':'C_ENV_M04:boat-left-selena-window-milu-returns';
      cgAssetId=line<733?'C_CG_C14:last-line-from-shore':null;break;
    case 'c15':
      present=[['hero','deck-stern'],['guide','deck-helm'],['whale_boss','far-inner-berth-bollards']];
      offscreen={sword_boss:'C-M04.nearLamp',cat_boss:'C-M01.ferry',merchant:'C-M01.frontDock'};break;
    case 'c16':
      present=line<819?[['hero','deck-guide-rope'],['guide','deck-hand-winch'],['whale_boss','shore-landing-area']]:far;
      locationId=line<819?'C-M05.innerBerth':'C-M05.shortRollway';
      assetId=line<803?'C_ENV_M05:right-cargo-hoist':line<809?'C_ENV_M05:crate-ashore-sling-slack':'C_ENV_M05:empty-balanced-davit-stowed';break;
    case 'c17': locationId='C-M05.lowLampRoom';present=far;break;
    case 'c18':
      if(line===875) {locationId='C-M04.nearLamp';present=[['sword_boss','near-lamp-work-signal']];assetId=assets.near;}
      else if(line<889 || line>=917) {locationId='C-M01.ferry';present=[['cat_boss','ferry-rope'],['merchant','ferry-safe-side']];assetId=line>=917?'C_ENV_M01:night-two-on-inner-release':assets.near;}
      else {locationId='C-M05.lowLampRoom';present=line<915?far:[['hero','far-lamp-window'],['guide','far-lamp-duty']];assetId=assets.lit;if(line>=915)offscreen.whale_boss='C-M05.restRoom';}
      break;
    case 'c19':
      assetId=assets.lit;locationId='C-M05.lowLampRoom';present=[['hero','far-lamp-window'],['guide','far-lamp-duty']];offscreen.whale_boss='C-M05.restRoom';
      if(turn.branch==='bow'&&line>=969&&line<977) {locationId='C-M05.restRoomDoor';present=[['hero','rest-room-door'],['whale_boss','rest-room-stool']];offscreen={guide:'C-M05.lowLampRoom'};}
      if(turn.branch==='bow'&&line>=977) {locationId='C-D01.bowAtM05';present=[['hero','empty-deck-bow']];offscreen={guide:'C-M05.lowLampRoom',whale_boss:'C-M05.restRoom'};assetId=assets.empty;cgAssetId='C_CG_C19:empty-bow-two-lights';}
      break;
    case 'c20':
      present=[['hero','front-dock-gangway'],['merchant','empty-deck']];
      if(line>=1005)present.push(['cat_boss','front-dock']);
      if(line>=1009)present.push(['sword_boss','front-dock']);
      offscreen={guide:'C-M05.sleepingAfterNightShift',whale_boss:'C-M05.dayDuty'};
      break;
  }
  return {locationId,actors:actors(present),offscreen,backdropAssetId:assetId,cgAssetId,
    assetStatus:'pending-validation',clearActors:true,allowImplicitHero:false,
    allowLegacyBackdropFallback:false,backgroundUrl:null,cgUrl:null};
}
