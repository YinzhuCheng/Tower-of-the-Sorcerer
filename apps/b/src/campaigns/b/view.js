import { reachablePaths } from '../../solver/campaign-adapter.js';
import { forestPlayerCopy, forestActionVisible, forestLockedReason, forestMissingSteps } from './player-copy.js';

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
 const copy=forestPlayerCopy(entity),title=entity?copy.title:edge?!state.visited.includes(edge.to)&&!runtime.meets(state,edge.requires)?'尚未开放的小路':`前往${runtime.region(edge.to).title}`:'移动',details=[],next=preview.nextState,budget=story.budget(state);
 if(entity?.enemy){const b=story.actionPanel(state,entity.id).battle,e=entity.enemy;details.push(`敌方生命 ${e.hp} · 攻击 ${e.atk} · 防御 ${e.def}`);if(b)details.push(Number.isFinite(b.totalDamage)?`固定损伤 ${b.totalDamage}，战后生命 ${state.stats.hp-b.totalDamage}；击败获得 ${e.gold??0} 金币`:'当前攻击无法破防');}
 if(next){for(const[id,value]of Object.entries(state.resources)){const delta=(next.resources[id]??0)-value;if(delta)details.push(`${resourceNames[id]??id} ${delta>0?'+':''}${delta}，之后 ${next.resources[id]}`);}
 for(const[id,value]of Object.entries(state.stats)){const delta=next.stats[id]-value;if(delta&&!entity?.enemy)details.push(`${statNames[id]??id} ${delta>0?'+':''}${delta}，之后 ${next.stats[id]}`);}}
 if(!next&&entity){if(entity.price)details.push(`价格 ${entity.price} 金币`);for(const[id,delta]of Object.entries(entity.effects?.resources??{}))if(delta)details.push(`${resourceNames[id]??id} ${delta>0?'+':''}${delta}`);for(const[id,delta]of Object.entries(entity.effects?.stats??{}))if(delta)details.push(`${statNames[id]??id} ${delta>0?'+':''}${delta}`);}
 if(copy.description)details.push(copy.description);
 if(entity?.id.includes('.warm'))details.push(`投入后不可取回；四阀仍须保留 ${budget.requiredValveReserve} 份。未投入的设施采用普通方案`);
 if(entity?.id.endsWith('.fixRoot'))details.push('这一枚楔只固定侧根，先开放人行；铺板、补栏和轻车试行要另做。原路敌人仍在，不发战利品');
 if(entity?.id.endsWith('.originalEnemy'))details.push('击败后还要清残件、修栏和试车，原路才算能过轻车；也可以用有限的根楔走侧根');
 if(entity?.id.endsWith('.rootWorks'))details.push('完成侧根公共施工；原路敌人保留，不会获得原路战利品');
 if(entity?.confirmation?.kind==='irreversible-heat-plan')details.push(`当前暖点就此定案，未投入处采用普通方案；剩余 ${entity.confirmation.remaining} 份移交公共库存，之后不能再投暖点`);
 if(entity?.id==='b28.stopMainValve')details.push('完成总阀停机，已施工的普通道路与水路保留；之后继续接诺克缇娅回家');
 if(entity?.id.startsWith('b30.'))details.push('这是本次旅程的一季结尾；确认后不能在同一进度改选');
 if(entity?.kind==='pickup')details.push('拿走后，这里就没有了');
 if(entity?.kind==='shop')details.push(entity.once===false?'金币够的话，可以再买；每次都要付钱':'现货只有这一件');
 if(action.type==='traverse')details.push('沿这条山路过去，也能原路回来');
 if(!preview.legal)details.push(forestLockedReason(runtime,state,entity,edge,preview));
 const consumes=next&&(Object.entries(state.resources).some(([id,value])=>(next.resources[id]??0)<value)||next.stats.gold<state.stats.gold||next.stats.hp<state.stats.hp);
 const irreversible=entity&&(entity.confirmation?.kind==='irreversible-heat-plan'||entity.id==='b28.stopMainValve'||entity.id==='b28.serviceLever'||entity.id.startsWith('b30.'));
 const requiresConfirmation=Boolean(consumes||irreversible||entity?.kind==='enemy'||entity?.kind==='shop');
 const buttonLabel=action.type==='traverse'?'沿路过去':requiresConfirmation?'看看，再决定':entity?.kind==='pickup'?'拿上':/winterPlan|lodging|learningPlan|oldSeat|shareDuties/.test(entity?.id??'')?'聊一聊':/routeBrief|overlook|freightManifest|inspectSeeds|shutdownDiagram/.test(entity?.id??'')?'看一看':'动手吧';
 return {action,title,preview,details,requiresConfirmation,buttonLabel,entity,edge};
}
export function forestRegionActions(runtime,story,state){return runtime.listInteractions(state,{all:true}).filter(action=>forestActionVisible(runtime,state,runtime.entity(action.entityId))).map(action=>{const target=runtime.entity(action.anchor),path=forestApproach(runtime,state,target.id);const nearby=path==null?state:path.reduce((s,a)=>runtime.dispatch(s,a).state,state);return {...forestActionView(runtime,story,nearby,action),anchor:target,path,inReach:runtime.inReach(state,target.id),reachable:path!==null};});}
export function forestPublicRows(runtime,story,state){return story.budget(state).wedges.sites.map(site=>({...site,title:runtime.region(site.region).title,person:site.rootFixed||site.originalCleared,description:site.publicReady?'公共步行、驮运、分批轻车已通':site.rootFixed?'侧根仅人行，铺板补栏未完成':site.originalCleared?'原路敌人已清，修栏试车未完成':'原路与侧根都未打通',original:site.originalCleared?(site.originalWorksDone?'已清障并施工':'已清障，待施工'):'敌人仍在',root:site.rootFixed?(site.rootWorksDone?'已固定并施工':'已固定，仅人行'):'未固定'}));}
export function forestChecklist(runtime,state,conditions){return conditions.map(condition=>({met:runtime.meets(state,condition),text:forestMissingSteps(runtime,state,condition).join('；')})).filter(row=>!row.met);}
