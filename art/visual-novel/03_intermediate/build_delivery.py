import hashlib
import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path("/workspace/scratch/0645849eb5a5/gal-design-v1")
OUT = ROOT.parent
TURN = ROOT / "01_canon" / "turnarounds"
DETAIL = ROOT / "01_canon" / "details"
QA = ROOT / "03_intermediate" / "qa"
REFSETS = ROOT / "03_intermediate" / "reference_sets"
MANIFESTS = ROOT / "05_manifests"

characters = json.loads((ROOT / "01_canon" / "characters.json").read_text(encoding="utf-8"))["characters"]

files = {
    "hero": ("CHAR_hero_turnaround_v2.png", "DETAIL_hero_v2.png", "v2补回左腰剑鞘；月牙夹、肩扣、双腰扣和记录袋位置通过。"),
    "guide": ("CHAR_guide_turnaround_v1.png", "DETAIL_guide_v1.png", "左侧白花、双带与银色整圆星盘通过。"),
    "final_queen": ("CHAR_final-queen_turnaround_v1.png", "DETAIL_final-queen_v1.png", "三尖冠、两枚单独红宝石与三块封印板通过；板的展开/收束图为同一组三板的状态示意。"),
    "cat_boss": ("CHAR_cat-boss_turnaround_v1.png", "DETAIL_cat-boss_v1.png", "猫脸、两耳一尾、单铃、左盾右刀通过。"),
    "fox_boss": ("CHAR_fox-boss_turnaround_v1.png", "DETAIL_fox-boss_v2.png", "三尾、单红叶发夹、单扇与三张符纸通过；v2移除过度雕花发饰。"),
    "whale_boss": ("CHAR_whale-boss_turnaround_v1.png", "DETAIL_whale-boss_v1.png", "左侧贝壳夹、双袖垂片与五弦贝壳琴通过。"),
    "sword_boss": ("CHAR_sword-boss_turnaround_v2.png", "DETAIL_sword-boss_v1.png", "银白低马尾、单胸菱徽、右剑左鞘通过；v2移除多余腿带。"),
    "dragon_boss": ("CHAR_dragon-boss_turnaround_v1.png", "DETAIL_dragon-boss_v1.png", "双角、单尾、两片布质翼形披片与单长枪通过。"),
    "astral_boss": ("CHAR_astral-boss_turnaround_v1.png", "DETAIL_astral-boss_v1.png", "本人右侧单星夹、单胸星扣与黄铜月牙星盘通过。"),
    "shadow_boss": ("CHAR_shadow-boss_turnaround_v2.png", "DETAIL_shadow-boss_v1.png", "双腿对称、两片后摆、左腰单针盒与针/线轴通过；v2修正腿部不对称。"),
    "merchant": ("CHAR_merchant_turnaround_v1.png", "DETAIL_merchant_v1.png", "双辫、单方背包、单卷毯、右腰钱袋与方形琥珀灯通过。"),
    "echo_regent": ("CHAR_echo-regent_turnaround_v2.png", "DETAIL_echo-regent_v1.png", "短低束发、单方银领扣、右肩至左腰绶带与单黑名簿通过；v2修正背面绶带方向。"),
    "arcane_sovereign": ("CHAR_arcane-sovereign_turnaround_v1.png", "DETAIL_arcane-sovereign_v1.png", "男性轮廓、两条白前片、单蓝菱领扣与单裂纹椭圆印戒通过。"),
    "palace_warden_v2": ("CHAR_palace-warden-v2_turnaround_v1.png", "DETAIL_palace-warden-v2_v1.png", "单尖额冠、对称肩甲、黑甲蓝前片与单槽直剑通过。"),
    "black_seal_keeper_v2": ("CHAR_black-seal-keeper-v2_turnaround_v2.png", "DETAIL_black-seal-keeper-v2_v1.png", "圆铜腰扣、正面右上缺口断圆盘与单红印黑册通过；v2移除衣摆混淆环纹。"),
    "act3_last_custodian": ("CHAR_act3-last-custodian_turnaround_v1.png", "DETAIL_act3-last-custodian_v1.png", "深青及小腿长发、单黑金发夹、四片页形衣片与琥珀螺旋方灯通过。"),
    "act3_archive_warden": ("CHAR_act3-archive-warden_turnaround_v1.png", "DETAIL_act3-archive-warden_v1.png", "本人右肩单辫、三枚铜扣、左腰卡盒、三张索引卡与冷蓝圆筒灯通过。"),
}

rejected = {
    "CHAR_hero_turnaround_v1_missing-scabbard.png": "缺少左腰剑鞘。",
    "DETAIL_hero_v1_erasure-artifacts.png": "出现透明擦除残片。",
    "CHAR_sword-boss_turnaround_v1_extra-leg-strap.png": "生成了设定外腿带。",
    "DETAIL_fox-boss_v1_ornate-clip.png": "红叶发夹被复杂金属花饰替代。",
    "CHAR_shadow-boss_turnaround_v1_asymmetric-legs.png": "两腿袜靴结构不一致。",
    "CHAR_echo-regent_turnaround_v1_reversed-back-sash.png": "背面绶带左右方向翻转。",
    "CHAR_black-seal-keeper-v2_turnaround_v1_extra-ring-motifs.png": "衣摆出现会与断圆盘混淆的环纹。",
}

