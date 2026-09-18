import json
from pathlib import Path

ROOT = Path("/workspace/scratch/0645849eb5a5/gal-design-v1")
PACKETS = ROOT / "03_intermediate" / "prompt_packets" / "standees"
PACKETS.mkdir(parents=True, exist_ok=True)

characters = {c["id"]: c for c in json.loads((ROOT / "01_canon" / "characters.json").read_text(encoding="utf-8"))["characters"]}
accepted = {c["id"]: c for c in json.loads((ROOT / "05_manifests" / "accepted-assets.json").read_text(encoding="utf-8"))["characters"]}

expression_files = {
    "hero": "EXPR_hero_v1.png", "guide": "EXPR_guide_v1.png", "final_queen": "EXPR_final-queen_v1.png",
    "cat_boss": "EXPR_cat-boss_v1.png", "fox_boss": "EXPR_fox-boss_v1.png", "whale_boss": "EXPR_whale-boss_v1.png",
    "sword_boss": "EXPR_sword-boss_v2.png", "dragon_boss": "EXPR_dragon-boss_v1.png", "astral_boss": "EXPR_astral-boss_v1.png",
    "shadow_boss": "EXPR_shadow-boss_v1.png", "merchant": "EXPR_merchant_v1.png", "echo_regent": "EXPR_echo-regent_v1.png",
    "arcane_sovereign": "EXPR_arcane-sovereign_v1.png", "palace_warden_v2": "EXPR_palace-warden-v2_v1.png",
    "black_seal_keeper_v2": "EXPR_black-seal-keeper-v2_v1.png", "act3_last_custodian": "EXPR_act3-last-custodian_v1.png",
    "act3_archive_warden": "EXPR_act3-archive-warden_v1.png",
}

poses = {
    "hero": "Neutral vigilant three-quarter stance. RIGHT hand holds the single straight sword pointed safely downward; LEFT hand relaxed and empty, no spell effect. Scabbard and record pouch remain at LEFT waist.",
    "guide": "Gentle neutral three-quarter stance, holding the single silver circular astrolabe with both hands at waist height. No magic effects.",
    "final_queen": "Cold neutral frontal three-quarter stance. Hold exactly three bound seal tablets together as one neat set in LEFT hand; RIGHT hand relaxed. No sword and no floating objects.",
    "cat_boss": "Alert neutral stance. LEFT arm carries the single round shield low; RIGHT hand carries the single curved sabre pointed down. Exactly one tail visible.",
    "fox_boss": "Watchful neutral stance. RIGHT hand holds one open folding fan at chest level; LEFT hand holds exactly three paper seals as one aligned set. Exactly three tails visible and separated.",
    "whale_boss": "Gentle neutral stance holding the single five-string shell harp with both hands in front of the torso. No mermaid tail and no magic effects.",
    "sword_boss": "Stern neutral stance. RIGHT hand holds one straight sword pointed safely down; the one scabbard stays at LEFT waist. No thigh strap and no second weapon.",
    "dragon_boss": "Proud neutral stance. RIGHT hand holds one long spear vertically beside the body with exactly one red tassel. Exactly two horns, one tail and two cloth mantle panels; no anatomical wings.",
    "astral_boss": "Calm neutral stance holding one brass crescent astrolabe at LEFT side while RIGHT hand rests open. No star particles or floating charts.",
    "shadow_boss": "Guarded neutral stance. RIGHT hand holds one palm-length silver needle; LEFT hand holds one dark wooden spool of violet thread. Thread stays wound with only a short visible end; one needle case at LEFT waist.",
    "merchant": "Friendly neutral stance wearing the one square backpack with one rolled blanket. LEFT hand carries one square amber lantern low; RIGHT hand relaxed beside the one coin purse at RIGHT waist.",
    "echo_regent": "Grave neutral stance. Hold one black memorial ledger closed against the torso with LEFT forearm; RIGHT hand relaxed. Sash remains from anatomical RIGHT shoulder to LEFT hip. No crown or weapon.",
    "arcane_sovereign": "Formal neutral stance. RIGHT thumb and index finger display the one brass oval signet ring with one diagonal crack; LEFT hand holds one small open black ring box. No crown or sword.",
    "palace_warden_v2": "Dutiful neutral stance. RIGHT hand holds one straight silver sword with one central blue groove pointed safely down; one black scabbard at LEFT waist. No floating crystals.",
    "black_seal_keeper_v2": "Watchful neutral stance. RIGHT hand holds the one broken brass circular disk face-forward with its missing wedge at viewer upper-right; LEFT hand holds one thin black notebook with one dull red circular seal. No weapon.",
    "act3_last_custodian": "Weary neutral stance. RIGHT hand holds one tall dark staff with one rectangular amber lantern and one spiral amber light. LEFT hand relaxed near the single ivory waist tag. No blue light.",
    "act3_archive_warden": "Dutiful neutral stance. RIGHT hand holds one dark staff with one cylindrical cold blue-white lantern. The one LEFT-hip case stays closed and contains exactly three cards; do not show loose duplicate cards.",
}

base = (
    "Use case: background-extraction. Asset type: canonical full-body transparent visual-novel standing figure. "
    "Create ONE isolated full-body character cutout in polished Japanese 2D visual-novel cel style matching GAL-SIMPLE: fine clean dark outlines, large solid local colors, one hard-edged shadow per material, restrained highlights, adult proportions. "
    "Image 1 is the accepted turnaround and has highest visual authority for identity, anatomy, silhouette and costume. Image 2 is the accepted detail board and controls exact accessory, clothing and prop counts and side placement. Image 3 is the accepted expression sheet and controls only the face; use its first neutral expression. "
    "Portrait 2:3 composition, centered, entire hair, all props and both feet inside canvas with 8 percent transparent padding. Natural relaxed three-quarter pose facing camera, anatomically plausible hands, readable silhouette. "
    "ACTUAL TRANSPARENT RGBA BACKGROUND: no white or checkerboard background, no scenery, floor, cast shadow, glow, aura, particles, frame, text, logo, watermark or signature. Only the character and explicitly required carried items may have visible pixels. "
    "Do not redesign, beautify with extra jewelry, duplicate props, change sides, change counts, or merge objects into hands. "
)

for cid, pose in poses.items():
    c = characters[cid]
    a = accepted[cid]
    refs = [ROOT / a["turnaround"]["path"], ROOT / a["detail"]["path"], ROOT / "01_canon/expressions" / expression_files[cid]]
    prompt = base + f"CANON IDENTITY: {c['en']} CANON PROP: {c['prop']} HARD LOCKS: {', '.join(c['locks'])}. POSE AND OWNERSHIP: {pose}"
    packet = {
        "version": "GAL-SIMPLE-1.1",
        "character_id": cid,
        "series_style_lock": "GAL-SIMPLE clean cel transparent standee",
        "identity_lock": c["locks"],
        "prop_lock": c["prop"],
        "pose": pose,
        "negative_constraints": ["background pixels", "ground shadow", "extra accessory", "duplicate prop", "wrong side", "wrong count", "watermark", "cropped feet or prop"],
        "prompt": prompt,
        "referenced_image_paths": [str(x.resolve()) for x in refs],
        "output_contract": f"01_canon/standees/STANDEE_{cid.replace('_','-')}_neutral_v1.png",
    }
    (PACKETS / f"{cid}.json").write_text(json.dumps(packet, ensure_ascii=False, indent=2), encoding="utf-8")

print(json.dumps({"packets": len(poses), "output": str(PACKETS)}, ensure_ascii=False))
