# GAL-SIMPLE-1.0 QA 总表

结论：17名角色均具备一份已通过的文字设定、三视图和细节板。多角度物件为同一物品的替代视图，不代表角色同时携带多份。

| ID | 角色 | 三视图 | 细节板 | 验收说明 |
|---|---|---|---|---|
| `hero` | 绫星·璃 | `CHAR_hero_turnaround_v2.png` | `DETAIL_hero_v2.png` | v2补回左腰剑鞘；月牙夹、肩扣、双腰扣和记录袋位置通过。 |
| `guide` | 残响精灵·纱雾 | `CHAR_guide_turnaround_v1.png` | `DETAIL_guide_v1.png` | 左侧白花、双带与银色整圆星盘通过。 |
| `final_queen` | 无声女王·诺克缇娅 | `CHAR_final-queen_turnaround_v1.png` | `DETAIL_final-queen_v1.png` | 三尖冠、两枚单独红宝石与三块封印板通过；板的展开/收束图为同一组三板的状态示意。 |
| `cat_boss` | 猫卫长·米露 | `CHAR_cat-boss_turnaround_v1.png` | `DETAIL_cat-boss_v1.png` | 猫脸、两耳一尾、单铃、左盾右刀通过。 |
| `fox_boss` | 狐祝·绯叶 | `CHAR_fox-boss_turnaround_v1.png` | `DETAIL_fox-boss_v2.png` | 三尾、单红叶发夹、单扇与三张符纸通过；v2移除过度雕花发饰。 |
| `whale_boss` | 深蓝歌姬·澜音 | `CHAR_whale-boss_turnaround_v1.png` | `DETAIL_whale-boss_v1.png` | 左侧贝壳夹、双袖垂片与五弦贝壳琴通过。 |
| `sword_boss` | 剑圣·塞蕾娜 | `CHAR_sword-boss_turnaround_v2.png` | `DETAIL_sword-boss_v1.png` | 银白低马尾、单胸菱徽、右剑左鞘通过；v2移除多余腿带。 |
| `dragon_boss` | 龙姬·焰璃 | `CHAR_dragon-boss_turnaround_v1.png` | `DETAIL_dragon-boss_v1.png` | 双角、单尾、两片布质翼形披片与单长枪通过。 |
| `astral_boss` | 天穹魔女·露米 | `CHAR_astral-boss_turnaround_v1.png` | `DETAIL_astral-boss_v1.png` | 本人右侧单星夹、单胸星扣与黄铜月牙星盘通过。 |
| `shadow_boss` | 影织姬·鸦羽 | `CHAR_shadow-boss_turnaround_v2.png` | `DETAIL_shadow-boss_v1.png` | 双腿对称、两片后摆、左腰单针盒与针/线轴通过；v2修正腿部不对称。 |
| `merchant` | 阵间商人·珂珂 | `CHAR_merchant_turnaround_v1.png` | `DETAIL_merchant_v1.png` | 双辫、单方背包、单卷毯、右腰钱袋与方形琥珀灯通过。 |
| `echo_regent` | 回声摄政官 | `CHAR_echo-regent_turnaround_v2.png` | `DETAIL_echo-regent_v1.png` | 短低束发、单方银领扣、右肩至左腰绶带与单黑名簿通过；v2修正背面绶带方向。 |
| `arcane_sovereign` | 奥术主权者 | `CHAR_arcane-sovereign_turnaround_v1.png` | `DETAIL_arcane-sovereign_v1.png` | 男性轮廓、两条白前片、单蓝菱领扣与单裂纹椭圆印戒通过。 |
| `palace_warden_v2` | 静默执剑官·维拉 | `CHAR_palace-warden-v2_turnaround_v1.png` | `DETAIL_palace-warden-v2_v1.png` | 单尖额冠、对称肩甲、黑甲蓝前片与单槽直剑通过。 |
| `black_seal_keeper_v2` | 黯印观测官·塞芙 | `CHAR_black-seal-keeper-v2_turnaround_v2.png` | `DETAIL_black-seal-keeper-v2_v1.png` | 圆铜腰扣、正面右上缺口断圆盘与单红印黑册通过；v2移除衣摆混淆环纹。 |
| `act3_last_custodian` | 最后保管人 | `CHAR_act3-last-custodian_turnaround_v1.png` | `DETAIL_act3-last-custodian_v1.png` | 深青及小腿长发、单黑金发夹、四片页形衣片与琥珀螺旋方灯通过。 |
| `act3_archive_warden` | 档案守望者 | `CHAR_act3-archive-warden_turnaround_v1.png` | `DETAIL_act3-archive-warden_v1.png` | 本人右肩单辫、三枚铜扣、左腰卡盒、三张索引卡与冷蓝圆筒灯通过。 |

## 透明接口

通过。测试图为 RGBA，alpha 范围 0–255，存在 1571816 个 alpha<255 的像素；可生成真实透明背景，而非棋盘格伪透明。

## 仍未生产

表情表、透明立绘、场景设计与旧GAL资源逐张重绘属于下一阶段；这些资产生成前必须引用本包中的文字、三视图和细节板。
