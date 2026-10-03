/** The stand-alone reader is a labelled example route, never a game save.
 * Its finite scene table establishes only presentation facts. No caller game
 * object, resource, seen marker, or localStorage entry is read or written. */
import { getRecommendedWarCouncilPlan } from './war-council.js';
export const GAL_PREVIEW_ORDER = Object.freeze([
  'prologue',
  'floor2', 'bossCatPreDemo', 'bossCatPostDemo', 'bossFoxPreDemo', 'bossFoxPostDemo',
  'floor3', 'floor4',
  'floor5', 'bossWhalePreDemo', 'bossWhalePostDemo', 'bossSwordPreDemo', 'bossSwordPostDemo', 'bossDragonPreDemo', 'bossDragonPostDemo',
  'floor6', 'floor7', 'bossAstralPreDemo', 'bossAstralPostDemo', 'bossShadowPreDemo', 'bossShadowPostDemo',
  'floor8', 'bossPalacePreDemo', 'bossPalacePostDemo',
  'floor9', 'bossBlackSealPreDemo', 'bossBlackSealPostDemo',
  'floor10', 'bossQueenPreDemo', 'queenPhaseDemo', 'bossQueenPostDemo',
  'floor11', 'floor12', 'floor13', 'floor14', 'floor15', 'floor16', 'floor17', 'floor18',
  'floor19', 'bossEchoRegentPost',
  'floor20', 'warCouncil', 'bossArcaneSovereignPost', 'bossOriginCorePost',
  'floor21', 'floor22', 'floor23', 'floor24', 'floor25', 'floor26', 'floor27', 'floor28', 'floor29',
  'floor30', 'bossArchiveWardenPost', 'ending'
]);
const POST_BOSSES = Object.freeze({ bossCatPostDemo: 'catBoss', bossFoxPostDemo: 'foxBoss', bossWhalePostDemo: 'whaleBoss', bossSwordPostDemo: 'swordBoss', bossDragonPostDemo: 'dragonBoss', bossAstralPostDemo: 'astralBoss', bossShadowPostDemo: 'shadowBoss' });
let councilExample = null;
export function createGalPreviewStoryState(sceneId) {
  const at = GAL_PREVIEW_ORDER.indexOf(sceneId);
  // Optional bond previews occur before the council. Retained legacy scenes
  // are never in the canonical reader, but can still be inspected separately.
  const before = at >= 0 ? GAL_PREVIEW_ORDER.slice(0, at + 1) : [];
  const defeatedBossIds = before.map(id => POST_BOSSES[id]).filter(Boolean);
  if (/^bond/.test(sceneId)) defeatedBossIds.push(...Object.values(POST_BOSSES));
  const state = {
    cores: defeatedBossIds.length,
    floorStates: [{ defeatedBossIds }],
    alliance: { bonds: {} },
    council: { completed: false, plan: null, outcome: null }
  };
  if (at > GAL_PREVIEW_ORDER.indexOf('warCouncil')) {
    councilExample ??= getRecommendedWarCouncilPlan(state);
    if (councilExample) state.council = { completed: true, plan: structuredClone(councilExample.plan), outcome: structuredClone(councilExample) };
  }
  return state;
}
