import {createMothPreview,portraitRequestForTurn,defaultExpressionForTurn} from './preview-model.mjs';
import {createMothPortraitStage,createBrowserDependencies} from './portrait-stage.mjs';
import {createStandingLayout} from './standing-layout.mjs';
import {createForestGalReader} from '../vendor/b-source/forest-gal-reader.js';

export function mountMothPreview(document,{dependencies=createBrowserDependencies(document.defaultView)}={}){
 const $=id=>document.getElementById(id),model=createMothPreview(),dialog=$('story');
 const nodes={dialog,backdrop:$('story-backdrop'),actors:$('story-actors'),portrait:$('story-portrait'),label:$('story-art-label'),stage:$('story-stage'),standing:$('preview-standing'),largePortrait:$('preview-large-portrait')};
 const stage=createMothPortraitStage(nodes,{dependencies});
 const reader=createForestGalReader({...nodes,body:$('story-body'),historyButton:$('story-history'),historyPanel:$('story-history-panel'),historyEntries:$('story-history-entries'),historyClose:$('story-history-close'),hideButton:$('story-hide'),restoreButton:$('story-restore'),historyTitle:$('story-history-title')},{createElement:tag=>document.createElement(tag)});
 let opener=$('preview-start'),readerScene=null,readerSceneKey=null,artOpen=false,selectedExpression='neutral',inspectorEscapeHeld=false;
 const handledEvents=new WeakSet();
 const body=$('story-body');let readPress=null;
 const standingLayout=createStandingLayout({window:document.defaultView,dialog,stage:nodes.stage,body,heading:$('story-location').parentElement,frame:$('preview-standing-frame')});
 const isEditable=target=>/^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName??'')||target?.isContentEditable||!!target?.closest?.('[contenteditable]:not([contenteditable="false"])');
 const isControl=target=>!!target?.closest?.('button,a,input,textarea,select,summary,[role="button"],#story-choices,.story-reading-tools,#preview-speaker-badge,[contenteditable]:not([contenteditable="false"])');
 const hasSelection=()=>String(document.getSelection?.()??document.defaultView?.getSelection?.()??'').trim().length>0;
 const reading=()=>dialog.open&&reader.mode==='reading'&&!body.hidden&&!body.inert&&!artOpen;
 const modified=event=>event.ctrlKey||event.metaKey||event.altKey||event.shiftKey;
 const once=(event,action)=>{if(event&&handledEvents.has(event))return;if(event)handledEvents.add(event);action();};
 function render(){
  const s=model.snapshot();if(!s.scene)return;const {scene,turn}=s;
  if(scene.sceneId!==readerSceneKey){readerSceneKey=scene.sceneId;readerScene=scene;}
  $('story-title').textContent=scene.title;$('story-speaker').textContent=turn.speaker;$('story-copy').textContent=turn.text;
  $('story-progress').textContent=`${s.index+1} / ${scene.turns.length}`;$('story-location').textContent='B06 · 石坎旁 · 候选文字';
  $('preview-scenario').textContent=scene.title+' · '+scene.description;
  dialog.dataset.sceneId=scene.sceneId;dialog.dataset.turnId=turn.id;dialog.dataset.choices='false';
  selectedExpression=defaultExpressionForTurn(turn)??'neutral';
  syncArtTools();void stage.present(scene,turn,{expressionId:selectedExpression});
  $('story-choices').replaceChildren();$('preview-reunion').hidden=true;
  $('story-next').disabled=!s.canNext;$('story-back').disabled=!s.canBack;
  $('story-next').textContent=s.canNext?'继续 ›':'本段完';
  $('story-next').onclick=event=>once(event,()=>{if(model.next(s.revision)){render();if($('story-next').disabled)$('preview-menu').focus();}});
  $('story-back').onclick=event=>once(event,()=>{if(model.back(s.revision)){render();if($('story-back').disabled)$('story-next').focus();}});
  $('preview-end').hidden=!s.atEnd;$('preview-end').textContent='本段试读结束；不会记录遭遇、战斗、生命或奖励';
  body.scrollTop=0;reader.sync(readerScene,s.index,'');dialog.dataset.narration=String(!portraitRequestForTurn(turn));standingLayout.refresh();
 }
 function close(){if(!dialog.open)return;standingLayout.hide();inspectorEscapeHeld=false;closeArtTools(false);readPress=null;reader.reset();stage.clear();model.close();readerScene=readerSceneKey=null;dialog.close();opener?.focus();}
 function open(sceneId,button){inspectorEscapeHeld=false;closeArtTools(false);readPress=null;opener=button;reader.reset();stage.clear();readerScene=readerSceneKey=null;model.open(sceneId);render();if(!dialog.open)dialog.showModal();standingLayout.refresh();$('story-next').focus();}
 $('preview-start').onclick=()=>open('portrait_check',$('preview-start'));
 for(const button of document.querySelectorAll('[data-preview-scenario]'))button.onclick=()=>open(button.dataset.previewScenario,button);
 $('story-close').onclick=close;$('preview-menu').onclick=close;
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(inspectorEscapeHeld)return;if(artOpen){closeArtTools();return;}if(!reader.dismiss())close();});
 // The art inspector is a separate, initially hidden sibling of the story
 // body. Its controls and large image never increase the dialogue-box height.
 function syncArtTools(){
  const eligible=!!portraitRequestForTurn(model.snapshot().turn);
  $('preview-art-open').disabled=!eligible;
  for(const button of document.querySelectorAll('[data-preview-expression]'))button.setAttribute('aria-pressed',String(button.dataset.previewExpression===selectedExpression));
  $('preview-expression-label').textContent=selectedExpression==='alert'?'警戒':selectedExpression==='gentle-smile'?'缓和微笑':'中性';
 }
 function closeArtTools(returnFocus=true){
  artOpen=false;$('preview-art-tools').hidden=true;$('preview-art-open').setAttribute('aria-expanded','false');
  body.inert=reader.mode==='history';nodes.stage.inert=reader.mode!=='reading';if(returnFocus)$('preview-art-open').focus();
 }
 $('preview-art-open').onclick=()=>{
  if(!dialog.open||reader.mode!=='reading'||!portraitRequestForTurn(model.snapshot().turn))return;
  artOpen=true;readPress=null;$('preview-art-tools').hidden=false;$('preview-art-open').setAttribute('aria-expanded','true');body.inert=true;nodes.stage.inert=true;$('preview-art-close').focus();
 };
 $('preview-art-close').onclick=()=>closeArtTools();
 for(const button of document.querySelectorAll('[data-preview-expression]'))button.onclick=()=>{
  const s=model.snapshot();if(!artOpen||!portraitRequestForTurn(s.turn))return;
  selectedExpression=button.dataset.previewExpression;syncArtTools();void stage.present(s.scene,s.turn,{expressionId:selectedExpression});
 };
 document.addEventListener('keydown',event=>{
  if(!dialog.open){inspectorEscapeHeld=false;return;}
  if(event.key==='Escape'&&(artOpen||inspectorEscapeHeld)){
   event.preventDefault();event.stopImmediatePropagation?.();
   if(!inspectorEscapeHeld&&!event.repeat){inspectorEscapeHeld=true;closeArtTools();}
   return;
  }
  if(artOpen&&event.key?.toLowerCase()==='h'){event.preventDefault();event.stopImmediatePropagation?.();}
 },true);
 document.addEventListener('keyup',event=>{if(event.key==='Escape')inspectorEscapeHeld=false;});
 document.defaultView?.addEventListener('blur',()=>{inspectorEscapeHeld=false;});
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
 return Object.freeze({snapshot:model.snapshot,close,portraitStatus:stage.snapshot});
}
