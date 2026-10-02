import { createCampaign } from '../../core/campaign.js';
import { FOREST_GEOGRAPHY, FOREST_CONNECTIONS, regionId } from './geography.js';

export const FOREST_SOURCE = Object.freeze({
  fullVersion:'1.1',fullSha256:'5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f',
  outlineVersion:'1.2',outlineSha256:'cd7ec8c8ae0835cc8cb02d069c1d8d5dc22d935ba77ff214337860773e63b350',
  roadsSha256:'9f7c70715421e2869514ed429639ba27b320434e017dd9a5ae6b17a2f90c3dc2'
});
export const FOREST_VALVES = ['b05.valveClosed','b10.valveClosed','b20.valveClosed','b25.valveClosed'];
export const FOREST_WEDGE_SITES = [7,16,21,24];
export const FOREST_WARM_POINTS = [
  {region:17,id:'greenhouse',cost:2,title:'温室密封内间',storyId:'b17_offer'},
  {region:18,id:'pear',cost:1,title:'老梨树分根脱暖',storyId:'b18_offer'},
  {region:19,id:'lodge',cost:2,title:'候车暖屋一冬底温',storyId:'b19_offer'}
];
const f=id=>({flag:id}), done=id=>({cleared:id}), no=id=>({not:f(id)});
const bid=n=>`b${String(n).padStart(2,'0')}`;
export const forestPublicCondition=n=>({any:[{all:[f(`${bid(n)}.originalCleared`),f(`${bid(n)}.originalWorksDone`)]},{all:[f(`${bid(n)}.rootFixed`),f(`${bid(n)}.rootWorksDone`)]}]});
export const FOREST_RING_REQUIREMENTS = [
  f('b01.basicEntrance'), f('b06.freightCleared'), forestPublicCondition(7), f('b09.realBridgeBuilt'),
  f('b10.supportsInstalled'), f('b10.valveClosed'), f('b11.roadRepaired'), forestPublicCondition(16),
  f('b19.ordinaryLodgeReady'),f('b20.supportsInstalled'),f('b20.valveClosed'),f('b20.northExitReady'),
  forestPublicCondition(21),f('b22.upperRoadChecked')
];
export const FOREST_READY_REQUIREMENTS = [
  ...FOREST_VALVES.map(f),f('b23.ringOpen'),f('b05.waterInsulated'),f('b25.gravityWaterTested'),
  f('b15.winterSuppliesDelivered'),f('b04.housingReady'),f('b14.residentLodgingAgreed'),f('b24.handrailInstalled')
];
const sceneFor = n => FOREST_GEOGRAPHY[n-1].story;

