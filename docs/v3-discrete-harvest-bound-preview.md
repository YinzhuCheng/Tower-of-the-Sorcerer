# V3 discrete Gold-harvest + pure-HP access bound preview

## Motivation

The current fixed-purchase proof bound uses a fractional minimum-cost relaxation for enemy Gold. That is admissible, but it allows the bound to take a fraction of an enemy's Gold while paying the same fraction of its combat damage. Real enemies are indivisible.

After the c7 bound decomposition showed that high-purchase scenarios can dominate the upper bound, this is a higher-value tightening axis than merely searching more p20/p21 bridge variants.

## Discrete relaxed harvest

For every remaining enemy tile, under the same maximum optimistic future ATK/DEF and optimistic Ward/Lucky assumptions as the old bound, construct one offer:

```text
value = optimistic enemy Gold
cost  = optimistic battle damage
```

Then solve an exact 0/1 dynamic program for the minimum total combat damage needed to obtain at least the scenario's required enemy Gold.

The DP still ignores topology, doors, cards, ordering and other constraints, so it remains a relaxation. It is tighter than the fractional knapsack because enemy offers cannot be partially selected.

If an enemy is still unwinnable under the maximum future combat-stat envelope, its Gold is excluded from the discrete relaxation: no authoritative pre-terminal state can kill it with weaker stats.

## Combination with pure-HP access

The discrete Gold-harvest lower bound `h_d` can overlap the relaxed access path to a pure HP pickup. Therefore the access constraint is not added directly.

For a pickup with old credited contribution `r` and relaxed access damage `c`, the additional access reduction is:

```text
min(r, max(0, c - h_d))
```

Only the strongest single pure-HP constraint is used, so shared access paths are never summed.

For each fixed future purchase-count scenario:

```text
preview upper = HP-before-final
                - discrete harvest damage
                - non-overlapping single-HP access penalty
                - final-boss damage lower bound
```

The preview then maximizes across purchase-count scenarios exactly like the old fixed-purchase bound.

## Current role

This is still diagnostic-only:

```text
proofBoundModified = false
```

The next GitHub profile measures:

- zero-damage enemy Gold capacity;
- total relaxed harvest Gold;
- number of positive-damage offers;
- fractional vs discrete harvest damage for the best scenario;
- pure-HP access overlap;
- representative preview upper bounds versus the V3 threshold 4459.

Only if this preview is materially tighter and regression evidence supports admissibility will the discrete relaxation be considered for the proof-level suffix adapter.