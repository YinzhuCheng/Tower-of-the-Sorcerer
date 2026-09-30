# B 标准规则链与回放验收

- 入口：src/campaigns/b/content.js 的 createForestSpec() / createForestCampaign()，唯一规则内核 src/core/campaign.js
- 战役ID forest-b；难度 normal；contentVersion b-frozen-standard-v1；contentHash a12cd07ee1ccc762；rules fixed-campaign-v1.1
- 初态生命450/450、攻18、防8、金币0；暖脂0、楔0、公共储备0。03/07唯一实物领取后才有8暖脂/2楔
- 30个11×11场所，66条显式互逆有向边，156个唯一实体；12个固定敌人、14个有限拾取、3个商店条目
- 地图/门户/地标锁见 FOREST_WORLDGRAPH.md；地理未导入A地图或楼层规则

## 不得混淆的状态

- 原路 originalCleared + originalWorksDone，侧根 rootFixed + rootWorksDone；只有同一分支二者俱全才是公共步行/驮运/分批轻车边。fixRoot仅开人物。作品画面不得替原路打怪
- b23.ringOpen是外部环路；24库房、25第四阀、三个可选暖点都不在b23环路前置
- b24.handrailRetrieved发生在24库房，b24.handrailInstalled必须真的回到03检修入口操作
- b26.shutdownReady是条件检查，只有独立最终确认b26.confirmHeat.{mask}封账；晚桌在26，确认桌在03，两处实际门户相连。确认前可以从真实地图回访
- b26.heatPlanFrozen后未投点标b.ordinary.*，余量移交不可再消费的publicHeat；三暖点成本2/1/2，四阀每处1，共七个合法暖点mask
- b28.serviceLeverSet必须先成立，才能拆护根驱动；驱动拆除/四阀与全部冬备就绪后才能停总阀。规则胜利还需29归家与30一季结尾
- 对话播放/快进/预览不会写资源。storyId只引用冻结正文header；GAL由独立纯展示模块负责

## 已跑验证

运行 node scripts/validate-campaign-b.mjs，16条证书从各自真实initialState逐步canonical dispatch，再由共享replayCampaignCertificate独立回放；全部通过。作者计划只规定有限操作顺序，所有坐标移动与跨区行走由真实网格BFS展开，无setFlag、setLocation、回血注入、跨区捷径。

- 零楔：温室+暖屋716步、温室+梨树708步、暖屋+梨树702步；均HP35、余楔2，公共暖脂分别0/1/1
- b26后回访再投温室+梨树857步，选择留一季巡路，公共余1
- 无可选暖点692步，公共余4；单暖点亦在回归中各自从新游戏走通
- 四种单楔与六种双楔方案全部通关，绕过的旧路敌人保留存活
- 楔07+16后回访拆原路敌人911步，HP118；收益只发生一次

运行 node --test test/campaign-forest.test.js，19/19通过。覆盖三暖点超配拒绝、四阀储备恒量、双路真实割点与无第三路、rootFix/施工分离、无免费收益、拒绝事务不改状态、旧版本/错误难度证书拒绝、重复取匣/楔/战斗/商店、真实回访、封账余量、最终副柄与总阀因果、真实源SHA。

## 边界

这是标准链存在性证明，未声称最优、唯一、任意乱花均能救回、全局搜索穷尽、三档平衡或最终美术已完成。easy/hard应由有界数值overlay/mutator生成并独立回放，不复制此normal证书。构建、浏览器总集成与最终美术由主线程协调；本分工未发布。

## 各区实际实体锚

### B-01 南坡村口

- (4,5) b01.timberPuppet [enemy,blocking] 旧运木偶；scene b01_post
- (4,8) b01.guardPlate [pickup] 护送旧护片 · 防御+2

### B-02 回枝广场

- (4,3) b02.winterPlan [operation] 听取住民自选去处与基础越冬分工；scene b02_enter

### B-03 树心外廊

- (2,3) b03.heatBox [pickup] 领取唯一节火匣 · 暖脂8份，四阀保留4份；scene b03_rules
- (5,5) b03.routeBrief [operation] 查看四阀、三暖点及四处根楔的全部用途；scene b03_exit
- (8,1) b24.installHandrail [operation] 在检修入口实装从干根库抬来的扶手；scene b24_warning
- (3,1) b26.readinessReview [operation] 逐项核对四阀、冬料、住所、水路与实装扶手；scene b26_review
- (5,5) b26.confirmHeat.0 [operation] 最终确认现有暖点；未投处采用普通方案；余4份移交公共库存；scene b26_review
- (5,5) b26.confirmHeat.1 [operation] 最终确认现有暖点；未投处采用普通方案；余2份移交公共库存；scene b26_review
- (5,5) b26.confirmHeat.2 [operation] 最终确认现有暖点；未投处采用普通方案；余3份移交公共库存；scene b26_review
- (5,5) b26.confirmHeat.3 [operation] 最终确认现有暖点；未投处采用普通方案；余1份移交公共库存；scene b26_review
- (5,5) b26.confirmHeat.4 [operation] 最终确认现有暖点；未投处采用普通方案；余2份移交公共库存；scene b26_review
- (5,5) b26.confirmHeat.5 [operation] 最终确认现有暖点；未投处采用普通方案；余0份移交公共库存；scene b26_review
- (5,5) b26.confirmHeat.6 [operation] 最终确认现有暖点；未投处采用普通方案；余1份移交公共库存；scene b26_review

