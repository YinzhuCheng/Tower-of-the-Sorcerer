// Player-facing copy only. Stable entities, costs, requirements and story stay
// in the frozen campaign; none of these projections is a gameplay condition.
const entries={
 'b01.guardPlate':['拿上旧护片','防御 +2','旧护片装好了'],
 'b02.winterPlan':['听听大家怎么过冬','听大家说说去处和分工','冬天的去处和分工都说好了'],
 'b03.heatBox':['领取节火匣','匣里一共 8 份暖脂，四个支阀要留 4 份；不会再补充','节火匣拿好了：暖脂 8 份'],
 'b03.routeBrief':['一起看看路图','四阀、三处暖点和四处侧根的用量都能在这里查到','路图看清了，随时可以再翻开'],
 'b04.housing':['看看大家住的屋子','检查门窗、试烧炉子，再一起搬东西','门窗和炉子检查好了，东西也搬进去了'],
 'b04.bandages':['拿上学舍药包'],
 'b05.valve':['关上第一支阀'],
 'b05.pipeWorks':['接好溪边保温管','支阀关闭后，另接普通保温管，让自然溪水继续供水','保温管接好了，溪水照常流'],
 'b06.freightWorks':['把货道清宽些','清走倒杉和弹石，让分批轻车能通过','倒杉和弹石清开了，轻车能走了'],
 'b06.edgeTool':['拿上磨刃石'],
 'b06.resinFragments':['拿上树脂换来的药包','这是普通药包，不会补充暖脂'],
 'b07.wedges':['领取两枚缚根楔','两枚由 07、16、21、24 四处共用；用在一处就少一枚','两枚缚根楔拿好了，四处侧根要合着用'],
 'b08.campSupply':['拿上营地补给'],
 'b08.firewood':['给明早留些柴','拨开进气口，把明晨要用的柴留下','进气口通了，明早的柴也留好了'],
 'b09.bridgeWorks':['一起把桥搭好','架梁、钉板、加栏，再现场试过分批轻车；打倒拖拽架不等于桥已修好','梁、桥板和护栏都装好了，轻车试过了'],
 'b09.rivetGuard':['拿上工具匣里的护具'],
 'b10.supportWorks':['把路根架稳','用普通石木支架承重，再去关支阀','石木支架已经撑住路根'],
 'b10.valve':['关上第二支阀'],
 'b11.roadWorks':['修好风铃坡的路','拆掉残轨，修防滑绳和通往货场的车辙','残轨拆了，防滑绳和车辙修好了'],
 'b11.steelEdge':['拿上归材站的钢片'],
 'b12.overlook':['一起看看河谷','站在望台看看田地和炉烟','在望台看了一会儿河谷'],
 'b13.freightManifest':['和货队对一对冬料','大车拆载，轻车分批送；先说清怎么运','冬料和分批送货的安排对好了'],
 'b13.coatShop':['买一件厚护衣'],
 'b13.edgeShop':['买一把开路钢刃'],
 'b13.bandageShop':['买一包护送药'],
 'b14.lodging':['听听大家选了哪张床','床位、食宿和住多久，由住户自己选','大家选好了床位，也说好了食宿和期限'],
 'b14.learningPlan':['听纱雾说说这一季','让纱雾自己谈学习、帮工和食宿','纱雾把这一季的学习和食宿谈好了'],
 'b15.cableWorks':['检修索道，再试载','检查轮组后实际试载；索道只运物资，不载人','索道试载通过了，只用来运物资'],
 'b15.deliverWinter':['把冬料送过去','索道与修好的西石路一起运送基础冬料','基础冬料送到了'],
 'b15.trailPack':['拿上货场护送包'],
 'b15.cableTool':['拿上索道仓的工具'],
 'b17.warmgreenhouse':['给温室内间留暖'],
 'b17.inspectSeeds':['看看哪些种子能带走','哪些能移栽、能取种，哪些留不住，都一起看清','移栽和留种的范围看清了'],
 'b18.warmpear':['帮老梨树脱离供暖'],
 'b18.oldSeat':['在旧石座边坐一会儿','说说这一次各自愿意做的事','在旧石座边把想说的话说了'],
 'b19.warmlodge':['给候车屋留一冬底温'],
 'b19.lodgeWorks':['修好候车屋','修门窗和普通柴炉，排好白天通行与清雪；不投入暖脂也要修','门窗和柴炉修好了，通行与清雪也排好了'],
 'b19.reservePack':['拿上卸料坪的补给'],
 'b19.snowGuard':['拿上防风护片'],
 'b20.supportWorks':['撑稳闸室，清出北路','装好普通支架，再清出闸室外侧的北脊通路','闸室撑稳了，北脊通路也清开了'],
 'b20.valve':['关上第三支阀'],
 'b22.inspectUpperRoad':['和工队走一遍上山路','逐段检查到上门的既有石道','到上门的石道逐段查过了'],
 'b22.shareDuties':['一起把后面的活排好','米露重排工作，纱雾只答应离开前的两次温标课','后面的活分好了，纱雾留下两次温标课'],
 'b22.windGuard':['拿上护肩和修刃包'],
 'b23.acceptRing':['让轻车走一遍环路','逐段检查已经修好的公共路，再实际试通分批轻车','轻车走通了，公共环路可以用了'],
 'b24.retrieveHandrail':['把检修扶手抬出来','从已修好的库门抬出整根扶手；还要带回树心外廊装好','扶手抬出来了，还要带回树心外廊装好'],
 'b24.installHandrail':['把检修扶手装上','在树心外廊的检修入口实装，拿到扶手不算装好','检修入口的扶手装好了'],
 'b24.shutdownDiagram':['看看检修图','停机顺序是副柄、护臂、总阀；这里只看图，不会停机','检修顺序看清了：副柄、护臂、总阀'],
 'b25.valve':['关上第四支阀'],
 'b25.waterTest':['看看水还能不能流','实际试通重力管，确认普通水源持续供水','重力管试通了，普通水源还在流'],
 'b26.readinessReview':['一起看看还有没有遗漏','检查四阀、道路、冬料、住所、水路和实装扶手','停暖前要做的事都检查过了'],
 'b26.supper':['去侧院吃饭','坐下来，把这一顿饭慢慢吃完','在侧院吃过饭了'],
 'b26.drawer':['陪纱雾收拾抽屉','收好东西，再带饭去相邻外廊','抽屉收好了，饭也带上了'],
 'b27.packPersonalThings':['把茶和便当盖带走','私人物品带回家，折床留下供检修时休息','茶和便当盖收好了，检修折床留下了'],
 'b28.serviceLever':['拨下检修副柄','先露出驱动，总阀保持原位；接下来仍要拆除失灵护臂','副柄拨下了，驱动露出来；总阀还没动'],
 'b28.stopMainValve':['和诺克缇娅一起关总阀','诺克缇娅转总阀，璃落机械锁','总阀关上了，机械锁落好了'],
 'b29.homecoming':['陪诺克缇娅回家','回到她自己的房间，这次不再续一班值守','诺克缇娅回到了自己的房间'],
 'b30.together':['这一季，一起下山'],
 'b30.patrol':['留一季巡路，再约好重逢']
};
for(const n of [7,16,21,24]){
 const id=`b${String(n).padStart(2,'0')}`;
 entries[`${id}.fixRoot`]=['用一枚楔固定侧根'];
 entries[`${id}.originalWorks`]=['把原路修到能过轻车','清残件、修护栏，再现场试过轻车；清除敌人和修路是两件事','原路修好了，轻车试过了'];
 entries[`${id}.rootWorks`]=['把侧根路修到能过轻车','铺板、补栏、加斜撑，隔开旧路，再现场试过轻车','侧根的板和护栏装好了，轻车试过了'];
}
export const FOREST_PLAYER_COPY=Object.freeze(Object.fromEntries(Object.entries(entries).map(([id,value])=>[id,Object.freeze({title:value[0],description:value[1]??'',result:value[2]??''})])));
export function forestPlayerCopy(entity){
 if(!entity)return {title:'走过去',description:'',result:''};
 if(entity.id.startsWith('b26.confirmHeat.'))return {title:'就按现在的暖点安排吧',description:'确认前还可以沿原路回去看看暖点',result:'暖点安排定下来了，剩余暖脂交给了公共库存'};
 return FOREST_PLAYER_COPY[entity.id]??{title:entity.title,description:'',result:''};
}
export const forestPlayerTitle=(runtime,id)=>forestPlayerCopy(runtime.entity(id)).title;
export function forestMapTitle(runtime,state,entity){
 const edge=entity?.kind==='anchor'?runtime.spec.transitions.find(e=>e.anchor===entity.id):null;
 return edge?(!state.visited.includes(edge.to)&&!runtime.meets(state,edge.requires)?'尚未开放的小路':`前往${runtime.region(edge.to).title}`):forestPlayerCopy(entity).title;
}

