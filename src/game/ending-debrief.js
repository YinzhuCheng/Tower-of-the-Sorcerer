/** Deterministic post-clear story variant. The ending reflects choices that
 * already mattered in play: optional bond routes and the ally who actually
 * carried the council through. No score, stat or replay state is changed. */

import { getAllianceBond, isAllianceBonded } from './alliance-bonds.js';
import { getSelectedAct3Charter, isAct3CharterCompleted } from './act3-charters.js';
import { getSelectedAct3Handoff } from './act3-handoff-priorities.js';
import { getHiddenWitnessEnding } from './hidden-witnesses.js';

const SURVIVOR_ENDINGS = Object.freeze({
  milu: Object.freeze({
    title: '月镜仍亮着',
    text: '米露把月镜留在入口。新的守护术会先写明风险，再由同行者决定是否启用。'
  }),
  lanin: Object.freeze({
    title: '潮汐先响起',
    text: '澜音让高压术式先发出预告。危险仍在，但不再毫无提示。'
  }),
  yanli: Object.freeze({
    title: '赤焰留下裂口',
    text: '焰璃留下的裂印让封印可以被记录、检查，也可以被撤销。'
  }),
  yayu: Object.freeze({
    title: '影线公开准则',
    text: '鸦羽把影线接进公开档案。以后谁能改写规则，一眼就能查到。'
  })
});

export function getEndingDebrief(state) {
  const survivors = state?.council?.outcome?.survivors ?? [];
  const survivor = survivors[0] ?? null;
  const survivorId = survivor?.id ?? null;
  const bond = survivorId ? getAllianceBond(survivorId) : null;
  const bondedSurvivor = survivorId ? isAllianceBonded(state, survivorId) : false;
  const completedBonds = Object.entries(state?.alliance?.bonds ?? {})
    .filter(([, completed]) => completed === true)
    .map(([id]) => getAllianceBond(id))
    .filter(Boolean);
  const activatedRules = [...(state?.council?.outcome?.modifiers?.labels ?? [])];
  const charter = getSelectedAct3Charter(state);
  const charterCompleted = charter ? isAct3CharterCompleted(state, charter.id) : false;
  const handoff = getSelectedAct3Handoff(state);
  const hiddenWitness = getHiddenWitnessEnding(state);
  const finaleRules = Object.freeze([
    ...activatedRules,
    ...(charterCompleted && charter?.finale?.label ? [charter.finale.label] : []),
    ...(handoff?.finale?.label ? [handoff.finale.label] : [])
  ]);

  const charterEpilogue = charterCompleted ? {
    shelter: {
      title: '夜航仍亮着',
      text: '米露把夜航护送印挂回灯塔入口。每段危险路程和同行者都被清楚写下。'
    },
    audit: {
      title: '每一页都能被改正',
      text: '校验簿留在工作台上。错误能被看见，也能被改正。'
    },
    relay: {
      title: '灯塔接力',
      text: '接力电容拆成许多小灯，交给夜班、巡路人和信使。求援不再只能等一个人回应。'
    }
  }[charter.id] : null;

  if (charterEpilogue) {
    return Object.freeze({
      kind: `act3-${charter.id}`,
      title: charterEpilogue.title,
      text: charterEpilogue.text,
      survivorName: survivor?.name ?? null,
      bondTitle: null,
      completedBondCount: completedBonds.length,
      completedCharter: charter.title,
      activatedRules: finaleRules,
      hiddenWitness
    });
  }

  if (bondedSurvivor && SURVIVOR_ENDINGS[survivorId]) {
    const variant = SURVIVOR_ENDINGS[survivorId];
    return Object.freeze({
      kind: 'bonded-survivor',
      title: variant.title,
      text: variant.text,
      survivorName: survivor.name,
      bondTitle: bond?.title ?? null,
      completedBondCount: completedBonds.length,
      completedCharter: null,
      activatedRules: finaleRules,
      hiddenWitness
    });
  }

  return Object.freeze({
    kind: 'open-future',
    title: '仍在练习的自由',
    text: survivor
      ? `${survivor.name}带着会战留下的伤势离开王座。新的规则还在被一条条写下。`
      : '王座崩解后，璃没有留下新的命令。新的规则还在被一条条写下。',
    survivorName: survivor?.name ?? null,
    bondTitle: null,
    completedBondCount: completedBonds.length,
    completedCharter: null,
    activatedRules: finaleRules,
    hiddenWitness
  });
}