### B-04 旧学舍

- (2,8) b04.housing [operation] 检查集中住所的门窗、试烧和分担搬运；scene b04_enter
- (7,2) b04.bandages [pickup] 学舍现存护送药包 · 生命/上限+35

### B-05 暖溪取水口

- (4,5) b05.sluicePuppet [enemy,blocking] 取水维护偶
- (8,2) b05.valve [operation] 关闭第一支阀 · 暖脂1份；scene b05_valve
- (8,8) b05.pipeWorks [operation] 现场接好普通保温管，保留自然溪水；scene b05_valve

### B-06 雨后杉林

- (4,5) b06.sawPuppet [enemy,blocking] 倒杉锯木偶
- (8,7) b06.freightWorks [operation] 清走倒杉与弹石，把主货道清到轻车宽度；scene b06_post
- (2,2) b06.edgeTool [pickup] 有限磨刃石 · 攻击+3
- (3,7) b06.sideTender [enemy,blocking] 石坎旧检枝偶
- (7,2) b06.resinFragments [pickup] 普通树脂换存的药包 · 生命/上限+25，不补节火匣

### B-07 双根涧

- (2,6) b07.wedges [pickup] 领取仅有的两枚缚根楔 · 07/16/21/24四点共用；scene b07_rules
- (4,2) b07.originalEnemy [enemy,blocking] 旧拖偶；scene b07_stone_post
- (4,8) b07.fixRoot [operation,blocking] 固定既存侧根 · 消耗一枚楔，仅开放人行；scene b07_choice
- (4,2) b07.originalWorks [operation] 原路现场清残件、修栏与验收轻车；scene b07_stone_post
- (4,8) b07.rootWorks [operation] 侧根现场铺板补栏加斜撑，隔离旧路后试过轻车；scene b07_choice

### B-08 空驿棚

- (4,2) b08.campSupply [pickup] 首次宿营现存补给 · 生命/上限+60
- (6,2) b08.firewood [operation] 拨开进气口，留下明晨的柴；scene b08_night

### B-09 断栈道

- (4,5) b09.foundationRig [enemy,blocking] 旧石基拖拽架
- (6,5) b09.bridgeWorks [operation,blocking] 架梁、钉板、加栏并现场试过分批轻车；scene b09_post
- (2,7) b09.rivetGuard [pickup] 石基工具匣护具 · 防御+2

### B-10 西枝分流台

- (4,3) b10.supportWorks [operation] 把路根重量交给普通石木支架；scene b10_enter
- (4,5) b10.valve [operation] 关闭第二支阀 · 暖脂1份；scene b10_valve

### B-11 风铃坡

- (4,5) b11.returnPuppet [enemy,blocking] 风铃坡归材偶
- (5,3) b11.roadWorks [operation] 拆残轨、修防滑绳与货场方向车辙；scene b11_post
- (1,9) b11.steelEdge [pickup] 归材站现存钢片 · 攻击+3

### B-12 河谷望台

- (1,5) b12.overlook [operation] 在望台看清正常季节里的河谷田地与炉烟；scene b12_enter

### B-13 石脚货场

- (8,3) b13.freightManifest [operation] 核对已换冬料、大车拆载与轻车分批交付；scene b13_enter
- (4,5) b13.coatShop [shop] 护路厚护衣 · 12金币，防御+3，现货一件；scene b13_shop
- (6,5) b13.edgeShop [shop] 开路钢刃 · 10金币，攻击+3，现货一件；scene b13_shop
- (8,7) b13.bandageShop [shop] 普通护送药包 · 6金币，生命+45，可买至金币不足；scene b13_shop

### B-14 河谷客舍

- (1,1) b14.lodging [operation] 核对住户亲自选择的床位、食宿与期限；scene b14_enter
- (8,4) b14.learningPlan [operation] 纱雾亲自谈妥一季学习与帮工食宿；scene b14_greenhouse

### B-15 旧运材索道

- (5,5) b15.cablePuppet [enemy,blocking] 卷索维护偶
- (2,2) b15.cableWorks [operation] 工队检修轮组并试载 · 索道仅运物资；scene b15_post
- (2,8) b15.deliverWinter [operation] 以索道及已修西石路送达基础冬料；scene b15_post
- (8,2) b15.trailPack [pickup] 货场预留护送包 · 生命/上限+55
- (8,8) b15.cableTool [pickup] 索道仓现存开路工具 · 攻击+2

### B-16 背阴山腰

