import {sceneProjection,projectedAdultHeight} from './core.mjs';
const anchor=(scene,id,label,surfaceId,world,extra={})=>({id,label,surfaceId,world,pixel:sceneProjection(scene,world),...extra});
export const SCENES={
 forest:{id:'forest',title:'双根涧',subtitle:'午后 · 林隙',asset:'assets/forest.png',size:[1672,941],adultHeight:projectedAdultHeight('forest'),physicalRadius:.32,
  anchors:[
   anchor('forest','bay','石台 · 上层落脚','S17_bay_and_top_landing',[65,49.7,10],{cellId:'tool-bay',navXY:[65,49.7],default:true}),
   anchor('forest','upper','上桥 · 开口西侧','S04_upper_span',[59,54.4,12],{cellId:'upper-west',navXY:[59,54.4]}),
   anchor('forest','root','树根 · 局部脚域','S05_root_span',[61.5,43.5,7.571093],{cellId:'root-local',navXY:[61.5,43.5]})],
  note:'原画与四向静态参考。局部导航须按独立评审版本启用。',
  issues:['楼梯踏面与身体落脚仍需实机逐段复核','前景树叶、扶壁与栏缘尚无经实机验收的遮挡层','全树根两端及桥肩不属于局部导航接受范围'],occluders:[]},
 harbor:{id:'harbor',title:'灯港缆桥',subtitle:'蓝时 · 空泊位',asset:'assets/harbor.png',size:[1586,992],adultHeight:projectedAdultHeight('harbor'),physicalRadius:.18,
  anchors:[
   anchor('harbor','quay','码头 · 低层','low_public',[4,.8,3],{default:true}),
   anchor('harbor','bridge','主桥 · 高层','upper_public',[5,5,-7.2]),
   anchor('harbor','underbridge','桥下 · 低层','low_public',[5,.8,-7.2],{occlusionUnverified:true}),
   anchor('harbor','east-turn','右梯 · 转台','east_middle',[12.4,2.9,-.8],{occlusionUnverified:true}),
   anchor('harbor','east-flight','右梯 · 后跑','east_upper_flight',[13.1, 4.1, 2.1],{occlusionUnverified:true}),
   anchor('harbor','east-top','右梯 · 顶台','upper_public',[13.1,5,4.3],{occlusionUnverified:true}),
   anchor('harbor','door','门前 · 仍为低街','low_public',[7.5,.8,-14.675],{occlusionUnverified:true})],
  note:'35m 正交机位。物理锚点投影不等同于原画脚域验收。',
  issues:['桥下、门前与右梯后跑：原画遮挡分层未验收，角色可能盖在桥梁或栏杆前','不能用淡化桥体显示未经补画的地面；本视口没有隐藏面补画','近栏孔洞、柱体、两跑楼梯须逐物件遮挡，不能以屏幕 Y 自动切层','全图脚域与原画边线贴合仍待实机检查'],occluders:[]}
};
export const SCENE_KEYS=Object.keys(SCENES);
