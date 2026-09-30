#!/usr/bin/env python3
"""Package the 17 current canonical dialogue avatars into a review-only atlas."""
from pathlib import Path
import hashlib
import json
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CELL, COLS, ROWS = 256, 5, 4

def main():
    cast = json.loads(subprocess.check_output([
        'node', '--input-type=module', '-e',
        "import { DIALOGUE_CAST } from './src/game/anime-portraits.js'; console.log(JSON.stringify(DIALOGUE_CAST));"
    ], cwd=ROOT, text=True))
    accepted = json.loads((ROOT / 'art/visual-novel/05_manifests/canonical-avatars-runtime-20260930-v1.json').read_text())
    sources = {asset['runtime']: asset for asset in accepted['assets']}
    canvas = Image.new('RGBA', (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))
    entries = []
    for index, (character, meta) in enumerate(cast.items()):
        path = 'public' + meta['avatar']
        record = sources[path]
        assert record['character_id'] == character, f'{character}: wrong canonical source'
        data = (ROOT / path).read_bytes()
        assert hashlib.sha256(data).hexdigest() == record['runtime_sha256'], f'{character}: avatar not canonical'
        image = Image.open(ROOT / path).convert('RGBA')
        image.load()
        tile = image.resize((CELL, CELL), Image.Resampling.LANCZOS)
        canvas.paste(tile, (index % COLS * CELL, index // COLS * CELL))
        entries.append({'character_id': character, 'index': index, 'source': path,
                        'source_sha256': record['runtime_sha256'],
                        'rgba_sha256': hashlib.sha256(tile.tobytes()).hexdigest()})
    target = ROOT / 'public/assets/anime/avatars/dialogue-avatar-atlas.png'
    canvas.save(target, optimize=True)
    manifest = {'version': '2026-09-30-canonical-dialogue-avatar-preview',
                'usage': 'Review-only contact atlas; runtime dialogue loads individual avatar files.',
                'path': target.relative_to(ROOT).as_posix(),
                'width': canvas.width, 'height': canvas.height, 'columns': COLS, 'rows': ROWS, 'cell_size': CELL,
                'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'characters': entries,
                'replaced_git_blob_sha': '677f07e92a891e2d74712d76ca497902b35054bb',
                'base_commit': '3c2bc16cba3b57d2f3ae81d3b1d9bd9f87edcf4e'}
    (ROOT / 'art/visual-novel/05_manifests/dialogue-avatar-preview-20260930.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Rebuilt review atlas from {len(entries)} verified canonical avatars')

if __name__ == '__main__':
    main()
