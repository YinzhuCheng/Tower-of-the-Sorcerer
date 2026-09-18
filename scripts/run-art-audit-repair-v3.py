from __future__ import annotations

import base64
import hashlib
import json
import runpy
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REPAIR = ROOT / "scripts/repair-art-audit-v3.py"
SOURCE_AUDIT = ROOT / "art/visual-novel/05_manifests/reviews/tower-art-audit-2026-09-04-issues.json"
MANIFEST = ROOT / "art/visual-novel/05_manifests/art-audit-repair-v3-manifest.json"
GAL_REFRESH_MANIFEST = ROOT / "art/visual-novel/05_manifests/gal-cel-refresh-v4-manifest.json"
APP = ROOT / "public/art-audit/app.js"
SESSION_TEST = ROOT / "test/art-audit-review-session-v3.test.js"
MAP_MANIFEST = ROOT / "public/assets/anime/map/manifest.json"
ENEMY_MANIFEST = ROOT / "public/assets/anime/enemies/manifest.json"
HERO_AVATAR = ROOT / "public/assets/anime/avatars/liyue-avatar-embers-cel.webp"
HERO_MAP_PORTRAIT = ROOT / "public/assets/anime/map/atlases/runtime/hero-portrait-v4.webp"
YAYU_MAP = ROOT / "public/assets/anime/enemies/v3/shadow-boss-map-audit-v3.webp"


