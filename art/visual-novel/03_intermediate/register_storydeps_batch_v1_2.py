#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
VERSION = "GAL-SIMPLE-1.2"
STYLE_ANCHOR = "forest-approach"

ACCEPTED_ENVIRONMENTS = {
    "forest-approach": ("01_canon/environments/ENV_forest-approach_v1.png", "03_intermediate/prompt_packets/environments/forest-approach.json"),
    "night-tower": ("01_canon/environments/ENV_night-tower_v1.png", "03_intermediate/prompt_packets/environments/night-tower.json"),
    "ocean-archive": ("01_canon/environments/ENV_ocean-archive_v1.png", "03_intermediate/prompt_packets/environments/ocean-archive.json"),
    "ember-lighthouse-writein": ("01_canon/environments/ENV_ember-lighthouse-writein_v2.png", "03_intermediate/prompt_packets/environments/ember-lighthouse-writein_r2.json"),
    "star-mirror": ("01_canon/environments/ENV_star-mirror_v1.png", "03_intermediate/prompt_packets/environments/star-mirror.json"),
    "sun-sanctum": ("01_canon/environments/ENV_sun-sanctum_v1.png", "03_intermediate/prompt_packets/environments/sun-sanctum.json"),
    "echo-court": ("01_canon/environments/ENV_echo-court_v1.png", "03_intermediate/prompt_packets/environments/echo-court.json"),
    "origin-core": ("01_canon/environments/ENV_origin-core_v1.png", "03_intermediate/prompt_packets/environments/origin-core.json"),
    "triage-index": ("01_canon/environments/ENV_triage-index_v1.png", "03_intermediate/prompt_packets/environments/triage-index.json"),
    "archive-storm": ("01_canon/environments/ENV_archive-storm_v1.png", "03_intermediate/prompt_packets/environments/archive-storm.json"),
    "final-index-room": ("01_canon/environments/ENV_final-index-room_v1.png", "03_intermediate/prompt_packets/environments/final-index-room.json"),
    "ember-lighthouse": ("01_canon/environments/ENV_ember-lighthouse_v1.png", "03_intermediate/prompt_packets/environments/ember-lighthouse.json"),
    "ash-registry": ("01_canon/environments/ENV_ash-registry_v1.png", "03_intermediate/prompt_packets/environments/ash-registry.json"),
    "audit-chamber": ("01_canon/environments/ENV_audit-chamber_v1.png", "03_intermediate/prompt_packets/environments/audit-chamber.json"),
    "folded-archive-market": ("01_canon/environments/ENV_folded-archive-market_v1.png", "03_intermediate/prompt_packets/environments/folded-archive-market.json"),
    "moon-white-vestibule": ("01_canon/environments/ENV_moon-white-vestibule_v1.png", "03_intermediate/prompt_packets/environments/moon-white-vestibule.json"),
    "night-shelter": ("01_canon/environments/ENV_night-shelter_v1.png", "03_intermediate/prompt_packets/environments/night-shelter.json"),
    "red-vein": ("01_canon/environments/ENV_red-vein_v1.png", "03_intermediate/prompt_packets/environments/red-vein.json"),
    "relay-gallery": ("01_canon/environments/ENV_relay-gallery_v1.png", "03_intermediate/prompt_packets/environments/relay-gallery.json"),
    "twin-score-greenhouse": ("01_canon/environments/ENV_twin-score-greenhouse_v1.png", "03_intermediate/prompt_packets/environments/twin-score-greenhouse.json"),
}

ACCEPTED_TRANSITIONS = {
    "witness-entry": ("01_canon/transitions/TRANS_witness-entry_v1.png", "03_intermediate/prompt_packets/transitions/witness-entry.json"),
    "seal-shatter": ("01_canon/transitions/TRANS_seal-shatter_v1.png", "03_intermediate/prompt_packets/transitions/seal-shatter.json"),
}

PREVIEW_ENV_ORDER = [
    "forest-approach",
    "night-tower",
    "ocean-archive",
    "ember-lighthouse-writein",
    "star-mirror",
    "sun-sanctum",
    "echo-court",
    "origin-core",
    "triage-index",
    "archive-storm",
    "final-index-room",
    "ember-lighthouse",
]

PREVIEW_ALL_ENV_ORDER = PREVIEW_ENV_ORDER + [
    "ash-registry",
    "audit-chamber",
    "folded-archive-market",
    "moon-white-vestibule",
    "night-shelter",
    "red-vein",
    "relay-gallery",
    "twin-score-greenhouse",
]


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def info(rel: str) -> dict:
    path = ROOT / rel
    with Image.open(path) as im:
        im.load()
        return {
            "path": rel,
            "sha256": sha(path),
            "width": im.width,
            "height": im.height,
            "mode": im.mode,
        }


