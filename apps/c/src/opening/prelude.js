import {createOpeningPresentation} from './presentation.js';
import {mountOpening} from './ui.js';
// The existing application awaits this after its original save restore, before
// state initialization, checkpoints or gameplay handlers. Closing unfinished
// reading keeps the native modal open and the startup promise unresolved.
export async function startOpeningPrelude({document:doc=document,fetch:read=fetch,skip=false}={}){
  const dialog=doc.getElementById('opening-dialog'),root=doc.getElementById('opening-root'),review=doc.getElementById('opening-review');
  let opening,controller,ui,started=skip,resolveReady;
  // A native close request can still close the dialog after cancel. While fresh
  // startup is pending, neither Escape nor a close event is an explicit Finish.
  function pausePending(){
    if(started)return;
    if(controller){if(controller.snapshot().open)controller.present('close');ui.render();}
    if(!dialog.open)dialog.showModal();
  }
  doc.addEventListener('keydown',event=>{
    if(started||event.key!=='Escape')return;
    event.preventDefault();event.stopPropagation();pausePending();
  },true);
  dialog.addEventListener('cancel',event=>{
    event.preventDefault();
    if(!started){pausePending();return;}
    if(controller){controller.present('close');ui.render();dialog.close();review.focus();}
  });
  dialog.addEventListener('close',()=>{
    if(dialog.open)return; // Ignore a stale close event after a newer reopen.
    if(!started){pausePending();return;}
    if(controller?.snapshot().open){controller.present('close');ui.render();review.focus();}
  });
  // Install recovery before loading/awaiting Finish, not after the startup gate.
  review.onclick=()=>{
    if(doc.querySelector('dialog[open]'))return;
    if(controller){controller.present('reopen');ui.render();}
    if(!started||controller)dialog.showModal();
  };
  if(!skip)dialog.showModal();
  try {
  const response=await read(new URL('../../opening/opening.json',import.meta.url));
  if(!response.ok)throw Error(`Opening load failed: ${response.status}`);
  opening=await response.json();
  controller=createOpeningPresentation(opening,{alreadyStarted:skip});
  } catch(error) {
    if(!skip)throw error;
    review.disabled=true;review.title='开场回顾未能载入，原存档仍可继续';
    return Object.freeze({blocked:()=>false,replacesOriginalOpening:()=>false,snapshot:()=>({open:false,finished:true,unavailable:true})});
  }
  const ready=new Promise(resolve=>{resolveReady=resolve;});
  ui=mountOpening(root,controller,{document:doc,onChange:v=>{
    if(v.finished&&!v.open){
      // Retire the pending close guard before close can dispatch its event.
      const wasStarted=started;if(!started){started=true;resolveReady();}
      dialog.close();if(wasStarted)review.focus();
    }
  }});
  if(!skip)await ready;
  return Object.freeze({blocked:controller.blocked,replacesOriginalOpening:controller.replacesOriginalOpening,snapshot:controller.snapshot});
}
