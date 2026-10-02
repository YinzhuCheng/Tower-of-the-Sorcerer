import { installViewportLayout } from '../src/rendering/c-viewport-layout.js';
import { installThreeView } from '../src/rendering/c-three-controller.js';
import { projectVoyageScene } from '../src/rendering/c-adapter.js';
import { presentContinuousScene } from '../src/rendering/continuous-map.js';
import { createVoyagePlanning } from '../src/campaigns/c/planning.js';
import { createVoyageStory } from '../src/campaigns/c/story/index.js';
import { createVoyageCampaign } from '../src/campaigns/c/content.js';
import { createSaveRepository } from '../src/core/campaign.js';
import { reachablePaths } from '../src/solver/campaign-adapter.js';
import { replayCampaignCertificate } from '../src/solver/campaign-replay.js';
const runtime=createVoyageCampaign(),repo=createSaveRepository({getItem:key=>localStorage.getItem('c3d-prototype:'+key),setItem:(key,value)=>localStorage.setItem('c3d-prototype:'+key,value),removeItem:key=>localStorage.removeItem('c3d-prototype:'+key)},runtime,{validatePresentation:validPresentation}),$=id=>document.getElementById(id);
function validPresentation(p){return p==null||(Array.isArray(p.seenIds)&&p.seenIds.every(x=>typeof x==='string')&&Array.isArray(p.queue)&&p.queue.every(scene=>typeof scene.title==='string'&&Array.isArray(scene.turns)&&scene.turns.every(turn=>typeof turn.text==='string'))&&Number.isInteger(p.turnIndex)&&p.turnIndex>=0);}
const restored=repo.restore(),story=createVoyageStory(runtime),planning=createVoyagePlanning(runtime);
const emptyPresentation=()=>({seenIds:[],queue:[],turnIndex:0});
let presentation=restored.presentation??emptyPresentation();
let state=restored.state??runtime.initialState(),allowAutoSave=restored.allowAutoSave,logs=[],pending=null,playback=null,playIndex=0,playTimer=null;
let threeView=null;
let statusTimer=null;
function notify(text){$('status').textContent=text;$('status').style.display='block';clearTimeout(statusTimer);statusTimer=setTimeout(()=>$('status').style.display='none',5500);}
function addLog(text){logs.unshift(text);logs=logs.slice(0,9);}
function persist(){if(allowAutoSave&&!playback) repo.save('auto',state,presentation);}
function checkpoint(){const slot=`checkpoint:${state.boat.dock}`;if(repo.inspect(slot).status==='missing'&&allowAutoSave)repo.save(slot,state,presentation);}
checkpoint();