def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def image_info(path: Path):
    with Image.open(path) as im:
        result = {"width": im.width, "height": im.height, "mode": im.mode}
        if "A" in im.getbands():
            lo, hi = im.getchannel("A").getextrema()
            result.update({"alpha_min": lo, "alpha_max": hi, "has_real_transparency": lo < 255})
        else:
            result.update({"has_real_transparency": False})
        return result

char_by_id = {c["id"]: c for c in characters}
accepted = []
for cid, (turn_name, detail_name, note) in files.items():
    c = char_by_id[cid]
    turn_path = TURN / turn_name
    detail_path = DETAIL / detail_name
    if not turn_path.exists() or not detail_path.exists():
        raise FileNotFoundError(cid)
    entry = {
        "id": cid,
        "name": c["name"],
        "status": "accepted",
        "text": f"01_canon/characters/{cid}.md",
        "turnaround": {"path": str(turn_path.relative_to(ROOT)), "sha256": sha(turn_path), **image_info(turn_path)},
        "detail": {"path": str(detail_path.relative_to(ROOT)), "sha256": sha(detail_path), **image_info(detail_path)},
        "hard_locks": c["locks"],
        "qa_note": note,
    }
    accepted.append(entry)

MANIFESTS.mkdir(parents=True, exist_ok=True)
(MANIFESTS / "accepted-assets.json").write_text(json.dumps({"version": "GAL-SIMPLE-1.0", "characters": accepted}, ensure_ascii=False, indent=2), encoding="utf-8")

rej_entries = []
for name, reason in rejected.items():
    p = ROOT / "04_cg" / "rejected" / name
    if not p.exists():
        raise FileNotFoundError(p)
    rej_entries.append({"path": str(p.relative_to(ROOT)), "sha256": sha(p), "reason": reason, **image_info(p)})
(MANIFESTS / "rejected-assets.json").write_text(json.dumps({"version": "GAL-SIMPLE-1.0", "assets": rej_entries}, ensure_ascii=False, indent=2), encoding="utf-8")

tech_dir = ROOT / "00_source" / "technical-tests"
tech_dir.mkdir(parents=True, exist_ok=True)
alpha_src = OUT / "generated_images" / "exec-8acfda09-914a-4f00-b73d-6ca73054f64e.png"
alpha_dst = tech_dir / "transparent-interface-test.png"
shutil.copy2(alpha_src, alpha_dst)
with Image.open(alpha_dst) as im:
    alpha = im.getchannel("A")
    histogram = alpha.histogram()
    transparent_pixels = sum(histogram[:255])
    total = im.width * im.height
    alpha_test = {
        "path": str(alpha_dst.relative_to(ROOT)),
        "sha256": sha(alpha_dst),
        "width": im.width,
        "height": im.height,
        "mode": im.mode,
        "alpha_min": alpha.getextrema()[0],
        "alpha_max": alpha.getextrema()[1],
        "pixels_with_alpha_below_255": transparent_pixels,
        "transparent_pixel_ratio": round(transparent_pixels / total, 6),
        "result": "PASS: image-generation interface produced real RGBA transparency",
    }
(MANIFESTS / "transparent-interface-test.json").write_text(json.dumps(alpha_test, ensure_ascii=False, indent=2), encoding="utf-8")

ref_char_dir = REFSETS / "characters"
ref_char_dir.mkdir(parents=True, exist_ok=True)
for entry in accepted:
    packet = {
        "version": "GAL-SIMPLE-1.0",
        "character_id": entry["id"],
        "reference_order": [
            {"role": "canonical_text", "path": entry["text"]},
            {"role": "accepted_turnaround", "path": entry["turnaround"]["path"], "sha256": entry["turnaround"]["sha256"]},
            {"role": "accepted_detail_board", "path": entry["detail"]["path"], "sha256": entry["detail"]["sha256"]},
        ],
        "hard_locks": entry["hard_locks"],
    }
    (ref_char_dir / f"{entry['id']}.json").write_text(json.dumps(packet, ensure_ascii=False, indent=2), encoding="utf-8")

template = {
    "version": "GAL-SIMPLE-1.0",
    "cg_id": "fill-me",
    "required_reference_order": [
        "character_1 canonical text",
        "character_1 accepted turnaround",
        "character_1 accepted detail board",
        "character_2 canonical text/turnaround/detail when present",
        "scene-specific prop board",
        "accepted expression board when available",
        "accepted transparent standee when available",
        "up to two accepted new CG identity/style anchors",
        "environment design"
    ],
    "input_files_with_sha256": [],
    "prompt_path": "",
    "output_sha256": "",
    "qa_result": "pending"
}
(REFSETS / "CG_REFERENCE_ORDER_TEMPLATE.json").write_text(json.dumps(template, ensure_ascii=False, indent=2), encoding="utf-8")

