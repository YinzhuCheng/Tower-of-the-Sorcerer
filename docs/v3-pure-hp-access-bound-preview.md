# Pure-HP access constraint preview for V3 c7 bounds

## Problem

The current c7 fixed-purchase upper bound credits every remaining positive HP reward for free. On V3 max-upper bridges, the entire 3400 flat HP credit is the four F8 `hpLarge` pickups.

At least some pickups may require positive combat damage even under an aggressively relaxed topology. A sound bound can exploit that fact, but only if it preserves the player's option to skip a pickup and avoids counting the same combat twice with the existing Gold-harvest lower bound.

## Relaxed access graph

`relaxedFloorAccessDamageLowerBound()` computes minimum optimistic combat damage from the F8 entrance `D` to a target cell.

The graph deliberately relaxes gameplay:

- walls `#` remain impassable;
- doors, cards, gates, runes, switches, shop tiles, stairs and ordinary items are free transit;
- enemy tiles cost battle damage under the existing bound's maximum optimistic future ATK/DEF and optimistic Ward availability;
- boss-phase semantics are relaxed like ordinary enemy occupancy;
- cost to reach/enter F8 from the current c7 bridge is ignored by starting at F8 `D`.

Every relaxation can only lower access cost, so the result is a lower bound on authoritative damage needed to reach that item.

## Skip-or-collect inequality

Suppose the old relaxation credits a pure HP pickup with objective contribution `r`, its relaxed minimum access damage is `c`, and the fixed-purchase scenario already subtracts a fractional Gold-harvest damage lower bound `h`.

A real route either:

```text
skip pickup    -> loses r from the old all-free reward credit
collect pickup -> pays at least c access damage
```

The harvest and access combat may be the same battles, so they must not be added. The collect case only proves total pre-final combat damage at least `max(h,c)`.

Relative to the old bound, one pickup therefore gives the safe additional reduction:

```text
min(r, max(0, c - h))
```

For several pickups the preview takes only the **largest single-item reduction**. It does not sum access costs, because paths to multiple pickups may share enemies.

This constraint is applied separately to every future fixed-purchase-count scenario, and the tightened scenarios are maximized again. Therefore the old max-over-scenarios structure is preserved.

## Current role

Version `pure-hp-access-upper-bound-preview-v0.1` is diagnostic-only:

```text
soundSingleRewardConstraint = true
proofBoundModified          = false
```

It reports the preview upper bound and per-item relaxed access costs on representative V3 c7 bridges. Only after GitHub evidence confirms useful tightening and tests validate the graph/lower-bound assumptions should the same formula be moved into the proof-level `tower-bounds.js` path.

## Safety tests

Repository tests cover:

- walls preserved and enemy entry charged at optimistic battle damage;
- doors/gates/non-enemy mechanics relaxed to zero cost;
- skip-or-collect penalty applied correctly;
- existing harvest damage removes overlapping access cost rather than being double-counted.

Any later proof integration must additionally compare the new bound against authoritative replayable certificates and retain the old bound as a regression oracle (`new <= old`, never below a known feasible objective).
