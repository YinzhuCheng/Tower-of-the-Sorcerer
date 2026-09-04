from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
AUDIT_VERSION = "2026-09-04-art-audit-repair-v3"
RUNTIME_VERSION = "20260904-art-audit-repair-v3"
SOURCE_DIR = ROOT / "art/visual-novel/04_cg/final/2026-09-04-art-audit-repair-v3/characters"
MANIFEST_PATH = ROOT / "art/visual-novel/05_manifests/art-audit-repair-v3-manifest.json"
TEST_PATH = ROOT / "test/art-audit-repair-v3.test.js"

STANDEES = {
    "sword_boss": (
        "public/assets/anime/characters/serena-dialogue-stern-v8.webp",
        "public/assets/anime/characters/serena-dialogue-stern-audit-v3.webp",
        "CHAR_31_serena-stern-alpha.png",
    ),
    "palace_warden_v2": (
        "public/assets/anime/characters/vela-dialogue-duty.webp",
        "public/assets/anime/characters/vela-dialogue-duty-audit-v3.webp",
        "CHAR_32_vela-duty-alpha.png",
    ),
    "black_seal_keeper_v2": (
        "public/assets/anime/characters/seph-dialogue-watchful.webp",
        "public/assets/anime/characters/seph-dialogue-watchful-audit-v3.webp",
        "CHAR_33_seph-watchful-alpha.png",
    ),
    "act3_last_custodian": (
        "public/assets/anime/characters/last-custodian-dialogue-release.webp",
        "public/assets/anime/characters/last-custodian-dialogue-release-audit-v3.webp",
        "CHAR_34_last-custodian-release-alpha.png",
    ),
}

AVATARS = {
    "whale_boss": (
        "public/assets/anime/portraits/v1/whale-boss-portrait-runtime.webp",
        "public/assets/anime/avatars/whale-boss-avatar-lament-audit-v3.webp",
    ),
    "dragon_boss": (
        "public/assets/anime/characters/yanli-dialogue-embers.webp",
        "public/assets/anime/avatars/dragon-boss-avatar-embers-audit-v3.webp",
    ),
}

SIMPLIFY_CGS = {
    "noctia-truth": "public/assets/anime/cg/liyue-noctia-truth-cg.webp",
    "noctia-seal": "public/assets/anime/cg/liyue-noctia-seal-cg.webp",
    "echo-ledger": "public/assets/anime/cg/liyue-echo-ledger-cg.webp",
    "noctia-sovereign": "public/assets/anime/cg/liyue-noctia-sovereign-cg.webp",
}

ENHANCE_CGS = {
    "seven-cantos-severed": "public/assets/anime/cg/liyue-seven-cantos-severed-cg.webp",
    "seven-core-network": "public/assets/anime/cg/liyue-yayu-seven-core-network-cg.webp",
    "missing-fourth-step": "public/assets/anime/cg/liyue-noctia-missing-fourth-step-cg.webp",
    "intercepted-receipt": "public/assets/anime/cg/liyue-yayu-intercepted-receipt-cg.webp",
    "missing-page-restored": "public/assets/anime/cg/liyue-noctia-missing-page-cg.webp",
    "letters-held-in-storm": "public/assets/anime/cg/liyue-noctia-archive-storm-cg.webp",
    "originals-enter-lighthouse": "public/assets/anime/cg/liyue-archive-warden-entry-cg.webp",
    "traceable-revocation": "public/assets/anime/cg/liyue-traceable-revocation-cg.webp",
}


def require(path: str | Path) -> Path:
    resolved = ROOT / path if not isinstance(path, Path) or not path.is_absolute() else path
    if not resolved.exists():
        raise FileNotFoundError(resolved)
    return resolved


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def web_path(path: str) -> str:
    assert path.startswith("public/")
    return "/" + path.removeprefix("public/")


def alpha_stats(image: Image.Image) -> tuple[int, int]:
    alpha = np.asarray(image.getchannel("A"), dtype=np.uint8)
    return int(alpha.min()), int(alpha.max())


