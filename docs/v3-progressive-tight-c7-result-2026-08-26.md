# V3 progressive tight-filtered c7 frontier result — 2026-08-26

The progressive residual-goal scheduler was run on three representative V3 c6 prefix families with:

```text
initial c7 goal cap      32
max safety cap          256
target residual goals    32
```

All representative families required exactly one growth step:

```text
32 -> 64
```

At 32 goals the sound bridge tight bound had already closed enough c7 goals that fewer than 32 unresolved bridges remained. Re-running with a 64-goal cap replenished the unresolved set to the requested quota, so the scheduler stopped without launching 128 or 256 goal searches.

This justifies a 64-goal c7 frontier for the next integrated tight-filtered multi-bridge profile. The reason is not a generic larger-budget preference: 64 is the first empirically sufficient cap for obtaining 32 residual proof obligations after sound bound closure on the sampled V3 prefix families.

The next profile therefore keeps terminal work fixed at six residual suffixes x 3000 expansions while increasing c7 bridge discovery from 32 to 64 goals per scheduled prefix. Tight-bound-closed bridges consume no suffix budget.