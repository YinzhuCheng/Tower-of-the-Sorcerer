# 失落魔法阵：少女魔塔 · historical A core

This playable recovery is pinned to main `661296d3df912539f14f300442d962ba6c462541`. It is **not** the missing newer A338 story/art rewrite. No new narrative, balance or art was invented during recovery.

## Run and validate

Requires Node.js 18+ and Python with `Pillow==12.3.0`. No npm dependencies are required.

```sh
python3 -m pip install -r scripts/requirements-art.txt
npm run check
npm run build
cd dist
node ../scripts/dev-server.mjs --port 4173
```

Open `http://localhost:4173`. The original build applies release patches and produces the ten-floor demo. Source also retains the base, 20-floor and 30-floor campaigns and their authoritative route validations. Source-dev and production are intentionally different.

`npm run check` fully decodes shipped raster images, verifies current atlas pixel provenance, runs current gameplay/UI/solver regression tests, proves the base campaign, validates the 20/30-floor campaigns, and builds the production release. The build verifies an authoritative ten-floor winning replay and bounded difficulty margins. Nine original expensive/research skips remain explicit; skipped checks are not claimed as passed.

## Core boundary, revision 2

Only runtime modules and transitive current build/validation dependencies are included. The supported GAL-only player, active loaders, image fallback resources and current gameplay tests remain. A frozen runtime payload fixture checks all shipped asset bytes and detects undeclared additions.

Historical production reviews, rejected/working artwork, source-document manifests, superseded assets, transport notes, review-only contact sheets, and unrelated solver/analyzer experiments are preserved in the separate QA/Library package. The unchanged historical harness remains reproducible there and passed 522 tests with 9 original skips; it is distinct from the smaller current-core suite. No external symlink or private fixture is needed for core checks.

This build does not imply browser/visual acceptance, publication or deployment. See LICENSE and THIRD_PARTY_NOTICES.md for licensing.


## 三档入口与存档保护

- 首次进入先选择宽容 / 经典 / 挑战；完整地图、剧情和战斗预判相同。宽容仅放宽第二幕两处普通敌人的消耗，挑战仅减少第三幕生命补给，经典保留原数值
- 每页难度固定。继续从该档自动进度恢复；“读取手动存档”读取该档手动进度；“难度 / 新游戏”返回入口，不先清除进度
- 经典保持旧30F键空间并使用既有旧档迁移。宽容和挑战各自独立，不会将经典进度改名复制成新难度
- 确认新局前保留当前档位原始自动/手动字节。可在“历史备份”导出原文件，或在校验及确认后恢复到本页。损坏和未来格式只允许原样导出，不自动覆盖或清理
- 新版页面用同源 Web Locks 排队写档；不支持时只读。使用前请关闭旧版魔塔标签页，旧版不参与该协议。跨标签版本冲突、配额失败和未知存档格式会停止写入，当前状态仍可导出
- 独立 GAL 展示不创建难度存档会话，不读写游戏存档。各游戏的剧情已读状态随自己的进度保存

完整参数和恢复压力已离线验证，玩家体感仍待试玩。部署后还需在实际候选站点完成浏览器视觉、触摸和后退/刷新验收。
