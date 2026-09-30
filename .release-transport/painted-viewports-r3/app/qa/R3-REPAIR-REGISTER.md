# r3 bounded repair register

Status: implemented and kernel-validated; **real-browser static visual acceptance pending**. No walking animation was produced. The three PNGs and all frozen world/profile/anchor/kernel files are byte-identical to r2. No artwork was generated, hidden floor painted, or external service changed.

## Source evidence

The baseline was the 98 actual Chrome images from run `2026-09-30T18-47-55-742Z`, especially narrow harbor `door-footing`, `bridge-footing`, `west_entry-footing`, `east_lower_stair-footing`, `east-flight-footing`, and narrow forest `root-to-bay-0pct`. The forest and harbor runtime visual-review reports supplied the defect coordinates. This repair inspected those original screenshots and the original 1586×992 harbor PNG, including pixel crops of the rail/post and stair tread edges. Derived source trace overlays were inspection aids only, not runtime screenshots.

Geometry references, read-only: `c-harbor-physical-navigation/source/build_harbor_review.py`, `M03_main_connections_r6.json`, R7 world floors/cells/blockers, and frozen `harbor-reviewed-anchors.json`. The original source copies remain untouched.

## 1. Surface + local depth, original-pixel silhouettes

`src/harbor-occluders.mjs` contains six source-pixel object groups:

1. Main bridge deck, low_public only, physical plane Y=5
2. Main bridge front beam, low_public only, plane Z=-6.06
3. Main bridge near top/mid/bottom rails and individually measured posts, low_public or upper_public, plane Z=-6.06
4. Separate west corner post/cap, same local near plane
5. Main bridge far rail and posts, plane Z=-8.34; real depth places it behind ordinary upper actors and in front of the low street when appropriate
6. Lower-flight near handrail and posts, plane X=11.12, from the original R7 builder's east lower rail; limited to low_public/east_lower_flight/east_middle

The thin polygons are unioned without filling openings. They clip a redraw of the exact original PNG at native (0,0); there is no replacement raster, translucent bridge, ghost floor, or independently painted parallax layer. Individual post centres are measured from the image, not assumed regularly spaced. Final edge/antialias acceptance is specifically pending the new actual Chrome pixels.

`src/depth.mjs` reconstructs the orthographic ray at each source-art pixel. The character is represented by an upright view-facing plane through the **actual current X/Z** from the kernel. For each object silhouette, Sutherland–Hodgman clipping retains only the portion whose physical plane lies in front of that actor plane along that ray. Surface identity is checked first. This is local per-pixel object depth, not a global screen-Y sort or anchor-name lookup. An unsupported/missing world pose fails closed.

The door remains `[7.5, 0.8, -14.675]` on low_public. Its boots and lower body are physically behind the opaque deck/beam and are deliberately hidden. No unseen floor is exposed. The known underbridge endpoint `[5, 0.8, -7.2]` is open paving; a full 34×70 source-pixel actor envelope is tested to remain outside these masks.

The mask collection is deliberately local. It does not claim complete pier, west-return, highwalk, wall, foliage or off-route occlusion. No silhouette locator or contact-shadow polish was added.

## 2. Real support selection, no visual registration warp

The original world, profile and anchors stay as source inputs. `adapters/harbor-interior-route.mjs` supplies a documented r3 selection in the unchanged cells:

| Anchor | Original XYZ | Selected XYZ | Native pixel delta |
|---|---|---|---|
| lower flight | 11.7, 1.825, 2.1 | 11.96, 1.825, 2.1 | +9.9534, -2.5896 |
| upper flight | 13.1, 4.1, 2.1 | 13.35, 4.1, 2.1 | +9.5706, -2.4900 |
| west entry | -8.7, 5, -8.4 | -8.7, 5, -9.0 | -14.5473, -9.4358 |

Lower X=11.96 is inside centre domain [11.4,12.0] and floor [11.15,12.25]. Upper X=13.35 is inside centre domain [12.8,13.4] and floor [12.55,13.65]. Both retain the original .18m footprint and .2m maximum advance. The upper selection increases painted front-lip separation, while its .30m floor-edge distance and .29m distance to the original outer-rail blocker remain above the footprint radius; this is not full-body/shoulder clearance acceptance. The west entry moves 0.6m along the existing upper approach plank, preserving height and cell identity, away from the painted near cap.

The original kernel's normal `findPath` chooses portal midpoints. Moving only the stair anchor would leave most traversal unchanged. r3 therefore selects interior crossing points at the **same existing portal apertures**, maps both sides consistently, retains every cell/surface/portal identity, recomputes all segment lengths, freezes the selected path and runs the original `snapshot.replay`. Original `snapshot.advance` remains authoritative for each bounded movement. No geometry-key changes, custom teleport, cell reassignment or support-radius reduction is used.

`qa/r3-physical-selection-evidence.json` records exact before/after positions, projections, support floor IDs, recomputed lengths and every portal crossing. Tests cover both stair directions and 5mm-spaced support/height samples. These establish continuous physical support of this static reference trajectory, not individual painted tread/boot, body-envelope or gait acceptance.

## 3. Notices outside the art

Routine route notices now occupy the existing footer badge slot. The stage height and camera transform contract remain unchanged. The duplicate unresolved-depth warning lives in the review panel. No toast or warning element is inside `#stage`. Browser checks require any visible notice to lie wholly below the stage and inside the viewport, and reject horizontal overflow.

## 4. Decisive pending evidence

The focused actual-browser plan is exactly 128 screenshots, 64 each at desktop1180×757 and narrow390×844. All gameplay images have foot, anchor and mask outlines OFF. It includes four static directions at the five repaired harbor anchors, 18 actual bounded stair-route samples, the open underbridge endpoint and 5%/10% west-entry crossing samples. Forest root four-way and route-start images verify notice clearance.

No local Chromium was launched or bypassed. Only the parent-authorized official QA run may supply the new screenshots. A passing capture run is not visual acceptance; inspect mask edges/holes, both boots, upper lip, lower handrail and door height identity before accepting the revised static states. Any remaining defect belongs in a new revision, not a silent mutation of this frozen package.