export function createForestSpec() {
  const regions=FOREST_GEOGRAPHY.map(g=>({id:g.id,title:g.title,map:[...g.map],arrival:{...g.points.a},entities:[],archetype:g.archetype,worldPosition:[...g.worldPosition],landmarks:[g.landmark],storyId:g.story}));
  const add=(n,point,entity)=>{const p=FOREST_GEOGRAPHY[n-1].points[point];if(!p)throw new Error(`Missing B anchor ${n}:${point}`);const value={...p,...entity};regions[n-1].entities.push(value);return value;};
  const op=(n,p,id,title,requires,effects,storyId,extra={})=>add(n,p,{id,kind:'operation',title,requires,effects,storyId,...extra});
  const take=(n,p,id,title,effects,storyId)=>add(n,p,{id,kind:'pickup',title,effects,storyId});
  const enemy=(n,p,id,name,hp,atk,def,gold,extra={})=>add(n,p,{id,kind:'enemy',title:name,blocking:true,enemy:{name,hp,atk,def,gold},...extra});
  const stat=(n,p,id,title,stats)=>take(n,p,id,title,{stats});

  enemy(1,'e','b01.timberPuppet','旧运木偶',32,14,4,3,{effects:{flags:{'b01.basicEntrance':true}},storyId:'b01_post'});
  stat(1,'f','b01.guardPlate','护送旧护片 · 防御+2',{def:2});
  op(2,'d','b02.winterPlan','听取住民自选去处与基础越冬分工',f('b01.basicEntrance'),{flags:{'b02.winterPlanKnown':true}},'b02_enter');
  take(3,'c','b03.heatBox','领取唯一节火匣 · 暖脂8份，四阀保留4份',{resources:{heat:8},flags:{'b03.heatBoxOwned':true}},'b03_rules');
  op(3,'e','b03.routeBrief','查看四阀、三暖点及四处根楔的全部用途',f('b03.heatBoxOwned'),{flags:{'b03.routeBriefKnown':true}},'b03_exit');
  op(4,'c','b04.housing','检查集中住所的门窗、试烧和分担搬运',f('b02.winterPlanKnown'),{flags:{'b04.housingReady':true}},'b04_enter');
  stat(4,'f','b04.bandages','学舍现存护送药包 · 生命/上限+35',{hp:35,maxHp:35});
  enemy(5,'e','b05.sluicePuppet','取水维护偶',44,17,6,4);
  op(5,'f','b05.valve','关闭第一支阀 · 暖脂1份',[f('b03.heatBoxOwned'),done('b05.sluicePuppet'),{resource:'heat',min:1}],{resources:{heat:-1},flags:{'b05.valveClosed':true}},'b05_valve');
  op(5,'g','b05.pipeWorks','现场接好普通保温管，保留自然溪水',f('b05.valveClosed'),{flags:{'b05.waterInsulated':true}},'b05_valve');
  enemy(6,'e','b06.sawPuppet','倒杉锯木偶',54,20,7,5);
  op(6,'d','b06.freightWorks','清走倒杉与弹石，把主货道清到轻车宽度',done('b06.sawPuppet'),{flags:{'b06.freightCleared':true}},'b06_post');
  stat(6,'c','b06.edgeTool','有限磨刃石 · 攻击+3',{atk:3});
  enemy(6,'f','b06.sideTender','石坎旧检枝偶',52,23,10,5);
  stat(6,'g','b06.resinFragments','普通树脂换存的药包 · 生命/上限+25，不补节火匣',{hp:25,maxHp:25});
  take(7,'c','b07.wedges','领取仅有的两枚缚根楔 · 07/16/21/24四点共用',{resources:{wedges:2},flags:{'b07.wedgesOwned':true}},'b07_rules');
  stat(8,'c','b08.campSupply','首次宿营现存补给 · 生命/上限+60',{hp:60,maxHp:60});
  op(8,'d','b08.firewood','拨开进气口，留下明晨的柴',null,{flags:{'b08.morningWoodKept':true}},'b08_night');
  enemy(9,'e','b09.foundationRig','旧石基拖拽架',68,23,9,6);
  op(9,'g','b09.bridgeWorks','架梁、钉板、加栏并现场试过分批轻车',done('b09.foundationRig'),{flags:{'b09.realBridgeBuilt':true}},'b09_post',{blocking:true});
  stat(9,'d','b09.rivetGuard','石基工具匣护具 · 防御+2',{def:2});
  op(10,'f','b10.supportWorks','把路根重量交给普通石木支架',null,{flags:{'b10.supportsInstalled':true}},'b10_enter');
  op(10,'e','b10.valve','关闭第二支阀 · 暖脂1份',[f('b03.heatBoxOwned'),f('b10.supportsInstalled'),{resource:'heat',min:1}],{resources:{heat:-1},flags:{'b10.valveClosed':true}},'b10_valve');
  enemy(11,'e','b11.returnPuppet','风铃坡归材偶',76,24,11,8);
  op(11,'d','b11.roadWorks','拆残轨、修防滑绳与货场方向车辙',done('b11.returnPuppet'),{flags:{'b11.roadRepaired':true}},'b11_post');
  stat(11,'f','b11.steelEdge','归材站现存钢片 · 攻击+3',{atk:3});
  op(12,'c','b12.overlook','在望台看清正常季节里的河谷田地与炉烟',null,{flags:{'b12.valleySeen':true}},'b12_enter');
  op(13,'d','b13.freightManifest','核对已换冬料、大车拆载与轻车分批交付',null,{flags:{'b13.freightPlanned':true}},'b13_enter');
  add(13,'f',{id:'b13.coatShop',kind:'shop',title:'护路厚护衣 · 12金币，防御+3，现货一件',price:12,effects:{stats:{def:3}},storyId:'b13_shop'});
  add(13,'g',{id:'b13.edgeShop',kind:'shop',title:'开路钢刃 · 10金币，攻击+3，现货一件',price:10,effects:{stats:{atk:3}},storyId:'b13_shop'});
  add(13,'e',{id:'b13.bandageShop',kind:'shop',title:'普通护送药包 · 6金币，生命+45，可买至金币不足',price:6,once:false,effects:{stats:{hp:45}},storyId:'b13_shop'});
  op(14,'c','b14.lodging','核对住户亲自选择的床位、食宿与期限',f('b02.winterPlanKnown'),{flags:{'b14.residentLodgingAgreed':true}},'b14_enter');
  op(14,'b','b14.learningPlan','纱雾亲自谈妥一季学习与帮工食宿',f('b14.residentLodgingAgreed'),{flags:{'b14.shawuLearningAgreed':true}},'b14_greenhouse');
  enemy(15,'e','b15.cablePuppet','卷索维护偶',80,26,12,7);
  op(15,'c','b15.cableWorks','工队检修轮组并试载 · 索道仅运物资',done('b15.cablePuppet'),{flags:{'b15.cableLoadTested':true}},'b15_post');
  op(15,'d','b15.deliverWinter','以索道及已修西石路送达基础冬料',[f('b15.cableLoadTested'),f('b14.shawuLearningAgreed'),f('b13.freightPlanned'),f('b06.freightCleared'),forestPublicCondition(7),f('b09.realBridgeBuilt'),f('b10.supportsInstalled'),f('b10.valveClosed'),f('b11.roadRepaired')],{flags:{'b15.winterSuppliesDelivered':true}},'b15_post');
  stat(15,'f','b15.trailPack','货场预留护送包 · 生命/上限+55',{hp:55,maxHp:55});

  stat(15,'g','b15.cableTool','索道仓现存开路工具 · 攻击+2',{atk:2});

  const cuts=[
    [7,'旧拖偶',74,23,8,6,'b07_stone_post','b07_choice'],
    [16,'往返拖架',88,29,13,8,'b16_route','b16_route'],
    [21,'高台张索偶',112,32,15,10,'b21_route','b21_route'],
    [24,'正门压材偶',105,31,14,9,'b24_route','b24_route']
  ];
  for(const [n,name,hp,atk,def,gold,originalStory,rootStory] of cuts){const id=bid(n);
    enemy(n,'e',`${id}.originalEnemy`,name,hp,atk,def,gold,{effects:{flags:{[`${id}.originalCleared`]:true}},storyId:originalStory});
    op(n,'f',`${id}.fixRoot`,'固定既存侧根 · 消耗一枚楔，仅开放人行',[f('b07.wedgesOwned'),{resource:'wedges',min:1}],{resources:{wedges:-1},flags:{[`${id}.rootFixed`]:true}},rootStory,{blocking:true});
    op(n,'e',`${id}.originalWorks`,'原路现场清残件、修栏与验收轻车',[f(`${id}.originalCleared`)],{flags:{[`${id}.originalWorksDone`]:true}},originalStory);
    op(n,'f',`${id}.rootWorks`,'侧根现场铺板补栏加斜撑，隔离旧路后试过轻车',[f(`${id}.rootFixed`)],{flags:{[`${id}.rootWorksDone`]:true}},rootStory);
  }
  for(const warm of FOREST_WARM_POINTS){const id=bid(warm.region);
    op(warm.region,warm.region===19?'e':'c',`${id}.warm${warm.id}`,`为${warm.title}投入${warm.cost}份暖脂 · 不可取回`,[f('b03.heatBoxOwned'),no('b26.heatPlanFrozen'),{resource:'heat',min:warm.cost,reserveUntrueFlags:FOREST_VALVES}],{resources:{heat:-warm.cost},flags:{[`b.warm.${warm.id}`]:true}},warm.storyId,{blockedReason:'热脂须先保留未关闭支阀的份数；封账后的暖点不能再调整'});
  }
  op(17,'d','b17.inspectSeeds','查看可移栽、取种与无法保存的真实范围',null,{flags:{'b17.optionsKnown':true}},'b17_enter');
  op(18,'d','b18.oldSeat','在旧石座旁说清这一次各自愿意做的事',null,{flags:{'b18.wordsSpoken':true}},'b18_private');
  op(19,'c','b19.lodgeWorks','修好普通门窗和柴炉，排好日间通行与清雪',null,{flags:{'b19.ordinaryLodgeReady':true}},'b19_enter');
  stat(19,'d','b19.reservePack','卸料坪最后一份护送补给 · 生命/上限+70',{hp:70,maxHp:70});
  stat(19,'f','b19.snowGuard','候车屋预存防风护片 · 防御+2',{def:2});
  op(20,'e','b20.supportWorks','装好第三支架、清出闸室外侧北脊通路',null,{flags:{'b20.supportsInstalled':true,'b20.northExitReady':true}},'b20_enter');
  op(20,'f','b20.valve','关闭第三支阀 · 暖脂1份',[f('b03.heatBoxOwned'),f('b20.supportsInstalled'),f('b14.shawuLearningAgreed'),{resource:'heat',min:1}],{resources:{heat:-1},flags:{'b20.valveClosed':true}},'b20_valve');
  op(22,'c','b22.inspectUpperRoad','接应工队逐段查过到上门的既有石道',null,{flags:{'b22.upperRoadChecked':true}},'b22_enter');
  op(22,'d','b22.shareDuties','米露重排工作，纱雾只答应离开前两次温标课',[f('b14.shawuLearningAgreed'),f('b22.upperRoadChecked')],{flags:{'b22.dutiesShared':true}},'b22_after');
  stat(22,'e','b22.windGuard','驿台预存护肩与修刃包 · 防御+2，攻击+2',{def:2,atk:2});
  op(23,'e','b23.acceptRing','逐项验收公共环路，实际试通分批轻车',FOREST_RING_REQUIREMENTS,{flags:{'b23.ringOpen':true}},'b23_enter',{blockedReason:'尚有公共路段或基础通行工程未完成；查看逐段施工清单'});
  op(24,'c','b24.retrieveHandrail','通过已施工的库门抬出整根检修扶手',forestPublicCondition(24),{flags:{'b24.handrailRetrieved':true}},'b24_route');
  // The fitting action is physically at the tree-heart veranda, not at the warehouse.
  op(3,'g','b24.installHandrail','在检修入口实装从干根库抬来的扶手',f('b24.handrailRetrieved'),{flags:{'b24.handrailInstalled':true}},'b24_warning');
  op(24,'d','b24.shutdownDiagram','提前查看副柄→护臂→总阀的固定停机顺序',null,{flags:{'b24.shutdownSequenceKnown':true}},'b24_warning');
  op(25,'c','b25.valve','关闭第四支阀 · 暖脂1份',[f('b03.heatBoxOwned'),f('b23.ringOpen'),{resource:'heat',min:1}],{resources:{heat:-1},flags:{'b25.valveClosed':true}},'b25_valve');
  op(25,'d','b25.waterTest','试通已铺重力管，确认普通水源持续流动',f('b25.valveClosed'),{flags:{'b25.gravityWaterTested':true}},'b25_exit');
  op(3,'d','b26.readinessReview','逐项核对四阀、冬料、住所、水路与实装扶手',FOREST_READY_REQUIREMENTS,{flags:{'b26.shutdownReady':true}},'b26_review',{blockedReason:'四阀、公共环路、冬料、住所、水路或检修扶手仍有实际缺项'});
  op(26,'c','b26.supper','在侧院吃完最后一个暖夜的饭',f('b26.shutdownReady'),{flags:{'b26.supperDone':true}},'b26_enter');
  op(26,'e','b26.drawer','纱雾收拾抽屉，带饭去相邻外廊',f('b26.supperDone'),{flags:{'b26.drawerPacked':true}},'b26_shawu');
  // All seven feasible heat configurations are explicit immutable transactions.
  // Their exact remainder moves to public inventory once; no script edits a resource.
  for(let mask=0;mask<8;mask++){
    const selected=FOREST_WARM_POINTS.filter((_,i)=>mask&(1<<i)),spent=selected.reduce((n,w)=>n+w.cost,0);if(spent>4)continue;
    const remaining=4-spent, flags={'b26.heatPlanFrozen':true,'b26.keyHandedOver':true};
    const heatMatch=FOREST_WARM_POINTS.map((w,i)=>({flag:`b.warm.${w.id}`,value:Boolean(mask&(1<<i))}));
    for(const [i,w]of FOREST_WARM_POINTS.entries())flags[`b.ordinary.${w.id}`]=!(mask&(1<<i));
    const requirements=[...FOREST_READY_REQUIREMENTS,f('b26.supperDone'),f('b26.drawerPacked'),no('b26.heatPlanFrozen'),...heatMatch,{resource:'heat',min:remaining},{not:{resource:'heat',min:remaining+1}}];
    op(3,'e',`b26.confirmHeat.${mask}`,`最终确认现有暖点；未投处采用普通方案；余${remaining}份移交公共库存`,requirements,{resources:{heat:-remaining,publicHeat:remaining},flags},'b26_review',{visibleWhen:[no('b26.heatPlanFrozen'),...heatMatch],confirmation:{kind:'irreversible-heat-plan',remaining,selected:selected.map(w=>w.id)}});
  }
  op(27,'c','b27.packPersonalThings','带走茶与便当盖，留下一张供检修休息的折床',f('b26.keyHandedOver'),{flags:{'b27.personalThingsPacked':true}},'b27_enter');
  op(28,'c','b28.serviceLever','先拨检修副柄，露出驱动；总阀保持原位',[f('b26.heatPlanFrozen'),f('b24.shutdownSequenceKnown'),...FOREST_VALVES.map(f)],{flags:{'b28.serviceLeverSet':true}},'b28_pre');
  enemy(28,'e','b28.guardDrive','失灵护根机关',132,32,14,0,{requires:f('b28.serviceLeverSet'),storyId:'b28_post'});
  op(28,'f','b28.stopMainValve','诺克缇娅转总阀，璃落机械锁',[...FOREST_READY_REQUIREMENTS,f('b26.heatPlanFrozen'),f('b28.serviceLeverSet'),done('b28.guardDrive')],{flags:{'b28.mainValveStopped':true}},'b28_post');
  op(29,'c','b29.homecoming','诺克缇娅走回自己的房间，不再续一班值守',[f('b28.mainValveStopped'),f('b27.personalThingsPacked')],{flags:{'b29.noctiaHome':true}},'b29_home');
  op(30,'c','b30.together','这一季一起下山，按约去河谷学习与冬市',[f('b29.noctiaHome'),f('b14.shawuLearningAgreed'),f('b22.dutiesShared'),no('b30.epilogueComplete')],{flags:{'b30.ending':'together','b30.epilogueComplete':true}},'b30_end_together');
  op(30,'d','b30.patrol','留一季巡路，在下一班货队往返时真实重逢',[f('b29.noctiaHome'),f('b14.shawuLearningAgreed'),f('b22.dutiesShared'),no('b30.epilogueComplete')],{flags:{'b30.ending':'patrol','b30.epilogueComplete':true}},'b30_end_two_ends');

  const gateRequirements={ring:f('b23.ringOpen'),ready:f('b26.shutdownReady'),shutdown:[f('b26.heatPlanFrozen'),f('b24.handrailInstalled')],stopped:f('b28.mainValveStopped'),home:f('b29.noctiaHome')};
  const transitions=[];
  for(const [i,c]of FOREST_CONNECTIONS.entries())for(const reverse of [false,true]){
    const from=reverse?c.to:c.from,to=reverse?c.from:c.to,point=reverse?c.toPoint:c.fromPoint,targetPoint=reverse?c.fromPoint:c.toPoint;
    const n=Number(from.slice(2)),destination=FOREST_GEOGRAPHY.find(r=>r.id===to),id=`b.edge.${from.slice(2)}-${to.slice(2)}`;
    add(n,point,{id:`${id}.portal`,kind:'anchor',title:`${c.title} → ${destination.title}`,portal:{connection:i,reverse,to,at:{...destination.points[targetPoint]},capability:'player-foot'}});
    const delayedScenes=[23,26,28,29,30];
    transitions.push({id,anchor:`${id}.portal`,title:`沿${c.title}到${destination.title}`,to,at:{...destination.points[targetPoint]},requires:c.gate?gateRequirements[c.gate]:null,storyId:reverse||delayedScenes.includes(destination.index)?null:sceneFor(destination.index),connection:i,reciprocal:`b.edge.${to.slice(2)}-${from.slice(2)}`,capability:'player-foot'});
  }
  return {id:'forest-b',difficulty:'normal',version:'b-frozen-standard-v1',title:'山路把冬天带回家 · 霜径标准草案',source:{...FOREST_SOURCE},
    initial:{location:{regionId:regionId(1),...FOREST_GEOGRAPHY[0].points.a},stats:{hp:450,maxHp:450,atk:18,def:8,gold:0},resources:{heat:0,wedges:0,publicHeat:0},flags:{}},
    regions,transitions,goal:[...FOREST_READY_REQUIREMENTS,f('b26.heatPlanFrozen'),f('b28.mainValveStopped'),f('b29.noctiaHome'),f('b30.epilogueComplete')],
    semantics:{heat:{total:8,mandatory:4,valves:[...FOREST_VALVES],warmPoints:FOREST_WARM_POINTS.map(w=>({...w})),deadline:'b26.confirmHeat.* at B-03 after the optional B-26 review and return'},wedges:{total:2,sites:[...FOREST_WEDGE_SITES],publicCapability:'public-foot+public-pack+public-light-cart',cuts:FOREST_WEDGE_SITES.map(n=>({region:regionId(n),originalEnemy:`${bid(n)}.originalEnemy`,rootGate:`${bid(n)}.fixRoot`,publicCondition:forestPublicCondition(n)}))},ringRequirements:FOREST_RING_REQUIREMENTS,readyRequirements:FOREST_READY_REQUIREMENTS,noImplicitTravel:true,noRealtimeWeather:true,zeroWedgeRequired:true},
    difficultyStatus:'standard numeric seed, witness validation required; no tuned easy/hard claim'};
}
export const createForestCampaign=()=>createCampaign(createForestSpec());
