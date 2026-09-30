# Candidate C fixed-view 3D / 2.5D prototype

## Decision and status

Conditional GO for a small optional presentation pilot. This is the **same Candidate C campaign**, not a fourth story, difficulty or numeric variant. A/B remain 2D and were not edited. This package is isolated from `tower-campaigns` and all frozen preview stages.

**Not promoted.** Node geometry/state tests and a static build pass. No Vercel browser visual QA, WebGL execution, measured GPU/frame performance, screenshot, or mobile usability pass has been claimed. Local preview sockets were not attempted or bypassed. The next gate is authorized Vercel preview and real browser testing.

## Run / build

- Node 22+ recommended; standard npm
- `npm ci --ignore-scripts` (use a workspace-local or `/tmp` npm cache if the default home cache is unwritable)
- `npm test`
- `npm run build`
- Publish **only `dist/`** to a permitted static preview, then open `/campaigns/`
- No backend, runtime CDN, paid package, telemetry, physics, WebGPU, authentication or new subscription
- `node scripts/report-route.mjs` regenerates reached-state evidence from the real certificate, not state fixtures

The output is a self-contained static package. The archive includes the exact locked dependency metadata and a ready-built `dist` (with local Three modules and MIT license). No install is needed to host that built output. It also includes source and tests but omits `node_modules`.

## Rules and save boundary

`contentHash c5a5f809d5548f36`, content `c-rules-prototype-v1.2-geometry`, rules `fixed-campaign-v1.1`.

All campaign content, fixed combat, solver, planning, story and core files are copied byte-for-byte from the existing C development package. `reports/source-snapshot.json` records the input checksums. Tests compare the copies to those checksums. The renderer is a sidecar; it never adds fields to runtime.spec or saved engine state.

Existing story/choice modals, planning forecasts, resource confirmation, atomic actions and 170-action certificate replay remain owned by the original C UI. Every action reads `preview` before `dispatch`; interactions continue to be enumerated through the core's `inReach` logic. Device label clicks walk to the `interactionAt` stand only, then the player explicitly uses the existing action panel. No animation completes a gameplay action, no frame updates state and no killed machine respawns.

Saves use a prototype-specific storage prefix so this trial cannot overwrite an existing C 2D playthrough. Switching 2D/3D within this page keeps the same state and save namespace. No fixture injection, arbitrary region teleport, free resources or skip-to-flag control exists. The current UI distinguishes actual player play from certificate replay. Replay starts at `runtime.initialState()` and checks every before/after hash; it does not save into player progress.

## Minimum scope implemented

1. Same initial shore state and ordinary boarding route. From new game, after the opening text, move left from (7,7) to (6,7) and choose the core's “经唯一跳板登船” action. It lands at D01 (7,7) through the original transition.
2. Exact single 6m x 3m hull from authoritative JSON/OBJ; one metre coordinate system, fixed orthographic camera, no orbit controls or physics. Physical camera zoom is uniform. M04 is yaw 180° with positive determinant, not a mirror.
3. True six low sockets, three unique weights of 1/1/2, three permanent reserved racks, one actual cargo lamp-seat box with straps, under-deck hatch and stern tiller. No decorative sword rack.
4. M03 real winch body/shaft/handle and bow-side cable, visible only when current dock and cargo state expose it. The same floating gate translates into a side pocket; its length is unchanged.
5. M05 in-hull davit foot, rigid bracket, outboard housing, continuous forward shaft/handwheel, mast/boom/bracing and hoist rope. Raised/stowed and onboard/ashore cargo follow actual state. The outboard UI anchor is never rendered as a freestanding platform or separate controller.
6. Two independent fairleads/bollards and two outside main ropes, present only while actually moored. A distinct stern shuttered signal. Exactly one plank gangway with clear rail opening. The quay edge leaves a narrow water gap; the coarse (6,7) boarding sample is covered by the boat/gangway, not a broad stone shortcut.
7. Three local, nonrepeating material textures (this snapshot intentionally predates the subsequent 2D axis-specific repeat experiment); shader UVs use one world domain per surface family. No per-cell texture reset. No unapproved repeated seam claim. Reused 2D compositor retains all six approved world-sample assets.
8. Immediate 2D button, automatic initialization failure/context-loss fallback, no renderer state stored in core. 2D retains the original actual action UI and semantics.
9. Explicit positional 璃 / 角色图待换 marker. No unfamiliar character was generated or inferred. Small enemy geometry is explicitly provisional machinery. This is a geometry/material pilot, not final character art.

## Shared interface with continuous 2D

The package snapshots `src/rendering/c-adapter.js` and `continuous-map.js` from the 2D worker. `buildViewModel(runtime,state)` directly reuses `projectVoyageScene` semantics where supported (D01/M03/M05). It reuses exported `VOYAGE_VESSEL_GEOMETRY` and `voyageDeckToVessel`, never its own second ship dimensions.

