# V3 Compass cross-floor zero-damage counterexample hunt

The Compass-assisted cross-floor closure further reduces the c6 search relative to current-floor-only normalization:

```text
512-cap expanded      3379 -> 2451
generated            17748 -> 13666
search structural     8794 -> 7380
```

It also canonicalizes almost every c6 goal to `shopPurchases=17`, showing that previously deferred lower-floor zero-damage Gold can be harvested safely before later fixed-policy purchases.

This hunt therefore uses the cross-floor closure throughout the c6→c7→terminal counterexample search while keeping the V3 reference and acceptance replay on the ordinary fixed-purchase adapter.

## Profile

```text
c6 goal cap                    64
scheduled c6 prefixes           6
c7 goal cap / prefix           32
residual suffix portfolio       6, prefix-round-robin
suffix expanded / bridge     3000
suffix generated / bridge   50000
late priority slack bucket     500 HP
```

Bridge tight bounds are still evaluated with the ordinary fixed-purchase adapter. The closure only canonicalizes the search order of events proven monotone under Lucky + Compass + round-trip-component invariants.

## Exploit acceptance

A suffix threshold crossing is not accepted from the closure model alone. The analyzer must:

1. replay the suffix certificate under the cross-floor search adapter;
2. concatenate c6 prefix + c7 transition + suffix certificates into a numeric-agnostic event-order step witness;
3. replay that complete witness from the canonical start using the ordinary V3 fixed-purchase adapter / authoritative engine;
4. require the ordinary replay objective to equal the claimed terminal HP and exceed 4459.

Only then is V3 considered defeated by event order. Otherwise the result remains diagnostic / coverage-incomplete.
