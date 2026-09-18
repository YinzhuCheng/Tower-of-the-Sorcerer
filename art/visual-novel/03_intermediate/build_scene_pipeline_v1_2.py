#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent / "tower-repo"
VERSION = "GAL-SIMPLE-1.2"


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def dump(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def source_line(file: str, needle: str) -> int:
    for number, line in enumerate((REPO / file).read_text(encoding="utf-8").splitlines(), 1):
        if needle in line:
            return number
    raise ValueError(f"missing source locator: {file}: {needle}")


def char_refs(cid: str) -> list[dict]:
    path = ROOT / f"03_intermediate/reference_sets/characters/{cid}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    return data["reference_order"]


ENVIRONMENTS = [
    ("forest-approach", "森林进塔口", "序章、1–4F、早期守护者", "冷色黎明森林入口，远处同一座失落高塔；蜿蜒石路、黑曜石拱门、少量蓝白索引灯，纯环境。", "gal-redraw"),
    ("forest-sanctuary", "森林视觉主题", "玩法森林主题环境层", "玩法地图环境层，不属于 GAL 舞台背景。", "preserve-gameplay"),
    ("red-vein", "赤脉炉室", "5F、13F、焰璃场景", "空避难所仍工作的红脉炉、救援供暖管和上行阶梯；是维生设施，不是熔岩地狱。", "gal-redraw"),
    ("ocean-archive", "潮汐档案", "3F、16F、18F、澜音场景", "浅水档案厅、空白档案牌、远处撤离信标与上行阶梯；蓝绿水光清楚映出登记设施。", "gal-redraw"),
    ("star-mirror", "星镜档案", "6–7F、星图与影织场景", "月光星镜、无字证据页与三道月相刻痕；镜面用于校验记录，不是宇宙奇观。", "gal-redraw"),
    ("night-tower", "暗夜王庭", "序章、8–10F、女王场景", "无声王庭，低矮王座、月窗、封闭侧门、黑曜石拱门和细紫封印裂隙；冷静、空旷、没有庆典。", "gal-redraw"),
    ("sun-sanctum", "日轮圣所", "11F、14F、17F", "日光仪式圣所、空仪式台、三列校验结构与克制太阳纹；庄严但不是胜利画面。", "gal-redraw"),
    ("echo-court", "回响王庭", "19F", "低矮空王座、月光、无字玻璃名牌和开阔地面；可同时陈列离港、罹难、待核实三类记录。", "gal-redraw"),
    ("origin-core", "起源魔源", "20F", "破裂钴蓝印戒、宽阔登记环和冷却管；古代术式设施，禁止现代科幻屏幕。", "gal-redraw"),
    ("ash-registry", "余烬登记库", "21F", "暖灰档案库、空白信件、铜灯与可修复书架；重点是整理和修复，不是废墟。", "gal-redraw"),
    ("night-shelter", "夜航侧库", "22F", "深夜避难侧库，整齐床卷、药箱、空白夜班簿与琥珀值夜灯；安全、克制、仍在轮值。", "gal-redraw"),
    ("audit-chamber", "逐页校验室", "23F", "成对校验桌、黄铜放大框、冷蓝页灯和封存架；每页逐一比对，画面无可读文字。", "gal-redraw"),
    ("relay-gallery", "灯塔接力室", "24F", "纵深接力长廊、固定导轨、分段电容与信使交接台；蓝绿能量沿单一方向传递。", "gal-redraw"),
    ("triage-index", "归档作业庭", "25F、27F", "三路分诊索引庭，离港、罹难、待核实由空白色签和物理轨道分流；无现代 UI。", "gal-redraw"),
    ("archive-storm", "档案风暴", "28F", "塔内观测室与可通行石阶，少量失控纸页形成有方向的风；空间仍可读，不做混乱纸海。", "gal-redraw"),
    ("ember-lighthouse", "余烬灯塔外景", "终章出门", "破晓塔顶与平静灰港，潮水退后的湿石路和远处新码头；余烬灯柔和，无烟花。", "gal-redraw"),
    ("moon-white-vestibule", "月白门廊", "米露战前／战后", "白灰月石门廊、低矮守卫台、单一月牙徽记与通往上层的楼梯；清爽、适合对话站位。", "gal-redraw"),
    ("twin-score-greenhouse", "双谱温室", "12F、米露信物", "玻璃温室内两条对称谱线水渠与成对种植台，植物被用来校验两份记录；柔绿日光。", "gal-redraw"),
    ("folded-archive-market", "折页档案与折角集市", "15F、26F", "纸页折叠形成的档案摊位与补给柜，折角标签无文字；像工作集市，不拥挤、不庆典化。", "gal-redraw"),
    ("final-index-room", "最后索引室", "29F", "高索引柜向两侧展开，中央封底钥匙座和通往灯塔的升降轨；冷蓝灯与少量琥珀灯分层。", "gal-redraw"),
    ("ember-lighthouse-writein", "余烬灯塔写入口", "30F、终章室内", "灯塔内部写入口、蓝白索引环、光笔座、旧卷只读架与新终卷工作台；原件和新状态并列保存。", "gal-redraw"),
]


SCENES = [
    dict(id="critical", title="危急战斗预演", path="liyue-critical-cg.webp", file="src/main.js", env=None,
         cast=["hero"], expressions={"hero": "hurt but conscious"},
         passage="可胜但战后剩余生命不超过最大生命的 30%，进入危急战斗预演。",
         beat="让玩家确认这场战斗能赢但代价危险。",
         composition="16:9 中近景，璃单膝触地后用右手剑撑住身体，视线仍锁定前方；敌人不入画。",
         props=["hero sword", "left-waist scabbard", "record pouch"],
         must=["hurt but conscious", "right-hand sword", "both feet/legs readable", "portable dark tower vignette"],
         must_not=["blood or open wound", "defeated unconscious pose", "specific enemy", "text or HUD"]),
    dict(id="defeat", title="战败预演", path="liyue-defeat-cg.webp", file="src/main.js", env=None,
         cast=["hero"], expressions={"hero": "exhausted, conscious"},
         passage="战斗预测为不可胜时展示战败预演；本次行动不会消耗资源。",
         beat="明确警告玩家当前路线不可行，而非把失败猎奇化。",
         composition="16:9 中景，璃跪坐或倚剑喘息，武器仍在本人右侧，人物意识清楚；敌人不入画。",
         props=["hero sword", "left-waist scabbard", "record pouch"],
         must=["exhausted but conscious", "safe readable silhouette", "portable dark tower vignette"],
         must_not=["blood", "corpse-like pose", "torn sexualized clothing", "specific enemy", "text or HUD"]),
    dict(id="prologue-tower", title="序章：被夺去的咏唱", path="liyue-prologue-tower-cg.webp", file="src/game/data.js", env="night-tower",
         cast=["hero"], expressions={"hero": "guarded suspicion"},
         passage="三年前的停战夜，魔力风暴逼近灰港；高塔本应为撤离船导航，最后一艘船驶出后塔门再未打开。",
         beat="建立灰港、封塔与未结案危机。",
         composition="16:9 超广角；暴风海港与高塔占主体，璃作为背向镜头的小型前景人物，塔门刚封闭。",
         props=["sealed obsidian tower gate", "seven faint core lights", "distant evacuation ship"],
         must=["tower-dominant shot", "storm approaching harbor", "seven restrained core lights", "hero small and back-facing"],
         must_not=["celebration", "large hero portrait", "readable signs", "modern city"],
         inference="源码首句没有写璃入画；审计 registry 把 hero 列为 cast，因此仅安排小型背影，不增加动作。"),
    dict(id="seven-cantos-severed", title="序章：七段咏唱被拆分", path="liyue-seven-cantos-severed-cg-audit-v3.webp", file="src/game/data.js", env="night-tower",
         cast=["hero", "final_queen"], expressions={"hero": "hurt but conscious", "final_queen": "unyielding resolve"},
         passage="璃赶来接应时，诺克缇娅强行拆走她的七段咏唱，做成七枚魔力核心维持封锁。",
         beat="把女王的错误选择表现为紧急、恐惧驱动的强制行为，而非单纯恶意。",
         composition="16:9 动态双人中景；璃在左前景承受七束分离光，诺克缇娅在右后景操纵三枚封印片稳定核心。",
         props=["seven colored cantos/core lights", "three queen seal tablets", "hero sword lowered"],
         must=["exactly seven light segments", "queen has exactly three seal tablets", "hero remains conscious"],
         must_not=["guide physically present", "extra cores", "queen sword", "gore"],
         inference="旧 registry 将 guide 列为 cast，但她只是当前叙述者；事件事实要求改为 hero + final_queen。"),
    dict(id="northstar-arrival", title="三阵：北辰七号抵岸原音", path="liyue-lanyin-northstar-arrival-cg-v8.webp", file="src/game/demo-10-floor-content.js", env="ocean-archive",
         cast=["hero", "whale_boss"], expressions={"hero": "quiet resolve", "whale_boss": "musical concentration"},
         passage="第三段咏唱归位，完整原音确认北辰七号四十七人全员抵达北岸，灰港无滞留者。",
         beat="第一份决定性证据终于完整响起。",
         composition="16:9 双人侧景；澜音以五弦贝壳琴释放水镜原音，璃在另一侧聆听，水镜内只出现远船和四十七点灯火，不出现文字。",
         props=["five-string shell harp", "water-memory ring", "distant ship lights"],
         must=["five strings", "human legs", "evidence feels clear and calm"],
         must_not=["mermaid tail", "readable transcript", "extra instruments", "storm disaster" ]),
    dict(id="seven-core-network", title="七阵：七核契约网络", path="liyue-yayu-seven-core-network-cg-audit-v3.webp", file="src/game/demo-10-floor-content.js", env="star-mirror",
         cast=["hero", "shadow_boss"], expressions={"hero": "startled realization", "shadow_boss": "wary attention"},
         passage="七束不同颜色的光从璃胸前分向各层，显示七名守护者的契约都系在同一个结案锁上。",
         beat="把七层看似独立的战斗合并为同一个制度性锁链。",
         composition="16:9 高位中广角；璃居中，七束光清楚分向七个层级节点；鸦羽在侧方以针线追踪其中一束。",
         props=["exactly seven colored light paths", "single closure lock", "shadow needle and spool"],
         must=["exactly seven paths", "one shared lock", "shadow_boss owns needle/spool"],
         must_not=["seven duplicate characters", "extra jewelry", "readable UI", "random constellation"]),
    dict(id="noctia-truth", title="十阵真相对谈", path="liyue-noctia-truth-cg-audit-v3.webp", file="src/game/demo-10-floor-content.js", env="night-tower",
         cast=["hero", "final_queen"], expressions={"hero": "guarded suspicion", "final_queen": "contained sorrow"},
         passage="诺克缇娅三年每天听见“等待确认”，害怕关闭登记后灰港的人会被抹掉。",
         beat="让对抗第一次转化为理解她为何不敢停止。",
         composition="16:9 克制双人对谈；璃在左侧放低剑，诺克缇娅在右侧托住一团逐渐褪色的求援光，低王座在后。",
         props=["lowered hero sword", "faded distress light", "three queen seal tablets bound at rest"],
         must=["non-attacking poses", "queen sorrow readable", "low throne", "hero sword lowered"],
         must_not=["combat clash", "queen sword", "romantic embrace", "readable names"]),
    dict(id="noctia-seal", title="十阵共同破封", path="liyue-noctia-seal-cg-audit-v3.webp", file="src/game/demo-10-floor-content.js", env="night-tower",
         cast=["hero", "final_queen"], expressions={"hero": "quiet resolve", "final_queen": "unyielding resolve"},
         passage="诺克缇娅反手扯断束缚自己的黑纹，为璃撕开缺口；七枚核心照亮黯星裂缝。",
         beat="女王主动停止让恐惧替她挥剑，两人第一次协作。",
         composition="16:9 动作横构图；女王在右侧拉断黑纹并以三封印片撑开缺口，璃从左侧以单剑斩向核心；七枚核心沿裂缝排开。",
         props=["hero sword", "three seal tablets", "exactly seven cores", "black binding lines"],
         must=["cooperation not duel", "exactly seven cores", "exactly three seal tablets", "clear central gap"],
         must_not=["queen sword", "extra cores", "UI bars", "explosive debris covering faces"]),
    dict(id="missing-fourth-step", title="十一阵：缺失的第四步", path="liyue-noctia-missing-fourth-step-cg-audit-v3.webp", file="src/game/demo-20-floor-content.js", env="sun-sanctum",
         cast=["hero", "final_queen"], expressions={"hero": "quiet resolve", "final_queen": "shaken realization"},
         passage="完整流程的第四格本应是封存原件，却只剩撕裂白痕；有人把归档步骤拆掉，造成执行或删除的假二选一。",
         beat="揭示无限命令之所以无法正常撤销的第一处结构性缺口。",
         composition="16:9 三分构图；墙面四格流程只用抽象符号，第四格为空白撕裂痕；女王手悬在空位前，璃在侧后方观察。",
         props=["four-step wall with missing fourth slot", "archival seal fragments", "hero lowered sword"],
         must=["exactly four positions", "fourth is missing", "queen hand stops before gap"],
         must_not=["readable button text", "computer UI", "combat", "extra people"]),
    dict(id="seventeen-minute-splice", title="十七阵：确认时序错位", path="liyue-lumi-seventeen-minute-splice-cg-v8.webp", file="src/game/demo-20-floor-content.js", env="sun-sanctum",
         cast=["hero", "astral_boss"], expressions={"hero": "guarded suspicion", "astral_boss": "deep focus"},
         passage="露米把停电记录叠入三列时间，其中两列向后滑动十七分钟，证明命令与三次回答并非同时发生。",
         beat="用时间差推翻三席同时同意无限延长的假象。",
         composition="16:9 证据桌面与双人半身；露米操作黄铜月牙星盘，三列无字光带中两列错开一个清晰刻度，璃在旁确认。",
         props=["crescent brass astrolabe", "three timeline bands", "one blackout fold record"],
         must=["three columns", "two shift together", "one remains original", "no readable text"],
         must_not=["modern monitors", "generic galaxy", "extra star hair clips", "combat pose"]),
    dict(id="intercepted-receipt", title="十八阵：截留回执", path="liyue-yayu-intercepted-receipt-cg-audit-v3.webp", file="src/game/demo-20-floor-content.js", env="ocean-archive",
         cast=["hero", "shadow_boss"], expressions={"hero": "startled realization", "shadow_boss": "intense focus"},
         passage="鸦羽收紧紫线，一只透明虚空先驱从绿光中跌出，胸口像信箱般半开，卡着带船长印记的回执。",
         beat="证明回执并未丢失，而是被自动截留器困在塔内。",
         composition="16:9 动态三角；鸦羽在右侧收线，半透明非人形截留器跌在中央，璃在左侧看见其胸口回执。",
         props=["shadow needle and spool", "purple tracing lines", "sealed captain receipt", "spectral nonhuman interceptor"],
         must=["receipt visibly owned by interceptor", "shadow_boss controls lines", "interceptor is mechanism not person"],
         must_not=["readable letter", "human hostage", "mailbox comedy", "extra weapons"]),
    dict(id="echo-ledger", title="十九阵名簿归还", path="liyue-echo-ledger-cg-audit-v3.webp", file="src/game/demo-20-floor-content.js", env="echo-court",
         cast=["hero", "final_queen", "echo_regent"], expressions={"hero": "quiet resolve", "final_queen": "shaken realization", "echo_regent": "grave neutrality"},
         passage="诺克缇娅承认自己把待核实误解为整座灰港仍在求援；她把第七船名牌对准回执，离港状态变绿而死者牌仍保留。",
         beat="说明分类一个人不需要覆盖另一个人的真实状态。",
         composition="16:9 三人见证场；女王蹲身将单块名牌对准封印回执，璃与摄政官分立两侧，黑名簿置于低台。",
         props=["one ship nameplate", "captain receipt", "single black ledger", "separate mourning tag"],
         must=["three people readable", "one green status light", "mourning tag remains", "ledger owned by regent"],
         must_not=["readable names", "all tags turn green", "combat poster", "floating duplicate books"]),
    dict(id="noctia-sovereign", title="二十阵签名承担", path="liyue-noctia-sovereign-cg-audit-v3.webp", file="src/game/demo-20-floor-content.js", env="origin-core",
         cast=["hero", "final_queen", "arcane_sovereign"], expressions={"hero": "stern warning", "final_queen": "grave stillness", "arcane_sovereign": "regret"},
         passage="奥术主权者把手放在印戒下方，破裂光环沿手腕收紧，显示原签署人与命令被共同封存且不能单方撤回。",
         beat="让错误命令的签署者面对自己也被锁进命令的后果。",
         composition="16:9 三人克制构图；主权者居中托住本人右手裂纹印戒，蓝色破环束住手腕；璃和女王分别在两侧见证。",
         props=["one cracked oval signet on sovereign right hand", "broken blue ring", "small left-hand box"],
         must=["sovereign male", "signet on his right hand", "three people", "restraint not torture"],
         must_not=["queen sword", "extra rings", "readable warning text", "combat clash"]),
    dict(id="missing-page-restored", title="二十五阵：归档缺页复原", path="liyue-noctia-missing-page-cg-audit-v3.webp", file="src/game/demo-30-floor-content.js", env="triage-index",
         cast=["hero", "final_queen", "arcane_sovereign"], expressions={"hero": "quiet resolve", "final_queen": "shaken realization", "arcane_sovereign": "regret"},
         passage="协议最后一页被勘误核心自动拆出主卷；残页证明停止警报不影响原件保管、结案后仍可追加证据。",
         beat="找回让结束命令与继续记忆同时成立的制度依据。",
         composition="16:9 低机位三人围绕缺页台；主卷右端有整齐机械断口，缺页悬在同高度，三人不触碰文字面。",
         props=["main protocol volume", "one separated last page", "errata-core cut line"],
         must=["exactly one missing final page", "mechanical separation not knife tear", "three witnesses"],
         must_not=["readable legal text", "many flying pages", "battle pose", "modern scanner"]),
    dict(id="letters-held-in-storm", title="二十八阵：风暴中护住原信", path="liyue-noctia-archive-storm-cg-audit-v3.webp", file="src/game/demo-30-floor-content.js", env="archive-storm",
         cast=["hero", "final_queen"], expressions={"hero": "quiet resolve", "final_queen": "unyielding resolve"},
         passage="诺克缇娅不再追逐单封信，而是解下披风，与璃把近处的信挡在墙角并按原编号封住。",
         beat="从徒劳追逐单一警报转向先保护全部原件和顺序。",
         composition="16:9 低广角；女王的酒红内衬披风与璃共同形成挡风面，二人跪地把信件压在墙角，纸流方向清楚。",
         props=["queen cape", "numbered but unreadable letters", "plain sealing strips"],
         must=["cooperative sheltering action", "letters stay ordered", "queen crown remains", "hero sword sheathed or safely aside"],
         must_not=["chasing one letter", "readable mail", "romantic embrace", "paper obscures faces"]),
    dict(id="originals-enter-lighthouse", title="三十阵：原卷进入灯塔", path="liyue-archive-warden-entry-cg-audit-v3.webp", file="src/game/demo-30-floor-content.js", env="final-index-room",
         cast=["hero", "final_queen", "arcane_sovereign", "act3_last_custodian"], expressions={"hero": "quiet resolve", "final_queen": "grave stillness", "arcane_sovereign": "acceptance", "act3_last_custodian": "grave weariness"},
         passage="最后保管人转动封底钥匙，索引室打开；璃走最前，主权者与女王亲自抬最重原卷，全部证据沿升降轨送向灯塔。",
         beat="所有分散证据第一次作为同一套原件进入最终写入空间。",
         composition="16:9 深纵深群像；保管人在后方钥匙座，璃在轨道前端引路，女王和主权者并肩抬一卷大型原卷。",
         props=["custodian amber spiral lantern", "cover key", "lift rail", "one heavy archive volume"],
         must=["four source-grounded characters", "queen and sovereign share the heavy volume", "hero leads", "custodian operates key"],
         must_not=["archive warden substituted for custodian", "floating random books", "combat", "readable text"],
         inference="registry 只列三人，但源码明确写最后保管人的钥匙动作，因此把他作为后景第四人。"),
    dict(id="traceable-revocation", title="灯塔：可追溯撤销写入", path="liyue-traceable-revocation-cg-audit-v3.webp", file="src/game/demo-30-floor-content.js", env="ember-lighthouse-writein",
         cast=["guide", "final_queen", "arcane_sovereign"], expressions={"guide": "intense focus", "final_queen": "grave stillness", "arcane_sovereign": "acceptance"},
         passage="纱雾把光笔插入写入口，建立编号、来源、状态、经手人、时间与理由；旧版本转只读，不再覆盖。",
         beat="把撤销从抹除旧记录改造成可追溯的新状态写入。",
         composition="16:9 操作型中景；纱雾居中持光笔，完整银环星盘在侧；女王和主权者分别托住原卷两端，蓝白索引线分层展开。",
         props=["guide light pen", "complete silver astrolabe", "old read-only volume", "new index ring"],
         must=["guide owns pen and astrolabe", "old and new records coexist", "three people", "layers are visually distinct"],
         must_not=["readable UI", "old pages erased", "queen sword", "modern keyboard"]),
    dict(id="noctia-afterlight", title="终章：摘下警报石", path="liyue-noctia-afterlight-cg.webp", file="src/game/demo-30-floor-content.js", env="ember-lighthouse-writein",
         cast=["hero", "final_queen"], expressions={"hero": "quiet relief", "final_queen": "peaceful acceptance"},
         passage="诺克缇娅摘下王冠旁从未熄灭的警报石，放在灰港终卷边；璃把第一批待投递信匣放到两人中间。",
         beat="用一个很小的动作表现她终于允许警报停止，并准备走出塔。",
         composition="16:9 安静近中景；终卷、单枚警报石和信匣形成前景，女王手刚离开石头，璃在另一侧不催促。",
         props=["single alarm stone", "final gray-harbor volume", "first mail crate", "queen crown"],
         must=["one alarm stone", "quiet pause", "mail crate between them", "queen keeps three-point crown"],
         must_not=["celebration", "romantic touch", "readable addresses", "extra jewels"]),
    dict(id="lighthouse-archive", title="终章灯塔归档", path="liyue-lighthouse-archive-cg.webp", file="src/game/demo-30-floor-content.js", env="ember-lighthouse",
         cast=["hero", "guide", "final_queen", "arcane_sovereign"], expressions={"hero": "quiet resolve", "guide": "gentle reassurance", "final_queen": "peaceful acceptance", "arcane_sovereign": "acceptance"},
         passage="清晨前灯塔大门打开，湿石路通向新码头，第一辆邮车抵达；众人开始交接第一批信。",
         beat="结案不是静止终点，而是重新开始可被记录的投递工作。",
         composition="16:9 外景群像；灯塔门框住破晓，新邮车停在湿石路；璃和女王各抱一只信匣，主权者拿空白签收表，纱雾点亮复查灯。",
         props=["two mail crates", "blank handover form", "first review lamp", "mail coach"],
         must=["four characters have distinct tasks", "calm dawn", "wet road", "mail coach driver unarmed"],
         must_not=["victory fireworks", "readable form", "weapons raised", "crowded festival"]),
]


ALIASES = {
    "seven-cantos-severed": ["liyue-seven-cantos-severed-cg.webp"],
    "seven-core-network": ["liyue-yayu-seven-core-network-cg.webp"],
    "noctia-truth": ["liyue-noctia-truth-cg.webp"],
    "noctia-seal": ["liyue-noctia-seal-cg.webp"],
    "missing-fourth-step": ["liyue-noctia-missing-fourth-step-cg.webp"],
    "intercepted-receipt": ["liyue-yayu-intercepted-receipt-cg.webp"],
    "echo-ledger": ["liyue-echo-ledger-cg.webp"],
    "noctia-sovereign": ["liyue-noctia-sovereign-cg.webp"],
    "missing-page-restored": ["liyue-noctia-missing-page-cg.webp"],
    "letters-held-in-storm": ["liyue-noctia-archive-storm-cg.webp"],
    "originals-enter-lighthouse": ["liyue-archive-warden-entry-cg.webp"],
    "traceable-revocation": ["liyue-traceable-revocation-cg.webp"],
}


def classify_scope() -> tuple[list[str], list[str], list[str]]:
    scope = json.loads((ROOT / "05_manifests/redraw-scope.json").read_text(encoding="utf-8"))["redrawPaths"]
    active, archive, preserve = [], [], []
    for path in scope:
        if path.endswith("theme-forest-sanctuary.webp"):
            preserve.append(path)
            continue
        name = Path(path).name
        proc = subprocess.run(["rg", "-l", "--fixed-strings", name, "src", "public/art-audit"], cwd=REPO, text=True, capture_output=True)
        (active if proc.returncode == 0 else archive).append(path)
    return active, archive, preserve


def main() -> None:
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=REPO, text=True).strip()
    source_files = sorted({s["file"] for s in SCENES} | {"public/art-audit/registry.js", "src/game/anime-portraits.js", "src/main.js"})
    dump(ROOT / "00_source/story-source-lock.json", {
        "version": VERSION,
        "repository": "YinzhuCheng/Tower-of-the-Sorcerer",
        "branch": "codex/alpha-standees-20260904",
        "commit": commit,
        "files": [{"path": p, "sha256": sha(REPO / p)} for p in source_files],
        "authority": "runtime story source and art registry; higher priority than legacy artwork",
    })

    env_index = []
    for eid, title, usage, direction, status in ENVIRONMENTS:
        path = ROOT / f"03_intermediate/environment_cards/ENV_{eid}.json"
        asset = f"01_canon/environments/ENV_{eid}_v1.png"
        card = {
            "version": VERSION, "environment_id": eid, "title": title, "usage": usage, "status": status,
            "source_facts": direction,
            "composition_contract": "16:9 empty visual-novel stage; clean standing-figure zones at both sides; bottom 30% low detail",
            "series_anchors": ["obsidian arch", "small brass registration seal", "blue-white index lamp", "one thin violet seal fissure when applicable"],
            "must_not": ["people", "readable text", "UI", "logo", "watermark", "photorealism", "dense micro-texture"],
            "target_asset": asset if status == "gal-redraw" else None,
            "asset_status": "pending" if status == "gal-redraw" else "preserve-existing-gameplay-art",
        }
        dump(path, card)
        env_index.append({"id": eid, "card": path.relative_to(ROOT).as_posix(), "status": status, "target_asset": card["target_asset"]})

    scene_index = []
    for number, scene in enumerate(SCENES, 1):
        card_id = f"CG_{number:03d}_{scene['id']}"
        line = source_line(scene["file"], scene["path"])
        references = {cid: char_refs(cid) for cid in scene["cast"]}
        active_runtime = f"public/assets/anime/cg/{scene['path']}"
        card = {
            "version": VERSION,
            "cg_id": card_id,
            "semantic_id": scene["id"],
            "title": scene["title"],
            "status": "blocked-by-environment" if scene["env"] else "ready-for-layout",
            "source_locator": {"repository_commit": commit, "file": scene["file"], "line": line},
            "source_passage": scene["passage"],
            "narrative_beat": scene["beat"],
            "point_of_view": "third-person visual-novel camera aligned with protagonist understanding",
            "cast": scene["cast"],
            "expressions": scene["expressions"],
            "environment_id": scene["env"],
            "props": scene["props"],
            "composition": scene["composition"],
            "must_show": scene["must"],
            "must_not_show": scene["must_not"],
            "project_inference": scene.get("inference"),
            "character_reference_order": references,
            "environment_reference": f"01_canon/environments/ENV_{scene['env']}_v1.png" if scene["env"] else None,
            "runtime_target": active_runtime,
            "archive_only_aliases": [f"public/assets/anime/cg/{x}" for x in ALIASES.get(scene["id"], [])],
            "iteration_ladder": ["R0_layout", "R1_identity", "R2_costume", "R3_scene", "R4_final"],
            "output_contract": f"04_cg/final/{card_id}_v1.png",
        }
        path = ROOT / f"03_intermediate/scene_cards/{card_id}.json"
        dump(path, card)
        scene_index.append({"order": number, "cg_id": card_id, "semantic_id": scene["id"], "card": path.relative_to(ROOT).as_posix(), "runtime_target": active_runtime, "environment": scene["env"], "cast": scene["cast"]})

    active, archive, preserve = classify_scope()
    active_by_kind: dict[str, list[str]] = {}
    for path in active:
        kind = Path(path).parts[3]
        active_by_kind.setdefault(kind, []).append(path)
    dump(ROOT / "05_manifests/cg-scene-index-v1.2.json", {"version": VERSION, "repository_commit": commit, "scenes": scene_index})
    dump(ROOT / "05_manifests/environment-index-v1.2.json", {"version": VERSION, "environments": env_index})
    dump(ROOT / "05_manifests/redraw-dependency-graph-v1.2.json", {
        "version": VERSION,
        "policy": "redraw active GAL presentation only; preserve tower gameplay art; archive unreferenced duplicates",
        "source_scope_count": len(active) + len(archive) + len(preserve),
        "active_gal_runtime_count": len(active),
        "archive_only_count": len(archive),
        "preserve_gameplay_count": len(preserve),
        "active_by_kind": active_by_kind,
        "archive_only_paths": archive,
        "preserve_gameplay_paths": preserve,
        "production_order": [
            {"batch": "B0", "nodes": ["17 character canon packs"], "status": "complete"},
            {"batch": "B1", "nodes": ["20 GAL environment masters", "2 transition masters", "26 avatar crops"], "status": "in-production"},
            {"batch": "B2", "nodes": ["25 dialogue standee/expression variants"], "status": "pending", "depends_on": ["B0"]},
            {"batch": "B3", "nodes": ["2 portable battle CGs", "17 story CGs"], "status": "pending", "depends_on": ["B0", "B1"]},
            {"batch": "B4", "nodes": ["runtime WebP exports", "archive aliases", "repo replacement + tests"], "status": "pending", "depends_on": ["B1", "B2", "B3"]},
        ],
        "rule": "No CG generation starts until every listed character reference and its environment master are accepted with SHA-256.",
    })

    lines = [
        "# GAL-SIMPLE-1.2 重绘批次",
        "",
        f"源码锚点：`YinzhuCheng/Tower-of-the-Sorcerer@{commit}`，分支 `codex/alpha-standees-20260904`。",
        "",
        f"旧清单共 {len(active)+len(archive)+len(preserve)} 条；按实际运行时引用审计后：活动 GAL 路径 {len(active)} 条、只归档不重画 {len(archive)} 条、玩法保留 {len(preserve)} 条。",
        "",
        "| 批次 | 内容 | 状态 | 准入条件 |",
        "|---|---|---|---|",
        "| B0 | 17 角色文字/三视图/细节/表情/透明立绘 | 完成 | 已通过 v1.1 QA |",
        "| B1 | 20 GAL 环境、2 转场、26 头像裁切 | 进行中 | 环境卡完成 |",
        "| B2 | 25 个实际调用的对话立绘/表情差分 | 待生产 | 逐角色引用 v1.1 五层基准 |",
        "| B3 | 2 战斗 CG + 17 剧情 CG | 待生产 | 角色和对应环境均已通过 |",
        "| B4 | WebP 导出、旧别名归档、仓库替换与测试 | 待生产 | B1–B3 全部通过 |",
        "",
        "## 关键纠偏",
        "",
        "- `theme-forest-sanctuary.webp` 只服务玩法视觉主题，按用户要求保留，不进入 GAL 重绘。",
        "- 31 个 CG 路径实际对应 19 个活动镜头和 12 个未调用旧别名；每个活动镜头只生产一份母版。",
        "- 《七段咏唱被拆分》的源码事件人物是璃与诺克缇娅；纱雾只是当前叙述者，场景卡已纠正旧 registry 的 cast。",
        "- 《原卷进入灯塔》源码明确包含最后保管人的封底钥匙动作，场景卡保留其后景位置。",
        "",
        "## CG 顺序",
        "",
    ]
    for item in scene_index:
        lines.append(f"{item['order']}. `{item['cg_id']}` → `{item['runtime_target']}`；环境 `{item['environment'] or 'portable battle vignette'}`；角色 `{', '.join(item['cast'])}`。")
    (ROOT / "03_intermediate/BATCH_PLAN_v1.2.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"commit": commit, "scenes": len(scene_index), "environments": len(env_index), "active": len(active), "archive": len(archive), "preserve": len(preserve)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
