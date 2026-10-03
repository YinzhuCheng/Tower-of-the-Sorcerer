# Offline difficulty developer tools

These additive tools screen numeric variants of the existing B/C campaigns. They do not change any shipped application, create a fourth story candidate, or publish easy/hard profiles.

## Reproduce from the repository root

Node.js 22+, no additional dependencies:

```sh
node scripts/difficulty-lab/run.mjs . /tmp/tower-difficulty-reports
TOWER_CORE=. TOWER_REPORTS=/tmp/tower-difficulty-reports node --test test/difficulty-lab.test.mjs
```

Use a dedicated report directory outside the checkout. The runner writes generated reports and certificates only there. The test command must follow the runner because its final regression test independently replays all 15 generated certificates. Existing app checks remain available through `npm run check`; the developer-tool tests are run separately.

## Protected scope

- `lab.mjs` permits only bounded integer ATK changes (-2 through +2) to reviewed ordinary enemies, verifies exact baseline identities, and rejects all other content changes
- `run.mjs` checks 19 frozen B/C certificates, screens 95 route replays, runs five bounded C searches without prior-route input, and writes replay-verified evidence
- `test/difficulty-lab.test.mjs` covers locked story/topology/economy/final guard, unchanged normal identity, separate probe save namespaces, stale/tampered certificate rejection, finite rewards, and the B +2 zero-wedge failure gate

No runtime dependency is added. Normal content, rules, certificate identity, save schema and save keys remain unchanged. Altered probes use separate content/difficulty identities. No app source, presentation, assets or runtime route is edited.

## Interpretation limits

Winning replays establish route existence only. B +2 retains some winning routes but loses every frozen zero-wedge witness and is unsuitable for automatic promotion under that contract. Failed replays are not proof of global unsolvability. B evidence is a known-route corpus; C search is bounded. This tool does not establish optimality, final difficulty calibration, visual acceptance, or a complete three-candidate by three-difficulty release.
