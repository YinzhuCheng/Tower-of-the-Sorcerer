# V3 c6 factorization audit result — 2026-08-27

Commit under audit: `4596db4675dcacace516b67506a1468abbcf4398`.

The 512-goal c6 audit completed successfully under the V3 fixed-purchase threshold model (`terminal HP > 4459`). It confirms that the c6 blow-up is **not** caused by puzzle-history, visited-floor, or current-component bookkeeping.

```text
coverageExact                    false
stoppedReason                    maxGoals
active c6 goals                  512
replay-verified relevant goals   512
```

## Projection cardinality

```text
current full frontier key              512 structural states
safe dead-puzzle canonicalization      512 structural states
diagnostic omit visited-floor mask     512 structural states
diagnostic omit component anchor       512 structural states
immediate action-surface signatures     12
```

Erasing switch history / rune progress after all gates on a floor are gone is proof-safe but provides no compression on this sample. The same is true, diagnostically, for visited-floor and current-component axes. Therefore the next reduction must not be an unsafe field deletion.

## Other state axes

```text
shopPurchases histogram   p3: 3, p15: 44, p16: 465
relic signatures          2
visited signatures        1
component signatures      2
```

No audited c6 goal currently exposes an affordable fixed-policy shop action:

```text
goalsWithAffordableFixedShop = 0 / 512
```

Therefore fixed-shop auto-purchase is not a useful c6 reduction at this point.

## Zero-damage enemy evidence

Every audited c6 goal still contains many non-boss enemies that are already exact zero-damage fights after Lucky has been acquired:

```text
goals with any remaining Lucky-safe zero-damage enemy  512 / 512
remaining safe enemy count histogram:
  11 -> 23 goals
  12 -> 164
  13 -> 225
  14 -> 82
  15 -> 14
  16 -> 4
unique remaining-safe enemy-set signatures              67
```

Only a minority are immediately reachable before any further normalization:

```text
goals with reachable zero-damage non-boss enemy   27 / 512
reachable count:
  0 -> 485
  1 -> 23
  2 -> 4
```

This still motivates a recursive monotone closure: killing one exact-zero-damage enemy can enlarge the walkable component, after which the existing safe item/switch normalization may expose another zero-damage enemy. The effect must therefore be measured after closure, not inferred from the first action surface alone.

## Floor-level residual variation

```text
floor  variable slots  unique signatures  variable types
F1     6               25                 enemy4 / door1 / item1
F2     3                3                 enemy2 / door1
F3     3                5                 enemy1 / door1 / item1
F4     8               17                 item2 / enemy4 / door2
F5     2                4                 enemy1 / door1
F6     5               18                 enemy3 / item1 / door1
F7     0                1                 -
F8     0                1                 -
```

The diversity is therefore lower-floor residual event order, while the immediate continuation surface has only 12 signatures.

## Next proof-preserving reduction

Implement a **scoped normalization for the fixed-purchase event-order proof only**:

- Lucky relic must already be owned after the ordinary normalization pass;
- action must be a reachable enemy tile;
- enemy must be non-boss, non-final, and have no `phaseNext`;
- authoritative `calculateBattle()` must return `winnable=true` and `totalDamage===0`;
- enemy Gold and any direct numeric reward must be nonnegative;
- direct reward must not advance `core` progress;
- the forced kill is executed by the ordinary adapter / `engine.js`, and its step remains in the certificate;
- rerun existing safe item/switch normalization after each forced kill;
- repeat to a fixed point.

Do **not** add fixed-shop auto-purchase from this audit: it has zero measured opportunity at c6. Do **not** change the unrestricted Tower solver. Promotion of this closure requires tests plus a fresh c6 growth comparison.
