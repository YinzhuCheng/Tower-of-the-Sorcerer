# 失落魔法阵：少女魔塔 · historical A core

This playable recovery is pinned to main `661296d3df912539f14f300442d962ba6c462541`. It is **not** the missing newer A338 story/art rewrite. No new narrative, balance or art was invented during recovery.

## Run and validate

Requires Node.js 18+ and Python with `Pillow==12.3.0`. No npm dependencies are required.

```sh
python3 -m pip install -r scripts/requirements-art.txt
npm run check
npm run build
cd dist
node ../scripts/dev-server.mjs --port 4173
```

Open `http://localhost:4173`. The original build applies release patches and produces the ten-floor demo. Source also retains the base, 20-floor and 30-floor campaigns and their authoritative route validations. Source-dev and production are intentionally different.

`npm run check` fully decodes shipped raster images, verifies current atlas pixel provenance, runs current gameplay/UI/solver regression tests, proves the base campaign, validates the 20/30-floor campaigns, and builds the production release. The build verifies an authoritative ten-floor winning replay and bounded difficulty margins. Nine original expensive/research skips remain explicit; skipped checks are not claimed as passed.

## Core boundary, revision 2

Only runtime modules and transitive current build/validation dependencies are included. The supported GAL-only player, active loaders, image fallback resources and current gameplay tests remain. A frozen runtime payload fixture checks all shipped asset bytes and detects undeclared additions.

Historical production reviews, rejected/working artwork, source-document manifests, superseded assets, transport notes, review-only contact sheets, and unrelated solver/analyzer experiments are preserved in the separate QA/Library package. The unchanged historical harness remains reproducible there and passed 522 tests with 9 original skips; it is distinct from the smaller current-core suite. No external symlink or private fixture is needed for core checks.

This build does not imply browser/visual acceptance, publication or deployment. See LICENSE and THIRD_PARTY_NOTICES.md for licensing.