def json_write(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def alpha_range(path: Path) -> tuple[int, int]:
    with Image.open(path) as image:
        rgba = image.convert("RGBA")
        low, high = rgba.getchannel("A").getextrema()
    return int(low), int(high)


def dimensions(path: Path) -> list[int]:
    with Image.open(path) as image:
        return [image.width, image.height]


def patch_repair_script() -> None:
    source = REPAIR.read_text(encoding="utf-8")

    # The script writes a JavaScript test. A normal Python string turns the
    # doubled regex escapes into the single escapes JavaScript expects.
    source = source.replace('        r"""import assert from', '        """import assert from', 1)
    source = source.replace(
        '"sourceAudit": "tower-art-audit-2026-09-04.json",',
        '"sourceAudit": "art/visual-novel/05_manifests/reviews/tower-art-audit-2026-09-04-issues.json",',
        1,
    )

    # Alpha-bearing runtime WebP files use the extended WebP ALPH chunk. The
    # PNG masters remain lossless; the runtime copy uses high-quality WebP so
    # existing alpha validation and browser decoding follow the same path.
    source = source.replace(
        'rgba.save(path, "WEBP", lossless=alpha_required, quality=96, method=6, exact=True)',
        'rgba.save(path, "WEBP", lossless=False, quality=96, method=6, exact=True)',
        1,
    )

    # Compact face avatars may retain an opaque portrait background. Native
    # transparency is mandatory for full Gal standees and the Yayu map token.
    begin = source.index("    avatar_records = []")
    end = source.index("    yayu_source =", begin)
    avatar_block = source[begin:end]
    avatar_block = avatar_block.replace(
        "save_webp(avatar, runtime, alpha_required=True)",
        "save_webp(avatar, runtime, alpha_required=False)",
        1,
    )
    avatar_block = avatar_block.replace('"alphaRequired": True,', '"alphaRequired": False,', 1)
    source = source[:begin] + avatar_block + source[end:]

    REPAIR.write_text(source, encoding="utf-8")


def reset_audit_session() -> None:
    app = APP.read_text(encoding="utf-8")
    old = "lost-magic-tower:art-audit:reviews:v2"
    new = "lost-magic-tower:art-audit:reviews:v3"
    if new not in app:
        if old not in app:
            raise RuntimeError("art-audit review storage key was not found")
        app = app.replace(old, new, 1)
    APP.write_text(app, encoding="utf-8")


def replace_hero_map_portrait(generated: dict) -> None:
    # Keep the established atlas slot so the map loader and source-fragment
    # contract stay stable, but replace its actual bytes with the audited hero
    # avatar requested in the review JSON.
    manifest = json.loads(MAP_MANIFEST.read_text(encoding="utf-8"))
    atlas = manifest["atlases"]["heroPortraitV4"]
    manifest["heroRevision"] = "identity-audited-hero-v7"
    atlas["file"] = "atlases/runtime/hero-portrait-v4.webp"

    payload = HERO_AVATAR.read_bytes()
    HERO_MAP_PORTRAIT.parent.mkdir(parents=True, exist_ok=True)
    HERO_MAP_PORTRAIT.write_bytes(payload)

    encoded = base64.b64encode(payload).decode("ascii")
    chunk_paths = atlas.get("base64Chunks", [])
    if len(chunk_paths) < 2:
        raise RuntimeError("heroPortraitV4 must retain split source chunks")
    width = (len(encoded) + len(chunk_paths) - 1) // len(chunk_paths)
    for index, relative in enumerate(chunk_paths):
        chunk = encoded[index * width:(index + 1) * width]
        target = MAP_MANIFEST.parent / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(chunk + "\n", encoding="ascii")

    json_write(MAP_MANIFEST, manifest)
    low, high = alpha_range(HERO_MAP_PORTRAIT)
    generated["mapUnits"] = [entry for entry in generated["mapUnits"] if entry.get("id") != "hero"]
    generated["mapUnits"].append({
        "id": "hero",
        "sourceFrom": HERO_AVATAR.relative_to(ROOT).as_posix(),
        "runtime": HERO_MAP_PORTRAIT.relative_to(ROOT).as_posix(),
        "dimensions": dimensions(HERO_MAP_PORTRAIT),
        "alphaRequired": low < 255,
        "alphaMin": low,
        "alphaMax": high,
        "sha256": sha256(HERO_MAP_PORTRAIT),
        "runtimeSlotPreserved": True,
    })


def restore_yayu_high_resolution_source() -> None:
    manifest = json.loads(ENEMY_MANIFEST.read_text(encoding="utf-8"))
    shadow = manifest["assets"]["shadow_boss"]
    shadow["file"] = "enemies/v3/shadow-boss-map-audit-v3.webp"
    shadow["highResFile"] = "characters/yayu-dialogue-guarded.webp"
    json_write(ENEMY_MANIFEST, manifest)


def mark_superseded_cgs(generated: dict) -> None:
    legacy = json.loads(GAL_REFRESH_MANIFEST.read_text(encoding="utf-8"))
    replacements = {entry["sourceFrom"]: entry["runtime"] for entry in generated["cgs"]}
    touched = 0
    for asset in legacy.get("assets", []):
        replacement = replacements.get(asset.get("runtime"))
        if not replacement:
            continue
        asset["superseded_by"] = replacement
        asset["runtime_referenced"] = False
        touched += 1
    if touched != len(replacements):
        raise RuntimeError(f"expected to supersede {len(replacements)} legacy CGs, found {touched}")
    json_write(GAL_REFRESH_MANIFEST, legacy)


def update_regression_expectations(generated: dict) -> None:
    replacements: list[tuple[str, str]] = []
    for entry in generated["cgs"]:
        old_runtime = entry["sourceFrom"]
        new_runtime = entry["runtime"]
        old_web = "/" + old_runtime.removeprefix("public/")
        new_web = "/" + new_runtime.removeprefix("public/")
        old_name = Path(old_runtime).name
        new_name = Path(new_runtime).name
        for old, new in (
            (old_runtime, new_runtime),
            (old_web, new_web),
            (old_name, new_name),
            (old_runtime.replace(".", r"\."), new_runtime.replace(".", r"\.")),
            (old_web.replace(".", r"\."), new_web.replace(".", r"\.")),
            (old_name.replace(".", r"\."), new_name.replace(".", r"\.")),
        ):
            replacements.append((old, new))

    for path in (ROOT / "test").rglob("*.js"):
        text = path.read_text(encoding="utf-8")
        updated = text.replace("art-audit:reviews:v2", "art-audit:reviews:v3")
        for old, new in replacements:
            updated = updated.replace(old, new)
        path.write_text(updated, encoding="utf-8")

    generated_test = ROOT / "test/art-audit-repair-v3.test.js"
    text = generated_test.read_text(encoding="utf-8")
    old_assertion = "  assert.equal(mapManifest.atlases.heroPortraitV4.file, '/assets/anime/avatars/liyue-avatar-embers-cel.webp');"
    new_assertion = """  assert.equal(mapManifest.atlases.heroPortraitV4.file, 'atlases/runtime/hero-portrait-v4.webp');
  const [heroMapPortrait, heroAuditAvatar] = await Promise.all([
    readFile(new URL('public/assets/anime/map/atlases/runtime/hero-portrait-v4.webp', ROOT)),
    readFile(new URL('public/assets/anime/avatars/liyue-avatar-embers-cel.webp', ROOT))
  ]);
  assert.deepEqual(heroMapPortrait, heroAuditAvatar);"""
    if old_assertion not in text:
        raise RuntimeError("generated hero map assertion was not found")
    generated_test.write_text(text.replace(old_assertion, new_assertion, 1), encoding="utf-8")


def write_session_test() -> None:
    SESSION_TEST.write_text(
        """import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT = new URL('../', import.meta.url);

test('art audit repair v3 opens a clean review session and retains the source issue list', async () => {
  const app = await readFile(new URL('public/art-audit/app.js', ROOT), 'utf8');
  assert.match(app, /lost-magic-tower:art-audit:reviews:v3/);
  assert.match(app, /encodeURIComponent\\(AUDIT_VERSION\\)/);

  const sourceUrl = new URL('art/visual-novel/05_manifests/reviews/tower-art-audit-2026-09-04-issues.json', ROOT);
  const source = JSON.parse(await readFile(sourceUrl, 'utf8'));
  assert.equal(source.issueCount, 23);
  assert.equal(source.issues.length, 23);
  await access(sourceUrl);

  const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/art-audit-repair-v3-manifest.json', ROOT), 'utf8'));
  assert.equal(manifest.sourceAudit, 'art/visual-novel/05_manifests/reviews/tower-art-audit-2026-09-04-issues.json');
  assert.equal(manifest.mapUnits.length, 2);
});
""",
        encoding="utf-8",
    )


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
    if HERO_MAP_PORTRAIT.read_bytes() != HERO_AVATAR.read_bytes():
        raise RuntimeError("hero map portrait does not match the audited avatar")
    if b"ALPH" not in YAYU_MAP.read_bytes():
        raise RuntimeError("Yayu map token must retain an extended WebP alpha chunk")
    for standee in generated["standees"]:
        if not standee["alphaRequired"] or standee["alphaMin"] >= 255:
            raise RuntimeError(f"standee transparency missing: {standee['id']}")
    return counts


def main() -> None:
    source_audit = json.loads(SOURCE_AUDIT.read_text(encoding="utf-8"))
    if source_audit.get("issueCount") != 23 or len(source_audit.get("issues", [])) != 23:
        raise RuntimeError("source audit issue list is incomplete")

    patch_repair_script()
    runpy.run_path(str(REPAIR), run_name="__main__")

    generated = json.loads(MANIFEST.read_text(encoding="utf-8"))
    replace_hero_map_portrait(generated)
    restore_yayu_high_resolution_source()
    mark_superseded_cgs(generated)
    json_write(MANIFEST, generated)

    reset_audit_session()
    update_regression_expectations(generated)
    write_session_test()
    print(json.dumps(validate_outputs(generated), ensure_ascii=False))


if __name__ == "__main__":
    main()
