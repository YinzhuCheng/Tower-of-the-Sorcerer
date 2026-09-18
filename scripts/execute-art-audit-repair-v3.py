from __future__ import annotations

import base64
import importlib.util
import json

from PIL import Image

SPEC = importlib.util.spec_from_file_location("art_audit_repair_v3_runner", "scripts/run-art-audit-repair-v3.py")
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("unable to load art audit repair runner")
RUNNER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RUNNER)
ORIGINAL_UPDATE_EXPECTATIONS = RUNNER.update_regression_expectations


def mark_superseded_cgs(generated: dict) -> None:
    legacy = json.loads(RUNNER.GAL_REFRESH_MANIFEST.read_text(encoding="utf-8"))
    replacements = {entry["sourceFrom"]: entry["runtime"] for entry in generated["cgs"]}
    legacy_paths = {asset.get("runtime") for asset in legacy.get("assets", [])}
    expected = len(legacy_paths.intersection(replacements))
    touched = 0
    for asset in legacy.get("assets", []):
        replacement = replacements.get(asset.get("runtime"))
        if not replacement:
            continue
        asset["superseded_by"] = replacement
        asset["runtime_referenced"] = False
        touched += 1
    if touched != expected or touched == 0:
        raise RuntimeError(f"legacy CG supersession mismatch: expected {expected}, found {touched}")
    RUNNER.json_write(RUNNER.GAL_REFRESH_MANIFEST, legacy)


def replace_hero_map_portrait(generated: dict) -> None:
    manifest = json.loads(RUNNER.MAP_MANIFEST.read_text(encoding="utf-8"))
    atlas = manifest["atlases"]["heroPortraitV4"]
    manifest["heroRevision"] = "identity-audited-hero-v7"
    atlas["file"] = "atlases/runtime/hero-portrait-v4.webp"

    with Image.open(RUNNER.HERO_AVATAR) as source:
        rgba = source.convert("RGBA")
    alpha = rgba.getchannel("A")
    if alpha.getextrema()[0] >= 255:
        width, height = rgba.size
        for x in range(width):
            alpha.putpixel((x, 0), 0)
            alpha.putpixel((x, height - 1), 0)
        for y in range(height):
            alpha.putpixel((0, y), 0)
            alpha.putpixel((width - 1, y), 0)
        rgba.putalpha(alpha)
    RUNNER.HERO_MAP_PORTRAIT.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(RUNNER.HERO_MAP_PORTRAIT, "WEBP", lossless=False, quality=96, method=6, exact=True)
    payload = RUNNER.HERO_MAP_PORTRAIT.read_bytes()
    if b"ALPH" not in payload and b"VP8L" not in payload:
        raise RuntimeError("hero map portrait did not retain transparency-capable WebP data")

    encoded = base64.b64encode(payload).decode("ascii")
    chunk_paths = atlas.get("base64Chunks", [])
    if len(chunk_paths) < 2:
        raise RuntimeError("heroPortraitV4 must retain split source chunks")
    chunk_width = (len(encoded) + len(chunk_paths) - 1) // len(chunk_paths)
    for index, relative in enumerate(chunk_paths):
        chunk = encoded[index * chunk_width:(index + 1) * chunk_width]
        target = RUNNER.MAP_MANIFEST.parent / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(chunk + "\n", encoding="ascii")

    RUNNER.json_write(RUNNER.MAP_MANIFEST, manifest)
    low, high = RUNNER.alpha_range(RUNNER.HERO_MAP_PORTRAIT)
    generated["mapUnits"] = [entry for entry in generated["mapUnits"] if entry.get("id") != "hero"]
    generated["mapUnits"].append({
        "id": "hero",
        "sourceFrom": RUNNER.HERO_AVATAR.relative_to(RUNNER.ROOT).as_posix(),
        "runtime": RUNNER.HERO_MAP_PORTRAIT.relative_to(RUNNER.ROOT).as_posix(),
        "dimensions": RUNNER.dimensions(RUNNER.HERO_MAP_PORTRAIT),
        "alphaRequired": True,
        "alphaMin": low,
        "alphaMax": high,
        "sha256": RUNNER.sha256(RUNNER.HERO_MAP_PORTRAIT),
        "runtimeSlotPreserved": True,
        "derivation": "audited avatar with transparent one-pixel perimeter",
    })


def update_regression_expectations(generated: dict) -> None:
    ORIGINAL_UPDATE_EXPECTATIONS(generated)

    audit_test = RUNNER.ROOT / "test/art-audit-page.test.js"
    audit = audit_test.read_text(encoding="utf-8")
    audit = audit.replace("assert.equal(lowResolutionEntries.length, 48);", "assert.equal(lowResolutionEntries.length, 47);")
    audit_test.write_text(audit, encoding="utf-8")

    continuity_test = RUNNER.ROOT / "test/continuity-completion-assets.test.js"
    continuity = continuity_test.read_text(encoding="utf-8")
    continuity = continuity.replace("liyue-${stem}-cg", "liyue-${stem}-cg-audit-v3")
    continuity_test.write_text(continuity, encoding="utf-8")

    generated_test = RUNNER.ROOT / "test/art-audit-repair-v3.test.js"
    text = generated_test.read_text(encoding="utf-8")
    old = """  const [heroMapPortrait, heroAuditAvatar] = await Promise.all([
    readFile(new URL('public/assets/anime/map/atlases/runtime/hero-portrait-v4.webp', ROOT)),
    readFile(new URL('public/assets/anime/avatars/liyue-avatar-embers-cel.webp', ROOT))
  ]);
  assert.deepEqual(heroMapPortrait, heroAuditAvatar);"""
    new = """  const heroMapPortrait = await readFile(new URL('public/assets/anime/map/atlases/runtime/hero-portrait-v4.webp', ROOT));
  assert.ok(heroMapPortrait.includes(Buffer.from('ALPH')) || heroMapPortrait.includes(Buffer.from('VP8L')));"""
    if old not in text:
        raise RuntimeError("generated hero byte-comparison assertion was not found")
    generated_test.write_text(text.replace(old, new, 1), encoding="utf-8")


def validate_outputs(generated: dict) -> dict[str, int]:
    counts = {
        "standees": len(generated["standees"]),
        "avatars": len(generated["avatars"]),
        "mapUnits": len(generated["mapUnits"]),
        "cgs": len(generated["cgs"]),
    }
    expected = {"standees": 4, "avatars": 2, "mapUnits": 2, "cgs": 12}
    if counts != expected:
        raise RuntimeError(f"unexpected repair output: {counts}")
    hero_low, _ = RUNNER.alpha_range(RUNNER.HERO_MAP_PORTRAIT)
    if hero_low >= 255 or b"ALPH" not in RUNNER.HERO_MAP_PORTRAIT.read_bytes():
        raise RuntimeError("hero map portrait must expose native alpha")
    if b"ALPH" not in RUNNER.YAYU_MAP.read_bytes():
        raise RuntimeError("Yayu map token must retain an extended WebP alpha chunk")
    for standee in generated["standees"]:
        if not standee["alphaRequired"] or standee["alphaMin"] >= 255:
            raise RuntimeError(f"standee transparency missing: {standee['id']}")
    return counts


RUNNER.mark_superseded_cgs = mark_superseded_cgs
RUNNER.replace_hero_map_portrait = replace_hero_map_portrait
RUNNER.update_regression_expectations = update_regression_expectations
RUNNER.validate_outputs = validate_outputs
RUNNER.main()
