#!/usr/bin/env python3
"""Bounded original-art decode, frozen-app verification and same-branch blob retention."""
import base64,hashlib,io,json,os,pathlib,re,subprocess,sys
from PIL import Image
root=pathlib.Path.cwd(); prefix='.release-transport/painted-viewports-r2'; verify_only='--verify-only' in sys.argv
sha=lambda b:hashlib.sha256(b).hexdigest()
blob=lambda b:hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def git(*args,data=None):return subprocess.check_output(['git',*args],cwd=root,input=data).decode().strip()
def safe(rel):
 p=pathlib.PurePosixPath(rel);assert not p.is_absolute() and '..' not in p.parts and rel.startswith(prefix+'/'),rel
 q=root/rel;assert q.is_file() and not q.is_symlink(),rel;return q.read_bytes()
m=json.loads(safe(prefix+'/manifest.json'))
assert m['schema']==1 and m['repository']=='YinzhuCheng/Tower-of-the-Sorcerer' and m['storage_branch']=='transport/reviewed-art-20260930' and m['prefix']==prefix
assert set(m['protected_refs'])=={'main','candidate/b-forest-road','candidate/c-night-harbor','candidate/c-harbor-3d-view'}
def protected():
 for ref,expected in m['protected_refs'].items():assert git('ls-remote','origin','refs/heads/'+ref).split()[0]==expected,'PROTECTED_REF_CHANGED:'+ref
if not verify_only:
 head=os.environ['GITHUB_SHA'];assert git('rev-parse','HEAD')==head;assert not git('status','--porcelain'),'UNCLEAN_CHECKOUT';protected()
 assert git('ls-remote','origin','refs/heads/'+m['storage_branch']).split()[0]==head,'TRANSPORT_CHANGED'
assert len(m['files'])==3 and {f['path'] for f in m['files']}=={'assets/forest.png','assets/harbor.png','assets/hero.png'}
for f in m['files']:
 assert re.fullmatch('[0-9a-f]{40}',f['git_blob_sha']);parts=[];offset=0
 for c in f['chunks']:
  assert c['path'].startswith(prefix+'/chunks/');b=safe(c['path']);assert 0<len(b)<=131072 and len(b)==c['bytes'] and c['offset']==offset
  assert sha(b)==c['sha256'] and blob(b)==c['git_blob_sha'];parts.append(b);offset+=len(b)
 b=base64.b64decode(b''.join(parts),validate=True);assert len(b)==f['bytes'] and sha(b)==f['sha256'] and blob(b)==f['git_blob_sha']
 with Image.open(io.BytesIO(b)) as im:assert im.format=='PNG';im.load();assert im.width>0 and im.height>0
 dest=root/prefix/'app'/f['path'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b)
 if not verify_only:
  assert git('hash-object','-w','--stdin',data=b)==f['git_blob_sha'];git('update-index','--add','--cacheinfo','100644',f['git_blob_sha'],'.release-transport/final-blobs/'+f['git_blob_sha'])
 print('VERIFIED_ORIGINAL='+f['git_blob_sha']+' '+f['path'],flush=True)
app_manifest=safe(prefix+'/app/MANIFEST.json');assert sha(app_manifest)==m['app_manifest_sha256']
subprocess.run(['node','scripts/check-manifest.mjs'],cwd=root/prefix/'app',check=True)
if verify_only:print('VERIFY_ONLY=true; NO_REMOTE_WRITE=true');sys.exit(0)
tree=git('write-tree');assert git('rev-parse',head+':.github')==git('rev-parse',tree+':.github'),'WORKFLOW_SUBTREE_CHANGED'
expected={'.release-transport/final-blobs/'+f['git_blob_sha'] for f in m['files']};changed=set(git('diff','--cached','--name-only',head).splitlines());assert changed.issubset(expected),changed
if not changed:
 for f in m['files']:assert git('rev-parse',head+':.release-transport/final-blobs/'+f['git_blob_sha'])==f['git_blob_sha']
 protected();print('ALREADY_RETAINED=true; NO_REF_CHANGED=true');sys.exit(0)
protected();assert git('ls-remote','origin','refs/heads/'+m['storage_branch']).split()[0]==head,'TRANSPORT_CHANGED_BEFORE_RETENTION'
commit=git('commit-tree',tree,'-p',head,data=b'transport: retain three verified original painted-scene QA assets [skip ci]\n')
git('push','origin',commit+':refs/heads/'+m['storage_branch'])
print('CONTENT_STORAGE_TREE='+tree,flush=True);print('CONTENT_STORAGE_COMMIT='+commit,flush=True)
