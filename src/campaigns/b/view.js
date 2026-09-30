import { reachablePaths } from '../../solver/campaign-adapter.js';

// Read-only screen projections. Costs and legality always come from the kernel.
const resourceNames={heat:'暖脂',wedges:'缚根楔',publicHeat:'公共暖脂'};
const statNames={hp:'生命',maxHp:'生命上限',atk:'攻击',def:'防御',gold:'金币'};
export const cleanForestAction=action=>Object.fromEntries(Object.entries(action).filter(([key])=>['type','direction','entityId','edgeId','expectedRevision'].includes(key)));
export function forestApproach(runtime,state,entityId){
 const target=runtime.entity(entityId);if(!target||target.regionId!==state.location.regionId)return null;
 const paths=reachablePaths(runtime,state);
 return [...paths].filter(([key])=>{const[x,y]=key.split(',').map(Number);return runtime.inReach({...state,location:{...state.location,x,y}},entityId);}).sort((a,b)=>a[1].length-b[1].length)[0]?.[1]??null;
}
export function forestWalkPath(runtime,state,x,y){
 const paths=reachablePaths(runtime,state);if(paths.has(`${x},${y}`))return paths.get(`${x},${y}`);
 return [...paths].filter(([key])=>{const[a,b]=key.split(',').map(Number);return Math.abs(a-x)+Math.abs(b-y)===1;}).sort((a,b)=>a[1].length-b[1].length)[0]?.[1]??null;
}
export function forestActionView(runtime,story,state,input){
 const action=cleanForestAction({...input,expectedRevision:state.revision}),entity=runtime.entity(action.entityId),edge=runtime.spec.transitions.find(e=>e.id===action.edgeId),preview=runtime.preview(state,action);
 const title=entity?.title??edge?.title??'移动',details=[],next=preview.nextState,budget=story.budget(state);
 if(entity?.enemy){const b=story.actionPanel(state,entity.id).battle,e=entity.enemy;details.push(`敌方生命 ${e.hp} · 攻击 ${e.atk} · 防御 ${e.def}`);if(b)details.push(Number.isFinite(b.totalDamage)?`固定损伤 ${b.totalDamage}，战后生命 ${state.stats.hp-b.totalDamage}；击败获得 ${e.gold??0} 金币`:'当前攻击无法破防');}
 if(next){for(const[id,value]of Object.entries(state.resources)){const delta=(next.resources[id]??0)-value;if(delta)details.push(`${resourceNames[id]??id} ${delta>0?'+':''}${delta}，之后 ${next.resources[id]}`);}
 for(const[id,value]of Object.entries(state.stats)){const delta=next.stats[id]-value;if(delta&&!entity?.enemy)details.push(`${statNames[id]??id} ${delta>0?'+':''}${delta}，之后 ${next.stats[id]}`);}}
 if(entity?.id.includes('.warm'))details.push(`投入后不可取回；四阀仍须保留 ${budget.requiredValveReserve} 份。未投入的设施采用普通方案`);
 if(entity?.id.endsWith('.fixRoot'))details.push('这一枚楔只固定侧根，先开放人行；铺板、补栏和轻车试行要另做。原路敌人仍在，不发战利品');
 if(entity?.id.endsWith('.rootWorks'))details.push('完成侧根公共施工；原路敌人保留，不会获得原路战利品');
 if(entity?.confirmation?.kind==='irreversible-heat-plan')details.push(`当前暖点就此定案，未投入处采用普通方案；剩余 ${entity.confirmation.remaining} 份移交公共库存，之后不能再投暖点`);
 if(entity?.id==='b28.stopMainValve')details.push('完成总阀停机，已施工的普通道路与水路保留；之后继续接诺克缇娅回家');
 if(entity?.id.startsWith('b30.'))details.push('这是本次旅程的一季结尾；确认后不能在同一进度改选');
 if(entity?.kind==='pickup')details.push('现存物资只领取一次');
 if(entity?.kind==='operation'&&!details.length)details.push(`完成：${title}。这次作业会保留在旅程中`);
 if(action.type==='traverse')details.push(`实际门户通往${runtime.region(edge.to).title}，可沿原门户返回`);
 if(!preview.legal){const missing=runtime.explainMissing(state,entity?.requires??edge?.requires);details.push(entity?.kind==='shop'&&state.stats.gold<entity.price?`金币不足：需要 ${entity.price}，现有 ${state.stats.gold}，还差 ${entity.price-state.stats.gold}`:preview.reason?.replaceAll('封账','确定方案'));if(missing.length&&!missing.every(text=>preview.reason?.includes(text)))details.push(...missing);}
 const consumes=next&&(Object.entries(state.resources).some(([id,value])=>(next.resources[id]??0)<value)||next.stats.gold<state.stats.gold||next.stats.hp<state.stats.hp);
 const irreversible=entity&&entity.once!==false&&entity.kind!=='anchor';
 return {action,title,preview,details,requiresConfirmation:Boolean(consumes||irreversible),entity,edge};
}
export function forestRegionActions(runtime,story,state){return runtime.listInteractions(state,{all:true}).map(action=>{const target=runtime.entity(action.anchor),path=forestApproach(runtime,state,target.id);const nearby=path==null?state:path.reduce((s,a)=>runtime.dispatch(s,a).state,state);return {...forestActionView(runtime,story,nearby,action),anchor:target,path,inReach:runtime.inReach(state,target.id),reachable:path!==null};});}
export function forestPublicRows(runtime,story,state){return story.budget(state).wedges.sites.map(site=>({...site,title:runtime.region(site.region).title,person:site.rootFixed||site.originalCleared,description:site.publicReady?'公共步行、驮运、分批轻车已通':site.rootFixed?'侧根仅人行，铺板补栏未完成':site.originalCleared?'原路敌人已清，修栏试车未完成':'原路与侧根都未打通',original:site.originalCleared?(site.originalWorksDone?'已清障并施工':'已清障，待施工'):'敌人仍在',root:site.rootFixed?(site.rootWorksDone?'已固定并施工':'已固定，仅人行'):'未固定'}));}
export function forestChecklist(runtime,state,conditions){return conditions.map(condition=>({met:runtime.meets(state,condition),text:runtime.explainMissing(state,condition).join('；')})).filter(row=>!row.met);}
