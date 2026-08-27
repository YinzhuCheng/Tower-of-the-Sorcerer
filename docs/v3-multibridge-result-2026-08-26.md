# V3 multi-bridge profile result — 2026-08-26

First repository profile of `event-order-core-multibridge-chain-v0.1` at commit `6a627cf3c95131325a11397529bd025a4d2eea56`.

## Result

```text
reference HP             4459
semantic fingerprint     f7471edbeb30498d
status                   coverage-incomplete
exploitFound             false
exactNoExploit           false
```

c6 boundary:

```text
threshold-relevant prefixes 64
scheduled prefixes           6
boundary exact               false
stop                         maxGoals
```

Each of the six scheduled c6 prefixes produced exactly eight c7 goals because the per-prefix frontier hit its configured `maxGoals=8` limit:

```text
scheduled prefixes             6
c7 goals per prefix            8
replayable c7 bridges         48
cross-prefix dominated         0
active Pareto bridges         48
```

Thus bridge diversity is real; it is not collapsing to one resource-dominating c7 state.

## Bridge-family structure

The 48 active bridges are distributed evenly:

```text
372c6a062260416c  8
0e94b80722b677c4  8
3ec9cda5bd3c1722  8
17fa9018046596c7  8
4de85b048ef63346  8
6e624cd4e5d0df6a  8
```

The six scheduled c6 prefixes all have the same HP/ATK/DEF and terminal upper bound, but differ in Gold/cards/structural history:

```text
HP 1978, ATK 172, DEF 148, purchases 16, UB 5569
Gold ranges 878..902
card vectors differ
```

Their c7 bridges similarly tend to share:

```text
HP 3912, maxHP 23740, ATK 206, DEF 168, purchases 21, UB 4930
```

while Gold, card inventory and authoritative structural event sets differ.

## Scheduler problem exposed by v0.1

The v0.1 suffix scheduler globally sorted active bridges by:

```text
upper bound -> HP -> Gold -> bridge id
```

Because many bridges tie on UB/HP, the first four scheduled suffixes all came from the same c6 prefix `372c6a062260416c`:

```text
06adb7d7190d8e15  HP3912 Gold1047 p21 UB4930
24388c7f5e1d2554  HP3912 Gold1047 p21 UB4930
7d6b69ddc92baa7d  HP3912 Gold1047 p21 UB4930
da45e2b0a5cce71f  HP3912 Gold1047 p21 UB4930
```

All four 4k suffixes remained bounded/unknown and found no exploit. Their expansion profiles were similar, though not identical:

```text
expanded 4000 each
generated 31651..33561
prunedBound 4310..4928
late-floor expansion ratio 37.58%..44.43%
travel ratio 69.34%..70.41%
```

This profile does **not** justify spending more budget on the same prefix family first.

## Next scheduler

Use prefix-family round-robin scheduling:

1. group active c7 bridges by replay-verified c6 prefix certificate;
2. rank bridges inside each prefix by the existing UB/resource ordering;
3. take one bridge from each prefix before taking a second bridge from any prefix;
4. retain all exactness obligations — unscheduled bridges remain uncovered.

The next default profile changes suffix allocation from:

```text
4 bridges × 4000 expansions = 16000
```

to:

```text
6 bridges × 3000 expansions = 18000
```

so every currently scheduled c6 prefix family gets one terminal continuation without materially increasing total search cost.

No canonical balance changes are implied by this result.