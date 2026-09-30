# 原画 / 落脚审阅 r3

Isolated Canvas2D static-reference review viewport, repairing local defects found in the98 real r2 Chrome images. It is not a finished game or walking animation.

## Run and verify

`npm test` · `npm run check:locks` · `npm run verify` · `npm run check:manifest` · `npm run serve`

Copy this entire directory to retain all included assets, kernels and frozen navigation data. Node22+ suffices for local tests/server. Official-CI screenshots require the existing pinned Playwright and official Chrome; no new runtime dependency is introduced. This workspace cannot safely launch Chromium, so the new128-image capture is pending. See `qa/PLAYWRIGHT_SCREENSHOT_PLAN.md`.

## What changed

- Original-art redraw silhouettes for the harbor main deck/beam, near/far rails, west cap and lower-stair handrail. Surface qualification plus local physical ray-depth clipping; rail openings stay open. Door remains low street. Open underbridge endpoint remains visible
- Legal interior stair portal selection: lower X11.96 and upper X13.35 within unchanged R7 support domains; west-entry anchor moves along its actual approach plank. Original kernel replay/advance validates paths, with recomputed lengths and unchanged .18m radius/.2m bound
- Routine notices moved into existing footer controls. Stage dimensions remain unchanged; review warnings moved to QA panel
- Focused tests plus128 planned clean, marker-OFF screenshots covering dense stairs, repaired anchor four-way static poses, west-post approach, door/upper depth and forest root UI

Full evidence, coordinates and limitations: `qa/R3-REPAIR-REGISTER.md` and `qa/r3-physical-selection-evidence.json`.

## Frozen identity and navigation

`assets/forest.png`, `harbor.png`, `hero.png` are byte-for-byte original copies. The original hero RGBA, semantic source clip, two-boot pivot, uniform physical scale and camera registration are unchanged. B1.7m projects to96.37px native; C uses the original35m orthographic camera at about70.2px native. No mirroring, repaint, alpha cleanup, body shrinking or image warp was performed.

All source world/profile/anchor/review data and B/C kernel modules are unchanged. The inherited `data/harbor-painted-mask-contract.json` remains the original source contract; r3's proposed local mask status is separately recorded, not retroactively declared accepted. B keeps its three reviewed routes; C keeps named surface-qualified targets. No arbitrary free roam or screen-layer picking is introduced.

## Review controls and evidence boundaries

Select scene and named QA anchor; switch the four original static directions; use full-art/native display, drag native camera, recenter, or toggle the optional QA markers. Anchor selection is a QA relocation. Route traversal is separately recorded through the actual bounded kernel; Escape pauses and tab suspension cannot accrue a teleport budget.

The new masks redraw existing pixels only. They cannot expose hidden floor or make the painting into complete independent layers. No fades, invented ground, new scene generation, contact-shadow concealment, whole-body clearance claim or walk cycle is included. Pier, highwalk, wall and off-route masking remain outside this bounded repair.

Passed here: original byte locks, projection/source-alpha contracts, surface/local-depth logic, rail-hole tests, open underbridge non-occlusion, support-preserving anchor/path validation including 5mm dense sampling, UI DOM separation, JS syntax and unit tests.

Pending: actual r3 browser rendering and visual review of those pixels, both-boot contact at individual painted treads, mask edges/holes, full-body movement and real walking animation. A successful capture run is not visual acceptance. No offline composition is presented as runtime evidence.
