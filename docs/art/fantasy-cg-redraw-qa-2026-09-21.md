# Fantasy CG redraw QA and clean-anchor lock — 2026-09-21

## Accepted candidates

The following fantasy-redraw candidates passed visual QA locally and are reserved for runtime replacement once the binary upload is completed:

- **CG_006 seven-core-network → 七灯灵脉 / 守夜誓网**
  - source: `moonlit_cathedral_of_the_seven_lanterns.png`
  - source SHA-256: `50995c189ba98c374b2d74ee35c1ff70abd66aa616e0d1952603bace2b7c81cd`
  - runtime WebP SHA-256: `eacba9863f0d979829a1d6e03b7f14e31ca7ad4f9651259528b89c1fea17736f`
- **CG_009 missing-fourth-step → 被凿去的守夜终仪**
  - source SHA-256: `6eeebd0cec0ac4b86867755a98b3973fc9a5e8a5a7a7e72aedff6bc3e188bfb4`
  - runtime WebP SHA-256: `e9944cbf558173cc79ab1d05cd28da2f2219f25ad1492dd8b907e61957a1cf17`
- **CG_011 intercepted-receipt → 被截断的船长信符**
  - source SHA-256: `ef2e6dc7ea8c182bba34d9b677b98d7e7ea66e7435bc476ff446f2f4e45a6794`
  - runtime WebP SHA-256: `6a6f1c36d3ec66312e0e11357b9087c229a4bb7139514ecf905300ceb3bf72d7`
- **CG_012 echo-ledger → 万名灯殿**
  - source SHA-256: `7ee1bc2cd5dfc83b9f6c3ec623752bd68b75fe3a0acae6b20fceddc543cc8505`
  - runtime WebP SHA-256: `8b4ed5eb6c548f2bce7e20675a8d43aca9cea8f0372f7872b7a15223a9bfabcb`

All four candidates are **1672×941 RGB**, contain no modern UI/table/monitor language, and preserve the fantasy rewrite.

## BLOCKED: CG_010 — contamination rejected

Do **not** use any newly generated CG010 from the contaminated conversation context.

### Authoritative edit target
`art/visual-novel/04_cg/working/R3-scene/2026-09-21/CG_010_seventeen-minute-splice_R3_accepted_v1.png`

### Clean visual anchor chain
1. accepted R3 edit target above — locks camera, two-person composition and Sun Sanctum;
2. `01_canon/turnarounds/CHAR_hero_turnaround_v2.png`;
3. `01_canon/turnarounds/CHAR_astral-boss_turnaround_v1.png`;
4. `01_canon/details/DETAIL_astral-boss_v1.png`.

### Hard locks
- exactly **two adult women**;
- **璃 on image left**, midnight-blue/cobalt long hair and right-temple crescent clip;
- **露米 on image right**, shoulder-length ash-violet hair, gold-violet eyes, exactly one brass four-point star clip on HER RIGHT temple;
- 露米 alone owns and operates the **brass crescent astrolabe**;
- preserve the accepted R3 camera and architecture.

### Fantasy semantic edit
Replace the old three technical time tracks with **three magical memory echoes / memory crystals**. Two echoes must be displaced together by one visually clear interval while one remains at the original position. No timeline UI, graph, table, screen, readable text, or floating portrait-bubble montage.

## BLOCKED: CG_017 — contamination rejected

Do **not** use any newly generated CG017 from the contaminated conversation context.

### Authoritative edit target
`art/visual-novel/04_cg/working/R3-scene/2026-09-21/CG_017_traceable-revocation_R3_accepted_v1.png`

### Clean visual anchor chain
1. accepted R3 edit target above — locks three-person camera and Ember Lighthouse interior;
2. `01_canon/turnarounds/CHAR_final-queen_turnaround_v1.png`;
3. `01_canon/details/DETAIL_final-queen_v1.png`;
4. `01_canon/turnarounds/CHAR_guide_turnaround_v1.png`;
5. `01_canon/details/DETAIL_guide_v1.png`;
6. `01_canon/turnarounds/CHAR_arcane-sovereign_turnaround_v1.png`;
7. `01_canon/details/DETAIL_arcane-sovereign_v1.png`.

### Hard locks
- exactly **three adults**: 诺克缇娅 left, **纱雾 center**, 奥术主权者 right;
- center character is **not 璃**: chin-length silver-lilac bob, violet eyes, exactly one white five-petal flower at HER LEFT temple;
- queen remains black/red, crowned, unarmed;
- sovereign remains male, teal-black ponytail, amber eyes, black/ivory coat and blue sash;
- preserve the accepted R3 camera and lighthouse chamber.

### Fantasy semantic edit
Replace technical record-write imagery with:
- the **torn final oath page** being restored to the ancient volume;
- the sovereign's **cracked blue seal/ring visibly breaking**;
- the circular lighthouse mirror/window revealing **present-day Gray Harbor at dawn**;
- soft luminous oath traces, not cards or UI.

No audit trail, revision history, records dashboard, screen, table, readable text, or modern interface.

## Remaining mandatory art gap

**Exactly 2 story CGs remain blocked: CG_010 and CG_017.**

No new standee, avatar, map, generic environment, or UI art gap was found in this pass. Existing Canon P0–P3 and environment masters are sufficient to finish both scenes in a clean image-generation context.


## RESOLVED: CG_010 and CG_017 — 2026-09-22

The two previously blocked fantasy-rewrite CGs are now accepted and supersede the earlier BLOCKED notes above.

- **CG_010 seventeen-minute-splice**
  - accepted source: `art/visual-novel/04_cg/working/fantasy-redraw/2026-09-21/CG_010_seventeen-minute-splice_fantasy_accepted_v1.png`
  - source SHA-256: `57506d50eba838c730d9fbf2959cf7661bb0dbb723cca814cab2a984b386a2d0`
  - runtime: `public/assets/anime/cg/liyue-lumi-seventeen-minute-splice-cg-v8.webp`
  - runtime SHA-256: `57c99b7cd4648128c65abbec263dd511af00f88eac9038c5094aa956138e0805`
  - QA: exactly two adult women; 璃 left; 露米 right; brass astrolabe owned/operated by 露米; three magical memory echoes; no modern UI/readable timeline.
- **CG_017 traceable-revocation**
  - accepted source: `art/visual-novel/04_cg/working/fantasy-redraw/2026-09-21/CG_017_traceable-revocation_fantasy_accepted_v1.png`
  - source SHA-256: `cdcff0306a39bbb0f6da971318b1e9506af8e0c8684abe396eed4c50240b435d`
  - runtime: `public/assets/anime/cg/liyue-traceable-revocation-cg-audit-v3.webp`
  - runtime SHA-256: `eab68e9cb945460bc9799dd915012ce996009aef377e45562708db723587be5f`
  - QA: exactly three adults; 诺克缇娅 left, 纱雾 center, 奥术主权者 right; oath page restored to ancient volume; blue seal visibly breaking; dawn Gray Harbor visible; no modern records UI.

**Remaining mandatory fantasy-rewrite story CG gap: 0.**
