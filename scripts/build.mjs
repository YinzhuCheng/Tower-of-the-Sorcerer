import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist');

async function applyVisualReplacementPatch() {
  const scenePath = join(outDir, 'src', 'game', 'anime-canvas-scene.js');
  let source = await readFile(scenePath, 'utf8');
  const replacements = [
    [
      "import { getMapAsset, preloadMapAssets } from './map-assets.js';\n",
      "import { getMapAsset, preloadMapAssets } from './map-assets.js';\nimport { getReplacementAsset, getReplacementAssetMeta, preloadReplacementAssets } from './replacement-assets.js';\n"
    ],
    [
      "      preloadEnemyAssets(),\n      preloadMapAssets()\n",
      "      preloadEnemyAssets(),\n      preloadMapAssets(),\n      preloadReplacementAssets()\n"
    ],
    [
      "  drawMapAsset(name, x, y, scale = 1, rotation = 0, alpha = 1, offsetY = 0) {\n    const image = getMapAsset(name);\n    if (!image) return false;\n    const size = TILE_SIZE * scale;\n    return this.drawMapImage(image, this.center(x), this.center(y) + offsetY * TILE_SIZE, size, size, rotation, alpha);\n  }\n\n",
      "  drawMapAsset(name, x, y, scale = 1, rotation = 0, alpha = 1, offsetY = 0) {\n    const image = getMapAsset(name);\n    if (!image) return false;\n    const size = TILE_SIZE * scale;\n    return this.drawMapImage(image, this.center(x), this.center(y) + offsetY * TILE_SIZE, size, size, rotation, alpha);\n  }\n\n  drawReplacementAsset(key, x, y, scale = 1) {\n    const image = getReplacementAsset(key);\n    if (!image) return false;\n    const meta = getReplacementAssetMeta(key) ?? {};\n    const resolvedScale = scale * (Number.isFinite(meta.scale) ? meta.scale : 1);\n    const size = TILE_SIZE * resolvedScale;\n    return this.drawMapImage(image, this.center(x), this.center(y), size, size);\n  }\n\n"
    ],
    [
      "    const image = getEnemyAsset(enemy.portrait);\n    const meta = getEnemyAssetMeta(enemy.portrait) ?? {};\n",
      "    const replacementKey = `enemy:${enemy.portrait}`;\n    const replacementImage = getReplacementAsset(replacementKey);\n    const image = replacementImage ?? getEnemyAsset(enemy.portrait);\n    const meta = replacementImage\n      ? (getReplacementAssetMeta(replacementKey) ?? {})\n      : (getEnemyAssetMeta(enemy.portrait) ?? {});\n"
    ],
    [
      "    if (parsed.type === 'gate') {\n      if (!this.drawMapAsset('portal-transfer', x, y, 0.9)) {\n        this.drawTileIcon(parsed.id === 'tri' ? TILE_INDEX.sequenceSwitch : TILE_INDEX.panel, x, y, 0.86);\n      }\n      return;\n    }\n",
      "    if (parsed.type === 'gate') {\n      if (this.drawReplacementAsset(`gate:${parsed.id}`, x, y)) return;\n      if (!this.drawMapAsset('portal-transfer', x, y, 0.9)) {\n        this.drawTileIcon(parsed.id === 'tri' ? TILE_INDEX.sequenceSwitch : TILE_INDEX.panel, x, y, 0.86);\n      }\n      return;\n    }\n"
    ],
    [
      "    if (parsed.type === 'item') {\n      const item = ITEMS[parsed.id];\n      if (item?.kind === 'card') {\n        this.drawItem(ITEM_INDEX[item.card], x, y, 0.68);\n        return;\n      }\n      const index = ITEM_INDEX[parsed.id];\n",
      "    if (parsed.type === 'item') {\n      const item = ITEMS[parsed.id];\n      if (item?.kind === 'card') {\n        this.drawItem(ITEM_INDEX[item.card], x, y, 0.68);\n        return;\n      }\n      if (this.drawReplacementAsset(`item:${parsed.id}`, x, y)) return;\n      const index = ITEM_INDEX[parsed.id];\n"
    ]
  ];

  for (const [before, after] of replacements) {
    if (!source.includes(before)) {
      throw new Error(`Visual replacement patch anchor missing: ${before.slice(0, 72)}`);
    }
    source = source.replace(before, after);
  }

  await writeFile(scenePath, source);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await copyFile(join(root, 'index.html'), join(outDir, 'index.html'));
await cp(join(root, 'src'), join(outDir, 'src'), { recursive: true });
await cp(join(root, 'public'), outDir, { recursive: true });
await applyVisualReplacementPatch();
console.log(`Static build written to ${outDir}`);
