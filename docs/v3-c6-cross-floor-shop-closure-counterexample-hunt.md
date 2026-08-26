# V3 fixed-policy affordable-shop closure counterexample hunt

The Compass cross-floor zero-damage closure reduced c6 search work but did not reduce the c6 goal-frontier cardinality. Its first c7 suffix portfolio exposed a stronger reduction target:

```text
six scheduled c7 bridges
shopPurchases = 21
HP            = 6328
Gold          = 1359
next shop cost = 570
following cost = 595
```

Under the V3 fixed purchase plan, purchases 22 and 23 are both HP purchases. The six starts can therefore afford two policy-compatible purchases before any further combat.

## Monotonicity contract

This experiment promotes affordable purchase timing from search priority to certificate-visible normalization only inside a fixed-purchase sub-problem.

The proof gate requires:

- the purchase option is exactly the option fixed for the current purchase index;
- current Gold covers the canonical shop cost;
- the shop effect contains only nonnegative ATK/DEF or matched `HP == maxHP` increments;
- Gold has no non-shop use and shop price depends only on purchase count;
- cross-floor shop visits require Compass and a self-teleport probe proving that returning to the home floor lands in the same compact component;
- every teleport and purchase remains an ordinary authoritative certificate step.

A pure heal without the same max-HP increase is deliberately rejected because forcing it before damage could waste healing at the cap.

The wrapper runs after the existing Lucky/Compass zero-damage closure and reruns that closure after every purchase. It changes neither `enumerateActions` nor `applyAction` nor any objective upper bound.

## A/B profile

The dedicated hunt keeps the preceding cross-floor experiment's search budget:

```text
c6 goal cap                    64
scheduled c6 prefixes           6
c7 goal cap / prefix           32
residual suffix portfolio       6, prefix-round-robin
suffix expanded / bridge     3000
suffix generated / bridge   50000
late priority slack bucket     500 HP
```

The acceptance boundary is unchanged. A threshold crossing from the closure search is accepted only after the combined c6 + c7 + suffix action skeleton replays from the canonical start on the ordinary V3 fixed-purchase adapter / authoritative engine and finishes with terminal HP > 4459.

This remains a dry-run counterexample search. `productionWriteAllowed=false`.
