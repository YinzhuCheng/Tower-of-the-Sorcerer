# V3 c6 factorization audit

The c6 threshold boundary still grows one structural goal per configured goal slot at 64, 128, 256 and 512 goals. This diagnostic therefore stops blind cap growth and asks which parts of the compact state actually create that multiplicity.

The audit is deliberately non-pruning. It collects up to 512 replay-verified, threshold-relevant c6 goals and reports:

- Pareto cardinality under the current full frontier key;
- a proof-safe canonicalization that erases switch history and sequence progress only after every `gate:*` tile on that floor is gone;
- diagnostic-only cardinalities with selected fields omitted, to measure their contribution without using them as proof quotients;
- per-floor dynamic-event signature counts and variable slots grouped by event type;
- purchase, relic, visited-floor and component cardinalities;
- the number of c6 goals that still expose an immediately reachable non-boss enemy with exact combat damage `0` after Lucky has been acquired;
- the number and signatures of remaining zero-damage non-boss enemies under the same Lucky condition;
- the number of goals that currently expose an affordable fixed-policy shop action.

The monotone candidates matter because both can potentially be moved from branching into normalization under the fixed-purchase subproblem:

1. With Lucky already owned, killing a non-boss enemy that costs exactly zero HP only adds Gold/rewards, opens topology and cannot make later combat worse because hero stats are monotone.
2. Under a fixed purchase sequence, an affordable purchase is weakly beneficial when the shop is already reachable: Gold has no other use, the future option is predetermined, prices depend only on purchase count, and earlier ATK/DEF/HP is never worse (HP before Holy is better or equal).

Neither rule is promoted by this audit alone. The next implementation step is chosen from the measured source of c6 multiplicity and must preserve authoritative replay and proof exactness semantics.
