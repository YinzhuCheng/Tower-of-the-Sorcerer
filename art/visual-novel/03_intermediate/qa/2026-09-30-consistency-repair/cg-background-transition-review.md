# Main CG, backdrop and transition visual audit — 2026-09-30

## Scope and result

- Baseline: main commit `3c2bc16cba3b57d2f3ae81d3b1d9bd9f87edcf4e`, not the `art/fantasy-cg-redraw-2026-09-21` branch.
- Coverage: all **19 active CG**, **30 active backdrops**, **2 transitions**. Active paths came from `public/art-audit/registry.js`; the sheet with 31 CG includes 12 archived aliases and is not the active scope.
- Every active CG was inspected at full 1672×941 resolution. All backdrop/transition pixels were inspected in the labeled sheet; both transitions additionally at full resolution. Canon turnarounds for all visible principal CG characters were inspected, along with hero, queen, Yayu and Lumi accessory anchors relevant to defects. P0–P3 files were downloaded from the pinned baseline and blob-SHA verified.
- Five CG have high-confidence localized continuity defects: **004, 006, 008, 010, 015**. They do not need a new composition or new identity. All five have accepted localized repairs and unchanged runtime dimensions.
- The other 14 CG, all 30 backdrops and both transitions have no high-confidence severe defect in this visual pass. “Pass” below means this bounded visual audit, not proof that every subpixel ornament obeys every legacy sentence.
- No generic redraw of the background collection is recommended. The nine September 23 floor interiors have deliberately distinct geometry and lighting.

## Authority, conflict handling and retained choices

Read: `01_canon/characters.json` (GAL-SIMPLE-1.1), per-character text, `series-style.md`, `2026-09-04-continuity-lock.json`, `CANON_FIRST_ART_PRODUCTION_PROTOCOL_2026-09-19.md`, all 19 `03_intermediate/scene_cards/CG_*.json`, and the September 21 runtime/September 23 override manifests.

The actual hero P0 turnaround has a high front hem matching the current CG. The text phrase “just above knees” alone was therefore not used to lengthen every outfit. The September 19 protocol explicitly makes P0/P1/P2/P3 the visual identity chain and says later precision work must not redesign faces or hairstyles. We preserved the accepted faces, costume silhouettes and composition.

The older style text says “Never use ... mobile-game splash-art density ... HDR” and asks for few hard-edge shading steps, while the September 21/23 accepted main art uses glossy cathedral reflections and richer atmospheric lighting. This is a genuine documented style tension, not a license to silently replace the accepted main series with a flat alternate style. The repair pass preserves main rendering and fixes objectively countable or side-specific breaks.

The public registry had three stale cast annotations, now corrected to the source-grounded scene cards: CG004 lists guide, although its source-grounded scene card correctly requires hero + queen; CG016 omits last custodian; CG019 omits sovereign. The actual images agree with source-grounded cards. These were metadata issues, not missing/wrong-character image defects. A regression test now verifies all 19 registry casts and paths against the scene cards.

Additional low-confidence/inherited details were not promoted to mandatory redraws: queen seal effects are more ornate than the neutral accessory diagram and their small circular marks are indistinct; brightness/reflection density varies across accepted scene revisions; some tiny background light counts are not reliably countable. Do not claim an unrestricted “all-canon exact” certificate.

## Precise repair specifications

