#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "03_intermediate/environment_cards"
OUT = ROOT / "03_intermediate/prompt_packets/environments"
STYLE_ANCHOR = ROOT / "01_canon/environments/ENV_forest-approach_v1.png"


STYLE = (
    "polished Japanese 2D visual-novel background in the GAL-SIMPLE series, clean fine line art, broad flat local colors, "
    "restrained two-step cel shading, gentle atmospheric depth, controlled highlights, low visual noise, readable architecture; "
    "fantasy archive tower made of stone, brass and magical index light, never modern science fiction"
)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    count = 0
    for card_path in sorted(CARDS.glob("ENV_*.json")):
        card = json.loads(card_path.read_text(encoding="utf-8"))
        if card["status"] != "gal-redraw":
            continue
        eid = card["environment_id"]
        is_anchor = eid == "forest-approach"
        prompt = (
            "Use case: illustration-story. Asset type: canonical 16:9 visual-novel environment master. "
            + ("Create the first series style anchor. " if is_anchor else "Image 1 is the accepted forest-approach series style anchor; inherit only its line weight, cel color blocking, restrained detail density and atmospheric depth, not its forest layout. ")
            + f"SCENE: {card['source_facts']} "
            + f"STYLE: {STYLE}. "
            + "COMPOSITION: empty stage, wide 16:9 establishing view at human eye level; preserve clean standing-character zones on both left and right; keep the bottom 30 percent low-detail for the dialogue box. "
            + "SERIES ANCHORS: repeat the same visual language of black or dark obsidian arches, one small brass registration seal, blue-white index lamps, and at most one thin violet seal fissure only when appropriate to the room. "
            + "No people, silhouettes, creatures, readable writing, letters, numbers, interface panels, logo, watermark or signature. No photorealism, 3D render, painterly concept-art texture, film grain, dense micro-detail, excessive bloom, dramatic Dutch angle, or clutter in the dialogue-safe bottom zone."
        )
        packet = {
            "version": "GAL-SIMPLE-1.2",
            "environment_id": eid,
            "series_style_lock": STYLE,
            "scene_facts": card["source_facts"],
            "composition": card["composition_contract"],
            "negative_constraints": card["must_not"],
            "prompt": prompt,
            "referenced_image_paths": [] if is_anchor else [str(STYLE_ANCHOR)],
            "output_contract": card["target_asset"],
            "status": "ready" if is_anchor or STYLE_ANCHOR.exists() else "blocked-by-style-anchor",
        }
        (OUT / f"{eid}.json").write_text(json.dumps(packet, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        count += 1
    print(json.dumps({"packets": count, "style_anchor_exists": STYLE_ANCHOR.exists()}))


if __name__ == "__main__":
    main()
