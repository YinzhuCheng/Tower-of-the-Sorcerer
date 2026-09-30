# Narrow layout correction

Scope: only candidate-c-3d-prototype. No publication performed.

Changed runtime source:
- public/campaigns/styles.css: remove pilot's force-natural-height !important overrides; measured square stage; compact but readable toolbar/heading/notice; desktop full-height container and independent aside scroll; mobile page scroll; explicit short-desktop scroll fallback
- public/campaigns/app.js: add one layout import and initialize it after existing rendering; expose a read-only measurement snapshot
- src/rendering/c-viewport-layout.js: new presentation-only observer and pure size policy. Reads actual non-map element heights/margins, section padding/borders, viewport and content width; reserves all chrome. No core/renderer/GPU imports or state mutation

Validation/docs:
- tests/viewport-layout.test.js: seven sizing/observer/source-contract tests
- README.md: records first deployment's actual unsupported-WebGL fallback and true boarding evidence, separates this new layout correction from pending deployed QA
- reports/layout-fix-check.log: 20/20 tests, original 170-action certificate, 39 static files / 32 module edges

Exact deployment increment (relative to dist/):
- campaigns/app.js
- campaigns/styles.css
- src/rendering/c-viewport-layout.js (new)
- build-manifest.json (build timestamp refresh, same content/core/geometry identity)

Core hash unchanged: e280d14000ddd35b9812fa83a6b97d160a831c3951a6a5a4694285bc8014b698
Content identity unchanged: c5a5f809d5548f36
Geometry ID unchanged: C_FERRY_HULL_01
Three renderer and WebGL failure controller unchanged.

Next browser check at 1180×757:
1. Normal fallback; entire map, directions and notice fit without document scroll; right sidebar scrolls independently
2. Read window.__C_LAYOUT_QA__.snapshot(); require mode desktop-fit, square map, map/control/notice bottom <= viewport height and no horizontal overflow
3. Retry resize / 125% browser zoom / long fallback text; if actual chrome cannot leave 352px map, explicit desktop-scroll mode must preserve readable map rather than clipping
4. Mobile 390×844: one column, full document scroll, no independent right-scroll trap
5. Board from initialState normally again and check state/resource preservation. All 3D visual/performance checks remain pending because WebGL2 is unavailable in the current cloud browser

No claim of corrected-deployment browser success is made here.
