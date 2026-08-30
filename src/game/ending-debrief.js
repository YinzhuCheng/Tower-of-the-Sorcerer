/** Deterministic post-clear story variant. The ending reflects choices that
 * already mattered in play: optional bond routes and the ally who actually
 * carried the council through. No score, stat or replay state is changed. */

import { getAllianceBond, isAllianceBonded } from './alliance-bonds.js';

const SURVIVOR_ENDINGS = Object.freeze({
  milu: Object.freeze({
    title: '月镜议席',
    text: '米露把曾用来记录牺牲的月镜改成公开议席：任何守护术启动前，承担风险的人都能看见并提出异议。'
  }),
  lanin: Object.freeze({
    title: '潮汐预唱法案',
    text: '澜音让每一道高压术式先响起预告。危险没有被抹去，但再也不会以“来不及说明”为理由降临。'
  }),
  yanli: Object.freeze({
    title: '赤焰裂印协议',
    text: '焰璃留下的裂印成为第一条新规则：再紧急的封印也必须允许被记录、复核与撤销。'
  }),
  yayu: Object.freeze({
    title: '影线公开准则',
    text: '鸦羽把所有隐藏授权的影线接到公开档案。反制不再依赖某个英雄的秘密，而成为每个人都能查验的权利。'
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

  if (bondedSurvivor && SURVIVOR_ENDINGS[survivorId]) {
    const variant = SURVIVOR_ENDINGS[survivorId];
    return Object.freeze({
      kind: 'bonded-survivor',
      title: variant.title,
      text: variant.text,
      survivorName: survivor.name,
      bondTitle: bond?.title ?? null,
      completedBondCount: completedBonds.length,
      activatedRules: Object.freeze(activatedRules)
    });
  }

  return Object.freeze({
    kind: 'open-future',
    title: '仍在练习的自由',
    text: survivor
      ? `${survivor.name}带着会战留下的伤势离开王座。新的规则尚未成熟，但它们会从公开、质问与一次次被修正中生长出来。`
      : '王座崩解后，璃没有留下新的命令。新的规则尚未成熟，但它们会从公开、质问与一次次被修正中生长出来。',
    survivorName: survivor?.name ?? null,
    bondTitle: null,
    completedBondCount: completedBonds.length,
    activatedRules: Object.freeze(activatedRules)
  });
}
