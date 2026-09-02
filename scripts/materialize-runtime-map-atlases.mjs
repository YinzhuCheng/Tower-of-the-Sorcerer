import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapRoot = join(root, 'public', 'assets', 'anime', 'map');
const atlasRoot = join(mapRoot, 'atlases');
const runtimeRoot = join(atlasRoot, 'runtime');

const ATLASES = Object.freeze({
  'environment.webp': [
    'environment-1.b64',
    'environment-2.b64',
    'environment-3.b64',
    'environment-4.b64',
    'environment-5.b64'
  ],
  'hero.webp': [
    'hero-1.b64',
    'hero-2a.b64',
    'hero-2b.b64',
    'hero-3a.b64',
    'hero-3b.b64'
  ],
  'featured-v2.webp': [
    'featured-v2-01.b64',
    'featured-v2-02.b64',
    'featured-v2-03.b64',
    'featured-v2-04.b64',
    'featured-v2-05a1.b64',
    'featured-v2-05a2.b64',
    'featured-v2-05b.b64',
    'featured-v2-06.b64',
    'featured-v2-07a.b64',
    'featured-v2-08.b64'
  ],
  'v4-combined.webp': [
    'v4/combined-01.b64',
    'v4/combined-02.b64',
    'v4/combined-03.b64',
    'v4/combined-04.b64',
    'v4/combined-05.b64',
    'v4/combined-06.b64',
    'v4/combined-07.b64'
  ],
  'hero-portrait-v4.webp': [
    'v4/portrait-01.b64',
    'v4/portrait-02.b64',
    'v4/portrait-03.b64'
  ],
  'wall-materials-v6.webp': [
    'v6/wall-materials-v6-01.b64',
    'v6/wall-materials-v6-02.b64',
    'v6/wall-materials-v6-03.b64',
    'v6/wall-materials-v6-04a.b64',
    'v6/wall-materials-v6-04b.b64',
    'v6/wall-materials-v6-05.b64',
    'v6/wall-materials-v6-06a.b64',
    'v6/wall-materials-v6-06b.b64',
    'v6/wall-materials-v6-07a.b64',
    'v6/wall-materials-v6-07b.b64',
    'v6/wall-materials-v6-08a.b64',
    'v6/wall-materials-v6-08b.b64',
    'v6/wall-materials-v6-09a.b64',
    'v6/wall-materials-v6-09b.b64'
  ],
  'gameplay-v10.webp': [
    'v10/gameplay-v10-ultra-01.b64',
    'v10/gameplay-v10-ultra-02-fixed.b64'
  ],
  'ui-v8.webp': [
    'v8/generated-v8-01a.b64',
    'v8/generated-v8-01b.b64',
    'v8/generated-v8-02a.b64',
    'v8/generated-v8-02b.b64',
    'v8/generated-v8-03.b64',
    'v8/generated-v8-04.b64',
    'v8/generated-v8-05.b64',
    'v8/generated-v8-06.b64'
  ]
});

function decodeCanonicalWebP(payload, label) {
  const normalized = payload.replace(/\s+/g, '');
  const binary = atob(normalized);
  const bytes = Buffer.from(binary, 'latin1');
  if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') {
    throw new Error(`${label} is not a RIFF WebP image.`);
  }
  const declaredLength = bytes.readUInt32LE(4) + 8;
  if (declaredLength !== bytes.length) {
    throw new Error(`${label} is truncated: RIFF declares ${declaredLength} bytes, reconstructed ${bytes.length}.`);
  }
  return bytes;
}

await mkdir(runtimeRoot, { recursive: true });
for (const [output, fragments] of Object.entries(ATLASES)) {
  const payload = (await Promise.all(fragments.map((fragment) => readFile(join(atlasRoot, fragment), 'utf8')))).join('');
  await writeFile(join(runtimeRoot, output), decodeCanonicalWebP(payload, output));
}
