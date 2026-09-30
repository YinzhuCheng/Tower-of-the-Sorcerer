# C continuous 2D geometry preview

Development preview of the same C story and standard fixed-stat campaign. Geometry identity is `c5a5f809d5548f36`; this revision rejects older incompatible geometry saves rather than silently relocating the player.

## Scope

- Continuous material samples only on the D01 workdeck and the M03/M05 shore views
- One 3 m × 6 m hull, uniform deck/berth scaling, six flush sockets, three unique weights and the actual state-bound winch/davit
- Other regions retain the explicit development board
- Six checksum-pinned WebP textures shared with the optional 3D pilot; the wood may repeat only across X, and root bark uses its structure domain
- Original C story, combat, resource semantics and non-respawning rules are preserved
- Placeholder protagonist and unaccepted texture seams/scale remain visible review limits; this is not final character art
- No A changes or B narrative/UI changes are included

## Checks

Run from repository root:

- `npm run check` for the existing game and all discovered Node tests
- `node --test test/campaign-c-geometry.test.js test/campaign-c-map-visibility.test.js test/campaign-c-browser-wiring.test.js test/campaign-c-continuous-map.test.js`
- `node scripts/validate-campaign-c-geometry-v1.2.mjs` for physical correspondence and three genuine route certificates
- `node scripts/validate-campaign-c-story-runtime.mjs` for receipt-bound story and both presentation endings
- `node scripts/build-campaign-preview.mjs && node scripts/validate-campaign-preview-build.mjs`

Output: `dist-c-preview`; browser entry: `/campaigns/`. Root build/check scripts are preserved. Branch-only Vercel settings build this preview.

The six C/shared continuous-map test bodies come unchanged from the frozen shared renderer suite. B-only and mixed B/C tests remain in the B/shared workspace. The geometry validator uses an in-repository docs path so a fresh clone is self-contained.

Browser acceptance must still verify actual movement, modal barriers, boarding, texture seams, scale, portrait sizing, and repeated load/save interactions. Passing Node checks does not establish visual acceptance.
