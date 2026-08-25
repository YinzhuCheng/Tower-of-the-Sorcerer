# V3 purchase-lag economy bridge result — 2026-08-26

This document records the first `event-order-core-economy-bridge-wave-v0.1` run at commit `99f47f55186a77321eca853429e187cb952cf05e`.

The workflow completed successfully. It found no replayable terminal exploit and deliberately remains `coverage-incomplete`; the diagnostic never claims exact no-exploit.

## Selected bridge stage

All six scheduled c6 prefix families exposed the same current 8-goal purchase histogram:

```text
p20: 4 bridges
p21: 4 bridges
```

The purchase-lag selector correctly chose one p20 bridge from each family, always preferring the highest-Gold bridge within that immediate lagging stratum:

```text
prefix             HP    Gold  p   UB
8b61f0afbd643bd1  3762  1646  20  4930
46f5edcacdc74680  3762  1592  20  4930
2e9668c6f625d0c8  3762  1586  20  4930
32e3ba946a3e6472  3762  1576  20  4930
4337b0c666aa6cee  3762  1576  20  4930
1abc5e4a8406d4f3  3762  1568  20  4930
```

This verifies that the diagnostic is sampling the intended economic stage: one fewer completed fixed-policy purchase than the p21 wave, 150 less current HP, and substantially more retained Gold.

## Equal-budget suffix result

Each selected bridge received the same late zero-damage closure + b500 priority suffix with 3000 expansions:

```text
prefix             generated  prunedBound  travel ratio  F7/F8 ratio  result
8b61f0afbd643bd1     25766        3882        69.37%        47.70%     maxExpanded
46f5edcacdc74680     25672        3860        69.43%        47.17%     maxExpanded
2e9668c6f625d0c8     25672        3860        69.43%        47.17%     maxExpanded
32e3ba946a3e6472     25672        3860        69.43%        47.17%     maxExpanded
4337b0c666aa6cee     25672        3860        69.43%        47.17%     maxExpanded
1abc5e4a8406d4f3     25672        3860        69.43%        47.17%     maxExpanded
```

All six were non-exact and none produced terminal HP >4459.

## Comparison with the p21 prefix-round-robin wave

The p21 family-diverse wave had late-floor expansion ratios around 40.9%..44.9%. The p20 purchase-lag wave raises this to about 47.2%..47.7% under the same 3000-expansion suffix budget.

Therefore purchase timing is a meaningful search dimension: retaining Gold and leaving the next fixed purchase inside the suffix moves more finite-budget search into F7/F8. It still does not expose an exploit in the current sampled bridges.

## New bottleneck

The dominant visible truncation is now the c7 bridge frontier itself, not merely which of the first eight bridges receive suffix budget.

Every scheduled prefix frontier stops at:

```text
maxGoals = 8
purchase histogram = 4 x p20 + 4 x p21
```

This perfectly balanced 4/4 split is suspiciously aligned with the discovery cap. We do not yet know whether a larger c7 frontier contains:

- p19 or p22 purchase strata;
- more extreme Gold/card states within p20/p21;
- additional structural families with materially different suffix behavior;
- or simply more near-duplicate p20/p21 states.

The next diagnostic should therefore expand a small number of representative c7 frontiers to 32 active goals and measure frontier diversity before assigning more terminal suffix budget. This is higher-information than increasing the same p20/p21 suffix budget by an order of magnitude.
