# C three-profile integration candidate

This isolated candidate adds STANDARD / HARD / EXTREME selection and guarded, separately resumable save contexts. HARD and EXTREME are provisional labels. It has not been published or accepted in a real browser. See [the integration report](reports/profile-integration.md) for source boundaries, 135-test evidence, save behavior and remaining gates.

The following records the recovered baseline; its historical test counts describe that baseline, not the current candidate.

# C harbor historical backbone reconstruction r1

This is a small, reproducible development base, not recovery of the latest lost work or acceptance of final visuals.

## Exact recovered sources

- Historical C fixed-view source: commit `080d9142bbbfe65df4b7977ed483a5a49435e30b`, `prototypes/c-harbor-3d/`
- Additional unchanged geometry tests and three current route witnesses: commit `2b6388088eeacf6c011aad4a4a207b29bd4de941`
- Rules identity: `voyage-c / normal / fixed-campaign-v1.1 / c-rules-prototype-v1.2-geometry`, content hash `c5a5f809d5548f36`
- Core, combat, solver, campaign content, story, planning, geometry and certificate bytes are unchanged. The inherited snapshot test verifies protected sources.
- `../../qa/c/source-provenance.json` documents exact original hashes and explicit reconstruction changes. It is evidence, not a build dependency.

## Reproduce

Node 22+ and npm. From this directory:

```
npm ci --ignore-scripts --cache /tmp/tower-c-npm-cache --no-audit --no-fund
npm run check
```

The sole dependency is MIT `three@0.180.0`, pinned with integrity in package-lock.json. No lifecycle scripts, runtime CDN, backend, paid service or deployment is required. Build copies the two required Three modules and license into ignored `dist/`; serve its `/campaigns/` entry through an authorized static browser path. Build output is deterministic for identical source/dependency bytes.

`npm run check` runs 35 Node tests, the static build/import closure, and the real 170-action certificate from `initialState` through every before/after hash. Geometry tests additionally replay three distinct winning certificates, preserve all 42 connected deck cells and 120 ballast assignments, reject old geometry/save identities, and check exact physical hull support and stand restrictions. Save regression tests cover every witness state, invalid identity, corrupt-save backup and valid manual fallback.

## Explicit presentation limitation

The six referenced historical WebP samples have not been recovered. `recovery-presentation.js` freezes `materialsAvailable:false` and `finalArtAccepted:false`. Both 2D and 3D loaders skip absent images and use the existing deterministic geometry/palette, with a visible reconstruction notice. No art was generated or silently substituted. Only the missing-material loader branches, notice, build validation, snapshot-test exclusion for that one modified loader, and new recovery tests differ from the historical pilot; rules remain unchanged.

Browser navigation to the local preview was blocked by cloud-browser `ERR_BLOCKED_BY_CLIENT`. No alternate route or policy bypass was attempted. Therefore real browser play, WebGL, screenshot/layout, save-button flows, rendering performance and final visual acceptance remain UNVERIFIED. Node modeled viewport tests are not actual browser evidence.

## Missing later work and next gate

This does not recover latest local r3/r4/r5 candidates, C v2.1 editorial source, opening editorial r1, or the unfinished newer GAL stage. Recovered story is the older generated content. Keep those version boundaries explicit.

Next bounded task: independently review a permitted real-browser playthrough of this exact build (opening, normal boarding, manual save/reload, cancel/repeated input, view fallback and route playback). Then plan forward story/GAL integration against locked canon and geometry with a new presentation/save identity where required. Do not generate final art or publish this base before those gates.
