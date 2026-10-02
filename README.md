# Tower of the Sorcerer: recovered core candidate

This isolated candidate contains the minimal reproducible A/B/C build and test cores. It is a reconstruction from older verified sources, not recovery of missing latest local work or acceptance of final art. Main and historical branches are unchanged.

## Requirements and commands

Node.js 22+, npm, Python 3.12+.

    python3 -m pip install -r apps/a/scripts/requirements-art.txt
    npm --prefix apps/c ci --ignore-scripts --no-audit --no-fund
    npm run check

A and B have no npm dependencies. C pins Three.js 0.180.0 in its lockfile.
`npm test` runs all three test suites. `npm run build` builds all three games.

## Preview outputs

- A: serve `apps/a/dist/`; entry `/`
- B: serve `apps/b/dist-b-preview/`; entry `/campaigns-b/`
- C: serve `apps/c/dist/`; entry `/campaigns/`

Use an authorized static HTTP server, not file://. No backend or runtime CDN is required. No deployment is configured by this candidate. Cloud localhost browser access was blocked; actual browser gameplay, WebGL, layout, save-button flow and visual acceptance are still unverified.

## Scope and provenance

A derives from 661296d3df912539f14f300442d962ba6c462541; B from 9ada59a66d9579a418e25015b90c61621ce583d1; C from 080d9142bbbfe65df4b7977ed483a5a49435e30b plus 2b6388088eeacf6c011aad4a4a207b29bd4de941. See each app README for exact reconstruction limits. C intentionally uses geometry-only rendering because six historical materials are unavailable; B materials are historical previews, not accepted final forest art.

Valuable production art, canon, recovery evidence and historical QA fixtures are preserved separately in verified Library checkpoints. They are not build dependencies. Dependencies, generated output, rejected drafts and caches are not published here. Runtime art and executable test fixtures remain where required by the sealed core.
