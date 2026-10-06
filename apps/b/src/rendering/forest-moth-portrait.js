import {readForestTurnSnapshot} from '../campaigns/b/story/state-snapshot.js';
import {NEW_MONSTER_REVISION} from '../campaigns/b/story/monster-identity.js';
import {forestStoryTextSha256} from './forest-gal-story-locations.js';
// A new main-story review scope; isolated preview metadata remains untouched.
export const FOREST_MOTH_PORTRAIT=Object.freeze({id:'B_MOTH_DIALOGUE_NEUTRAL',name:'缚杉冠蛾',file:'assets/moth-preview/BBOSS-001_anthro-avatar_v3-style.png',sha256:'cd921b34a9c704e30f63fbfc4409eaf62208996f7a3958e2a7f138959454d50e',width:1254,height:1254});
export const FOREST_MOTH_FACE_TURNS=Object.freeze(['B.MON.R1.moth.before.03','B.MON.R1.moth.before.06','B.MON.R1.moth.after.02']);
export function forestMothPortrait(scene,turn){
 if(!FOREST_MOTH_FACE_TURNS.includes(turn?.id)||scene?.monsterStoryRevision!==NEW_MONSTER_REVISION||turn.monsterStoryRevision!==NEW_MONSTER_REVISION)return null;
 const row={'B.MON.R1.moth.before.03':['b06_moth_before','310c6bb09d5b36df9edd6599ddae3344be81dad459b3bc0eb63ef59aaf3d8bfe'],'B.MON.R1.moth.before.06':['b06_moth_before','6682c4d081950067d8a63b0abf3c5eca1bd9c3e120f4d7afae631a82a7c131c5'],'B.MON.R1.moth.after.02':['b06_moth_after','7a16bda4f82e0b592d73cfb050788543dbacd2a319a9d1c5dd74bacc1265c30b']}[turn.id],s=turn.stage;
 if(!row||scene.sceneId!==row[0]||forestStoryTextSha256(turn.text)!==row[1]||turn.speaker!=='冠蛾'||turn.sourceLine!==0||turn.branch!=='common'||turn.phase!=null||turn.kind!=null||turn.portrait!==null||turn.monsterForm!=='anthro'||!s||s.locationId!=='B-06'||s.backdropAssetId!=='B_ENV_06:moth'||s.camera!=='scene'||s.monsterForm!=='anthro'||s.portraitAllowed!==false||s.winterClothing||!s.actors||Object.keys(s.actors).length||Object.keys(s.offscreen??{}).length)return null;
 const snapshot=readForestTurnSnapshot(turn,{sceneId:scene.sceneId});
 return snapshot?.monsterStoryRevision===NEW_MONSTER_REVISION?FOREST_MOTH_PORTRAIT:null;
}
