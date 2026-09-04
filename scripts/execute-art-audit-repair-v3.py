from __future__ import annotations

import importlib.util

SPEC = importlib.util.spec_from_file_location("art_audit_repair_v3_runner", "scripts/run-art-audit-repair-v3.py")
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("unable to load art audit repair runner")
RUNNER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RUNNER)


def mark_superseded_cgs(generated: dict) -> None:
    legacy = RUNNER.json.loads(RUNNER.GAL_REFRESH_MANIFEST.read_text(encoding="utf-8"))
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


RUNNER.mark_superseded_cgs = mark_superseded_cgs
RUNNER.main()
