# GAL-SIMPLE-1.1 QA 总表

结论：17 名角色均已具备文字设定、三视图、细节板、六格表情板和透明基础立绘。

透明立绘全部为 1024×1536 RGBA，Alpha 范围 0–255，四角透明；清理了远离主体的低 Alpha 残留像素 0 个。

| ID | 表情板 | 透明立绘 | 立绘验收要点 |
|---|---|---|---|
| `hero` | `EXPR_hero_v1.png` | `STANDEE_hero_neutral_v1.png` | 右手单剑、左腰剑鞘与记录包、双腰扣及两枚月牙标志均通过。 |
| `guide` | `EXPR_guide_v1.png` | `STANDEE_guide_neutral_v1.png` | 本人左侧白花、完整银环星盘、双飘带均通过。 |
| `final_queen` | `EXPR_final-queen_v1.png` | `STANDEE_final-queen_neutral_v1.png` | 三块封印片、三尖冠、无剑设定通过。 |
| `cat_boss` | `EXPR_cat-boss_v1.png` | `STANDEE_cat-boss_neutral_v1.png` | 猫脸、两耳一尾、左盾右弯刀通过。 |
| `fox_boss` | `EXPR_fox-boss_v1.png` | `STANDEE_fox-boss_neutral_v3.png` | v3准确锁定三条白尖尾、单扇和三张符纸；v1/v2因四尾退稿。 |
| `whale_boss` | `EXPR_whale-boss_v1.png` | `STANDEE_whale-boss_neutral_v1.png` | 五弦贝壳琴、人类双腿与双袖垂片通过。 |
| `sword_boss` | `EXPR_sword-boss_v2.png` | `STANDEE_sword-boss_neutral_v1.png` | 右手单剑、左腰剑鞘与单胸菱徽通过。 |
| `dragon_boss` | `EXPR_dragon-boss_v1.png` | `STANDEE_dragon-boss_neutral_v1.png` | 双角、单尾、两片布质披片与单长枪通过。 |
| `astral_boss` | `EXPR_astral-boss_v1.png` | `STANDEE_astral-boss_neutral_v1.png` | 本人右侧星夹、单胸星扣与本人左手黄铜星盘通过。 |
| `shadow_boss` | `EXPR_shadow-boss_v1.png` | `STANDEE_shadow-boss_neutral_v1.png` | 本人右手针、左手线轴、左腰针盒与对称腿部通过。 |
| `merchant` | `EXPR_merchant_v1.png` | `STANDEE_merchant_neutral_v1.png` | 单背包/卷毯、本人左手灯与右手钱袋通过。 |
| `echo_regent` | `EXPR_echo-regent_v1.png` | `STANDEE_echo-regent_neutral_v1.png` | 本人右肩至左腰绶带与本人左手单名簿通过。 |
| `arcane_sovereign` | `EXPR_arcane-sovereign_v1.png` | `STANDEE_arcane-sovereign_neutral_v1.png` | 男性轮廓、本人右手印戒、左手匣与单蓝菱领扣通过。 |
| `palace_warden_v2` | `EXPR_palace-warden-v2_v1.png` | `STANDEE_palace-warden-v2_neutral_v1.png` | 本人右手单槽直剑、左腰剑鞘与对称肩甲通过。 |
| `black_seal_keeper_v2` | `EXPR_black-seal-keeper-v2_v1.png` | `STANDEE_black-seal-keeper-v2_neutral_v1.png` | 断圆盘正面右上缺口与单红印黑册通过。 |
| `act3_last_custodian` | `EXPR_act3-last-custodian_v1.png` | `STANDEE_act3-last-custodian_neutral_v1.png` | 深青长发、琥珀螺旋方灯、页形衣片与标签通过。 |
| `act3_archive_warden` | `EXPR_act3-archive-warden_v1.png` | `STANDEE_act3-archive-warden_neutral_v1.png` | 本人右肩单辫、三扣、冷蓝圆筒灯与左腰卡盒通过。 |

## 本轮退稿

- 剑圣表情板 v1：多出第二枚领口蓝菱徽；v2 通过。
- 狐祝透明立绘 v1、v2：均误生为四尾；v3 准确三尾后通过。

## 下一阶段准入条件

旧 GAL 图重绘前先建立场景卡与场景专用物件板。每张 CG 必须逐角色按文字、三视图、细节板、表情板、透明立绘顺序引用；缺任一必要资料即暂停生成。魔塔部分继续保留。