1. **CG004 / P1 narrative count:** `public/assets/anime/cg/liyue-seven-cantos-severed-cg-audit-v3.webp`. Original has seven extracted canto gems but only two queen seal tablets; add a third matching framed red seal without clipping, preserve all seven colored gems. Remove only the extra small pouch at hero's own right waist; retain one pouch on her own left by the scabbard. Anchors: scene card `CG_004_seven-cantos-severed.json`, hero and final-queen P0/P1. Accepted repair `cg004-canon-runtime-repair-20260930.json`.
2. **CG008 / P1 narrative count:** `public/assets/anime/cg/liyue-noctia-seal-cg-audit-v3.webp`. Original has six separate small rainbow cores inside the fissure, though queen correctly has three large framed red tablets. Restore exactly seven individually legible cores; retain the three distinct tablets, heroine's sword impact, both faces and dynamic cooperative composition. Keep every core clear of the white flash. Anchor: scene card `CG_008_noctia-seal.json`. Do not count a tablet or white flash as the missing seventh core. Accepted repair `cg008-canon-runtime-repair-20260930.json`.
3. **CG010 / P1 identity prop:** `public/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp`. Replace only Lumi's outer full circular instrument frame with the broad brass crescent in `DETAIL_astral-boss_v1.png`, open upper-right, containing the smaller complete sighting ring and one straight pointer. Retain the three colored timing lanes and their two ghost tracks; these explain the time displacement and are not accidental extra lanes. Accepted repair `cg010-canon-runtime-repair-20260930.json`.
4. **CG006 / P2 side-specific accessory:** `public/assets/anime/cg/liyue-yayu-seven-core-network-cg-audit-v3.webp`. Move Yayu's one silver feather from her own left temple (viewer right) to her own right (viewer left), matching `CHAR_shadow-boss_turnaround_v2.png`. Do not mirror the body or change her right needle/left spool. Seven colored node panels, all threads, shared lock and hero remain unchanged. Accepted repair `cg006-canon-runtime-repair-20260930.json`.
5. **CG015 / P2 side-specific accessory:** `public/assets/anime/cg/liyue-noctia-archive-storm-cg-audit-v3.webp`. Move only heroine's one crescent hair clip from her own left temple (viewer right, near bun) to her own right (viewer left). Keep the separate left-shoulder crescent clasp unchanged. Preserve queen, raised cloak, both heroine hands, ordered envelopes, wind/rain and all composition. Anchor `CHAR_hero_turnaround_v2.png`. Accepted repair `cg015-canon-runtime-repair-20260930.json`.

## Per-image CG review

The common anchor for each row is its same-numbered scene card under `art/visual-novel/03_intermediate/scene_cards/`, plus the named characters' P0 turnarounds and P1 prop details in `01_canon/`.

### CG001 — critical: PASS
- Path: `public/assets/anime/cg/liyue-critical-cg.webp`
- Visual finding: Hero identity/dual buckles/mantle clip/pouch readable; conscious kneeling pose, right-hand single sword and no wound/gore. Strong silhouette.

### CG002 — defeat: PASS
- Path: `public/assets/anime/cg/liyue-defeat-cg.webp`
- Visual finding: Hero remains conscious/exhausted, sword at her right; anatomy and symmetric stocking/boot design coherent; no torn clothing or corpse-like staging.

### CG003 — prologue-tower: PASS
- Path: `public/assets/anime/cg/liyue-prologue-tower-cg.webp`
- Visual finding: Tower dominates, seven restrained blue tower lights countable, sealed gate, small rear-facing heroine and distant evacuation craft. Hero is intentionally tiny.

### CG004 — seven-cantos-severed: REPAIRED
- Path: `public/assets/anime/cg/liyue-seven-cantos-severed-cg-audit-v3.webp`
- Visual finding: Original two queen seals and duplicate hero pouch corrected; seven extracted rainbow gems retained. Actual queen cast is correct and registry guide tag corrected to queen.

### CG005 — northstar-arrival: PASS
- Path: `public/assets/anime/cg/liyue-lanyin-northstar-arrival-cg-v8.webp`
- Visual finding: Hero listens; Lanyin is human-legged, with shell harp, shell clip and aqua sleeve drapes; clear ship/water-memory evidence. No mermaid/extra instrument.

### CG006 — seven-core-network: REPAIRED
- Path: `public/assets/anime/cg/liyue-yayu-seven-core-network-cg-audit-v3.webp`
- Visual finding: Yayu feather side corrected; seven node panels, shared lock, right needle/left spool, both character identities preserved.

### CG007 — noctia-truth: PASS
- Path: `public/assets/anime/cg/liyue-noctia-truth-cg-audit-v3.webp`
- Visual finding: Non-attacking two-person conversation, queen grief and faint distress light, low throne behind; heroine sword lowered, queen unarmed.

### CG008 — noctia-seal: REPAIRED
- Path: `public/assets/anime/cg/liyue-noctia-seal-cg-audit-v3.webp`
- Visual finding: Original six cores restored to seven distinct outlined rainbow cores, with blue slightly staggered below impact. Three queen tablets, cooperative breach composition and faces retained.

### CG009 — missing-fourth-step: PASS
- Path: `public/assets/anime/cg/liyue-noctia-missing-fourth-step-cg-audit-v3.webp`
- Visual finding: Four wall slots with first three reliefs and visibly missing fourth; queen stops hand before gap, heroine observes. Current Sept23 sunrise hall is authoritative; no need return to old dark board composition.

