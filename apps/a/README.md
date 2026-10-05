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

Open `http://localhost:4173`. The build applies release patches and ships the current 30-floor, three-tier entry. Its historical numeric build gate still validates the ten-floor reference route; separate 20/30-floor validators and revision-specific certificate replay are required as additional evidence. Source-dev and production are intentionally different.

`npm run check` fully decodes shipped raster images, verifies current atlas pixel provenance, runs current gameplay/UI/solver regression tests, proves the base campaign, validates the 20/30-floor campaigns, and builds the production release. The build verifies an authoritative ten-floor winning replay and bounded difficulty margins. Nine original expensive/research skips remain explicit; skipped checks are not claimed as passed.

## Core boundary, revision 2

Only runtime modules and transitive current build/validation dependencies are included. The supported GAL-only player, active loaders, image fallback resources and current gameplay tests remain. A frozen runtime payload fixture checks all shipped asset bytes and detects undeclared additions.

Historical production reviews, rejected/working artwork, source-document manifests, superseded assets, transport notes, review-only contact sheets, and unrelated solver/analyzer experiments are preserved in the separate QA/Library package. The unchanged historical harness remains reproducible there and passed 522 tests with 9 original skips; it is distinct from the smaller current-core suite. No external symlink or private fixture is needed for core checks.

This build does not imply browser/visual acceptance, publication or deployment. See LICENSE and THIRD_PARTY_NOTICES.md for licensing.


## 三档入口与存档保护

- 首次进入先选择宽容 / 经典 / 挑战；完整地图、剧情和战斗预判相同。宽容新版 r2 在原第二幕两处普通敌人减压上，增加第一幕 hushCantor 的 magicPower 249→199；挑战仅减少第三幕生命补给，经典保留原数值
- 每页难度固定。继续从该档自动进度恢复；“读取手动存档”读取该档手动进度；“难度 / 新游戏”返回入口，不先清除进度
- 经典保持旧30F键空间并使用既有旧档迁移。宽容和挑战各自独立，不会将经典进度改名复制成新难度
- 确认新局前保留当前档位原始自动/手动字节。可在“历史备份”导出原文件，或在校验及确认后恢复到本页。损坏和未来格式只允许原样导出，不自动覆盖或清理
- 新版页面用同源 Web Locks 排队写档；不支持时只读。使用前请关闭旧版魔塔标签页，旧版不参与该协议。跨标签版本冲突、配额失败和未知存档格式会停止写入，当前状态仍可导出
- 独立 GAL 展示不创建难度存档会话，不读写游戏存档。各游戏的剧情已读状态随自己的进度保存

当前候选的参数、逐步路线与存档兼容性须通过随候选提供的验证记录确认；玩家体感仍待试玩。部署后还需在实际候选站点完成浏览器视觉、触摸和后退/刷新验收。

## 宽容 r2 与原 r1 存档

- 新局仍只有宽容 / 经典 / 挑战三档。同一个引擎仅在恢复旧宽容进度时使用 r1 数据记录，不增加第四档新游戏
- 新宽容身份：candidateVersion `tower-forgiving-r2`，contentHash `52bf838bcf879eb1`，dataChecksum `228fcff017b15f83`，键空间后缀 `:difficulty:forgiving:revision:r2`
- 原宽容身份完整保持：profileId `forgiving`，candidateVersion `tower-three-tiers-r1`，contentHash `6f9bbbad0bb58045`，dataChecksum `b0feb01841ebb867`；运行路由 `forgiving-r1` 仅为兼容别名。原自动、手动、备份键与写锁名称不变，hushCantor 仍为 249
- 入口在宽容卡内提供“继续旧版宽容 r1”及原始文件导出；新旧规则在运行徽标中明确区分。只有旧档时，`?difficulty=forgiving` 显示选择入口，不自动开新局或替换规则；`?difficulty=forgiving-r1` 只会继续兼容旧档
- 新旧存档交叉导入、未来身份、未知元数据均拒绝；不重新贴标签、不补算已打战斗、不做 HP 补偿。新宽容写档不触及原宽容、经典、挑战或原备份
- 旧档有一槽损坏或来自未来版本时，有效另一槽可以只读继续；两槽原文均可导出。仅剩备份时仍可从入口导出，不自动将其恢复成当前进度
- 经典、挑战的完整身份与原键空间不变。回滚本候选只需恢复变更源码；r2 槽独立保留，旧版本不会读取或删除它们

运行新增兼容回归：`node --test test/difficulty-safety.test.js test/difficulty-revision.test.js`。入口交互使用事件式 DOM 测试替身；这不替代真实浏览器、移动触摸或视觉验收。
