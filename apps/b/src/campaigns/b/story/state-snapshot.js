// Immutable presentation evidence only. Never migrates queues or reads live state on replay.
import {LEGACY_MONSTER_REVISION,NEW_MONSTER_REVISION,FOREST_MONSTER_TEXT,forestMonsterTurn} from './monster-identity.js';
import {forestMonsterSceneSource} from './monster-scenes.js';
import { FOREST_STORY_CONTENT as C } from './content.js';
import { LEGACY_OPENING_SCENES, LEGACY_OPENING_REVISION, NEW_OPENING_REVISION } from './opening-revision.js';
import { forestStoryTextSha256 as sha256 } from '../../../rendering/forest-gal-story-locations.js';
import { FOREST_STORY_SOURCE_HASH,FOREST_MONSTER_SOURCE_HASH,FOREST_MONSTER_PREVIOUS_SOURCE_HASH } from './source-manifest.js';
export { FOREST_STORY_SOURCE_HASH } from './source-manifest.js';
const validated=new WeakSet();
const trusted=s=>{freeze(s);validated.add(s);return s;};
const sites=['07','16','21','24'],routeKeys=['originalCleared','originalWorksDone','rootFixed','rootWorksDone'];
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export function captureForestStoryFacts(runtime,state){
 runtime.assertValidState(state);
 return freeze({revision:state.revision,stateHash:runtime.stateHash(state),
  routes:Object.fromEntries(sites.map(site=>[site,Object.fromEntries(routeKeys.map(key=>[key,state.flags[`b${site}.${key}`]===true]))])),
  warm:{...Object.fromEntries(['greenhouse','pear','lodge'].map(key=>[key,state.flags[`b.warm.${key}`]===true])),frozen:state.flags['b26.heatPlanFrozen']===true}});
}
export function captureForestTurnSnapshot({facts,sceneId,turn,authoredTurn,openingRevision,monsterStoryRevision=LEGACY_MONSTER_REVISION,reviewMode=false}){
 return trusted({schemaVersion:1,origin:reviewMode?'review':'runtime-resolve',...structuredClone(facts),
  storyVersion:C.id,openingRevision,...(monsterStoryRevision===NEW_MONSTER_REVISION?{monsterStoryRevision,constructionHash:FOREST_MONSTER_SOURCE_HASH}:{}),sourceHash:FOREST_STORY_SOURCE_HASH,sceneId,turnId:turn.id,sourceLine:turn.sourceLine,
  branch:turn.branch,phase:turn.phase??null,authoredTextSha256:sha256(authoredTurn.text),resolvedTextSha256:sha256(turn.text),adaptationId:turn.boundaryAdaptation?.id??null});
}
// null means unknown/HOLD, not false. Unknown versions are left untouched in storage.
// Optional sceneId lets a future resolver also verify the containing scene identity.
export function readForestTurnSnapshot(turn,{sceneId}={}){
 const s=turn?.storySnapshot;
 if(!s||s.schemaVersion!==1||!['runtime-resolve','review'].includes(s.origin)||!Number.isInteger(s.revision)||s.revision<0||typeof s.stateHash!=='string'||!s.stateHash)return null;
 if(s.storyVersion!==C.id||s.sourceHash!==FOREST_STORY_SOURCE_HASH||![LEGACY_OPENING_REVISION,NEW_OPENING_REVISION].includes(s.openingRevision))return null;
 if(sceneId!==undefined&&s.sceneId!==sceneId)return null;
 const monsterRevision=s.monsterStoryRevision??LEGACY_MONSTER_REVISION;
 if(![LEGACY_MONSTER_REVISION,NEW_MONSTER_REVISION].includes(monsterRevision))return null;
 if(monsterRevision===NEW_MONSTER_REVISION&&![FOREST_MONSTER_SOURCE_HASH,FOREST_MONSTER_PREVIOUS_SOURCE_HASH].includes(s.constructionHash))return null;
 if(monsterRevision===NEW_MONSTER_REVISION&&s.constructionHash===FOREST_MONSTER_PREVIOUS_SOURCE_HASH&&s.adaptationId==='B-EDGE-003')return null;
 if(typeof s.sceneId!=='string'||(!Object.hasOwn(C.scenes,s.sceneId)&&!forestMonsterSceneSource(s.sceneId,monsterRevision)))return null;
 const source=forestMonsterSceneSource(s.sceneId,monsterRevision)??(s.openingRevision===LEGACY_OPENING_REVISION&&Object.hasOwn(LEGACY_OPENING_SCENES,s.sceneId)?LEGACY_OPENING_SCENES[s.sceneId]:null)??C.scenes[s.sceneId];
 const authored=Array.isArray(source?.turns)?source.turns.find(t=>t.id===turn.id):null;
 if(!authored||s.turnId!==turn.id||s.sourceLine!==turn.sourceLine||s.branch!==turn.branch||s.phase!==(turn.phase??null))return null;
 if(s.sourceLine!==authored.sourceLine||s.branch!==authored.branch||s.phase!==(authored.phase??null))return null;
 if(!hash(s.authoredTextSha256)||s.authoredTextSha256!==sha256(authored.text)||!hash(s.resolvedTextSha256)||typeof turn.text!=='string'||s.resolvedTextSha256!==sha256(turn.text))return null;
 if(turn.monsterStoryRevision!==undefined&&turn.monsterStoryRevision!==monsterRevision)return null;
 if(monsterRevision===NEW_MONSTER_REVISION&&(Object.hasOwn(FOREST_MONSTER_TEXT,turn.id)||forestMonsterSceneSource(s.sceneId,monsterRevision))&&s.adaptationId===null&&turn.text!==forestMonsterTurn(authored,monsterRevision).text)return null;
 if(s.adaptationId!==(turn.boundaryAdaptation?.id??null)||!(s.adaptationId===null||typeof s.adaptationId==='string'))return null;
 if(!sites.every(site=>routeKeys.every(key=>typeof s.routes?.[site]?.[key]==='boolean'))||!['greenhouse','pear','lodge','frozen'].every(key=>typeof s.warm?.[key]==='boolean'))return null;
 // Return a frozen copy: callers cannot mutate the saved evidence through this API.
 return trusted(structuredClone(s));
}
// Only captured or read-validated objects are accepted; JSON copies must pass the reader.
// This is a facts classifier, NOT an art approval. Exact text/stage review remains required.
export function forestRouteVisualState(snapshot,site){
 if(!snapshot||!validated.has(snapshot)||snapshot.schemaVersion!==1||snapshot.origin!=='runtime-resolve')return 'unknown';
 const route=snapshot.routes?.[String(site).padStart(2,'0')];
 if(!route||!routeKeys.every(key=>typeof route[key]==='boolean'))return 'unknown';
 const {originalCleared:cleared,originalWorksDone:works,rootFixed:fixed,rootWorksDone:rootWorks}=route;
 if(works&&!cleared||rootWorks&&!fixed)return 'unknown';
 const original=works?'original-ready':cleared?'original-cleared':null,root=rootWorks?'root-ready':fixed?'root-fixed':null;
 return works&&rootWorks?'both':[original,root].filter(Boolean).join('+')||'none';
}
