export class Element {
 constructor(tag='div',id='',ownerDocument=null){this.tagName=tag.toUpperCase();this.id=id;this.ownerDocument=ownerDocument;this.dataset={};this.style={};this.attributes={};this.events=new Map();this.children=[];this.hidden=false;this.inert=false;this.disabled=false;this.open=false;this.textContent='';this.scrollTop=0;this.scrollHeight=100;this.clientHeight=200;this.parentElement=null;this.naturalWidth=1254;this.naturalHeight=1254;}
 append(...children){for(const child of children){child.parentElement=this;this.children.push(child);}}
 replaceChildren(...children){this.children=[];this.append(...children);}
 setAttribute(k,v){this.attributes[k]=String(v);}removeAttribute(k){delete this.attributes[k];if(k==='src')this.src='';}
 addEventListener(type,fn,options){const rows=this.events.get(type)??[];rows.push({fn,capture:Boolean(options===true||options?.capture)});this.events.set(type,rows);}
 removeEventListener(type,fn){this.events.set(type,(this.events.get(type)??[]).filter(row=>row.fn!==fn));}
 emit(type,data={}){const event={type,target:this,detail:0,button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.propagationStopped=true;},stopImmediatePropagation(){this.immediateStopped=true;},...data};for(const {fn}of [...(this.events.get(type)??[])].sort((a,b)=>Number(b.capture)-Number(a.capture))){fn(event);if(event.immediateStopped)break;}if(!event.immediateStopped&&this['on'+type])this['on'+type](event);return event;}
 click(){if(!this.disabled)this.emit('click');}focus(){if(this.ownerDocument)this.ownerDocument.activeElement=this;}
 showModal(){this.open=true;}close(){this.open=false;}
 contains(node){for(let n=node;n;n=n.parentElement)if(n===this)return true;return false;}
 closest(selector){for(let n=this;n;n=n.parentElement){if(selector.split(',').some(part=>{part=part.trim();if(part.startsWith('#'))return n.id===part.slice(1);if(part.startsWith('.'))return (n.className??'').split(' ').includes(part.slice(1));if(/^[a-z]+$/i.test(part))return n.tagName===part.toUpperCase();if(part==='[role="button"]')return n.attributes.role==='button';if(part.includes('contenteditable'))return n.isContentEditable;return false;}))return n;}return null;}
 querySelector(){return null;}querySelectorAll(){return [];}async decode(){}
}
export function createDocument(){
 const document=new Element('document');document.defaultView=new Element('window');document.selection='';document.getSelection=()=>document.selection;
 const ids=['story','story-backdrop','story-actors','story-portrait','story-art-label','story-stage','story-body','story-history','story-history-panel','story-history-entries','story-history-close','story-hide','story-restore','story-history-title','preview-start','story-title','story-speaker','story-copy','story-progress','story-location','preview-scenario','story-choices','story-next','story-back','preview-reunion','preview-end','preview-menu','story-close','preview-speaker-badge','preview-standing','preview-large-portrait','preview-art-open','preview-art-tools','preview-art-close','preview-expression-label','preview-standing-frame'];
 const buttons=new Set(['story-history','story-history-close','story-hide','story-restore','preview-start','story-next','story-back','preview-reunion','preview-menu','story-close','preview-art-open','preview-art-close']);
 const nodes=Object.fromEntries(ids.map(id=>[id,new Element(buttons.has(id)?'button':id==='story-portrait'?'img':'div',id,document)]));
 nodes.story.append(nodes['story-body'],nodes['story-stage'],nodes['story-history-panel']);nodes['story-body'].append(nodes['story-copy'],nodes['preview-speaker-badge'],nodes['story-next'],nodes['story-back'],nodes['story-history'],nodes['story-hide']);nodes['preview-speaker-badge'].append(nodes['story-portrait']);
 nodes['preview-standing'].naturalWidth=1024;nodes['preview-standing'].naturalHeight=1536;nodes['preview-art-tools'].hidden=true;
 document.expressions=['neutral','alert','gentle-smile'].map(id=>{const n=new Element('button',id,document);n.dataset.previewExpression=id;return n;});
 nodes['story-location'].parentElement=new Element('div','heading',document);
 document.variants=['intro','after_hurt','after_unhurt','leave'].map(id=>{const n=new Element('button',id,document);n.dataset.previewScenario=id;return n;});
 document.getElementById=id=>nodes[id]??null;document.querySelectorAll=selector=>selector==='[data-preview-scenario]'?document.variants:selector==='[data-preview-expression]'?document.expressions:[];document.createElement=tag=>new Element(tag,'',document);
 return {document,nodes,$:id=>nodes[id]};
}
export const stageNodes=()=>{const {document,$}=createDocument();return {document,dialog:$('story'),portrait:$('story-portrait'),actors:$('story-actors'),backdrop:$('story-backdrop'),label:$('story-art-label'),stage:$('story-stage')};};
export const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
