# Frozen viewport package r2

Freeze scope: isolated art/footing review implementation, 2026-09-30. No core game edits, remote publication, deployment or browser launch occurred here.

## Copy

Copy the entire `painted-scene-viewports-r2/` directory. Runtime, Node tests, review documents, original PNGs, fixed navigation data and kernel adapters are self-contained. All relative JS imports and fetch paths remain inside this directory.

The unchanged C `adapters/harbor-kernel/source-adapter.mjs` imports `../kernel/navigation.js`; that resolves to included `adapters/kernel/navigation.js`, which imports included `adapters/kernel/geometry.js`. It has no dependency on the original workspace's C folder. B's original locked route adapter resolves only its included forest-kernel siblings.

Node >=22 is sufficient for local tests, verification and the static server. Optional read-only Python pixel-analysis scripts require the already-available Pillow/Numpy/Scipy stack; CI screenshots and runtime do not use Python. Source analysis falls back to the included original bytes if the larger production workspace is absent.

Playwright is an external CI test dependency, deliberately not installed or vendored in this package. Pin official `playwright-core@1.63.0`, point `PLAYWRIGHT_MODULE` at its `index.mjs`, and `CHROMIUM_EXECUTABLE` at existing official `google-chrome`. Launch uses `chromiumSandbox:true` and no custom/unsafe browser switches. No browser download is needed.

## Screenshot matrix

Exactly 98 planned screenshots in a successful capture run, plus up to two actual failure screenshots if a viewport fails:

Per viewport:
- B: original frame 1 + named footing anchors 3 + four native-alpha/pivot views 4 + two routes × five progress points 10 + QA panel 1 = 19
- C: original frame 1 + named footing anchors 14 + four native-alpha/pivot views 4 + two routes × five progress points 10 + QA panel 1 = 30
- Total 49 per viewport × desktop1180×757 and narrow390×844 = 98

Route captures use actual app/kernel advancement, then actual browser screenshots. They are not offline image compositions. Estimated capture runtime is roughly 2–5 minutes on a typical official CI worker, excluding checkout/install/upload. This is an estimate; no local Chromium measurement was performed. Reserve 10 minutes for capture so a slow worker can retain failure evidence instead of being killed prematurely.

All art/depth acceptance remains pending screenshot inspection. The current mask registry is empty because reliable layers are not yet authored. Do not call a passing capture run polished-game, walk-cycle, painted-mask or occlusion approval.

## Freeze discipline

`MANIFEST.json` inventories every file except itself with size and SHA-256. Check it after copying/transport. Do not mutate this r2 package after freeze; corrections belong in a separately versioned package so the official CI artifact can be tied to exact input bytes.

R2 adds explicit 0% route-start screenshots, actual kernel position and source-world XYZ in every browser state, a per-route start/mid/end evidence record, and the moon-clip wording correction. R1 is retained unchanged for provenance and is superseded.
