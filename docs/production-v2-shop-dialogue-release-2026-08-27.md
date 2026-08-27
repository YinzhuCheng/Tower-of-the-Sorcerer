# Production v2: sparse shops, boss dialogue, and late-game pressure

Date: 2026-08-27

This release records the production-facing 10F rules promoted from `production-v2-shop-dialogue`.

## Player-facing changes

- Monster Codex and Floor Compass are initial possessions in the 10F browser demo.
- Shops exist only on F1, F5, and F9.
- Shop permanent-growth efficiency scales by floor:
  - F1: 100% (`ATK +5`, `DEF +5`, `HP +900`)
  - F5: 115% (`ATK +6`, `DEF +6`, `HP +1035`)
  - F9: 130% (`ATK +7`, `DEF +7`, `HP +1170`)
- The blurry merchant portrait is removed from the shop modal.
- The F2 vine gate no longer depends on the failed tiny replacement bitmap; production Canvas renders a full-cell vine arch.
- Every floor boss has an interactive pre/post encounter sequence capped at five dialogue turns. The F10 queen/core transition also has a phase dialogue.
- Enemy hover continues to disclose fixed battle information and Gold reward.

## Difficulty response

Sparse shops change when Gold can be converted, so the production greedy validator uses Compass recovery only when the demo has at most three shops and starts with Compass. The eight-floor research baseline therefore keeps its previous `current-only` shop behavior.

High-floor pressure is gradual rather than a blanket DEF increase:

- F6: HP ×1.01, ATK ×1.01, magic ×1.01
- F7: HP ×1.02, ATK ×1.01, magic ×1.02
- F8: HP ×1.04, ATK ×1.02, magic ×1.03
- F9: HP ×1.06, ATK ×1.03, magic ×1.04
- F10: HP ×1.08, ATK ×1.04, magic ×1.06

Explicit late checks:

- Palace Warden magic: 245
- Black Seal Keeper magic: 190
- Black Seal Keeper DEF: 96
- Void Core magic: 506

## Validation

Feature head before this release-record commit:

`686284fca3ae972b47ca59fcad0664e6bf7a67b5`

GitHub CI run `33112709830` passed all 314 source tests plus the production build self-check.

The sparse-shop production portfolio finishes 5 of 6 basic shop cycles. All six policies actually use shops on floors 1, 5, and 9; the sole failing basic policy is `hp-atk-def`, which fails at the final F10 pressure check rather than at an early soft lock.

The production build self-check also asserts:

- initial Codex + Compass ownership;
- removal of duplicate map pickups for those two relics;
- exact F1/F5/F9 shop placement and scaled effects;
- first-contact boss dialogue interception;
- every production boss dialogue sequence remains within 2–5 turns;
- final pressure constants match the promoted profile.
