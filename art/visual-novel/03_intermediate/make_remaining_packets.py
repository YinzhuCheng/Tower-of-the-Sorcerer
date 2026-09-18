import json
from pathlib import Path

ROOT = Path("/workspace/scratch/0645849eb5a5/gal-design-v1")
PACKETS = ROOT / "03_intermediate" / "prompt_packets"
CHARS = {c["id"]: c for c in json.loads((ROOT / "01_canon" / "characters.json").read_text(encoding="utf-8"))["characters"]}

DETAIL_STYLE = (
    "Use case: stylized-concept. Professional Japanese 2D visual novel CHARACTER DETAIL BOARD for a unified simplified redesign. "
    "Fine clean dark outline; large solid local-color shapes; one hard-edged shadow per material; tiny restrained highlights; matte fabric; "
    "simple anime design language; no painterly gradients and no dense rendering. Warm very pale grey opaque sheet background. "
    "No scenery, magic effects, cast shadows, decorative border, UI, logo, captions or text. "
    "Image 1 is the accepted turnaround and is the PRIMARY visual identity reference. Preserve its face, hair, body proportions, palette and clothing construction exactly. "
    "The written constraints below override any mistake in the image. Show clean catalog cutaways with generous spacing. "
    "When an object appears from several angles, those are alternate views of ONE physical object, never multiple simultaneous copies. "
)

detail_specs = {
    "shadow_boss": "Show head front/right-side/back with exactly one silver feather clip at her right temple; tunic, glove cuff and exactly two rear skirt panels front/back; one closed needle case; one palm-length silver needle front/side with visible eye; one dark wooden spool with violet thread wound neatly. No sword, necklaces, transparent trains or thigh straps.",
    "arcane_sovereign": "Show male head front/right-side/back; ivory lapel and exactly two ivory front panels with one blue diamond collar clasp; cobalt sash front/back; one oval-faced brass signet ring front/side with exactly one diagonal crack across the cobalt face; one plain black ring box open/closed; one correct right-hand pinch-grip example. No crown, sword, medals or chains.",
    "palace_warden_v2": "Show head front/right-side/back with one simple black circlet and exactly one central upward point; smooth breastplate, symmetric shoulder plates and cobalt tabard attachment front/back; one straight silver sword in front and thin side views with exactly one central blue groove; one plain black scabbard. No floating crystals, extra spikes, thigh cutouts or gems.",
    "act3_last_custodian": "Show head front/right-side/back with one small rectangular black hair clasp edged in brass at crown; garment construction proving exactly four broad aged-ivory page panels, front-left, front-right, back-left, back-right; one waist index tag; one tall dark lantern staff front/side and close view of its single rectangular amber-glass lantern containing one simple spiral amber light. No white hair and no blue lantern.",
    "act3_archive_warden": "Show head front/right-side/back proving exactly one thick braid routes over her right shoulder; coat front/back with exactly three rectangular copper clasps, blue belt and one left-hip copper-edged card case; one dark staff front/side with one cylindrical brass lantern containing one cold blue-white vertical light; exactly three plain ivory index cards shown as the contents of the single case. No second braid, amber spiral lantern, flower or crown.",
    "echo_regent": "Show head front/right-side/back with shoulder-length ash-blond hair in one short low tie and one square silver collar clasp; front and back garment construction proving one blue-grey sash starts at anatomical right shoulder and ends at anatomical left hip; coat lining; one black memorial ledger cover/spine/open with one vertical blue-grey cloth band and one square silver closure. No crown, weapon, medals or chains.",
    "black_seal_keeper_v2": "Show head front/right-side/back; folded-back hood and broad ivory collar front/back; one plain round brass belt buckle; one dark-brass broken circular observation disk front/edge/back with one clean missing wedge at its top-right in front view and one central crosshair; one thin black seal notebook cover/spine/open with one dull red circular cover seal. No ring motifs on robe, sword, spear, staff, crystals or stars.",
}

accepted_turnarounds = {
    "echo_regent": ROOT / "01_canon/turnarounds/CHAR_echo-regent_turnaround_v2.png",
    "black_seal_keeper_v2": ROOT / "01_canon/turnarounds/CHAR_black-seal-keeper-v2_turnaround_v2.png",
    "shadow_boss": ROOT / "01_canon/turnarounds/CHAR_shadow-boss_turnaround_v2.png",
    "arcane_sovereign": ROOT / "01_canon/turnarounds/CHAR_arcane-sovereign_turnaround_v1.png",
    "palace_warden_v2": ROOT / "01_canon/turnarounds/CHAR_palace-warden-v2_turnaround_v1.png",
    "act3_last_custodian": ROOT / "01_canon/turnarounds/CHAR_act3-last-custodian_turnaround_v1.png",
    "act3_archive_warden": ROOT / "01_canon/turnarounds/CHAR_act3-archive-warden_turnaround_v1.png",
}

for cid, ref in accepted_turnarounds.items():
    c = CHARS[cid]
    packet = {
        "prompt": DETAIL_STYLE + "CANON: " + c["en"] + " PROP: " + c["prop"] + " BOARD CONTENT: " + detail_specs[cid],
        "referenced_image_paths": [str(ref)],
    }
    (PACKETS / f"{cid}_details.json").write_text(json.dumps(packet, ensure_ascii=False, indent=2), encoding="utf-8")

echo_r1 = ROOT / "04_cg/rejected/CHAR_echo-regent_turnaround_v1_reversed-back-sash.png"
echo_prompt = (
    "Edit and regenerate this professional Japanese 2D visual novel three-view model sheet while preserving the same character, face, palette, coat and simple rendering. "
    "Keep three equal-scale full-body orthographic views left-to-right FRONT, HER RIGHT SIDE, BACK on a warm pale-grey opaque background, no text or props. "
    "Make the ash-blond hair truly shoulder length, gathered in one SHORT low tie ending at upper shoulders. "
    "Correct the ONE continuous blue-grey sash so it stays on the same anatomical route in every view: from HER RIGHT SHOULDER to HER LEFT HIP. "
    "In the FRONT view this means high on VIEWER LEFT and low on VIEWER RIGHT. In the BACK view this means high on VIEWER RIGHT and low on VIEWER LEFT. "
    "One square silver collar clasp. Empty hands. No crown, medals, chains, tassels or weapon."
)
(PACKETS / "echo_regent_turnaround_r2.json").write_text(json.dumps({"prompt": echo_prompt, "referenced_image_paths": [str(echo_r1)]}, ensure_ascii=False, indent=2), encoding="utf-8")

seal_r1 = ROOT / "04_cg/rejected/CHAR_black-seal-keeper-v2_turnaround_v1_extra-ring-motifs.png"
seal_prompt = (
    "Edit and regenerate this professional Japanese 2D visual novel three-view model sheet while preserving the same adult woman, face, midnight-violet straight hair, amber eyes, robe silhouette and simple rendering. "
    "Keep three equal-scale full-body orthographic views left-to-right FRONT, HER RIGHT SIDE, BACK on a warm pale-grey opaque background, no text or detached props. "
    "REMOVE every gold circular hem motif and every other robe symbol. The indigo-black robe must be completely plain except for the broad ivory collar insert, plum inner skirt and ONE round brass belt buckle. "
    "Keep the simple folded-back hood and closed black boots. Empty hands. No disk shown on this turnaround, no crown, hair flowers, chains, garters, sword, spear or staff."
)
(PACKETS / "black_seal_keeper_v2_turnaround_r2.json").write_text(json.dumps({"prompt": seal_prompt, "referenced_image_paths": [str(seal_r1)]}, ensure_ascii=False, indent=2), encoding="utf-8")
