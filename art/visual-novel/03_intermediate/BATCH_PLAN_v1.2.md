# GAL-SIMPLE-1.2 重绘批次

源码锚点：`YinzhuCheng/Tower-of-the-Sorcerer@b05bc623b7c1ef8b93cfa1fca253ad2119a52f68`，分支 `codex/alpha-standees-20260904`。

旧清单共 128 条；按实际运行时引用审计后：活动 GAL 路径 92 条、只归档不重画 35 条、玩法保留 1 条。

| 批次 | 内容 | 状态 | 准入条件 |
|---|---|---|---|
| B0 | 17 角色文字/三视图/细节/表情/透明立绘 | 完成 | 已通过 v1.1 QA |
| B1 | 20 GAL 环境、2 转场、26 头像裁切 | 完成：环境 20/20、转场 2/2、头像 26/26 | 全部通过 QA |
| B2 | 25 个实际调用的对话立绘/表情差分 | 待生产 | 逐角色引用 v1.1 五层基准 |
| B3 | 2 战斗 CG + 17 剧情 CG | 19/19 场景卡可进入布局，尚未出图 | 角色和对应环境均已通过 |
| B4 | WebP 导出、旧别名归档、仓库替换与测试 | 待生产 | B1–B3 全部通过 |

## 关键纠偏

- `theme-forest-sanctuary.webp` 只服务玩法视觉主题，按用户要求保留，不进入 GAL 重绘。
- 31 个 CG 路径实际对应 19 个活动镜头和 12 个未调用旧别名；每个活动镜头只生产一份母版。
- 《七段咏唱被拆分》的源码事件人物是璃与诺克缇娅；纱雾只是当前叙述者，场景卡已纠正旧 registry 的 cast。
- 《原卷进入灯塔》源码明确包含最后保管人的封底钥匙动作，场景卡保留其后景位置。
- 20 张 GAL 环境母版已全部通过并写入 SHA-256；19 张活动 CG 场景卡可进入 R0 布局。

## CG 顺序

1. `CG_001_critical` → `public/assets/anime/cg/liyue-critical-cg.webp`；环境 `portable battle vignette`；角色 `hero`。
2. `CG_002_defeat` → `public/assets/anime/cg/liyue-defeat-cg.webp`；环境 `portable battle vignette`；角色 `hero`。
3. `CG_003_prologue-tower` → `public/assets/anime/cg/liyue-prologue-tower-cg.webp`；环境 `night-tower`；角色 `hero`。
4. `CG_004_seven-cantos-severed` → `public/assets/anime/cg/liyue-seven-cantos-severed-cg-audit-v3.webp`；环境 `night-tower`；角色 `hero, final_queen`。
5. `CG_005_northstar-arrival` → `public/assets/anime/cg/liyue-lanyin-northstar-arrival-cg-v8.webp`；环境 `ocean-archive`；角色 `hero, whale_boss`。
6. `CG_006_seven-core-network` → `public/assets/anime/cg/liyue-yayu-seven-core-network-cg-audit-v3.webp`；环境 `star-mirror`；角色 `hero, shadow_boss`。
7. `CG_007_noctia-truth` → `public/assets/anime/cg/liyue-noctia-truth-cg-audit-v3.webp`；环境 `night-tower`；角色 `hero, final_queen`。
8. `CG_008_noctia-seal` → `public/assets/anime/cg/liyue-noctia-seal-cg-audit-v3.webp`；环境 `night-tower`；角色 `hero, final_queen`。
9. `CG_009_missing-fourth-step` → `public/assets/anime/cg/liyue-noctia-missing-fourth-step-cg-audit-v3.webp`；环境 `sun-sanctum`；角色 `hero, final_queen`。
10. `CG_010_seventeen-minute-splice` → `public/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp`；环境 `sun-sanctum`；角色 `hero, astral_boss`。
11. `CG_011_intercepted-receipt` → `public/assets/anime/cg/liyue-yayu-intercepted-receipt-cg-audit-v3.webp`；环境 `ocean-archive`；角色 `hero, shadow_boss`。
12. `CG_012_echo-ledger` → `public/assets/anime/cg/liyue-echo-ledger-cg-audit-v3.webp`；环境 `echo-court`；角色 `hero, final_queen, echo_regent`。
13. `CG_013_noctia-sovereign` → `public/assets/anime/cg/liyue-noctia-sovereign-cg-audit-v3.webp`；环境 `origin-core`；角色 `hero, final_queen, arcane_sovereign`。
14. `CG_014_missing-page-restored` → `public/assets/anime/cg/liyue-noctia-missing-page-cg-audit-v3.webp`；环境 `triage-index`；角色 `hero, final_queen, arcane_sovereign`。
15. `CG_015_letters-held-in-storm` → `public/assets/anime/cg/liyue-noctia-archive-storm-cg-audit-v3.webp`；环境 `archive-storm`；角色 `hero, final_queen`。
16. `CG_016_originals-enter-lighthouse` → `public/assets/anime/cg/liyue-archive-warden-entry-cg-audit-v3.webp`；环境 `final-index-room`；角色 `hero, final_queen, arcane_sovereign, act3_last_custodian`。
17. `CG_017_traceable-revocation` → `public/assets/anime/cg/liyue-traceable-revocation-cg-audit-v3.webp`；环境 `ember-lighthouse-writein`；角色 `guide, final_queen, arcane_sovereign`。
18. `CG_018_noctia-afterlight` → `public/assets/anime/cg/liyue-noctia-afterlight-cg.webp`；环境 `ember-lighthouse-writein`；角色 `hero, final_queen`。
19. `CG_019_lighthouse-archive` → `public/assets/anime/cg/liyue-lighthouse-archive-cg.webp`；环境 `ember-lighthouse`；角色 `hero, guide, final_queen, arcane_sovereign`。
