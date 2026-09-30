# C geometry v1.2: same vessel in berth, deck and GAL

## Result and ownership

The one-hull blocker is closed in development. The working source is `src/campaigns/c/content.js`; immutable identity is `voyage-c / normal / fixed-campaign-v1.1 / c-rules-prototype-v1.2-geometry`, content hash **c5a5f809d5548f36**. Frozen r3 remains `f56a71f169fbe102`; its 26 staged files match the original SHA manifest exactly.

This increment changes C content/geometry, geometry verification, C certificates, and the parent-requested one-line C map visibility filter (with a real-app DOM test). It does not change shared kernel, fixed combat, A, B, story prose, difficulty tuning, or any publication stage. The updated development preview certificate matches the new content; no new preview package was frozen or uploaded.

## Geometry

- One `C_FERRY_HULL_01`: 6m length, 3m beam, 10 vertices / 16 triangles, closed oriented mesh
- D01 point to physical X/Y/Z: `[0.6(x-5), 0.8, 0.6y-2.7]`
- Physical point to berth grid: `[5+X, 5.5+Z]`
- Full ship envelope still matches original 3×6 berth occupancy, x3.5..6.5 / y2.5..8.5
- D01 walkable workdeck is x3..7, y1..9 minus three permanent rack cells (3/5/7,3): all 42 cells connected, zero outboard standing
- Every adjacent navigation edge was swept against the real hull outline and all three rack footprints with a 0.18m actor radius
- Six sockets/cargo/observer/winch/helm/arrival retain semantics. Slot physical lever arms are a uniform 1.2m multiple of the exact existing normalized balance rule
- Davit body remains (8,3), connected forward handwheel is (8,2); only stand (7,2) operates it, outside right-cargo footprint. Explicit in-hull foot at (1.35,0.8,-1.25) is clear of cargo/operator, then rigid bracket and shaft connect the assembly
- Gangway is one continuous physical corridor. Deck stand/trigger map to berth (6.2,7)/(6.8,7), both within the same (6,7)→(7,7) plank
- Winch cable avoids operator and observer. Main mooring cables have two real support points and shore endpoints, separate from the signal lamp
- Old sword prop at (2,7) is retired. Source only requires putting it safely aside; default is no visible new rack. No floating optional fixture

Both boat (X starboard/Y up/Z stern) and 3D world (X east/Y up/Z south) use right-handed coordinates. The ship bow is negative Z. Tests prove positive determinant at yaw 0/180/53; the M04 pose cannot become a mirror.

The C map previously rendered all entities regardless of `visibleWhen`. `public/campaigns/app.js` now calls the same `runtime.meets` condition checker before choosing a tile glyph. The actual app render was executed in a DOM double at all five berths: future winch/davit/mooring operations are hidden and current ones and the gangway remain visible. This is wiring evidence, not browser visual signoff.

Metric blockout, source-line provenance and art constraints are in `../candidate-c-art-plan/geometry-and-camera-contract-v1.2.md`. This is not final artwork or real-time physics.

## Art handoff

Start with `../candidate-c-art-plan/C_ART_MINIMUM_MAPPING_V1_2.md` and `current-geometry.json`.

Minimum reusable files:

1. `vessel-hull-v1.2.obj`
2. `vessel-physical-geometry-v1.2.json`
3. `map-space-contract-v1.2.json`
4. `world-schematic-v1.2.json`
5. `geometry-and-camera-contract-v1.2.md`
6. `qa/vessel-map-correspondence-v1.2.png` and the corresponding SVG

The PNG was actually opened and visually checked after removing an initial label overlap. Both diagrams use the same metric hull; they are layout evidence, not accepted production art. Existing background/CG packets retain their historical references; production must apply the v1.2 geometry overlay rather than the old 7×9 working rectangle. Other world/story/canon facts remain unchanged.

## Replay and resource invariance

| Real initial-state route | Atomic actions | Final HP | Fuel | Bypassed enemy |
|---|---:|---:|---:|---|
| short / short | 170 | 29/72 | 1 | none |
| short / bypass | 163 | 54/72 | 0 | machine2 alive |
| bypass / short | 167 | 47/72 | 0 | machine1 alive |

All actions pass the same runtime dispatch used by UI. New initial/final/action hashes are recertified; old checksums are not reused. Each route reproduces all 20 story scenes and both epilogues without a story resource write or conflict. A direct semantic comparison against r3 proves initial resources, all transition conditions/costs/effects, enemies, entity effects, task flags, story SHA, goal and ballast rule are identical; only geometry/interaction position metadata changes.

Certificates live in `artifacts/campaigns/c-normal*.certificate.json`; old spec/content/certificates remain in `artifacts/campaigns/history/c-geometry-v1.1/`. A witness proves existence, not uniqueness or balance between routes.

## Migration and verification boundaries

Content identity changes automatically separate save namespaces. Old saves are retained; there is no position-clamping or blind identity migration. Imported old snapshots/certificates are rejected. Even a forged current identity cannot stand on removed x2/x8/rack cells. Start a new run under v1.2 or use an explicitly reconstructed replay; never swap the old hash into a new state.

Commands:

- `node --test test/campaign-c-geometry.test.js`: 10 geometry/migration/invariance tests (plus the separate real-app five-berth visibility test)
- `node --test test/campaign-kernel.test.js test/campaign-voyage.test.js test/campaign-c-story.test.js test/campaign-c-geometry.test.js test/campaign-c-map-visibility.test.js`: 49 focused tests
- `node scripts/validate-campaign-c-geometry-v1.2.mjs`: 6 masks, all entity interaction stands, closed mesh, 3 certificate replays
- `node scripts/validate-campaign-c-story-runtime.mjs`: 3 routes × 2 epilogues, all20 scenes, no story writes
- `node scripts/build-campaign-preview.mjs && node scripts/validate-campaign-preview-build.mjs`: build passes, 14 reachable modules/pages, no external dependencies
- `npm test`: **658 tests, 649 passed, 9 existing skips, 0 failures** on the final content/UI revision; log `../campaign-c-geometry-v1.2-verified-full.log`

Geometry source SHA256: `3b2f81f29a193169c3d5a092debc26fbe00f447e830ee1a51e53b0ed24edf97e`.
OBJ SHA256: `e3879fd07d4f379468c2b2f43b417c435704144cbeec0fabeeb69cd8091f314e`.

Not performed: new browser deployment/signoff; final C image production; 3D renderer implementation; three-difficulty balance; nine-combination acceptance. No dependency was added and no service was purchased.

Final geometry handoff manifest: `../candidate-c-art-plan/05_manifests/geometry-v1.2-files.json`. Exact development increment: `../candidate-c-geometry-v1.2-change-manifest.json`. All final identities use `c5a5f809d5548f36`; intermediate design hashes are superseded.
