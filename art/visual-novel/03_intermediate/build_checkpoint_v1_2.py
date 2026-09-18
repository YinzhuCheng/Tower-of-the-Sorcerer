#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT.parent / "tower-gal-simple-design-v1.2-b1-complete-2026-09-18.zip"


def sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    graph = json.loads((ROOT / "05_manifests/redraw-dependency-graph-v1.2.json").read_text(encoding="utf-8"))
    checkpoint = {
        "version": "GAL-SIMPLE-1.2-b1-complete",
        "status": "b1-complete",
        "source_commit": "b05bc623b7c1ef8b93cfa1fca253ad2119a52f68",
        "character_reference_packs_complete": 17,
        "cg_scene_cards_complete": 19,
        "environment_cards_complete": 21,
        "active_gal_runtime_paths": graph["active_gal_runtime_count"],
        "archive_only_paths": graph["archive_only_count"],
        "preserve_gameplay_paths": graph["preserve_gameplay_count"],
        "avatar_derivatives_accepted": 26,
        "environment_masters_accepted": graph["b1_progress"]["environment_masters"]["accepted"],
        "environment_masters_total": 20,
        "story_cg_environment_dependencies_accepted": graph["b1_progress"]["story_cg_environment_dependencies"]["accepted"],
        "story_cg_environment_dependencies_total": graph["b1_progress"]["story_cg_environment_dependencies"]["total"],
        "transition_masters_accepted": graph["b1_progress"]["transition_masters"]["accepted"],
        "transition_masters_total": 2,
        "cg_scene_cards_ready_for_layout": graph["b1_progress"]["cg_layout_admission"]["ready"],
        "cg_scene_cards_total": graph["b1_progress"]["cg_layout_admission"]["total"],
        "runtime_repository_modified": False,
    }
    (ROOT / "05_manifests/CHECKPOINT_MANIFEST_v1.2.json").write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    hashes = ROOT / "05_manifests/package-files.sha256"
    files = sorted(p for p in ROOT.rglob("*") if p.is_file() and p != hashes)
    hashes.write_text("".join(f"{sha(p)}  {p.relative_to(ROOT).as_posix()}\n" for p in files), encoding="utf-8")

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as z:
        for path in sorted(p for p in ROOT.rglob("*") if p.is_file()):
            z.write(path, path.relative_to(ROOT.parent).as_posix())
    print(json.dumps({"zip": str(OUT), "size": OUT.stat().st_size, "sha256": sha(OUT), **checkpoint}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
