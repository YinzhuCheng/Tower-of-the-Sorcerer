// Reconstructed presentation artwork. All coordinates are relative to the
// existing native foot anchor. No gameplay state, colliders or RNG live here.
export const FOREST_PROP_REVISION='forest-holistic-reconstruction-r1';
const TAU=Math.PI*2;
function polygon(c,points,fill,stroke='#34382d',width=1){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,points,color,width=1){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c,x,y,rx,ry,fill,stroke=null,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function gradient(c,y0,y1,colors){const g=c.createLinearGradient(0,y0,0,y1);colors.forEach((v,i)=>g.addColorStop(i/(colors.length-1),v));return g;}
function pin(c,x,y,r=1.55){ellipse(c,x,y,r,r,'#38423c','#c3b77d',.65);ellipse(c,x-.3,y-.4,r*.25,r*.25,'#e8d8a2');}
function beam(c,a,b,width=5){line(c,[a,b],'#3c3c2b',width+2);line(c,[a,b],gradient(c,Math.min(a[1],b[1]),Math.max(a[1],b[1])+1,['#b0a176','#827049','#5f563b']),width);line(c,[[a[0]-.8,a[1]-.7],[b[0]-.8,b[1]-.7]],'#c7b17d',.8);}
function wheel(c,x,y,rx=9,ry=10,broken=false){
 c.save();c.translate(x,y);if(broken)c.rotate(-.28);
 if(broken){c.beginPath();c.ellipse(0,0,rx,ry,0,.28,TAU-1.2);c.strokeStyle='#4c4532';c.lineWidth=4;c.stroke();c.beginPath();c.ellipse(0,0,rx,ry,0,.3,TAU-1.2);c.strokeStyle='#a99565';c.lineWidth=1.7;c.stroke();}
 else{ellipse(c,0,0,rx,ry,'#4c4532','#34392d',1.4);ellipse(c,0,0,rx-2.2,ry-2.3,'#777455','#b7a473',1);}
 for(let i=0;i<7;i++){if(broken&&i===5)continue;const a=i*TAU/7;line(c,[[0,0],[Math.cos(a)*(rx-2.5),Math.sin(a)*(ry-2.5)]],'#c0aa76',1.15);}
 ellipse(c,0,0,2.7,3.1,'#7f7652','#3c4030',1);pin(c,-.25,-.3,1.15);c.restore();
}
function log(c,x,y,length=32,r=4.5){
 polygon(c,[[x,y-r],[x+length,y-r-7],[x+length,y+r-7],[x,y+r]],gradient(c,y-r-7,y+r,['#8e7851','#675b3f','#414b36']),'#3c4831',.9);
 for(let i=0;i<3;i++)line(c,[[x+2,y-r+1.5+i*2],[x+length-1,y-r-5.2+i*2]],i%2?'#aa9161':'#505038',.65);
 ellipse(c,x,y,r*.62,r,'#bca26e','#554f35',.9);ellipse(c,x,y,r*.32,r*.64,null,'#85754c',.6);ellipse(c,x,y,.7,1.1,'#6a6440');
}
function timberPuppet(c){
 // A low, sagging chassis, mismatched broken front wheel, rear timber load,
 // and a jointed loading arm define the story's old transport puppet.
 beam(c,[-25,-11],[22,-19],5);beam(c,[-18,-6],[30,-15],4);
 wheel(c,22,-13,8.5,9.5);wheel(c,-22,-2,8,5.8,true);
 polygon(c,[[-27,-24],[16,-34],[34,-25],[-9,-14]],gradient(c,-34,-14,['#b49a64','#7d7250']),'#474b33',1.2);
 polygon(c,[[-27,-24],[-9,-14],[-9,-8],[-27,-18]],'#766545');
 polygon(c,[[-9,-14],[34,-25],[33,-18],[-9,-8]],gradient(c,-25,-8,['#7e704d','#5a5940']));
 for(let k=0;k<4;k++)line(c,[[-25+k*10,-24-k*2.1],[-8+k*10,-15-k*2.1]],'#d0b177',.8);
 log(c,2,-28,25,4.4);log(c,8,-24,25,4.8);log(c,4,-35,26,4.3);log(c,12,-31,23,4.1);log(c,12,-40,21,3.8);
 line(c,[[18,-43],[15,-38],[14,-26],[20,-22]],'#3e4a36',3);line(c,[[18,-43],[15,-38],[14,-26],[20,-22]],'#bdb084',1.2);
 beam(c,[-19,-25],[-18,-47],6);beam(c,[-18,-46],[-34,-58],5);beam(c,[-34,-58],[-43,-39],4.2);
 pin(c,-18,-46,3);pin(c,-34,-58,2.6);pin(c,-43,-39,1.8);
 line(c,[[-43,-39],[-47,-34],[-45,-29]],'#3f4c42',2.4);line(c,[[-43,-39],[-39,-33],[-41,-28]],'#73816c',2.4);
 polygon(c,[[-23,-44],[-11,-44],[-10,-32],[-23,-30]],gradient(c,-45,-30,['#bca775','#827451']),'#3c4634',1.2);
 line(c,[[-21,-38],[-13,-39]],'#303e34',1.8);ellipse(c,-19,-38,1,.8,'#c5ce9d');ellipse(c,-14,-38,1,.8,'#c5ce9d');
 wheel(c,15,-4,9,10);beam(c,[-24,-6],[-14,-4],2.7);
 for(const [x,y]of[[-22,-20],[-10,-10],[29,-21],[-18,-29]])pin(c,x,y,1.3);
 for(const [x,y]of[[-19,-18],[-7,-12],[8,-18],[25,-26]])line(c,[[x,y],[x+4,y-1]],'#d0bc85',.65);
 line(c,[[-31,1],[-27,4],[-22,2]],'#9a8559',1.7);line(c,[[-34,3],[-29,5]],'#5e6545',.8);
}
function guardPlate(c){
 polygon(c,[[-14,-24],[-6,-29],[12,-25],[16,-18],[8,-2],[-1,2],[-12,-10]],gradient(c,-29,2,['#c3c5aa','#829785','#637f73']),'#3d594d',1.3);
 polygon(c,[[-11,-22],[-5,-26],[10,-22],[12,-18],[5,-5],[-1,-2],[-9,-11]],null,'#d2cdac',1);
 line(c,[[-3,-24],[-2,-5]],'#d2d1ae',2);line(c,[[-8,-15],[8,-14]],'#456458',1);
 for(const p of[[-8,-21],[8,-20],[-6,-11],[4,-7]])pin(c,...p,1);line(c,[[5,-24],[3,-20],[6,-18]],'#426258',.8);
}
function heatBox(c){
 // Deliberately small brass/wood heat case. Anchor is bottom-center.
 polygon(c,[[-17,-26],[7,-32],[19,-25],[-5,-18]],gradient(c,-32,-18,['#c4b37b','#8f9062']),'#536044',1.1);
 polygon(c,[[-17,-26],[-5,-18],[-5,-3],[-17,-11]],gradient(c,-26,-3,['#8a8257','#5a684b']),'#4a5840');
 polygon(c,[[-5,-18],[19,-25],[18,-10],[-5,-3]],gradient(c,-25,-3,['#99936a','#6b7451']),'#44543f');
 line(c,[[-16,-21],[-5,-13],[18,-20]],'#c2b47c',1.8);line(c,[[-5,-18],[-5,-3]],'#c5b279',1.6);
 line(c,[[-4,-30],[-4,-36],[4,-38],[10,-34],[10,-30]],'#43533f',2.2);line(c,[[-3,-30],[-3,-35],[4,-36],[9,-33]],'#c7ba80',1);
 for(let i=0;i<4;i++)line(c,[[1+i*3.3,-16-i*.9],[1+i*3.3,-9-i*.9]],'#424e38',1.25);
 polygon(c,[[1,-20],[5,-21],[5,-16],[1,-15]],'#c5ad60','#6b6540',.6);pin(c,3,-18,1);
 for(const p of[[-13,-23],[-13,-13],[15,-22],[14,-12]])pin(c,...p,.75);
}
function planningBundle(c){
 // Loose plan resting on its own low folding stand, no enormous opaque box.
 beam(c,[-15,-3],[-10,-26],3);beam(c,[13,-5],[11,-29],3);beam(c,[-14,-4],[14,-22],2);
 polygon(c,[[-23,-24],[7,-33],[25,-24],[-7,-14]],gradient(c,-33,-14,['#bca374','#877852']),'#535d40',1.1);
 polygon(c,[[-17,-25],[5,-31],[17,-25],[-5,-18]],'#d4c79e','#a39670',.8);
 line(c,[[-11,-25],[-2,-25],[3,-28],[9,-25],[5,-22]],'#829177',.8);line(c,[[-10,-22],[-6,-21],[0,-23]],'#947d53',.7);
 line(c,[[12,-28],[18,-20]],'#726743',1.4);ellipse(c,-15,-25,1.8,1.1,'#8d7750');ellipse(c,12,-23,1.6,1,'#7d7d53');
}
function routeBrief(c){
 beam(c,[-3,-2],[0,-40],4);polygon(c,[[-19,-43],[16,-46],[20,-31],[-16,-27]],gradient(c,-46,-27,['#b5a57a','#8b8c62']),'#566246',1.1);
 line(c,[[-11,-36],[0,-37],[7,-41]],'#dcd1a3',1.7);line(c,[[0,-37],[9,-34]],'#dcd1a3',1.7);for(const p of[[-13,-40],[13,-41],[-11,-30],[14,-34]])pin(c,...p,.8);
}
export function forestPropKind(o){if(o.id==='b01.timberPuppet')return'timber-puppet';if(o.id==='b01.guardPlate')return'guard-plate';if(o.id==='b03.heatBox')return'heat-box';if(o.id==='b02.winterPlan')return'winter-plan';if(o.kind==='anchor')return'anchor';return'route-brief';}
export function forestPropBounds(o){return forestPropKind(o)==='timber-puppet'?{left:-53,top:-66,right:41,bottom:12}:{left:-30,top:-52,right:30,bottom:10};}
export function forestPropContacts(o){switch(forestPropKind(o)){case'timber-puppet':return[{x:-22,y:2,rx:10,ry:3,opacity:.26},{x:15,y:5,rx:10,ry:3,opacity:.3},{x:22,y:-9,rx:7,ry:2.5,opacity:.16}];case'guard-plate':return[{x:0,y:0,rx:12,ry:3,opacity:.2}];case'heat-box':return[{x:1,y:-2,rx:15,ry:4,opacity:.23}];case'winter-plan':return[{x:-14,y:-1,rx:4,ry:2,opacity:.25},{x:13,y:-3,rx:4,ry:2,opacity:.25}];case'anchor':return[];default:return[{x:0,y:0,rx:5,ry:2,opacity:.23}];}}
export function drawForestProp(c,o){const kind=forestPropKind(o);c.save();c.lineCap='round';c.lineJoin='round';if(kind==='timber-puppet')timberPuppet(c);else if(kind==='guard-plate')guardPlate(c);else if(kind==='heat-box')heatBox(c);else if(kind==='winter-plan')planningBundle(c);else if(kind!=='anchor')routeBrief(c);c.restore();return kind;}
export function drawForestContact(c,contact){const{x,y,rx,ry,opacity=.24}=contact;c.save();c.translate(x,y);c.scale(rx,ry);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(27,43,27,${opacity})`);g.addColorStop(.45,`rgba(27,43,27,${opacity*.62})`);g.addColorStop(1,'rgba(27,43,27,0)');ellipse(c,0,0,1,1,g);c.restore();}
