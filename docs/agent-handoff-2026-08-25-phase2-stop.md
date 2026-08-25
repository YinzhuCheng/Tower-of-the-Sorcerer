# Agent handoff — Solver / auto-balance Phase 2 stop point

Date: 2026-08-25 (Asia/Tokyo)

This is the repository-resident restart document for the next development conversation. It records a **safe intermediate stop**, not a finished balance release.

Handoff source head before this final documentation commit:

```text
branch: solver-phase1-pareto
source head: e0b994c300ef207b3c3dd6cbb98ab382cbb248ec
PR: #15 Solver + Phase 2: exact oracle, adaptive balance tuner, and proof gates
base: visual-theme-v8@098ff3ddb08a1ca6de7067f259c3146e1bb1226b
```

Do **not** merge PR #15 or PR #14 unless the user explicitly asks.

---

## 1. Safe stop status

The repository is at an acceptable intermediate stop:

- ordinary `npm run check` / GitHub CI is green on the recent source heads;
- Tuner Profile, Adaptive Balance Profile, Event Order Profile and V2 Review Validation execute successfully;
- Holy `STATIC_CUT` proof infrastructure is repository-resident and tested;
- all algorithmic ideas needed for continuation live in `src/`, `test/`, `.github/workflows/` or `docs/`;
- canonical production balance data has **not** been replaced by tuner candidates;
- tuner/review candidates remain dry-run with `productionWriteAllowed=false`;
- PR #15 remains open and unmerged.

Important distinction:

> A green diagnostic workflow means the analyzer executed correctly. It does **not** mean the experimental balance candidate passed its internal promotion gate.

The current V2 candidate remains **blocked**, for the concrete reasons in section 6.

### Vercel

Latest checked commit status still reports Vercel failure with a target ending in:

```text
upgradeToPro=build-rate-limit
```

Treat this as an external Vercel build-rate-limit condition, not a repository build failure. Do not weaken CI or alter game code merely to clear it.

---

## 2. Trust model — do not regress

These are architecture constraints.

1. `src/game/engine.js` is the only authoritative transition system.
2. Solver/adapters may select or abstract actions, but certified transitions must authoritative-replay through the engine.
3. `uncovered != infeasible`.
4. `budget exhausted != infeasible`.
5. Only exhaustive reasoning or a sound over-approximation may produce `infeasible-proven`.
6. A numeric lower bound may prune only when backed by an engine-verified feasible witness.
7. Objective upper bounds must remain admissible under the **current balance overlay**.
8. Hard constraints are evaluated before heuristic/score ranking.
9. Candidate snapshots are evidence/configuration, not production writes.
10. `productionWriteAllowed=false` stays mandatory until near-optimal/global exploit coverage is materially stronger.
11. Raw proof-certificate identity and semantic player-route identity are different concepts; use semantic identity when proof reconstruction may legitimately change certificate/path metadata.

The overlay-aware bound rule is especially important. Future tuners may raise as well as lower item/enemy/shop values. A stale underestimated upper bound would make branch-and-bound unsound.

---

## 3. Solver / analyzer capabilities already in Git

The branch now contains the following reusable stack:

```text
canonical engine
  -> compact event-vector state codec
  -> macro-event Tower adapter
  -> Pareto multi-label search
  -> dominance pruning
  -> conservative overlay-aware upper bounds
  -> authoritative certificates + replay
  -> verified incumbent witnesses
  -> canonical Compass travel
  -> objective-threshold existence adapter
  -> core-boundary decomposition
  -> replayable compact bridge states
  -> staged threshold/core-transition chains
  -> difficulty / counterfactual analyzers
  -> numeric mutator + sensitivity screen
  -> adaptive numeric ray tuner
  -> purchase best response
  -> Holy-policy proof coverage
  -> fixed-purchase event-order best response
  -> event-order step witnesses
  -> event-order purchase local search
  -> recovery-aware purchase diagnostics
```

Key entry points:

