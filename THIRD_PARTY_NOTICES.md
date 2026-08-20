# Third-party notices

## Phaser 3

The browser client attempts to load **Phaser 3.90.0** from a public CDN as its
preferred rendering engine.

- Project: Phaser
- Upstream: https://github.com/phaserjs/phaser
- License: MIT
- Copyright: Richard Davey / Photon Storm Ltd. and Phaser contributors

The Phaser distribution is not committed to this repository. When the CDN is
unavailable, the game automatically uses the local dependency-free Canvas 2D
renderer in `src/game/canvas-scene.js`; game rules and save data are identical
between renderers.

## Included visual assets

All character portraits are generated at runtime by `src/game/portraits.js`
from geometric SVG primitives created specifically for this repository. The
art does not incorporate third-party character illustrations, franchise
designs, external fonts, or model outputs. It is distributed under the
repository's MIT License.
