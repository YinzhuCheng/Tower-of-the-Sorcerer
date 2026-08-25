# Agent handoff — Solver / auto-balance Phase 2 stop point

Date: 2026-08-25 (Asia/Tokyo)

This document is the repository-resident handoff for the next development conversation. It intentionally records a **safe intermediate stop**, not a finished balance release.

Handoff source head before this document commit:

```text
branch: solver-phase1-pareto
source head: 3e9c52bcf5150394e619b900114e11ca38ecdb53
PR: #15 Solver + Phase 2: exact oracle, adaptive balance tuner, and proof gates
base: visual-theme-v8@098ff3ddb08a1ca6de7067f259c3146e1bb1226b
```

Do **not** merge PR #15 unless the user explicitly asks.

---

## 1. Safe stop status

The repository is in an acceptable intermediate state:

- ordinary repository CI passes on the source head;
- Tuner Profile passes;
- Adaptive Balance Profile passes;
- Event Order Profile passes;
- V2 Review Validation workflow executes successfully and preserves its reports;
- Holy-policy proof infrastructure is intact;
- canonical production balance values have **not** been replaced by tuner candidates;
- every tuner/review object still has `productionWriteAllowed = false`;
- PR #15 remains open and mergeable.

Important distinction:

> A GitHub Actions workflow being green means the diagnostic executed correctly. It does **not** mean an experimental balance candidate passed its internal promotion gate.

Current V2 validation is deliberately **blocked**; see section 6.

Latest GitHub commit status also reports Vercel failure with a target ending in:

```text
upgradeToPro=build-rate-limit
```

Treat this as an external Vercel build-rate-limit condition, not evidence of a repository build failure. Do not weaken CI or change code merely to clear this status. Re-check/redeploy after the Vercel limit clears if deployment verification is needed.

---

## 2. Trust model — do not regress

These rules are architecture, not optional conventions.

1. `src/game/engine.js` is the only authoritative transition system.
2. Solver/adapters may select or abstract actions, but certified transitions must replay through the engine.
3. `uncovered != infeasible`.
4. `budget exhausted != infeasible`.
5. Only exhaustive reasoning or a sound over-approximation certificate may produce `infeasible-proven`.
6. A numeric lower bound cannot prune unless backed by an engine-verified feasible witness.
7. An optimization upper bound must remain admissible under the **current balance overlay**.
8. Hard constraints are checked before heuristic/score ranking.
9. Candidate snapshots are evidence/configuration, not production writes.
10. `productionWriteAllowed=false` remains mandatory until materially stronger near-optimal/global exploit coverage exists.

The overlay-aware upper-bound fix is especially important: `tower-bounds.js` must read current overlay values rather than stale module-load constants. Future tuners may raise as well as lower parameters; a stale underestimated bound would make branch-and-bound unsound.

---

## 3. Solver / analyzer capabilities already in Git

Major implemented layers include:

```text
canonical engine
  -> compact event-vector state codec
  -> macro-event Tower adapter
  -> Pareto multi-label search
  -> dominance pruning
  -> conservative objective upper bounds
  -> authoritative certificates + replay
  -> verified incumbent witnesses
  -> canonical compass travel
  -> objective-threshold existence adapter
  -> core-boundary decomposition
  -> replayable compact bridge states
  -> staged threshold/core-transition chains
  -> difficulty / counterfactual analyzers
  -> numeric mutator + sensitivity screen
  -> adaptive ray tuner
  -> purchase best response
  -> Holy-policy proof coverage
  -> fixed-purchase event-order best response
  -> event-order step witnesses
  -> event-order purchase local search
  -> recovery-aware purchase counterfactuals
```

Relevant entry files include:

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

Do not reimplement these as independent game simulators.

---

## 4. Canonical baseline and Holy-policy result

Canonical, unmodified game best-known purchase-only route found during this work:

```text
terminal HP: 26,041
purchase plan: DEF x4 -> HP x15 -> ATK x1 -> HP x10
```

It is purchase 1-opt under the modeled route, **not** a global player optimum.

