import {polyline,strip} from './depth.mjs';
/** Hand-measured source-pixel silhouettes from immutable harbor.png (1586x992).
 * Original source redraw only: this file adds no raster, repaint, translucency,
 * hidden floor or navigation authority. Status: r3 proposal awaiting real Chrome.
 * Physical planes follow R7/M03 main bridge near Z=-6.06, far Z=-8.34, Y=5;
 * lower flight near X=11.12. See qa/R3-REPAIR-REGISTER.md. */
const all=['low_public','upper_public'],near={normal:[0,0,1],constant:-6.06},far={normal:[0,0,1],constant:-8.34};
const nearTop=[[354,457],[395,447],[435,437],[476,426],[533,412],[575,401],[617,390],[658,380],[700,369],[739,359],[779,349],[819,339],[858,329],[897,319],[936,309],[975,299],[1014,289],[1053,279],[1093,269],[1132,259],[1171,249],[1210,239],[1248,229],[1274,223]];
const railY=x=>{const i=nearTop.findIndex(p=>p[0]>=x);if(i<=0)return nearTop[0][1];const a=nearTop[i-1],b=nearTop[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);};
// Individually sampled post centres; spacing in the painting is NOT regular.
const postXs=[354,395.5,435.5,489,531.5,575,620,661.5,701.5,741,780,815.5,852,891,929,967,1006,1044,1084,1123,1161.5,1195.5,1231.5,1273];
const nearPosts=postXs.flatMap((x,i)=>{const y=railY(x);return [strip([x,y+2],[x,y+58],i===0||i===postXs.length-1?7:5.8),strip([x-3.8,y+1],[x+3.8,y+1],5)];});
const farTop=[[385,402],[419,393],[455,384],[491,375],[529,365],[568,355],[608,345],[647,335],[685,325],[724,315],[761,305],[799,295],[839,285],[876,276],[914,266],[952,257],[992,247],[1031,237],[1070,227],[1109,217],[1145,208],[1184,198],[1222,189],[1263,179],[1304,168]];
const farPosts=farTop.filter((_,i)=>i!==2&&i!==5&&i!==8&&i!==10&&i!==12&&i!==14&&i!==16&&i!==18&&i!==20&&i!==22).map(([x,y],i)=>strip([x,y-2],[x,y+42],i===0?6:4.5));
const mask=(id,surfaceIds,depthPlane,polygons,sourceObjects)=>({id,enabled:true,status:'CALIBRATED_PROPOSAL_BROWSER_REVIEW_PENDING',surfaceIds,depthPlane,polygons,sourceObjects});
export const HARBOR_OCCLUDERS=[
 mask('main-bridge-deck-low-only',['low_public'],{normal:[0,1,0],constant:5},[
 [[354,503],[1274,269],[1306,211],[385,443]],
 ],['main_bridge']),
 mask('main-bridge-front-beam-low-only',['low_public'],near,[[[353,502],[1276,268],[1276,287],[354,524]]],['main_bridge']),
 mask('main-bridge-near-rail',all,near,[...polyline(nearTop.map(([x,y])=>[x,y+3.3]),8.5),...polyline(nearTop.map(([x,y])=>[x,y+25]),1.8),...polyline(nearTop.map(([x,y])=>[x,y+47-(x-354)*5/920]),9),...nearPosts],['main bridge south rail']),
 mask('west-corner-post',all,near,[[[348,455],[354,452],[360,455],[360,518],[354,522],[348,518]]],['main bridge west near corner post']),
 mask('main-bridge-far-rail',all,far,[...polyline(farTop,5.5),...polyline(farTop.map(([x,y])=>[x,y+23]),1.7),...farPosts],['main bridge north rail']),
 mask('east-lower-flight-near-handrail',['east_lower_flight','east_middle','low_public'],{normal:[1,0,0],constant:11.12},[
 ...polyline([[1279,414],[1312,438],[1410,595]],4.1),
 ...polyline([[1312,450],[1410,607]],1.7),
 strip([1279,414],[1281,456],3),strip([1312,438],[1312,478],3.6),
 strip([1327,462],[1327,500],2.5),strip([1341,484],[1341,527],2.5),strip([1361,517],[1361,556],2.5),strip([1378,544],[1378,576],2.5),strip([1396,574],[1396,610],2.5),strip([1410,595],[1410,629],4),
 ],['east_lower_flight near handrail']),
];
