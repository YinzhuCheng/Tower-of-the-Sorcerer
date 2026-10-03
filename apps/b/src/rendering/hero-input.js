// Physical codes are authoritative: Shift+W down and plain w up are one key.
const codes={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'up',KeyA:'left',KeyS:'down',KeyD:'right'};
const keys={arrowup:'ArrowUp',arrowdown:'ArrowDown',arrowleft:'ArrowLeft',arrowright:'ArrowRight',w:'KeyW',a:'KeyA',s:'KeyS',d:'KeyD'};
export function movementKey(event){const code=codes[event.code]?event.code:keys[String(event.key??'').toLowerCase()];return code?{code,direction:codes[code]}:null;}
export function createHeldMovement(){
 const held=new Map();
 return {press(event){const key=movementKey(event);if(key&&!event.ctrlKey&&!event.metaKey&&!event.altKey){held.delete(key.code);held.set(key.code,key.direction);}return key;},release(event){const key=movementKey(event);if(key)held.delete(key.code);return key;},clear(){held.clear();},direction:()=>[...held.values()].at(-1)??null,snapshot:()=>[...held].map(([code,direction])=>({code,direction}))};
}
export function editableMovementTarget(target){return Boolean(target?.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName??''));}
