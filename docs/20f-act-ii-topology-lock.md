# Act II（F11–F20）拓扑锁：魔力苏醒后的第二章

状态：**语义合同、11×11 房间地图与门卡状态图已冻结；运行时内容、数值和美术尚未实现。**

本锁是对已发布 10F 拓扑的显式续篇修订，不会改写八层研究基线，也不会悄悄把
F10 的终局战改成普通数值候选。其源码合同是
[`demo-20-floor-progression-topology.js`](../src/game/demo-20-floor-progression-topology.js)，
空间合同是
[`demo-20-floor-spatial-topology.js`](../src/game/demo-20-floor-spatial-topology.js)。

## 固定机制

- F10 的 `voidCore` 完整击败后将不再结算胜利：它恢复主角 **100 / 100 MP**，解锁
  `魔力附刃`，并解除通往 F11 的楼梯。当前是已实现 MP 引擎上的**下一步 runtime
  接入合同**，尚未把现有 10F 终局改成这一转场。
- 附刃档位在任意非战斗时调整。`x` 档在一场战斗开始时支付 `10x MP` 一次；该场
  每一次主角攻击额外 `+10x` 伤害。
- 基础附刃不能越过物理破防线：仍要求 `ATK > DEF`。若以后需要魔法破甲，必须是
  一件显式、可审计的关键遗物，不能悄悄改基础公式。
- 最大 MP 与 MP 回复是不同的宝物/商店能力。回复受上限截断，并在求解器中始终
  保留为显式拾取动作，不能进入“自动安全拾取”闭包。

## 锁定的节奏与房间语法

| 层 | 房间语法 | Boss / 门禁节奏 | 固定关键结果 |
| --- | --- | --- | --- |
| F10 | 王座终局 → 觉醒转场 | `voidCore` 是 F11 楼梯的唯一守卫 | MP 100/100，解锁附刃 |
| F11 | 复苏环廊 | 无 Boss；月痕门是有效割点 | 首次 MP 回复教学 |
| F12 | 双谱温室 | 主线无 Boss；双卫可选宝库 | `aetherPrism` 最大 MP 权限；不追加例行商店 |
| F13 | 脉冲锻炉 | 无 Boss；星/月两条回路门 | `conduitCodex` |
| F14 | 三矢竞技场 | 三名守卫共同解锁楼梯 | 第一个强制 Boss 集中段 |
| F15 | 折页档案馆 | 无 Boss；档案封印保护高价值侧室 | `arcaneBattery` 与第二章唯一 MP 商店 |
| F16 | 镜轮双殿 | 主线无 Boss；双 Boss 可选宝库 | `mirrorReservoir` |
| F17 | 三冠阶庭 | 三名冠庭守卫共同解锁楼梯 | `crownCapacitor` |
| F18 | 澄空航渠 | 无 Boss；日/星分流门 | 终局前的 MP 与卡片保留层 |
| F19 | 回响王庭 | `echoRegent` 是 F20 楼梯守卫 | `originFocus`；不提供最后一刻重配 |
| F20 | 起源魔源 | `arcaneSovereign → originCore` 双相唯一终局 | 只有 `originCore` 触发胜利 |

这刻意避免“每层一个 Boss”。无 Boss 层提供读图、卡片账本、MP 时机和商店决策；
Boss 被集中成可读的双卫宝库、三守卫上行、最终双相压力。商店同样保持稀缺：
第一章的目标为 F5 一座，第二章只在 F15 设置一座，并提供 MP 回复与最大 MP 服务。

## 已冻结的空间与门卡合同

每层已是一张独立的 11×11 房间图，而不是待填数值的蛇形迷宫。地图中共有 14 个
视觉结界：8 个消耗卡片的结界与 6 个 Boss / 相位结界。静态验收把每个结界关闭后
视作墙，要求它两侧属于不同开放区域；同时要求门后目标在关闭时不可达、仅打开该门
（或已声明的前置门）后可达。因而不会再出现“看起来是结界，实际能从旁边绕过”的格子。

