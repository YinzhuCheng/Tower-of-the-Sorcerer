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

## 5. Why this metric is separate from the promotion gate for now

The V2 candidate originally reported 6/58 no-recourse catastrophic mutations. All six are alternatives to the first three ATK purchases. That made the old catastrophic rate:

```text
6 / 58 = 10.3448%
```

against a 10% target.

It would be methodologically wrong to replace that gate with a more favorable recovery metric before measuring the new model. V2 validation therefore reports both layers side by side:

```text
ROBUST_NORECOURSE
ROBUST_RECOVERY
```

The historical hard gate remains unchanged during this A/B period.

Only after the exact recovery profile is inspected should the difficulty model decide which quantity represents the intended “single-error forgiveness” design target.

## 6. Candidate validation fields

`review-candidate-v2-validation.js` now emits:

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

## 7. Next extension

If an error is exactly unrecoverable under fixed event order, the next confidence layer is not automatically “dead route”. The player may alter event order after the mistake.

The future hierarchy is:

```text
no-recourse replay
  -> exact later-purchase recovery under fixed event order
  -> event-order recovery from the mistake boundary
  -> global player-response evidence
```

Each layer must retain its own confidence label rather than overwriting the weaker measurement.

## 8. Production boundary

This recovery analyzer does not enable production writes.

```text
productionWriteAllowed = false
```

Its purpose is to improve the semantics of difficulty/forgiveness evidence before any generated numeric, placement, or topology change is promoted.