function enqueueStory(result,{display=true}={}) {
 presentation.seenIds=result.seenIds;
 presentation.queue.push(...result.scenes);
 if(result.narrativeConflicts?.length){for(const problem of result.narrativeConflicts)addLog(`剧情状态核对：${problem.reason}`);}
 if(display){showStory();persist();}
}
function appendEnemyDetails(parent,estimate){
 const box=document.createElement('details'),summary=document.createElement('summary');summary.textContent=`${estimate.title} · 完整数值`;box.append(summary);const line=document.createElement('p');const e=estimate.enemy,b=estimate.battle;line.textContent=`HP ${e.hp} / ATK ${e.atk} / DEF ${e.def}；${estimate.specialLabel}。按当前构筑：每击${b.heroDamage}、${Number.isFinite(b.rounds)?b.rounds:'无法破防'}回合，预计损失${Number.isFinite(b.totalDamage)?b.totalDamage:'无法计算'} HP${estimate.alreadyCleared?'；该机已清除，不会刷新，已付伤害不退':''}`;box.append(line);parent.append(box);
}
function renderForecast(container){
 const report=planning.allRoutes(state);container.replaceChildren();const note=document.createElement('p');note.textContent=report.label;container.append(note);
 for(const enemy of report.enemies)appendEnemyDetails(container,enemy);
 const supply=document.createElement('p');supply.textContent=`已知有限补给：开局船油${report.initialFuel}；旧坞船油${report.fixedSupply}${report.supplyCollected?'（已领）':'（尚未领取）'}；药包当前/上限生命+${report.knownRecovery.hp}${report.knownRecovery.collected?'（已领）':'（尚未领取）'}。封装灯油不能换船油`;container.append(supply);
 for(const route of report.routes){const line=document.createElement('p');line.className='forecast-route';line.textContent=`${route.label}：全程${route.fuelCost}油，基准余${route.finalFuelFromStart}；按当前构筑从未战估算${Number.isFinite(route.currentBuildFullDamage)?route.currentBuildFullDamage:'无法破防'} HP${route.compatibleWithCommittedRoute?'':'（与已选路线不同，仅供比较）'}`;container.append(line);}
}
function showStory(){
 const scene=presentation.queue[0];if(!scene){if($('story').open)$('story').close();return;}
 const turn=scene.turns[presentation.turnIndex];if(!turn){presentation.queue.shift();presentation.turnIndex=0;showStory();return;}
 $('story-title').textContent=scene.title;
 $('story-kicker').textContent=turn.speaker??(turn.kind==='stage'?'场景':'旁白');
 $('story-copy').textContent=turn.text;
 $('story-notice').textContent=scene.boundaryNotice??'';
 $('story-planning').hidden=!scene.budget&&!scene.routePanel;if(!$('story-planning').hidden)renderForecast($('story-forecast'));
 $('story-choices').replaceChildren();
 const choices=turn.choices??[];
 $('story-next').disabled=choices.length>0&&!turn.choiceResolved;
 for(const choice of choices){const button=document.createElement('button');button.textContent=choice.label;button.disabled=Boolean(turn.choiceResolved);button.onclick=()=>{
   turn.choiceResolved=choice.id;
   if(scene.sceneId==='c19'){
     const resolved=story.epilogue(state,choice.id,{seenIds:presentation.seenIds});presentation.seenIds=resolved.seenIds;presentation.queue.push(...resolved.scenes);
   } else if(scene.sceneId==='c04') {
     scene.turns.splice(presentation.turnIndex+1,0,{id:`choice:${choice.id}`,speaker:'璃',kind:'dialogue',text:choice.response.replace(/^璃：/,'')});
   }
   persist();showStory();
 };$('story-choices').append(button);}
 if(!$('story').open)$('story').showModal();
}
$('story-next').onclick=()=>{presentation.turnIndex++;showStory();persist();};
$('story-skip').onclick=()=>{const scene=presentation.queue[0];const choiceIndex=scene?.turns.findIndex((turn,index)=>index>=presentation.turnIndex&&turn.choices?.length&&!turn.choiceResolved)??-1;if(choiceIndex>=0)presentation.turnIndex=choiceIndex;else{presentation.queue.shift();presentation.turnIndex=0;}showStory();persist();};
$('story').addEventListener('cancel',event=>event.preventDefault());

