import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT = new URL('../', import.meta.url);

test('art audit repair v3 opens a clean review session and retains the source issue list', async () => {
  const app = await readFile(new URL('public/art-audit/app.js', ROOT), 'utf8');
  assert.match(app, /lost-magic-tower:art-audit:reviews:v3/);
  assert.match(app, /encodeURIComponent\(AUDIT_VERSION\)/);

  const sourceUrl = new URL('art/visual-novel/05_manifests/reviews/tower-art-audit-2026-09-04-issues.json', ROOT);
  const source = JSON.parse(await readFile(sourceUrl, 'utf8'));
  assert.equal(source.issueCount, 23);
  assert.equal(source.issues.length, 23);
  await access(sourceUrl);

  const manifest = JSON.parse(await readFile(new URL('art/visual-novel/05_manifests/art-audit-repair-v3-manifest.json', ROOT), 'utf8'));
  assert.equal(manifest.sourceAudit, 'art/visual-novel/05_manifests/reviews/tower-art-audit-2026-09-04-issues.json');
  assert.equal(manifest.mapUnits.length, 2);
});