- `src/solver/search.js`
- `src/solver/tower-adapter.js`
- `src/solver/tower-bounds.js`
- `src/solver/fixed-purchase-policy-adapter.js`
- `src/solver/objective-threshold-adapter.js`
- `src/solver/core-boundary-adapter.js`
- `src/solver/replay.js`
- `src/analyzer/pre-holy-static-cut.js`
- `src/analyzer/event-order-best-response.js`
- `src/analyzer/event-order-core-transition-proof.js`
- `src/analyzer/event-order-core-transition-chain.js`
- `src/tuner/review-candidates.js`
- `src/tuner/review-candidate-v2-rebuild.js`
- `src/tuner/review-candidate-v2-validation.js`

Useful V2 CLIs now include:

```bash
node scripts/validate-review-candidate-v2.mjs --json
node scripts/analyze-v2-event-order-core-transition.mjs --from-cores=6 --to-cores=7 --json
node scripts/analyze-v2-event-order-core-transition-chain.mjs --from-cores=6 --to-cores=7 --json
```

Do not reimplement these as an independent game simulator.

---

## 4. Canonical baseline and Holy-policy result

Canonical, unmodified game best-known purchase-only route found during this phase:

```text
terminal HP: 26,041
purchase plan: DEF x4 -> HP x15 -> ATK x1 -> HP x10
```

It is purchase 1-opt under its modeled route, **not** a global player optimum.

Holy timing is no longer an open policy-coverage hole for the current map/rules:

```text
immediate      -> feasible / optimized
after-core-6   -> STATIC_CUT proven infeasible
after-core-7   -> STATIC_CUT proven infeasible
before-final   -> STATIC_CUT proven infeasible
```

The static proof relaxes enemies, doors, gates, runes, resources and shop affordability. With Holy forbidden and the upper stair boss-locked, even the optimistic F6 graph cannot reach an `astralBoss`-adjacent cell. Allowing Holy or unlocking `U` restores a reachability witness.

See:

- `docs/pre-holy-static-cut-proof.md`
- `src/analyzer/pre-holy-static-cut.js`
- `test/pre-holy-static-cut.test.js`

---

## 5. V1 candidate: useful direction, superseded by stronger player response

`distributed-pressure-v1` edits:

```text
whaleSinger.magicPower: 34 -> 56
shop HP reward:         900 -> 320
flameCaster.def:         38 -> 63
```

Original deterministic/purchase response:

```text
terminal HP: 7,083
minimum normalized HP margin: 0.1161665053
exact existence: PASS
purchase 1-opt: PASS
Holy coverage: complete
single-purchase recovery: 93.33%
catastrophic rate: 6.67%
```

It once passed review gate v3, but it is no longer the strongest modeled player response.

### Fixed-purchase event-order exploit

Threshold decomposition found and authoritative-replayed:

```text
7,083 -> 7,187 HP
+104 HP / +1.4683%
```

Certificate chain:

```text
prefix      13b5c77bfc12c595
transition  b35c234d90a72b8d
suffix      b4d28205d98368b5
```

See `docs/event-order-exploit-7187.md`.

### Event-order + purchase response

Purchase 1-opt on the 241-step event-order skeleton then reached:

```text
7,187 -> 7,687 HP
+604 HP vs the old 7,083 reference
minimum normalized HP margin: 42.63%
localOptimal within the existing shop-step replacement neighborhood: true
```

Recorded best witness hash in that experiment:

```text
34a27dcc2d368edf
```

This proved V1 was materially too soft against the stronger player model.

See:

- `docs/event-order-joint-result-7687.md`
- `docs/event-order-joint-local-search.md`

Do not restore V1 to review-ready based on its older v3 checks.

---

## 6. V2 candidate: current experimental frontier, reference identity repaired, still BLOCKED

Repository candidate: `REVIEW_CANDIDATES.distributedPressureV2`.

V2 edits:

```text
whaleSinger.magicPower: 62
shop.hp.effect.hp:       150
shop.hp.effect.maxHp:    150
flameCaster.def:          70
```

It was generated from the stronger event-order-witness pressure ray (`sourceRayStep = 0.8375`).

Current reference evidence:

```text
terminal HP: 4,578
minimum normalized HP margin: 0.14945652173913043
purchase count: 29
witness steps: 241
historical raw witness hash: 8623f0ba330d21b3
rebuilt raw witness hash:    74d2099e0e9cf529
semantic fingerprint:        361000c0b48dba27
```

