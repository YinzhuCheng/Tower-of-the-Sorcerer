#!/usr/bin/env python3
"""Deterministically replace damaged legacy atlases with accepted runtime cells.

No drawing or generative edits: every slot is a crop from the current V6/V8/V10
runtime sheets or the existing guardian seal. Legacy keys and grid topology stay
stable. Base64 transport fragments are regenerated too, so the materializer
cannot restore the corrupt bytes on a later build.
"""
from pathlib import Path
import base64
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / 'public/assets/anime/map'
CELL = 160
ORIGINAL_BLOBS = {
    'environment': '71f86cd7935569db5b15b40db12d6e76a21e1870',
    'v4Combined': 'f052bd066d07fc024d66947b85ed8e8d70cdf1ef',
}
SOURCES = {
    'wall': ('public/assets/anime/map/atlases/runtime/wall-materials-v6.webp', 3, 2),
    'ui': ('public/assets/anime/map/atlases/runtime/ui-v8.webp', 3, 2),
    'game': ('public/assets/anime/map/atlases/runtime/gameplay-v10.webp', 4, 4),
    'seal': ('public/assets/anime/map/interactables/guardian-vault-seal.webp', 1, 1),
}
RECIPES = {
    'environment': [
        ('wall', 0), ('wall', 1), ('wall', 3), ('wall', 4), ('ui', 0),
        ('game', 7), ('game', 8), ('game', 9), ('game', 11), ('game', 10),
        ('wall', 1), ('wall', 2), ('wall', 3), ('wall', 4), ('wall', 1),
        ('wall', 5), ('wall', 5), ('game', 11), ('game', 12), ('ui', 1),
    ],
    'v4Combined': [
        ('wall', 0), ('wall', 3), ('wall', 4), ('wall', 5), ('ui', 0),
        ('game', 10), ('game', 7), ('game', 8), ('game', 9), ('game', 11),
        ('game', 12), ('seal', 0), ('game', 4), ('game', 5), ('game', 6),
        ('game', 4), ('game', 5), ('game', 6), None, None,
    ],
}

def sha256(data):
    return hashlib.sha256(data).hexdigest()

def main():
    manifest = json.loads((MAP / 'manifest.json').read_text())
    images = {}
    provenance = {}
    for key, (path, cols, rows) in SOURCES.items():
        data = (ROOT / path).read_bytes()
        image = Image.open(ROOT / path).convert('RGBA')
        image.load()
        assert image.width % cols == 0 and image.height % rows == 0
        images[key] = image
        provenance[key] = {'path': path, 'sha256': sha256(data), 'columns': cols, 'rows': rows}

    report = {'version': '2026-09-30-deterministic-legacy-atlas-repair',
              'base_commit': '3c2bc16cba3b57d2f3ae81d3b1d9bd9f87edcf4e',
              'method': 'Lossless atlas packaging from accepted V6/V8/V10 cells; no generated artwork.',
              'sources': provenance, 'atlases': []}
    for name, recipes in RECIPES.items():
        meta = manifest['atlases'][name]
        cols, rows = meta['cols'], meta['rows']
        assert len(recipes) == cols * rows
        canvas = Image.new('RGBA', (cols * CELL, rows * CELL), (0, 0, 0, 0))
        slot_records = []
        for index, recipe in enumerate(recipes):
            if recipe is None:
                continue  # The two unreferenced padding cells in the V4 atlas.
            source_key, source_index = recipe
            _, source_cols, source_rows = SOURCES[source_key]
            source = images[source_key]
            width, height = source.width // source_cols, source.height // source_rows
            x, y = source_index % source_cols * width, source_index // source_cols * height
            tile = source.crop((x, y, x + width, y + height))
            # Existing square icon cells are resampled only for grid compatibility.
            tile = tile.resize((CELL, CELL), Image.Resampling.LANCZOS)
            canvas.paste(tile, (index % cols * CELL, index // cols * CELL))
            slot_records.append({'index': index, 'source': source_key, 'source_index': source_index,
                                 'keys': sorted(k for k, v in manifest['assets'].items()
                                                if v.get('atlas') == name and v.get('index') == index)})
        target = MAP / meta['file']
        canvas.save(target, 'WEBP', lossless=True, quality=100, method=6, exact=True)
        data = target.read_bytes()
        decoded = Image.open(target).convert('RGBA')
        decoded.load()
        for slot in slot_records:
            index = slot['index']
            x, y = index % cols * CELL, index // cols * CELL
            slot['rgba_sha256'] = sha256(decoded.crop((x, y, x + CELL, y + CELL)).tobytes())
        encoded = base64.b64encode(data).decode('ascii')
        chunks = meta['base64Chunks']
        # Split on Base64 quartets; retain the canonical fragment paths and order.
        chunk_size = ((len(encoded) + len(chunks) - 1) // len(chunks) + 3) // 4 * 4
        for index, path in enumerate(chunks):
            (MAP / path).write_text(encoded[index * chunk_size:(index + 1) * chunk_size] + '\n')
        report['atlases'].append({'name': name, 'path': str(target.relative_to(ROOT)),
                                  'sha256': sha256(data), 'width': decoded.width, 'height': decoded.height,
                                  'cell_size': CELL, 'slots': slot_records,
                                  'replaced_git_blob_sha': ORIGINAL_BLOBS[name]})
    out = ROOT / 'art/visual-novel/05_manifests/runtime-atlas-repair-20260930.json'
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(f'Rebuilt {len(report["atlases"])} atlases with {sum(len(x["slots"]) for x in report["atlases"])} populated slots')

if __name__ == '__main__':
    main()
