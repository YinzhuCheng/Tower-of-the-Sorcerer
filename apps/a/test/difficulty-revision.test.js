import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assemble30 } from './helpers/assemble-thirty.mjs';
import { PROFILES, LEGACY_PROFILES, profileIdentity, parseProfileSave } from '../src/game/difficulty-session.js';
import { applyDifficultyProfile, profileDataChecksum } from '../src/game/difficulty-profiles.js';
import { difficultyStorageKeys, inspectDifficultyStorage, createDifficultyPersistence } from '../src/game/difficulty-storage.js';
import { legacyForgivingExports } from '../src/game/difficulty-entry.js';
const data = assemble30();
const { createInitialState } = await import('../src/game/engine.js');
const base = createInitialState();
const stateFor = id => ({ ...structuredClone(base), profileIdentity: profileIdentity(id) });
const memory = seed => {
  const map = new Map(Object.entries(seed ?? {}));
  return { map, get length() { return map.size; }, key: i => [...map.keys()][i] ?? null, getItem: k => map.get(k) ?? null, setItem(k,v) { map.set(k,String(v)); } };
};
const locks = { request: (name, options, fn) => fn() };
const controller = (storage,id) => createDifficultyPersistence(storage,id,undefined,{ locks });
const prefix = 'lost-magic-tower:demo-30f-afterlight-registry-v1';

