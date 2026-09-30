# Official browser screenshot review plan

Status: NOT RUN. No browser screenshots exist in this package. Existing PNGs in `assets/` are accepted SOURCE ART, not runtime evidence. No offline composited image may be called a screenshot.

## Authorized runtime

Run on an official CI worker that already has an official Playwright installation and sandbox-capable Chromium. This workspace is known to deny the socket/browser runtime required for local Chromium. Do not retry with `--no-sandbox`, unsafe GPU switches, bypass flags, or a cloud-browser localhost workaround. No dependency was installed for this viewport.

From this directory:

1. `npm test && npm run verify`
2. Set `REVIEW_BROWSER_CI=1`
3. Set `PLAYWRIGHT_MODULE` to the existing explicitly pinned Playwright module's absolute entrypoint (this workspace has playwright-core 1.63.0), or use an official CI lockfile pin. Set `CHROMIUM_EXECUTABLE` to the worker's official `google-chrome` path, typically the result of `command -v google-chrome`. The script never installs software
4. `npm run screenshots`

The script starts its own loopback static server, opens the REAL app with Chromium sandbox enabled, checks errors/overflow, and captures actual page screenshots. It always writes a timestamped report under `qa/browser-evidence/<run-id>/`, including setup failure. It writes PNG evidence only through real browser screenshots. It never uses an image editor or a synthetic scene as evidence.

## Mandatory dimensions and checks

- Desktop: actual viewport 1180×757 at DPR1. Stage is 1180×664
- Narrow: actual viewport 390×844 at DPR1. Stage is 390×701; native-pixel inspection crops/pans around the selected foot pivot, with full-art mode available
- Source art at full frame and 1 source pixel per CSS pixel
- All four UNMIRRORED poses on bright forest stone and dark harbor ground
- Hero hidden for unaltered source-art comparison
- Foot-pivot and crown-height overlays visible and hidden
- B: bridge west, bay, root and any independently frozen route anchors
- C: bridge, underbridge, low door-front, east lower flight, turn, upper flight, top, highwalk, quay as final reviewed adapter supplies
- Upper/under state retains actual surface IDs. No click chooses a floor solely by screen Y
- QA panel open, closed, keyboard focus, long labels, rapid scene switching, repeated hero and mode toggles
- Native view panning must not create document overflow or resize the actor arbitrarily

## What the reviewer must judge from the screenshots

1. Original raster remains sharp at intended scale; no stretch, washed-out CSS overlays or false sharpness upscaling
2. Four-view crown-to-support normalization makes adult body height stable without independent X/Y distortion
3. Boots rest in the painted support area; neutral pose limitations on individual stair treads are not concealed
4. Soft alpha over actual art: no neighbour silhouette intrusion, dark matte, halo, disappearing hair, or unexpected white alpha fringe
5. Original moon clip, left pouch and single scabbard remain on their authored sides; no mirrored pose substitution
6. Bridge/rails/pillars/stair walls occlude correctly ONLY after precise masks are approved. Current package intentionally flags these unresolved cases. Screenshots of incorrect depth are failure evidence, not an accepted final viewport
7. No transparency fade exposes nonexistent floor, no new hidden surfaces, no generated substitute scenery, no generic grid/glyph character
8. Movement uses reviewed route traversal and bounded advance, not selector relocation or free snap. Static reference sliding must remain labelled non-animation

A machine passing tests or producing files does not mark the art/depth accepted. Record human verdict for each screenshot with defects and exact coordinates, then revise metadata/code or request separately authorized art production.

## Failure retention and cleanup

- Desktop and narrow have independent try/catch/finally scopes. A failure in desktop does not skip narrow
- Each failure attempts a real `*-FAILURE.png`, preserves original error stack and state in `*-failure.json`, and records if the screenshot/state capture itself fails
- `browser-results.json` is written after each capture/viewport and always at finalization, including setup failure and blocked viewport records
- Every run has a new directory. No old artifact directory is emptied or recursively removed
- Server SIGTERM executes before browser cleanup. Bounded browser/context close errors are collected separately and cannot replace the primary error
- The process is nonzero on test failure, blocked setup, or cleanup failure; report and partial screenshot artifacts must be uploaded by the official CI workflow with an `always()` condition

Manual review remains required even when the automated capture status passes. Do not translate PASS_AUTOMATED_CAPTURE to art acceptance.

Each real route has separate 0/25/50/75/100% screenshots and routeEvidence records. Every record includes the actual kernel position (cellId/surfaceId/x/y), source-world XYZ with its axis convention, native-art foot pixel, route ID/progress and paused/moving state. The script asserts an actual running route at the start and completed movement at the target; static setAnchor snapshots remain a separate category.