| 层 | 卡片结界 | 非卡结界 | 门后固定内容 |
| --- | --- | --- | --- |
| F11 | `f11LunarTrace` 月痕门 | — | F12 楼梯 |
| F12 | — | `twinChordVault` | 双谱守卫与 `aetherPrism` |
| F13 | `f13StarConduit`、`f13MoonBypass` | — | `conduitCodex`、月相战斗支路 |
| F14 | — | `f14TriuneSeal` | 三守卫后通往 F15 的楼梯 |
| F15 | `f15ArchiveSeal` | — | `arcaneBattery`；商店不在门后 |
| F16 | `f16PrismThreshold` | `mirrorReservoirVault` | 镜轮支路、双卫与 `mirrorReservoir` |
| F17 | — | `f17CrownSeal` | 三冠守卫后通往 F18 的楼梯 |
| F18 | `f18SunBridge`、`f18StarChannel` | — | 上行桥、虚空使者侧室 |
| F19 | `f19ThroneLicense` | `f19RegentSeal` | 摄政官与通往 F20 的楼梯 |
| F20 | — | `f20SovereignSeal` | `arcaneSovereign` 后的 `originCore` |

从零卡起的 Act II 静态账本为：供应 `星/ 月/ 日 = 10/14/1`，声明支出
`7/7/1`，最终余额 `4/7/0`。这里的卡数是**空间权限合同**，不是战斗数值；它确保
日卡仍是唯一终局消耗，并让至少一半的常规卡供给绑定到有价值的门，而非简单删掉卡片。
当 F10→F11 接续实装时，还会额外以引擎实际继承的卡片状态重跑同一状态图。

## 新内容身份（不含数值）

普通敌方单位：`manaWisp`、`aetherWarden`、`runeCantor`、`spellbladeDuelist`、
`manaSentinel`、`prismArchivist`、`mirrorHuntress`、`voidHerald`。

新 Boss：F12 的 `resonanceBlade` / `resonanceCantor`，F14 的三守卫，F16 的镜轮双卫，
F17 的三冠守卫，F19 的 `echoRegent`，以及 F20 的
`arcaneSovereign → originCore`。

关键 MP 宝物：`manaFlask`、`aetherPrism`、`conduitCodex`、`arcaneBattery`、
`mirrorReservoir`、`crownCapacitor`、`originFocus`。每件只锁定用途、所属层和门禁关系；
**不锁定回复量、容量量、价格或敌人战斗数值**。

## 必须按顺序实现

1. ~~为 F10–F20 写语义合同、敌人/物品 ID。~~ 已完成。
2. ~~房间化：每层放置入口、枢纽、侧室、前庭、Boss、楼梯与门，并以静态可达性确保
   所有结界都是割点，门后确有对应权限或收益。~~ 已完成。
3. 把已冻结的地图接入 Act II content overlay：实现 F10 觉醒转场、F11–F20 可运行
   地图、敌人/物品注册和守卫门逻辑；随后生成 20 层截图。
4. 以真实跨楼层初始卡片状态再跑门卡状态图，并保存至少一条权威引擎的存在性路线证书。
5. 最后才让变异器调整普通敌人的战斗数值、MP 回复/容量数值和商店价格；它不得改动
   本表的 Boss 身份、宝物归属、门禁、房间或楼梯。

## MP 搜索剪枝合同

档位是一次战斗的动作参数，而不是长期 Pareto 维度。对每个可战敌人，只枚举：

1. `x = 0`；
2. 以及每一个“使主角攻击回合数首次下降”的最小可负担 `x`。

同一回合数的更高档位只会消耗更多 MP，严格被支配，应直接剪掉。压缩状态必须保留
`MP / MaxMP` 资源和每层 `defeatedBossIds`，但不以 UI 当前选择的 `x` 分裂结构键。
所有候选动作与路线证书必须记录实际档位，并由 `engine.js` 重放。

透明美术在这些 ID 与房间坐标冻结后生成；规格见
[`tower-transparent-map-art` 指南](../skills/tower-transparent-map-art/SKILL.md)。