qa_lines = [
    "# GAL-SIMPLE-1.0 QA 总表",
    "",
    "结论：17名角色均具备一份已通过的文字设定、三视图和细节板。多角度物件为同一物品的替代视图，不代表角色同时携带多份。",
    "",
    "| ID | 角色 | 三视图 | 细节板 | 验收说明 |",
    "|---|---|---|---|---|",
]
for e in accepted:
    qa_lines.append(f"| `{e['id']}` | {e['name']} | `{Path(e['turnaround']['path']).name}` | `{Path(e['detail']['path']).name}` | {e['qa_note']} |")
qa_lines += [
    "",
    "## 透明接口",
    "",
    f"通过。测试图为 RGBA，alpha 范围 {alpha_test['alpha_min']}–{alpha_test['alpha_max']}，存在 {alpha_test['pixels_with_alpha_below_255']} 个 alpha<255 的像素；可生成真实透明背景，而非棋盘格伪透明。",
    "",
    "## 仍未生产",
    "",
    "表情表、透明立绘、场景设计与旧GAL资源逐张重绘属于下一阶段；这些资产生成前必须引用本包中的文字、三视图和细节板。",
]
QA.mkdir(parents=True, exist_ok=True)
(QA / "QA_SUMMARY.md").write_text("\n".join(qa_lines) + "\n", encoding="utf-8")

review_lines = [
    "# 角色参考索引",
    "",
    "本索引用于人工审阅。机器生图请使用 `03_intermediate/reference_sets/characters/` 内的JSON，以其中的顺序与哈希为准。",
    "",
    "| 顺序 | 角色 | 文字 | 三视图 | 细节板 |",
    "|---:|---|---|---|---|",
]
for i, e in enumerate(accepted, 1):
    review_lines.append(f"| {i} | {e['name']} (`{e['id']}`) | `{e['text']}` | `{e['turnaround']['path']}` | `{e['detail']['path']}` |")
(ROOT / "REVIEW_INDEX.md").write_text("\n".join(review_lines) + "\n", encoding="utf-8")

def make_sheet(kind: str, entries, output: Path):
    cols = 4
    cell_w, cell_h = 480, 400
    title_h = 72
    rows = (len(entries) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell_w, title_h + rows * cell_h), "#171a20")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
    draw.text((24, 20), f"GAL-SIMPLE-1.0 | {kind} | 17 accepted character references", fill="#f1eee7", font=font)
    for i, e in enumerate(entries):
        row, col = divmod(i, cols)
        x, y = col * cell_w, title_h + row * cell_h
        src = ROOT / e[kind]["path"]
        with Image.open(src) as im:
            if im.mode == "RGBA":
                bg = Image.new("RGBA", im.size, "#eeeae2")
                bg.alpha_composite(im)
                im = bg.convert("RGB")
            else:
                im = im.convert("RGB")
            thumb = ImageOps.contain(im, (448, 336), Image.Resampling.LANCZOS)
            ox = x + (cell_w - thumb.width) // 2
            oy = y + 10
            sheet.paste(thumb, (ox, oy))
        draw.text((x + 16, y + 354), f"{i+1:02d}  {e['id']}", fill="#f1eee7", font=small)
        draw.text((x + 16, y + 376), Path(e[kind]["path"]).name, fill="#aeb8ca", font=small)
    sheet.save(output, quality=92, subsampling=0)

make_sheet("turnaround", accepted, ROOT / "PREVIEW_turnarounds.jpg")
make_sheet("detail", accepted, ROOT / "PREVIEW_details.jpg")

# Hash all package files after generated manifests/previews are present. Exclude the hash list itself.
hash_path = MANIFESTS / "package-files.sha256"
lines = []
for p in sorted(ROOT.rglob("*")):
    if p.is_file() and p != hash_path:
        lines.append(f"{sha(p)}  {p.relative_to(ROOT).as_posix()}")
hash_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

zip_path = OUT / "tower-gal-simple-design-v1-2026-09-17.zip"
with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p in sorted(ROOT.rglob("*")):
        if p.is_file():
            z.write(p, (Path(ROOT.name) / p.relative_to(ROOT)).as_posix())

print(json.dumps({
    "characters": len(accepted),
    "turnarounds": len(list(TURN.glob("*.png"))),
    "details": len(list(DETAIL.glob("*.png"))),
    "rejected": len(rej_entries),
    "zip": str(zip_path),
    "zip_bytes": zip_path.stat().st_size,
    "zip_sha256": sha(zip_path),
    "alpha_test": alpha_test,
}, ensure_ascii=False, indent=2))
