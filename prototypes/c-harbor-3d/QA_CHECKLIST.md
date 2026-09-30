# Vercel browser gate (not yet run)

This checklist is the next required step. Static build or Node tests alone do not pass it. Do not promote or call this final art until the browser checks pass. Do not bypass the local socket sandbox; use an authorized Vercel preview URL supplied/created by the release owner.

## Preview setup

- Serve `dist/` as the static output (`/campaigns/` entry)
- Verify `build-manifest.json` has content hash `c5a5f809d5548f36`
- Check no JavaScript exception, module import error, failed geometry/texture request, CORS issue or external CDN request
- Check actual WebGL2 view is shown, not silently successful 2D fallback
- Note actual viewport/DPR, browser, hardware, renderer and access-controlled preview URL in the report

## Ordinary player flow (mandatory)

1. Fresh prototype storage namespace, initial M01 (7,7), revision 0, fuel 9, HP 60. Dismiss/advance the actual opening text with visible controls
2. Click projected shore (6,7), then use the visible ordinary boarding action. Check D01 (7,7), same fuel and HP, correct revision. Do not inject an arbitrary state through evaluate/fixtures
3. Walk the deck, including x4 and x6 channels and bow/stern, in all four directions. Click the visible world ground and verify the logical cell. Test corners between logical cells and boundaries at DPR1/2 and zoom100/125/150
4. Attempt rack cells (3,3), (5,3), (7,3), water, outboard davit anchors and non-gangway boat-to-quay crossing. They must not become traversable
5. Move a weight using the real action list. Observe only that named weight moves, exactly three IDs remain, no extra iron blocks appear. Test another legal layout, not just the route's one solution
6. Toggle 3D → 2D → 3D. Identity/state hash/revision/resources/cargo/cleared flags stay identical. 2D input remains correctly aligned and square
7. Save/load through existing controls; refresh; resume at the same state with proper story queue. Prototype does not overwrite a normal C save
8. Test busy story modal, cancelled confirmation, repeated click, rapid direction key, repeated view toggle and browser resize. No double dispatch or hidden movement behind the story/confirmation modal

## Reach M03/M05 through real dispatch

The original 170-step winning certificate is provided. Its UI starts at initialState and dispatches every action, with before/after checks. It pauses for story/choices. The banner identifies this as certificate replay, which must not be described as manually played. No fixture state injection is provided.

Useful completed-step counts in `reports/reached-route-states.json`:

- 21: first normal boarding at D01
- 54: arrive M03 on deck, unmoored
- 57: mooring complete
- 61: leave deck to M03 shore, same hull at berth scale
- 77: board again at M03
- 83: lamp-seat left; central winch exposed
- 86: legal work balance
- 90: same floating gate open
- 92: cargo back to centre; winch is covered
- 99: M04 arrival with rigid 180-degree pose
- 124: M05 arrival, unmoored
- 127: twin main ropes secured
- 134: cargo right under davit
- 137: legal loaded balance
- 142: cargo ashore, same three iron blocks
- 147: empty ship balanced
- 152: davit stowed
- 160: M05 shore, same hull at berth scale
- 163: cargo rolled to lamp
- 168: lamp-seat installed
- 170: final staffed lights, safe empty ship, victory

At each key state take both 2D and 3D screenshots without modifying core state. Confirm state hash in the read-only `window.__C3D_QA__.snapshot()` report. `projectTile(x,y)` is read-only and may provide click coordinates. It does not expose state-changing test shortcuts.

## Physical and visual gates

- Hull is 6:3, with the same silhouette in deck and berth cameras; no nonuniform scale and no M04 mirror
- One lamp-seat box, three reserved racks, six shallow lids and exactly three 1/1/2 weight tops
- Work lanes x4/x6 clearly remain unobstructed; low rail/cutaway never invents additional openings
- One narrow gangway connects the right rail gap to the quay; the water gap elsewhere is visible
- Two main mooring ropes connect independent real fairleads to the two supported bollards, outside walking lanes; stern signal is separate
- M03 winch body, shaft and handle visibly connected; pick handle → actual designated (4,4) stand → real core operation; observer point (4,2) is only a UI annotation
- M03 primary cable goes through bow-side fairlead; does not cut through safe stands. Gate remains the same length when moved to its side pocket
- M05 foot is in-hull at (1.35,.8,-1.25); bracket connects the outboard housing to the hull, continuous shaft connects forward wheel; no shore crane, floating controller or duplicate devices
- M05 intended handwheel stand (7,2) and guide stand (6,5) remain on deck; guidance annotations do not become physical platforms
- Rope, davit, labels and rail do not hide any essential control or walk path. Label-toggle does not change state
- Material source is sampled once in a world domain; no per-cell seams, shifting grain, glowing water or unexplained broad shadows
- Placeholder character marker is honestly labeled. Do not pass the map as finished character art

## Failure and performance gates

- Use browser developer capability to disable WebGL before a load, then confirm automatic 2D fallback and full normal actions
- Trigger or simulate a supported WebGL context-loss test, verify one fallback notification and exact same state. Do not claim context restoration is implemented; this pilot stays in 2D until reload
- Keep 3D open across at least 30 real moves, 10 view toggles and multiple resizes. Geometry/texture counts must not grow without bound
- Record actual draw/triangle/texture counts and CPU submit time at M03 active winch and M05 active/stowed davit
- Suggested thresholds: ≤250 draws, ≤60k triangles, median post-input visual response <100 ms and p95 <200 ms on target mobile hardware. These are provisional gates, not results
- Measure first ready time, gzipped transfer and actual GPU frame/interaction latency; displayed CPU submission is not GPU frame duration
- If unsupported WebGL, poor performance, missed/crowded click targets or unexplained occlusion persists, keep 2D and mark 3D no-go for promotion

## Deliberately unfinished

- No measured browser or screenshot result yet
- No final canon character billboard; explicit positional marker only
- No detailed lighthouse architecture, shore scenery, final light polish or animation
- No automated adaptive-performance fallback beyond WebGL init/context-loss failure
- No working state fixture inspector, state teleport or arbitrary flag editor
