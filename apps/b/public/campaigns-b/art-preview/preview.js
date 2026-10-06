import {ART_PREVIEW_ENTRIES,createArtPreviewScene} from './preview-model.js';
import {presentForestGal,clearForestGal} from '../../src/rendering/forest-gal-stage.js';
import {createForestGalReader} from '../../src/rendering/forest-gal-reader.js';
export function mountArtPreview(document){
 const $=id=>document.getElementById(id),dialog=$('story');
 const nodes={dialog,backdrop:$('story-backdrop'),actors:$('story-actors'),portrait:$('story-portrait'),label:$('story-art-label'),stage:$('story-stage')};
 const reader=createForestGalReader({...nodes,body:$('story-body'),historyButton:$('story-history'),historyPanel:$('story-history-panel'),historyEntries:$('story-history-entries'),historyClose:$('story-history-close'),hideButton:$('story-hide'),restoreButton:$('story-restore'),historyTitle:$('story-history-title')},{createElement:tag=>document.createElement(tag)});
 let scene=null,index=0,opener=null;
 function render(){
  const turn=scene.turns[index];
  dialog.dataset.sceneId=scene.sceneId;dialog.dataset.turnId=turn.id;
  $('story-title').textContent=scene.title;$('story-speaker').textContent=turn.speaker;
  $('story-copy').textContent=turn.text;$('story-progress').textContent=`${index+1} / ${scene.turns.length}`;
  $('story-location').textContent=turn.stage.locationId;
  $('story-back').disabled=index===0;
  presentForestGal(nodes,scene,turn);reader.sync(scene,index,'');$('story-body').scrollTop=0;
 }
 function close(){reader.reset();clearForestGal(nodes);scene=null;index=0;delete dialog.dataset.sceneId;delete dialog.dataset.turnId;if(dialog.open)dialog.close();opener?.focus();}
 function open(turnId,button){reader.reset();clearForestGal(nodes);({scene,index}=createArtPreviewScene(turnId));opener=button;render();if(!dialog.open)dialog.showModal();$('story-next').focus();}
 const entries=$('art-preview-entries');
 for(const entry of ART_PREVIEW_ENTRIES){const button=document.createElement('button');button.type='button';button.textContent=entry.label;button.dataset.previewTurnId=entry.turnId;button.onclick=()=>open(entry.turnId,button);entries.append(button);}
 $('story-next').onclick=()=>{if(!scene||reader.mode!=='reading')return;if(index+1===scene.turns.length)close();else{index++;render();}};
 $('story-back').onclick=()=>{if(scene&&reader.mode==='reading'&&index>0){index--;render();}};
 $('story-skip').onclick=()=>{if(!scene||reader.mode!=='reading')return;if(index===scene.turns.length-1)close();else{index=scene.turns.length-1;render();}};
 $('story-close').onclick=close;$('story-pause').onclick=close;
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(!reader.dismiss())close();});
 dialog.addEventListener('keydown',event=>{if(event.defaultPrevented||event.repeat||event.isComposing||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||reader.mode!=='reading')return;if(/^(INPUT|TEXTAREA|SELECT)$/.test(event.target?.tagName??''))return;if(event.key==='ArrowRight'){event.preventDefault();$('story-next').click();}else if(event.key==='ArrowLeft'){event.preventDefault();$('story-back').click();}});
 document.defaultView?.addEventListener('pagehide',close);
 return Object.freeze({close});
}
if(typeof document!=='undefined')mountArtPreview(document);
