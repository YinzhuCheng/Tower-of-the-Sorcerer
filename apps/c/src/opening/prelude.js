import {createOpeningPresentation} from './presentation.js';
import {mountOpening} from './ui.js';
// The existing application awaits this after its original save restore, before
// state initialization, checkpoints or gameplay handlers. Closing unfinished
// reading keeps the native modal open and the startup promise unresolved.
export async function startOpeningPrelude({document:doc=document,fetch:read=fetch,skip=false}={}){
  const dialog=doc.getElementById('opening-dialog'),root=doc.getElementById('opening-root');
  // Protect the native loading modal even before fetch resolves.
  dialog.addEventListener('cancel',event=>event.preventDefault());
  if(!skip)dialog.showModal();
  let opening,controller;
  try {
  const response=await read(new URL('../../opening/opening.json',import.meta.url));
  if(!response.ok)throw Error(`Opening load failed: ${response.status}`);
  opening=await response.json();
  controller=createOpeningPresentation(opening,{alreadyStarted:skip});
  } catch(error) {
    if(!skip)throw error;
    const review=doc.getElementById('opening-review');review.disabled=true;review.title='开场回顾未能载入，原存档仍可继续';
    return Object.freeze({blocked:()=>false,replacesOriginalOpening:()=>false,snapshot:()=>({open:false,finished:true,unavailable:true})});
  }
  let started=skip,resolveReady;
  const ready=new Promise(resolve=>{resolveReady=resolve;});
  const ui=mountOpening(root,controller,{document:doc,onChange:v=>{
    if(v.finished&&!v.open){dialog.close();if(!started){started=true;resolveReady();}else doc.getElementById('opening-review')?.focus();}
  }});
  dialog.addEventListener('cancel',event=>{
    event.preventDefault();controller.present('close');ui.render();
    if(controller.snapshot().finished){dialog.close();doc.getElementById('opening-review')?.focus();}
  });
  if(!skip)await ready;
  const review=doc.getElementById('opening-review');
  review.onclick=()=>{
    if(doc.querySelector('dialog[open]'))return;
    controller.present('reopen');ui.render();dialog.showModal();
  };
  return Object.freeze({blocked:controller.blocked,replacesOriginalOpening:controller.replacesOriginalOpening,snapshot:controller.snapshot});
}
