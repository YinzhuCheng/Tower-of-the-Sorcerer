# Frozen viewport package r3

Scope: isolated local-depth and legal-footing repair for actual r2 visual defects. Original r2 is retained unchanged. No production repository, publication, push, deployment or browser launch occurred in this repair.

Copy the full package directory; it is self-contained and has no runtime imports from the surrounding workspace. The unchanged original B/C kernel and frozen source data are included. `npm test`, `npm run check:locks`, `npm run verify` and `npm run check:manifest` require only Node22+.

Three original PNGs are identical to r2. `qa/r2-input-sha256.json` inventories the untouched baseline. `qa/r3-source-preservation.json` records the external r2 comparison plus frozen copied files. `qa/R3-REPAIR-REGISTER.md` explains the local masks, physical support choices, proof scope and pending visual gate.

Official browser dependencies are external and unchanged from the successful r2 QA setup. The r3 plan contains128 genuine browser captures; see `qa/PLAYWRIGHT_SCREENSHOT_PLAN.md`. No r3 browser screenshots are claimed here.

`MANIFEST.json` lists every package file except itself with size and SHA-256. Freeze after final tests. Copy and transport checks must compare this manifest. Do not modify the frozen r3 after QA starts; if more repair is needed, use a new revision.
