import {createCenweiPreview,PREVIEW_CHOICES,WAIT_SCENE,GREETING_SCENE} from './preview-model.js';
import {presentCenweiPreview as presentForestGal,clearCenweiPreview as clearForestGal} from './preview-stage.js';
import {createForestGalReader} from '../../src/rendering/forest-gal-reader.js';

export function mountCenweiPreview(document){
 const $=id=>document.getElementById(id),model=createCenweiPreview(),dialog=$('story');
 const nodes={dialog,backdrop:$('story-backdrop'),actors:$('story-actors'),portrait:$('story-portrait'),label:$('story-art-label'),stage:$('story-stage')};
 const reader=createForestGalReader({...nodes,body:$('story-body'),historyButton:$('story-history'),historyPanel:$('story-history-panel'),historyEntries:$('story-history-entries'),historyClose:$('story-history-close'),hideButton:$('story-hide'),restoreButton:$('story-restore'),historyTitle:$('story-history-title')},{createElement:tag=>document.createElement(tag)});
 let opener=$('preview-start'),readerScene=null,readerSceneKey=null;
 const handledEvents=new WeakSet();
 const once=(event,action)=>{if(event&&handledEvents.has(event))return;if(event)handledEvents.add(event);action();};
 const labelFor=response=>PREVIEW_CHOICES.find(c=>c.id===response)?.label??'此前未相遇';
 function render(){
  const s=model.snapshot();if(!s.scene)return;
  const {scene,turn}=s;
  // Keep reader scene identity stable within a branch; a branch switch starts a
  // new snapshot, clearing stale history/art modes without changing story text.
  const key=scene.sceneId+'|'+(s.response??'');
  if(key!==readerSceneKey){readerSceneKey=key;readerScene=scene;}
  $('story-title').textContent=scene.title;
  $('story-speaker').textContent=turn.speaker;
  $('story-copy').textContent=turn.text;
  $('story-progress').textContent=`${s.index+1} / ${scene.turns.length}`;
  $('story-location').textContent=scene.sceneId===WAIT_SCENE?'杉林歇脚处':'溪边的圆篓';
  $('preview-scenario').textContent=scene.sceneId===WAIT_SCENE?(s.response?`试读选择：${labelFor(s.response)}`:'试读场景：林中初遇'):`假设此前：${labelFor(s.response)} · 模拟重逢`;
  dialog.dataset.sceneId=scene.sceneId;dialog.dataset.turnId=turn.id;dialog.dataset.branch=scene.branch??'common';
  dialog.dataset.choices=String(s.atChoice);
  presentForestGal(nodes,scene,turn);
  $('story-choices').replaceChildren();
  if(s.atChoice)for(const choice of PREVIEW_CHOICES){
   const button=document.createElement('button');button.type='button';button.textContent=choice.label;button.dataset.choiceId=choice.id;button.setAttribute('aria-pressed',String(s.response===choice.id));button.disabled=s.response===choice.id;
   button.onclick=event=>once(event,()=>{if(model.choose(choice.id,s.revision)){render();$('story-next').focus();}});$('story-choices').append(button);
  }
  $('story-next').disabled=!s.canNext;$('story-back').disabled=!s.canBack;
  $('story-next').onclick=event=>once(event,()=>{if(model.next(s.revision)){render();if($('story-next').disabled)($('preview-reunion').hidden?$('preview-menu'):$('preview-reunion')).focus();}});
  $('story-back').onclick=event=>once(event,()=>{if(model.back(s.revision)){render();if($('story-back').disabled)$('story-next').focus();}});
  $('preview-reunion').hidden=!(s.atEnd&&scene.sceneId===WAIT_SCENE&&s.response);
  $('preview-reunion').onclick=event=>once(event,()=>{if(model.reunion(s.revision)){render();$('story-next').focus();}});
  $('preview-end').hidden=!(s.atEnd&&(scene.sceneId===GREETING_SCENE||!!s.response));
  $('preview-end').textContent=scene.sceneId===WAIT_SCENE?'本段试读到此，可以继续模拟溪边重逢':'本段试读到此，可以返回目录试读其他分支';
  reader.sync(readerScene,s.index,'');
 }
 function close(){if(!dialog.open)return;reader.reset();clearForestGal(nodes);model.close();readerScene=readerSceneKey=null;dialog.close();opener?.focus();}
 function open(sceneId,response,button){opener=button;reader.reset();clearForestGal(nodes);readerScene=readerSceneKey=null;model.open(sceneId,response);render();if(!dialog.open)dialog.showModal();$('story-next').focus();}
 $('preview-start').onclick=()=>open(WAIT_SCENE,null,$('preview-start'));
 for(const button of document.querySelectorAll('[data-preview-response]'))button.onclick=()=>open(GREETING_SCENE,button.dataset.previewResponse||null,button);
 $('story-close').onclick=close;$('preview-menu').onclick=close;
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(!reader.dismiss())close();});
 dialog.addEventListener('keydown',event=>{if(event.defaultPrevented||event.repeat||event.ctrlKey||event.metaKey||event.altKey||reader.mode!=='reading')return;if(/^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName??'')||event.target?.isContentEditable)return;if(event.key==='ArrowRight'){event.preventDefault();$('story-next').click();}else if(event.key==='ArrowLeft'){event.preventDefault();$('story-back').click();}});
 // A BFCache restore must never retain a previous preview's implicit choice.
 document.defaultView?.addEventListener('pagehide',()=>{if(dialog.open)close();});
 return Object.freeze({snapshot:model.snapshot,close});
}
mountCenweiPreview(document);
