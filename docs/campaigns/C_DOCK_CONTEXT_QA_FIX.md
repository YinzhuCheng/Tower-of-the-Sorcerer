# C dock-support regression repair

## Trigger and evidence boundary

The actual cloud-browser screenshot `runtime-playtest/c-continuous-first-deck.jpg`, taken at 1180×757 after normal M01 boarding in deployed commit `e9d35da67923f57b02c1d19f71b4fd1f2fb1d657`, exposed a missed spatial defect: D01 showed the gangway's shore end and two mooring-line ends over visible water, with no quay or shore bollards. Earlier automated hull/slot/state tests passed but did not test off-ship support context. They were insufficient evidence for this scene.

This patch is built in the isolated `tower-c-dock-support-fix` tree, reconstructed from the frozen release overlay and its base. It does not change live B/A trees, old stages, runtime rules, geometry identity, save namespaces, action IDs, source prose, planning or certificates. New browser acceptance remains required after publication; the offline images are scene-command approximations, not Canvas/browser screenshots.

## Display-only change

- Resolve the current berth from `boat.dock` while viewing D01. Read its actual map and project its existing 27 shore/solid cells through the same metric berth/deck transform.
- Exclude the authored `(6,7)` gangway approach sample from solid quay terrain. It remains represented by the same unique gangway and existing rule transition.
- Use a conservative west-facing contour 0.25m inside existing quay cells. Hull edge is berth X=6.5, quay edge X=6.75, existing walk centre X=7 remains supported. This is a visual inset within authored terrain, not an added cell/platform or a new navigation path.
- Render both fixed shore bollards in both views even before mooring. When the state is moored, line endpoints are exactly the contract fairleads and the same projected bollard centres.
- Give the existing gangway visible ship-side and quay-side bearing strips. Its contract centreline and 0.45m width are unchanged.
- D01 remains 42 connected ship-floor cells. Context-only shore controls say “岸上，请经唯一跳板返回当前泊位”, show that explanation on click, and never dispatch movement or traversal. The original gangway entity/action still owns returning to shore.
- Project the same existing M05 rollway and single unloaded cargo onto the now-visible quay. Cargo is drawn above its support rollers and still derives from the real cargo state/shore action anchors; no duplicate cargo or new work item is created.
- Apply only C's plank-scale correction: 4 deck cells × 0.6m = 2.4m per source image, with approximately 8–9 visible plank columns, about 0.27–0.30m each. Berth UV is multiplied by 0.6. Y spans the same whole 6m hull with no repeat. The former 8-cell/4.8m “0.2–0.3m plank” description was arithmetically wrong. Native PNG and runtime WebP bytes are unchanged.

C visual revision: `continuous-samples-r1-c-dock-support-r2`. Rule content hash remains `c5a5f809d5548f36` and geometry ID remains `C_FERRY_HULL_01`.

## Packaging

Apply the provided source patch to branch `candidate/c-night-harbor` at exact base `e9d35da67923f57b02c1d19f71b4fd1f2fb1d657`, tree `eb47681b812ec7256e2f467a9bda16694aa6a72b`. The source archive/manifest lists eight changed/new files. No new dependency, image file, route or build-list addition is needed: the existing C compositor and build allowlist already package the changed adapter, material metadata and app.

The new standalone stage is `candidate-c-dock-support-stage`, built through the unchanged C build pipeline. The publisher owns publication; this task does not push or modify any prior stage.

## Verification

- 25 focused tests: current-dock cell provenance; identical rigid projection; supported mooring endpoints; persistent bollards; gangway support and water gap; unchanged 42-cell navigation/state/spec; truthful shore labels/click behavior; existing portal exit; wood UV and source hash; all three frozen victories; existing C visibility and dialog/cancel/reload regressions
- Full isolated C `npm run check`: 559 tests, 550 passed, 9 existing skips, 0 failures, plus validation, 20F/30F checks and static build
- Dedicated v1.2 geometry and story validators: passed, all three certificates and both epilogues retained
- Standalone build closure: 17 modules/pages, six unchanged SHA-verified materials, no external dependency

Final logs and exact file hashes are in the companion change manifest. After deployment, repeat M01→D01 at 1180×757, D01 and berth M03/M05, both mooring states, gangway return, 100/125/150% zoom and mobile. Inspect the visible water gap, each rope/shore-post contact, crate/rollway stacking and labels. This repair does not certify the other samples or all-map visual acceptance.
