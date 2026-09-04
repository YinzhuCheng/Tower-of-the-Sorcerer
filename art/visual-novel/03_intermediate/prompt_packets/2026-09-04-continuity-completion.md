# 2026-09-04 prompt packet — low-noise Japanese Gal cel completion

## Shared series style

Japanese 2D anime cel-shaded visual-novel art in a classic Japanese shoujo Galgame style. Clean simple linework, broad flat color planes, restrained two-step cel shading, one controlled highlight per material, TV-anime detail, readable silhouettes, quiet atmospheric depth, low visual noise. Avoid painterly rendering, photorealism, 3D, western comics, mobile-game splash-art density, ornate micro-detail, micro-texture, film grain, HDR, oversharpening, readable text, logo, signature and watermark.

CG output: cinematic 16:9; keep the lower 24 percent broad and quiet for dialogue UI. Preserve the same obsidian tower, small brass registration seals, blue-white index lights and hairline violet seal fractures.

Standing output: 1024×1536 full body, head to toe, both feet and every prop visible. Opaque regular large-cell lime-green/hot-magenta checkerboard, front-facing and flat, for later manual cutout. No perspective, floor, cast shadow, reflection, gradient or colored light spill. The checkerboard is a processing background, not clothing or scenery.

Per-asset narrative facts, must-show and forbidden content are defined in `03_intermediate/scene_cards/2026-09-04-continuity-completion.md`. Each generation prompt must include the relevant accepted character and environment files as references and explicitly name each reference's role.

## Accepted CG simplification pass (v3)

Keep the exact established cast identities, pose, action, camera, crop, prop count, and story beat from the referenced composition. Redraw only the finish as restrained early-2000s Japanese PC visual-novel event art: thin clean anime linework, large flat color shapes, at most one hard-edged shadow per local color, one small controlled highlight per material, simplified clothing folds, simplified hair strands, sparse architecture, broad quiet shadow masses, and a clean low-noise image. Preserve generous negative space in the lower quarter for the runtime dialogue layer. Do not paint any dialogue box or UI into the CG.

Negative constraints: no ornate costume filigree, no micro-jewelry, no dense particles, no floating debris unless required by the scene card, no excessive glow, no painterly texture, no brush noise, no grain, no halftone, no photorealism, no 3D, no mobile-game splash rendering, no readable text, no logo, no signature, no watermark, and no baked interface panels.

The accepted files derive from the local `CG_*_v3.png` working masters. Rejection patterns and reasons are persisted in the generation log; bulky working and rejected rasters are deliberately excluded from the product branch and deployment.
