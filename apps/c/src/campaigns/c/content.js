// Development geometry and numeric seed. No final-art or difficulty certification claim.
// Story contract: full v1.1 SHA256 4dfcfba4fb686dfec5e9b0ac5bce22a70323f8ff68b1712048c661ee89328f1f.
import { createCampaign, deepFreeze } from '../../core/campaign.js';

const flag = (id) => ({flag:id});
const dock = (id) => ({dock:`C-M0${id}`});
const op = (id,x,y,title,requires,effects,storyId) => ({id,x,y,title,kind:'operation',requires,effects,storyId});
const shore = (id,title,map,entities) => ({id,title,map,arrival:{x:7,y:7},entities:[{id:`${id}.boat`,x:5,y:7,title:'经唯一跳板登船',kind:'anchor'},...entities]});
const deckRegion='C-D01';
const grid1=["~~~~~~~~~~~","~~~~~~~...~","~~~~~~~...~","~~~~BBB#..~","~~~~BBB...~","~~~~BBB...~","~~~~BBB...~","~~~~BB....~","~~~~BBB#..~","~~~~~~~...~","~~~~~~~~~~~"];
const grid2=["~~~~~~~~~~~","~~~~~~~...~","~~~~~~~...~","~~~~BBB#..~","~~~~BBB...~","~~~~BBB...~","~~~~BBB...~","~~~~BB....~","~~~~BBB#..~","~~~~~~~...~","~~~~~~~~~~~"];
const grid3=["~~~~~~~~~~~","~~~~~~~...~","~~~~~~~...~","~~~~BBB#..~","~~~~BBB...~","~~~~BBB...~","~~~~BBB...~","~~~~BB....~","~~~~BBB#..~","~~~~~~~...~","~~~~~~~~~~~"];
const grid4=["~~~~~~~~~~~","~~~~~~~...~","~~~~~~~...~","~~~~BBB#..~","~~~~BBB...~","~~~~BBB...~","~~~~BBB...~","~~~~BB....~","~~~~BBB#..~","~~~~~~~...~","~~~~~~~~~~~"];
const grid5=["~~~~~~~~~~~","~~~~~~~...~","~~~~~~~...~","~~~~BBB#..X","~~~~BBB...X","~~~~BBB...X","~~~~BBB...~","~~~~BB....~","~~~~BBB#..~","~~~~~~~...~","~~~~~~~~~~~"];
const deck=["~~~~~~~~~~~","~~~.....~~~","~~~.....~~~","~~~#.#.#~~~","~~~.....~~~","~~~.....~~~","~~~.....~~~","~~~.....~~~","~~~.....~~~","~~~.....~~~","~~~~~~~~~~~"];

