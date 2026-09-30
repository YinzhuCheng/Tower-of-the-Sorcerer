#!/usr/bin/env python3
"""Verify six scoped preview textures and retain ordinary blobs on the temporary branch."""
import base64,hashlib,io,json,os,pathlib,re,subprocess,sys
from PIL import Image
root=pathlib.Path.cwd()
def git(*args,data=None):
 return subprocess.check_output(['git',*args],cwd=root,input=data).decode().strip()
def sha(b): return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def read_safe(rel,prefix):
 p=pathlib.PurePosixPath(rel)
 assert not p.is_absolute() and '..' not in p.parts and rel.startswith(prefix),rel
 local=root/rel
 assert local.is_file() and not local.is_symlink(),rel
 return local.read_bytes()
m=json.loads(read_safe('.release-transport/materials-r1/manifest.json','.release-transport/materials-r1/'))
assert m['schema']==1 and m['repository']=='YinzhuCheng/Tower-of-the-Sorcerer'
assert m['storage_branch']=='transport/reviewed-art-20260930'
head=os.environ['GITHUB_SHA'];assert git('rev-parse','HEAD')==head
assert not git('status','--porcelain'), 'checkout must start clean'
assert git('ls-remote','origin','refs/heads/main').split()[0]==m['expected_main'],'main changed'
assert git('ls-remote','origin','refs/heads/'+m['storage_branch']).split()[0]==head,'transport branch changed'
assert len(m['files'])==6
seen=set()
for f in m['files']:
 p=pathlib.PurePosixPath(f['path'])
 assert p.parent.as_posix()=='public/assets/continuous-map' and p.suffix=='.webp'
 assert f['path'] not in seen;seen.add(f['path'])
 assert re.fullmatch('[0-9a-f]{40}',f['git_blob_sha'])
 parts=[];offset=0
 for c in f['chunks']:
  cb=read_safe(c['path'],'.release-transport/materials-r1/chunks/')
  assert 0<len(cb)<=131072 and len(cb)==c['bytes'] and c['offset']==offset
  assert sha(cb)==c['sha256'] and blob(cb)==c['git_blob_sha']
  parts.append(cb);offset+=len(cb)
 b=base64.b64decode(b''.join(parts),validate=True)
 assert len(b)==f['bytes'] and sha(b)==f['sha256'] and blob(b)==f['git_blob_sha'],f['path']
 with Image.open(io.BytesIO(b)) as im:
  assert im.format=='WEBP';im.load();assert im.width>0 and im.height>0
 assert git('hash-object','-w','--stdin',data=b)==f['git_blob_sha']
 git('update-index','--add','--cacheinfo','100644',f['git_blob_sha'],'.release-transport/final-blobs/'+f['git_blob_sha'])
 print('VERIFIED_BLOB='+f['git_blob_sha']+' '+f['path'],flush=True)
tree=git('write-tree')
assert git('rev-parse',head+':.github')==git('rev-parse',tree+':.github'),'workflow subtree changed'
expected={'.release-transport/final-blobs/'+f['git_blob_sha'] for f in m['files']}
changed=set(git('diff','--cached','--name-only',head).splitlines())
assert changed and changed.issubset(expected),changed
assert git('ls-remote','origin','refs/heads/main').split()[0]==m['expected_main'],'main changed before retention'
print('CONTENT_STORAGE_TREE='+tree,flush=True)
if '--check-only' in sys.argv:
 print('CHECK_ONLY=true; NO_REF_CHANGED=true');sys.exit(0)
commit=git('commit-tree',tree,'-p',head,data=b'transport: retain six verified preview texture blobs [skip ci]\n')
git('push','origin',commit+':refs/heads/'+m['storage_branch'])
print('CONTENT_STORAGE_COMMIT='+commit,flush=True)
