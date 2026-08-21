# Item artwork pipeline

Runtime item art lives in `public/assets/anime/items/` and is resolved by `public/assets/anime/items/manifest.json`.

## Adding or replacing art

1. Export transparent PNG/WebP artwork. 128–256 px square is sufficient for the 58 px map tiles; keep larger source art outside the runtime bundle if needed.
2. Put the optimized WebP in the appropriate folder: `potions/`, `gems/`, `relics/`, `treasures/`, `cards/`, or `sigils/`.
3. Point the matching key in `manifest.json` at that file. The renderer reads the manifest; no engine/data changes are required.
4. If a file is missing or fails to decode, the map automatically falls back to the legacy item sheet.

The current pack contains 20 independently addressable assets. Gameplay values and item effects remain defined only in `src/game/data.js` / `src/game/engine.js`.
