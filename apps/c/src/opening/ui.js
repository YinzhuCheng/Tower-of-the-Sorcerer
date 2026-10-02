import {applyOpeningPortrait} from './portraits.js';
// Re-rendered callbacks carry an epoch; detached/double clicks remain inert.
export function mountOpening(root,controller,{document:doc=root.ownerDocument,onChange=()=>{}}={}){
  let message='',buttons=[];
  const el=(tag,text,cls)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  function run(command,epoch,label){
    const result=controller.present(command,epoch);message=result.ok?'':result.reason;render();onChange(controller.snapshot());
    const focus=buttons.find(n=>n.textContent===label&&!n.disabled)??buttons.find(n=>['读完，进入实际码头','结束回顾','继续阅读'].includes(n.textContent));
    focus?.focus?.({preventScroll:true});
  }
  function button(parent,label,command,v,disabled=false,cls=''){
    const n=el('button',label,cls);n.disabled=disabled;n.type='button';n.onclick=()=>{if(!n.disabled)run(command,v.epoch,label);};parent.append(n);buttons.push(n);return n;
  }
  function render(){
    const v=controller.snapshot();buttons=[];root.replaceChildren();
    root.append(el('p','候选 C · 出航之前','opening-eyebrow'));
    root.append(el('h1','一顿热饭之后'));
    root.append(el('p','角色头像接入预览 · 场景背景与 CG 尚未完成','opening-scope'));
    const details=el('details',undefined,'opening-scope');details.append(el('summary','版本与画面范围'));
    details.append(el('p','52 句新写开场，沿用封存正文；角色头像沿用已验收设定。岸侧桌窗为离地图提案，头像不表示坐姿、站位或动作。读完才启动原固定视角地图与存档流程。开场阅读进度不存档。'));root.append(details);
    const status=el('p',message,'opening-status');status.setAttribute('role','status');root.append(status);
    if(!v.open){
      root.append(el('p',v.finished?'开场回顾已结束':'阅读已关闭。游戏尚未启动；继续阅读或跳至结尾，再明确点“读完”。','opening-paused'));
      button(root,v.finished?'回顾新开场':'继续阅读','reopen',v);return;
    }
    const card=el('section',undefined,'opening-card');card.setAttribute('aria-label','开场阅读');
    const head=el('div',undefined,'opening-chapter');head.append(el('p','岸侧饭桌 · 文字场景提案','opening-eyebrow'),el('h2',v.turn.sceneTitle),el('p',`${v.index+1} / ${v.total}`,'opening-progress'));card.append(head);
    const line=el('div',undefined,'opening-turn');line.setAttribute('data-turn-id',v.turn.id);
    const portrait=el('img',undefined,'opening-portrait'),fallback=el('p','','opening-image-fallback');fallback.hidden=true;fallback.setAttribute('role','status');
    const art=applyOpeningPortrait(portrait,v.turn,fallback);if(art){line.className+=' opening-has-portrait';line.append(portrait);const failed=portrait.onerror;portrait.onerror=()=>{failed();line.className='opening-turn';};}
    const text=el('div',undefined,'opening-copy');text.append(el('p',v.turn.speaker,'opening-speaker'));
    const content=el('p',v.turn.text,'opening-text');content.setAttribute('data-story-text','true');text.append(content,fallback);line.append(text);card.append(line);
    const nav=el('div',undefined,'opening-controls');nav.setAttribute('aria-label','阅读控制');button(nav,'上一句','back',v,v.index===0);button(nav,'下一句','next',v,v.index===v.total-1,'opening-primary');
    if(v.index===v.total-1)button(nav,v.finished?'结束回顾':'读完，进入实际码头','finish',v,false,'opening-primary');card.append(nav);
    const secondary=el('div',undefined,'opening-secondary');button(secondary,'跳至结尾（不确认作业）','skip',v);button(secondary,'关闭阅读','close',v);card.append(secondary);root.append(card);
  }
  render();return Object.freeze({render});
}