### 6.1 Raw hash drift was investigated and is no longer a blocker

The earlier handoff version treated the raw hash mismatch as candidate snapshot drift. The branch subsequently fixed the identity model:

- raw witness hash is retained as historical provenance;
- the hard identity check is now the ordered macro-event / strategic-action semantic fingerprint;
- source certificate hashes and zero-cost movement paths are excluded from semantic identity because proof reconstruction can legitimately change them without changing the player's strategy.

Commit introducing this distinction:

```text
be32eabdf8d4d68809f925cf8362018d16a26987
fix: pin V2 to semantic event-order witness identity
```

Latest V2 rebuild checks after that fix:

```text
sourceEditsMatch       = true
terminalHpMatch        = true
marginMatch            = true
referenceIdentityMatch = true
purchasePlanMatch      = true
purchaseCountMatch     = true
localOptimal           = true
witnessStepsMatch      = true
```

Therefore **do not spend the next conversation re-investigating the old raw hash mismatch** unless semantic fingerprint determinism itself regresses.

### 6.2 Current real V2 blockers

Latest V2 Review Validation result:

```text
status = blocked
failures = exactExistence, catastrophic, eventOrderBestResponse
```

#### A. Independent exact existence is not closed at the current budget

```text
expanded = 10,000
generated = 77,332
solvable = null
exact = false
```

This is a proof-budget gap, not an infeasibility result.

#### B. No-recourse single-purchase catastrophic rate is just above the gate

```text
recoveryRate     = 0.896551724137931
catastrophicRate = 0.10344827586206896
highRegretRate   = 0
improving neighbors = 0
```

The current catastrophic gate is 10%; V2 measures about **10.3448%**.

Do not simply loosen the threshold. The repository already contains recovery-aware diagnostics; inspect whether realistic later purchase recourse materially changes the interpretation before changing any promotion rule.

#### C. Fixed-purchase event-order best response is still coverage-incomplete

Latest whole-game threshold run:

```text
expanded = 50,000
generated = 271,383
exploitFound = false
exactNoExploit = false
status = coverage-incomplete
```

No exploit found is not an optimality proof.

### 6.3 V2 c6 -> c7 threshold bridge is now proven to exist

Once semantic reference identity was restored, the staged V2 transition search produced a replay-verified threshold-relevant bridge:

```text
reference threshold HP = 4,578
boundary relevant      = 64 / 64 discovered
boundary exact         = false (stopped at maxGoals)
boundary expanded      = 811
boundary generated     = 4,646
scheduled seeds        = 8 / 64
```

First successful scheduled seed:

```text
prefix certificate = 07159050c73dbb34
prefix upper bound  = 5,723
prefix HP           = 2,132
prefix Gold         = 878
shop purchases      = 16
```

Transition result:

```text
c6 -> c7 threshold-relevant bridge = FOUND
expanded = 27
generated = 264
stop = goalFound
next-state upper bound = 5,049 > 4,578
```

This does **not** prove a >4,578 terminal exploit. It proves that threshold-relevant potential survives the mandatory c6->c7 transition and gives a concrete bridge for a focused suffix search.

The branch now also contains `scripts/analyze-v2-event-order-core-transition-chain.mjs` to continue that bridge into the terminal threshold suffix.

### 6.4 Current V2 status

Keep:

```text
status = blocked
productionWriteAllowed = false
```

Do not write the V2 edits into canonical `src/game/data.js` yet.

---

## 7. Recommended next-conversation priorities

### Priority 1 — use the V2 replay-verified c7 bridge for terminal threshold suffix search

This is the highest-value next proof step. Whole-game 50k search is expensive and still incomplete; c6->c7 transition already has a verified bridge with upper bound 5,049 > 4,578.

Run/inspect:

```bash
node scripts/analyze-v2-event-order-core-transition-chain.mjs \
  --from-cores=6 --to-cores=7 --json
```

Outcomes:

