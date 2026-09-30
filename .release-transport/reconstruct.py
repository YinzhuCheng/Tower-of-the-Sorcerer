#!/usr/bin/env python3
"""Reconstruct only a reviewed release into a clean worktree; never publish main."""
import base64, hashlib, json, os, pathlib, re, subprocess, sys
ROOT = pathlib.Path.cwd()
M = json.loads((ROOT / '.release-transport/manifest.json').read_text())
BASE = '3c2bc16cba3b57d2f3ae81d3b1d9bd9f87edcf4e'
SHA = re.compile(r'^[0-9a-f]{40}$')
SHA256 = re.compile(r'^[0-9a-f]{64}$')
def run(*args, cwd=ROOT, data=None):
    return subprocess.check_output(args, cwd=cwd, input=data).decode().strip()
def blob_sha(data):
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def safe_path(value):
    p = pathlib.PurePosixPath(value)
    if not isinstance(value, str) or p.is_absolute() or '..' in p.parts or '.' in p.parts or not p.parts or '\\' in value or '\n' in value or '\r' in value or '\0' in value:
        raise ValueError('unsafe path')
    return p
assert M['schema'] == 1 and M['repository'] == 'YinzhuCheng/Tower-of-the-Sorcerer'
assert M['base_commit'] == BASE and M['file_count'] == 141 and len(M['files']) == 141
assert len({f['path'] for f in M['files']}) == 141
assert run('git','rev-parse',BASE) == BASE
for f in M['files']:
    safe_path(f['path'])
    assert not f['path'].startswith('.release-transport/')
    assert SHA.fullmatch(f['git_blob_sha']) and SHA256.fullmatch(f['sha256'])
    assert f['mode'] in ('100644','100755') and 0 < f['bytes'] < 10_000_000
expected = {f['git_blob_sha']: f for f in M['files']}
for b in M['pending_blobs']:
    assert b['git_blob_sha'] in expected
    f = expected[b['git_blob_sha']]
    assert b['bytes'] == f['bytes'] and b['sha256'] == f['sha256']
    parts = []
    for c in b['chunks']:
        p = safe_path(c['path'])
        assert c['path'].startswith('.release-transport/chunks/') and len(p.parts) == 3
        path = ROOT / p
        assert not path.is_symlink()
        raw = path.read_bytes()
        assert len(raw) == c['bytes'] <= 131072
        assert hashlib.sha256(raw).hexdigest() == c['sha256']
        assert blob_sha(raw) == c['git_blob_sha']
        parts.append(base64.b64decode(raw, validate=True))
    data = b''.join(parts)
    assert len(data) == f['bytes'] and hashlib.sha256(data).hexdigest() == f['sha256']
    assert blob_sha(data) == f['git_blob_sha']
    assert run('git','hash-object','-w','--stdin',data=data) == f['git_blob_sha']
# Verify reused blobs too: this covers every byte, not just newly transported ones.
for f in M['files']:
    data = subprocess.check_output(['git','cat-file','blob',f['git_blob_sha']],cwd=ROOT)
    assert len(data) == f['bytes'] and hashlib.sha256(data).hexdigest() == f['sha256']
FINAL = pathlib.Path(os.environ.get('RELEASE_WORKTREE', str(ROOT.parent/'tower-release-verified'))).resolve()
assert not FINAL.exists(), 'refuse to replace an existing worktree'
run('git','worktree','add','--detach',str(FINAL),BASE)
for f in M['files']:
    run('git','update-index','--add','--cacheinfo',f['mode'],f['git_blob_sha'],f['path'],cwd=FINAL)
run('git','checkout-index','--all','--force',cwd=FINAL)
changed = set(subprocess.check_output(['git','diff','--cached','--name-only','-z',BASE],cwd=FINAL).decode().rstrip('\0').split('\0'))
assert changed == {f['path'] for f in M['files']}, 'release differs from the exact approved path union'
for f in M['files']:
    p = FINAL/f['path']
    assert p.is_file() and not p.is_symlink()
    assert hashlib.sha256(p.read_bytes()).hexdigest() == f['sha256']
run('git','diff','--cached','--check',cwd=FINAL)
tree = run('git','write-tree',cwd=FINAL)
print('RELEASE_TREE_SHA='+tree)
print('RELEASE_WORKTREE='+str(FINAL))
if os.environ.get('GITHUB_OUTPUT'):
    with open(os.environ['GITHUB_OUTPUT'],'a') as out:
        out.write('tree='+tree+'\nworktree='+str(FINAL)+'\n')