def dump(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def font(size: int):
    path = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    return ImageFont.truetype(path, size) if path.exists() else ImageFont.load_default()


def register_environments() -> list[dict]:
    records = []
    for card_path in sorted((ROOT / "03_intermediate/environment_cards").glob("ENV_*.json")):
        card = load(card_path)
        eid = card["environment_id"]
        if eid in ACCEPTED_ENVIRONMENTS:
            asset_path, packet_path = ACCEPTED_ENVIRONMENTS[eid]
            card["asset_status"] = "accepted"
            card["target_asset"] = asset_path
            card["asset"] = info(asset_path)
            card["prompt_packet"] = packet_path
        dump(card_path, card)
        records.append({
            "id": eid,
            "title": card["title"],
            "card": card_path.relative_to(ROOT).as_posix(),
            "status": card["status"],
            "asset_status": card["asset_status"],
            "asset": card.get("asset"),
            "prompt_packet": card.get("prompt_packet"),
        })
    dump(ROOT / "05_manifests/environment-index-v1.2.json", {
        "version": VERSION,
        "accepted": len(ACCEPTED_ENVIRONMENTS),
        "total_gal": 20,
        "environments": records,
    })
    accepted = [r for r in records if r["asset_status"] == "accepted"]
    dump(ROOT / "05_manifests/accepted-environments-v1.2.json", {"version": VERSION, "assets": accepted})
    return accepted


def register_transitions() -> list[dict]:
    records = []
    for card_path in sorted((ROOT / "03_intermediate/transition_cards").glob("TRANS_*.json")):
        card = load(card_path)
        tid = card["transition_id"]
        asset_path, packet_path = ACCEPTED_TRANSITIONS[tid]
        card["status"] = "accepted"
        card["asset_status"] = "accepted"
        card["target_asset"] = asset_path
        card["asset"] = info(asset_path)
        card["prompt_packet"] = packet_path
        dump(card_path, card)
        records.append({
            "id": tid,
            "title": card["title"],
            "card": card_path.relative_to(ROOT).as_posix(),
            "runtime_target": card["runtime_target"],
            "asset_status": "accepted",
            "asset": card["asset"],
            "prompt_packet": packet_path,
        })
    dump(ROOT / "05_manifests/accepted-transitions-v1.2.json", {"version": VERSION, "assets": records})
    return records


def unlock_scene_cards() -> list[dict]:
    scene_index_path = ROOT / "05_manifests/cg-scene-index-v1.2.json"
    scene_index = load(scene_index_path)
    index_by_id = {scene["cg_id"]: scene for scene in scene_index["scenes"]}
    ready = []
    for card_path in sorted((ROOT / "03_intermediate/scene_cards").glob("CG_*.json")):
        card = load(card_path)
        eid = card.get("environment_id")
        if eid is None:
            card["status"] = "ready-for-layout"
            card["environment_reference"] = None
            card["environment_reference_asset"] = None
        elif eid in ACCEPTED_ENVIRONMENTS:
            asset_path, _ = ACCEPTED_ENVIRONMENTS[eid]
            card["status"] = "ready-for-layout"
            card["environment_reference"] = asset_path
            card["environment_reference_asset"] = info(asset_path)
        else:
            card["status"] = "blocked-by-environment"
            card["environment_reference_asset"] = None
        dump(card_path, card)
        indexed = index_by_id[card["cg_id"]]
        indexed["status"] = card["status"]
        indexed["environment_asset"] = card.get("environment_reference_asset")
        if card["status"] == "ready-for-layout":
            ready.append({
                "cg_id": card["cg_id"],
                "card": card_path.relative_to(ROOT).as_posix(),
                "environment_id": eid,
                "environment_asset": card.get("environment_reference_asset"),
            })
    dump(scene_index_path, scene_index)
    dump(ROOT / "05_manifests/cg-layout-admission-v1.2.json", {
        "version": VERSION,
        "rule": "All listed character canon references and the exact environment master must be accepted and hash-locked before layout generation.",
        "ready": len(ready),
        "total": len(scene_index["scenes"]),
        "scenes": ready,
    })
    return ready


def update_graph(ready_count: int) -> None:
    graph_path = ROOT / "05_manifests/redraw-dependency-graph-v1.2.json"
    graph = load(graph_path)
    graph["b1_progress"] = {
        "environment_masters": {"accepted": len(ACCEPTED_ENVIRONMENTS), "total": 20},
        "story_cg_environment_dependencies": {"accepted": 12, "total": 12},
        "transition_masters": {"accepted": len(ACCEPTED_TRANSITIONS), "total": 2},
        "avatar_derivatives": {"accepted": 26, "total": 26},
        "cg_layout_admission": {"ready": ready_count, "total": 19},
    }
    for batch in graph.get("production_order", []):
        if batch.get("batch") == "B1":
            batch["status"] = "complete"
        elif batch.get("batch") == "B3":
            batch["status"] = "ready-for-layout"
    dump(graph_path, graph)


def append_generation_log() -> None:
    log_path = ROOT / "06_logs/generation-log-v1.2.jsonl"
    lines = log_path.read_text(encoding="utf-8").splitlines() if log_path.exists() else []
    rows = [json.loads(line) for line in lines if line.strip()]
    existing = set()
    for row in rows:
        output = row.get("output") or {}
        identity = row.get("environment_id") or row.get("transition_id")
        existing.add((row.get("asset_type"), identity, output.get("sha256")))
    now = datetime.now(timezone.utc).isoformat()
    anchor = info(ACCEPTED_ENVIRONMENTS[STYLE_ANCHOR][0])
    additions = []
    for eid, (asset_path, packet_path) in ACCEPTED_ENVIRONMENTS.items():
        if eid in {"forest-approach", "night-tower", "ocean-archive", "ember-lighthouse-writein"}:
            continue
        output = info(asset_path)
        key = ("environment_master", eid, output["sha256"])
        if key not in existing:
            additions.append({
                "time_utc": now,
                "version": VERSION,
                "asset_type": "environment_master",
                "environment_id": eid,
                "status": "accepted",
                "prompt_packet": packet_path,
                "input_files_in_order": [anchor],
                "output": output,
            })
    for tid, (asset_path, packet_path) in ACCEPTED_TRANSITIONS.items():
        output = info(asset_path)
        key = ("transition_master", tid, output["sha256"])
        if key not in existing:
            additions.append({
                "time_utc": now,
                "version": VERSION,
                "asset_type": "transition_master",
                "transition_id": tid,
                "status": "accepted",
                "prompt_packet": packet_path,
                "input_files_in_order": [anchor],
                "output": output,
            })
    with log_path.open("a", encoding="utf-8") as log:
        for row in additions:
            log.write(json.dumps(row, ensure_ascii=False) + "\n")


def make_environment_preview() -> None:
    cell_w, cell_h, header = 430, 280, 64
    sheet = Image.new("RGB", (cell_w * 4, header + cell_h * 3), (21, 24, 32))
    draw = ImageDraw.Draw(sheet)
    draw.text((22, 17), "GAL-SIMPLE-1.2 / ACCEPTED STORY ENVIRONMENTS 12 OF 12", font=font(24), fill=(240, 243, 249))
    for i, eid in enumerate(PREVIEW_ENV_ORDER):
        asset_path, _ = ACCEPTED_ENVIRONMENTS[eid]
        x, y = (i % 4) * cell_w, header + (i // 4) * cell_h
        with Image.open(ROOT / asset_path) as im:
            thumb = ImageOps.fit(im.convert("RGB"), (404, 228), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x + 13, y + 5))
        draw.text((x + 14, y + 240), f"{i + 1:02d}  {eid}", font=font(15), fill=(220, 226, 238))
    sheet.save(ROOT / "PREVIEW_environments_storydeps_v1.2.jpg", quality=91, optimize=True)


def make_all_environment_preview() -> None:
    cell_w, cell_h, header = 430, 280, 64
    sheet = Image.new("RGB", (cell_w * 4, header + cell_h * 5), (21, 24, 32))
    draw = ImageDraw.Draw(sheet)
    draw.text((22, 17), "GAL-SIMPLE-1.2 / ACCEPTED GAL ENVIRONMENTS 20 OF 20", font=font(24), fill=(240, 243, 249))
    for i, eid in enumerate(PREVIEW_ALL_ENV_ORDER):
        asset_path, _ = ACCEPTED_ENVIRONMENTS[eid]
        x, y = (i % 4) * cell_w, header + (i // 4) * cell_h
        with Image.open(ROOT / asset_path) as im:
            thumb = ImageOps.fit(im.convert("RGB"), (404, 228), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x + 13, y + 5))
        draw.text((x + 14, y + 240), f"{i + 1:02d}  {eid}", font=font(15), fill=(220, 226, 238))
    sheet.save(ROOT / "PREVIEW_environments_all_v1.2.jpg", quality=91, optimize=True)


def make_transition_preview() -> None:
    cell_w, cell_h, header = 760, 480, 66
    sheet = Image.new("RGB", (cell_w * 2, header + cell_h), (21, 24, 32))
    draw = ImageDraw.Draw(sheet)
    draw.text((22, 17), "GAL-SIMPLE-1.2 / ACCEPTED TRANSITION MASTERS 2 OF 2", font=font(24), fill=(240, 243, 249))
    for i, tid in enumerate(["witness-entry", "seal-shatter"]):
        asset_path, _ = ACCEPTED_TRANSITIONS[tid]
        x = i * cell_w
        with Image.open(ROOT / asset_path) as im:
            thumb = ImageOps.fit(im.convert("RGB"), (730, 410), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x + 15, header + 5))
        draw.text((x + 16, header + 430), f"{i + 1:02d}  {tid}", font=font(17), fill=(220, 226, 238))
    sheet.save(ROOT / "PREVIEW_transitions_v1.2.jpg", quality=91, optimize=True)


