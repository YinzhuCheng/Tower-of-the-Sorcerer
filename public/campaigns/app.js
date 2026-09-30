import { createVoyageCampaign } from '../../src/campaigns/c/content.js';
import { createSaveRepository } from '../../src/core/campaign.js';
import { reachablePaths } from '../../src/solver/campaign-adapter.js';
import { replayCampaignCertificate } from '../../src/solver/campaign-replay.js';
const runtime=createVoyageCampaign(),repo=createSaveRepository(localStorage,runtime),$=id=>document.getElementById(id);
const restored=repo.restore();
let state=restored.state??runtime.initialState(),allowAutoSave=restored.allowAutoSave,logs=[],pending=null,playback=null,playIndex=0,playTimer=null;
let statusTimer=null;
function notify(text){$('status').textContent=text;$('status').style.display='block';clearTimeout(statusTimer);statusTimer=setTimeout(()=>$('status').style.display='none',5500);}
function addLog(text){logs.unshift(text);logs=logs.slice(0,9);}
function persist(){if(allowAutoSave) repo.save('auto',state);}
function checkpoint(){const slot=`checkpoint:${state.boat.dock}`;if(repo.inspect(slot).status==='missing'&&allowAutoSave)repo.save(slot,state);}
checkpoint();
function apply(action,{replay=false}={}){
 if(!replay&&playback){notify('当前是证书回放；请读档或重新开始后游玩');return false;}
 const before=state,result=runtime.dispatch(state,action);
 if(!result.ok){notify(result.reason);return false;}
 state=result.state;
 for(const event of result.events){if(event.type==='battle')addLog(`固定战斗耗血 ${event.battle.totalDamage}`);else if(event.type==='departure')addLog(`离岸扣油 ${event.cost.fuel}，抵达 ${state.boat.dock}`);else if(event.title)addLog(event.title);}
 if(!replay&&before.boat.dock!==state.boat.dock)checkpoint();
 if(!replay)persist();
 render();
 if(state.victory){notify('双灯与值班安排已完成，空船安全停泊。规则主线通过');stopReplay();}
 return true;
}
function walkTo(x,y){
 const paths=reachablePaths(runtime,state),key=`${x},${y}`;
 let path=paths.get(key);
 if(!path){const options=[...paths].filter(([k])=>{const [a,b]=k.split(',').map(Number);return Math.abs(a-x)+Math.abs(b-y)===1;}).sort((a,b)=>a[1].length-b[1].length);path=options[0]?.[1];}
 if(!path){notify('没有安全步行路径；水面和船体不可穿越');return;}
 for(const action of path)if(!apply(action))break;
}
function describe(action,preview){
 const parts=[];
 if(preview.battle)parts.push(`固定战斗：预计损失 ${preview.battle.totalDamage} HP，当前 ${state.stats.hp} HP`);
 if(preview.nextState){const fuel=state.resources.fuel-preview.nextState.resources.fuel;if(fuel>0)parts.push(`本次扣除 ${fuel} 船油，之后剩 ${preview.nextState.resources.fuel}`);const gold=state.stats.gold-preview.nextState.stats.gold;if(gold>0)parts.push(`花费 ${gold} 金币`);}
 if(action.edgeId==='c.sail23.bypass'&&state.cleared.includes('c.machine1')||action.edgeId==='c.sail34.bypass'&&state.cleared.includes('c.machine2'))parts.push('此处敌机已清，绕行仍多耗油，不会退回已付战损');
 if(action.type==='traverse'&&action.edgeId.startsWith('c.sail'))parts.push('本夜不提供逆向返航；三种油账与任务物均不会重置');
 if(!preview.legal)parts.push(preview.reason);
 return parts.join('\n')||'此操作不消耗船油；会按公开任务条件更新一次';
}
function request(action){
 const preview=runtime.preview(state,action);const title=action.title;action=Object.fromEntries(Object.entries(action).filter(([key])=>['type','entityId','edgeId','weightId','slot'].includes(key)));if(!preview.legal){notify(preview.reason);return;}
 if(action.type==='moveBallast'){apply({...action,expectedRevision:state.revision});return;}
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
 $('board').replaceChildren();for(let y=0;y<11;y++)for(let x=0;x<11;x++){
  const token=view.region.map[y][x],tile=document.createElement('button');tile.className=`tile ${token==='.'?(view.region.id==='C-D01'?'deck':'floor'):token==='B'?'ship':token==='#'?'wall':''}`;tile.setAttribute('aria-label',`${x},${y}`);
  const entities=view.entities.filter(e=>e.x===x&&e.y===y);const entity=entities.find(e=>!e.completed)??entities[0];
  if(entity){tile.classList.add('entity');if(entity.completed)tile.classList.add('completed');tile.textContent=entity.kind==='enemy'?(entity.completed?'·':'⚙'):entity.kind==='pickup'?'◆':entity.kind==='shop'?'◇':entity.id.endsWith('.boat')?'⚓':entity.kind==='anchor'?'◈':'▣';tile.title=entity.title;}
  if(view.region.id==='C-D01'){for(const [slot,[sx,sy]]of Object.entries(runtime.spec.ballast.slotCoordinates)){if(sx===x&&sy===y){tile.classList.add('balance-slot');const weight=Object.entries(boat.positions).find(([,pos])=>pos===slot)?.[0];tile.textContent=weight?String(runtime.spec.ballast.weights[weight]):'○';tile.title=`${slot}${weight?` ${weight}`:' 空槽'}`;}}
   const cargoPoint={center:[5,3],left:[3,3],right:[7,3]}[boat.cargo];if(cargoPoint?.[0]===x&&cargoPoint?.[1]===y){tile.textContent='▤';tile.title='灯座总成（2单位）';}
  }
  if(state.location.x===x&&state.location.y===y){tile.classList.add('hero');tile.textContent='◎';}
  tile.onclick=()=>{if(!playTimer)walkTo(x,y);};$('board').append(tile);
 }
 $('actions').replaceChildren();
 const actions=view.interactions;
 if(!actions.length){const p=document.createElement('p');p.textContent='走到标记旁边即可查看和操作';$('actions').append(p);}
 for(const action of actions){const row=document.createElement('div');row.className='action-row';const button=document.createElement('button');button.textContent=action.title;button.disabled=!action.preview.legal||state.victory;button.onclick=()=>request(action);row.append(button);const detail=document.createElement('small');detail.textContent=describe(action,action.preview);row.append(detail);$('actions').append(row);}
 $('log').replaceChildren(...logs.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 const selected=$('checkpoint-select').value;$('checkpoint-select').replaceChildren();for(let i=1;i<=5;i++){const id=`C-M0${i}`;if(repo.inspect(`checkpoint:${id}`).status==='valid'){const o=document.createElement('option');o.value=id;o.textContent=`${id}抵达初态`;$('checkpoint-select').append(o);}}if(selected)$('checkpoint-select').value=selected;
 $('replay-info').textContent=playback?`原子动作 ${playIndex}/${playback.steps.length}`:'';
}
for(const button of document.querySelectorAll('[data-dir]'))button.onclick=()=>apply({type:'move',direction:button.dataset.dir});
document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]')||playTimer)return;const direction={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right'}[event.key];if(direction){event.preventDefault();apply({type:'move',direction});}});
$('save').onclick=()=>{repo.save('manual',state);notify('手动档已保存；自动档继续独立更新');};
function load(slot){try{const saved=repo.load(slot);if(!saved){notify('这个槽还没有存档');return;}stopReplay();playback=null;state=saved;allowAutoSave=true;render();notify(`已读取${slot==='auto'?'自动':'手动'}档`);}catch(error){const result=repo.restore({preferred:slot,fallback:null});notify(`存档损坏，原始内容已保留副本：${result.issues[0]?.reason??error.message}`);}}
$('load-auto').onclick=()=>load('auto');$('load-manual').onclick=()=>load('manual');
$('new').onclick=()=>{if(!confirm('重新开始当前C标准原型？手动档仍保留。'))return;stopReplay();playback=null;state=runtime.initialState();allowAutoSave=true;logs=[];for(let i=1;i<=5;i++)repo.remove(`checkpoint:C-M0${i}`);checkpoint();persist();render();};
$('checkpoint').onclick=()=>{const saved=repo.load(`checkpoint:${$('checkpoint-select').value}`);if(!saved){notify('所选泊位没有检查点');return;}if(!confirm('恢复抵达所选泊位时的整份状态？之后的战斗、消耗和作业一起回退。'))return;stopReplay();playback=null;state=saved;allowAutoSave=true;persist();render();};
function stopReplay(){if(playTimer)clearInterval(playTimer);playTimer=null;}
$('replay-load').onclick=async()=>{try{const certificate=await(await fetch(new URL('./c-normal.certificate.json',import.meta.url))).json();const result=replayCampaignCertificate(runtime,certificate);if(!result.ok)throw new Error(result.reason);if(!confirm('从新游戏初态开始逐条回放？这次回放不会覆盖自动档。'))return;stopReplay();playback=certificate;playIndex=0;state=runtime.initialState();logs=[];$('replay-step').disabled=false;$('replay-auto').disabled=false;render();}catch(error){notify(`证书未能载入：${error.message}`);}};
function stepReplay(){if(!playback||playIndex>=playback.steps.length){stopReplay();return;}const step=playback.steps[playIndex];if(runtime.stateHash(state)!==step.before){notify('回放前态不一致，已停止');stopReplay();return;}if(apply(step.action,{replay:true})){if(runtime.stateHash(state)!==step.after){notify('回放后态不一致，已停止');stopReplay();return;}playIndex++;render();}else stopReplay();}
$('replay-step').onclick=stepReplay;$('replay-auto').onclick=()=>{if(playTimer){stopReplay();return;}playTimer=setInterval(stepReplay,60);};
render();
if(restored.issues.length)notify(`检测到损坏存档并保留原始副本。${restored.source?'已恢复'+restored.source+'档':'请明确选择重新开始；未覆盖原档'}`);
else if(restored.source)notify(`已恢复${restored.source==='auto'?'自动':'手动'}档，启动未覆盖进度`);
// Read-only smoke-test observability. No state mutation or goal-setting hook.
Object.defineProperty(window,'__CAMPAIGN_PREVIEW__',{value:Object.freeze({getState:()=>structuredClone(state),getIdentity:()=>runtime.identity})});
