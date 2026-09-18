# GAL CG 后续制作与上传规范

> 适用项目：`YinzhuCheng/Tower-of-the-Sorcerer`<br>
> 工作分支：`codex/alpha-standees-20260904`<br>
> 基线版本：`GAL-SIMPLE-1.2`<br>
> 文档版本：`1.0`（2026-09-18）

本文件是后续 GAL CG 制作与远端交付的执行规范。目标是让任何接手者都能从已验收的角色、环境和场景卡继续生产，不依赖某一台临时虚拟机，也不靠聊天记录猜测设计。

## 1. 当前断点

- 角色基准：17/17 完成文字设定、三视图、细节板、表情板与透明立绘。
- 环境基准：20/20 GAL 环境、2/2 转场完成并锁定 SHA-256。
- 活动 CG：19 张；`CG_001–CG_003` 已通过 R0 构图门槛，`CG_004–CG_019` 待 R0。
- 最终 CG：0/19。R0 通过不等于终稿。
- 运行时替换：尚未开始；`public/assets/` 中旧 GAL 资源暂不覆盖。
- 魔塔地图、战斗单位、物品与机制美术不属于本轮替换范围。

权威状态文件：

- [`03_intermediate/BATCH_PLAN_v1.2.md`](03_intermediate/BATCH_PLAN_v1.2.md)
- [`05_manifests/cg-layout-admission-v1.2.json`](05_manifests/cg-layout-admission-v1.2.json)
- [`05_manifests/cg-scene-index-v1.2.json`](05_manifests/cg-scene-index-v1.2.json)
- [`05_manifests/cg-r0-batch01-v1.2.json`](05_manifests/cg-r0-batch01-v1.2.json)
- [`06_logs/generation-log-v1.2.jsonl`](06_logs/generation-log-v1.2.jsonl)

## 2. 下一批：B3 R0 Batch 02

下一批只处理三张图，完成 QA 和上传后再进入下一批：

| 顺序 | CG | 角色 | 环境 | R0 核心验收点 |
|---|---|---|---|---|
| 1 | `CG_004_seven-cantos-severed` | `hero`, `final_queen` | `night-tower` | 恰好七段光核、女王恰好三枚封印片、璃仍清醒、纱雾不入镜 |
| 2 | `CG_005_northstar-arrival` | `hero`, `whale_boss` | `ocean-archive` | 双人身份清楚、到场动作与潮汐档案空间关系明确、道具归属无混淆 |
| 3 | `CG_006_seven-core-network` | `hero`, `shadow_boss` | `star-mirror` | 七核网络可读、两人轮廓不互相吞并、星镜环境不压过剧情动作 |

选择这三张作为一批，是为了同时验证双人构图、三套不同环境语言，以及固定数量物件的可控性。不要把 `CG_007` 提前混入本批。

## 3. 权威顺序与冲突处理

每张 CG 必须按以下优先级解释视觉事实：

1. `01_canon/characters/*.md` 与结构化角色设定；
2. `01_canon/turnarounds/` 三视图；
3. `01_canon/details/` 服饰、武器和物件细节板；
4. `01_canon/expressions/` 表情板；
5. `01_canon/standees/` 透明立绘；
6. 已验收的新 CG，仅作脸部和系列画风锚点；
7. 对应环境母版；
8. 旧 GAL 图，仅可帮助理解历史构图，不能覆盖新设定。

低优先级资料与高优先级资料冲突时，以高优先级资料为准。漂亮但违反数量、左右侧、服装层次或剧情事实的结果必须退稿。

## 4. 单张 CG 的制作流程

### 4.1 准入检查

开始生成前，必须确认：

- 场景卡存在于 `03_intermediate/scene_cards/`；
- 场景卡状态为 `ready-for-layout` 或对应后续阶段的明确状态；
- 所有出场角色的文字、三视图、细节板、表情板和透明立绘齐全；
- 环境母版路径、尺寸和 SHA-256 与场景卡一致；
- 必要物件已有细节板，或已在场景卡中写明结构与固定数量；
- 角色、环境、道具任何必要参考缺失时立即停止，先补上游资料。

### 4.2 建立实际参考清单

为每次生成新建：

`03_intermediate/reference_sets/<CG_ID>_<阶段>.json`

清单必须记录：

- 实际输入文件的顺序；
- 每个文件的角色或用途；
- 相对路径与 SHA-256；
- 哪些资料只作为文字约束，哪些图片实际传给生成工具；
- 环境图是“构图依据”还是仅作“建筑/画风依据”；
- 输出路径、输出 SHA-256、QA 文件与状态。

不要只写计划引用；必须保存本次实际传入的图片及顺序。

### 4.3 建立提示包

为每次生成新建：

`03_intermediate/prompt_packets/<CG_ID>_<阶段>.json`

提示包至少包含：

