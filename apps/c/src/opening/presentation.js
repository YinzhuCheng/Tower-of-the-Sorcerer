// Presentation-only subset of sealed c-opening-r1/src/controller.js.
// No gameplay imports, dispatch, storage or resource ownership.
export function createOpeningPresentation(opening,{alreadyStarted=false}={}) {
  if(opening.id!=='C-opening-rebuild-r1'||opening.historicalRecovery!==false)throw Error('Opening identity mismatch');
  const turns=opening.scenes.flatMap(scene=>scene.turns.map(turn=>({...structuredClone(turn),sceneTitle:scene.title,location:scene.location})));
  if(turns.length!==52||new Set(turns.map(t=>t.id)).size!==52)throw Error('Invalid opening turns');
  let index=0,open=!alreadyStarted,finished=alreadyStarted,epoch=0,completedHere=false;
  const snapshot=()=>structuredClone({index,open,finished,epoch,turn:turns[index],total:turns.length});
  const fail=reason=>({ok:false,reason});
  function present(command,token=epoch){
    if(token!==epoch)return fail('Stale presentation event');
    if(command==='reopen')open=true;
    else if(command==='close')open=false;
    else if(!open)return fail('Opening is closed');
    else if(command==='next')index=Math.min(turns.length-1,index+1);
    else if(command==='back')index=Math.max(0,index-1);
    else if(command==='skip')index=turns.length-1;
    else if(command==='finish'){if(index!==turns.length-1)return fail('Read or skip to final turn before explicit finish');finished=true;completedHere=true;open=false;}
    else return fail('Unknown presentation command');
    epoch++;return {ok:true};
  }
  return Object.freeze({snapshot,present,blocked:()=>!finished||open,replacesOriginalOpening:()=>completedHere});
}
// Keep c01 replaced here only. Original story resolver and c02 gates stay intact.
export function withoutReplacedOpening(result){
  return {...result,scenes:result.scenes.filter(scene=>scene.sceneId!=='c01')};
}
