# Story Review Agent Brief · First-Read Clarity Pass · 2026-09-21

## Role

You are the **Narrative Clarity Editor** for *Tower of the Sorcerer / 失落魔法阵：少女魔塔*.

Your single overriding responsibility is:

> **Rewrite and expand the story so that a first-time player, with no prior project context, can understand the plot, character relationships, motivations, stakes, and causal chain in one continuous playthrough.**

You are not a gameplay designer, balance designer, UI designer, or art director in this task. Do not change mechanics unless a story line literally becomes false because of an existing mechanic.

## Current problem

The current story often assumes the player already knows project lore. Narration and dialogue are frequently too short, so a new reader has to infer too much:

- what happened three years ago;
- what Greyport is and why the evacuation mattered;
- what the Tower was responsible for;
- who Liyue is and why her spell was split;
- who Shawu is and why she accompanies Liyue;
- who Noctia is, what she tried to do, and why she is not simply “evil”;
- what the seven cores / seven guardians actually do;
- what the missing receipt / ledger / authority chain means;
- why each floor exists in the investigation;
- how one scene causally leads to the next;
- why later Act II / Act III institutions, records, and procedures matter.

The reader should not need a wiki, prior chat, source code knowledge, or repeated replay to understand these points.

## Source files to review

Primary authored story sources:

- `src/game/data.js`
- `src/game/demo-10-floor-content.js`
- `src/game/demo-20-floor-content.js`
- `src/game/demo-30-floor-content.js`

Also inspect these when necessary to ensure dialogue remains mechanically truthful:

- `src/game/demo-10-floor-progression.js`
- `src/game/demo-20-floor-progression-topology.js`
- `src/game/act3-charters.js`
- `src/game/war-council.js`
- `src/game/ending-debrief.js`
- `src/game/player-copy.js`

The GAL-only review route is:

- `/gal-only/`

## Canonical narrative baseline

Preserve the existing core plot unless there is a direct contradiction in the source:

- Three years ago, a magical storm threatened the Greyport evacuation.
- The Tower coordinated identification, manifests, navigation, protection, power, verification, and authority tracking.
- The evacuation itself succeeded, but the Tower failed to receive / accept the final closure chain correctly.
- Noctia kept the emergency system running because she believed people might still be unaccounted for.
- Liyue's seven-part escort chant was split into seven cores that kept the emergency network operating.
- The seven guardians retained memory and personality but were constrained by the system's orders.
- Liyue returns not to “slaughter the tower,” but to recover the seven parts, free the guardians, reconstruct what happened, and deliver a valid closure path.
- Later acts establish that several different errors chained together: authority extension, context-stripped confirmations, intercepted receipts, duplicated or stale records, and unsafe archival logic.
- The resolution must preserve records and responsibility while stopping forced execution; “end the emergency” must not mean “erase the people or evidence.”

Do not replace this with a different story.

## Mandatory first-entry exposition

The opening sequence must give a first-time player enough information **before the first tactical floor matters**.

By the end of the opening GAL sequence, the reader must clearly know:

1. **Where we are**
   - Greyport / the Tower / the post-war or post-disaster situation.
   - Why people once depended on the Tower.

2. **What happened three years ago**
   - The storm.
   - The evacuation.
   - The final ship / final receipt problem.
   - The fact that the outside world rebuilt, while the Tower's emergency state did not end.

3. **Who Liyue is**
   - Her role in the original evacuation.
   - What was taken from her.
   - What the seven-part chant was meant to do.
   - Why she personally returns now.

4. **Who Shawu is**
   - What kind of being / companion she is.
   - What she knows and does not know.
   - Why she can guide Liyue through the Tower.

5. **Who Noctia is**
   - Her former responsibility.
   - Her original protective intention.
   - Why her decision became dangerous.
   - Why the player should see her as a tragic responsible actor, not a generic final boss.

6. **What the seven guardians / cores are**
   - Their practical functions.
   - Why they attack despite recognizing Liyue.
   - Why defeating / releasing them advances both the investigation and Liyue's recovery.

7. **What the immediate goal is**
   - Recover the seven cores.
   - Free forced guardians.
   - Recover original evidence.
   - Reconstruct the causal chain.
   - Reach Noctia with proof and a valid way to end the emergency safely.

Do not dump all of this as one encyclopedia paragraph. Distribute it through narration, concrete actions, memories, questions, and natural dialogue.

## First-appearance rule for characters

For every named recurring character, their first substantial appearance must answer, naturally:

- Who is this person?
- What role did they have in the Tower / evacuation?
- What do they want right now?
- What constraint, fear, duty, guilt, or misconception drives them?
- What is their relationship to Liyue / the current investigation?

The reader must not have to infer identity from a portrait name alone.

This applies especially to:

- 绫星·璃 / Liyue
- 残响精灵·纱雾 / Shawu
- 无声女王·诺克缇娅 / Noctia
- 米露
- 绯叶
- 澜音
- 塞蕾娜
- 焰璃
- 露米
- 鸦羽
- 回声摄政官
- 奥术主权者
- 档案守望者 / 最后保管相关角色