- `series_style_lock`：系列线条、上色、光影与视觉噪声标准；
- `identity_lock`：脸、发型、服装、左右侧与物件数量；
- `scene_facts`：从源码场景卡提取的事实；
- `composition`：景别、机位、人物位置、前中后景与 UI 安全区；
- `emotional_direction`：每个人此刻知道什么、害怕什么、决定什么；
- `continuity_anchors`：允许引用的已验收图；
- `negative_constraints`：多余配饰、伪文字、水印、年龄错误、解剖错误和剧情矛盾；
- `output_contract`：宽高比、阶段与语义文件名。

提示词要明确“角色自身左/右”，不能只写画面左/右。

### 4.4 迭代阶梯

| 阶段 | 只解决什么 | 通过条件 | 不应过早处理 |
|---|---|---|---|
| `R0_layout` | 构图、景别、动线、人物比例、道具归属 | 叙事一眼可读；人数、位置和固定数量正确 | 脸部精修、纹理和最终光效 |
| `R1_identity` | 脸、发型、年龄、体型与角色辨识 | 遮掉服装细节仍能认出角色 | 背景装饰堆叠 |
| `R2_costume` | 衣片结构、配饰数量、左右侧、武器收纳 | 与三视图和细节板逐项一致 | 最终滤镜 |
| `R3_scene` | 环境几何、天气、道具和剧情细节 | 场景事实完整且不抢人物 | 无关彩蛋与可读伪文字 |
| `R4_final` | 统一光影、边缘、色彩与完成度 | 100% 查看无明显瑕疵，可导出运行时版本 | 改写已经锁定的构图和身份 |

复杂镜头必须逐级推进。简单镜头可以合并相邻阶段，但场景卡、参考清单、提示包和 QA 不能省略。

### 4.5 QA 与退稿

每张输出在 100% 缩放下检查：

- 人脸是否匹配角色母版；
- 发型、头饰、胸针、扣件和武器数量是否准确；
- 角色自身左右侧是否正确；
- 手指、腿脚和被握持物件是否分离清楚；
- 道具是否由正确角色持有；
- 环境几何、时间、天气和光向是否支持剧情；
- 画面是否出现伪文字、签名、水印或 UI；
- 多人镜头是否发生服饰、发色或标志物串角；
- 画面表达的是指定剧情节点，而不是泛用漂亮插图。

QA 写入：

`03_intermediate/qa/<CG_ID>_<阶段>_qa.md`

失败稿移动到 `04_cg/rejected/<阶段>/`，保留原文件并写清退稿原因；禁止用新版静默覆盖失败稿。通过但仍有后续修正项的版本使用 `accepted-*-with-carry`，并把修正项传递到下一阶段。

### 4.6 登记与晋级

每次生成后必须同步更新：

1. 当前批次 manifest；
2. `05_manifests/cg-layout-admission-v1.2.json` 或对应阶段状态表；
3. `05_manifests/cg-scene-index-v1.2.json`；
4. `06_logs/generation-log-v1.2.jsonl`，只追加、不回写历史；
5. 批次 QA 总表与预览图；
6. `README.md` 和 `BATCH_PLAN_v1.2.md` 的完成数量。

一张 CG 只有在“图片、场景卡、提示包、参考清单、QA、manifest、日志”全部齐全时，才算完成当前阶段。

## 5. 文件命名与目录

通过稿：

```text
04_cg/working/CG_<NNN>_<semantic-id>_R0_layout_v1.png
04_cg/working/CG_<NNN>_<semantic-id>_R1_identity_v1.png
04_cg/final/CG_<NNN>_<semantic-id>_v1.png
```

退稿：

```text
04_cg/rejected/R0-layout/CG_<NNN>_<semantic-id>_R0_layout_v1_rejected-<reason>.png
```

文件名使用 ASCII、小写语义词和连字符；版本号只递增，不回收。最终运行时 WebP 的路径以场景卡 `runtime_target` 为准。

## 6. 下一批上传规范

### 6.1 文件分流

| 类型 | 去向 | 规则 |
|---|---|---|
| `.md`、`.json`、`.jsonl`、`.html`、脚本 | 普通 Git | 保持可审阅 diff；JSON/JSONL 提交前解析校验 |
| 预览图、小型运行时 WebP | 普通 Git | 只提交必要版本；运行时资源必须先压缩和解码验证 |
| 新增高清 PNG 母版、工作稿、退稿 | Git LFS | 只对今后新增或重新写入的大图启用；不改写已有历史 |
| 检查点 ZIP、批量源文件归档 | GitHub Release | 仓库只保留版本号、SHA-256、文件清单和 Release 链接 |
| 临时缓存、Base64 中间片段、工具临时文件 | 不上传 | 可以重建，不属于项目资产 |

### 6.2 Git LFS 采用规则

当前历史中的图片保持原样，不执行 `git lfs migrate`，不做历史重写。下一批开始前，应单独提交 `.gitattributes`，让后续新增的 `art/visual-novel/**/*.png` 等源图进入 LFS；`public/assets/**/*.webp` 继续使用普通 Git，避免运行时部署依赖被无意改变。

LFS 规则必须在独立提交中启用并验证，不能与一整批 CG 混在同一提交里。启用后检查：

