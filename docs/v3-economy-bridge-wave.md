# V3 purchase-lag economy bridge wave

## Motivation

The V3 multi-bridge analyzer has now sampled one c7 suffix from each of six distinct c6 prefix families. That removed a prefix-family scheduling bias, but all six selected bridges were still in the same purchase-progress stage:

```text
shopPurchases 21
HP            3912
Gold          about 1023..1101
upper bound   4930
```

The complete c7 bridge frontiers also contain a second Pareto-incomparable economic stage in every family:

```text
shopPurchases 20
HP            3762
Gold          about 1304..1646
upper bound   4930
```

These p20 bridges leave the next fixed-policy shop purchase inside the terminal suffix instead of completing it before the c7 boundary. That changes purchase timing, retained Gold and card/structural history, so it is a different player-response subproblem rather than merely another map-event permutation.

## Diagnostic algorithm

`analyzeThresholdCoreEconomyBridgeWave()` repeats the authoritative c6/c7 staged construction but changes only the bridge scheduler.

For each scheduled c6 prefix:

1. collect a c7 Pareto goal frontier under the same V3 fixed purchase policy and `terminal HP >4459` threshold adapter;
2. authoritative-replay every threshold-relevant c7 certificate;
3. list the distinct `shopPurchases` strata in descending order;
4. select the strongest bridge in the stratum immediately behind the maximum purchase count;
5. rank candidates within that stratum by admissible upper bound, then retained Gold, then HP;
6. run the same late zero-damage closure + b500 terminal suffix.

For the current bridge sample, maximum progress is p21 and the immediately lagging stage is p20.

The selector deliberately chooses the **nearest** lagging stage. If a future frontier contains p22 / p21 / p19, the diagnostic chooses p21, not the oldest p19 state.

## Correctness role

This is an exploit-hunting diagnostic, not an exact proof analyzer.

It may return:

```text
exploit-found
coverage-incomplete
```

but never `exactNoExploit=true`, even if every selected economy bridge exhausts. The sampled c6 prefixes, capped c7 goal frontiers and unsampled structural/economic bridge states remain explicit proof obligations.

Any discovered terminal HP >4459 route must be converted from prefix + transition + suffix certificates into a numeric-agnostic event-order witness and authoritative-replayed from the canonical engine start before being accepted as a V3 counterexample.

## Initial profile

```text
c6 relevant boundary cap       64 goals
scheduled c6 families           6
c7 goal cap per prefix           8
selected bridge per prefix       1 purchase-lag/high-Gold
suffix expanded per bridge    3000
suffix generated per bridge  50000
late priority slack bucket     500 HP
```

The profile is intentionally comparable to the six-family p21 wave so differences in search behavior can be attributed to purchase-stage timing rather than a large budget change.
