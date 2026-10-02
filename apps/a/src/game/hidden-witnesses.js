/**
 * 隐藏见证结局
 *
 * F11 的见证契约已经决定了哪名盟友能完成对应路线。这里不再要求玩家
 * 额外签一份挑战：若她完成信物并在 F20 会战中存活，结局自然多出一段
 * 后日谈。该结果不改变数值、地图或通关条件。
 */

import { isAllianceBonded } from './alliance-bonds.js';
import { getSelectedRouteDoctrine } from './route-doctrines.js';

const WITNESSES = Object.freeze({
  ember: Object.freeze({
    title: '隐藏见证：赤焰裂印',
    text: '焰璃把裂印的副本交给璃。封印从此留下可核对的接缝，后来的人不必只靠相信谁来判断风险。'
  }),
  tide: Object.freeze({
    title: '隐藏见证：潮汐预唱',
    text: '澜音在灯塔外留下第一段预唱。下一次潮声抵达前，所有人都会先听见它。'
  }),
  shadow: Object.freeze({
    title: '隐藏见证：影线公开',
    text: '鸦羽将镜泉的校准记录留在入口。谁改动了影线、改动了什么，都不再藏在镜后。'
  })
});

export function getHiddenWitnessEnding(state) {
  const doctrine = getSelectedRouteDoctrine(state);
  const witness = doctrine ? WITNESSES[doctrine.id] : null;
  if (!doctrine || !witness || !isAllianceBonded(state, doctrine.allyId)) return null;

  const survivor = (state?.council?.outcome?.survivors ?? [])
    .find((unit) => unit?.id === doctrine.allyId);
  if (!survivor) return null;

  return Object.freeze({
    id: doctrine.id,
    title: witness.title,
    text: witness.text,
    allyId: doctrine.allyId,
    allyName: survivor.name
  });
}
