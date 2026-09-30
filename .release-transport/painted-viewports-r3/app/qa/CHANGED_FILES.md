# r3 changes versus untouched r2

Three original PNGs, all frozen data files and original B/C kernel modules are unchanged. This list excludes itself and the release manifest. It is a source-delta index, not browser evidence.

- modified: `README.md`
- added: `adapters/harbor-interior-route.mjs`
- modified: `adapters/harbor.mjs`
- modified: `index.html`
- modified: `package.json`
- modified: `qa/FROZEN_PACKAGE.md`
- modified: `qa/PLAYWRIGHT_SCREENSHOT_PLAN.md`
- added: `qa/R3-REPAIR-REGISTER.md`
- added: `qa/r2-input-sha256.json`
- added: `qa/r3-physical-selection-evidence.json`
- added: `qa/r3-source-preservation.json`
- added: `qa/source-locks.log`
- modified: `qa/unit-tests.log`
- modified: `qa/verification.json`
- modified: `qa/verify.log`
- added: `scripts/capture-plan.mjs`
- modified: `scripts/capture-playwright.mjs`
- added: `scripts/check-source-locks.mjs`
- modified: `scripts/verify.mjs`
- modified: `src/app.mjs`
- added: `src/depth.mjs`
- added: `src/harbor-occluders.mjs`
- modified: `src/render.mjs`
- modified: `src/scenes.mjs`
- modified: `styles.css`
- modified: `tests/core.test.mjs`
- added: `tests/depth-repair.test.mjs`

The new mask source and route selector are self-contained relative modules; no new asset upload is needed.
