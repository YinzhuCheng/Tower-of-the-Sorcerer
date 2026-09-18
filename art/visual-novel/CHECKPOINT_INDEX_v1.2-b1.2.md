# GAL-SIMPLE-1.2 · B1.2 第二检查点

本检查点完成剧情 CG 所需的环境与转场前置，但不是完整 B1，也没有替换游戏运行时文件。

## 当前锁定状态

| 项目 | 完成 | 说明 |
|---|---:|---|
| 角色基准包 | 17/17 | 文字、三视图、细节板、表情板、透明立绘 |
| 活动头像 | 26/26 | 从已验收表情板确定性裁切 |
| GAL 环境母版 | 12/20 | 剧情 CG 使用的 12/12 已齐；另 8 张对话环境待绘 |
| GAL 转场母版 | 2/2 | 见证场进入、强制封印解除 |
| 活动 CG 场景卡 | 19/19 可布局 | 每张已绑定角色参考链和环境母版 SHA-256 |
| 最终 CG | 0/19 | 本检查点没有越过布局/身份/服饰/场景/终稿迭代顺序 |

## 核心验收文件

- `PREVIEW_environments_storydeps_v1.2.jpg`：12 张剧情依赖环境总览；
- `PREVIEW_transitions_v1.2.jpg`：2 张转场总览；
- `05_manifests/cg-layout-admission-v1.2.json`：19 张 CG 的准入状态；
- `05_manifests/accepted-environments-v1.2.json`：已通过环境及 SHA-256；
- `05_manifests/accepted-transitions-v1.2.json`：已通过转场及 SHA-256；
- `03_intermediate/qa/QA_ENV_BATCH02_v1.2.md`：逐图 QA；
- `06_logs/generation-log-v1.2.jsonl`：实际输入顺序和输出谱系。

## 下一步顺序

1. 完成剩余 8 张对话环境，闭合 B1；
2. 按场景卡生成 19 张 CG 的 R0 构图稿；
3. 每张依次通过 R1 身份、R2 服饰/物件、R3 场景、R4 终稿；
4. 完成对话立绘差分后，再统一导出 WebP 并进入仓库替换与测试。

魔塔玩法资源继续保留，不进入本轮重绘。
