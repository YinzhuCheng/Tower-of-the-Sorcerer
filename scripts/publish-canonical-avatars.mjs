#!/usr/bin/env node
// Publish already-reviewed canonical expression crops without altering pixels.
// Usage: node scripts/publish-canonical-avatars.mjs [--check]
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/canonical-avatars-runtime-20260930-v1.json', root), 'utf8'));
const accepted = JSON.parse(await readFile(new URL(manifest.source_manifest, root), 'utf8'));
const acceptedByTarget = new Map(accepted.assets.map(asset => [asset.runtime_target, asset]));
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const payloads = await Promise.all(manifest.assets.map(async asset => {
  const authority = acceptedByTarget.get(asset.runtime);
  if (!authority || authority.sha256 !== asset.runtime_sha256) throw new Error(`Unapproved avatar: ${asset.runtime}`);
  const bytes = await readFile(new URL(asset.master, root));
  if (hash(bytes) !== asset.runtime_sha256) throw new Error(`Master hash mismatch: ${asset.master}`);
  return { asset, bytes };
}));
// Validate every source before touching any runtime target.
for (const { asset, bytes } of payloads) {
  const target = new URL(asset.runtime, root);
  if (process.argv.includes('--check')) {
    if (hash(await readFile(target)) !== asset.runtime_sha256) throw new Error(`Runtime drift: ${asset.runtime}`);
  } else {
    await writeFile(target, bytes);
  }
}
console.log(`${process.argv.includes('--check') ? 'Verified' : 'Published'} ${payloads.length} canonical avatars`);