// Never hide a currently legal action. Delayed cards are only presentation;
// the kernel remains the sole authority and the complete route guide is public.
export function forestActionVisible(runtime,state,entity){
 if(!entity||runtime.meets(state,entity.requires))return true;
 const id=entity.id;
 if(id==='b03.routeBrief')return Boolean(state.flags['b03.heatBoxOwned']);
 if(id==='b24.installHandrail')return state.visited.includes('B-24');
 if(id==='b26.readinessReview')return state.visited.includes('B-25');
 if(id.startsWith('b26.confirmHeat.'))return Boolean(state.flags['b26.drawerPacked']);
 if(id.endsWith('.originalWorks'))return Boolean(state.flags[id.replace('.originalWorks','.originalCleared')]);
 if(id.endsWith('.rootWorks'))return Boolean(state.flags[id.replace('.rootWorks','.rootFixed')]);
 return true;
}
export function forestDeferredNotice(state){
 return state.location.regionId==='B-03'&&!state.flags['b26.shutdownReady']?'检修入口暂未开放。先沿山路走走，暖脂和修路的用量随时可以查。':null;
}
export function forestChoicePrompt(scene){
 if(scene.sceneId==='b30_relationship_offer')return '这一季，你想怎样和纱雾相处？';
 if(scene.choices.every(choice=>choice.presentationOnly))return '你想怎么回答？';
 return '想好了再选；要用多少东西，会在动手前说明。';
}
export function forestMissingSteps(runtime,state,condition){
 if(!condition||runtime.meets(state,condition))return [];
 if(Array.isArray(condition))return condition.flatMap(c=>forestMissingSteps(runtime,state,c));
 if(condition.all)return condition.all.flatMap(c=>forestMissingSteps(runtime,state,c));
 if(condition.any)return [`任选一条路：${condition.any.map(c=>forestMissingSteps(runtime,state,c).join('，再')).join('；或者')}`];
 if(condition.not)return ['这件事已经做过了'];
 if(condition.cleared)return [`清除${forestPlayerTitle(runtime,condition.cleared)}`];
 if(condition.resource){const reserve=(condition.reserveUntrueFlags??[]).filter(id=>!state.flags[id]).length,label={heat:'暖脂',wedges:'缚根楔'}[condition.resource]??condition.resource;return [`需要 ${condition.min??0} ${label}${reserve?`，支阀还要另留 ${reserve} 份`:''}；现在有 ${state.resources[condition.resource]??0}`];}
 if(condition.flag){const entity=runtime.spec.regions.flatMap(r=>r.entities).find(e=>e.effects?.flags?.[condition.flag]===(condition.value??true));return [entity?`${runtime.region(runtime.entity(entity.id).regionId).title}：${forestPlayerCopy(entity).title}`:'还有一处准备没做好'];}
 return runtime.explainMissing(state,condition);
}
export function forestLockedReason(runtime,state,entity,edge,preview){
 if(entity&&state.cleared.includes(entity.id)&&entity.once!==false)return '这件事已经做过了';
 if(entity?.kind==='shop'&&state.stats.gold<entity.price)return `要 ${entity.price} 金币，现在有 ${state.stats.gold}，还差 ${entity.price-state.stats.gold}`;
 if(entity?.enemy&&preview.battle)return preview.battle.reason??'现在还打不过，先看看别处的补给';
 if(entity?.id.includes('.warm')){const reserved=runtime.spec.semantics.heat.valves.filter(id=>!state.flags[id]).length,cost=-entity.effects.resources.heat;if(state.flags['b26.heatPlanFrozen'])return '暖点已经定下来了，这一处按普通方案过冬';return `这一处要 ${cost} 份暖脂；四阀还要留 ${reserved} 份，现在有 ${state.resources.heat} 份`;}
 if(edge&&!runtime.meets(state,edge.requires)){
  if(edge.to==='B-26')return '侧院这边晚些再来，先把山路上的准备做好';
  if(['B-27','B-28'].includes(edge.to))return '检修入口还没开放，准备好后再来';
  if(edge.to==='B-23')return '这段环路还没修通，可在「暖点 / 路图」查看缺哪一段';
  return '这条路暂时还不能通行，先办好眼前的事';
 }
 const id=entity?.id;
 const reasons={
  'b15.deliverWinter':'还不能送冬料：索道、西石路和食宿安排要先准备好，缺项可在「暖点 / 路图」查看',
  'b23.acceptRing':'还有路段没修到能过轻车，缺哪一段可在「暖点 / 路图」查看',
  'b26.readinessReview':'还有几处准备没做好，缺项可在「暖点 / 路图」查看',
  'b24.installHandrail':'先从干根库把整根扶手抬回来',
  'b28.stopMainValve':'先按检修图拨副柄、拆除失灵护臂，再来关总阀'
 };
 if(reasons[id])return reasons[id];
 if(id?.startsWith('b26.confirmHeat.'))return '先把眼前的准备做完，再一起确定暖点安排';
 const missing=forestMissingSteps(runtime,state,entity?.requires??edge?.requires);
 if(missing.length)return missing.length===1?`还需要：${missing[0]}`:'还有几处准备没做好，详细用量和道路状态可在「暖点 / 路图」查看';
 return preview.reason??'先走到旁边再试试';
}
export function forestActionResult(runtime,event){
 const entity=runtime.entity(event.entityId),copy=forestPlayerCopy(entity);
 if(copy.result)return copy.result;
 if(entity?.kind==='pickup')return `${copy.title.replace(/^拿上|^领取/,'')}已经拿好了`;
 if(entity?.id.endsWith('.fixRoot'))return '侧根固定了，现在只能步行；铺板补栏后才能过轻车';
 if(entity?.id.includes('.warm'))return `${copy.title}：暖脂已经投入，不能取回`;
 if(entity?.id.endsWith('.valve'))return `${copy.title.replace('关上','')}已经关好了`;
 if(entity?.kind==='shop')return `${copy.title.replace(/^买一件|^买一把|^买一包/,'')}买好了`;
 return copy.title;
}
