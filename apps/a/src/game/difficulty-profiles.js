import { PROFILES } from './difficulty-session.js';
import { hashValue } from '../solver/state.js';
const applied = new WeakMap();
export const profileDataChecksum = data => hashValue({ floors: data.FLOORS, enemies: data.ENEMIES, items: data.ITEMS, shop: data.SHOP_OPTIONS });
export function applyDifficultyProfile(data, id) {
  const profile = Object.hasOwn(PROFILES, id) ? PROFILES[id] : null;
  if (!profile) throw Error('Unknown difficulty profile');
  const previous = applied.get(data.ENEMIES);
  if (previous) {
    if (previous !== id || profileDataChecksum(data) !== profile.dataChecksum) throw Error('Difficulty cannot change in an existing document');
    return Object.freeze({ applied: false, profile });
  }
  if (data.FLOORS.length !== 30 || profileDataChecksum(data) !== PROFILES.classic.dataChecksum) throw Error('Difficulty baseline mismatch');
  if (data.ENEMIES.manaSentinel.atk !== 290 || data.ENEMIES.prismArchivist.magicPower !== 155 || data.ITEMS.act3Hp.hp !== 6200 || data.ITEMS.act3Hp.maxHp !== 6200) throw Error('Difficulty mutation precondition failed');
  const protectedEnemy = id => data.ENEMIES[id].boss || data.ENEMIES[id].finalBoss || data.FLOORS.some(f => (f.exitGuardians ?? []).includes(id));
  if (protectedEnemy('manaSentinel') || protectedEnemy('prismArchivist')) throw Error('Protected enemy cannot be adjusted');
  if (id === 'forgiving') { data.ENEMIES.manaSentinel.atk = 280; data.ENEMIES.prismArchivist.magicPower = 135; }
  if (id === 'challenge') { data.ITEMS.act3Hp.hp = 5950; data.ITEMS.act3Hp.maxHp = 5950; data.ITEMS.act3Hp.description = '生命上限与当前生命 +5950。'; }
  if (profileDataChecksum(data) !== profile.dataChecksum) throw Error('Difficulty result mismatch');
  applied.set(data.ENEMIES, id);
  return Object.freeze({ applied: true, profile });
}