// One metric hull for berth, deck inset, GAL and an optional 3D view adapter.
// Grid transforms are uniform similarities, never independent X/Z fit-to-box scales.
export const VOYAGE_VESSEL_GEOMETRY = deepFreeze({
  version:'1.2',geometryId:'C_FERRY_HULL_01',units:'metres',axes:{X:'starboard',Y:'up',Z:'stern (bow is negative Z)'},
  hull:{beam:3,length:6,deckY:0.8,waterlineY:0,bottomY:-0.5,
    outlineXZ:[[0,-3],[1.5,-2.4],[1.5,3],[-1.5,3],[-1.5,-2.4]],
    bottomOutlineXZ:[[0,-2.7],[1.1,-2.15],[1.1,2.7],[-1.1,2.7],[-1.1,-2.15]],
    meshPolicy:'Extrude these same rings once; every view reuses this geometry ID with rigid pose and uniform camera zoom only'},
  deckSampling:{pitch:0.6,originXYZ:[-3,0.8,-2.7],xStepXYZ:[0.6,0,0],yStepXYZ:[0,0,0.6],
    walkableBounds:{minX:3,maxX:7,minY:1,maxY:9},reservedRackCells:[[3,3],[5,3],[7,3]],actorRadius:0.18},
  berthSampling:{metresPerCell:1,hullOriginGrid:[5,5.5],hullEnvelopeGrid:[3.5,2.5,6.5,8.5],
    gangwayCenterlineGrid:[[6,7],[7,7]],gangwayWidth:0.45},
  fixtures:{
    cargoRack:{poses:{left:[3,3],center:[5,3],right:[7,3]},crateHalfExtentsXZ:[0.22,0.2],reservedInAllStates:true},
    ballastSlots:{L1:[3,4],L2:[3,6],C1:[5,4],C2:[5,6],R1:[7,4],R2:[7,6],
      mounting:'shallow recessed sockets with flush walk-rated lids between atomic adjustments; visible marked weight tops, never tall collision walls'},
    gateWinch:{body:[5,3],handle:[4,3],operator:[4,4],fairleadXYZ:[0.8,1,-2.3],
      cablePathXZ:[[0,-0.9],[0.8,-2.3],[2,-2.5]]},
    cargoDavit:{body:[8,3],handle:[8,2],operator:[7,2],hullMountXYZ:[1.35,0.8,-1.25],
      outboardHousingXYZ:[1.8,0.95,-0.9],handleXYZ:[1.8,1.1,-1.5],
      connection:'Rigid bracket from in-hull foot to outboard housing; visible forward shaft joins housing and handwheel'},
    bowObserver:[4,2],guideRopeOperator:[6,5],helm:[5,8],gangwayStand:[7,7],gangwayHotspot:[8,7],
    smallCargoLocker:{grid:[5,7],mounting:'flush deck hatch; contents are part of baseline load'},
    securedSword:{visible:false,legacyAnchorRetired:[2,7],sourceScene:'c16',placement:'put safely aside out of shot; do not invent a visible rack or hang it outside the hull'},
    sternSignal:{grid:[7,9],mounting:'rail-mounted shuttered signal, distinct from mooring cleat'},
    mooring:{operationStand:[7,9],bowFairleadXYZ:[1.4,0.85,-2.2],sternFairleadXYZ:[1.4,0.85,2.7],
      shoreBollardsGrid:[[7,3],[7,8]],signalDoesNotOperateLines:true}
  },
  views:{deck:'same mesh, full hull inside grid boundary [-.5,10.5]; no widening to fill 11 columns',
    berth:'same mesh inside original 3-by-6 conservative B footprint; gangplank overlaps the starboard hull-edge cell',
    gal:'same mesh and fixture coordinates; legal state overlays and camera crop, never mirrored',
    world:'Right-handed boat axes X starboard/Y up/Z stern; right-handed world axes X east/Y up/Z south. Apply berth yaw and uniform scale; positive determinant including M04 yaw180'},
  migration:{fromContentHash:'f56a71f169fbe102',automatic:false,
    reason:'The old deck had removed floor cells; old states/certificates remain in their old content namespace. Start a new run or replay actions under this identity.'}
});
const xyz = p => Array.isArray(p)?p:[p.x,p.y];
export function voyageDeckToVessel(point) {
  const [x,y]=xyz(point);return [0.6*(x-5),0.8,0.6*y-2.7].map(n=>Number(n.toFixed(9)));
}
export function voyageVesselToBerth([X,Y,Z]) { return [5+X,5.5+Z].map(n=>Number(n.toFixed(9))); }
export function voyageDeckToBerth(point) { return voyageVesselToBerth(voyageDeckToVessel(point)); }
export function voyageVesselToWorld(point,regionTransform) {
  const [x,y]=voyageVesselToBerth(point),a=regionTransform.yaw_deg*Math.PI/180,s=regionTransform.scale;
  return [regionTransform.origin[0]+s*(x*Math.cos(a)-y*Math.sin(a)),point[1]*s,
    regionTransform.origin[1]+s*(x*Math.sin(a)+y*Math.cos(a))].map(n=>Number(n.toFixed(9)));
}