Holy timing is no longer an open coverage hole for the current map/rules:

```text
immediate      -> feasible / optimized
after-core-6   -> STATIC_CUT proven infeasible
after-core-7   -> STATIC_CUT proven infeasible
before-final   -> STATIC_CUT proven infeasible
```

The proof is topology/rule based and intentionally relaxes enemies, doors, gates, runes, resources and shop affordability. With Holy forbidden and the upper stair boss-locked, even the optimistic F6 graph cannot reach an `astralBoss`-adjacent cell. Allowing Holy or unlocking `U` restores a reachability witness.

See:

- `docs/pre-holy-static-cut-proof.md`
- `src/analyzer/pre-holy-static-cut.js`
- `test/pre-holy-static-cut.test.js`

---

## 5. V1 balance candidate: useful direction, superseded player response

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

This once passed review gate v3, but **must no longer be treated as the strongest player response**.

### Event-order exploit

Fixed-purchase event-order threshold search found and replayed:

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

### Joint event-order + purchase response

Purchase 1-opt on the 241-step event-order skeleton improved again:

```text
7,187 -> 7,687 HP
+604 HP vs the old 7,083 reference
minimum normalized HP margin: 42.63%
localOptimal within existing shop-step replacement neighborhood: true
```

Best witness hash recorded in that experiment:

```text
34a27dcc2d368edf
```

This proves the V1 numeric ray was materially too soft against the stronger player model.

See:

- `docs/event-order-joint-result-7687.md`
- `docs/event-order-joint-local-search.md`

Do not restore V1 to `ready_for_review` merely because its old v3 checks pass.

---

## 6. V2 candidate: current experimental frontier, intentionally BLOCKED

Repository candidate: `REVIEW_CANDIDATES.distributedPressureV2`.

V2 edits:

```text
whaleSinger.magicPower: 62
shop.hp.effect.hp:       150
shop.hp.effect.maxHp:    150
flameCaster.def:          70
```

It was generated from the stronger event-order-witness pressure ray (`sourceRayStep = 0.8375`).

Persisted expected evidence currently says:

```text
terminal HP: 4,578
minimum normalized HP margin: 0.14945652173913043
purchase count: 29
witness steps: 241
expected witness hash: 8623f0ba330d21b3
```

### Latest V2 validation on source head `3e9c52bc`

The repository rebuild produced:

```text
terminal HP: 4,578                         MATCH
minimum normalized margin: 0.1494565217   MATCH
purchase plan:                            MATCH
purchase count: 29                        MATCH
localOptimal: true                        MATCH
witness steps: 241                        MATCH
rebuilt witness hash: 74d2099e0e9cf529  MISMATCH
```

Therefore the trust chain correctly blocks the reference with:

```text
witness_hash_mismatch:74d2099e0e9cf529!=8623f0ba330d21b3
```

Because the reference is not trusted, the V2 validator does **not** treat downstream counterfactual/Holy/event-order evidence as valid promotion evidence.

The same run also showed independent existence search did not finish inside the current budget:

```text
expanded: 10,000
generated: 77,332
solvable: null
exact: false
```

So V2 is currently:

```text
status = blocked
productionWriteAllowed = false
```

The V2 core-transition diagnostic also stops immediately on the same candidate snapshot drift; no c6->c7 proof conclusion should be inferred from that run.

### Correct next action for V2

Do **not** simply replace the stored hash to make the gate green.

First determine why the deterministic rebuild hash changed while HP, margin, purchase plan/count, step count and local optimum all remained identical.

Recommended sequence:

1. rebuild the V2 reference repeatedly and verify the new hash is deterministic;
2. diff the witness payload/skeleton against the historical expected witness semantics;
3. identify whether the difference is metadata/version/serialization-only or an actual action-order change;
4. if semantics are identical, document the cause and update the expected hash with a regression test;
5. if semantics differ, keep V2 blocked and treat the rebuilt witness as new evidence rather than silently rewriting history;
6. only after reference trust is restored should exact existence, counterfactuals and V2 c6->c7/event-order proof budgets be revisited.