test('three new-game profiles with one resume-only compatibility record', () => {
  assert.deepEqual(Object.keys(PROFILES), ['forgiving','classic','challenge']);
  assert.deepEqual(Object.keys(LEGACY_PROFILES), ['forgiving-r1']);
  assert.equal(LEGACY_PROFILES['forgiving-r1'].resumeOnly, true);
});
test('classic, challenge and archived forgiving retain their original exact identities', () => {
  for (const [id, profileId, hash] of [['classic','classic','bce284f9326a5f58'],['challenge','challenge','731b5e972791ef4d'],['forgiving-r1','forgiving','6f9bbbad0bb58045']]) {
    assert.deepEqual(profileIdentity(id), {format:'tower-profile-identity-v1',campaignId:'demo-30f-afterlight-registry-v1',profileId,candidateVersion:'tower-three-tiers-r1',contentHash:hash,gameVersion:10});
  }
  assert.deepEqual(profileIdentity('forgiving'), {format:'tower-profile-identity-v1',campaignId:'demo-30f-afterlight-registry-v1',profileId:'forgiving',candidateVersion:'tower-forgiving-r2',contentHash:'52bf838bcf879eb1',gameVersion:10});
});
test('r2 has a new namespace; original keys and writer lock remain exact', () => {
  assert.equal(difficultyStorageKeys('forgiving-r1').auto, `${prefix}:difficulty:forgiving:auto:v1`);
  assert.equal(difficultyStorageKeys('forgiving-r1').manual, `${prefix}:difficulty:forgiving:manual:v1`);
  assert.equal(difficultyStorageKeys('forgiving-r1').backup, `${prefix}:difficulty:forgiving:backup:before-new:v1`);
  assert.equal(difficultyStorageKeys('forgiving').auto, `${prefix}:difficulty:forgiving:revision:r2:auto:v1`);
  assert.equal(difficultyStorageKeys('classic').auto, `${prefix}:auto:v1`);
  assert.equal(difficultyStorageKeys('challenge').auto, `${prefix}:difficulty:challenge:auto:v1`);
  const storage=memory(); let name;
  const old=createDifficultyPersistence(storage,'forgiving-r1',undefined,{locks:{request(n,o,fn){name=n;return fn();}}});
  old.write('auto',stateFor('forgiving-r1'));
  assert.equal(name,`${prefix}:difficulty:forgiving:auto:v1:writer-lock`);
});
test('new and old forgiving differ only in hushCantor magicPower and match frozen checksums', () => {
  const fresh = () => structuredClone({FLOORS:data.FLOORS,ENEMIES:data.ENEMIES,ITEMS:data.ITEMS,SHOP_OPTIONS:data.SHOP_OPTIONS});
  const old=fresh(), current=fresh(); applyDifficultyProfile(old,'forgiving-r1'); applyDifficultyProfile(current,'forgiving');
  assert.equal(old.ENEMIES.hushCantor.magicPower,249); assert.equal(current.ENEMIES.hushCantor.magicPower,199);
  assert.equal(profileDataChecksum(old),'b0feb01841ebb867'); assert.equal(profileDataChecksum(current),'228fcff017b15f83');
  current.ENEMIES.hushCantor.magicPower=249; assert.deepEqual(current,old);
  assert.deepEqual(old.FLOORS,data.FLOORS); assert.deepEqual(old.ITEMS,data.ITEMS); assert.deepEqual(old.SHOP_OPTIONS,data.SHOP_OPTIONS);
  assert.throws(()=>applyDifficultyProfile(old,'forgiving'),/cannot change/);
});
test('old and new saves cannot import into or be serialized as each other', () => {
  for(const [source,target] of [['forgiving-r1','forgiving'],['forgiving','forgiving-r1']]) {
    const save=stateFor(source); assert.throws(()=>parseProfileSave(JSON.stringify(save),target),/身份不匹配/);
    assert.throws(()=>controller(memory(),target).serialize(save),/身份不匹配/);
  }
});
test('new r2 starts and writes without touching any original tier or old backup bytes', () => {
  const seed={ unrelated:'keep' };
  for(const id of ['classic','challenge','forgiving-r1']) {
    const keys=difficultyStorageKeys(id),raw='  '+JSON.stringify(stateFor(id))+'\n';
    seed[keys.auto]=raw; seed[keys.manual]=raw; seed[keys.backup+':frozen']='unknown-backup-bytes';
  }
  const storage=memory(seed), current=controller(storage,'forgiving'); current.prepareNew(); current.write('auto',stateFor('forgiving')); current.write('manual',stateFor('forgiving'));
  for(const [key,raw] of Object.entries(seed)) assert.equal(storage.getItem(key),raw,key);
});
test('legacy mode forbids new-game overwrite while preserving ordinary same-version save writes', () => {
  const raw=' '+JSON.stringify(stateFor('forgiving-r1'))+'\n',keys=difficultyStorageKeys('forgiving-r1'),storage=memory({[keys.auto]:raw});
  const old=controller(storage,'forgiving-r1'),before=[...storage.map]; assert.throws(()=>old.prepareNew(),/不能新建或覆盖/); assert.deepEqual([...storage.map],before);
  const state=stateFor('forgiving-r1'); state.turns=1; old.write('manual',state); assert.equal(storage.getItem(keys.auto),raw);
  assert.equal(JSON.parse(storage.getItem(keys.manual)).profileIdentity.contentHash,'6f9bbbad0bb58045');
});
test('corrupt, future, foreign or extra-metadata legacy saves remain exact exports; valid fallback is read-only', () => {
  const valid=stateFor('forgiving-r1'),future=structuredClone(valid); future.profileIdentity.candidateVersion='future';
  const extra=structuredClone(valid); extra.futureMetadata={untrusted:true};
  for(const bad of ['{bad',JSON.stringify(future),JSON.stringify(stateFor('forgiving')),JSON.stringify(extra)]) {
    const keys=difficultyStorageKeys('forgiving-r1'),good=' '+JSON.stringify(valid)+'\n',storage=memory({[keys.auto]:bad,[keys.manual]:good}),before=[...storage.map];
    const result=legacyForgivingExports(storage); assert.equal(result.snapshot.blocked,true); assert.equal(result.snapshot.hasSave,true);
    assert.equal(result.exports.find(s=>s.slot==='auto').raw,bad); assert.equal(result.exports.find(s=>s.slot==='manual').raw,good);
    const old=controller(storage,'forgiving-r1'); assert.equal(old.readOnly,true); assert.equal(old.read('manual'),good); assert.throws(()=>old.write('manual',valid));
    const current=controller(storage,'forgiving'); current.prepareNew(); current.write('auto',stateFor('forgiving'));
    for(const [k,v] of before)assert.equal(storage.getItem(k),v);
  }
});
test('legacy backups remain exportable when there is no active old save, including unknown containers', () => {
  const keys=difficultyStorageKeys('forgiving-r1'),raw=' \n'+JSON.stringify(stateFor('forgiving-r1'))+'\n';
  const archive=JSON.stringify({format:'tower-before-new-backup-v1',identity:profileIdentity('forgiving-r1'),savedAt:'2026-10-05T00:00:00.000Z',auto:raw,manual:null});
  const storage=memory({[keys.backup+':1']:archive,[keys.backup+':2']:'future container',unrelated:'x'}),before=[...storage.map],result=legacyForgivingExports(storage);
  assert.equal(result.snapshot.hasSave,false); assert.equal(result.exports.length,2); assert.ok(result.exports.some(s=>s.raw===raw)); assert.ok(result.exports.some(s=>s.raw==='future container'));
  assert.deepEqual([...storage.map],before);
});
test('resume-only session admission validates original identity before configuring', async () => {
  const api=await import('../src/game/difficulty-session.js?revision-admission');
  assert.throws(()=>api.configureDifficultySession({profileId:'forgiving-r1',mode:'new'}),/仅用于继续/);
  assert.throws(()=>api.configureDifficultySession({profileId:'forgiving-r1',mode:'continue',serialized:JSON.stringify(stateFor('forgiving'))}),/身份不匹配/);
  assert.throws(()=>api.configureDifficultySession({profileId:'forgiving-r1',mode:'continue'}));
  assert.equal(api.getDifficultySession(),null);
  const session=api.configureDifficultySession({profileId:'forgiving-r1',mode:'continue',serialized:JSON.stringify(stateFor('forgiving-r1'))});
  assert.equal(session.profile.resumeOnly,true); assert.equal(session.identity.contentHash,'6f9bbbad0bb58045');
});
for(const scenario of ['empty','legacy-continue','legacy-export','current-new','legacy-corrupt','legacy-url','cancel-new','cancel-pending']) {
  test(`entry behavior: ${scenario}`, () => {
    const result=spawnSync(process.execPath,[fileURLToPath(new URL('./helpers/difficulty-entry-scenario.mjs',import.meta.url)),scenario],{encoding:'utf8'});
    assert.equal(result.status,0,result.stdout+result.stderr);
  });
}
