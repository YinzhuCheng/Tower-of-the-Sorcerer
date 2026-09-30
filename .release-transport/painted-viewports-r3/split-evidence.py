from pathlib import Path
import hashlib,json,shutil
root=Path('.release-transport/painted-viewports-r3');src=root/'app/qa/browser-evidence';dest=root/'evidence-shards';limit=12*1024*1024
assert src.is_dir(),'NO_BROWSER_EVIDENCE'
files=sorted(p for p in src.rglob('*') if p.is_file());assert files,'NO_BROWSER_FILES'
parts=[];batch=[];size=0
for p in files:
 assert not p.is_symlink() and p.stat().st_size<=limit,p
 if batch and size+p.stat().st_size>limit:parts.append(batch);batch=[];size=0
 batch.append(p);size+=p.stat().st_size
if batch:parts.append(batch)
assert len(parts)<=16,('TOO_MANY_SHARDS',len(parts))
for i,part in enumerate(parts):
 directory=dest/f'{i:02d}';directory.mkdir(parents=True,exist_ok=True);items=[]
 for p in part:
  rel=p.relative_to(src);q=directory/rel;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q);items.append({'path':str(rel),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 (directory/f'SHARD-{i:02d}.json').write_text(json.dumps({'shard':i,'source':'actual official Chrome screenshots and JSON from this run','files':items},indent=2)+'\n')
print(json.dumps({'files':len(files),'pngs':sum(p.suffix=='.png' for p in files),'shards':len(parts),'limit':limit}))