This is the highest-value starting point for the next conversation.

---

## 7. Event-order proof state

For the V1 7,083 threshold, whole-game threshold search at 50k expanded did not exhaust the space and found no >7,083 route in that particular deep run; this is **coverage incomplete**, not a no-exploit proof. Earlier staged decomposition already found the 7,187 exploit, so the known exploit is authoritative regardless of later bounded misses.

Important telemetry from the threshold work:

- the difficult region moved to `c6`;
- c6 threshold-relevant boundaries are cheap to discover;
- c6 -> c7 continuation and late-game suffix decomposition are implemented;
- `event-order-core-transition-chain.js` composes prefix -> transition -> suffix certificates and can emit a numeric-agnostic step witness;
- the chain only produces exact negative evidence when boundary coverage and every required continuation are exact.

Useful scripts:

```bash
node scripts/prove-event-order-threshold.mjs --json
node scripts/analyze-event-order-suffix.mjs --target-cores=6 --json
node scripts/analyze-event-order-core-transition.mjs --from-cores=6 --to-cores=7 --json
node scripts/analyze-event-order-core-transition-chain.mjs --from-cores=6 --to-cores=7 --json
```

For V2 specifically:

```bash
node scripts/validate-review-candidate-v2.mjs --json
node scripts/analyze-v2-event-order-core-transition.mjs --from-cores=6 --to-cores=7 --json
```

Do not spend large V2 proof budgets until the reference hash drift is resolved.

---

## 8. CI / workflows at handoff

Source head `3e9c52bc` status observed during handoff:

```text
CI                       success
Tuner Profile            success
Adaptive Balance Profile success
Event Order Profile      success
V2 Review Validation     success (diagnostic ran; candidate itself BLOCKED)
Holy Policy Diagnostics  staged proof success; boundary job was still finishing when handoff preparation began
Vercel                    failure: build-rate-limit / upgradeToPro target
```

Before doing new development in the next conversation, re-check the latest head/workflows because this handoff document commit itself advances the branch.

Normal first command/check should remain:

```bash
npm run check
```

GitHub Actions is the authoritative full-repository execution environment when the local VM cannot clone/access GitHub reliably.

---

## 9. Recommended next-conversation priority

### Priority 1 — resolve V2 witness identity drift

This is currently blocking every proof that depends on V2's 4,578-HP threshold.

Do not weaken `referenceRebuilt`, `referenceReplay`, or hash checks to get past it.

### Priority 2 — rerun V2 independent proof stack

After reference trust is restored:

1. exact existence;
2. no-recourse single-purchase counterfactuals;
3. recovery-aware counterfactuals;
4. Holy STATIC_CUT coverage;
5. fixed-purchase event-order threshold closure;
6. c6 -> c7 threshold transition/chain if whole-game closure remains expensive.

### Priority 3 — feed any stronger witness back into tuning

If V2 is beaten, persist the new numeric-agnostic event-order witness and re-run the stronger player-response ray. Do not tune against a weaker deterministic route.

### Priority 4 — only then expand mutation space

After a candidate survives the stronger player model, move to topology-preserving content mutations in this order:

```text
item placement within semantic region
-> optional enemy placement/count
-> door/card placement
-> mechanism placement
-> local maze topology
```

Do not jump straight to random F9/F10 generation or broad topology search while the player-response oracle is still moving.

---

## 10. Repository continuity notes

- PR #15 is intentionally large because it records the full Solver/tuner research branch. Do not merge it automatically.
- Existing PR #14 (`visual-theme-v8`) remains the visual parent/base context; do not merge that automatically either.
- The VM is not the source of truth. Any algorithm, safety rule, threshold definition or design conclusion needed later must live in `src/`, `test/`, `.github/workflows/`, or `docs/`.
- CI artifacts are evidence snapshots, not the sole storage location for algorithmic decisions.
- Candidate numeric overlays are dry-run data. Canonical balance values must stay unchanged until the user explicitly chooses to promote a candidate and the proof gates support that decision.

This handoff is the intended restart point for the next development conversation.
