import json
from pathlib import Path

ROOT = Path("/workspace/scratch/0645849eb5a5/gal-design-v1")
PACKETS = ROOT / "03_intermediate" / "prompt_packets" / "expressions"
PACKETS.mkdir(parents=True, exist_ok=True)
(ROOT / "01_canon" / "expressions").mkdir(parents=True, exist_ok=True)
(ROOT / "01_canon" / "standees").mkdir(parents=True, exist_ok=True)

characters = {c["id"]: c for c in json.loads((ROOT / "01_canon" / "characters.json").read_text(encoding="utf-8"))["characters"]}
accepted = {c["id"]: c for c in json.loads((ROOT / "05_manifests" / "accepted-assets.json").read_text(encoding="utf-8"))["characters"]}

expressions = {
    "hero": ["neutral attentive", "guarded suspicion", "quiet resolve", "stern warning", "controlled anger like banked embers", "hurt but conscious"],
    "guide": ["gentle reassurance", "intense focus", "watchful concern", "open lament", "startled alarm", "newfound resolve"],
    "final_queen": ["cold authority", "knowing half-smile", "contained sorrow", "grave stillness", "shaken realization", "unyielding resolve"],
    "cat_boss": ["alert", "proud confidence", "angry command", "embarrassed annoyance", "hurt surprise", "relieved grin"],
    "fox_boss": ["watchful calm", "serene ritual focus", "suspicion", "controlled anger", "private sorrow", "protective resolve"],
    "whale_boss": ["gentle welcome", "lament", "musical concentration", "startled silence", "brave resolve", "quiet relief"],
    "sword_boss": ["stern composure", "challenging confidence", "anger", "caught off guard", "restrained regret", "earned respect"],
    "dragon_boss": ["proud embers", "confident smirk", "open anger", "shock", "painful regret", "fierce resolve"],
    "astral_boss": ["calm observation", "deep focus", "worried calculation", "startled", "sorrow", "clear resolve"],
    "shadow_boss": ["guarded", "wary attention", "dry annoyance", "sudden pain", "guilt", "quiet resolve"],
    "merchant": ["knowing smile", "bright sales cheer", "worried calculation", "playful bargaining", "startled", "sincere kindness"],
    "echo_regent": ["grave neutrality", "release and relief", "regret", "stern judgment", "shocked recognition", "peaceful acceptance"],
    "arcane_sovereign": ["formal authority", "regret", "acceptance", "controlled anger", "shaken certainty", "exhausted honesty"],
    "palace_warden_v2": ["dutiful neutrality", "stern command", "alarm", "inner conflict", "oath-bound resolve", "subtle relief"],
    "black_seal_keeper_v2": ["watchful neutrality", "analytical focus", "alarm", "doubt", "regret", "decisive resolve"],
    "act3_last_custodian": ["grave weariness", "patient attention", "release", "deep sorrow", "final resolve", "quiet peace"],
    "act3_archive_warden": ["dutiful neutrality", "watchful focus", "stern warning", "concern", "decisive resolve", "restrained relief"],
}

base = (
    "Use case: stylized-concept. Asset type: canonical visual-novel expression reference sheet. "
    "Professional Japanese 2D visual-novel cel illustration matching the accepted GAL-SIMPLE series: fine clean dark outlines, large solid local colors, "
    "one hard-edged shadow per material, tiny restrained highlights, adult proportions, no painterly texture and no dense rendering. "
    "Image 1 is the accepted turnaround and controls identity, face, hair, anatomy and costume. Image 2 is the accepted detail board and controls every accessory count, side and construction. "
    "The written canon below overrides any accidental reference error. Create a landscape 3-column by 2-row grid of SIX equal-size chest-up portraits of the SAME character. "
    "Panel order is left-to-right across the top row, then left-to-right across the bottom row. Keep face proportions, hairstyle, hair accessories, eye color, neckwear and visible shoulder clothing IDENTICAL in all six panels. "
    "Expressions must be readable through eyebrows, eyes and mouth while remaining in-character; no theatrical distortion. Warm pale-grey opaque background, even flat reference lighting. "
    "No labels, text, panel numbers, borders, scenery, hands, held props, weapons, magic, watermark or signature. No extra jewelry or costume redesign. "
)

manifest = {"version": "GAL-SIMPLE-1.1", "panel_order": "top-left to top-right, then bottom-left to bottom-right", "characters": {}}
for cid, states in expressions.items():
    c = characters[cid]
    a = accepted[cid]
    turn = ROOT / a["turnaround"]["path"]
    detail = ROOT / a["detail"]["path"]
    state_text = "; ".join(f"{i+1}: {state}" for i, state in enumerate(states))
    prompt = base + f"CANON IDENTITY: {c['en']} HARD LOCKS: {', '.join(c['locks'])}. EXPRESSIONS IN EXACT PANEL ORDER: {state_text}."
    packet = {
        "version": "GAL-SIMPLE-1.1",
        "character_id": cid,
        "series_style_lock": "GAL-SIMPLE clean cel reference art",
        "identity_lock": c["locks"],
        "expression_order": states,
        "negative_constraints": ["identity drift", "hair or accessory count drift", "costume redesign", "text", "hands or props", "watermark"],
        "prompt": prompt,
        "referenced_image_paths": [str(turn), str(detail)],
        "output_contract": f"01_canon/expressions/EXPR_{cid.replace('_','-')}_v1.png",
    }
    (PACKETS / f"{cid}.json").write_text(json.dumps(packet, ensure_ascii=False, indent=2), encoding="utf-8")
    manifest["characters"][cid] = {"name": c["name"], "expressions": states, "packet": str((PACKETS / f"{cid}.json").relative_to(ROOT))}

(ROOT / "01_canon" / "expressions.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"packets": len(expressions), "output": str(PACKETS)}, ensure_ascii=False))
