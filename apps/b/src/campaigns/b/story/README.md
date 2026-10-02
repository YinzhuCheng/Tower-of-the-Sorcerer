# Forest B: frozen prose → authoritative GAL

This module compiles frozen full text 1.1, outline 1.2 and the road-semantics contract. All 94 authored subscene IDs (b01–b30) and all 921 body paragraphs have a classification/provenance ledger. There are 858 player-facing turns; choices and production directions are data, never narrator speech.

## Use

Create `createForestStory(runtime)` with the same `forest-b` runtime that owns gameplay. Call `location(state, {seenIds})` at initial load and restored location; after a successful game action, call `fromDispatch({stateBefore,stateAfter,events,receipt,seenIds})`. Keep returned `seenIds` in a presentation-only sidecar scoped by `runtime.identity`. Repeated calls deduplicate individual source turns. Rejected, forged or edited receipts return no scenes.

- `resolve(sceneId,state,options)` reads a scene without changing state. Dot fragments may specify branch and phase, e.g. `b07_choice.root.fixed`
- `response` selects a purely conversational response or an uncommitted defer/return. It cannot invest, fix a road, seal heat, select the gameplay ending or award anything
- `revisit` supports the five authored revisit nodes, including insufficient heat and fixed-but-unbuilt roots
- `budget`, `routePanel`, `actionPanel`, `checklist` use the active runtime's amounts, previews, battle reducer, operations and requirements
- `epilogue` reads the actual frozen warm mask and actual ending. Both ending operations stay in gameplay; review mode is an explicitly labeled reading tool, not an unlock

Gameplay choices expose actual actions with expected revision; the UI must dispatch those actions through the common reducer and pass the successful receipt back. A narrated action is a report of a transaction, never a second resource write.

## Fact boundaries

Root fixing and public construction have separate fragments. Original-route battles do not finish construction. The first valve and insulated pipe are distinct; the fourth valve does not claim the later water-flow test. B24 cannot retroactively gate B23. B26's early readiness operation does not narrate the later meal, drawer, dinner delivery or key handoff. The boss dying does not turn the main valve. The tea/box-lid packing is reported only after its own operation.

Two minimal, traceable boundary adaptations are used when real state exceeds a source's usual branch: B-EDGE-001 removes active-enemy claims if the player already cleared that original path before completing a root route; B-EDGE-002 stops an uninvested lodge's revisit from offering to reopen a sealed heat plan. Original prose stays in the source ledger and in each adapted turn's metadata.

## Art and weather

Six accepted canon portrait identities only. All environment and CG references are semantic `B_ENV_*` / `B_CG_*` asset IDs pending forest-art review; URLs remain null and legacy tower fallback is forbidden. Noctia's B20 voice stays at the far end of the fixed speaking tube. Snow exteriors use empty shots and offscreen voices, with no unapproved light-clothes standing art. The two-day, sixth-day, fourteenth-day and weeks-later transitions remain authored events; reading, movement and visits do not advance a weather clock.

## Reading exports and verification

- `reading/resolved-all-scenes.md/json`: actual resolver output, including all mutually exclusive alternatives, marked as review-only
- `reading/resolved-heat-relationship-combinations.md/json`: seven legally attainable warm masks × both endings; each comes from a complete real new-game witness
- `reading/b-normal-*.md`: all 16 existing numeric certificates replayed through the same runtime and receipt-based GAL adapter; conversation choices are explicitly the first response
- `reading/resolved-certified-routes.json`: source certificates, identity, final state hashes and story-bearing receipts
- `reading/resolved-responses-and-revisits.md/json`: both conversational responses, defer/return, and real revisit checkpoints

Commands:

    python3 scripts/build-b-forest-story.py
    node scripts/export-b-forest-story.mjs
    node --test test/campaign-b-story.test.js test/campaign-forest.test.js test/campaign-kernel.test.js

The reading exports certify logic/prose integration only. They do not certify finished forest art, final three-difficulty balance, visual UI acceptance or deployment.
