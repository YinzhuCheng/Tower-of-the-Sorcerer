#!/usr/bin/env python3
"""Retain verified data blobs on the temporary branch without editing workflows."""
import hashlib, json, os, pathlib, subprocess, sys
ROOT = pathlib.Path.cwd()
def git(*args, data=None):
    return subprocess.check_output(['git', *args], cwd=ROOT, input=data).decode().strip()
manifest = json.loads((ROOT/'.release-transport/manifest.json').read_text())
head = os.environ['GITHUB_SHA']
assert git('rev-parse', 'HEAD') == head
assert git('status', '--porcelain') == '', 'temporary checkout must be clean'
base = manifest['base_commit']
assert git('ls-remote','origin','refs/heads/main').split()[0] == base
for f in manifest['files']:
    sha = f['git_blob_sha']
    raw = subprocess.check_output(['git','cat-file','blob',sha],cwd=ROOT)
    assert len(raw) == f['bytes'] and hashlib.sha256(raw).hexdigest() == f['sha256']
    git('update-index','--add','--cacheinfo','100644',sha,'.release-transport/final-blobs/'+sha)
storage_tree = git('write-tree')
assert git('rev-parse', head+':.github') == git('rev-parse', storage_tree+':.github'), 'workflow tree must remain byte-identical'
changed = git('diff','--cached','--name-only',head).splitlines()
assert changed and all(p.startswith('.release-transport/final-blobs/') for p in changed), 'only content-storage paths may change'
if '--check-only' in sys.argv:
    print('CHECKED_STORAGE_TREE='+storage_tree)
    print('WORKFLOW_TREE_UNCHANGED=true')
    raise SystemExit(0)
commit = git('commit-tree', storage_tree, '-p', head, data=b'transport: retain verified content blobs [skip ci]\n')
git('push','origin',commit+':refs/heads/transport/reviewed-art-20260930')
print('VERIFIED_RELEASE_TREE='+os.environ['RELEASE_TREE'])
print('CONTENT_STORAGE_COMMIT='+commit)
print('WORKFLOW_TREE_UNCHANGED=true')
