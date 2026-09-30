#!/usr/bin/env python3
"""Build transparent map-size derivatives of approved GAL named-cast standees.
Requires Pillow. Run from any directory; --check checks published/source hashes.
No image content is synthesized. The accepted fullbody is alpha-bounds cropped,
resized with its original aspect ratio, and placed inside a transparent canvas.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'art/visual-novel/05_manifests/named-cast-tower-gal-20260930-v1.json'

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_text())
    for asset in manifest['assets']:
        source = ROOT / asset['source']
        if sha(source.read_bytes()) != asset['source_sha256']:
            raise ValueError(f"Approved source drift: {asset['source']}")
        target = ROOT / asset['runtime']
        if args.check:
            if sha(target.read_bytes()) != asset['runtime_sha256']:
                raise ValueError(f"Runtime drift: {asset['runtime']}")
            with Image.open(target) as image:
                image.load()
                assert image.size == tuple(asset['dimensions'])
                assert image.mode == 'RGBA'
                assert image.getextrema()[3][0] == 0
            continue
        with Image.open(source) as original:
            image = original.convert('RGBA')
            settings = asset['transform']
            mask = image.getchannel('A').point(lambda value: 255 if value >= settings['alpha_bbox_threshold'] else 0)
            bbox = mask.getbbox()
            if not bbox:
                raise ValueError(f"Empty character: {source}")
            image = image.crop(bbox)
            width, height = asset['dimensions']
            pad = settings['padding_px']
            image.thumbnail((width - 2 * pad, height - 2 * pad), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            canvas.alpha_composite(image, ((width - image.width) // 2, height - pad - image.height))
            target.parent.mkdir(parents=True, exist_ok=True)
            canvas.save(target, 'WEBP', quality=settings['webp_quality'], method=settings['webp_method'], alpha_quality=settings['alpha_quality'], exact=True)
            asset['source_crop_box'] = list(bbox)
            asset['content_dimensions'] = list(image.size)
            asset['runtime_sha256'] = sha(target.read_bytes())
            asset['runtime_bytes'] = target.stat().st_size
    if not args.check:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f"{'Verified' if args.check else 'Built'} {len(manifest['assets'])} canonical named-cast map derivatives")

if __name__ == '__main__':
    main()