export function createVoyageSpec() {
  const regions=[
    shore('C-M01','近灯正面装卸码头',grid1,[
      op('c.manifest',9,2,'核对货单、航线与次晨归船',null,{flags:{'c.manifest':true}},'c01'),
      {id:'c.coat',x:9,y:5,title:'护航护具 · 5金币，防御+2',kind:'shop',price:5,effects:{stats:{def:2}}},
      op('c.departureBrief',7,3,'确认三人出航分工',flag('c.manifest'),{flags:{'c.crewReady':true}},'c02')
    ]),
    shore('C-M02','旧修船坞',grid2,[
      {id:'c.supplies',x:9,y:5,title:'领取预备螺栓与2份船油',kind:'pickup',effects:{resources:{fuel:2},flags:{'c.bolts':true}},storyId:'c05'},
      {id:'c.machine1',x:8,y:3,title:'轨道巡检车一 · 短航道障碍',kind:'enemy',blocking:true,enemy:{name:'岸电巡检车一',hp:40,atk:16,def:4,gold:3}},
      {id:'c.bandage',x:9,y:8,title:'一次性护航药包 · 当前/上限生命+12',kind:'pickup',effects:{stats:{hp:12,maxHp:12}}}
    ]),
    shore('C-M03','缆桥中转站',grid3,[
      op('c.shoreLock',7,3,'让塞蕾娜接管岸锁、约定口令',null,{flags:{'c.shoreLock':true}},'c08'),
      {id:'c.machine2',x:8,y:1,title:'轨道巡检车二 · 后段短航道障碍',kind:'enemy',blocking:true,enemy:{name:'岸电巡检车二',hp:48,atk:15,def:6,gold:3}}
    ]),
    shore('C-M04','近灯背面泊位',grid4,[
      op('c.handover',9,2,'确认近灯交班与纱雾末段航行',null,{flags:{'c.handover':true}},'c13')
    ]),
    shore('C-M05','远灯内侧泊位与低灯室',grid5,[
      op('c.rollCargo',8,5,'沿短滚道把已卸灯座送入低灯室',[{cargo:'ashore'},flag('c.craneStowed')],{flags:{'c.cargoAtLamp':true}},'c16'),
      op('c.installLamp',9,2,'安装灯座、螺栓与封装灯油',[flag('c.cargoAtLamp'),flag('c.bolts'),flag('c.lampOil')],{flags:{'c.lampInstalled':true,'c.bolts':false,'c.lampOil':false}},'c17'),
      op('c.signal',7,3,'与近灯互认灯号并开放内港窄口',[flag('c.lampInstalled'),flag('c.nearLampStaffed'),flag('c.ferryStaffed')],{flags:{'c.bothLamps':true,'c.farLampStaffed':true}},'c18')
    ]),
    {id:deckRegion,title:'渡船甲板 · 同一艘船',map:deck,arrival:{x:7,y:7},entities:[
      {id:'c.deckGangway',x:8,y:7,title:'返回当前泊位',kind:'anchor',interactionAt:{x:7,y:7}},
      {id:'c.helm',x:5,y:8,title:'舵位 / 离岸确认',kind:'anchor'},
      {id:'c.ballast',x:5,y:5,title:'三枚配重控制位',kind:'anchor'},
      ...[2,3,4,5].map(n=>({...op(`c.moor${n}`,7,9,n===5?'双缆系泊远灯内侧':'按口令完成安全靠泊',[dock(n),{moored:false},{cargo:'center'},{balance:true}],{moored:true,flags:{[`c.moored${n}`]:true}},n===3?'c07':n===5?'c15':null),visibleWhen:dock(n)})),
      {...op('c.shiftLeft',5,3,'把灯座左移，露出船端绞盘',[dock(3),{moored:true},{cargo:'center'},flag('c.shoreLock')],{cargo:'left'},'c08'),visibleWhen:dock(3)},
      {...op('c.openBarrier',4,3,'牵引开浮栅，收到岸锁回应',[dock(3),{moored:true},{cargo:'left'},{balance:true},flag('c.shoreLock')],{flags:{'c.barrierOpen':true}},'c08'),interactionAt:{x:4,y:4},visibleWhen:dock(3)},
      {...op('c.centerCargo',5,3,'浮栅作业完成，货架归中',[dock(3),{moored:true},{cargo:'left'},flag('c.barrierOpen')],{cargo:'center'},'c10'),visibleWhen:dock(3)},
      {...op('c.shiftRight',5,3,'把灯座移到右舷固定吊点',[dock(5),{moored:true},{cargo:'center'}],{cargo:'right'},'c16'),visibleWhen:dock(5)},
      {...op('c.unload',8,2,'确认配平，手摇船吊臂卸货',[dock(5),{moored:true},{cargo:'right'},{balance:true}],{cargo:'ashore',flags:{'c.cargoAshore':true}},'c16'),interactionAt:{x:7,y:2},visibleWhen:dock(5)},
      {...op('c.stow',8,2,'空船配平后收妥空吊臂',[dock(5),{moored:true},{cargo:'ashore'},{balance:true}],{flags:{'c.craneStowed':true,'c.emptyShipSecured':true}},'c16'),interactionAt:{x:7,y:2},visibleWhen:dock(5)}
    ]}
  ];
  const transitions=regions.filter(r=>r.id!==deckRegion).map(r=>({id:`${r.id}.board`,title:'登船',anchor:`${r.id}.boat`,to:deckRegion,requires:[{dock:r.id},{moored:true}]}));
  transitions.push({id:'c.leaveDeck',title:'回到当前泊位岸上',anchor:'c.deckGangway',to:'@dock',requires:{moored:true}});
  const depart=(id,from,to,cost,title,requirements,storyId,effects={})=>({id,anchor:'c.helm',to:deckRegion,at:{x:5,y:8},title,requires:[dock(from),{moored:true},{cargo:'center'},{balance:true},...requirements],cost:{fuel:cost},departure:{from:`C-M0${from}`,to:`C-M0${to}`},storyId,effects});
  transitions.push(
    depart('c.sail12',1,2,2,'离岸至旧坞 · 2油',[flag('c.manifest'),flag('c.crewReady')],'c04'),
    depart('c.sail23.short',2,3,3,'短航道至缆桥 · 3油',[flag('c.bolts'),{cleared:'c.machine1'}],'c07',{flags:{'c.route1':'short'}}),
    depart('c.sail23.bypass',2,3,4,'绕航道至缆桥 · 4油',[flag('c.bolts')],'c07',{flags:{'c.route1':'bypass'}}),
    depart('c.sail34.short',3,4,3,'浮栅后短道至近灯背面 · 3油',[flag('c.barrierOpen'),{cleared:'c.machine2'}],'c11',{flags:{'c.route2':'short'}}),
    depart('c.sail34.bypass',3,4,4,'浮栅后绕道至近灯背面 · 4油',[flag('c.barrierOpen')],'c11',{flags:{'c.route2':'bypass'}}),
    depart('c.sail45',4,5,2,'末航段至远灯 · 2油',[flag('c.handover')],'c14',{flags:{'c.nearLampStaffed':true,'c.ferryStaffed':true}})
  );
  return {
    id:'voyage-c',difficulty:'normal',version:'c-rules-prototype-v1.2-geometry',title:'双灯夜航 · 规则原型',
    source:{fullSha256:'4dfcfba4fb686dfec5e9b0ac5bce22a70323f8ff68b1712048c661ee89328f1f',outlineSha256:'22dc7a6b0419aeb9f61869625f850b92f5d609c27c96d3be0cbfc566593edcd0'},
    initial:{location:{regionId:'C-M01',x:7,y:7},stats:{hp:60,maxHp:60,atk:14,def:8,gold:8},resources:{fuel:9},flags:{'c.lampOil':true},boat:{dock:'C-M01',moored:true,cargo:'center',positions:{w1:'L1',w2:'L2',w3:'C1'}}},
    regions,transitions,vesselGeometry:VOYAGE_VESSEL_GEOMETRY,
    visualLinks:[{id:'c.winch',regionId:deckRegion,body:{x:5,y:3},controlEntityId:'c.openBarrier',operator:{x:4,y:4},meaning:'同一牵引绞盘：机身与侧面手柄，非遥控装置'},{id:'c.davit',regionId:deckRegion,body:{x:8,y:3},controlEntityId:'c.unload',otherControlEntityIds:['c.stow'],operator:{x:7,y:2},meaning:'同一右舷吊臂：舷外机架与前侧手轮，固定支座在船体内；操作者不站在右货架下'}],
    ballast:{deckRegion,control:'c.ballast',weights:{w1:1,w2:1,w3:2},slots:{L1:-1,L2:-1,C1:0,C2:0,R1:1,R2:1},slotCoordinates:{L1:[3,4],L2:[3,6],C1:[5,4],C2:[5,6],R1:[7,4],R2:[7,6]},cargoTorques:{center:0,left:-2,right:2,ashore:0}},
    goal:[flag('c.bothLamps'),flag('c.farLampStaffed'),flag('c.nearLampStaffed'),flag('c.ferryStaffed'),flag('c.emptyShipSecured'),{cargo:'ashore'},{moored:true},{balance:true}]
  };
}
export const createVoyageCampaign=()=>createCampaign(createVoyageSpec());
