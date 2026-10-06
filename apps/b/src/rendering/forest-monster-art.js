import {NEW_MONSTER_REVISION,forestMonsterArtIdentity} from '../campaigns/b/story/monster-identity.js';
// Only the four exact new-story entities. Never upgrade a legacy or unknown save.
export const FOREST_MONSTER_BODY_ASSETS=Object.freeze([{"id": "BMON-001", "entityId": "b06.sawPuppet", "regionId": "B-06", "kind": "enemy", "file": "assets/forest-entity-art/BMON-001_amber-seed-shell_fullbody_v4-frame.png", "sha256": "a7bc5f467f4fa7ee5680b0fd904071f6d6be9bfac27b4f01c343e75fa3c72e68", "width": 1254, "height": 1254, "sourcePath": "monster-art-20261005/04_cg/working/BMON-001_amber-seed-shell_fullbody_v4-frame.png", "presentation": "dom-tile-contain"}, {"id": "BMON-002", "entityId": "b05.sluicePuppet", "regionId": "B-05", "kind": "enemy", "file": "assets/forest-entity-art/BMON-002_mirrorfin-creek-newt_fullbody_v2.png", "sha256": "6e0ba397cbb8701d049a7d51a58bb279fa9f1f72118f197b095a4f2fd27f45ec", "width": 1254, "height": 1254, "sourcePath": "monster-art-20261005/04_cg/working/BMON-002_mirrorfin-creek-newt_fullbody_v2.png", "presentation": "dom-tile-contain"}, {"id": "BMON-003", "entityId": "b11.returnPuppet", "regionId": "B-11", "kind": "enemy", "file": "assets/forest-entity-art/BMON-003_splitstone-horn-badger_fullbody_v2.png", "sha256": "03aad2822c577a7fbc68359f0cb103e3063b4e0729f55768b6cbeea3771eaedd", "width": 1254, "height": 1254, "sourcePath": "monster-art-20261005/04_cg/working/BMON-003_splitstone-horn-badger_fullbody_v2.png", "presentation": "dom-tile-contain"}, {"id": "BBOSS-001", "entityId": "b06.sideTender", "regionId": "B-06", "kind": "enemy", "file": "assets/forest-entity-art/BBOSS-001_cedar-crown-moth_fullbody_v5-antenna.png", "sha256": "9cdec045b81f878f52c2dfd21033f74ea858b67bfa3cf8a4a72570f415c8f872", "width": 1254, "height": 1254, "sourcePath": "monster-art-20261005/04_cg/working/BBOSS-001_cedar-crown-moth_fullbody_v5-antenna.png", "presentation": "dom-tile-contain"}].map(Object.freeze));
export function forestMonsterBodyArt(entity,regionId,identity,role='world'){
 if(!entity||entity.kind!=='enemy'||entity.completed||!['world','action','combat'].includes(role))return null;
 const expected=forestMonsterArtIdentity(entity.id,NEW_MONSTER_REVISION,{role});
 if(!identity||!expected||identity.monsterStoryRevision!==NEW_MONSTER_REVISION||identity.entityId!==entity.id||identity.form!=='beast'||identity.visualId!==expected.visualId||identity.role!==role)return null;
 return FOREST_MONSTER_BODY_ASSETS.find(a=>a.entityId===entity.id&&a.regionId===regionId)??null;
}
export function appendForestMonsterBody(node,entity,regionId,identity,role='world'){
 const art=forestMonsterBodyArt(entity,regionId,identity,role);if(!art)return null;
 const image=(node.ownerDocument??document).createElement('img');image.className=`forest-monster-body forest-monster-${role}`;image.dataset.entityArt=art.id;image.alt='';image.setAttribute('aria-hidden','true');image.draggable=false;image.hidden=true;
 let settled=false;
 image.onload=()=>{if(settled)return;settled=true;image.hidden=image.naturalWidth!==art.width||image.naturalHeight!==art.height;if(!image.hidden&&role==='world')node.classList.add('has-monster-body');};
 image.onerror=()=>{settled=true;image.hidden=true;if(role==='world')node.classList.remove('has-monster-body');};
 image.src=new URL('../../'+art.file,import.meta.url).href;node.append(image);return art;
}
