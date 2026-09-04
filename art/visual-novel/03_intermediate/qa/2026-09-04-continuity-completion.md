# Continuity completion v1 QA

Status: event CGs and backgrounds accepted for runtime; five standees accepted as checkerboard extraction sources only.

## Visual gates

- Every accepted image follows the frozen Japanese 2D Galgame cel style: clean linework, broad flat color groups, no more than two shadow tones, restrained highlights, and a low-noise finish. All eight event CGs passed a dedicated v3 simplification redraw after their earlier story-correct compositions were judged too ornate.
- All CGs preserve a readable lower dialogue-safe zone and contain no readable text, logo, watermark, grain, painterly texture, or mobile-game splash-detail density.
- All five backgrounds are empty establishing plates with the same obsidian arches, brass registration seals, blue-white index lights, and restrained violet seal fractures used by the accepted tower canon.
- Character faces, hair colors, costume silhouettes, props, handedness, and story actions were inspected against the continuity lock and scene cards.

## Story-beat acceptance

- Prologue: the seven canto fragments visibly separate from Liyue and connect to the seven guardians.
- F7: the accepted v2 contains exactly seven guardian panels around Liyue and Yayu.
- F11: Noctia faces the missing archive step, not an invented combat action.
- F18: Yayu extracts the captain-stamped receipt from the translucent interceptor.
- F25: Noctia restores the missing archive page with the Sovereign present as a male figure.
- F28: Noctia's cape clearly shelters the letters while Liyue secures the original numbering.
- F30 entry: Liyue leads while Noctia and the Sovereign carry the heavy originals into the write-in chamber.
- F30 revocation: Shawu writes the trace fields, the Sovereign revokes beside the preserved signature, and Noctia contributes witness seals.

## Location acceptance

- Moon-white vestibule replaces the generic forest behind Milu's sealed interior encounter.
- Twin-score greenhouse, folded archive market, final index room, and lighthouse write-in chamber now match the written physical spaces.
- Existing ocean, star-mirror, red-vein, origin-core, and exterior lighthouse plates are reused only where the prose names the same place.

## Standee handoff

- Vela, Seph, Last Custodian, Noctia resolve, and Shawu focus v2 sources were simplified after rejecting the ornate v1 attempts.
- The generator did not produce a real alpha channel. Each accepted handoff source therefore uses a saturated lime/magenta checkerboard intended for later user extraction.
- None of these five checkerboard WebP sources is referenced by runtime code. Identity-correct transparent map art or existing accepted painted expressions remain active, so no checker pattern can appear in the shipped game.

## Technical gates

- Runtime CG and background exports are 1672×941 opaque WebP.
- Manifest SHA-256 values and byte equality between final and runtime copies are covered by `test/continuity-completion-assets.test.js`.
- Dialogue tests cover all eight new CG bindings, their hold spans, the five new backgrounds, identity routing for Vela/Seph/Last Custodian, and the bumped cache version.
