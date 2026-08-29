# 10F progression topology lock

Status: **frozen in the 10F demo overlay on 2026-08-29.** Static topology and
card-state checks are green, and GitHub Actions `10F Screenshot Gallery` run
24 verified the authored maps in real Chrome. Future solver/mutator work may
change only ordinary encounter placement and numbers; it must not rewrite this
lock without an explicit topology revision.

This document supersedes the old assumption that every core floor must contain
one boss who individually seals its upward stair. It locks the progression
roles, boss groups, core distribution, key-relic gates and stair conditions
before any further room layout or numerical tuning. Numeric values are
intentionally out of scope until this topology is implemented and replayable.

The canonical eight-floor dataset remains a research baseline. Everything in
this document is implemented only through the ten-floor demo overlay. Numeric
rebaselining begins only after this locked map state.

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
6. Every rendered `door:` or `gate:` must separate two otherwise disconnected
   regions while closed. A gate that can be walked around, or only opens onto
   an empty dead end, is removed rather than kept as visual decoration.

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

## Physical barrier contract

The map may not rely on a label in `puzzles` alone: the named reward or goal
must be physically unreachable until its gate is opened. The current authored
locks are deliberately narrow and readable. The room-level card flow is
specified in [10F room-card topology](10f-room-card-topology.md).

| Floor | Real barrier | Protected outcome |
| --- | --- | --- |
| F1 | Star / Moon doors | Optional DEF tutorial alcove / mandatory upper stair |
| F2 | `vine`, `dualKeyVault` | Main-route mechanism / Lucky Coin after both early guardians |
| F3 | Star / Moon doors, `tide` | West / east tide switches / upper stair |
| F4 | Moon door, `forge`, Star door | Forge switch / Weapon / mandatory upper stair |
| F5 | Star / Moon doors, `ember` | Whale / Sword guardian wings / Shield side cache; all three guardians still lock the stair |
| F6 | Star door, `mirror`, Moon door | Final rune / Holy / mandatory upper stair |
| F7 | Star / Moon doors, `tri` | Two ritual guardians / Ward branch; all four guardians still lock the stair |
| F8 | Star / Moon doors, `hush`, `hushVault` | Hush B / Hush A outer-ring routes; Dual cache and Warden ante-room; optional guardian vault |
| F9 | Star / Moon doors, `blackstar` | Final rune / last-shop conversion room / Black Seal Keeper ante-room |
| F10 | Moon door, `throneSeal` | Final side-room preparation / Final Queen and Core phase |

All remaining card doors now protect a declared room or permission. Card
amounts are topology resources and are verified independently of combat
numbers; enemy records, shop effects and reward values remain untouched until
the later numeric pass.

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
  route; Star / Moon doorways visibly lead to the two independent hush
  switches before the Warden gate.
- F9: the star-locked final rune, the free A/B bridge calibrators and the
  moon-locked final shop each read as separate rooms before the Black Seal
  Keeper forecourt.
- F10: the throne seal, Queen and Core phase retain a single unambiguous final
  route with no post-seal recovery; the Moon side-room is visibly optional.
- Every remaining visual barrier has two neighbors in distinct open regions,
  and every key reward listed above is unreachable before its named barrier
  opens.

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
- The barrier-topology regression rejects any non-separating `door:` or
  `gate:` tile and verifies the protected rewards/finale are actually behind
  their corresponding locks.
- The static card-state graph verifies the campaign card ledger never turns
  negative and that every card spend has a protected room, puzzle permission,
  key reward, shop or final encounter on its far side.

No numerical target belongs in this document. Those targets are created only
after the topology and authored rooms are stable enough for the solver to
evaluate the game the player will actually play.