## Scene clarity rule

Every major scene should make the following understandable without external context:

- **Where are we now?**
- **What changed since the previous scene?**
- **What new evidence / problem has appeared?**
- **What does the cast currently believe?**
- **What is the next concrete objective?**
- **What happens if they fail or choose badly?**

When a scene introduces a new technical term, institution, seal, record type, procedure, or authority concept, explain it at first use in ordinary language.

Examples of terms that must not be treated as self-explanatory:

- 回执
- 名簿
- 主权权限链
- 三席确认
- 起源核心
- 虚空先驱
- 无限延长
- 归档
- 校验副本
- 章程
- 接力
- 勘误
- 撤销签名

## Dialogue and narration length

There is **no sentence limit and no turn-count limit**.

Do not optimize for short dialogue boxes.

A single speaker may speak for multiple consecutive turns.
A long explanation may be split across multiple boxes.
Narration may be several paragraphs across consecutive turns when needed.

Prefer sufficient explanation over brevity.

However, expansion must add one or more of:

- context;
- motive;
- causal explanation;
- sensory/action detail;
- emotional reaction;
- relationship information;
- stakes;
- clarification of terminology;
- transition from prior scene to next objective.

Do **not** inflate lines with redundant poetic filler.

## Style requirements

Target: polished Japanese-style GAL / narrative RPG prose in Chinese.

Use:

- concrete action;
- environment;
- physical reactions;
- memory;
- hesitation;
- questions and answers;
- character-specific voice;
- clear cause and effect.

Avoid:

- mechanical “A says one line, B says one line” alternation;
- AI-style abstract philosophy;
- overt political-theory exposition;
- excessive aphorisms;
- vague metaphors used instead of explanation;
- characters speaking like documentation;
- repeating the exact same conclusion in three voices.

Technical / archival concepts should be explained through concrete examples and character consequences.

## Continuity requirements

The full GAL-only sequence must read as one story from prologue to ending.

Each transition between floors / acts must explicitly bridge:

- what evidence was obtained;
- what question remains unanswered;
- why the group is going upward / onward;
- who joins or leaves;
- what changed in Liyue's recovered abilities or understanding.

The beginning of a new act must not feel like a new unrelated story.

## Gameplay truthfulness

Do not invent mechanics that do not exist.

Story copy may explain existing mechanics, but must remain consistent with:

- card costs;
- optional routes;
- guardian fights;
- war council;
- MP/resource rules;
- final-act charters;
- available CG / portrait identities.

Do not rename existing runtime portrait IDs or CG paths during this pass.

## Review method

Perform the work in two stages.

### Stage A — Audit

Before rewriting, produce a scene-by-scene audit table containing:

- scene/dialogue ID;
- current function in the story;
- what a first-time reader is likely to misunderstand;
- missing context;
- missing character introduction;
- missing causal transition;
- terminology that needs explanation;
- recommended expansion.

Pay special attention to:

- `prologue`
- F1–F3
- first appearance of every guardian
- F10 transition into Act II
- F11 opening
- F19 / F20
- F21 opening
- F25–F30
- `ending`

### Stage B — Rewrite

Then rewrite the source dialogue.

The rewrite should be comprehensive. Do not stop after the prologue.

## Acceptance test

Pretend the reader knows **nothing** about this project.

After one continuous GAL-only playthrough, they should be able to answer, in their own words:

1. What happened to Greyport three years ago?
2. Why did the Tower remain locked?
3. Why did Noctia make the choice she made?
4. Who is Liyue and what did she lose?
5. Who is Shawu and why is she here?
6. What are the seven cores and why are the guardians fighting?
7. What evidence is Liyue collecting?
8. What caused the emergency order to survive for three years?
9. Why isn't simply destroying / powering off the Tower a sufficient solution?
10. What changes in Acts II and III?
11. What is the final solution and why is it safer / more truthful than the old system?
12. What emotional arc did Liyue and Noctia go through?

If several of these cannot be answered after one read, the rewrite is not complete.

## Deliverables

1. A written audit:
   - `docs/story/STORY_CLARITY_AUDIT_2026-09-21.md`

2. Revised story source files.

3. A concise changelog:
   - what exposition was added;
   - which character introductions changed;
   - which confusing concepts were clarified;
   - which scene transitions were strengthened.

4. Run the existing test suite and production build.

5. Verify the complete story in `/gal-only/`.

## Prohibited shortcuts

Do not:

- merely add a glossary;
- rely on backlog to explain missing story context;
- write “the player already learned this earlier” unless that information really appears in the current shipped story;
- compress major explanations back into one-line dialogue;
- cut existing emotional material to make room;
- change the plot into a simpler unrelated conflict;
- turn the story into a political/philosophical essay;
- modify gameplay balance under the guise of narrative editing.
