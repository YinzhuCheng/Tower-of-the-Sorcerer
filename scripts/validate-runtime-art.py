#!/usr/bin/env python3
"""Fully decode shipped raster art and validate every declared atlas region.

RIFF headers, file sizes, and matching transport fragments are insufficient:
decoders can accept a damaged image header while rendering only its top rows.
This gate deliberately uses strict complete pixel decoding, then checks the
source/region hashes of deterministic repairs and all runtime manifest paths.
Requires the pinned Pillow version in scripts/requirements-art.txt.
"""
from pathlib import Path
from io import BytesIO
import hashlib
import json
import re
import struct
import sys
from PIL import Image, ImageFile

ROOT = Path(__file__).resolve().parents[1]
ImageFile.LOAD_TRUNCATED_IMAGES = False
RASTER_EXTENSIONS = {'.png', '.webp', '.jpg', '.jpeg', '.gif'}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def decode(path_or_file):
    image = Image.open(path_or_file)
    image.load()  # Force the entire frame, not just metadata/header parsing.
    if image.width <= 0 or image.height <= 0:
        raise ValueError('empty dimensions')
    return image.convert('RGBA')

def self_test():
    """Prove a valid RIFF envelope cannot hide a truncated WebP payload."""
    buf = BytesIO()
    image = Image.new('RGB', (32, 32), (10, 90, 180))
    image.save(buf, 'WEBP', quality=90)
    truncated = bytearray(buf.getvalue()[:-8])
    struct.pack_into('<I', truncated, 4, len(truncated) - 8)
    assert truncated[:4] == b'RIFF' and truncated[8:12] == b'WEBP'
    try:
        decode(BytesIO(truncated))
    except (OSError, ValueError):
        return
    raise AssertionError('strict decoder unexpectedly accepted a truncated fixture')

def main():
    self_test()
    errors, images = [], {}
    for path in sorted((ROOT / 'public/assets').rglob('*')):
        if path.suffix.lower() not in RASTER_EXTENSIONS:
            continue
        relative = path.relative_to(ROOT).as_posix()
        try:
            images[relative] = decode(path)
        except Exception as error:
            errors.append(f'{relative}: full decode failed: {error}')

    references = set()
    for category in ('enemies', 'items', 'map'):
        manifest_path = ROOT / f'public/assets/anime/{category}/manifest.json'
        manifest = json.loads(manifest_path.read_text())
        base = 'public' + manifest['basePath']
        for key, entry in manifest.get('assets', {}).items():
            for field in ('file', 'highResFile', 'base64File', 'bundle'):
                if entry.get(field):
                    references.add(base + entry[field])
            if category == 'enemies' and not entry.get('highResFile'):
                match = re.fullmatch(r'enemies/v1/(.+)-map-128\.webp', entry.get('file', ''))
                if match:
                    references.add(base + f'portraits/v1/{match.group(1)}-portrait-runtime.webp')
        if category != 'map':
            continue
        for name, atlas in manifest['atlases'].items():
            path = base + atlas['file']
            references.add(path)
            image = images.get(path)
            if image is None:
                continue
            cols, rows = atlas['cols'], atlas['rows']
            if image.width % cols or image.height % rows:
                errors.append(f'{name}: dimensions must divide exactly into {cols}x{rows} cells')
                continue
            width, height = image.width // cols, image.height // rows
            for key, entry in manifest['assets'].items():
                if entry.get('atlas') != name:
                    continue
                index = entry.get('index')
                if not isinstance(index, int) or not 0 <= index < cols * rows:
                    errors.append(f'{key}: invalid atlas index {index}')
                    continue
                x, y = index % cols * width, index // cols * height
                region = image.crop((x, y, x + width, y + height))
                if region.getchannel('A').getbbox() is None:
                    errors.append(f'{key}: referenced region is completely transparent')
                elif max(high - low for low, high in region.getextrema()[:3]) < 4:
                    errors.append(f'{key}: referenced region has no useful pixel detail')

    # Include authored literal URLs outside the manifest pipelines (CGs, portraits,
    # backgrounds, transitions, and CSS), without treating templates as paths.
    text_paths = list((ROOT / 'src').rglob('*.js')) + list((ROOT / 'public/art-audit').rglob('*.js'))
    text_paths += list(ROOT.glob('*.css')) + list(ROOT.glob('*.html'))
    pattern = re.compile(r'''['"](/assets/[^'"`$<>]+?\.(?:webp|png|jpg|jpeg|svg|json|b64))['"]''')
    for path in text_paths:
        references.update('public' + match for match in pattern.findall(path.read_text()))
    for path in sorted(references):
        if not (ROOT / path).is_file():
            errors.append(f'{path}: referenced file missing')

    repair_path = ROOT / 'art/visual-novel/05_manifests/runtime-atlas-repair-20260930.json'
    repair = json.loads(repair_path.read_text())
    for source in repair['sources'].values():
        if digest((ROOT / source['path']).read_bytes()) != source['sha256']:
            errors.append(f'{source["path"]}: rebuild source changed; regenerate the deterministic atlases')
    for atlas in repair['atlases']:
        image = images.get(atlas['path'])
        if digest((ROOT / atlas['path']).read_bytes()) != atlas['sha256']:
            errors.append(f'{atlas["path"]}: repair manifest file hash mismatch')
        if image is None:
            continue
        if image.size != (atlas['width'], atlas['height']):
            errors.append(f'{atlas["path"]}: repair manifest dimensions mismatch')
        size = atlas['cell_size']
        cols = atlas['width'] // size
        for slot in atlas['slots']:
            x, y = slot['index'] % cols * size, slot['index'] // cols * size
            region = image.crop((x, y, x + size, y + size))
            if digest(region.tobytes()) != slot['rgba_sha256']:
                errors.append(f'{atlas["name"]} cell {slot["index"]}: decoded pixel hash mismatch')
    preview = json.loads((ROOT / 'art/visual-novel/05_manifests/dialogue-avatar-preview-20260930.json').read_text())
    preview_image = images.get(preview['path'])
    if digest((ROOT / preview['path']).read_bytes()) != preview['sha256']:
        errors.append(f'{preview["path"]}: preview atlas file hash mismatch')
    if preview_image is not None:
        if preview_image.size != (preview['width'], preview['height']):
            errors.append(f'{preview["path"]}: preview dimensions mismatch')
        size, cols = preview['cell_size'], preview['columns']
        for character in preview['characters']:
            if digest((ROOT / character['source']).read_bytes()) != character['source_sha256']:
                errors.append(f'{character["source"]}: preview source changed; rebuild the contact atlas')
            x, y = character['index'] % cols * size, character['index'] // cols * size
            if digest(preview_image.crop((x, y, x + size, y + size)).tobytes()) != character['rgba_sha256']:
                errors.append(f'{character["character_id"]}: preview character-region pixel hash mismatch')
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        print(f'Runtime art validation failed: {len(errors)} problem(s)', file=sys.stderr)
        return 1
    print(f'Runtime art validation passed: {len(images)} fully decoded images; {len(references)} paths; all referenced atlas regions valid')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