function apply(action,{replay=false}={}){
 if(!replay&&playback){notify('当前是证书回放；请读档或重新开始后游玩');return false;}
 const before=state;const estimate=runtime.preview(state,action);if(!estimate.legal){notify(estimate.reason);return false;}const result=runtime.dispatch(state,action);
 if(!result.ok){notify(result.reason);return false;}
 state=result.state;
 enqueueStory(story.fromDispatch({stateBefore:before,stateAfter:state,events:result.events,receipt:result.receipt,seenIds:presentation.seenIds}),{display:false});
 for(const event of result.events){if(event.type==='battle')addLog(`固定战斗耗血 ${event.battle.totalDamage}`);else if(event.type==='departure')addLog(`离岸扣油 ${event.cost.fuel}，抵达 ${state.boat.dock}`);else if(event.title)addLog(event.title);}
 if(!replay&&before.boat.dock!==state.boat.dock)checkpoint();
 if(!replay)persist();
 render();showStory();
 if(state.victory){notify('双灯与值班安排已完成，空船安全停泊。规则主线通过');stopReplay();}
 return true;
}
function walkTo(x,y){
 if(playTimer||pending||document.querySelector('dialog[open]'))return;
 const paths=reachablePaths(runtime,state),key=`${x},${y}`;
 let path=paths.get(key);
 if(!path){const options=[...paths].filter(([k])=>{const [a,b]=k.split(',').map(Number);return Math.abs(a-x)+Math.abs(b-y)===1;}).sort((a,b)=>a[1].length-b[1].length);path=options[0]?.[1];}
 if(!path){notify('没有安全步行路径；水面和船体不可穿越');return;}
 for(const action of path){if(!apply(action))break;if($('story').open)break;}
}
function describe(action,preview){
 const parts=[];
 if(preview.battle)parts.push(`固定战斗：预计损失 ${preview.battle.totalDamage} HP，当前 ${state.stats.hp} HP`);
 if(preview.nextState){const fuel=state.resources.fuel-preview.nextState.resources.fuel;if(fuel>0)parts.push(`本次扣除 ${fuel} 船油，之后剩 ${preview.nextState.resources.fuel}`);const gold=state.stats.gold-preview.nextState.stats.gold;if(gold>0)parts.push(`花费 ${gold} 金币`);}
 if(action.edgeId==='c.sail23.bypass'&&state.cleared.includes('c.machine1')||action.edgeId==='c.sail34.bypass'&&state.cleared.includes('c.machine2'))parts.push('此处敌机已清，绕行仍多耗油，不会退回已付战损');
 if(action.type==='traverse'&&action.edgeId.startsWith('c.sail')){const route=story.budget(state).routes.find(r=>r.id===action.edgeId);parts.push(`本段之后的已知最短航段还需 ${route.afterMinimum} 油`);if(!route.canRetainKnownMinimum)parts.push('警告：此选择会留下已知燃油缺口；继续后须回溯较早泊位检查点才可能改路');parts.push('船用燃油只支付航段；封装灯油留给远灯，两者不能互换。本夜不提供逆向返航');}
 if(!preview.legal)parts.push(preview.reason);
 return parts.join('\n');
}
function request(action){
 if(document.querySelector('dialog[open]')||pending||playTimer)return;
 const preview=runtime.preview(state,action);const title=action.title;action=Object.fromEntries(Object.entries(action).filter(([key])=>['type','entityId','edgeId','weightId','slot'].includes(key)));if(!preview.legal){notify(preview.reason);return;}
 const consumes=preview.nextState&&(Object.entries(state.resources).some(([id,value])=>(preview.nextState.resources[id]??0)<value)||preview.nextState.stats.gold<state.stats.gold);
 const irreversibleDeparture=action.type==='traverse'&&runtime.spec.transitions.find(edge=>edge.id===action.edgeId)?.departure;
 if(!preview.battle&&!consumes&&!irreversibleDeparture){apply({...action,expectedRevision:state.revision});return;}
 pending={...action,expectedRevision:state.revision};$('confirm-title').textContent=title??'确认操作';$('confirm-copy').textContent=describe(action,preview);$('confirmation').showModal();
}
$('confirm-cancel').onclick=()=>{pending=null;$('confirmation').close();};$('confirm-yes').onclick=()=>{const action=pending;pending=null;$('confirmation').close();if(action)apply(action);};
$('confirmation').addEventListener('cancel',()=>{pending=null;});
function render(){
 const view=runtime.projectView(state),boat=state.boat;
 $('region-title').textContent=view.region.title;$('position').textContent=`当前泊位 ${boat.dock} · 坐标 ${state.location.x},${state.location.y} · ${boat.moored?'已系泊':'尚待靠泊确认'}`;
 $('phase').textContent=state.victory?'主线完成':state.location.regionId==='C-D01'?'甲板操作':'岸上探索';
 $('route').replaceChildren();for(let i=1;i<=5;i++){const span=document.createElement(i===Number(boat.dock.slice(-1))?'strong':'span');span.textContent=`M0${i}${[' 近灯正面',' 旧坞',' 缆桥',' 近灯背面',' 远灯'][i-1]}${i<5?' → ':''}`;$('route').append(span);}
 $('stats').replaceChildren();for(const [label,value]of [['生命',`${state.stats.hp}/${state.stats.maxHp}`],['船油',state.resources.fuel],['攻击 / 防御',`${state.stats.atk} / ${state.stats.def}`],['金币',state.stats.gold]]){const el=document.createElement('div');el.textContent=label+' ';const b=document.createElement('b');b.textContent=value;el.append(b);$('stats').append(el);}
 const berth=Number(boat.dock.slice(-1));
 const minFuel=from=>{const edges=runtime.spec.transitions.filter(e=>e.departure?.from===from);return edges.length?Math.min(...edges.map(e=>(e.cost?.fuel??0)+minFuel(e.departure.to))):0;};
 const minimum=minFuel(boat.dock),future=!state.cleared.includes('c.supplies')&&berth<=2?(runtime.entity('c.supplies').effects.resources.fuel??0):0;
 $('budget').textContent=`余下最短航段合计 ${minimum} 油${future?`；旧坞已知补给 +${future}（须实际领取）`:''}。这是燃油下界，战斗仍须分别检查`;
 $('cargo').textContent=`灯座：${{center:'中线',left:'左侧绞盘作业',right:'右舷吊装',ashore:'已上岸'}[boat.cargo]} · ${view.balance.balanced?'配平':'尚未配平'} · 封装灯油${state.flags['c.lampOil']?'随船独立运输':'已用于远灯'}`;
 $('balance-ledger').textContent=`左右总力矩：左 ${view.balance.leftMoment} / 右 ${view.balance.rightMoment}。相等即可确认作业，中线载荷不计入左右`;
 renderForecast($('route-forecast'));
 presentContinuousScene($('map-canvas'),$('board'),projectVoyageScene(runtime,state));
 $('board').replaceChildren();for(let y=0;y<11;y++)for(let x=0;x<11;x++){
  const token=view.region.map[y][x],tile=document.createElement('button');tile.className=`tile ${token==='.'?(view.region.id==='C-D01'?'deck':'floor'):token==='B'?'ship':token==='#'?'wall':''}`;tile.setAttribute('aria-label',`${x},${y}`);
  let slotInfo=null;
  const entities=view.entities.filter(e=>e.x===x&&e.y===y&&runtime.meets(state,e.visibleWhen));const entity=entities.find(e=>!e.completed)??entities[0];
  if(entity){tile.classList.add('entity');if(entity.completed)tile.classList.add('completed');tile.textContent=entity.kind==='enemy'?(entity.completed?'·':'⚙'):entity.kind==='pickup'?'◆':entity.kind==='shop'?'◇':entity.id.endsWith('.boat')?'⚓':entity.kind==='anchor'?'◈':'▣';tile.title=entity.title;}
  if(view.region.id==='C-D01'){for(const [slot,[sx,sy]]of Object.entries(runtime.spec.ballast.slotCoordinates)){if(sx===x&&sy===y){tile.classList.add('balance-slot');const weight=Object.entries(boat.positions).find(([,pos])=>pos===slot)?.[0];const ordinal=weight?Object.keys(runtime.spec.ballast.weights).indexOf(weight):-1;tile.textContent=weight?`${['①','②','③'][ordinal]} ${runtime.spec.ballast.weights[weight]}`:'空';slotInfo={name:view.balance.slotNames[slot],weight,ordinal};tile.title=`${slotInfo.name}：${weight?`${ordinal+1}号铁块，质量${runtime.spec.ballast.weights[weight]}`:'空槽'}`;tile.setAttribute('aria-label',`${x},${y} ${tile.title}`);}}
   if(boat.dock==='C-M03'&&boat.cargo==='left'&&y===3&&[4,5].includes(x)){tile.textContent=x===5?'⚙':'↤';tile.title=x===5?'同一牵引绞盘机身，左侧为手柄':'牵引绞盘侧手柄；站在4,4操作';tile.classList.add(x===5?'winch-body':'winch-handle');}
   const cargoPoint={center:[5,3],left:[3,3],right:[7,3]}[boat.cargo];if(cargoPoint?.[0]===x&&cargoPoint?.[1]===y){tile.textContent='▤';tile.title='灯座总成（2单位）';}
  }
  if(state.location.x===x&&state.location.y===y){tile.classList.add('hero');tile.textContent='◎';}
  if(slotInfo){const label=document.createElement('small');label.textContent=slotInfo.name;tile.append(label);}
  tile.tabIndex=state.location.x===x&&state.location.y===y?0:-1;
  tile.setAttribute('aria-label',`${x},${y} ${tile.title||({'.':'可行地面','B':'船体，经唯一跳板登船','#':'固定机座或岸桩','X':'损坏平台，不可进入','~':'水面，不可行走'}[token]??'不可行走')}${state.location.x===x&&state.location.y===y?'，璃在这里':''}`);
  tile.onclick=()=>{if(!playTimer&&!document.querySelector('dialog[open]')&&!pending)walkTo(x,y);};$('board').append(tile);
 }
 threeView?.refresh(state);
 $('play-mode').textContent=playback?'证书动作回放 · 从真实 initialState 顺序执行 · 不保存进度':'真实玩家游玩 · 同一 C 标准内核';
 $('actions').replaceChildren();
 const actions=view.interactions;
 if(!actions.length){const p=document.createElement('p');p.textContent='走到标记旁边即可查看和操作';$('actions').append(p);}
 for(const action of actions.filter(action=>action.type!=='moveBallast')){const row=document.createElement('div');row.className='action-row';const button=document.createElement('button');button.textContent=action.title;button.disabled=!action.preview.legal||state.victory;button.onclick=()=>request(action);row.append(button);const detail=document.createElement('small');detail.textContent=describe(action,action.preview);row.append(detail);if(action.entityId&&runtime.entity(action.entityId)?.kind==='enemy')appendEnemyDetails(row,planning.enemyEstimate(state,action.entityId));$('actions').append(row);}
 for(const [weightId,mass] of Object.entries(view.balance.weights)){
 const moves=actions.filter(action=>action.type==='moveBallast'&&action.weightId===weightId);if(!moves.length)continue;
 const group=document.createElement('div');group.className='ballast-group';const label=document.createElement('strong');const ordinal=Object.keys(view.balance.weights).indexOf(weightId)+1;label.textContent=`${ordinal}号铁块 · 质量${mass} · 当前${view.balance.slotNames[boat.positions[weightId]]}`;group.append(label);const buttons=document.createElement('div');buttons.className='tools';
 for(const action of moves){const button=document.createElement('button');button.textContent=`→ ${view.balance.slotNames[action.slot]}`;button.setAttribute('aria-label',action.title);button.title=action.title;button.disabled=!action.preview.legal;button.onclick=()=>request(action);buttons.append(button);}group.append(buttons);$('actions').append(group);
 }
 $('log').replaceChildren(...logs.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 const selected=$('checkpoint-select').value;$('checkpoint-select').replaceChildren();for(let i=1;i<=5;i++){const id=`C-M0${i}`;if(repo.inspect(`checkpoint:${id}`).status==='valid'){const o=document.createElement('option');o.value=id;o.textContent=`${id}抵达初态`;$('checkpoint-select').append(o);}}if(selected)$('checkpoint-select').value=selected;
 $('replay-info').textContent=playback?`原子动作 ${playIndex}/${playback.steps.length}`:'';
}
for(const button of document.querySelectorAll('[data-dir]'))button.onclick=()=>{if(!document.querySelector('dialog[open]')&&!pending&&!playTimer)apply({type:'move',direction:button.dataset.dir});};
document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]')||playTimer)return;const direction={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right'}[event.key];if(direction){event.preventDefault();apply({type:'move',direction});}});
$('save').onclick=()=>{repo.save('manual',state,presentation);notify('手动档已保存；自动档继续独立更新');};
function load(slot){try{const info=repo.inspect(slot);if(info.status==='invalid')throw new Error(info.reason);const saved=info.state;if(!saved){notify('这个槽还没有存档');return;}stopReplay();playback=null;state=saved;presentation=info.presentation??emptyPresentation();allowAutoSave=true;render();enqueueStory(story.location(state,{seenIds:presentation.seenIds}));notify(`已读取${slot==='auto'?'自动':'手动'}档`);}catch(error){const result=repo.restore({preferred:slot,fallback:null});notify(`存档损坏，原始内容已保留副本：${result.issues[0]?.reason??error.message}`);}}
$('load-auto').onclick=()=>load('auto');$('load-manual').onclick=()=>load('manual');
$('new').onclick=()=>{if(!confirm('重新开始当前C标准原型？手动档仍保留。'))return;stopReplay();playback=null;state=runtime.initialState();presentation=emptyPresentation();allowAutoSave=true;logs=[];for(let i=1;i<=5;i++)repo.remove(`checkpoint:C-M0${i}`);checkpoint();persist();render();};
$('checkpoint').onclick=()=>{const savedInfo=repo.inspect(`checkpoint:${$('checkpoint-select').value}`),saved=savedInfo.state;if(!saved){notify('所选泊位没有检查点');return;}if(!confirm('恢复抵达所选泊位时的整份状态？之后的战斗、消耗和作业一起回退。'))return;stopReplay();playback=null;state=saved;presentation=savedInfo.presentation??emptyPresentation();allowAutoSave=true;persist();render();showStory();};
function stopReplay(){if(playTimer)clearInterval(playTimer);playTimer=null;}
$('replay-load').onclick=async()=>{try{const certificate=await(await fetch(new URL('./c-normal.certificate.json',import.meta.url))).json();const result=replayCampaignCertificate(runtime,certificate);if(!result.ok)throw new Error(result.reason);if(!confirm('从新游戏初态开始逐条回放？这次回放不会覆盖自动档。'))return;stopReplay();playback=certificate;playIndex=0;state=runtime.initialState();presentation=emptyPresentation();logs=[];$('replay-step').disabled=false;$('replay-auto').disabled=false;render();}catch(error){notify(`证书未能载入：${error.message}`);}};
function stepReplay(){if($('story').open)return;if(!playback||playIndex>=playback.steps.length){stopReplay();return;}const step=playback.steps[playIndex];if(runtime.stateHash(state)!==step.before){notify('回放前态不一致，已停止');stopReplay();return;}if(apply(step.action,{replay:true})){if(runtime.stateHash(state)!==step.after){notify('回放后态不一致，已停止');stopReplay();return;}playIndex++;render();}else stopReplay();}
$('replay-step').onclick=stepReplay;$('replay-auto').onclick=()=>{if(playTimer){stopReplay();return;}playTimer=setInterval(stepReplay,60);};
render();enqueueStory(story.location(state,{seenIds:presentation.seenIds}));
if(restored.issues.length)notify(`检测到损坏存档并保留原始副本。${restored.source?'已恢复'+restored.source+'档':'请明确选择重新开始；未覆盖原档'}`);
else if(restored.source)notify(`已恢复${restored.source==='auto'?'自动':'手动'}档，启动未覆盖进度`);
// Read-only smoke-test observability. No state mutation or goal-setting hook.
Object.defineProperty(window,'__CAMPAIGN_PREVIEW__',{value:Object.freeze({getState:()=>structuredClone(state),getIdentity:()=>runtime.identity})});

threeView=installThreeView({runtime,getState:()=>state,onPick:(x,y)=>{const target=runtime.projectView(state).entities.find(e=>e.x===x&&e.y===y&&e.interactionAt&&runtime.meets(state,e.visibleWhen));if(target)walkTo(target.interactionAt.x,target.interactionAt.y);else walkTo(x,y);},onNotify:notify});
window.__C3D_QA__=Object.freeze({snapshot:()=>({state:structuredClone(state),stateHash:runtime.stateHash(state),identity:runtime.identity,mode:playback?'certificate-replay':'player-play',view:threeView.mode(),stats:threeView.stats()}),projectTile:(x,y)=>threeView.projectTile(x,y)});

const viewportLayout=installViewportLayout();
window.__C_LAYOUT_QA__=Object.freeze({snapshot:()=>viewportLayout.snapshot()});
