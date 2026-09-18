import hashlib
import json
import os
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

ROOT = Path("/workspace/scratch/0645849eb5a5/gal-design-v1")
RAW = ROOT / "04_cg" / "working" / "standees" / "raw"
FINAL = ROOT / "01_canon" / "standees"
FINAL.mkdir(parents=True, exist_ok=True)

sources = {
    "hero": ("STANDEE_hero_neutral_raw_v1.png", "STANDEE_hero_neutral_v1.png"),
    "guide": ("STANDEE_guide_neutral_raw_v1.png", "STANDEE_guide_neutral_v1.png"),
    "final_queen": ("STANDEE_final-queen_neutral_raw_v1.png", "STANDEE_final-queen_neutral_v1.png"),
    "cat_boss": ("STANDEE_cat-boss_neutral_raw_v1.png", "STANDEE_cat-boss_neutral_v1.png"),
    "fox_boss": ("STANDEE_fox-boss_neutral_raw_v3.png", "STANDEE_fox-boss_neutral_v3.png"),
    "whale_boss": ("STANDEE_whale-boss_neutral_raw_v1.png", "STANDEE_whale-boss_neutral_v1.png"),
    "sword_boss": ("STANDEE_sword-boss_neutral_raw_v1.png", "STANDEE_sword-boss_neutral_v1.png"),
    "dragon_boss": ("STANDEE_dragon-boss_neutral_raw_v1.png", "STANDEE_dragon-boss_neutral_v1.png"),
    "astral_boss": ("STANDEE_astral-boss_neutral_raw_v1.png", "STANDEE_astral-boss_neutral_v1.png"),
    "shadow_boss": ("STANDEE_shadow-boss_neutral_raw_v1.png", "STANDEE_shadow-boss_neutral_v1.png"),
    "merchant": ("STANDEE_merchant_neutral_raw_v1.png", "STANDEE_merchant_neutral_v1.png"),
    "echo_regent": ("STANDEE_echo-regent_neutral_raw_v1.png", "STANDEE_echo-regent_neutral_v1.png"),
    "arcane_sovereign": ("STANDEE_arcane-sovereign_neutral_raw_v1.png", "STANDEE_arcane-sovereign_neutral_v1.png"),
    "palace_warden_v2": ("STANDEE_palace-warden-v2_neutral_raw_v1.png", "STANDEE_palace-warden-v2_neutral_v1.png"),
    "black_seal_keeper_v2": ("STANDEE_black-seal-keeper-v2_neutral_raw_v1.png", "STANDEE_black-seal-keeper-v2_neutral_v1.png"),
    "act3_last_custodian": ("STANDEE_act3-last-custodian_neutral_raw_v1.png", "STANDEE_act3-last-custodian_neutral_v1.png"),
    "act3_archive_warden": ("STANDEE_act3-archive-warden_neutral_raw_v1.png", "STANDEE_act3-archive-warden_neutral_v1.png"),
}

def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

report = {"version": "GAL-SIMPLE-1.1", "operation": "remove distant low-alpha generation halo while retaining a 4px antialias neighborhood around opaque subject", "assets": []}

for cid, (src_name, dst_name) in sources.items():
    src, dst = RAW / src_name, FINAL / dst_name
    if not src.exists():
        raise FileNotFoundError(src)
    im = Image.open(src).convert("RGBA")
    alpha = im.getchannel("A")
    before_nonzero = sum(alpha.histogram()[1:])
    strong = alpha.point(lambda a: 255 if a >= 128 else 0)
    near_subject = strong.filter(ImageFilter.MaxFilter(9))
    cleaned = ImageChops.multiply(alpha, near_subject)
    cleaned = cleaned.point(lambda a: 0 if a < 16 else (255 if a >= 248 else a))
    removed = before_nonzero - sum(cleaned.histogram()[1:])
    im.putalpha(cleaned)
    visible = cleaned.point(lambda a: 255 if a > 0 else 0)
    im = Image.composite(im, Image.new("RGBA", im.size, (0, 0, 0, 0)), visible)
    tmp = dst.with_suffix(".tmp.png")
    with tmp.open("wb") as f:
        im.save(f, format="PNG")
        f.flush()
        os.fsync(f.fileno())
    check = Image.open(tmp)
    check.load()
    if check.mode != "RGBA" or check.getchannel("A").getextrema() != (0, 255):
        raise ValueError(f"invalid alpha output: {tmp}")
    os.replace(tmp, dst)
    bbox = cleaned.getbbox()
    after_nonzero = sum(cleaned.histogram()[1:])
    report["assets"].append({
        "character_id": cid,
        "raw": str(src.relative_to(ROOT)),
        "raw_sha256": sha(src),
        "final": str(dst.relative_to(ROOT)),
        "final_sha256": sha(dst),
        "dimensions": [im.width, im.height],
        "mode": "RGBA",
        "alpha_range": list(cleaned.getextrema()),
        "nonzero_alpha_before": before_nonzero,
        "nonzero_alpha_after": after_nonzero,
        "pixels_removed_as_halo": removed,
        "content_bbox": list(bbox) if bbox else None,
    })

(ROOT / "05_manifests" / "standee-alpha-cleanup.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"assets": len(report["assets"]), "output": str(FINAL), "removed_pixels": sum(x["pixels_removed_as_halo"] for x in report["assets"])}, ensure_ascii=False))
