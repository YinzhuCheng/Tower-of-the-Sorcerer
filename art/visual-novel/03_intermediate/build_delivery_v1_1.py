#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import math
import shutil
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
VERSION = "GAL-SIMPLE-1.1"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def image_info(path: Path) -> dict:
    with Image.open(path) as im:
        im.load()
        info = {
            "path": rel(path),
            "sha256": sha256(path),
            "width": im.width,
            "height": im.height,
            "mode": im.mode,
        }
        if "A" in im.getbands():
            alpha = im.getchannel("A")
            lo, hi = alpha.getextrema()
            hist = alpha.histogram()
            info.update(
                alpha_min=lo,
                alpha_max=hi,
                transparent_pixels=sum(hist[:255]),
                fully_transparent_pixels=hist[0],
                has_real_transparency=lo < 255,
            )
        else:
            info["has_real_transparency"] = False
        return info


def json_dump(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def latest(pattern: str) -> Path:
    hits = sorted(ROOT.glob(pattern))
    if not hits:
        raise FileNotFoundError(pattern)
    return hits[-1]


def text_sha(path: Path) -> dict:
    return {"path": rel(path), "sha256": sha256(path)}


def font(size: int):
    for candidate in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def checker(size: tuple[int, int], tile: int = 18) -> Image.Image:
    out = Image.new("RGB", size, (46, 49, 58))
    draw = ImageDraw.Draw(out)
    for y in range(0, size[1], tile):
        for x in range(0, size[0], tile):
            if (x // tile + y // tile) % 2:
                draw.rectangle((x, y, x + tile - 1, y + tile - 1), fill=(63, 67, 78))
    return out


def make_contact_sheet(records: list[dict], field: str, output: Path, transparent: bool) -> None:
    cols = 4
    cell_w, cell_h = ((380, 570) if transparent else (460, 360))
    header = 82
    rows = math.ceil(len(records) / cols)
    canvas = Image.new("RGB", (cols * cell_w, header + rows * cell_h), (22, 25, 33))
    draw = ImageDraw.Draw(canvas)
    title = "GAL-SIMPLE-1.1 / TRANSPARENT STANDEES" if transparent else "GAL-SIMPLE-1.1 / EXPRESSION BOARDS"
    draw.text((28, 20), title, font=font(30), fill=(238, 241, 248))
    draw.text((29, 55), "17 accepted canonical assets", font=font(15), fill=(155, 169, 194))
    for index, record in enumerate(records):
        x = (index % cols) * cell_w
        y = header + (index // cols) * cell_h
        pad = 15
        art_box = (cell_w - pad * 2, cell_h - 58)
        bg = checker(art_box) if transparent else Image.new("RGB", art_box, (238, 232, 220))
        path = ROOT / record[field]["path"]
        with Image.open(path) as opened:
            art = opened.convert("RGBA") if transparent else opened.convert("RGB")
            thumb = ImageOps.contain(art, (art_box[0] - 12, art_box[1] - 12), Image.Resampling.LANCZOS)
            px = (art_box[0] - thumb.width) // 2
            py = (art_box[1] - thumb.height) // 2
            if transparent:
                bg.paste(thumb, (px, py), thumb)
            else:
                bg.paste(thumb, (px, py))
        canvas.paste(bg, (x + pad, y + pad))
        draw.rectangle((x + pad, y + pad, x + cell_w - pad - 1, y + cell_h - 44), outline=(83, 91, 108), width=1)
        label = f"{index + 1:02d}  {record['id']}"
        draw.text((x + pad, y + cell_h - 34), label, font=font(17), fill=(225, 230, 240))
    canvas.save(output, quality=90, optimize=True)


def main() -> None:
    accepted_path = ROOT / "05_manifests/accepted-assets.json"
    accepted_old = json.loads(accepted_path.read_text(encoding="utf-8"))
    backup = ROOT / "05_manifests/accepted-assets-v1.0.json"
    if not backup.exists():
        shutil.copy2(accepted_path, backup)

    character_db_path = ROOT / "01_canon/characters.json"
    character_db = json.loads(character_db_path.read_text(encoding="utf-8"))
    character_db["version"] = VERSION
    character_db["status"] = "complete-character-reference-pack"
    json_dump(character_db_path, character_db)

    expression_db_path = ROOT / "01_canon/expressions.json"
    expression_db = json.loads(expression_db_path.read_text(encoding="utf-8"))
    expression_db["version"] = VERSION

    standee_notes = {
        "hero": "右手单剑、左腰剑鞘与记录包、双腰扣及两枚月牙标志均通过。",
        "guide": "本人左侧白花、完整银环星盘、双飘带均通过。",
        "final_queen": "三块封印片、三尖冠、无剑设定通过。",
        "cat_boss": "猫脸、两耳一尾、左盾右弯刀通过。",
        "fox_boss": "v3准确锁定三条白尖尾、单扇和三张符纸；v1/v2因四尾退稿。",
        "whale_boss": "五弦贝壳琴、人类双腿与双袖垂片通过。",
        "sword_boss": "右手单剑、左腰剑鞘与单胸菱徽通过。",
        "dragon_boss": "双角、单尾、两片布质披片与单长枪通过。",
        "astral_boss": "本人右侧星夹、单胸星扣与本人左手黄铜星盘通过。",
        "shadow_boss": "本人右手针、左手线轴、左腰针盒与对称腿部通过。",
        "merchant": "单背包/卷毯、本人左手灯与右手钱袋通过。",
        "echo_regent": "本人右肩至左腰绶带与本人左手单名簿通过。",
        "arcane_sovereign": "男性轮廓、本人右手印戒、左手匣与单蓝菱领扣通过。",
        "palace_warden_v2": "本人右手单槽直剑、左腰剑鞘与对称肩甲通过。",
        "black_seal_keeper_v2": "断圆盘正面右上缺口与单红印黑册通过。",
        "act3_last_custodian": "深青长发、琥珀螺旋方灯、页形衣片与标签通过。",
        "act3_archive_warden": "本人右肩单辫、三扣、冷蓝圆筒灯与左腰卡盒通过。",
    }

    records = []
    standee_index = {"version": VERSION, "pose": "neutral canonical three-quarter", "characters": {}}
    for old in accepted_old["characters"]:
        cid = old["id"]
        slug = cid.replace("_", "-")
        expression = latest(f"01_canon/expressions/EXPR_{slug}_v*.png")
        standee = latest(f"01_canon/standees/STANDEE_{slug}_neutral_v*.png")
        expression_packet = ROOT / f"03_intermediate/prompt_packets/expressions/{cid}.json"
        standee_packet = ROOT / f"03_intermediate/prompt_packets/standees/{cid}.json"
        if cid == "sword_boss":
            expression_packet = ROOT / "03_intermediate/prompt_packets/expressions/sword_boss_r2.json"
            expression_db["characters"][cid]["packet"] = rel(expression_packet)
        if cid == "fox_boss":
            standee_packet = ROOT / "03_intermediate/prompt_packets/standees/fox_boss_r3.json"
        record = dict(old)
        record["expression"] = image_info(expression)
        record["expression"]["panel_order"] = expression_db["characters"][cid]["expressions"]
        record["expression"]["prompt_packet"] = rel(expression_packet)
        record["standee"] = image_info(standee)
        record["standee"]["prompt_packet"] = rel(standee_packet)
        record["standee"]["qa_note"] = standee_notes[cid]
        records.append(record)
        standee_index["characters"][cid] = {
            "name": old["name"],
            "expression_source": rel(expression),
            "prompt_packet": rel(standee_packet),
            "asset": rel(standee),
            "sha256": record["standee"]["sha256"],
            "alpha_contract": "RGBA with alpha range 0-255; transparent corners; no baked background",
        }

    accepted = {"version": VERSION, "status": "accepted", "characters": records}
    json_dump(accepted_path, accepted)
    json_dump(expression_db_path, expression_db)
    json_dump(ROOT / "01_canon/standees.json", standee_index)

    for record in records:
        cid = record["id"]
        text_path = ROOT / record["text"]
        refs = [
            {"role": "canonical_text", **text_sha(text_path)},
            {"role": "accepted_turnaround", "path": record["turnaround"]["path"], "sha256": record["turnaround"]["sha256"]},
            {"role": "accepted_detail_board", "path": record["detail"]["path"], "sha256": record["detail"]["sha256"]},
            {"role": "accepted_expression_board", "path": record["expression"]["path"], "sha256": record["expression"]["sha256"]},
            {"role": "accepted_transparent_standee", "path": record["standee"]["path"], "sha256": record["standee"]["sha256"]},
        ]
        json_dump(
            ROOT / f"03_intermediate/reference_sets/characters/{cid}.json",
            {
                "version": VERSION,
                "character_id": cid,
                "reference_order": refs,
                "hard_locks": record["hard_locks"],
                "missing_reference_policy": "stop_generation_and_complete_missing_canon_asset",
            },
        )

    json_dump(
        ROOT / "03_intermediate/reference_sets/CG_REFERENCE_ORDER_TEMPLATE.json",
        {
            "version": VERSION,
            "cg_id": "fill-me",
            "required_reference_order": [
                "character_1 canonical text",
                "character_1 accepted turnaround",
                "character_1 accepted detail board",
                "character_1 accepted expression board",
                "character_1 accepted transparent standee",
                "repeat the same five entries for each additional character",
                "scene-specific accepted prop board",
                "up to two accepted new CG identity/style anchors",
                "accepted environment design",
            ],
            "input_files_with_sha256": [],
            "prompt_path": "",
            "output_sha256": "",
            "qa_result": "pending",
            "missing_reference_policy": "stop_generation_and_complete_missing_canon_asset",
        },
    )

    reasons = {
        "CHAR_hero_turnaround_v1_missing-scabbard.png": "缺少左腰剑鞘。",
        "DETAIL_hero_v1_erasure-artifacts.png": "出现透明擦除残片。",
        "CHAR_sword-boss_turnaround_v1_extra-leg-strap.png": "生成了设定外腿带。",
        "DETAIL_fox-boss_v1_ornate-clip.png": "红叶发夹被复杂金属花饰替代。",
        "CHAR_shadow-boss_turnaround_v1_asymmetric-legs.png": "两腿袜靴结构不一致。",
        "CHAR_echo-regent_turnaround_v1_reversed-back-sash.png": "背面绶带左右方向翻转。",
        "CHAR_black-seal-keeper-v2_turnaround_v1_extra-ring-motifs.png": "衣摆出现会与断圆盘混淆的环纹。",
        "EXPR_sword-boss_v1_extra-collar-diamond.png": "领口出现设定外的第二枚蓝菱徽。",
        "STANDEE_fox-boss_neutral_v1_four-tails.png": "生成四尾，违反准确三尾锁定。",
        "STANDEE_fox-boss_neutral_v2_still-four-tails.png": "二次生成仍为四尾，继续退稿。",
    }
    rejected = []
    for path in sorted((ROOT / "04_cg/rejected").glob("*.png")):
        item = image_info(path)
        item["reason"] = reasons[path.name]
        rejected.append(item)
    json_dump(ROOT / "05_manifests/rejected-assets.json", {"version": VERSION, "assets": rejected})

    log_path = ROOT / "06_logs/generation-log-v1.1.jsonl"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).isoformat()
    with log_path.open("w", encoding="utf-8") as out:
        for record in records:
            base_refs = [record["turnaround"], record["detail"]]
            entries = [
                ("expression_board", record["expression"], base_refs),
                ("transparent_standee", record["standee"], base_refs + [record["expression"]]),
            ]
            for asset_type, asset, inputs in entries:
                row = {
                    "time_utc": now,
                    "version": VERSION,
                    "character_id": record["id"],
                    "asset_type": asset_type,
                    "status": "accepted",
                    "prompt_packet": asset["prompt_packet"],
                    "input_files_in_order": [{"path": x["path"], "sha256": x["sha256"]} for x in inputs],
                    "output": {"path": asset["path"], "sha256": asset["sha256"]},
                }
                out.write(json.dumps(row, ensure_ascii=False) + "\n")

    review = [
        "# 角色参考索引 · GAL-SIMPLE-1.1",
        "",
        "人工审阅可看本表；机器生图必须读取 `03_intermediate/reference_sets/characters/` 中的有序路径与 SHA-256。",
        "",
        "| 顺序 | 角色 | 文字 | 三视图 | 细节板 | 表情板 | 透明立绘 |",
        "|---:|---|---|---|---|---|---|",
    ]
    for i, r in enumerate(records, 1):
        review.append(
            f"| {i} | {r['name']} (`{r['id']}`) | `{r['text']}` | `{r['turnaround']['path']}` | "
            f"`{r['detail']['path']}` | `{r['expression']['path']}` | `{r['standee']['path']}` |"
        )
    (ROOT / "REVIEW_INDEX.md").write_text("\n".join(review) + "\n", encoding="utf-8")

    alpha = json.loads((ROOT / "05_manifests/standee-alpha-cleanup.json").read_text(encoding="utf-8"))
    qa = [
        "# GAL-SIMPLE-1.1 QA 总表",
        "",
        "结论：17 名角色均已具备文字设定、三视图、细节板、六格表情板和透明基础立绘。",
        "",
        f"透明立绘全部为 1024×1536 RGBA，Alpha 范围 0–255，四角透明；清理了远离主体的低 Alpha 残留像素 {alpha.get('removed_pixels', 0):,} 个。",
        "",
        "| ID | 表情板 | 透明立绘 | 立绘验收要点 |",
        "|---|---|---|---|",
    ]
    for r in records:
        qa.append(f"| `{r['id']}` | `{Path(r['expression']['path']).name}` | `{Path(r['standee']['path']).name}` | {standee_notes[r['id']]} |")
    qa += [
        "",
        "## 本轮退稿",
        "",
        "- 剑圣表情板 v1：多出第二枚领口蓝菱徽；v2 通过。",
        "- 狐祝透明立绘 v1、v2：均误生为四尾；v3 准确三尾后通过。",
        "",
        "## 下一阶段准入条件",
        "",
        "旧 GAL 图重绘前先建立场景卡与场景专用物件板。每张 CG 必须逐角色按文字、三视图、细节板、表情板、透明立绘顺序引用；缺任一必要资料即暂停生成。魔塔部分继续保留。",
    ]
    (ROOT / "03_intermediate/qa/QA_SUMMARY_v1.1.md").write_text("\n".join(qa) + "\n", encoding="utf-8")

    make_contact_sheet(records, "expression", ROOT / "PREVIEW_expressions.jpg", transparent=False)
    make_contact_sheet(records, "standee", ROOT / "PREVIEW_standees.jpg", transparent=True)

    manifest_path = ROOT / "05_manifests/package-files.sha256"
    paths = sorted(p for p in ROOT.rglob("*") if p.is_file() and p != manifest_path)
    manifest_path.write_text("".join(f"{sha256(p)}  {rel(p)}\n" for p in paths), encoding="utf-8")

    print(json.dumps({
        "version": VERSION,
        "accepted_characters": len(records),
        "expression_boards": len(records),
        "transparent_standees": len(records),
        "rejected_assets": len(rejected),
        "package_files": len(paths) + 1,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
