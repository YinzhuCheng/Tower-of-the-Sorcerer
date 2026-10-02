# B visible-art r1 · review candidate

An isolated presentation-only candidate based on sealed `b-dialogue-r1`. Not published, not browser-accepted, and not the unguarded `b-opening-r1` opening.

## Visible runtime changes

- The initial HUD shows 璃's accepted 512×512 canonical face. Source dialogue speakers 璃 / 珂珂 / 纱雾 / 米露 show accepted face crops. All five character files are unchanged source copies; offscreen and winter-empty-shot portrait prohibitions are retained.
- B01 uses a new source-locked native 1400×1100 backdrop, not a wallpaper behind a square grid. Its 121 interactive buttons follow exact source-camera cell polygons; player, old timber puppet, old guard plate and the original B02 portal are separate live draws.
- The accepted neutral hero standee is displayed at an exact projected foot anchor and 1.66 m source-camera head height. It is a static token, not a restored walking rig or walking animation.
- Thirty-nine geometry-derived cell masks apply independently to dynamic sprites. No blanket foreground overlay is used. Hero name/foot ring and the portal label are explicit readability UI above occlusion.
- Clear-route overlay and an explicit reversible grid fallback are available. Missing/invalid-size scene assets fall back to the operative grid. Graphics stay within the scene or story-image panel; controls remain in document flow.
- B07/B09 retain their pre-existing continuous samples. All other regions retain their existing presentation. No full-campaign art coverage is claimed.

## Preserved

Every non-rendering source file is byte-identical to `b-dialogue-r1`: rules identity, source dialogue, queue/save handling, 30 regions, 66 portals, resource mechanics, legal actions and confirmation behavior. Sixteen actual winning-route replays (11,738 actions) and B01 pathfinder checks agree exactly against the baseline.

## Reproduce

Node.js 22+, no dependencies. Copy this directory to disposable `work/` or `.cache/` space. Run `npm test`, `npm run build`, and `npm run validate`. Output is `dist-b-preview`, entry `/campaigns-b/`. Serve only through an authorized preview; this work does not deploy.

The sibling `qa/b-visual-r1` records source hashes, exact route equality, app event wiring, missing-image fallback, asset closure, static viewport budgets and renderer-unit PNGs. Those PNGs call the actual map draw function using Node Canvas; they are not screenshots of a browser, DOM layout or deployed game.

## Remaining acceptance

Authorized browser review of 1744×885 and mobile layouts, image loading on the deployed origin, real pointer/keyboard/touch, and final visual approval remain pending. Mobile renders preserve source scale, making the hero roughly 17 px tall at 366 px scene width; dedicated movement/actions and readable/grid modes remain available. Two gateway cells legitimately occlude most of the static standee, with persistent name/foot location UI.