```bash
git lfs version
git lfs track
git check-attr filter -- art/visual-novel/04_cg/working/<new-file>.png
git lfs ls-files
```

如当前推送通道无法上传 LFS 对象，停止在本地提交阶段，不要把 LFS 指针文件当成完整图片推到远端。

### 6.3 每批提交边界

一批最多包含：

- 3 张普通双人镜头，或
- 1–2 张三人以上复杂镜头，或
- 1 个阶段的单张返工。

同一提交包含该批的图片、提示包、参考清单、QA、manifest、追加日志和预览。不要把不相关源码修改、魔塔美术或下一批半成品混入。

推荐提交信息：

```text
art: add GAL CG R0 batch 02
art: advance CG 004-006 to R1 identity
art: publish GAL CG batch 02 runtime assets
```

## 7. 提交前验证

最低检查项：

```bash
# 工作区与差异
git status --short --branch
git diff --check

# JSON 与 JSONL
find art/visual-novel -name '*.json' -print0 | xargs -0 -n1 jq empty
jq -c . art/visual-novel/06_logs/generation-log-v1.2.jsonl >/dev/null

# 新增图像的尺寸、模式、解码与 SHA-256
sha256sum <new-image-files>

# 项目测试（以 package.json 中当前脚本为准）
npm test
```

还必须人工确认：

- `git diff --cached --stat` 没有意外的大文件或无关目录；
- 每个 manifest 中的 SHA-256 与实际文件一致；
- 预览图不是唯一存档，原始输出已经进入正确目录；
- 本批没有修改 `public/assets/`，除非明确进入 B4 运行时替换阶段。

## 8. 推送与远端验收

优先使用已认证的标准 Git 推送：

```bash
git fetch origin
git merge --ff-only origin/codex/alpha-standees-20260904
git push origin HEAD:codex/alpha-standees-20260904
```

如远端在制作期间前移，停止并检查差异；不得强推。二进制对象不要通过容易截断的单文件 Base64 内容接口上传。

推送后必须反向校验：

```bash
git fetch origin codex/alpha-standees-20260904
git ls-remote origin refs/heads/codex/alpha-standees-20260904
git rev-parse HEAD^{tree}
git rev-parse origin/codex/alpha-standees-20260904^{tree}
git diff --exit-code HEAD origin/codex/alpha-standees-20260904
```

判断成功的标准是：

- 远端分支确实包含本批提交；
- 本地与远端 tree SHA 相同；
- `git diff` 为空；
- LFS 批次还要确认所有 LFS 对象已上传；
- GitHub 页面能看到文档、manifest 与文件路径。

若连接器重新创建了提交，commit SHA 可能变化；只要父提交正确、tree SHA 完全相同且远端分支已前移，内容仍可判定一致。记录新的远端 commit SHA，不要为追求原 SHA 再次上传。

## 9. 上传失败恢复

1. 先执行 `git ls-remote`，确认远端引用是否已经移动；
2. 未移动：本地提交仍是安全检查点，可换标准 Git/LFS 通道重推；
3. 已移动：先 fetch，再比较 tree SHA，禁止盲目重复上传；
4. 单个大文件截断：不要更新分支引用，改用 Git LFS 或 Release；
5. LFS 对象缺失：补传对象并验证，不能只留下 pointer；
6. 禁止 `git push --force`、禁止改写已有美术历史；
7. 失败产生的临时包对象不属于项目交付，确认无引用后再清理。

## 10. 后续批次顺序

| 批次 | CG 范围 | 说明 |
|---|---|---|
| B3 R0 Batch 02 | `CG_004–CG_006` | 双人、多环境、固定数量物件校准 |
| B3 R0 Batch 03 | `CG_007–CG_009` | 诺克缇娅连续叙事与镜头差异化 |
| B3 R0 Batch 04 | `CG_010–CG_012` | 双人到三人升级，回声摄政官首次进入 CG |
| B3 R0 Batch 05 | `CG_013–CG_015` | 奥术主权者与高动态档案风暴 |
| B3 R0 Batch 06 | `CG_016–CG_019` | 四人复杂镜头与终章灯塔连续性 |

全部 19 张通过 R0 后，再按剧情相邻性推进 R1–R4。允许 `CG_001–CG_003` 提前进入 R1，但不能因此跳过 `CG_004–CG_019` 的 R0 总体构图校准。

## 11. 最终运行时替换门槛

只有达到以下条件，才能进入 B4：

- 19/19 CG 通过最终 QA；
- 25 个对话立绘/表情差分完成；
- 所有最终 PNG 有 SHA-256、尺寸、谱系与 QA；
- WebP 导出做过色彩、Alpha、尺寸与解码检查；
- 旧别名与活动路径映射明确；
- 项目测试与游戏可解性验证通过；
- 有回滚清单，能够从 runtime target 追溯到最终 PNG。

B4 替换应单独提交。源图、运行时导出和代码改动分层审阅，不要在最后一刻把未经 QA 的工作稿直接覆盖到游戏目录。

---

执行原则：**先固化事实和参考，再生成；先记录失败，再晋级；先完成验证，再移动远端分支。**