### CG010 — seventeen-minute-splice: REPAIRED
- Path: `public/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp`
- Visual finding: Lumi crescent astrolabe restored from P1; three timing lanes and two displaced ghost tracks retained. Faces, star hair clip and collar star unchanged.

### CG011 — intercepted-receipt: PASS
- Path: `public/assets/anime/cg/liyue-yayu-intercepted-receipt-cg-audit-v3.webp`
- Visual finding: Receipt visibly lodged in a nonhuman mechanical interceptor, Yayu controls thread, heroine witnesses; right-side feather already correct. No human hostage or extra weapon.

### CG012 — echo-ledger: PASS
- Path: `public/assets/anime/cg/liyue-echo-ledger-cg-audit-v3.webp`
- Visual finding: Three source-grounded characters; one green status token while dark mourning tokens remain; regent owns a black book and wears correct sash. No wrong-identity regent.

### CG013 — noctia-sovereign: PASS
- Path: `public/assets/anime/cg/liyue-noctia-sovereign-cg-audit-v3.webp`
- Visual finding: Sovereign clearly adult male, dark teal hair and ivory coat panels; one cracked signet hovers over his right hand, fractured blue restraint at wrist; three witnesses, no torture.

### CG014 — missing-page-restored: PASS
- Path: `public/assets/anime/cg/liyue-noctia-missing-page-cg-audit-v3.webp`
- Visual finding: One detached final page beside mechanical separation edge, three witnesses; no flying page swarm or readable legal prose. Faces remain canonical.

### CG015 — letters-held-in-storm: REPAIRED
- Path: `public/assets/anime/cg/liyue-noctia-archive-storm-cg-audit-v3.webp`
- Visual finding: Hero wrong-side crescent hair clip relocated; queen crown, cooperative cloak shelter, both hands on ordered envelopes, rain and paper direction retained.

### CG016 — originals-enter-lighthouse: PASS
- Path: `public/assets/anime/cg/liyue-archive-warden-entry-cg-audit-v3.webp`
- Visual finding: Four characters correct: heroine leads, queen + sovereign carry heavy original, rear custodian operates key. Rear custodian is deliberate, not accidental extra actor; matches source card.

### CG017 — traceable-revocation: PASS
- Path: `public/assets/anime/cg/liyue-traceable-revocation-cg-audit-v3.webp`
- Visual finding: Guide owns light pen and complete silver circular astrolabe; queen and sovereign support original volume; old physical pages coexist with new layered light index.

### CG018 — noctia-afterlight: PASS
- Path: `public/assets/anime/cg/liyue-noctia-afterlight-cg.webp`
- Visual finding: One alarm stone beside final book, mail crate between two seated characters, queen retains three-point crown, quiet pause and no romantic or celebratory addition.

### CG019 — lighthouse-archive: PASS
- Path: `public/assets/anime/cg/liyue-lighthouse-archive-cg.webp`
- Visual finding: Four distinct source-grounded tasks: two crates, guide lamp, sovereign blank handover form; distant unarmed coach driver and wet dawn path. Sovereign presence is correct; registry annotation now includes him.

## Per-image backdrops

All paths below are under `public/assets/anime/themes/`. The nineteen source environment cards plus accepted nine floor-refresh interiors define intentionally varied spaces; lower stage zones remain empty and usable. PASS is no high-confidence severe visual defect.

