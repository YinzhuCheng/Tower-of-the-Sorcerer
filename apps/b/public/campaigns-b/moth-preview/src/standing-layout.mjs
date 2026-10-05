// Layout uses measured available space, never scales or edits source PNG pixels.
// It leaves the existing dialogue box unchanged and keeps the full-body frame
// above its actual upper edge, including wrapped/long dialogue and window resize.
export function standingFrameLayout({stage,body,heading,bodyHidden=false}){
 const finite=rect=>rect&&['top','bottom','height'].every(k=>Number.isFinite(rect[k]));
 if(!finite(stage)||stage.height<=0||!finite(heading)||(!bodyHidden&&!finite(body)))return {visible:false,top:0,bottom:0,height:0};
 const top=Math.max(16,heading.bottom-stage.top+12);
 const bottom=bodyHidden?16:Math.max(16,stage.bottom-body.top+8);
 const height=Math.max(0,stage.height-top-bottom);
 return {visible:height>=80,top,bottom,height};
}
export function createStandingLayout({window,dialog,stage,body,heading,frame}){
 let pending=null;
 const apply=()=>{
  pending=null;
  if(!dialog.open){frame.hidden=true;return;}
  const layout=standingFrameLayout({stage:stage.getBoundingClientRect?.(),body:body.getBoundingClientRect?.(),heading:heading?.getBoundingClientRect?.(),bodyHidden:body.hidden});
  frame.hidden=!layout.visible;frame.style.top=layout.top+'px';frame.style.bottom=layout.bottom+'px';frame.dataset.availableHeight=String(layout.height);
 };
 function refresh(){if(pending!==null)return;if(window?.requestAnimationFrame)pending=window.requestAnimationFrame(apply);else apply();}
 const observer=window?.ResizeObserver?new window.ResizeObserver(refresh):null;
 for(const node of [stage,body,heading])if(node)observer?.observe(node);
 window?.addEventListener?.('resize',refresh);
 dialog.addEventListener('keydown',refresh);dialog.addEventListener('click',refresh);
 return Object.freeze({refresh,hide(){if(pending!==null)window?.cancelAnimationFrame?.(pending);pending=null;frame.hidden=true;}});
}
