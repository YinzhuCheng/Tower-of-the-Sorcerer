# B · 山路把冬天带回家 — recovered gameplay backbone

This is a clean, minimal reconstruction of the immutable September 30 source at
`YinzhuCheng/Tower-of-the-Sorcerer@9ada59a66d9579a418e25015b90c61621ce583d1`.
It is **old full-story v1.1 / outline v1.2**, not the missing B v2.2 editorial source,
not the October 1 source-world geometry, and not finished forest artwork.

## Reproduce (Node.js 22+; no package dependencies)

```sh
npm test
npm run build
npm run validate
```

The build produces `dist-b-preview/campaigns-b/index.html`. Serve the entire
`dist-b-preview` directory using a static server; do not open the HTML as file://.
Built modules and six preview materials use relative paths and require no CDN.
No deployment is performed by these scripts.

## Preserved boundaries

- Rules identity: `forest-b`, normal, `b-frozen-standard-v1`,
  `fixed-campaign-v1.1`, content hash `a12cd07ee1ccc762`
- 30 regions, 66 directional reciprocal portals, 156 unique entities
- 94 story scenes, 921 classified source paragraphs, 858 visible turns
- Original battle reducer, resources, receipts, save identities, and player copy
- 16 original winning-route certificates are executable test inputs, not a claim
  of global optimality or proof that every possible route wins
- Six texture materials are approved historical preview experiments only;
  final seamless/scale acceptance remains pending
- Story environment and CG IDs remain semantic placeholders; no tower-art
  fallback and no newly generated forest art has been introduced

All restored source files retain exact Git blob bytes. New reconstruction files
are this README and package.json. The bounded recovery-check script and full immutable
source provenance and current test evidence are kept separately in `qa/b` at the
rebuild root. Historical source docs remain under `docs/campaigns`; their old
completion claims are not fresh browser validation.

## Current verification (2026-10-02)

25 existing tests pass, including UI-session replay of all 16 certificates,
confirm/cancel/repeated-click safety, save corruption/quota isolation, map cuts,
and a DOM-double smoke test of the actual app. Build and static validation pass.
A separate direct reducer replay of all certificates also passes.

Browser visual/interaction verification is pending: the shared cloud browser
returned `ERR_BLOCKED_BY_CLIENT` for localhost, and no alternate route was used.
DOM doubles and static validation are not browser acceptance.

## Next bounded gaps

1. Recover or explicitly reconstruct the later B v2.2 source before integrating
   newer prose; retain this baseline as independently reproducible evidence
2. Reconstruct source-grounded continuous forest geometry, camera/occlusion and
   route semantics before producing new environment art
3. Review on an authorized browser preview, including saves, confirms, long GAL
   text and narrow-screen controls
4. Integrate only reviewed matching forest art, preserving gameplay hashes
