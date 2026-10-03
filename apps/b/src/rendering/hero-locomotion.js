// Release presentation state only. Gameplay movement is still the original reducer.
export const HERO_LOCOMOTION=Object.freeze({heightM:1.66,speedMps:1.2});
export function heroFacing(dx,dy,previous='front') {if(Math.abs(dx)+Math.abs(dy)<1e-8)return previous;return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'front':'back');}
