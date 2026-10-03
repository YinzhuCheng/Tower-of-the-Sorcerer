import { FOREST_STORY_CONTENT } from './content.js';
import { LEGACY_OPENING_SCENES } from './opening-legacy.js';
export { LEGACY_OPENING_SCENES };
export const LEGACY_OPENING_REVISION='legacy-v1.1';
export const NEW_OPENING_REVISION='opening-r1';
const sceneIds=Object.keys(LEGACY_OPENING_SCENES);
const oldIds=new Set(Object.values(LEGACY_OPENING_SCENES).flatMap(s=>s.turns.map(t=>t.id)));
const newIds=new Set(sceneIds.flatMap(id=>FOREST_STORY_CONTENT.scenes[id].turns.map(t=>t.id)));
/** Read-only evidence classification. No turn aliases, completion inference or save writes.
 * Unmarked/no-evidence imported saves deliberately retain conservative legacy prose. */
export function forestOpeningRevision(p,{fresh=false}={}) {
 const fail=detail=>({ok:false,code:'opening-compatibility',reason:`开篇版本无法安全恢复（${detail}）。原存档未改写，请读取兼容存档，或明确重新开始。`});
 if(fresh)return {ok:true,revision:NEW_OPENING_REVISION,evidence:'fresh-start'};
 const marker=p?.openingRevision;
 if(marker!==undefined&&marker!==LEGACY_OPENING_REVISION&&marker!==NEW_OPENING_REVISION)return fail('未知版本标记');
 const ids=[...(p?.seenIds??[]),...(p?.queue??[]).flatMap(s=>s.turns.map(t=>t.id))];
 for(const id of ids)if((id.startsWith('B.OPEN.')||sceneIds.some(s=>id.startsWith(s+'.')))&&!oldIds.has(id)&&!newIds.has(id))return fail('未知开篇条目标识');
 for(const scene of p?.queue??[])if(sceneIds.includes(scene.sceneId))for(const t of scene.turns)if(!oldIds.has(t.id)&&!newIds.has(t.id)&&!(scene.sceneId==='b02_choice'&&t.kind==='choice-prompt'&&t.id==='ui:choice:b02_choice'))return fail('未知开篇队列条目');
 for(const id of ids)if(sceneIds.some(s=>id.startsWith(`ui:choice:${s}`))&&id!=='ui:choice:b02_choice')return fail('未知开篇选择标识');
 const old=ids.some(id=>oldIds.has(id)),newer=ids.some(id=>newIds.has(id));
 if(old&&newer)return fail('旧稿与新稿记录混合');
 if((marker===NEW_OPENING_REVISION&&old)||(marker===LEGACY_OPENING_REVISION&&newer))return fail('版本标记与条目冲突');
 return {ok:true,revision:marker??(newer?NEW_OPENING_REVISION:LEGACY_OPENING_REVISION),evidence:marker?'explicit-marker':newer?'new-turn-ids':old?'legacy-turn-ids':'unmarked-conservative-legacy'};
}