- `buildViewModel` returns immutable-by-convention read-only display data, not game actions
- `createThreeScene({canvas,labels,runtime,onPick,onFailure,onStats})`
- Scene exposes `refresh(state)`, `pickTile(clientX,clientY)`, `projectTile(x,y)`, `setActive`, `setLabels`, `stats`, `destroy`
- `onPick(x,y)` emits a logical cell; the UI forwards it to existing pathfinding/atomic actions
- `metricToCell` and `pickLogical` are pure projection functions; all 121 cell centers roundtrip under each tested view/aspect
- Non-sample shore views use the same rules-derived quay/hull blockout, clearly unpromoted

Foot, housing, handwheel and safe stands use the authoritative physical coordinates. The mast/boom height, tube diameters, cutaway rail height and narrow quay visual inset are provisional presentation design values, not facts claimed from the story and not new collision rules. They require visual review.

The 3D adapter never gives the old 2D hit-grid an oblique shape. That grid is hidden from pointer input in 3D; the camera plane maps to the canonical logical coordinates. Keyboard and ordinary action buttons are shared. DOM semantic labels are explicitly UI overlays, not new physical equipment.

## Validation delivered

13 Node tests cover:

- Exact rules/content identity and full 170-action winning certificate replay
- Byte-identical core/combat/solver/planning/story/content source snapshot
- InitialState → left move → ordinary boarding, revision=2
- All 171 sequential reached states projected without mutating state
- Three weights and six slots, plus all 120 unique assignments
- Full 121-cell camera project/pick roundtrips for all visited views/docks at four aspect sizes
- All walkable deck cell centers inside the fixed viewport, including narrow portrait geometry
- Physical JSON/OBJ identity, 6:3 dimensions, support and operator anchors
- True-state M03 winch/M05 davit visibility and stowing
- Wrong winch stand rejected by `inReach`/`preview`
- M04 rigid yaw and positive determinant
- Exact Three MIT version pin, visible fallback, prototype save isolation

These are geometry/core/source checks. They do not imply GPU or visual acceptance. See `QA_CHECKLIST.md` for the browser gate and exact replay steps.

## Performance assumptions

The scene redraws on accepted state changes, resize, or label/view changes, not in an endless requestAnimationFrame loop. Static hardware uses modest low-poly cylinders/boxes. There are no shadow maps, postprocessing, realtime water, bloom, per-pixel transparency sorting effects or skeletal characters. DPR is capped at 1.5 and texture anisotropy at 2. Only 3 texture images are uploaded to 3D (1254² each, about 24 MiB including mipmap overhead); the material cache owns them once. Mesh geometries are disposed on scene rebuild; materials/textures are disposed when the view is destroyed.

The on-screen diagnostics show draw calls, triangles, texture/geometries counts and **CPU command-submission time only**, explicitly not GPU frame time. The ready static build is ~4.1 MiB uncompressed (Three modules ~2.0 MiB); no estimate is a measured mobile performance result. Suggested go/no-go: no more than ~250 draw calls or 60k triangles for these samples, no growing GPU resource counts after repeated refresh/view changes, input remains responsive, median post-input visual response <100 ms and p95 <200 ms on target mobile hardware. Measure actual transfer/gzip, first ready time and context-loss fallback in Vercel QA.

If WebGL support, input precision, camera framing, rope/rail occlusion or performance fail, retain 2D and do not promote this view.


## Narrow viewport correction v0.1.1 (2026-09-30)

The first real cloud-browser check of deployment `a082c251183d8abbbc4c62db884e37ab4a607332` reported `WebGL2 unavailable`, correctly disabled 3D and kept 2D playable. The release owner actually moved M01 (7,7) → (6,7) and used the normal boarding action to D01, with HP60/60, ATK14, DEF8, gold8 and fuel9 unchanged. This verifies fallback/boarding on that earlier deployment, **not 3D visual/performance acceptance**.

That browser's 1180×757 screenshot also exposed a regression: the pilot's natural-height CSS pushed the map bottom and movement buttons below the viewport. This correction removes those overrides. `c-viewport-layout.js` measures the real header, section padding/border and all non-map children (including renderer controls, fallback message, diagnostics and notice), then gives the map one shared integer-cell square size. Desktop uses a full-height left region and independently scrolling right sidebar. Mobile uses full-document scrolling. A short desktop scrolls rather than shrinking below a 32px logical cell pitch. No content, core, renderer, GPU settings or story/choice logic changed.

20 tests now pass, including seven layout budget/source-contract tests. Their 1180×757 geometry fixtures are **modeled measurements**, not a new deployed screenshot. The corrected deployment still needs release-owner browser recheck. Read-only `window.__C_LAYOUT_QA__.snapshot()` returns the actual map/control/notice/sidebar rectangles, measured inputs and viewport-fit result to support that check. No local socket or GPU-security workaround was attempted.