- (3,1) b16.originalEnemy [enemy,blocking] 往返拖架；scene b16_route
- (3,8) b16.fixRoot [operation,blocking] 固定既存侧根 · 消耗一枚楔，仅开放人行；scene b16_route
- (3,1) b16.originalWorks [operation] 原路现场清残件、修栏与验收轻车；scene b16_route
- (3,8) b16.rootWorks [operation] 侧根现场铺板补栏加斜撑，隔离旧路后试过轻车；scene b16_route

### B-17 暖生温室

- (2,2) b17.warmgreenhouse [operation] 为温室密封内间投入2份暖脂 · 不可取回；scene b17_offer
- (8,2) b17.inspectSeeds [operation] 查看可移栽、取种与无法保存的真实范围；scene b17_enter

### B-18 老梨树坡

- (2,5) b18.warmpear [operation] 为老梨树分根脱暖投入1份暖脂 · 不可取回；scene b18_offer
- (5,5) b18.oldSeat [operation] 在旧石座旁说清这一次各自愿意做的事；scene b18_private

### B-19 半山候车屋

- (7,3) b19.warmlodge [operation] 为候车暖屋一冬底温投入2份暖脂 · 不可取回；scene b19_offer
- (3,3) b19.lodgeWorks [operation] 修好普通门窗和柴炉，排好日间通行与清雪；scene b19_enter
- (5,3) b19.reservePack [pickup] 卸料坪最后一份护送补给 · 生命/上限+70
- (4,6) b19.snowGuard [pickup] 候车屋预存防风护片 · 防御+2

### B-20 北枝闸室

- (5,4) b20.supportWorks [operation] 装好第三支架、清出闸室外侧北脊通路；scene b20_enter
- (7,6) b20.valve [operation] 关闭第三支阀 · 暖脂1份；scene b20_valve

### B-21 高根风口

- (7,1) b21.originalEnemy [enemy,blocking] 高台张索偶；scene b21_route
- (7,8) b21.fixRoot [operation,blocking] 固定既存侧根 · 消耗一枚楔，仅开放人行；scene b21_route
- (7,1) b21.originalWorks [operation] 原路现场清残件、修栏与验收轻车；scene b21_route
- (7,8) b21.rootWorks [operation] 侧根现场铺板补栏加斜撑，隔离旧路后试过轻车；scene b21_route

### B-22 山脊驿台

- (2,2) b22.inspectUpperRoad [operation] 接应工队逐段查过到上门的既有石道；scene b22_enter
- (8,2) b22.shareDuties [operation] 米露重排工作，纱雾只答应离开前两次温标课；scene b22_after
- (5,7) b22.windGuard [pickup] 驿台预存护肩与修刃包 · 防御+2，攻击+2

### B-23 回枝上门

- (5,3) b23.acceptRing [operation] 逐项验收公共环路，实际试通分批轻车；scene b23_enter

### B-24 干根库

- (4,1) b24.originalEnemy [enemy,blocking] 正门压材偶；scene b24_route
- (4,8) b24.fixRoot [operation,blocking] 固定既存侧根 · 消耗一枚楔，仅开放人行；scene b24_route
- (4,1) b24.originalWorks [operation] 原路现场清残件、修栏与验收轻车；scene b24_route
- (4,8) b24.rootWorks [operation] 侧根现场铺板补栏加斜撑，隔离旧路后试过轻车；scene b24_route
- (8,3) b24.retrieveHandrail [operation] 通过已施工的库门抬出整根检修扶手；scene b24_route
- (8,5) b24.shutdownDiagram [operation] 提前查看副柄→护臂→总阀的固定停机顺序；scene b24_warning

### B-25 东枝回水台

- (5,2) b25.valve [operation] 关闭第四支阀 · 暖脂1份；scene b25_valve
- (8,2) b25.waterTest [operation] 试通已铺重力管，确认普通水源持续流动；scene b25_exit

### B-26 暖夜饭桌院

- (5,3) b26.supper [operation] 在侧院吃完最后一个暖夜的饭；scene b26_enter
- (5,7) b26.drawer [operation] 纱雾收拾抽屉，带饭去相邻外廊；scene b26_shawu

### B-27 树心检修道

- (4,3) b27.packPersonalThings [operation] 带走茶与便当盖，留下一张供检修休息的折床；scene b27_enter

### B-28 护根机关室

- (2,7) b28.serviceLever [operation] 先拨检修副柄，露出驱动；总阀保持原位；scene b28_pre
- (5,4) b28.guardDrive [enemy,blocking] 失灵护根机关；scene b28_post
- (5,1) b28.stopMainValve [operation] 诺克缇娅转总阀，璃落机械锁；scene b28_post

### B-29 树下冷月

- (4,5) b29.homecoming [operation] 诺克缇娅走回自己的房间，不再续一班值守；scene b29_home

### B-30 初雪归途

- (5,1) b30.together [operation] 这一季一起下山，按约去河谷学习与冬市；scene b30_end_together
- (5,9) b30.patrol [operation] 留一季巡路，在下一班货队往返时真实重逢；scene b30_end_two_ends

