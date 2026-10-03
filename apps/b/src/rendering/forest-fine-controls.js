import {fineGroundSample} from './forest-fine-navigation.js';
import {nativeToScreen} from './forest-world-native.js';
const polygons=new Map();
export function fineControlPolygon(node,camera,view){
 const id=`${node.source.regionId}:${node.id}`;let points=polygons.get(id);if(!points){
  for(const half of [.125,.1,.075,.05]){points=[[-half,-half],[half,-half],[half,half],[-half,half]].map(([dx,dy])=>fineGroundSample(node.x+dx,node.y+dy,node.source.regionId));if(points.every(Boolean))break;}
  if(points.some(p=>!p))return null;polygons.set(id,points);
 }
 return points.map(p=>nativeToScreen(p.footPx,camera,view));
}
export function projectFineControl(tile,node,camera,view){
 const points=fineControlPolygon(node,camera,view);if(!points){tile.hidden=true;return false;}
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y),left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;
 if(!(width>0&&height>0))return false;
 Object.assign(tile.style,{position:'absolute',left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`,clipPath:`polygon(${points.map(p=>`${100*(p.x-left)/width}% ${100*(p.y-top)/height}%`).join(',')})`});return true;
}

export function nearestFineControl(geometry,px,py,camera,view){
 let best=null,distance=Infinity;for(const node of geometry.nodes.values()){const p=nativeToScreen(node.sample.footPx,camera,view),d=Math.hypot(px-p.x,py-p.y);if(d<distance){distance=d;best=node;}}
 return distance<=24*view.scale?best?.id??null:null;
}