def ensure_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = np.asarray(rgba.getchannel("A"), dtype=np.uint8)
    if int(alpha.min()) < 250:
        return rgba

    rgb = np.asarray(rgba.convert("RGB"), dtype=np.int16)
    h, w = rgb.shape[:2]
    edge = np.concatenate((rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]), axis=0)
    background = np.median(edge, axis=0)
    distance = np.sqrt(np.sum((rgb - background) ** 2, axis=2))
    candidate = (distance < 28).astype(np.uint8)
    flood = np.zeros((h + 2, w + 2), dtype=np.uint8)
    connected = np.zeros((h, w), dtype=np.uint8)
    work = candidate.copy()
    for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1)):
        if work[y, x]:
            cv2.floodFill(work, flood, (x, y), 2)
            connected |= (work == 2).astype(np.uint8)
            work[work == 2] = 0
            flood.fill(0)
    feather = np.clip((distance - 10.0) / 18.0 * 255.0, 0, 255).astype(np.uint8)
    new_alpha = np.where(connected > 0, feather, 255).astype(np.uint8)
    rgba.putalpha(Image.fromarray(new_alpha, mode="L"))
    return rgba


def rgba_to_arrays(image: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8)
    return rgba[:, :, :3], rgba[:, :, 3]


def arrays_to_rgba(rgb: np.ndarray, alpha: np.ndarray) -> Image.Image:
    pixels = np.dstack((np.clip(rgb, 0, 255).astype(np.uint8), alpha.astype(np.uint8)))
    return Image.fromarray(pixels, mode="RGBA")


def refine_standee(image: Image.Image) -> Image.Image:
    rgba = ensure_alpha(image)
    rgb, alpha = rgba_to_arrays(rgba)
    smooth = cv2.bilateralFilter(rgb, d=5, sigmaColor=13, sigmaSpace=5)
    blur = cv2.GaussianBlur(smooth, (0, 0), 0.72)
    refined = cv2.addWeighted(smooth, 1.15, blur, -0.15, 1.5)
    refined = np.clip((refined.astype(np.float32) - 127.5) * 1.025 + 129.0, 0, 255)
    out = arrays_to_rgba(refined, alpha)
    return ImageEnhance.Color(out).enhance(0.985)


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    return bbox if bbox else (0, 0, image.width, image.height)


def make_avatar(image: Image.Image, size: int = 512) -> Image.Image:
    rgba = ensure_alpha(image)
    left, top, right, bottom = alpha_bbox(rgba)
    bw, bh = right - left, bottom - top
    crop_side = max(1, min(max(bw, int(bh * 0.46)), int(bh * 0.58)))
    center_x = (left + right) / 2
    crop_left = int(round(center_x - crop_side / 2))
    crop_top = int(round(top + bh * 0.015))
    crop_left = max(0, min(crop_left, rgba.width - crop_side))
    crop_top = max(0, min(crop_top, rgba.height - crop_side))
    crop = rgba.crop((crop_left, crop_top, crop_left + crop_side, crop_top + crop_side))
    crop = crop.resize((size, size), Image.Resampling.LANCZOS)
    return refine_standee(crop)


def make_map_token(image: Image.Image, size: int = 384) -> Image.Image:
    rgba = ensure_alpha(image)
    crop = rgba.crop(alpha_bbox(rgba))
    max_side = int(size * 0.91)
    scale = min(max_side / crop.width, max_side / crop.height)
    resized = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - resized.width) // 2
    y = size - resized.height - int(size * 0.035)
    canvas.alpha_composite(refine_standee(resized), (x, y))
    return canvas


