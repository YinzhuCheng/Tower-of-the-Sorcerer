import {createVoyageSpec} from '../campaigns/c/content.js';
import {createCampaign} from '../core/campaign.js';
import {stableStringify} from '../solver/state.js';
import {profileById, PROFILE_REGISTRY} from './registry.js';
export const canonicalJson = stableStringify;
export function createProfileRuntime(id) {
  const profile=profileById(id);
  if(!profile)throw Error('未支持的难度档案；未启动游戏');
  const spec=createVoyageSpec();
  // Fail closed if the frozen source baseline changes in a future edit.
  if(stableStringify(createCampaign(spec).identity)!==stableStringify(PROFILE_REGISTRY.baselineIdentity))throw Error('STANDARD 基线身份不匹配');
  for(const enemyId of ['c.machine1','c.machine2']) {
    const enemy=spec.regions.flatMap(region=>region.entities).find(entity=>entity.id===enemyId);
    if(enemy?.kind!=='enemy')throw Error('巡逻机档案不匹配');
    enemy.enemy.atk+=profile.delta;
  }
  spec.difficulty=profile.difficultyId;
  spec.version=profile.identity.contentVersion;
  const runtime=createCampaign(spec);
  if(stableStringify(runtime.identity)!==stableStringify(profile.identity))throw Error('难度档案身份或内容校验不匹配');
  return runtime;
}
export async function verifyProfileRuntime(runtime,profile,{crypto:crypt=globalThis.crypto}={}) {
  if(!crypt?.subtle)throw Error('当前环境无法校验难度内容，请使用支持安全校验的浏览器');
  const digest=await crypt.subtle.digest('SHA-256',new TextEncoder().encode(canonicalJson(runtime.spec)));
  const sha=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(sha!==profile.canonicalSpecSha256)throw Error('难度档案 SHA-256 不匹配；未启动游戏');
  return runtime;
}
