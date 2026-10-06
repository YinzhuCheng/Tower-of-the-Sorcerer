// Versioned presentation only. Never changes gameplay entities or persisted historical prose.
export const LEGACY_MONSTER_REVISION='mechanical-r1';
export const NEW_MONSTER_REVISION='forest-species-r1';
export const FOREST_MONSTER_IDENTITIES=Object.freeze({
 'b05.sluicePuppet':Object.freeze({name:'镜鳍溪蜥',legacy:'取水维护偶',visualId:'bmon-002-mirrorfin-creek-newt',form:'beast'}),
 'b06.sawPuppet':Object.freeze({name:'琥珀芽壳',legacy:'倒杉锯木偶',visualId:'bmon-001-amber-seed-shell',form:'beast'}),
 'b06.sideTender':Object.freeze({name:'缚杉冠蛾',legacy:'石坎旧检枝偶',visualId:'bboss-001-cedar-crown-moth',form:'beast',dialogueForm:'anthro'}),
 'b11.returnPuppet':Object.freeze({name:'裂岩角獾',legacy:'风铃坡归材偶',visualId:'bmon-003-splitstone-horn-badger',form:'beast'})
});
export const FOREST_MONSTER_TEXT=Object.freeze({
  "b05_pre.L279": "林子在水边让开一小片空地。一只镜鳍溪蜥伏在石槽旁，湿亮的背鳍映着水光。新水管刚靠近它藏身的石缝，它便扭过身，用粗尾一下一下往外顶；管口快要脱开，工队手里的绳子绷得笔直。",
  "b05_pre.L283": "（让星盘停在管边）是镜鳍溪蜥。那道石缝一直冒暖水，它把这里当窝了。新管一碰过去，它就急。",
  "b05_pre.L285": "能绕开它，把管子接好吗？",
  "b05_pre.L287": "阀柄就在它身后，工人伸手会被咬到。得先把它从石槽边引开。",
  "b05_valve.L295": "溪蜥退进了下游的芦苇里，水面还晃着一道细波。工队趁机扶正水管，纱雾把一份主路暖脂送入旧槽。活根缓缓放开阀轴，璃与工队共同转动手柄，机械锁落下。",
  "b06_enter.L343": "她们沿倒木走到断面。一只琥珀芽壳正拱在渗出树脂的木缝里，半透明的硬壳裹着暖黄色的光。它听见脚步，猛地顶起身子，压在倒杉旁的碎石跟着滚落，擦过璃的靴尖。",
  "b06_enter.L345": "琥珀芽壳。它在吃断口的树脂，怕我们抢，连旁边的石头都顶起来了。",
  "b06_enter.L347": "刚才那块差点砸到脚。不能让后面的车从它身边挤过去。",
  "b06_enter.L349": "我在后面拦住过路的人。你们小心，它又把壳转过来了。",
  "b06_pre.L353": "右边全是断枝，退不开。左边那块地还空着，可以把它引过去，别碰壳顶的芽。",
  "b06_pre.L355": "（沿倒木看了一遍）你留在这边。等它离开断口，我把它挡在林子里，工队就能清路。",
  "b06_post.L361": "琥珀芽壳缩进林间的枯叶里，不再往货道上顶。工队沿已通路段赶来，开始截短倒木、搬开碎石。原来只容一个人钻过的缝逐渐成为可运货的道路。",
  "b11_enter.L621": "路边残留着运货时用来报位的铃。风一吹，几只铃便撞在一起。一只裂岩角獾正伏在散落的货箱间，前爪扒得木屑乱飞。它把挡路的空箱拱下坡，又刨开湿土，通往货场的车辙被掘出一个深坑。",
  "b11_enter.L623": "停，别往前。箱子里漏了干果，它闻着味过来的。你看它的角，已经顶到防滑绳了。",
  "b11_enter.L625": "这边以前就有角獾，天冷前总爱来找吃的。可货车一辆接着一辆，它受了惊，就越发不肯让路。",
  "b11_enter.L627": "先让下面的人停一停。我从空地过去，别把它逼到车边。",
  "b11_enter.L629": "角獾忽然抬头，弯角挂住了路边的防滑绳。它向后一挣，整条绳索骤然绷紧，坡下传来工人避让的喊声。",
  "b11_pre.L635": "我从坡上引它转身。纱雾，你看着那根防滑绳，别靠近它的角。",
  "b11_pre.L637": "好。绳子再绷紧我就喊你，下面的人还没全退开。",
  "b11_post.L645": "角獾挣开松下来的绳圈，沿岩缝退进了灌木。坡下工人重新拉紧防滑绳，把深车辙垫平，再将尚好的货箱搬回平地。",
  "b11_post.L649": "小时候我在这坡上见过它们。隔着很远，看它们在石头间钻来钻去，觉得特别厉害。",
  "b11_post.L651": "刚才离得这么近，是不是吓到了？",
  "b11_post.L653": "嗯。听见下面有人喊，我脑子里一下就乱了。还好你让大家先退开。",
  "b11_post.L655": "人没事，货也捡回大半了。等装车时把干果袋扎紧些，别再把它引回来。"
});
export const FOREST_MONSTER_TITLES=Object.freeze({b05_pre:'暖水边的溪蜥',b06_pre:'倒杉旁的芽壳',b11_pre:'风铃坡的角獾'});
export function forestMonsterRevision(p,{fresh=false}={}){
 if(fresh)return {ok:true,revision:NEW_MONSTER_REVISION};
 const marker=p?.monsterStoryRevision;
 if(marker!==undefined&&marker!==LEGACY_MONSTER_REVISION&&marker!==NEW_MONSTER_REVISION)return {ok:false,code:'monster-story-compatibility',reason:'这份存档的山路故事版本暂不能识别，原存档已保留。请读取兼容存档，或明确重新开始。'};
 const revision=marker??LEGACY_MONSTER_REVISION;
 // A new-form queue cannot masquerade as old history by dropping its marker.
 if((p?.queue??[]).some(s=>s.monsterStoryRevision===NEW_MONSTER_REVISION||(s.turns??[]).some(t=>t.monsterStoryRevision===NEW_MONSTER_REVISION))&&revision!==NEW_MONSTER_REVISION)return {ok:false,code:'monster-story-compatibility',reason:'存档中的故事版本与当前对话不一致，原存档已保留。'};
 // Explicitly conflicting lineage, or old species prose under the new marker,
 // is a restore error. Do not rewrite the queue to make it fit.
 for(const scene of p?.queue??[]){
  if(scene.monsterStoryRevision!==undefined&&scene.monsterStoryRevision!==revision)return {ok:false,code:'monster-story-compatibility',reason:'存档的故事版本与已保存的对话不一致，原存档已保留，未改写对话。请读取兼容存档，或明确重新开始。'};
  for(const turn of scene.turns??[]){
   const marker=turn.monsterStoryRevision,snapshotMarker=turn.storySnapshot?.monsterStoryRevision;
   if((marker!==undefined&&marker!==revision)||(snapshotMarker!==undefined&&snapshotMarker!==revision)||(revision===NEW_MONSTER_REVISION&&Object.hasOwn(FOREST_MONSTER_TEXT,turn.id)&&turn.text!==FOREST_MONSTER_TEXT[turn.id]))return {ok:false,code:'monster-story-compatibility',reason:'存档的故事版本与已保存的对话不一致，原存档已保留，未改写对话。请读取兼容存档，或明确重新开始。'};
  }
 }
 return {ok:true,revision};
}
export function forestMonsterDisplayText(text,revision){
 if(revision!==NEW_MONSTER_REVISION||typeof text!=='string')return text;
 for(const row of Object.values(FOREST_MONSTER_IDENTITIES))text=text.replaceAll(row.legacy,row.name);
 return text;
}
export function forestMonsterTurn(turn,revision){return revision===NEW_MONSTER_REVISION&&Object.hasOwn(FOREST_MONSTER_TEXT,turn.id)?{...turn,text:FOREST_MONSTER_TEXT[turn.id],monsterStoryRevision:revision}:turn;}
export function forestMonsterArtIdentity(entityId,revision,{role='world'}={}){
 const row=FOREST_MONSTER_IDENTITIES[entityId];if(!row||revision!==NEW_MONSTER_REVISION)return null;
 return {...row,entityId,role,form:role==='dialogue'&&row.dialogueForm?row.dialogueForm:'beast',monsterStoryRevision:revision};
}