- `theme-forest-approach.webp` — PASS: Forest arch/approach, distant tower and clear travel route; no accidental character.
- `theme-forest-sanctuary.webp` — PASS: Open forest clearing with restrained central platform and tower; distinct from approach arch.
- `theme-red-vein.webp` — PASS: Older quiet furnace theme, coherent blue/orange contrast, readable ground.
- `theme-ocean-archive.webp` — PASS: Quiet interior archive waterway, intact walkable side platforms.
- `theme-star-mirror.webp` — PASS: Central violet mirror/portal, controlled empty side stage zones.
- `theme-night-tower.webp` — PASS: Throne interior with tall central opening and both stage sides clear.
- `theme-sun-sanctum.webp` — PASS: Bright outdoor colonnade/ruin, intentional contrast with nighttime interiors.
- `theme-echo-court.webp` — PASS: Moonlit external court mother theme; do not substitute for floor19 interior.
- `theme-origin-core.webp` — PASS: Central hovering core and two orbital mechanism rings; no character-identity implication.
- `theme-ash-registry.webp` — PASS: Archive shelves and sparse paper movement; floor area readable.
- `theme-night-shelter-v8.webp` — PASS: Narrow wall registry corridor with visible center route; no text legibility artifact.
- `theme-audit-chamber-v8.webp` — PASS: Central blue inspection mirror and record table, shelves coherent.
- `theme-relay-gallery-v8.webp` — PASS: Large mechanical relay dial on left, wider open stage on right.
- `theme-triage-index-v8.webp` — PASS: Two suspended rings, archive platform and raised book; index-work architecture coherent.
- `theme-archive-storm.webp` — PASS: Open storm-facing arch and clear steps; atmosphere restrained and stage remains usable.
- `theme-ember-lighthouse.webp` — PASS: Dawn exterior terrace and lamps with distant tower, clean approach.
- `theme-moon-white-vestibule.webp` — PASS: Reception ledge/window/stair combination; readable central floor and no actors.
- `theme-twin-score-greenhouse.webp` — PASS: Greenhouse frame and planted partitions coherent, broad central walkway.
- `theme-folded-archive-market.webp` — PASS: Shelves, display cabinet and stair distinct from archive table scenes.
- `theme-final-index-room.webp` — PASS: Closed indexed doors, shelves and clear central travel floor.
- `theme-ember-lighthouse-writein.webp` — PASS: Large rear window and circular write-in platform, empty sides.
- `theme-floor03-tide-navigation.webp` — PASS: Sept23 navigation hall has large water-map panel and distinct watery machinery, no pasted characters.
- `theme-floor05-red-vein-shelter.webp` — PASS: Sept23 warm shelter furnace with symmetric stairs and furnishing, clear lower floor.
- `theme-floor11-sun-revival-corridor.webp` — PASS: Sept23 bright round corridor and broad inset wall panels; no impossible focal geometry.
- `theme-floor13-red-vein-pulse-forge.webp` — PASS: Sept23 tall industrial pulse furnace/pipe assembly distinct from shelter.
- `theme-floor14-sun-three-arrow-arena.webp` — PASS: Sept23 broad sunlit arena and radiating floor design, restrained central star.
- `theme-floor16-tide-mirror-hall.webp` — PASS: Sept23 paired mirror architecture and symmetric reflecting water floor.
- `theme-floor17-sun-three-crown-court.webp` — PASS: Sept23 stepped throne/crown court distinct from floor14; not accidental repeated image.
- `theme-floor18-tide-sky-waterway.webp` — PASS: Sept23 raised receding canal and railings, airy blue navigation architecture.
- `theme-floor19-echo-court-interior.webp` — PASS: Sept23 tall enclosed court with record plaques, explicitly interior; correct replacement for runtime F19.

## Transitions

- `public/assets/anime/transitions/witness-entry.webp` — PASS. Full resolution inspected: coherent curving stair toward circular witness portal, drifting paper/round seals, no unintended actor, text or watermark. The steps and dark foreground make entry motion readable.
- `public/assets/anime/transitions/seal-shatter.webp` — PASS. Full resolution inspected: fractured outer seal surrounds a readable inner chamber, purple cracks contained in deliberate frame; no accidental human-like fragments or unreadable text.

## Delivery and provenance

Accepted new runtime assets preserve original 1672×941 dimensions and use WebP q95/method6. No crop, face redesign or scene reblocking was performed. New PNG source masters live under `art/visual-novel/04_cg/final/2026-09-30-consistency-repair/` (CG010 under `2026-09-30-quality/`); historical accepted masters were not overwritten. Per-CG manifests carry previous/runtime/source SHA-256, exact prompt/reference packets and two-reviewer QA.

The local integration change list is `cg-integrated-files.json`; publication owner should merge it with the separate CG010/merchant changes and the structural repairs. Full application tests/deploy verification belong to the publication phase; this report does not imply deployment has happened.

## Verification after integration

- Both new `test/cg-continuity-repair-20260930.test.js` cases passed: all 19 registry cast/path mappings match authoritative scene cards, and all five source/runtime SHA and dimension contracts match.
- Existing art-audit mapping/UI checks passed. The separate living-unit count assertion was concurrently affected by the authorized map/HUD canonicalization (39 versus its prior hardcoded 47); reported to that owner for contract update. It is unrelated to the CG assets or cast metadata corrections. Full aggregate checks must run once integration is complete.
