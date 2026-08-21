# Anime asset pipeline

Game artwork is data-driven. Updating an enemy illustration must not require changes to the combat engine, maps, or renderer.

## Recommended workflow

1. Export transparent artwork as WebP (preferred) or PNG.
2. Keep source art outside the runtime folder; runtime art should usually be 192–384 px square for map/codex use.
3. Put the optimized file under `public/assets/anime/enemies/`, for example `public/assets/anime/enemies/new-cat-boss.webp`.
4. Add or replace the portrait key in `public/assets/anime/enemies/manifest.json`:

```json
"cat_boss": {
  "file": "enemies/new-cat-boss.webp",
  "scale": 1.08,
  "offsetY": 0
}
```

The renderer discovers the change from the manifest. No JavaScript edit is required.

## Supported manifest sources

- `file`: normal WebP/PNG URL. Preferred long-term format; benefits from normal browser/Vercel caching.
- `base64File`: compatibility path for text-only upload tools.
- `bundle` + `key`: legacy migration format. Avoid for new assets.

`scale`, `offsetX`, and `offsetY` are optional visual-only adjustments. They never affect collision or fixed-number RPG rules.

## Failure behavior

Every HD enemy illustration is optional. A missing, invalid, or undecodable asset logs a warning and automatically falls back to the original chibi sheet. An art upload therefore cannot make a floor unplayable.

## Repository size

The current runtime art is tiny compared with GitHub repository limits. Do not base64-encode new art unless a connector requires it: base64 adds roughly 33% overhead and prevents normal image caching.

If the art library eventually grows to tens or hundreds of megabytes, put large source PSD/Clip Studio files and high-resolution masters in Git LFS or a release/object-storage bucket. Keep optimized runtime WebP/PNG files and the manifest in normal Git history.
