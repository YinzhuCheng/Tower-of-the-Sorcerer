import {NEW_MONSTER_REVISION} from './monster-identity.js';
const mk=(id,speaker,text,extra={})=>({id,sourceLine:0,speaker,text,branch:'common',portrait:null,...(speaker==='旁白'?{kind:'narration'}:{}),monsterStoryRevision:NEW_MONSTER_REVISION,...extra});
export const FOREST_MOTH_SCENES=Object.freeze({
 b06_moth_before:{id:'b06_moth_before',title:'石坎上的牵丝',regionId:'B-06',backdropAssetId:'B_ENV_06:moth',choices:[{id:'approach',label:'走近石坎'},{id:'leave',label:'先回货道',presentationOnly:true}],source:{file:'monster-scenes.js',revision:NEW_MONSTER_REVISION},turns:[
 mk('B.MON.R1.moth.before.01','旁白','石坎旁的低枝间结着薄薄的丝巢，一名女子坐在那里理丝。枝状触角拱在她额前，乳白的翅片挡住身后的树脂。珂珂刚放下背包，脚边一根细丝便绷紧了。'),
 mk('B.MON.R1.moth.before.02','珂珂','哎，等一下！我只是想歇歇脚，没看见这里有丝。'),
 mk('B.MON.R1.moth.before.03','冠蛾','把脚抬起来，慢一点。那根丝才接好，别又扯断了。',{monsterForm:'anthro'}),
 mk('B.MON.R1.moth.before.04','旁白','珂珂小心地退了半步。女子伸手接住垂下的丝头，皱着眉，背后的翅缘却仍朝着她们张开。'),
 mk('B.MON.R1.moth.before.05','纱雾','是缚杉冠蛾。她把巢搭在这儿了。我们先站远些，你看，丝还连着上面的枝。'),
 mk('B.MON.R1.moth.before.06','冠蛾','这场雨把下面冲开了，我补了一早上。货道那么宽，你们去那边歇吧。',{monsterForm:'anthro'}),
 mk('B.MON.R1.moth.before.07','璃','货道还要过车。我们想借下面这块石沿坐一会儿，上面的巢不会碰。'),
 mk('B.MON.R1.moth.before.08','旁白','女子攥紧了手里的丝，翅片倏地撑开。璃停在石沿外，没有再向前。珂珂把背包重新提起来，等她决定。')
 ]},
 b06_moth_after:{id:'b06_moth_after',title:'借一块歇脚的石头',regionId:'B-06',backdropAssetId:'B_ENV_06:moth',choices:[],source:{file:'monster-scenes.js',revision:NEW_MONSTER_REVISION},turns:[
 mk('B.MON.R1.moth.after.01','旁白','璃一踏上石沿，女子便化作冠蛾迎面扑来。璃架住扫来的翅缘，沿石坎把她逼向外侧。冠蛾退上高枝，停了好一会儿，四翅才慢慢收拢，恢复成先前的模样。'),
 mk('B.MON.R1.moth.after.02','冠蛾','别再上来了。下面让你们坐，上面的丝别碰。',{monsterForm:'anthro'}),
 mk('B.MON.R1.moth.after.03','璃','好，就在下面。我们歇一会儿便走。'),
 mk('B.MON.R1.moth.after.04','珂珂','过来挤挤，我把包放脚边。刚才真没想到，找块石头坐也这么费劲。'),
 mk('B.MON.R1.moth.after.05','旁白','纱雾拨开石沿上松落的细丝，拉着璃坐下。珂珂揉了揉被肩带勒红的地方，终于长长吐出一口气。高枝上的女子低头接好断丝，没再催她们。')
 ]}
});
export function forestMonsterSceneSource(sceneId,revision){return revision===NEW_MONSTER_REVISION?FOREST_MOTH_SCENES[sceneId]??null:null;}
