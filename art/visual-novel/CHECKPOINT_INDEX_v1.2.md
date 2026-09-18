# GAL-SIMPLE-1.2 B1 检查点索引

## 已完成

- 17 名角色五层基准：文字、三视图、细节板、表情板、透明立绘；
- 19 张活动 CG 的源码场景卡；
- 21 张环境卡，其中 20 张为 GAL 重绘、1 张玩法森林主题明确保留；
- 26 张活动头像的确定性表情板裁切；
- 4 张已验收环境母版；
- 运行时路径分类与批次依赖图。

## 关键文件

- `00_source/story-source-lock.json`：仓库提交与剧情源文件哈希；
- `03_intermediate/scene_cards/`：19 张 CG 场景卡；
- `03_intermediate/environment_cards/`：环境事实与构图约束；
- `03_intermediate/BATCH_PLAN_v1.2.md`：重绘顺序与纠偏；
- `05_manifests/redraw-dependency-graph-v1.2.json`：92/35/1 路径分类；
- `05_manifests/avatar-derivatives-v1.2.json`：26 张头像裁切谱系；
- `05_manifests/accepted-environments-v1.2.json`：已通过环境；
- `03_intermediate/qa/QA_ENV_BATCH01_v1.2.md`：首批环境 QA。

## 后续顺序

1. 完成余下 16 张 GAL 环境与 2 张转场；
2. 生产 25 张活动对话立绘/表情差分；
3. 按场景卡顺序生产 2 张战斗 CG 和 17 张剧情 CG；
4. 导出运行时 WebP、归档旧别名，再进入仓库替换和测试。

本检查点不包含运行时覆盖或远端推送。
