# Analyse des captures de l'outil de vérification : compare la couleur réelle
# du bord de la page (pixels) avec le fond qui apparaîtrait au rebond.
import json,sys,re
from PIL import Image
S=sys.argv[1]; L=sys.argv[2] if len(sys.argv)>2 else 'fr'
m=json.load(open(f'{S}/audit/mesures-{L}.json'))
def rgb(c):
  v=[float(x) for x in re.findall(r'[\d.]+',c)][:3]; return tuple(int(x) for x in v)
def ligne(img,y):
  w=img.size[0]; px=[img.getpixel((x,y)) for x in range(20,w-20,10)]
  return tuple(sum(p[i] for p in px)//len(px) for i in range(3))
def ecart(a,b): return max(abs(a[i]-b[i]) for i in range(3))
ko=0
for x in m:
  pb=[]
  H=Image.open(f"{S}/audit/H{x['nom']}.png").convert('RGB'); B=Image.open(f"{S}/audit/B{x['nom']}.png").convert('RGB')
  th=ligne(H,1); fh=rgb(x['haut']['fond'])
  if ecart(th,fh)>28: pb.append(f'haut: page {th} / fond {fh}')
  yb=max(0,x['bas']['navTop']-2); tb=ligne(B,yb); fb=rgb(x['bas']['fond'])
  if ecart(tb,fb)>28: pb.append(f'bas: page {tb} / fond {fb}')
  if x['haut']['chev']: pb.append('sous la barre: '+' | '.join(x['haut']['chev']))
  if x['js']: pb.append('JS: '+' / '.join(x['js']))
  ko+=bool(pb)
  print(('✗ ' if pb else '✓ ')+x['page'].ljust(26)+' ; '.join(pb))
print(f'{len(m)-ko}/{len(m)} pages OK')
