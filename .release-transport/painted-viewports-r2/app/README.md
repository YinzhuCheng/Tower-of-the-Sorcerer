# 原画 / 落脚审阅

An isolated Canvas2D review viewport. It uses the accepted B/C raster scenes and the original RGBA four-view hero reference. It does not modify a core game, publish a site, add game rules, invent a boat, or claim to be a finished game.

## Run

`npm test` · `npm run verify` · `npm run serve`

Open the local address printed by the server in an authorized browser runtime. No new packages are needed to render the viewport or run its Node unit tests. This execution environment cannot safely run Chromium; browser screenshots are explicitly pending official CI. Read `qa/PLAYWRIGHT_SCREENSHOT_PLAN.md`.

## Review controls

- Top: original forest / harbor scene selector; collapsible review panel
- Bottom: explicitly named QA anchor relocation and four original neutral views
- In the art: hero visibility, full-art/native-source-pixel mode, recenter
- Drag native-pixel view to inspect original art; narrow screen starts at native scale around the foot pivot
- Optional foot contacts, adult-height guide and anchor overlays are off by default
- B exposes only its three frozen named routes; C exposes physical navigation between explicit visible named QA targets. Arbitrary free roam and unqualified screen/layer picking remain disabled

The anchor selector is a QA relocation, never a traversal demonstration. The “路径” control reveals named targets to click. The review panel can pause or bounded-step a route; Escape pauses, and tab suspension cannot accrue a teleport budget. Four neutral poses are not an animation; no bob, mirrored frame, or fake walk cycle has been created.

## Fidelity

`assets/forest.png`, `harbor.png`, `hero.png` are byte-for-byte copies. `qa/source-integrity.json` retains exact source paths and SHA-256. Backgrounds are never nonuniformly stretched. Rendering samples the original hero RGBA using source rectangles plus a sheet-space vector clip. The back/right clip has 13 vertices and stays in a measured zero-alpha corridor with a 5×5 empty neighbourhood. It preserves all four major alpha>16 components with no neighbour component inclusion. That threshold is used ONLY in read-only measurement, never as the rendered alpha.

Each pose is scaled uniformly from an explicitly measured crown-to-support-pivot height. Two original boot contacts define its support pivot. These are inspectable QA measurements, not final sprite or animation acceptance. Original alpha252–253 interiors and low-alpha edge/noise are preserved for actual-background review.

B: 1.7m adult projects to 68px in the 1180×664 registration, 96.37px in the original 1672×941 art. C: original 35m orthographic camera produces about 70px native adult height, around 47px when fitted into the desktop stage. It is not arbitrarily enlarged to match B. Native mode makes both easy to inspect. C's art registration uses an aspect-preserving 1586×991.25 fit and 0.375px vertical offset.

## Depth is deliberately not faked

The renderer supports surface-qualified original-art redraw masks. There are currently no approved masks in its registry. Underbridge, doorway and folded-stair views visibly warn that occlusion is unresolved; the review panel identifies each missing group. The app does not fade the bridge, invent occluded floor, imply it has independent cutout assets, or use global Y sorting. Original-art visual matching, foot placement at every individual tread, and background-aware soft alpha require actual browser review.

## Evidence boundaries

- Passed: source identity, native image measurements, semantic clip separation, numerical source-over sanity on actual background texels, projection/size/transform math, source-safe draw contract, B frozen-route integration, C frozen physical-target integration and same-screen layer rejection, bounded movement, surface-qualified mask gating, JavaScript syntax
- Pending: actual browser rendering, desktop/mobile screenshots, human alpha/footing/depth acceptance, complete authored mask layers and final animation
- No screenshot is claimed until the official browser script has run and produced real screenshots

See `qa/verification.json`, `qa/unit-tests.log`, `data/hero-views.json`, and the screenshot plan. Source PNGs are never evidence of how the app rendered.

## Navigation acceptance boundaries

B uses the unchanged locked `painted-path-review.js` and exact reviewed world hash. Only root→bay, bay→root and west bridge→bay are available, using a fixed open-route review fixture. No game-state effects are read or written. Whole-domain painted edge clearance did not pass; local route mask uncertainty, exact tread height and art occlusion remain inconclusive.

C uses the unchanged frozen physical adapter, world and anchor hashes. Its .18m footprint and .2m step bound are retained. Only explicit visible named targets are offered, with original kernel path/advance authority. Physical support verification is not a painted walking mask, body-envelope acceptance or depth acceptance. Offscreen old-street anchors are deliberately omitted from this art window.

All browser screenshot outputs are per-run, append-only folders. Both viewport attempts continue independently after failure. Failure screenshot/state/raw error and a final status report are retained whenever technically possible; missing screenshots are explicitly recorded. Cleanup errors cannot overwrite the original error or prevent server termination.

Frozen r2: captures 98 actual-browser review images on a successful run. Each actual route includes 0/25/50/75/100% checkpoints, full kernel position/surface and source-world XYZ. R1 is preserved unchanged and superseded.
