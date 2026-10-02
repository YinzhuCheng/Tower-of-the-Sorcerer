// Presentation sizing only. This module has no campaign, state, action or renderer imports.
export const LAYOUT_LIMITS=Object.freeze({desktopWidth:1001,minDesktopMap:352,maxMap:660,grid:11});
export function chooseViewportLayout({viewportWidth,viewportHeight,mainTop,mainPaddingY,sectionChromeY,otherHeight,innerWidth}){
 const width=Math.max(0,innerWidth),desktop=viewportWidth>=LAYOUT_LIMITS.desktopWidth;
 const availableHeight=Math.max(0,viewportHeight-mainTop-mainPaddingY-sectionChromeY-otherHeight);
 const fits=desktop&&availableHeight>=LAYOUT_LIMITS.minDesktopMap&&width>=LAYOUT_LIMITS.minDesktopMap;
 const cap=Math.min(width,LAYOUT_LIMITS.maxMap,fits?availableHeight:Infinity);
 // Integer CSS cells keep fallback canvas and all 121 controls on exactly one square.
 const mapSize=Math.max(LAYOUT_LIMITS.grid,Math.floor(cap/LAYOUT_LIMITS.grid)*LAYOUT_LIMITS.grid);
 return {mode:fits?'desktop-fit':desktop?'desktop-scroll':'mobile',mapSize,availableHeight,innerWidth:width};
}
export function installViewportLayout({document:doc=document,window:win=window}={}){
 const root=doc.documentElement,header=doc.querySelector('header'),main=doc.querySelector('main'),section=doc.querySelector('.exploration'),stage=doc.querySelector('.map-stage'),aside=doc.querySelector('aside');
 if(!header||!main||!section||!stage||!aside)return {snapshot:()=>null,destroy(){}};
 let raf=0,disposed=false,last=null;
 const px=n=>Number.parseFloat(n)||0;
 const styles=e=>win.getComputedStyle(e);
 function measure(){
  raf=0;if(disposed)return;
  const cs=styles(section),ms=styles(main),other=[...section.children].filter(e=>e!==stage);
  const otherHeight=other.reduce((sum,el)=>{const s=styles(el);return s.display==='none'?sum:sum+el.getBoundingClientRect().height+px(s.marginTop)+px(s.marginBottom);},0);
  const input={viewportWidth:win.innerWidth,viewportHeight:win.innerHeight,mainTop:main.getBoundingClientRect().top,mainPaddingY:px(ms.paddingTop)+px(ms.paddingBottom),sectionChromeY:px(cs.paddingTop)+px(cs.paddingBottom)+px(cs.borderTopWidth)+px(cs.borderBottomWidth),otherHeight,innerWidth:section.clientWidth-px(cs.paddingLeft)-px(cs.paddingRight)};
  last={...chooseViewportLayout(input),input};
  if(root.dataset.cLayout!==last.mode)root.dataset.cLayout=last.mode;
  const next=`${last.mapSize}px`;if(stage.style.getPropertyValue('--measured-map-size')!==next)stage.style.setProperty('--measured-map-size',next);
 }
 function schedule(){if(!raf&&!disposed)raf=win.requestAnimationFrame(measure);}
 const observer=new win.ResizeObserver(schedule);for(const el of [header,section,...section.children].filter(e=>e!==stage))observer.observe(el);
 win.addEventListener('resize',schedule);doc.fonts?.ready?.then(schedule);
 // The CSS defaults already separate desktop/mobile. Read actual chrome after initial render.
 measure();schedule();
 const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
 return {refresh:schedule,snapshot:()=>({last,viewport:{width:win.innerWidth,height:win.innerHeight},map:rect(stage),controls:rect(section.querySelector('.direction-pad')),notice:rect(section.querySelector('.prototype')),aside:rect(aside),page:{scrollWidth:root.scrollWidth,scrollHeight:root.scrollHeight},fitsViewport:stage.getBoundingClientRect().bottom<=win.innerHeight&&section.querySelector('.direction-pad').getBoundingClientRect().bottom<=win.innerHeight&&section.querySelector('.prototype').getBoundingClientRect().bottom<=win.innerHeight,minimumDesktopCell:LAYOUT_LIMITS.minDesktopMap/11}),destroy(){disposed=true;if(raf)win.cancelAnimationFrame(raf);observer.disconnect();win.removeEventListener('resize',schedule);}};
}
