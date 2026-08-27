# V3 c6 tight-bound prefix screen

Before turning the c7 bridge proof into a two-level staged proof, measure the same sound bound on the c6 threshold boundary.

The screen collects up to 128 replay-verified `cores>=6` threshold goals under the current V3 fixed purchase policy. Every goal whose old fixed-purchase UB is still above 4459 receives the same bridge-level proof used at c7:

```text
old fixed-purchase UB
-> exact old-bound reconstruction
-> 0/1 discrete enemy-Gold harvest lower bound
-> strongest overlap-safe pure-HP access constraint
-> tight admissible UB
```

A sampled c6 prefix is `boundClosed` only when `tightUB<=4459`. Such a proof would eliminate all c7/suffix descendants from that exact prefix.

This workflow is diagnostic-only. The c6 goal collector itself is unchanged, so a `maxGoals`/budget-limited boundary remains globally incomplete even if every sampled prefix is closed.

If the screen closes a material fraction of c6 goals, the next staged analyzer will apply tight filtering at both levels: c6 prefixes first, then c7 bridges. If closure is negligible, the proof filter stays c7-only and effort returns to boundary coverage / residual suffixes.