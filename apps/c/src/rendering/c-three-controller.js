export function installThreeView({runtime,getState,onPick,onNotify}){
 const el=id=>document.getElementById(id),stage=el('three-canvas').parentElement;let scene=null,desired='3d',actual='2d',destroyed=false,faulted=false;
 const status=text=>el('view-health').textContent=text;
 function select(mode){desired=mode;actual=mode==='3d'&&scene?'3d':'2d';const is3d=actual==='3d';stage.classList.toggle('three-active',is3d);el('three-canvas').hidden=!is3d;el('three-labels').hidden=!is3d;el('view-3d').setAttribute('aria-pressed',String(is3d));el('view-2d').setAttribute('aria-pressed',String(!is3d));if(scene){scene.setActive(false);if(is3d)scene.refresh(getState());scene.setActive(is3d);}}
 const fail=reason=>{faulted=true;desired='2d';select('2d');el('view-3d').disabled=true;status(`已回退 2D：${reason}`);onNotify?.('3D 不可用，已保留相同游戏状态并回到 2D');};
 el('view-3d').onclick=()=>{if(scene&&!faulted){status('固定正交 · 无旋转操作');select('3d');}else onNotify?.('3D 尚未可用，2D 可以继续游玩');};
 el('view-2d').onclick=()=>{select('2d');status('2D 回退 · 相同存档与动作');};
 el('view-labels').onchange=()=>scene?.setLabels(el('view-labels').checked);
 import('./c-three-scene.js').then(({createThreeScene})=>createThreeScene({canvas:el('three-canvas'),labels:el('three-labels'),runtime,onPick,onFailure:fail,onStats:s=>{el('view-stats').textContent=`${s.renderer} · ${s.calls} draws · ${s.triangles.toLocaleString()} tris · DPR ${s.dpr} · CPU提交 ${s.cpuSubmitMs}ms（非GPU实测）`;}})).then(value=>{if(destroyed){value.destroy();return;}scene=value;status('固定正交 · 无旋转操作');select(desired);}).catch(error=>fail(error.message));
 return {refresh(state){if(actual==='3d')scene?.refresh(state);},mode:()=>actual,stats:()=>scene?.stats()??null,projectTile:(x,y)=>scene?.projectTile(x,y)??null,destroy(){destroyed=true;scene?.destroy();}};
}
