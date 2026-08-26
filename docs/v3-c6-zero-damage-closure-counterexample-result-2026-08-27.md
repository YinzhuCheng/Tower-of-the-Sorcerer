# V3 zero-damage-closure counterexample hunt result — 2026-08-27

Final hunt head: `a2934a71487ea094bd7d5c3bcdc468032e4eeccb`.

The six-family counterexample-first suffix profile completed successfully. It found no replayable terminal HP >4459 route and remains `coverage-incomplete`.

```text
reference HP        4459
exploitFound        false
exactNoExploit      false
active c7 Pareto     135
bound closed           0
residual              135
scheduled suffixes      6
```

The active-bridge count differs from the preceding bridge screen because the top-six c6 prefix set is selected from a capped, non-exact c6 frontier and closure normalization changes the ordering of equal/high-upper-bound prefixes. This does not affect the interpretation: every scheduled bridge is replay-verified and every unscheduled bridge remains an explicit proof obligation.

## Six bounded suffixes

All selected starts had the same high-resource envelope:

```text
shopPurchases   21
HP            5792
Gold          1359
old UB        6810
tight UB      6465
slack vs 4459 2006
```

Each suffix received 3000 expansions / 50000 generated-state budget. Results:

```text
prefix            expanded  generated  prunedBound  late-floor  stop
0987782e363249d5     3000      22946        2         36.03%    maxExpanded
1357cfeae8551b77     3000      23846        0         37.43%    maxExpanded
2246efa85a0d4863     3000      23591        2         38.23%    maxExpanded
23e5dc5d2f11a7fa     3000      23899        0         37.73%    maxExpanded
31f2d8b8ac5f8c6e     3000      25529        0         42.20%    maxExpanded
0987782e363249d5     3000      22686        0         35.23%    maxExpanded
```

No suffix produced a certificate, so there was no candidate exploit to combine/replay on the ordinary fixed-policy adapter.

## Interpretation

The key signal is not merely `exploit=false`; it is:

```text
tight slack = +2006 HP
prunedBound = 0..2 / 3000 expansions
```

The bridge proof is therefore not close to closing these states. The terminal search is spending almost all work on event-order / travel / optional-harvest permutations.

Blindly multiplying the same suffix budget is low-value. The c6 factorization audit already showed that each c6 goal retains 11–16 Lucky-safe exact-zero-damage ordinary enemies somewhere in the remaining tower, while only a small subset is reachable on the current floor. The next reduction should target this remaining cross-floor permutation source.

## Next normalization candidate

A Compass-assisted cross-floor zero-damage closure may be sound only with an additional round-trip invariant:

- Lucky and Compass are already owned;
- only already visited floors are eligible;
- every forced enemy passes the existing non-boss / non-phase / exact-zero-damage / monotone-reward gate;
- before leaving the current floor, a self-teleport probe must show that the current compact `componentAnchor` equals the component reached by Compass returning to that floor's `D` anchor;
- every actual teleport, kill and return remains an ordinary certificate step;
- after returning, the ordinary safe normalization and current-floor zero-damage closure rerun to a fixed point.

If the round-trip component invariant fails, cross-floor closure must not fire for that state. This preserves current-floor reachability instead of assuming Compass can return to an arbitrary coordinate.
