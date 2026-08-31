# Enemy identity masters — v3

This pack removes all unintended portrait reuse among the early-game and
palace enemy roster.

- `enemy-identity-portable-masters/` contains seven 1024×1024 transparent,
  high-quality WebP source masters: vine druid, shell guard, blade priestess,
  crown knight, dragon guard, dusk dragon, and comet archer.
- Each master has a matching 384×384 alpha-preserving WebP derivative in
  `public/assets/anime/enemies/v3/`.

The runtime derivatives are the only files loaded by the game. Keep source
masters out of the browser bundle; regenerate a WebP from its matching source
when updating an illustration.
