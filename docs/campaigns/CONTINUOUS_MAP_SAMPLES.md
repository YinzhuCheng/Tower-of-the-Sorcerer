# Continuous map samples r1

Status: implementation and automated checks passed; deployed browser visual/collision acceptance is pending. This is a sample renderer, not a full-map or final-art release.

## Implemented scope

- A F2/F18/F19: a final renderer owner is installed after V8/V83. Compiled initial door/stair anchors survive token removal. Stone is sampled in one world domain. F18 has explicitly classified low dry cable trenches with continuous cable trees and walk-facing rails; F19 has four cabinet runs distinct from masonry. Existing characters, enemies, items, input, HUD, GAL and save flow remain in their existing pipelines.
- B B07/B09: continuous ground, union boundary runs, two physically separate crossings, anchored bearing seats and visible root/person/public construction. Original enemies are independently retained until the real reducer clears them. All other regions explicitly use the legacy renderer.
- C D01/M03/M05: one runtime hull polygon and similarity transform, 6 m × 3 m, 5:3 deck/berth zoom. Six flush sockets, exactly three state-bound weights and permanent rack bases. The same cargo, winch/shaft, outboard davit/handle, mooring lines and unique gangway are drawn from runtime geometry/state. M03's gate retracts to its side pocket; M05's bad platform remains visibly closed. Other shore regions retain legacy rendering.
- B/C retain 121 accessible buttons over one Canvas viewport with zero gaps, no visible button fills/outlines, one roving tab stop and focus indication. Interaction callbacks are the original walk/request/preview flow. B measures all trailing controls when sizing desktop maps; it keeps a readable minimum and mobile scrolling rather than hiding tools below a fixed-height map. C map/pad/request events now honor existing story/confirmation barriers, matching keyboard behavior; cancellation and repeated confirmation are regression-tested.

## Read-only boundary

`src/rendering` never dispatches actions, changes resources, rewrites maps or adds fields to runtime.spec. Projected passability and visibleWhen come from the existing runtime. Unsupported A/B topology is rejected into explicit legacy fallback. C requires the current identity:

- B contentHash: `a12cd07ee1ccc762`
- C contentHash: `c5a5f809d5548f36`
- C geometry: `C_FERRY_HULL_01`, v1.2
- Visual revision: `continuous-samples-r1`

The texture manifest is independent of save/certificate identity. Six WebP derivatives retain native 1254×1254 dimensions and source/derivative SHA256 metadata. Axis policies follow the explicit 2×2 review: dry stone / rock / earth / water use a global 4T periodic UV as a preview experiment; root bark uses one local continuous domain per root, rotated to its axis; wood repeats only in X and spans the entire structure in Y. C uses one physical wood UV (4.8m X period, full 6m Y extent; estimated 0.2–0.3m plank width), uniformly transformed at both zooms. Preview approval does not certify final seams. A visible geometry-preview notice appears if a texture cannot load.

## Entry points

- `projectTowerScene(state, floor)` / `installSemanticMapRenderer(scene)`
- `projectForestScene(runtime, state)`
- `projectVoyageScene(runtime, state)`
- `renderContinuousMap(ctx, scene, {width,height,dpr})`, returning the same camera's inverse cell lookup
- `presentContinuousScene(canvas, board, scene)` for responsive B/C Canvas and input alignment

Boundary generation removes shared interior edges and merges collinear exposed edges. Concave/convex/T/cross/diagonal cases have explicit tests. Adjacent surface pieces share a single clip path; no tile re-cropping or gutter exists.

## Verification performed

- `npm run check`: exit 0; 670 tests, 661 passed, 9 existing skipped, 0 failed; art validation, main validation, 20F/30F validation and static production build passed
- Final focused suite: 14/14 passed, including pure boundary/UV/camera/state tests, legal B witness variants, legal C certificate states, A final-owner/door persistence, and B/C real-app DOM event/visibility/cancel/repeat/reload tests
- Final `npm run build`: passed
- B independent build validator: 19 reachable static modules/pages, 6 SHA-verified materials, no external dependencies
- C independent build validator: 17 reachable static modules/pages, 6 SHA-verified materials, no external dependencies
- Offline scene geometry rasters were inspected; they are Pillow approximations of scene commands, NOT browser/Canvas screenshots

Logs live alongside the working tree as `continuous-map-*.log`. No local browser was started; the restricted socket/sandbox was not bypassed. No push, deployment, frozen candidate stage, tower-release or tower-story-main change was made by this task.

## Required deployed acceptance

Create a NEW sample stage; never overwrite the frozen candidate stages. The final `dist` contains the A root entry plus `/campaigns-b/` and `/campaigns/`; the independently allowlisted B/C bundles are also available. Deploy the selected new stage, then test real routes/confirmation/GAL, or explicitly identified certificate-restored QA states, at desktop/mobile and 100/125/150% zoom with DPR1/2. Confirm the actual CSS grid/Canvas dimensions match after resize, refresh and restore.

Fourteen B/C witness/certificate-prefix QA snapshots are exported beside the working tree in `continuous-map-qa-snapshots/`; each contains the full replay prefix and reverified final stateHash. They are explicitly labeled restored QA states and must not overwrite live saves.

Required states: F2 door closed/open/stair; F18 main/optional thresholds and trench edge collisions; F19 cabinet ends; B07 closed/person/public with original enemy alive; B09 construction/full bridge; C M03 cargo-left/open-gate/centre; C M05 cargo-right/unload/rebalance/stow/roll; save/reload with narrative barriers.

## Remaining visual work

1. Material scale and repeat joins remain a deployed QA item. Raw 2×2 pages and a Canvas 4T QA page are available separately; only the axis-specific preview policies above are approved. Wood Y repeat and global root-bark repeat remain forbidden.
2. A still mixes the existing hero-v6/ordinary-enemy style with identity-correct GAL-derived named guardians. This work intentionally does not redraw them.
3. B/C use a clearly labeled temporary player location marker, not a newly invented person. Their machines and work objects use deterministic geometry pending canon-derived production sprites.
4. Final equipment style, shadow height, terrain contrast, mobile readability and every deployed interaction remain subject to visual acceptance. This sample must not be described as all 66 regions complete.