- replayed terminal HP > 4,578 -> persist the stronger event-order witness and feed it back to the tuner;
- exact no-exploit from this bridge -> useful local negative evidence, but other unscheduled c7 bridges still matter;
- budget exhaustion -> keep `coverage-incomplete` and profile the suffix rather than blindly increasing whole-game search.

### Priority 2 — close or better decompose independent existence

The V2 reference itself is authoritative-replayable, but the current review process intentionally requests an independent Solver existence proof. Decide carefully whether to:

- improve/decompose that independent proof so it closes within practical budget; or
- formally document a different corroboration policy.

Do not silently reinterpret a replayed reference witness as satisfying an independently defined exact-existence gate unless the trust model is explicitly revised and tested.

### Priority 3 — analyze the 10.3448% catastrophic result with recourse

The no-recourse metric freezes every later purchase after a single mistake. The recovery-aware analyzer exists specifically to answer whether a player can adapt later.

Before changing either numeric values or the 10% gate:

1. make recovery-aware output complete/reliable for V2;
2. compare which forced purchase errors are truly terminal after optimal later purchase choices;
3. document whether the promotion gate should remain no-recourse, move to recovery-aware, or report both as separate constraints.

### Priority 4 — retune only if stronger response evidence demands it

If the V2 suffix finds a stronger exploit, persist its numeric-agnostic event-order witness and tune against that stronger response. Do not fall back to deterministic event ordering.

### Priority 5 — expand placement/topology mutation only after player-response closure stabilizes

Recommended expansion order remains:

```text
item placement within semantic region
-> optional enemy placement/count
-> door/card placement
-> mechanism placement
-> local maze topology
```

Do not jump to random F9/F10 or broad topology generation while the player oracle is still moving.

---

## 8. Useful event-order proof semantics

For threshold questions, the branch uses staged composition:

```text
canonical start
  -> threshold-relevant core boundary
  -> replay-verified mandatory core transition
  -> terminal objective-threshold suffix
```

The chain may produce:

- a replay-verified exploit certificate chain;
- a numeric-agnostic step witness for future overlays;
- exact local negative evidence only when the relevant search is actually exhausted.

Global `exactNoExploit` requires complete coverage of all relevant mandatory-boundary paths; a finite scheduled seed subset cannot establish it.

See:

- `docs/event-order-best-response.md`
- `docs/event-order-threshold-chain.md`
- `docs/late-game-zero-damage-harvest.md`
- `src/analyzer/event-order-core-transition-proof.js`
- `src/analyzer/event-order-core-transition-chain.js`

---

## 9. CI / workflow state at final handoff

Recent checked heads show:

```text
CI                       success
Tuner Profile            success
Adaptive Balance Profile success
Event Order Profile      success
V2 Review Validation     success as a workflow; candidate internal status BLOCKED
```

Holy Policy Diagnostics sometimes shows `cancelled` because its `pre-holy-f6-boundary` diagnostic is long-running and the workflow has:

```text
concurrency:
  cancel-in-progress: true
```

During handoff, one such boundary job was cancelled by a subsequent branch push after exactly two minutes; the same run's `staged-holy-proof` had already succeeded. Treat that cancellation as non-regression housekeeping, not a failed Holy proof.

Vercel status remains externally blocked by build-rate limiting (`upgradeToPro=build-rate-limit`) at the latest checked source head.

The final handoff documentation commit itself will advance the branch again. At the beginning of the next conversation, first re-read PR #15 head and run/workflow status before changing code.

---

## 10. Repository continuity notes

- PR #15 is intentionally large because it records the full Solver/tuner research branch. Do not merge automatically.
- PR #14 (`visual-theme-v8`) remains the visual parent/base context. Do not merge automatically.
- The VM is not the source of truth. Any algorithm, proof invariant, promotion rule, candidate identity rule or important design conclusion needed later must live in the repository.
- CI artifacts are evidence snapshots, not the sole storage location for algorithms or decisions.
- Candidate numeric overlays are dry-run data. Canonical balance values stay unchanged until the user explicitly chooses promotion and the proof gates support it.
- Start a new development conversation by reading this document and current PR #15 metadata, not by relying on older chat summaries or the old 7,083 `ready_for_review` interpretation.

This handoff is the intended restart point for the next development conversation.
