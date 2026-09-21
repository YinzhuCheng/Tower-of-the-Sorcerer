# Fantasy Rewrite Art Gap Audit — 2026-09-21

## Scope

This audit covers the 15 story CGs currently bound by the F1–F30 runtime scripts after the fantasy rewrite.

Important limitation: the repository connector confirms asset paths and script bindings, but this session could not retrieve the WebP pixels into the local runtime for full visual inspection. Therefore this document distinguishes **semantic compatibility** from **visual QA required**. No image is marked as visually approved solely from its filename.

## Current result

- Character portraits / expression sets: **retain by default**. The rewrite does not alter core character identity.
- Tower maps / combat art: **retain by default**. The rewrite changes lore, not topology or combat roles.
- Story CG bindings: **all 15 existing CG paths remain bound** in the rewritten script.
- Expected replacement need: **small**, likely concentrated in CGs that visibly contain modern UI, flowcharts, spreadsheet-like fields, or computer-terminal imagery.

## CG matrix

### Act I

1. `liyue-yayu-seven-core-network-cg-audit-v3.webp`
   - New meaning: seven magical ley-lines / seven-lamp oath web.
   - Semantic status: **RETAIN / REINTERPRET**.
   - Visual risk: **HIGH** if the image contains literal network diagrams, modern nodes, UI panels, or technical labels.
   - Replacement only if visual UI cannot plausibly read as magical sigils.

2. `liyue-noctia-truth-cg-audit-v3.webp`
   - New meaning: Noctia admits she never heard the final homecoming bell.
   - Semantic status: **RETAIN**.
   - Visual risk: **LOW**, assuming character-emotion composition.

3. `liyue-lanyin-northstar-arrival-cg-v8.webp`
   - New meaning: Northstar Seven reaches the north shore and rings the homecoming bell.
   - Semantic status: **STRONG RETAIN**.
   - This is now one of the central visual anchors of the entire story.

4. `liyue-noctia-seal-cg-audit-v3.webp`
   - New meaning: the Vigil-Extension Seal tightens around Noctia when she tries to release the throne.
   - Semantic status: **STRONG RETAIN**.
   - Visual risk: **LOW** if primarily magical seal imagery.

### Act II

5. `liyue-noctia-missing-fourth-step-cg-audit-v3.webp`
   - New meaning: the fourth mural / ending rite of the Seven-Lamp Vigil has been removed.
   - Semantic status: **RETAIN / REINTERPRET**.
   - Visual risk: **MEDIUM-HIGH** if it literally depicts a modern process diagram rather than ritual panels.

6. `liyue-lumi-seventeen-minute-splice-cg-v8.webp`
   - New meaning: Lumi separates three magical memory echoes that occurred seventeen minutes apart.
   - Semantic status: **RETAIN / REINTERPRET**.
   - Visual risk: **HIGH** if the composition is dominated by software timelines or data visualization.
   - Candidate for replacement if needed.

7. `liyue-yayu-intercepted-receipt-cg-audit-v3.webp`
   - New meaning: Yayu pulls the intercepted captain's signal / homecoming sound from a shadow-current.
   - Semantic status: **RETAIN / REINTERPRET**.
   - Visual risk: **MEDIUM** if the “receipt” is a modern document or screen; low if it is a magical paper/sign.

8. `liyue-echo-ledger-cg-audit-v3.webp`
   - New meaning: Hall of Ten Thousand Lamps; forty-seven red lamps turn blue when the lost bell is played.
   - Semantic status: **RETAIN IF VISUALLY ABSTRACT / FANTASY**.
   - Visual risk: **HIGH** if the image is visibly a ledger UI/table.
   - Strong replacement candidate if literal spreadsheet-like content is present.

9. `liyue-noctia-sovereign-cg-audit-v3.webp`
   - New meaning: confrontation with the Arcane Sovereign and his cracked blue Vigil-Extension Seal.
   - Semantic status: **STRONG RETAIN**.
   - Visual risk: **LOW**.

### Act III

10. `liyue-noctia-missing-page-cg-audit-v3.webp`
    - New meaning: torn final page of the ancient oath; “the vigil may end while names remain.”
    - Semantic status: **STRONG RETAIN**.
    - Visual risk: **LOW-MEDIUM** depending on whether the page is visually bureaucratic or fantastical.

11. `liyue-noctia-archive-storm-cg-audit-v3.webp`
    - New meaning: literal storm of undelivered letters, farewells, tickets and name-tags.
    - Semantic status: **STRONG RETAIN**.
    - This image becomes more natural in the fantasy rewrite.

12. `liyue-archive-warden-entry-cg-audit-v3.webp`
    - New meaning: the Ember Lighthouse guardian receives the physical letters and oath-fragment.
    - Semantic status: **RETAIN**.
    - Visual risk: **LOW-MEDIUM**.

13. `liyue-traceable-revocation-cg-audit-v3.webp`
    - New meaning: the final old oath breaks and the lighthouse reflects the present-day Gray Harbor.
    - Semantic status: **REINTERPRET OR REPLACE**.
    - Visual risk: **HIGH** if it depicts audit trails, revision history, or explicit technical revocation UI.
    - Highest-priority visual QA target.

14. `liyue-noctia-afterlight-cg.webp`
    - New meaning: Noctia after the vigil, watching the first replies arrive.
    - Semantic status: **STRONG RETAIN**.

15. `liyue-lighthouse-archive-cg.webp`
    - New meaning: Ember Lighthouse sends the final letters outward at dawn.
    - Semantic status: **STRONG RETAIN**.

## Likely art gaps after semantic rewrite

### Priority A — inspect before generating anything
These may already work; do not regenerate until visually checked:
- seven-core-network
- missing-fourth-step
- seventeen-minute-splice
- intercepted-receipt
- echo-ledger
- traceable-revocation

### Priority B — probable new CG opportunities, not mandatory
The rewritten story would benefit from these only if pacing feels visually sparse:
1. **Seven Lamps Extinguish** — F20 climax: three homecoming bell strikes and all seven lamps going dark.
2. **Hall of Ten Thousand Lamps** — only if `echo-ledger` cannot be reinterpreted cleanly.
3. **Letters Leave the Lighthouse** — only if the current lighthouse ending does not clearly show outward delivery.

### Priority C — no replacement expected
- Noctia truth
- Northstar arrival
- Noctia seal
- Noctia/Sovereign confrontation
- missing page
- archive storm
- archive warden entry
- afterlight
- lighthouse archive

## Production rule

Do not regenerate an accepted asset merely because its filename contains old technical terminology. The decision must be based on visible content. A filename can remain legacy/internal while the player-facing story gives the image a new magical meaning.

## Next visual QA pass

For each Priority A image:
1. inspect the full-resolution source;
2. check for literal modern UI / computer-screen language;
3. if absent, mark PASS and keep;
4. if present but peripheral, consider crop/reframe or story recontextualization;
5. only regenerate when the technical visual is central to the composition.
