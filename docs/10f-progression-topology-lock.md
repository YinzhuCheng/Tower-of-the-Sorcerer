# 10F progression topology lock

Status: **approved product direction, pending map implementation**.

This document supersedes the old assumption that every core floor must contain
one boss who individually seals its upward stair. It locks the progression
roles, boss groups, core distribution, key-relic gates and stair conditions
before any further room layout or numerical tuning. Numeric values are
intentionally out of scope until this topology is implemented and replayable.

The canonical eight-floor dataset remains a research baseline. Everything in
this document is implemented only through the ten-floor demo overlay.

## Design rules

1. A floor does not need a boss merely because it has an upward stair.
2. A boss group must have a readable purpose: protect a valuable choice, seal a
   milestone stair, or escalate the palace approach.
3. `guardianGates` protect optional/high-value rewards. `exitGuardians` protect
   upward stairs. A group may serve either role, but never accidentally both.
4. The seven magic cores remain exactly seven, but are recovered in deliberate
   clusters rather than one per floor.
5. Critical boss identity, core ownership, key-relic ownership, card gates and
   mandatory encounter order are frozen before roomization. Ordinary encounter
   slots and every numeric value remain available to the later solver/tuner.

## Locked campaign cadence

| Floor | Role | Boss / guardian structure | Locked result |
| --- | --- | --- | --- |
| F1 月白门廊 | Tutorial and first shop | No boss and no core; stairs are free once the introductory route is traversed | Teach damage reading, cards and the shop without ending in a mandatory boss tax |
| F2 森罗双钥 | First optional power spike | `catBoss` + `foxBoss` guard the **双钥秘库**; they are not stair guardians | Defeat both to open the vault containing `lucky`; recover the first two cores. The player may climb first and return with the initial Compass, but cannot complete the game without the cores |
| F3 深蓝航道 | Magic-damage lesson | No boss; tide mechanism is the main threshold | Make HP and magic damage legible before the first mandatory boss cluster |
| F4 锋刃锻炉 | Physical-breakpoint preparation | No boss; forge gate protects `weapon` | Make attack/defence breakpoints and the forge reward matter without a boss finale |
| F5 赤焰熔心 | Mid-game milestone | `whaleBoss` + `swordBoss` + `dragonBoss` are all `exitGuardians` | All three must fall to unlock the stairs; recover cores 3–5 after choosing at the F5 shop |
| F6 星镜书库 | Puzzle and final preparation | No boss; mirror sequence controls progression and `holy` remains a key preparation relic | Give the player a deliberate planning floor between major combat spikes |
| F7 虚影合鸣 | Four-guardian ascent | `astralBoss` + `shadowBoss` + `shadowWardBlade` + `shadowWardCantor` are all `exitGuardians` | All four must fall to unlock the palace; Astral and Shadow bosses recover cores 6–7, while the two new wardens supply pressure only |
| F8 静默前庭 | Palace outer ring | `palaceWarden` seals the stair; `hushVaultBlade` + `hushVaultCantor` remain a separate optional vault group | Preserve the existing high-value optional vault without turning it into a hidden mandatory tax |
| F9 倒悬星桥 | Final build conversion | `blackSealKeeper` seals the stair; F9 shop remains the final conversion point | Require a final build decision before the throne without adding another wide boss cluster |
| F10 无声王座 | Terminal ordeal | `finalQueen -> voidCore` is a single mandatory two-phase finale | No shop or later recovery; this is the highest pressure point, not another generic floor boss |

The regular-core cadence is therefore **2 + 3 + 2 = 7**. Visible Boss
pressure is intentionally clustered at F2, F5, F7, F8 and F10; F1, F3, F4 and
F6 exist to create contrast, preparation and meaningful route decisions.

## Locked critical ownership