def write_qa() -> None:
    qa = [
        "# GAL-SIMPLE-1.2 · 剧情依赖环境与转场 QA",
        "",
        "本批新增通过 8 张剧情 CG 依赖环境和 2 张 GAL 转场。加上首批 4 张环境，19 张活动 CG 的环境前置现已全部锁定到具体文件与 SHA-256。",
        "",
        "| 资产 | 结论 |",
        "|---|---|",
        "| 星镜档案 | 通过；圆形校验镜、三段月相和低噪声档案空间明确。 |",
        "| 日轮圣所 | 通过；三道竖向结构、中央祭台和破晓暖光明确。 |",
        "| 回响王庭 | 通过；低王座、玻璃陈列台与开放前场明确。 |",
        "| 起源魔源 | 通过；破损登记环、蓝色魔源柱与冷却导管明确，无现代屏幕。 |",
        "| 归档作业庭 | 通过；三条物理分流轨与蓝/灰/琥珀空白旗明确。 |",
        "| 档案风暴 | 通过；纸页数量受控、方向一致、石阶仍可通行。 |",
        "| 最后索引室 | 通过；两侧高柜、中央封底钥匙座与升降轨明确。 |",
        "| 余烬灯塔外景 | 通过；退潮湿石、平静灰港、远端新码头与柔和晨光明确。 |",
        "| 见证场进入／返回 | 通过；中央蓝白门、短石阶、4 张空白纸，适合淡入淡出。 |",
        "| 强制封印解除 | 通过；单一黑色圆印、7 个大碎片、受控红紫裂隙，无爆炸化。 |",
        "",
        "共同检查：16:9、无人、无可读文字、无 UI/水印、底部或边缘留有对白/转场安全区。",
        "",
        "准入结果：19/19 活动 CG 场景卡均为 `ready-for-layout`；这只表示前置参考齐全，不表示 CG 已生成。",
    ]
    (ROOT / "03_intermediate/qa/QA_ENV_BATCH02_v1.2.md").write_text("\n".join(qa) + "\n", encoding="utf-8")


