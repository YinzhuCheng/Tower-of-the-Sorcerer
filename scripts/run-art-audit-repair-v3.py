from __future__ import annotations

import json
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPAIR = ROOT / "scripts/repair-art-audit-v3.py"
SOURCE_AUDIT = ROOT / "art/visual-novel/05_manifests/reviews/tower-art-audit-2026-09-04-issues.json"
MANIFEST = ROOT / "art/visual-novel/05_manifests/art-audit-repair-v3-manifest.json"
APP = ROOT / "public/art-audit/app.js"
SESSION_TEST = ROOT / "test/art-audit-review-session-v3.test.js"


def patch_repair_script() -> None:
    source = REPAIR.read_text(encoding="utf-8")

    # The repair script writes a JavaScript test. A normal Python string turns
    # the doubled regex escapes into the single escapes JavaScript expects.
    source = source.replace('        r"""import assert from', '        """import assert from', 1)
    source = source.replace(
        '"sourceAudit": "tower-art-audit-2026-09-04.json",',
        '"sourceAudit": "art/visual-novel/05_manifests/reviews/tower-art-audit-2026-09-04-issues.json",',
        1,
    )

    # Avatar files may legitimately retain an opaque portrait background.
    # Transparency is mandatory for Gal standees and the Yayu map token, not
    # for compact face avatars.
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
});
""",
        encoding="utf-8",
    )


def main() -> None:
    source_audit = json.loads(SOURCE_AUDIT.read_text(encoding="utf-8"))
    if source_audit.get("issueCount") != 23:
        raise RuntimeError("source audit issue list is incomplete")

    patch_repair_script()
    runpy.run_path(str(REPAIR), run_name="__main__")
    reset_audit_session()
    write_session_test()

    generated = json.loads(MANIFEST.read_text(encoding="utf-8"))
    counts = {
        "standees": len(generated["standees"]),
        "avatars": len(generated["avatars"]),
        "mapUnits": len(generated["mapUnits"]),
        "cgs": len(generated["cgs"]),
    }
    if counts != {"standees": 4, "avatars": 2, "mapUnits": 1, "cgs": 12}:
        raise RuntimeError(f"unexpected repair output: {counts}")
    print(json.dumps(counts, ensure_ascii=False))


if __name__ == "__main__":
    main()
