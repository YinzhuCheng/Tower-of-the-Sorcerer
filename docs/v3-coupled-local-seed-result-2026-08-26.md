# Coupled forgiveness + late-pressure result — 2026-08-26

This document records the first successful local coupled search from `v2-coupled-forgiveness-pressure-compensation-v0.1` at commit `b62f89ff60c909fbc09d03280b491a210203c55c`.

It is a **dry-run V3 seed**, not a production balance and not yet a globally validated review candidate.

## Fixed F5 forgiveness seed

The failure-core stage selected:

```text
flameCaster.def: 70 -> 44
dragonBoss.atk:  114 -> 111
```

On its own this reduced catastrophic purchase mistakes but made the game far too soft:

```text
terminal HP = 7627
minimum normalized margin = 66.72%
catastrophic = 3 / 58
```

## Single-lever F6-F8 compensation frontier

The coupled search restricted pressure compensation to enemy hazard fields on F6-F8, so it could not directly undo the F5 repair. The most efficient fixed-witness pressure boundaries included:

```text
cometArcher.atk:      128 -> 200   rel 56.25%
mirrorDoll.def:        58 -> 96    rel 65.52%
mirrorDoll.atk:       116 -> 199   rel 71.55%
voidCore.def:          98 -> 171   rel 74.49%
starWitch.def:         51 -> 92    rel 80.39%
cometArcher.def:       48 -> 88    rel 83.33%
voidCore.hp:         3400 -> 7940  rel 133.53%
crownKnight.atk:      181 -> 434   rel 139.78%
voidCore.magicPower:  164 -> 398   rel 142.68%
astralBoss.atk:       137 -> 342   rel 149.64%
```

These boundaries are seeds on the repaired fixed witness. Every Top-K candidate was subsequently re-optimized over purchase choices and rechecked over all 58 counterfactual/recovery cases.

## Local-pass candidates

### Selected: F6 comet archer attack

Combined edits relative to V2:

```text
flameCaster.def: 70 -> 44
dragonBoss.atk:  114 -> 111
cometArcher.atk: 128 -> 200
```

After authoritative replay + purchase 1-opt + all 58 counterfactual/recovery checks:

```text
terminal HP                    4459
minimum normalized HP margin   0.24545454545454545
catastrophic mutations         4 / 58
exact unrecoverable            4
recovery unknown               0
purchase local optimal         true
local coupled gate             PASS
witness hash                   5f2eaa7dcee33508
semantic fingerprint           f7471edbeb30498d
purchase plan                  DEF DEF DEF ATK ATK ATK ATK DEF ATK ATK ATK DEF ATK ATK ATK ATK ATK HP HP ATK HP HP HP HP HP HP HP HP HP
```

This is currently the lowest-relative-edit coupled local-pass seed.

### Alternate: F6 mirror doll attack

```text
mirrorDoll.atk: 116 -> 199
terminal HP: 4263
margin: 0.2420656266810113
catastrophic: 3 / 58
exact unrecoverable: 3
unknown: 0
local optimal: true
local coupled gate: PASS
semantic fingerprint: f7471edbeb30498d
```

### Alternate: F8 crown knight attack

```text
crownKnight.atk: 181 -> 434
terminal HP: 1137
margin: 0.2486320857955789
catastrophic: 3 / 58
exact unrecoverable: 3
unknown: 0
local optimal: true
local coupled gate: PASS
semantic fingerprint: f5410028d33c719d
```

Although it passes the current local scalar gates, the crown-knight solution is a much larger edit and creates a much lower terminal-HP outcome, so it is not preferred over the F6 compensation solutions.

## Next trust stage

The selected comet-arher seed must now be treated as a new V3 reference candidate with `productionWriteAllowed=false` and checked against stronger player models:

1. deterministic V3 reference rebuild and semantic/purchase-policy identity;
2. all 58 counterfactuals + exact fixed-event-order recovery;
3. independent existence evidence (budget exhaustion stays `unknown`, not `infeasible`);
4. whole-game fixed-purchase event-order threshold search above 4459;
5. replay-verified c6->c7 transition and b500 c7->terminal suffix search;
6. persist any stronger exploit as a counterexample before retuning.

No canonical `src/game/data.js` values are changed by this result.