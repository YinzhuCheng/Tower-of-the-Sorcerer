# r3 targeted real-browser evidence plan

Status: **NOT RUN for r3**. No actual browser screenshots are included here. Source PNGs and read-only source trace inspection are not runtime evidence.

Use the existing official CI runner with its pinned Playwright installation and official Google Chrome, `chromiumSandbox:true`. This local environment cannot safely launch Chromium. Do not retry no-sandbox, unsafe GPU switches, cloud-browser localhost, or offline compositing.

From the self-contained package:

1. `npm test && npm run check:locks && npm run verify`
2. Set `REVIEW_BROWSER_CI=1`, `PLAYWRIGHT_MODULE` to the runner's existing pinned module (the prior official run used playwright-core1.63.0), and `CHROMIUM_EXECUTABLE` to the official browser path
3. `npm run screenshots`
4. Always upload the timestamped `qa/browser-evidence/<run-id>/` report and its real PNGs, even on failure. Keep root's existing <=12MiB sharding transport

The browser script alone starts the local server, drives the actual app, captures PNGs and records current kernel cell/surface/x/y plus physical XYZ, projected foot, camera, active occluder IDs and route progress. It does not install dependencies or interpolate images. Captures are append-only. Both viewports are attempted independently, failures retain state/raw error/real failure screenshot when possible, and server teardown precedes bounded browser cleanup.

## Matrix: 64 × 2 = 128

Desktop1180×757, narrow390×844, DPR1; unchanged stage heights664/701. Desktop uses frame mode; narrow uses native source-pixel mode for playfield evidence. Original-art frames hide the hero. ALL playfield captures have foot/anchor/mask markers OFF.

B: 11 per viewport
- original full art1
- root/bay/upper front footing3
- root back/right/left3 (front already above)
- root→bay actual route at0/50/100%3; start notice must be visible only in controls
- QA panel1

C: 53 per viewport
- original full art1
- door/bridge/west_entry/lower-flight/upper-flight/underbridge/turn/top/foot front anchors9
- back/right/left at door/bridge/west_entry/lower-flight/upper-flight15 (front already above)
- actual foot→top folded stair route at0/5/10/15/20/25/30/35/40/45/50/60/67.5/75/82.5/90/95/100%18
- bridge→underbridge actual route at0/25/50/75/100%5
- west_entry→bridge actual route at0/5/10/100%4
- QA panel1

## Acceptance focus

- Door keeps low_public, with bridge deck/front rails truly in front; hidden ground stays hidden
- Upper bridge gets thin near-rail/post occlusion and real transparent holes, no blanket deck
- West approach endpoint clears the cap and the early route crossing does not paint through it
- Lower boots lie in tread interiors, not on the near handrail; upper boots clear the front lip
- Lower flight → middle turn → upper flight → top retain their real separate surfaces/heights
- Known open underbridge endpoint remains unobscured
- Forest mobile root start feet stay visible even with a route notice
- No obvious mask-edge slices, omitted rod pieces or original-pixel rectangular holes through body
- Four directions remain static neutral references. No animation or full-body collision approval follows from these stills

`PASS_AUTOMATED_CAPTURE` only means the capture assertions passed. Human pixel review is mandatory for static visual acceptance. Additional marker-ON or mask-debug evidence can be requested later; it must not replace the clean 128-image pass.