| Asset | Owner / gate | Why it is fixed now |
| --- | --- | --- |
| Codex + Compass | Initial F1 relics | Deterministic combat information and revisit ability must exist before the optional F2 vault decision |
| Lucky Coin | F2 双钥秘库, opened by `catBoss` + `foxBoss` | Makes the first two-Boss challenge a genuine economic choice instead of decoration |
| Weapon | F4 forge | A visible physical-breakpoint reward before the F5 trio |
| Holy | F6 mirror sequence | A legible preparation choice before the F7 four-guardian ascent |
| Ward | F7 resource branch | A late magic-damage defensive option before palace and throne pressure |
| Core 1–2 | `catBoss`, `foxBoss` on F2 | First recovery is a deliberate pair, not two automatic consecutive floor endings |
| Core 3–5 | `whaleBoss`, `swordBoss`, `dragonBoss` on F5 | Mid-game milestone provides the central three-core recovery |
| Core 6–7 | `astralBoss`, `shadowBoss` on F7 | The final two cores are earned inside the four-guardian ascent |
| Unique Sun | F9, spent once at F10 throne seal | Keeps the final permission decision explicit and non-repeatable |

`shadowWardBlade` and `shadowWardCantor` are new F7 non-core Boss identities.
Their exact combat values, rewards and final map cells are deliberately not
chosen in this lock; they are later tuning inputs constrained by the locked
four-guardian stair rule.

## Implementation contract

The later topology overlay must set the following semantics, then the
roomization layer must place the corresponding anchors in authored rooms.

```text
F1  exitGuardians = []
F2  exitGuardians = []
    guardianGates.dualKeyVault = [catBoss, foxBoss]
F3  exitGuardians = []
F4  exitGuardians = []
F5  exitGuardians = [whaleBoss, swordBoss, dragonBoss]
F6  exitGuardians = []
F7  exitGuardians = [astralBoss, shadowBoss, shadowWardBlade, shadowWardCantor]
F8  exitGuardians = [palaceWarden]
    guardianGates.hushVault = [hushVaultBlade, hushVaultCantor]
F9  exitGuardians = [blackSealKeeper]
F10 finalQueen -> voidCore; no upward-stair requirement
```

The map implementation must make these relationships readable rather than
merely valid:

- F2: main route to the stair remains visible with the vault sealed; the twin
  guardians and Lucky vault read as a high-value side expedition.
- F5: three distinct chambers or wings reconverge at the sealed ascent; none
  can be skipped and their core rewards are visibly associated with the group.
- F7: four separate guardian approaches make remaining progress obvious; the
  stairs visually open only after all four are defeated.
- F8: the optional dual-guardian vault remains separate from the main warden
  route.
- F10: the throne seal, Queen and Core phase retain a single unambiguous final
  route with no post-seal recovery.

## Acceptance order

1. Add the demo-only topology overlay and source-of-truth contract tests.
   Verify zero/three/four guardian stairs and the F2/F8 reward gates through
   `engine.js`.
2. Roomize F1–F7 against this lock. Do not preserve the old per-floor Boss
   inventory, and do not tune numbers while maps are still changing.
3. Freeze all room maps and critical anchors. Regenerate topology metrics,
   screenshots and player-route baselines.
4. Only then run solver portfolios and the mutation/tuning tools. They may
   adjust declared ordinary encounter slots, rewards and numeric values, but
   may not move core bearers, guardian groups, key relics, card gates or stairs
   without revising this document and its tests.
5. Rebaseline CI quality gates from authoritative replays. Existing numeric
   witness and late-pressure figures are historical evidence, not targets for
   the new topology.

## Required regression assertions

- Exactly ten demo floors; the canonical eight-floor data remains untouched.
- Exactly seven core rewards with distribution `F2:2 / F5:3 / F7:2`.
- F1, F3, F4 and F6 upward stairs are not boss-locked.
- F2 vault stays closed until both early guardians are defeated, while F2's
  upstairs path remains available with that vault closed.
- F5 stair stays closed until all three named guardians are defeated.
- F7 stair stays closed until all four named guardians are defeated.
- F8 vault remains optional and does not alter the `palaceWarden` stair rule.
- F9 remains the last shop; the F10 throne seal consumes exactly one Sun card.
- UI stair and gate previews list all remaining guardians, not a legacy
  singular “Boss defeated” boolean.

No numerical target belongs in this document. Those targets are created only
after the topology and authored rooms are stable enough for the solver to
evaluate the game the player will actually play.
