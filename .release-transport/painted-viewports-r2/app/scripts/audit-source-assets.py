"""Read-only source-pixel audit. Writes JSON metadata, never rewrites image bytes."""
from pathlib import Path
from PIL import Image
import json, hashlib, math
import numpy as np
from scipy.ndimage import label, maximum_filter
ROOT=Path(__file__).resolve().parents[1]
WS=ROOT.parent
sources={
 'forest':WS/'b-runtime-art-window/04_cg/working/BG_B_RW01_双根涧实景窗口_v1.png',
 'harbor':WS/'c-continuous-art-slice/04_cg/final/ENV_C2_M03_连续缆桥_空景艺术母版_v1.png',
 'hero':WS/'shared-map-character-production/hero-map-design-v1/04_cg/final/CHAR_hero_map_design_reference_four_directions_v2.png'}
manifest={}
for key,canonical in sources.items():
 p=canonical if canonical.exists() else ROOT/f'assets/{key}.png'
 im=Image.open(p)
 manifest[key]={'source':str(canonical.relative_to(WS)),'file':f'assets/{key}.png','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':list(im.size),'mode':im.mode,'operation':'byte-for-byte copy; no image editing'}
 # Copy unchanged source bytes, no encode/resample/cleanup.
 (ROOT/f'assets/{key}.png').write_bytes(p.read_bytes())
a=np.array(Image.open(ROOT/'assets/hero.png'))[:,:,3]
labels,n=label(a>16);areas=np.bincount(labels.ravel());ids=sorted(np.argsort(areas[1:])[-4:]+1,key=lambda i:np.where(labels==i)[1].min())
back,right=ids[1:3];guard=maximum_filter(a,size=5)
h,w=a.shape;xs=np.arange(920,1041);cost=np.full((h,len(xs)),np.inf);prev=np.zeros((h,len(xs)),dtype=np.int16)
manual=np.array([[0,990],[240,978],[300,966],[345,954],[390,965],[450,984],[510,994],[670,992],[740,993],[886,995]])
for y in range(h):
 b=np.where(labels[y]==back)[0];r=np.where(labels[y]==right)[0]
 lo=(b.max()+4 if len(b) else 920); hi=(r.min()-4 if len(r) else 1040)
 target=np.interp(y,manual[:,0],manual[:,1])
 for j,x in enumerate(xs):
  if x<lo or x>hi or guard[y,x]!=0:continue
  score=.001*(x-target)**2
  if y==0:cost[y,j]=score
  else:
   inds=np.arange(max(0,j-3),min(len(xs),j+4));vals=cost[y-1,inds]+.2*np.abs(xs[inds]-x)
   k=int(np.argmin(vals));cost[y,j]=vals[k]+score;prev[y,j]=inds[k]
assert np.isfinite(cost[-1]).any(),'No safe zero-alpha separator'
j=int(np.argmin(cost[-1]));path=[]
for y in range(h-1,-1,-1):path.append([int(xs[j]),y]);j=int(prev[y,j])
path=path[::-1]
def safe(p,q):
 for y in range(p[1],q[1]+1):
  x=p[0]+(q[0]-p[0])*(y-p[1])/(q[1]-p[1] or 1)
  if guard[y,int(round(x))]!=0:return False
  if abs(x-path[y][0])>2:return False
 return True
simple=[path[0]];i=0
while i<h-1:
 j=min(h-1,i+80)
 while j>i+1 and not safe(path[i],path[j]):j-=1
 simple.append(path[j]);i=j
views={
 'front':{'label':'正面','sourceRect':[0,0,513,887],'clipPolygon':[[0,0],[513,0],[513,887],[0,887]],'pivot':[266,866],'crownY':16,'referenceHeight':850},
 'back':{'label':'背面','sourceRect':[513,0,532,887],'clipPolygon':[[513,0],*simple,[513,886]],'pivot':[746,858],'crownY':27,'referenceHeight':831},
 'right':{'label':'朝画右 · 本人右侧近','sourceRect':[920,0,438,887],'clipPolygon':[*simple, [1358,886],[1358,0]],'pivot':[1219,852],'crownY':29,'referenceHeight':823},
 'left':{'label':'朝画左 · 本人左侧近','sourceRect':[1358,0,416,887],'clipPolygon':[[1358,0],[1774,0],[1774,887],[1358,887]],'pivot':[1535,858],'crownY':26,'referenceHeight':832}}
contacts={'front':[[230,853],[291,868]],'back':[[720,847],[765,859]],'right':[[1178,837],[1247,854]],'left':[[1495,859],[1568,838]]}
for key,v in views.items():
 v['soleContacts']=contacts[key];v['pivot']=[sum(p[i] for p in contacts[key])/2 for i in range(2)];v['referenceHeight']=v['pivot'][1]-v['crownY']
assert int(a[:,511:516].max())==0 and int(a[:,1356:1361].max())==0, 'Rectangular separator not transparent'
# Point-in-poly at pixel centers, test all substantive silhouette pixels survive semantic assignment.
def in_poly(x,y,poly):
 inside=np.zeros_like(x,dtype=bool)
 for i,(x1,y1) in enumerate(poly):
  x2,y2=poly[(i+1)%len(poly)]
  cross=((y1>y)!=(y2>y))&(x<(x2-x1)*(y-y1)/(y2-y1 if y2!=y1 else 1)+x1)
  inside ^= cross
 return inside
checks=[]
for name,i in zip(views,ids):
 yy,xx=np.where(labels==i);keep=in_poly(xx+.5,yy+.5,views[name]['clipPolygon']);assert keep.all(),name
 other=0
 for oi in ids:
  if oi==i:continue
  oy,ox=np.where(labels==oi);other+=int(in_poly(ox+.5,oy+.5,views[name]['clipPolygon']).sum())
 assert other==0,name
 checks.append({'view':name,'alphaGreater16MainComponentPixelsRetained':len(xx),'neighbourComponentPixelsIncluded':other})
metadata={'status':'QA neutral reference only; not animation or production-approved sprite','sheetSize':[w,h],'sourceSha256':manifest['hero']['sha256'],'views':views,'semanticSeparator':{'path':simple,'allSampledSeparatorPixelsAlpha':0,'clearanceAudit':'5x5 all-zero-alpha neighbourhood along raster-sampled path','method':'per-row source-alpha read and semantic component identification; source alpha never thresholded in renderer','sourceBitmapModified':False},'heightMethod':'Each view uniformly scaled by its own crown-to-contact height; width is never stretched independently. Foot pivots visually authored from original complete boots, pending in-browser art review.','checks':checks,'limitations':['Low-alpha edge noise and original alpha252–253 body interiors are preserved','Actual camera agreement/foot contact require browser screenshot review','Contact pivots are authored QA measurements, not motion-capture or complete walk-cycle grounding']}
(ROOT/'data/hero-views.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
(ROOT/'qa/source-integrity.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'assets':manifest,'separatorVertices':len(simple),'silhouetteChecks':checks},ensure_ascii=False,indent=2))