def simplify_cg(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    rgb, alpha = rgba_to_arrays(rgba)
    h, _ = rgb.shape[:2]
    smooth = cv2.bilateralFilter(rgb, d=7, sigmaColor=30, sigmaSpace=7)
    poster = np.clip(np.round(smooth.astype(np.float32) / 8.0) * 8.0, 0, 255).astype(np.uint8)
    cel = cv2.addWeighted(smooth, 0.76, poster, 0.24, 0)
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    mask = np.clip((y - 0.27) / 0.26, 0, 1) * 0.73
    mixed = rgb.astype(np.float32) * (1 - mask) + cel.astype(np.float32) * mask
    mixed = np.clip((mixed - 127.5) * 0.985 + 128.5, 0, 255)
    return arrays_to_rgba(mixed, alpha)


def enhance_cg(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    rgb, alpha = rgba_to_arrays(rgba)
    clean = cv2.bilateralFilter(rgb, d=5, sigmaColor=14, sigmaSpace=5)
    blur = cv2.GaussianBlur(clean, (0, 0), 0.78)
    sharp = cv2.addWeighted(clean, 1.16, blur, -0.16, 1.8)
    sharp = np.clip((sharp.astype(np.float32) - 127.5) * 1.025 + 130.0, 0, 255)
    return arrays_to_rgba(sharp, alpha)


def save_webp(image: Image.Image, path: Path, *, alpha_required: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rgba = image.convert("RGBA")
    if alpha_required and alpha_stats(rgba)[0] >= 255:
        raise ValueError(f"transparent output required: {path}")
    rgba.save(path, "WEBP", lossless=alpha_required, quality=96, method=6, exact=True)


def revised_cg_path(source: str) -> str:
    assert source.endswith(".webp")
    return source[:-5] + "-audit-v3.webp"


def replace_text(path: Path, old: str, new: str, *, required: bool = True) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        if required:
            raise ValueError(f"missing replacement in {path}: {old}")
        return
    path.write_text(text.replace(old, new), encoding="utf-8")


def repair_runtime_mappings(cg_replacements: dict[str, str]) -> None:
    portraits = require("src/game/anime-portraits.js")
    replacements = {
        "/assets/anime/avatars/whale-boss-avatar-lament-v8.webp": "/assets/anime/avatars/whale-boss-avatar-lament-audit-v3.webp",
        "/assets/anime/avatars/dragon-boss-avatar-embers-v7.webp": "/assets/anime/avatars/dragon-boss-avatar-embers-audit-v3.webp",
        "/assets/anime/characters/serena-dialogue-stern-v8.webp": "/assets/anime/characters/serena-dialogue-stern-audit-v3.webp",
        "/assets/anime/characters/vela-dialogue-duty.webp": "/assets/anime/characters/vela-dialogue-duty-audit-v3.webp",
        "/assets/anime/characters/seph-dialogue-watchful.webp": "/assets/anime/characters/seph-dialogue-watchful-audit-v3.webp",
        "/assets/anime/characters/last-custodian-dialogue-release.webp": "/assets/anime/characters/last-custodian-dialogue-release-audit-v3.webp",
    }
    for old, new in replacements.items():
        replace_text(portraits, old, new)

    map_manifest = require("public/assets/anime/map/manifest.json")
    replace_text(map_manifest, '"heroRevision": "identity-audited-hero-v7"', '"heroRevision": "identity-audited-hero-audit-v3"')
    replace_text(
        map_manifest,
        '"heroPortraitV4": {\n      "file": "atlases/runtime/hero-portrait-v4.webp",',
        '"heroPortraitV4": {\n      "file": "/assets/anime/avatars/liyue-avatar-embers-cel.webp",',
    )

    enemy_manifest = require("public/assets/anime/enemies/manifest.json")
    enemy_text = enemy_manifest.read_text(encoding="utf-8")
    old_shadow = '"shadow_boss": {\n      "file": "enemies/v1/shadow-boss-map-128.webp",\n      "highResFile": "characters/yayu-dialogue-guarded.webp",'
    new_shadow = '"shadow_boss": {\n      "file": "enemies/v3/shadow-boss-map-audit-v3.webp",\n      "highResFile": "enemies/v3/shadow-boss-map-audit-v3.webp",'
    if old_shadow not in enemy_text:
        raise ValueError("shadow_boss manifest block changed")
    enemy_manifest.write_text(enemy_text.replace('"version": 9', '"version": 10', 1).replace(old_shadow, new_shadow), encoding="utf-8")

    asset_replacements = {**cg_replacements, **replacements}
    for base in (ROOT / "src", ROOT / "public/art-audit", ROOT / "test"):
        for path in base.rglob("*.js"):
            text = path.read_text(encoding="utf-8")
            updated = text
            for old, new in asset_replacements.items():
                updated = updated.replace(old, new)
                if path.is_relative_to(ROOT / "test"):
                    updated = updated.replace(Path(old).name, Path(new).name)
            updated = updated.replace("2026-09-04-native-alpha-standees-v2", AUDIT_VERSION)
            updated = updated.replace("20260904-native-alpha-standees-v2", RUNTIME_VERSION)
            if updated != text:
                path.write_text(updated, encoding="utf-8")

    audit_app = require("public/art-audit/app.js")
    text = audit_app.read_text(encoding="utf-8")
    old_head = "function imageFigure({ path, label, className = '', eager = false }) {\n  if (!path) return '<div class=\"asset-missing\">没有映射文件</div>';\n  return `"
    new_head = "function imageFigure({ path, label, className = '', eager = false }) {\n  if (!path) return '<div class=\"asset-missing\">没有映射文件</div>';\n  const imageSrc = `${path}${path.includes('?') ? '&' : '?'}v=${encodeURIComponent(AUDIT_VERSION)}`;\n  return `"
    if old_head not in text:
        raise ValueError("art-audit imageFigure header changed")
    text = text.replace(old_head, new_head, 1)
    text = text.replace('data-image-path="${escapeHtml(path)}"', 'data-image-path="${escapeHtml(imageSrc)}"')
    text = text.replace('<img src="${escapeHtml(path)}"', '<img src="${escapeHtml(imageSrc)}"')
    audit_app.write_text(text, encoding="utf-8")


def assert_exact_mappings() -> None:
    portraits = require("src/game/anime-portraits.js").read_text(encoding="utf-8")
    required = [
        "hero: '/assets/anime/avatars/liyue-avatar-embers-cel.webp'",
        "echo_regent: '/assets/anime/characters/echo-regent-dialogue-grave.webp'",
        "arcane_sovereign: '/assets/anime/characters/arcane-sovereign-dialogue-regret.webp'",
        "act3_archive_warden: '/assets/anime/characters/archive-warden-dialogue-duty.webp'",
        "shadow_boss: '/assets/anime/characters/yayu-dialogue-guarded.webp'",
    ]
    missing = [item for item in required if item not in portraits]
    if missing:
        raise ValueError(f"required exact mappings missing: {missing}")


def write_test() -> None:
    TEST_PATH.write_text(
        r"""import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { AUDIT_VERSION, CG_SCENES } from '../public/art-audit/registry.js';
import { dialoguePresentation, portraitUrl } from '../src/game/anime-portraits.js';

const ROOT = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/art-audit-repair-v3-manifest.json', ROOT), 'utf8'));

test('audit repair v3 keeps transparent standees and publishes every revised binary', async () => {
  assert.equal(manifest.auditVersion, '2026-09-04-art-audit-repair-v3');
  assert.equal(manifest.standees.length, 4);
  assert.equal(manifest.avatars.length, 2);
  assert.equal(manifest.cgs.length, 12);
  for (const asset of [...manifest.standees, ...manifest.avatars, ...manifest.mapUnits, ...manifest.cgs]) {
    await access(new URL(asset.runtime, ROOT));
    assert.match(asset.sha256, /^[a-f0-9]{64}$/);
  }
  for (const asset of manifest.standees) {
    assert.equal(asset.alphaRequired, true);
    assert.ok(asset.alphaMin < 255, `${asset.id} must preserve transparency`);
    await access(new URL(asset.source, ROOT));
  }
});

test('identity notes resolve to the requested runtime sources', async () => {
  assert.match(portraitUrl('hero'), /liyue-avatar-embers-cel\.webp/);
  assert.match(portraitUrl('echo_regent'), /echo-regent-dialogue-grave\.webp/);
  assert.match(portraitUrl('arcane_sovereign'), /arcane-sovereign-dialogue-regret\.webp/);
  assert.match(portraitUrl('act3_archive_warden'), /archive-warden-dialogue-duty\.webp/);
  assert.match(dialoguePresentation('whale_boss', 'lament').avatar, /whale-boss-avatar-lament-audit-v3\.webp/);
  assert.match(dialoguePresentation('dragon_boss', 'embers').avatar, /dragon-boss-avatar-embers-audit-v3\.webp/);
  assert.match(dialoguePresentation('sword_boss', 'stern').stage, /serena-dialogue-stern-audit-v3\.webp/);
  assert.match(dialoguePresentation('palace_warden_v2', 'duty').stage, /vela-dialogue-duty-audit-v3\.webp/);
  assert.match(dialoguePresentation('black_seal_keeper_v2', 'watchful').stage, /seph-dialogue-watchful-audit-v3\.webp/);
  assert.match(dialoguePresentation('act3_last_custodian', 'grave').stage, /last-custodian-dialogue-release-audit-v3\.webp/);
  const mapManifest = JSON.parse(await readFile(new URL('public/assets/anime/map/manifest.json', ROOT), 'utf8'));
  const enemyManifest = JSON.parse(await readFile(new URL('public/assets/anime/enemies/manifest.json', ROOT), 'utf8'));
  assert.equal(mapManifest.atlases.heroPortraitV4.file, '/assets/anime/avatars/liyue-avatar-embers-cel.webp');
  assert.equal(enemyManifest.assets.shadow_boss.file, 'enemies/v3/shadow-boss-map-audit-v3.webp');
});

test('all twelve reviewed CG records use cache-busted audit-v3 binaries', () => {
  assert.equal(AUDIT_VERSION, '2026-09-04-art-audit-repair-v3');
  const ids = new Set(manifest.cgs.map(({ id }) => id));
  const revised = CG_SCENES.filter(({ id }) => ids.has(id));
  assert.equal(revised.length, 12);
  for (const scene of revised) assert.match(scene.path, /-audit-v3\.webp$/);
});
""",
        encoding="utf-8",
    )


def main() -> None:
    registry = require("public/art-audit/registry.js")
    if AUDIT_VERSION in registry.read_text(encoding="utf-8") and MANIFEST_PATH.exists():
        print(f"{AUDIT_VERSION} already applied")
        return

    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    standee_records = []
    for identity, (source_path, runtime_path, png_name) in STANDEES.items():
        runtime = ROOT / runtime_path
        source_png = SOURCE_DIR / png_name
        refined = refine_standee(Image.open(require(source_path)))
        refined.save(source_png, "PNG", optimize=True)
        save_webp(refined, runtime, alpha_required=True)
        minimum, maximum = alpha_stats(refined)
        standee_records.append({
            "id": identity,
            "sourceFrom": source_path,
            "source": source_png.relative_to(ROOT).as_posix(),
            "runtime": runtime_path,
            "dimensions": [refined.width, refined.height],
            "alphaRequired": True,
            "alphaMin": minimum,
            "alphaMax": maximum,
            "sha256": sha256(runtime),
        })

    avatar_records = []
    for identity, (source_path, runtime_path) in AVATARS.items():
        avatar = make_avatar(Image.open(require(source_path)))
        runtime = ROOT / runtime_path
        save_webp(avatar, runtime, alpha_required=True)
        minimum, maximum = alpha_stats(avatar)
        avatar_records.append({
            "id": identity,
            "sourceFrom": source_path,
            "runtime": runtime_path,
            "dimensions": [avatar.width, avatar.height],
            "alphaRequired": True,
            "alphaMin": minimum,
            "alphaMax": maximum,
            "sha256": sha256(runtime),
        })

    yayu_source = require("public/assets/anime/characters/yayu-dialogue-guarded.webp")
    yayu_map_path = ROOT / "public/assets/anime/enemies/v3/shadow-boss-map-audit-v3.webp"
    yayu_map = make_map_token(Image.open(yayu_source), 384)
    save_webp(yayu_map, yayu_map_path, alpha_required=True)
    map_records = [{
        "id": "shadow_boss",
        "sourceFrom": "public/assets/anime/characters/yayu-dialogue-guarded.webp",
        "runtime": yayu_map_path.relative_to(ROOT).as_posix(),
        "dimensions": [384, 384],
        "alphaRequired": True,
        "alphaMin": alpha_stats(yayu_map)[0],
        "alphaMax": alpha_stats(yayu_map)[1],
        "sha256": sha256(yayu_map_path),
    }]

    cg_records = []
    cg_replacements: dict[str, str] = {}
    for profile, targets in (("cel-simplify", SIMPLIFY_CGS), ("clean-detail-light", ENHANCE_CGS)):
        for identity, source_path in targets.items():
            source = require(source_path)
            runtime_path = revised_cg_path(source_path)
            runtime = ROOT / runtime_path
            original = Image.open(source)
            revised = simplify_cg(original) if profile == "cel-simplify" else enhance_cg(original)
            save_webp(revised, runtime)
            cg_replacements[web_path(source_path)] = web_path(runtime_path)
            cg_records.append({
                "id": identity,
                "profile": profile,
                "sourceFrom": source_path,
                "runtime": runtime_path,
                "dimensions": [revised.width, revised.height],
                "sha256": sha256(runtime),
            })

    repair_runtime_mappings(cg_replacements)
    assert_exact_mappings()

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps({
        "auditVersion": AUDIT_VERSION,
        "runtimeArtVersion": RUNTIME_VERSION,
        "sourceAudit": "tower-art-audit-2026-09-04.json",
        "policy": {
            "standees": "RGBA alpha preserved; edge-preserving denoise, restrained unsharp mask and light correction",
            "celSimplify": "face-preserving vertical mask; bilateral smoothing and low-amplitude tonal quantization concentrated on clothing",
            "detailLight": "bilateral cleanup before low-amplitude sharpening and light lift; no procedural grain",
        },
        "standees": standee_records,
        "avatars": avatar_records,
        "mapUnits": map_records,
        "cgs": cg_records,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_test()
    print(json.dumps({"standees": len(standee_records), "avatars": len(avatar_records), "mapUnits": len(map_records), "cgs": len(cg_records)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
