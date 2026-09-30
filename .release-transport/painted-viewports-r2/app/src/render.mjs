import {heroPlacement} from './core.mjs';
export function tracePolygon(ctx,polygon){ctx.beginPath();polygon.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();}
/** Never creates a cropped bitmap: source RGBA and original semantic sheet-space clip only. */
export function drawOriginalHero(ctx,image,view,foot,nativeAdultHeight){
 const placement=heroPlacement(view,foot,nativeAdultHeight);
 ctx.save();ctx.translate(...placement.origin);ctx.scale(placement.scale,placement.scale);
 tracePolygon(ctx,view.clipPolygon);ctx.clip();
 const [x,y,w,h]=view.sourceRect;ctx.drawImage(image,x,y,w,h,x,y,w,h);ctx.restore();
 return placement;
}
/** A mask can only restore the SAME original source pixels; never reveal an invented lower layer. */
export function redrawOriginalOccluder(ctx,image,mask){ctx.save();tracePolygon(ctx,mask.polygon);ctx.clip();ctx.drawImage(image,0,0);ctx.restore();}
