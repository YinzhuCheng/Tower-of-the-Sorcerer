# 山路把冬天带回家 · B 霜径标准开发预览

独立文字/棋盘预览包。运行 `npm run build:preview:b`，发布目录为 `dist-b-preview`，入口 `/campaigns-b/`。正式森林背景和 CG 待验；无图片或旧战役美术。

`npm run test:preview:b` 验证 B UI 会话、16 条冻结证书和 DOM 接线。完整规则/GAL测试已在原工程中运行，具体 SHA 与验证记录见旁附冻结 manifest。实机视觉与触摸验收待部署后执行。

本包只提供标准方案，不声称三难度最终平衡。详见 `docs/campaigns/FOREST_PREVIEW.md`。

原主仓 `npm run check` 与 validate 脚本全部保留，运行完整回归；Vercel 仅发布B专属构建输出，不修改 main/A/C。
