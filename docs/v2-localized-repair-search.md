# V2 failure-core localized repair search

## Purpose

V2 is numerically close to the intended pressure band, but six single-purchase mistakes remain catastrophic under exact later-purchase recovery on the fixed event-order witness. Failure-core instrumentation localized them into two F5 semantic events rather than six unrelated problems:

- `ATK -> HP` mistakes converge on `f5:enemy:flameCaster#3`;
- `ATK -> DEF` mistakes converge on `f5:enemy:dragonBoss#1`.

This module turns that diagnosis into an automatic candidate generator. It does **not** hard-code the manually estimated `flameCaster.def=59` / `dragonBoss.atk=108` pair and it does not write production balance.

## Algorithm

`searchV2LocalizedRepairs()` performs five stages.

### 1. Rebuild and authoritative-replay the V2 semantic witness

The existing repository reconstruction produces the V2 event-order witness and purchase plan. Under the V2 balance overlay the normal counterfactual + exact fixed-event-order recovery analysis is run again. Only `exact && !recoverable` entries with a semantic enemy failure core are eligible for repair clustering.

### 2. Cluster by semantic failure event

Failure identity comes from event IDs such as:

```text
f5:enemy:flameCaster#3
f5:enemy:dragonBoss#1
```

Coordinates are not used as semantic identity.

### 3. Find single-field rescue frontiers with monotone integer search

For each failure enemy the tuner chooses only fields that can actually soften that combat family:

```text
magic enemy:  magicPower, def, hp
other enemy:  atk, def, hp
```

For each field it searches for the **least softening** that makes at least 1, 2, ... cluster mutations recoverable.

The search uses monotonicity: lowering an enemy's HP/ATK/DEF/magicPower cannot make a previously legal fixed event-order combat transition worse. Therefore an integer binary search is valid for the local rescue predicate and avoids brute-force scanning every numeric value.

Each predicate evaluation still runs `solveFixedEventOrderPurchaseRecovery()` through canonical engine replay; the binary search optimizes the number of authoritative evaluations, not their correctness.

### 4. Synthesize low-cost multi-cluster repairs

The frontier points from different failure clusters are combined. Candidate cost is the sum of relative parameter changes. By default each cluster must rescue at least one mutation and the combination must rescue at least two total, matching the internal goal of moving the catastrophic count from `6/58` to at most `4/58` without loosening the public 10% gate.

Only the lowest-cost combinations proceed to full local evaluation.

### 5. Coarse screen, then purchase-1opt refinement

Each candidate is evaluated under `V2 edits + repair edits`:

1. replay the unchanged V2 event-order witness;
2. run all 58 single-purchase counterfactuals;
3. run exact fixed-event-order later-purchase recovery;
4. rank by catastrophic target, pressure-band distance, then edit cost;
5. run purchase 1-opt only on the Top-K candidates;
6. re-run all 58 counterfactuals and recovery around the locally optimized witness.

A candidate passes the **local repair gate** only when:

- purchase 1-opt finishes locally optimal;
- minimum normalized HP margin remains in the V2 pressure target band `[0.08, 0.25]`;
- catastrophic mutations are at or below the configured internal target (default `4/58`);
- no one-purchase improving neighbor remains;
- fixed-event-order recovery has zero unknown cases.

## Trust boundary

A local repair pass is **not** `ready_for_review` and is never a production write.

The search does not prove:

- global event-order optimality;
- exact independent existence closure;
- absence of another route that exploits the softer F5 enemies;
- topology robustness;
- global difficulty quality.

A selected local seed must next receive a new semantic reference witness and be validated by the stronger event-order threshold / staged c7 suffix machinery and independent solvability evidence. `productionWriteAllowed=false` remains mandatory.

## Entry points

```bash
node scripts/search-v2-localized-repair.mjs --json
```

GitHub Actions:

```text
.github/workflows/v2-localized-repair-search.yml
```

The workflow persists the complete JSON report, including field rescue frontiers, candidate edits, robustness summaries and the selected optimized witness for the next V3 validation stage.
