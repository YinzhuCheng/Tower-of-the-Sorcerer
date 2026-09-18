#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "04_cg/final/avatars-v1.2"
VERSION = "GAL-SIMPLE-1.2"


ASSETS = [
    ("arcane-sovereign-avatar-regret.webp", "arcane_sovereign", 1),
    ("archive-warden-avatar-duty.webp", "act3_archive_warden", 0),
    ("astral-boss-avatar-focus.webp", "astral_boss", 1),
    ("black-seal-keeper-avatar-watchful.webp", "black_seal_keeper_v2", 0),
    ("cat-boss-avatar-alert-v8.webp", "cat_boss", 0),
    ("dragon-boss-avatar-embers-audit-v3.webp", "dragon_boss", 0),
    ("echo-regent-avatar-grave.webp", "echo_regent", 0),
    ("fox-boss-avatar-watchful-v8.webp", "fox_boss", 0),
    ("last-custodian-avatar-grave.webp", "act3_last_custodian", 0),
    ("liyue-avatar-embers-cel.webp", "hero", 4),
    ("liyue-avatar-guarded-cel.webp", "hero", 1),
    ("liyue-avatar-resolve-cel.webp", "hero", 2),
    ("liyue-avatar-stern-cel.webp", "hero", 3),
    ("merchant-avatar-knowing.webp", "merchant", 0),
    ("noctia-avatar-cold-cel.webp", "final_queen", 0),
    ("noctia-avatar-grave-cel.webp", "final_queen", 3),
    ("noctia-avatar-knowing-cel.webp", "final_queen", 1),
    ("noctia-avatar-sorrow-cel.webp", "final_queen", 2),
    ("palace-warden-avatar-duty.webp", "palace_warden_v2", 0),
    ("shadow-boss-avatar-guarded.webp", "shadow_boss", 0),
    ("shawu-avatar-focus-cel.webp", "guide", 1),
    ("shawu-avatar-gentle-cel.webp", "guide", 0),
    ("shawu-avatar-lament-cel.webp", "guide", 3),
    ("shawu-avatar-watchful-cel.webp", "guide", 2),
    ("sword-boss-avatar-stern-v8.webp", "sword_boss", 0),
    ("whale-boss-avatar-lament-audit-v3.webp", "whale_boss", 1),
]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def expression_path(cid: str) -> Path:
    slug = cid.replace("_", "-")
    hits = sorted((ROOT / "01_canon/expressions").glob(f"EXPR_{slug}_v*.png"))
    if not hits:
        raise FileNotFoundError(cid)
    return hits[-1]


def font(size: int):
    p = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    return ImageFont.truetype(p, size) if p.exists() else ImageFont.load_default()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    expression_db = json.loads((ROOT / "01_canon/expressions.json").read_text(encoding="utf-8"))["characters"]
    manifest = []
    for filename, cid, panel in ASSETS:
        source = expression_path(cid)
        with Image.open(source) as opened:
            image = opened.convert("RGB")
            cell_w, cell_h = image.width // 3, image.height // 2
            col, row = panel % 3, panel // 3
            inset = 8
            box = (col * cell_w + inset, row * cell_h + inset, (col + 1) * cell_w - inset, (row + 1) * cell_h - inset)
            crop = image.crop(box).resize((512, 512), Image.Resampling.LANCZOS)
        out = OUT / filename
        crop.save(out, "WEBP", quality=95, method=6)
        manifest.append({
            "runtime_target": f"public/assets/anime/avatars/{filename}",
            "master": out.relative_to(ROOT).as_posix(),
            "sha256": sha(out),
            "dimensions": [512, 512],
            "character_id": cid,
            "expression": expression_db[cid]["expressions"][panel],
            "panel_index_zero_based": panel,
            "source_expression_board": source.relative_to(ROOT).as_posix(),
            "source_sha256": sha(source),
            "crop_box": list(box),
            "method": "deterministic canonical expression-panel crop; no new generation",
            "status": "accepted",
        })

    cols, cell = 5, 250
    rows = math.ceil(len(manifest) / cols)
    sheet = Image.new("RGB", (cols * cell, 70 + rows * (cell + 42)), (22, 25, 33))
    draw = ImageDraw.Draw(sheet)
    draw.text((22, 18), "GAL-SIMPLE-1.2 / CANONICAL AVATAR DERIVATIVES", font=font(26), fill=(240, 242, 248))
    for i, item in enumerate(manifest):
        x, y = (i % cols) * cell, 70 + (i // cols) * (cell + 42)
        with Image.open(ROOT / item["master"]) as im:
            thumb = im.convert("RGB").resize((230, 230), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x + 10, y + 5))
        draw.text((x + 10, y + 241), Path(item["runtime_target"]).stem[:29], font=font(12), fill=(220, 225, 236))
    preview = ROOT / "PREVIEW_avatars_v1.2.jpg"
    sheet.save(preview, quality=91, optimize=True)
    (ROOT / "05_manifests/avatar-derivatives-v1.2.json").write_text(
        json.dumps({"version": VERSION, "count": len(manifest), "assets": manifest}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"count": len(manifest), "preview": preview.relative_to(ROOT).as_posix()}, ensure_ascii=False))


if __name__ == "__main__":
    main()
