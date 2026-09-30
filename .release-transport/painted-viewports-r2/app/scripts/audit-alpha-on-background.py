"""Numerical source-over sanity check on ORIGINAL background texels; does not write or edit images.
This is not browser rasterization, screenshot evidence, or visual halo acceptance.
"""
from pathlib import Path
from PIL import Image
import json, numpy as np, math
root=Path(__file__).resolve().parents[1];meta=json.load(open(root/'data/hero-views.json'));sheet=np.array(Image.open(root/'assets/hero.png'))
def polygon_test(x,y,poly):
 yes=np.zeros_like(x,dtype=bool)
 for i,(x1,y1) in enumerate(poly):
  x2,y2=poly[(i+1)%len(poly)]
  yes^=(((y1>y)!=(y2>y))&(x<(x2-x1)*(y-y1)/(y2-y1 if y2!=y1 else 1)+x1))
 return yes
results=[]
# Source-space positions used only to sample actual light/dark painted background colors.
for scene,foot,height in [('forest',[552.9*1672/1180,306.4*941/664],68*941/664),('harbor',[1112.0197747211919,682.9199596001803],1586/35*1.7*math.sqrt(19**2+30**2)/math.sqrt(19**2+16**2+30**2))]:
 bg=np.array(Image.open(root/f'assets/{scene}.png'))[:,:,:3]
 for name,v in meta['views'].items():
  x0,y0,w,h=v['sourceRect'];yy,xx=np.mgrid[y0:y0+h,x0:x0+w];valid=polygon_test(xx+.5,yy+.5,v['clipPolygon'])
  scale=height/v['referenceHeight'];dx=np.rint(foot[0]+(xx-v['pivot'][0])*scale).astype(int);dy=np.rint(foot[1]+(yy-v['pivot'][1])*scale).astype(int)
  valid &= (dx>=0)&(dy>=0)&(dx<bg.shape[1])&(dy<bg.shape[0]);sx=xx[valid];sy=yy[valid];dst=bg[dy[valid],dx[valid]].astype(float);src=sheet[sy,sx,:3].astype(float);alpha=sheet[sy,sx,3].astype(float)/255
  result=src*alpha[:,None]+dst*(1-alpha[:,None]);zero=alpha==0
  assert np.all(result>=0) and np.all(result<=255);assert np.array_equal(result[zero],dst[zero])
  samples=[]
  for category,mask in [('empty',zero),('soft_edge',(alpha>0)&(alpha<16/255)),('body',(alpha>=251/255)&(alpha<=253/255))]:
   ids=np.flatnonzero(mask)
   if len(ids):
    i=ids[len(ids)//2];samples.append({'category':category,'sourceXY':[int(sx[i]),int(sy[i])],'sourceRGBA':sheet[sy[i],sx[i]].tolist(),'actualBackgroundRGB':dst[i].astype(int).tolist(),'sourceOverRGB':result[i].round(3).tolist()})
  results.append({'scene':scene,'view':name,'originalBackgroundPixelsSampled':len(sx),'transparentSamplesUnchanged':int(zero.sum()),'softAlphaSourcePreserved':True,'examples':samples})
report={'scope':'READ-ONLY NUMERICAL SOURCE-OVER SANITY; NOT BROWSER/SCREENSHOT/VISUAL QA','outputImagesCreated':0,'bitmapEdits':0,'result':'PASS: zero alpha leaves original backdrop unchanged, soft alpha is preserved in source-over','browserInterpolationAndHalos':'PENDING actual browser screenshots on real scenes','results':results}
(root/'qa/alpha-on-background-numerical.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='results'},indent=2))
