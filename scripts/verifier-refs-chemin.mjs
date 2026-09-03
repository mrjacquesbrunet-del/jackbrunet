// Vérifie que CHAQUE référence des chapitres du Chemin s'ouvre vraiment dans
// le panneau de passage : même analyse que PassagePanel, puis résolution du
// livre, du chapitre et du verset dans le texte embarqué.
import fs from 'node:fs';
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
const books = JSON.parse(fs.readFileSync('public/bible/index.json','utf8'));
function analyse(r){
  const m = r.trim().match(/^(.+?)\s+(\d+)(?:\s*:\s*(\d+))?(?:\s*[-–]\s*(\d+)(?:\s*:\s*(\d+))?)?$/);
  if(!m) return null;
  const chap=Number(m[2]), vd=m[3]?Number(m[3]):0, second=m[4]?Number(m[4]):0, vf=m[5]?Number(m[5]):0;
  if(!vd) return {livre:m[1],chap,chapFin:second||chap,de:1,a:0};
  if(vf) return {livre:m[1],chap,chapFin:second,de:vd,a:0};
  return {livre:m[1],chap,chapFin:chap,de:vd,a:second||vd};
}
const cache={}; let bad=0,n=0;
for(const f of fs.readdirSync('src/config/chemin').filter(f=>f.startsWith('chapitre-'))){
  for(const m of fs.readFileSync('src/config/chemin/'+f,'utf8').matchAll(/ref: "([^"]+)"/g)){
    const r=m[1]; n++;
    const p=analyse(r);
    if(!p){console.log('REGEX KO',f,r);bad++;continue;}
    const nom=norm(p.livre);
    const b=books.find(b=>norm(b.name)===nom)||books.find(b=>norm(b.name).startsWith(nom))||books.find(b=>nom.startsWith(norm(b.name)));
    if(!b){console.log('LIVRE KO',f,r);bad++;continue;}
    const bk=cache[b.id]||(cache[b.id]=JSON.parse(fs.readFileSync('public/bible/'+b.id+'.json','utf8')));
    const ch=bk.chapters[p.chap-1];
    if(!ch){console.log('CHAP KO',f,r,'-> livre de',bk.chapters.length,'chapitres');bad++;continue;}
    if(p.de>ch.length){console.log('VERSET KO',f,r,'-> chapitre de',ch.length,'versets');bad++;continue;}
    if(p.a>ch.length){console.log('VERSET FIN KO',f,r,'-> chapitre de',ch.length,'versets');bad++;continue;}
    if(p.chapFin>bk.chapters.length){console.log('CHAP FIN KO',f,r);bad++;}
  }
}
console.log(n+' références, '+bad+' problème(s)');
process.exit(bad?1:0);
