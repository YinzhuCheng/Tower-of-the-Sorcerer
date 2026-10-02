// Purposefully limited DOM mock, never browser/layout/GPU evidence.
export class Node {
 constructor(tag,doc){this.tagName=tag;this.ownerDocument=doc;this.children=[];this.textContent='';this.attrs={};this.dataset={};this.style={};this.hidden=false;this.disabled=false;this.open=false;this.value='';this.className='';this.events={};this.classList={add:(x)=>{this.className+=' '+x;},toggle:()=>{}};}
 append(...nodes){for(const n of nodes){n.parentElement=this;this.children.push(n);}}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 setAttribute(k,v){this.attrs[k]=String(v);}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
 showModal(){this.open=true;}close(){this.open=false;}
 focus(){this.ownerDocument.activeElement=this;}
 all(){return this.children.flatMap(n=>[n,...n.all()]);}
 find(text){return this.all().find(n=>n.tagName==='button'&&n.textContent===text);}
 get text(){return [this.textContent,...this.children.map(n=>n.text)].join('\n');}
}
export function documentMock(){
 const nodes=new Map(),events={},doc={events,activeElement:null,createElement:tag=>new Node(tag,doc),getElementById:id=>{if(!nodes.has(id))nodes.set(id,new Node(['opening-dialog','story','confirmation'].includes(id)?'dialog':'div',doc));return nodes.get(id);},querySelector:selector=>selector==='dialog[open]'?[...nodes.values()].find(n=>n.tagName==='dialog'&&n.open)??null:null,querySelectorAll:selector=>selector==='[data-dir]'?directions:[],addEventListener:(k,fn)=>{(events[k]??=[]).push(fn);}};
 const directions=['up','down','left','right'].map(dir=>{const n=new Node('button',doc);n.dataset.dir=dir;return n;});doc.directions=directions;doc.nodes=nodes;return doc;
}
