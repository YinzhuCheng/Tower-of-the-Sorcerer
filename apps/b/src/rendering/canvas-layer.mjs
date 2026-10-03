// Pixel transport is part of the real draw path, not just a raw-RGBA proof.
export class HeroCanvasLayer {
 constructor({createCanvas,ImageDataClass=globalThis.ImageData}={}){this.createCanvas=createCanvas??((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;});this.ImageDataClass=ImageDataClass;this.canvas=null;}
 upload(frame){if(!this.canvas||this.canvas.width<frame.width||this.canvas.height<frame.height){const w=2**Math.ceil(Math.log2(frame.width)),h=2**Math.ceil(Math.log2(frame.height));this.canvas=this.createCanvas(w,h);}const ctx=this.canvas.getContext('2d');ctx.clearRect(0,0,this.canvas.width,this.canvas.height);ctx.putImageData(new this.ImageDataClass(frame.data,frame.width,frame.height),0,0);return this.canvas;}
 draw(ctx,frame,{atlasOriginPx=[0,0],displayZoom=1}={}){const canvas=this.upload(frame);ctx.save();try{ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(canvas,0,0,frame.width,frame.height,(frame.originPx[0]-atlasOriginPx[0])*displayZoom,(frame.originPx[1]-atlasOriginPx[1])*displayZoom,frame.width/frame.scale*displayZoom,frame.height/frame.scale*displayZoom);}finally{ctx.restore();}}
}
