# C three-profile UI/session integration candidate

Status: isolated, offline-verified candidate. Not published. Browser/GPU acceptance remains open. This is C only; it does not complete all nine story × difficulty combinations.

## User-visible behavior

- Fresh entry offers STANDARD, HARD (provisional), and EXTREME (provisional) before constructing an engine or session. All share the same story, opening, geometry, art and fuel budget. Only c.machine1/c.machine2 ATK changes by +0/+1/+2.
- A single existing compatible context resumes automatically, including markerless original STANDARD and known HARD/EXTREME. When multiple contexts exist, the selector asks which saved run to continue; revisions are not compared across profiles.
- The normal “Difficulty / voyage” menu is read-only until an explicit Continue or New action. Close, Cancel, repeated activation, and changing the selected option do not restart the current game.
- Starting another game during play requires a normal confirmation. Existing progress is kept at its exact keys; a new run gets a separate run-scoped context. All contexts with saves remain discoverable in the same selector’s saved-run list. This is a minimal resume picker, not a hidden archive or a full history manager.
- The selected profile/run travels in the page’s query string for reload. There is no global persistent selector pointer and no silent pointer fallback.
- New HARD/EXTREME envelopes include canonical profile ID/version/SHA-256. Existing STANDARD identity, original key and save format remain unchanged. Merely resuming does not rewrite automatic/manual bytes.
- Unknown/future/mismatched save identity, profile marker, envelope version, presentation version/field and malformed data are preserved exactly. Any incompatible automatic/manual slot blocks all writes in that context, even if a compatible manual or automatic fallback can be read. A context with no readable fallback cannot enter a game; the selector offers a separate new run.
- Profile-specific certificate playback loads the matching certificate, does not save, and can return to an existing run via Continue.

## Frozen identities

- STANDARD: voyage-c-standard-r1; normal; c5a5f809d5548f36; original contentVersion c-rules-prototype-v1.2-geometry
- HARD: voyage-c-hard-r1; hard; 4d01c76add7608e9; contentVersion c-rules-prototype-v1.2-geometry/harbor-difficulty-r1/hard
- EXTREME: voyage-c-extreme-r1; extreme; bc8aa38e6d84cc01; contentVersion c-rules-prototype-v1.2-geometry/harbor-difficulty-r1/extreme
- All use campaign voyage-c, rules fixed-campaign-v1.1 and profile set harbor-difficulty-r1. Canonical SHA-256 values are frozen in src/profiles/registry.js and verified before boot and during build checks.

## Source boundary

Core, battle, source campaign spec, story, planning, solver, opening/presentation, geometry, artwork and dependency locks remain byte-identical to restored-hotfix-e4e042e. The mandatory opening Escape/native-close recovery and Finish-once path are unchanged.

The original 2D and 3D rendering modules rejected every hash except STANDARD. Their only changes are one import and one eligibility predicate each. The new predicate admits only the full reviewed registry identities, checks the actual spec content hash and exact vessel geometry, and rejects foreign/forged runtimes. A normalization test verifies every other rendering byte against baseline hashes. The existing source-snapshot test was enhanced with only this exact c-adapter gate normalization; no blanket protected-source exclusion was added.

New profile/session/persistence/selection modules live under src/profiles. The entry/HTML/CSS wire the ordinary modal selector, per-profile replay and guarded saves. Build metadata and verification cover all three profiles. The generic search code copied from the frozen A baseline is test-only, pinned by provenance hashes, and excluded from dist. A/B source directories were not modified.

## Verification

Final aggregate: npm run check, 135/135 tests, build/import closure, all three emitted profile identities/certificates, and the original 170-action route report pass.

Coverage includes:
- All 53 inherited C cases, including native Escape, forced close, stale callbacks, Finish once, geometry, recovery and viewport behavior
- Legacy raw/envelope exact-byte resume; separate profile/run auto/manual/checkpoints; markerless known profiles; unknown URL refusal; future schema/identity/profile/hash/presentation refusal; unsupported auto + valid manual; live write-time refusal if unsupported data appears after restore
- Actual app-entry execution in a limited DOM/storage harness for all three profiles: no writes before choice or Finish, opening recovery, correct state identity, resume bytes, menu cancellation/repeated input/modal guards, explicit new run, and complete 170-action profile-specific playback with no auto/manual writes
- All 12 frozen certificates (three authored routes plus one earlier fresh-search witness per profile) replay
- Three independently rerun, unseeded bounded existence searches, each expanded 80/generated 583 states and recertified/replayed 179 atomic actions; final HP 29/21/13, fuel 1
- Per-profile three-route final fuel [1,0,0]; fixed story dispatch, numeric forecasts and read-only render models operate under each actual runtime identity
- Exact full-spec lock and unchanged rendering formulas; foreign-profile certificates and forged geometry identities fail closed
- Official lockfile-pinned three@0.180.0 restored offline with npm ci --ignore-scripts --offline; no dependency upgrades or external runtime CDN

The DOM harness stubs raster/WebGL, layout and real navigation. It is not browser acceptance. Solver results prove existence, not uniqueness, optimality or player-tested difficulty.

## Cache-hardening revision

Independent review found the first candidate could cache a shallow-frozen runtime facade whose identity or nested geometry remained mutable. Revision r2 only caches runtimes with immutable identity/spec data trees; accessors are excluded from caching. Other facades are revalidated each call. Four new adversarial tests cover mutable identity, mutable nested hull data, a runtime accessor and a nested accessor. The prior v1 archive and its exact hashes remain preserved under prior-revisions/r1. The two renderer formula-normalization boundaries remain unchanged.

## Remaining release gate

No GitHub/Vercel writes were performed. Before authorized publication/promotion, review this exact source delta, then run real-browser tests on the permitted deployment: all three fresh selections and openings, legacy and each profile’s saves/reload, all selector cancel/repeat/switch/resume paths, protected-future-data refusal, matching certificate playback and zero-fuel endings, mobile/desktop layout, 2D/3D fallback, and actual WebGL visuals/performance. Existing geometry-only/final-art limitations remain visible and unchanged.
