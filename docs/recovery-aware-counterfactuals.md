# Recovery-aware single-purchase counterfactuals

Status: 2026-08-25, `solver-phase1-pareto`.

This note defines the recovery layer that follows the original single-purchase counterfactual metric. It exists because “the old route dies after one wrong purchase” is not the same statement as “the player cannot recover after one wrong purchase”.

## 1. The no-recourse metric

`src/analyzer/event-order-witness-counterfactuals.js` mutates one shop action on an already replayable event-order witness and then keeps **every later action and purchase unchanged**.

That is useful evidence:

```text
forced wrong purchase
  -> replay the original continuation exactly
```

If replay succeeds, the mistake is obviously recoverable without adaptation.

If replay fails, however, the correct interpretation is only:

```text
original continuation is no longer legal
```

It is not yet a dead-route proof. The player may be able to compensate with different later purchases.

For this reason the original fields remain explicitly named as no-recourse evidence:

```text
counterfactuals.catastrophicRate
recoveryAwareCounterfactuals.noRecourseCatastrophicRate
```

They are not silently redefined.

## 2. Exact fixed-event-order recovery question

The first recovery upgrade holds the **event order fixed** but allows every shop choice after the mistake to adapt.

For one forced mistake at purchase `p`:

```text
purchases < p : fixed to baseline witness
purchase  p  : forced to the specified wrong option
purchases > p : branch ATK / DEF / HP exhaustively
non-shop events: fixed to the baseline event skeleton
```

The forced mistake is permanently locked. A recovery algorithm is not allowed to “recover” by changing the mistaken purchase back to the baseline choice.

Implementation:

- `src/analyzer/event-order-purchase-recovery.js`
- `src/solver/replay.js::replayTowerStepSkeletonToState()`
- `test/event-order-purchase-recovery.test.js`

## 3. Dynamic program

The event skeleton is processed from start to finish.

At a non-shop step, every current label executes exactly one canonical engine transition.

At a shop step after the forced mistake, every current label branches three ways:

```text
ATK
DEF
HP
```

Every branch executes `buyShopUpgrade()` indirectly through the same authoritative replay machinery used by other step witnesses.

Branches that make a later fight, door, movement, or other event illegal die naturally in `engine.js`.

### 3.1 Pareto reduction

Without reduction, the remaining purchase combinations are exponential. At each skeleton step labels are grouped by the adapter structural key and reduced to a Pareto antichain using the same resource dominance relation as the main Solver.

For a fixed event order and the same structural state, a label that is no better in every tracked resource cannot make a future fixed event / shop choice legal when its dominator cannot. Removing the dominated label is therefore safe under the same monotonic-resource assumptions already used by the exact Tower Solver.

Typical later-shop allocation families grow roughly with the number of distinct ATK/DEF/HP count combinations rather than `3^n`.

The report records:

```text
generatedTransitions
prunedDominated
peakActiveLabels
peakStructuralStates
```

so CI can detect unexpected state growth.

## 4. Exactness vocabulary

When the DP reaches the end of the skeleton without hitting its explicit label safety cap:

```text
exact = true
```

If at least one terminal label satisfies the canonical Tower goal:

```text
recoverable = true
```

If every possible later-purchase branch dies and the search was exhaustive:

```text
recoverable = false
exact = true
```

This proves only:

> no later purchase sequence can recover the forced error under this fixed event order.

It does **not** prove that a different enemy/door/pickup/backtracking order could not recover it.

If the label cap is reached:

```text
exact = false
```

and a missing recovery remains unknown. The cap may never be interpreted as unrecoverability.

## 5. V2 A/B result

The V2 candidate originally reported 6/58 no-recourse catastrophic mutations. All six are alternatives to the first three ATK purchases. That made the old catastrophic rate:

```text
6 / 58 = 10.3448275862%
```

against a 10% target.

The recovery-aware profile then exhaustively re-optimized **all later shop choices** for those six failures while keeping the 241-step event order fixed.

Result:

```text
exact classifications     = 58 / 58
recovered mutations       = 52
exact unrecoverable       = 6
unknown                    = 0
fixed-order recovery rate = 89.6551724138%
fixed-order trap rate     = 10.3448275862%
formerly catastrophic recovered = 0
```

The six exact fixed-order traps are:

```text
purchase 1: ATK -> DEF
purchase 1: ATK -> HP
purchase 2: ATK -> DEF
purchase 2: ATK -> HP
purchase 3: ATK -> DEF
purchase 3: ATK -> HP
```

All six searches ended with:

```text
all_branches_dead
```

rather than a label cap. The largest of these recovery searches needed only 6 simultaneous Pareto labels and 360 generated transitions. Therefore the result is not a computational-budget artifact.

### Interpretation

The no-recourse metric was **not** falsely pessimistic for this candidate. The first three ATK purchases are genuine hard breakpoints under the current event skeleton: if any one is replaced by DEF or HP, no combination of later purchases can restore legality of the same event order.

This does not yet prove a globally dead route because a player might change event order after the mistake. But it is strong enough to reject the idea of changing the difficulty metric merely to make V2 pass.

The design implication is now explicit:

> the next candidate should reduce early attack-breakpoint brittleness rather than relaxing the catastrophic threshold or reclassifying these six failures.

Potential repair levers should target the **early mandatory attack threshold** that makes purchases 1–3 forced. A broad late-game HP buff is a poor repair because it would loosen pressure without addressing the actual trap mechanism.

## 6. Why the promotion metric was not changed before measurement

It would have been methodologically wrong to replace the historical catastrophic gate with a more favorable recovery metric before measuring the new model. V2 validation therefore reported both layers side by side:

```text
ROBUST_NORECOURSE
ROBUST_RECOVERY
```

The A/B result above shows they coincide for V2. Therefore there is currently no empirical reason to weaken the existing 10% catastrophic constraint.

A future candidate can still benefit from recovery-aware analysis: if a no-recourse failure is later shown to be exactly recoverable, the two metrics should remain separate rather than silently overwriting the original observation.

## 7. Candidate validation fields

`review-candidate-v2-validation.js` emits:

```text
counterfactuals
recoveryAwareCounterfactuals
```

Important recovery fields:

```text
exactRecoveryClassifiedMutations
recoveredMutations
exactUnrecoverableMutations
unknownMutations
fixedEventOrderRecoveryRate
fixedEventOrderUnrecoverableRate
formerlyCatastrophicRecovered
exactUnrecoverableExamples
```

Directly replayable mutations need no further search and count as exactly recoverable. The expensive DP runs only for no-recourse failures.

## 8. Next extension

If an error is exactly unrecoverable under fixed event order, the next confidence layer is not automatically “dead route”. The player may alter event order after the mistake.

The future hierarchy is:

```text
no-recourse replay
  -> exact later-purchase recovery under fixed event order
  -> event-order recovery from the mistake boundary
  -> global player-response evidence
```

Each layer must retain its own confidence label rather than overwriting the weaker measurement.

For V2, the immediate priority is **not** to run six expensive global recovery searches. The candidate already fails the design target by one catastrophic neighbor, and whole-game event-order threshold coverage is independently incomplete at core6. The more valuable next engineering work is:

1. decompose the 4,578-HP event-order threshold proof at `core6 -> core7` using the replay-verified V2 reference witness;
2. identify a low-edit early-breakpoint repair for the next numeric candidate;
3. re-run purchase/event-order best response after that repair.

## 9. Production boundary

This recovery analyzer does not enable production writes.

```text
productionWriteAllowed = false
```

Its purpose is to improve the semantics of difficulty/forgiveness evidence before any generated numeric, placement, or topology change is promoted.
