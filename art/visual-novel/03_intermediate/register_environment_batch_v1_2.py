#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
VERSION = "GAL-SIMPLE-1.2"
ACCEPTED = {
    "forest-approach": "01_canon/environments/ENV_forest-approach_v1.png",
    "night-tower": "01_canon/environments/ENV_night-tower_v1.png",
    "ocean-archive": "01_canon/environments/ENV_ocean-archive_v1.png",
    "ember-lighthouse-writein": "01_canon/environments/ENV_ember-lighthouse-writein_v2.png",
}
PACKETS = {
    "forest-approach": "03_intermediate/prompt_packets/environments/forest-approach.json",
    "night-tower": "03_intermediate/prompt_packets/environments/night-tower.json",
    "ocean-archive": "03_intermediate/prompt_packets/environments/ocean-archive.json",
    "ember-lighthouse-writein": "03_intermediate/prompt_packets/environments/ember-lighthouse-writein_r2.json",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def info(rel: str) -> dict:
    path = ROOT / rel
    with Image.open(path) as im:
        im.load()
        return {"path": rel, "sha256": sha(path), "width": im.width, "height": im.height, "mode": im.mode}


def dump(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def font(size: int):
    path = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    return ImageFont.truetype(path, size) if path.exists() else ImageFont.load_default()


def main() -> None:
    records = []
    for card_path in sorted((ROOT / "03_intermediate/environment_cards").glob("ENV_*.json")):
        card = json.loads(card_path.read_text(encoding="utf-8"))
        eid = card["environment_id"]
        if eid in ACCEPTED:
            card["asset_status"] = "accepted"
            card["target_asset"] = ACCEPTED[eid]
            card["asset"] = info(ACCEPTED[eid])
            card["prompt_packet"] = PACKETS[eid]
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
    dump(ROOT / "05_manifests/environment-index-v1.2.json", {"version": VERSION, "accepted": len(ACCEPTED), "total_gal": 20, "environments": records})
    dump(ROOT / "05_manifests/accepted-environments-v1.2.json", {"version": VERSION, "assets": [r for r in records if r["asset_status"] == "accepted"]})

    rejected_path = "04_cg/rejected/ENV_ember-lighthouse-writein_v1_readable-gibberish.png"
    rejected_manifest_path = ROOT / "05_manifests/rejected-assets.json"
    rejected_manifest = json.loads(rejected_manifest_path.read_text(encoding="utf-8"))
    rejected_manifest["version"] = VERSION
    rejected_manifest["assets"] = [x for x in rejected_manifest["assets"] if x["path"] != rejected_path]
    rejected_item = info(rejected_path)
    rejected_item["reason"] = "打开的书页出现伪可读文字；空间结构保留为修订参考，v2 改为闭合书册与卷轴后通过。"
    rejected_manifest["assets"].append(rejected_item)
    dump(rejected_manifest_path, rejected_manifest)

    graph_path = ROOT / "05_manifests/redraw-dependency-graph-v1.2.json"
    graph = json.loads(graph_path.read_text(encoding="utf-8"))
    graph["b1_progress"] = {
        "environment_masters": {"accepted": 4, "total": 20},
        "transition_masters": {"accepted": 0, "total": 2},
        "avatar_derivatives": {"accepted": 26, "total": 26},
    }
    dump(graph_path, graph)

    now = datetime.now(timezone.utc).isoformat()
    log_path = ROOT / "06_logs/generation-log-v1.2.jsonl"
    with log_path.open("w", encoding="utf-8") as log:
        avatar_manifest = json.loads((ROOT / "05_manifests/avatar-derivatives-v1.2.json").read_text(encoding="utf-8"))
        for avatar in avatar_manifest["assets"]:
            log.write(json.dumps({
                "time_utc": now, "version": VERSION, "asset_type": "avatar_derivative", "status": "accepted",
                "method": avatar["method"], "input": {"path": avatar["source_expression_board"], "sha256": avatar["source_sha256"]},
                "output": {"path": avatar["master"], "sha256": avatar["sha256"]}, "runtime_target": avatar["runtime_target"],
            }, ensure_ascii=False) + "\n")
        for eid, rel in ACCEPTED.items():
            inputs = [] if eid == "forest-approach" else [{"path": ACCEPTED["forest-approach"], "sha256": info(ACCEPTED["forest-approach"])["sha256"]}]
            log.write(json.dumps({
                "time_utc": now, "version": VERSION, "asset_type": "environment_master", "environment_id": eid,
                "status": "accepted", "prompt_packet": PACKETS[eid], "input_files_in_order": inputs, "output": info(rel),
            }, ensure_ascii=False) + "\n")
        log.write(json.dumps({
            "time_utc": now, "version": VERSION, "asset_type": "environment_master", "environment_id": "ember-lighthouse-writein",
            "status": "rejected", "prompt_packet": "03_intermediate/prompt_packets/environments/ember-lighthouse-writein.json",
            "input_files_in_order": [{"path": ACCEPTED["forest-approach"], "sha256": info(ACCEPTED["forest-approach"])["sha256"]}],
            "output": rejected_item, "reason": rejected_item["reason"],
        }, ensure_ascii=False) + "\n")

    ids = list(ACCEPTED)
    cell_w, cell_h, header = 650, 390, 70
    sheet = Image.new("RGB", (cell_w * 2, header + cell_h * 2), (21, 24, 32))
    draw = ImageDraw.Draw(sheet)
    draw.text((22, 18), "GAL-SIMPLE-1.2 / ENVIRONMENT BATCH 01", font=font(27), fill=(240, 243, 249))
    for i, eid in enumerate(ids):
        x, y = (i % 2) * cell_w, header + (i // 2) * cell_h
        with Image.open(ROOT / ACCEPTED[eid]) as im:
            thumb = ImageOps.fit(im.convert("RGB"), (620, 348), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x + 15, y + 5))
        draw.text((x + 16, y + 360), f"{i+1:02d}  {eid}", font=font(17), fill=(220, 226, 238))
    sheet.save(ROOT / "PREVIEW_environments_batch01_v1.2.jpg", quality=91, optimize=True)

    qa = [
        "# GAL-SIMPLE-1.2 · 环境批次 01 QA",
        "",
        "通过 4/4 张首批环境母版；均为 1672×941、16:9、无人、底部对话框区域低细节。",
        "",
        "| 环境 | 版本 | 结论 |",
        "|---|---:|---|",
        "| 森林进塔口 | v1 | 通过；作为全系列线条、色块、雾深和索引灯风格锚点。 |",
        "| 暗夜王庭 | v1 | 通过；低王座、月窗、黑曜石拱门和单条紫色封印裂隙明确。 |",
        "| 潮汐档案 | v1 | 通过；浅水档案厅、空白牌、信标与上行阶梯明确。 |",
        "| 余烬灯塔写入口 | v2 | 通过；旧卷架、新终卷桌和索引环并列，无伪文字。 |",
        "",
        "退稿：写入口 v1 左侧打开书页出现伪可读文字；已保留到 `04_cg/rejected/`，没有覆盖。",
    ]
    (ROOT / "03_intermediate/qa/QA_ENV_BATCH01_v1.2.md").write_text("\n".join(qa) + "\n", encoding="utf-8")
    print(json.dumps({"accepted_environments": 4, "accepted_avatars": 26, "rejected_total": len(rejected_manifest["assets"])}))


if __name__ == "__main__":
    main()
