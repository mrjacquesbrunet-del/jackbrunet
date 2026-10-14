/**
 * Thèmes d'un sujet de prière (étiquettes sous le texte : « Guérison »,
 * « Famille »…), devinés à partir des mots du sujet. 3 au plus.
 */
const THEMES: [string, RegExp][] = [
  ["Parole de Dieu", /«[^»]{12,}»\s*[1-3]?\s*[A-ZÉ][a-zéèêëîïôû]+\.?\s+\d+\s*[:.,]\s*\d+/],
  ["Guérison", /gu[ée]ri|malad|sant[ée]|h[ôo]pital|douleur|cancer|op[ée]ration|m[ée]decin|sp[ée]cialiste|diagnostic|soins?\b/i],
  ["Enfants", /\benfants?\b|\bfils\b|\bfille\b|b[ée]b[ée]|\bpetits?-enfants\b/i],
  ["Famille", /famille|\bmari\b|[ée]pouse|\bfemme\b|parents?\b|\bm[èe]re\b|\bp[èe]re\b|fr[èe]re|s[œo]eur|\bfils\b|\bfille\b/i],
  ["Couple", /couple|mariage|fian[cç]|\bmari\b|[ée]poux|[ée]pouse/i],
  ["Travail", /travail|emploi|\bjob\b|entretien d.embauche|patron|chômage|ch[ôo]mage|entreprise|poste\b|recherche d.emploi/i],
  ["Finances", /argent|dette|financ|loyer|factur|salaire|budget/i],
  ["Études", /examen|[ée]tudes?\b|[ée]cole|\bbac\b|concours|universit|partiel|dipl[ôo]me/i],
  ["Paix", /anxi[ée]t[ée]|angoiss|\bpeur\b|stress|d[ée]pression|paix|insomni|inqui[ée]t/i],
  ["Délivrance", /d[ée]livr|addiction|d[ée]pendance|cha[iî]nes?|oppress/i],
  ["Salut", /\bsalut\b|conversion|se convertir|conna[iî]tre (j[ée]sus|dieu)|donner sa vie [àa] j[ée]sus/i],
  ["Louange", /merci (seigneur|dieu|j[ée]sus)|gloire [àa] dieu|louange|alléluia|all[ée]luia|dieu est fid[èe]le|t[ée]moignage/i],
  ["Encouragement", /courage|encourag|tiens bon|fortifi|ne l[âa]che pas/i],
];

export function themesPriere(texte: string): string[] {
  const out: string[] = [];
  for (const [nom, re] of THEMES) {
    if (re.test(texte)) out.push(nom);
    if (out.length >= 3) break;
  }
  // Une citation biblique est aussi un encouragement.
  if (out.includes("Parole de Dieu") && out.length < 2) out.push("Encouragement");
  return out;
}
