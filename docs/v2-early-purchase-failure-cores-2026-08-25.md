# V2 early-purchase failure cores — 2026-08-25

## Evidence source

These failure cores were produced by `fixed-event-order-purchase-recovery-v0.2-failure-core` inside the normal V2 Review Validation workflow after authoritative incremental replay. The recovery DP still branches over every later ATK/DEF/HP shop choice under the fixed event skeleton and Pareto-reduces only resource-dominated labels.

All six previously catastrophic V2 single-purchase mutations remain exact-unrecoverable under that fixed event order, but they localize into two semantic failure families.

## Cluster A — one of purchases 1–3 changed from ATK to DEF

```text
purchase  forced  first universal failure          HP   maxHP  ATK  DEF  Gold  surviving early plan
1         DEF     f5:enemy:dragonBoss#1 step 101  480   8510   97   94  1780  DEF,ATK,ATK
2         DEF     f5:enemy:dragonBoss#1 step 101  405   8510   97   94  1780  ATK,DEF,ATK
3         DEF     f5:enemy:dragonBoss#1 step 101  380   8510   97   94  1780  ATK,ATK,DEF
```

Every active recovery branch is killed by the same authoritative replay reason:

```text
预计损伤会使生命归零
```

Interpretation: later purchase optimization cannot compensate for losing one of the first three ATK purchases before the F5 dragonBoss breakpoint. The three mutations converge to the same ATK/DEF/Gold state and differ mainly in residual HP timing.

## Cluster B — one of purchases 1–3 changed from ATK to HP

```text
purchase  forced  first universal failure           HP   maxHP  ATK  DEF  Gold  surviving early plan
1         HP      f5:enemy:flameCaster#3 step 93   638   7810   86   70  1372  HP,ATK,ATK
2         HP      f5:enemy:flameCaster#3 step 93   723   7810   86   70  1372  ATK,HP,ATK
3         HP      f5:enemy:flameCaster#3 step 93   876   7810   86   70  1372  ATK,ATK,HP
```

Again every surviving recovery branch dies for the same reason:

```text
预计损伤会使生命归零
```

Interpretation: the HP purchase itself is not enough to compensate for the lost early ATK breakpoint. The three mutations converge to ATK 86 / DEF 70 / Gold 1372 before the same F5 flameCaster event.

## Consequence for V3 design

The six catastrophic cases are not six unrelated failures. They are two localized F5 breakpoint families:

1. `ATK -> DEF` family -> `dragonBoss#1` at step 101;
2. `ATK -> HP` family -> `flameCaster#3` at step 93.

The next tuner work should run localized finite-difference sensitivity around those two semantic events and the resource state immediately before failure. Candidate repair levers should be evaluated separately for the two families, for example enemy DEF/HP/special pressure, nearby earlier ATK resources, or shop economics.

Do **not** globally loosen the catastrophic-rate gate and do **not** assume one scalar repair should solve both families. A numeric V3 candidate should first demonstrate that at least two of the six failures become recoverable (target <= 4/58 = 6.90%), then re-run pressure, event-order best response, and all historical witnesses.

This evidence is fixed-event-order recovery localization, not a global solvability or global event-order impossibility proof.
