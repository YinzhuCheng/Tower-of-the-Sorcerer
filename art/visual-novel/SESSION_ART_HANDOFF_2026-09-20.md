# Session Art Handoff · 2026-09-20

## Target

- Repository: `YinzhuCheng/Tower-of-the-Sorcerer`
- Target branch: **`main`**
- Purpose: persist the useful incremental art produced in this conversation.
- This package is deliberately structured as a **repo overlay**. Copy the contents of `repo_overlay/` into the repository root.

## What is included

### B2 dialogue standees

- **25/25 active B2 target slots have a candidate asset in this package.**
- 10 core/late-stage assets are Canon-safe derivatives or close Canon-aligned candidates.
- 2 additional Sagiri expressions (`watchful`, `lament`) are included as optional extras.
- All B2 PNGs are 1024×1536 and have an alpha channel.

These are **working candidates**, not an instruction to overwrite runtime assets yet.

Target working directory in the repository:

`art/visual-novel/04_cg/working/2026-09-20-b2-standees/`

Use `MANIFEST.json` to see each candidate's intended future `public/assets/anime/characters/...` runtime target.

### CG R2

Two R2 candidates for:

`CG_017_traceable-revocation`

are included under:

`art/visual-novel/04_cg/working/R2-costume-props/2026-09-20/`

They are R2 **candidates only**. They still require scene-card and Canon QA before any promotion.

## Important: what is intentionally NOT included

The first experimental batch created before Canon images were properly used is excluded. Those images had identity drift and must not be committed as official assets.

Also excluded are several later accidental composite/sprite-sheet generations that mixed unrelated characters. They are QA failures, not game assets.

## Required upload behavior

Please push the overlay to **main** as working art, without changing runtime mappings or accepted manifests.

Recommended commit message:

`art: stage B2 standee candidates and CG R2 session handoff`

Suggested commands:

```bash
cd /path/to/Tower-of-the-Sorcerer
git checkout main
git pull --ff-only origin main

rsync -a /path/to/unpacked-package/repo_overlay/ ./

git add art/visual-novel
git status
git commit -m "art: stage B2 standee candidates and CG R2 session handoff"
git push origin main
```

## Do NOT do these in the upload-only step

Do not:

- overwrite `public/assets/anime/characters/*`;
- overwrite `public/assets/anime/cg/*`;
- change `accepted-assets.json`;
- change `cg-layout-admission-v1.2.json` to claim R2 acceptance;
- delete older Canon or R1 files;
- restore the 12 unused legacy CG aliases.

This handoff is intentionally conservative: **persist first, review/promote second**.

## QA to run next

For B2, compare every candidate to the corresponding:

1. Turnaround
2. Detail board
3. Expression board
4. Neutral Standee
5. character `.md` hard locks

Specifically check left/right ownership, item counts, hair silhouette, face identity, and forbidden extra accessories.

For CG R2, check:

- face identity remains R1-consistent;
- costume hard locks;
- exact prop counts;
- left/right hand ownership;
- no unauthorized redesign of hair or face;
- scene-card narrative object ownership.

## Existing protocol

The Canon-first incident report / operating protocol was already pushed to main earlier in this conversation:

`art/visual-novel/CANON_FIRST_ART_PRODUCTION_PROTOCOL_2026-09-19.md`

That file remains the governing production rule.