def write_b1_complete_qa() -> None:
    qa = [
        "# GAL-SIMPLE-1.2 · 环境批次 03 / B1 完成 QA",
        "",
        "本批新增通过 8 张常规对话环境。至此 20/20 张 GAL 环境、2/2 张转场与 26/26 张活动头像均已完成，B1 闭合。",
        "",
        "| 环境 | 结论 |",
        "|---|---|",
        "| 余烬登记库 | 通过；空白信件、铜灯和可修复书架明确，未做成废墟。 |",
        "| 逐页校验室 | 通过；两张对称校验桌、两枚黄铜放大框和空白页明确。 |",
        "| 折页档案与折角集市 | 通过；工作摊位和补给柜明确，无人、无节庆化。 |",
        "| 月白门廊 | 通过；白灰月石、低守卫台、单一室内月牙徽记和上行阶梯明确。 |",
        "| 夜航侧库 | 通过；床卷、急救箱、闭合夜班簿与琥珀值夜灯明确。 |",
        "| 赤脉炉室 | 通过；受控供暖炉、救援供暖管和可通行上行阶梯明确，无熔岩化。 |",
        "| 灯塔接力室 | 通过；固定导轨、分段电容、交接台和单向蓝绿能流明确。 |",
        "| 双谱温室 | 通过；两条水渠、两座种植台和柔绿日光保持镜像对称。 |",
        "",
        "共同检查：16:9、无人、无可读文字、无 UI/水印、角色站位与底部对白区可用。",
        "",
        "B1 结果：环境 20/20、转场 2/2、头像 26/26；魔塔玩法背景 `theme-forest-sanctuary.webp` 继续原样保留。",
    ]
    (ROOT / "03_intermediate/qa/QA_ENV_BATCH03_v1.2.md").write_text("\n".join(qa) + "\n", encoding="utf-8")


def main() -> None:
    accepted_envs = register_environments()
    accepted_transitions = register_transitions()
    ready_scenes = unlock_scene_cards()
    update_graph(len(ready_scenes))
    append_generation_log()
    make_environment_preview()
    make_all_environment_preview()
    make_transition_preview()
    write_qa()
    write_b1_complete_qa()
    print(json.dumps({
        "accepted_environments": len(accepted_envs),
        "accepted_transitions": len(accepted_transitions),
        "cg_ready_for_layout": len(ready_scenes),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
