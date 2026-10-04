import {createCenweiPreview,PREVIEW_CHOICES,WAIT_SCENE,GREETING_SCENE} from './preview-model.js';
import {presentCenweiPreview as presentForestGal,clearCenweiPreview as clearForestGal} from './preview-stage.js';
import {createForestGalReader} from '../../src/rendering/forest-gal-reader.js';

export function mountCenweiPreview(document){
 const $=id=>document.getElementById(id),model=createCenweiPreview(),dialog=$('story');
 const nodes={dialog,backdrop:$('story-backdrop'),actors:$('story-actors'),portrait:$('story-portrait'),label:$('story-art-label'),stage:$('story-stage')};
 const reader=createForestGalReader({...nodes,body:$('story-body'),historyButton:$('story-history'),historyPanel:$('story-history-panel'),historyEntries:$('story-history-entries'),historyClose:$('story-history-close'),hideButton:$('story-hide'),restoreButton:$('story-restore'),historyTitle:$('story-history-title')},{createElement:tag=>document.createElement(tag)});
 let opener=$('preview-start'),readerScene=null,readerSceneKey=null;
 const handledEvents=new WeakSet();
 const body=$('story-body');let readPress=null;
 const isEditable=target=>/^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName??'')||target?.isContentEditable||!!target?.closest?.('[contenteditable]:not([contenteditable="false"])');
 const isControl=target=>!!target?.closest?.('button,a,input,textarea,select,summary,[role="button"],#story-choices,.story-reading-tools,#preview-speaker-badge,[contenteditable]:not([contenteditable="false"])');
 const hasSelection=()=>String(document.getSelection?.()??document.defaultView?.getSelection?.()??'').trim().length>0;
 const reading=()=>dialog.open&&reader.mode==='reading'&&!body.hidden&&!body.inert;
 const modified=event=>event.ctrlKey||event.metaKey||event.altKey||event.shiftKey;
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
  $('story-next').textContent=s.canNext?'继续 ›':s.atChoice&&!s.response?'请选择回应':'本段完';
  $('story-next').onclick=event=>once(event,()=>{if(model.next(s.revision)){render();if($('story-next').disabled)($('preview-reunion').hidden?$('preview-menu'):$('preview-reunion')).focus();}});
  $('story-back').onclick=event=>once(event,()=>{if(model.back(s.revision)){render();if($('story-back').disabled)$('story-next').focus();}});
  $('preview-reunion').hidden=!(s.atEnd&&scene.sceneId===WAIT_SCENE&&s.response);
  $('preview-reunion').onclick=event=>once(event,()=>{if(model.reunion(s.revision)){render();$('story-next').focus();}});
  $('preview-end').hidden=!(s.atEnd&&(scene.sceneId===GREETING_SCENE||!!s.response));
  $('preview-end').textContent=scene.sceneId===WAIT_SCENE?'本段试读到此，可以继续模拟溪边重逢':'本段试读到此，可以返回目录试读其他分支';
  body.scrollTop=0;
  reader.sync(readerScene,s.index,'');
 }
 function close(){if(!dialog.open)return;readPress=null;reader.reset();clearForestGal(nodes);model.close();readerScene=readerSceneKey=null;dialog.close();opener?.focus();}
 function open(sceneId,response,button){readPress=null;opener=button;reader.reset();clearForestGal(nodes);readerScene=readerSceneKey=null;model.open(sceneId,response);render();if(!dialog.open)dialog.showModal();$('story-next').focus();}
 $('preview-start').onclick=()=>open(WAIT_SCENE,null,$('preview-start'));
 for(const button of document.querySelectorAll('[data-preview-response]'))button.onclick=()=>open(GREETING_SCENE,button.dataset.previewResponse||null,button);
 $('story-close').onclick=close;$('preview-menu').onclick=close;
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(!reader.dismiss())close();});
 // A GAL-style reading surface with preview-only safety guards. Controls keep
 // native activation; text selection, drags, composition and held keys do not
 // advance. No stage click or wheel event reverses or commits story state.
 body.addEventListener('pointerdown',event=>{
  readPress=null;
  if(!reading()||modified(event)||(event.button??0)!==0||isControl(event.target))return;
  readPress={id:event.pointerId,x:event.clientX,y:event.clientY,revision:model.snapshot().revision,moved:false};
 });
 body.addEventListener('pointermove',event=>{if(readPress&&event.pointerId===readPress.id&&Math.hypot(event.clientX-readPress.x,event.clientY-readPress.y)>8)readPress.moved=true;});
 body.addEventListener('pointercancel',()=>{if(readPress)readPress.moved=true;});
 body.addEventListener('scroll',()=>{if(readPress)readPress.moved=true;});
 body.addEventListener('click',event=>{
  const press=readPress;readPress=null;
  if(!reading()||event.defaultPrevented||modified(event)||(event.button??0)!==0||event.detail>1||(event.detail>0&&!press)||isControl(event.target)||hasSelection()||press?.moved||(press&&press.revision!==model.snapshot().revision))return;
  once(event,()=>{body.focus({preventScroll:true});$('story-next').click();});
 });
 dialog.addEventListener('keydown',event=>{
  if(event.defaultPrevented||!reading()||isEditable(event.target))return;
  const advanceKey=event.key==='Enter'||event.key===' ';
  if(event.repeat||event.isComposing||modified(event)||hasSelection()){
   if(advanceKey)event.preventDefault();
   return;
  }
  if(event.key==='Enter'){
   if(isControl(event.target))return; // Native button Enter produces one click.
   event.preventDefault();once(event,()=>$('story-next').click());
  }else if(event.key==='ArrowRight'){event.preventDefault();once(event,()=>$('story-next').click());}
  else if(event.key==='ArrowLeft'){event.preventDefault();once(event,()=>$('story-back').click());}
 });
 dialog.addEventListener('wheel',event=>{
  if(!reading()||event.defaultPrevented||!Number.isFinite(event.deltaY)||modified(event)||isEditable(event.target)||isControl(event.target)||hasSelection()||event.target?.closest?.('#story-history-panel'))return;
  const dy=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?Math.max(1,body.clientHeight||800):1);
  if(dy>=-12||Math.abs(event.deltaX??0)>=Math.abs(event.deltaY))return;
  // Let a long dialogue scroll back to its own top before opening the backlog.
  if(body.contains(event.target)&&body.scrollTop>0)return;
  event.preventDefault();readPress=null;once(event,()=>$('story-history').click());
 },{passive:false});
 // A BFCache restore must never retain a previous preview's implicit choice.
 document.defaultView?.addEventListener('pagehide',()=>{if(dialog.open)close();});
 return Object.freeze({snapshot:model.snapshot,close});
}
mountCenweiPreview(document);
