# B finite continuous forest r1

An isolated playable presentation candidate based on `b-visual-r1`. B01 (南坡村口), B02 (回枝广场), and B03 (树心外廊) share one finite registered source world, with a gradually following neighborhood camera. This is a native geometry/material proof with the accepted static hero, not finished anime environment art or a restored walking rig. No procedural infinite generation is involved.

## Run

Node.js 22+, no package dependencies:

    npm test
    npm run build
    npm run validate
    python3 -m http.server 8080 --directory dist-b-preview

Open `/campaigns-b/` on an authorized host. The parent coordinates browser validation; this candidate performs no deployment or provider writes.

## Play and compare

- Direction keys, WASD, or on-screen arrows move through the original legal source cells
- At the exact 01↔02 or 02↔03 portal anchor, continue outward to request the original portal action; crossing animates through that existing edge
- Click-to-walk displays each safe source move. Battles and costly actions retain their original confirmations
- Movement is serialized, so held keys or rapid reversals cannot advance game state far ahead of the displayed actor
- First-entry dialogue remains queued until visible motion finishes. Dialogue text and saved presentation are unchanged
- `查看原单区呈现` restores the former B01 source-image view or original regional renderer. B01 also retains its grid fallback. These view changes do not mutate saves or resources
- All other destinations retain original graph-driven transitions. This does not claim thirty-region continuity

## World and authority

Source cell scale is 1.2 m, with region X origins 0 / 14.4 / 28.8 m and negative world Y for increasing source row. The 4.8 m joins are render-only embodiments of two existing reciprocal edges. They add no gameplay cells, pickup locations, pathfinder nodes, free routes, or resource regeneration. The immutable reducer still commits one atomic `traverse` receipt, at its original destination and cost. An in-flight save therefore restores the real destination, with camera/motion reconstructed from that saved location.

The shared native source supplies cell polygons, feet, 1.66 m head anchors, sloped support samples, and 16-bit source depth. Actor motion follows those source samples in either direction. Camera translation and zoom crop the same atlas. Per-sprite depth masking is applied at intrinsic atlas pixels; the actor foot ring/name remains an explicit readability indicator above occlusion. The camera orientation is fixed.

No non-rendering source file differs from `b-visual-r1`: the 30-region/66-transition graph, 156 entities, fixed-number rules, original story, session/save code, solver and certificates are preserved. Sixteen winning certificates (11,738 actions) agree exactly against the baseline.

## Asset loading and fallback

Runtime background and depth use lossless WebP encodings of the canonical native PNG exports. The ingest receipt verifies every decoded RGBA byte, including depth channels and transparency. Only the runtime encoding is shipped in the public asset payload. The canonical source contract is preserved unchanged as data, alongside a separate encoding manifest.

The background remains above the earlier 2.5 MB preview budget; exact measured bytes and checksums are recorded in the runtime asset manifest and QA ingest receipt. Both images must load at their declared dimensions and depth decode successfully before native rendering activates. Until then, or on failure, the same finite source world remains operable in an explicitly labeled structural fallback. Legacy B01 masks are loaded only when requesting the old single-region view.

## Verification and limits

Focused tests cover source registration, every source-cell direction, both joins/repeated reverse crossings, exactly-once dispatch, collision/resource constraints, pickup finiteness, save/load, continuous movement/camera, native samples/depth, asset hashes/failure, real app DOM/RAF input wiring, delayed story display, and old-view resize/observer races. Full existing certificate and story tests are also run.

Renderer PNGs are produced by the actual draw functions in Node Canvas. They are not browser screenshots and do not establish browser layout, touch, loading performance, or final art acceptance. Localhost browser access was not retried or bypassed. Deployed desktop/mobile interaction review remains a separate gate.

Remaining work: actual browser verification, broader source-world coverage, final forest art review, a source-matched walking rig, and any larger-world streaming/occlusion performance work. Native geometry does not alter the original historical 11×11 logic regions.
