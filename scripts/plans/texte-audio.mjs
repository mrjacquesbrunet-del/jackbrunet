/**
 * Texte de narration d'un jour de plan de lecture « approfondi » (avec
 * lecture du jour et « Mettre en pratique »), dans l'ordre de la page :
 * titre, passage du jour (texte biblique), versets clés, méditation, mettre
 * en pratique, question, prière, à retenir.
 *
 * Les références sont écrites pour être dites (« Jean, chapitre 3, versets
 * 16 à 18 ») et le texte biblique vient de la version de la langue (LSG,
 * WEB, Bíblia Livre).
 *
 * Utilisé par scripts/generate-audio.mjs (français, voix clonée) et
 * scripts/i18n/textes-audio.mjs (anglais, portugais).
 */
import fs from "node:fs";

const DOSSIERS = { fr: "public/bible", en: "public/bible/web", pt: "public/bible/blivre" };
const MOTS = {
  fr: { jour: "Jour", lecture: "Lecture du jour", cles: "Versets clés", pratique: "Mettre en pratique", question: "Pour réfléchir", priere: "Prière", retenir: "À retenir", chap: "chapitre", v: "verset", vv: "versets", a: "à", nums: ["Un", "Deux", "Trois", "Quatre", "Cinq"] },
  en: { jour: "Day", lecture: "Today's reading", cles: "Key verses", pratique: "Put it into practice", question: "To reflect on", priere: "Prayer", retenir: "Key takeaway", chap: "chapter", v: "verse", vv: "verses", a: "to", nums: ["One", "Two", "Three", "Four", "Five"] },
  pt: { jour: "Dia", lecture: "Leitura do dia", cles: "Versículos-chave", pratique: "Colocar em prática", question: "Para refletir", priere: "Oração", retenir: "Para lembrar", chap: "capítulo", v: "versículo", vv: "versículos", a: "a", nums: ["Um", "Dois", "Três", "Quatro", "Cinco"] },
};

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const caches = {};
function bible(langue) {
  if (caches[langue]) return caches[langue];
  const dossier = DOSSIERS[langue];
  const index = JSON.parse(fs.readFileSync(`${dossier}/index.json`, "utf8"));
  // Les références peuvent être écrites dans n'importe laquelle des trois langues.
  const tous = Object.values(DOSSIERS).flatMap((d) => JSON.parse(fs.readFileSync(`${d}/index.json`, "utf8")));
  const livres = {};
  return (caches[langue] = {
    trouver(nom) {
      const n = norm(nom);
      const b = tous.find((x) => norm(x.name) === n);
      return b ? index.find((x) => x.id === b.id) : null;
    },
    versets(id, chap, v1, v2) {
      livres[id] ??= JSON.parse(fs.readFileSync(`${dossier}/${id}.json`, "utf8"));
      return (livres[id].chapters[chap - 1] ?? []).slice(v1 - 1, v2).map((t) => t.replace(/\s+/g, " ").trim());
    },
  });
}

const REF = /([1-3]?\s?[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’ ]*?)\s+(\d+):(\d+)(?:\s*[-–]\s*(\d+))?/g;

/** « Jean 3:16-18 » → « Jean, chapitre 3, versets 16 à 18 ». */
export function refParlee(ref, langue) {
  const m = MOTS[langue];
  return ref.replace(REF, (_, livre, c, v1, v2) =>
    v2 ? `${livre.trim()}, ${m.chap} ${c}, ${m.vv} ${v1} ${m.a} ${v2}` : `${livre.trim()}, ${m.chap} ${c}, ${m.v} ${v1}`,
  );
}

function decouper(ref) {
  const r = ref.match(/^(.*?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  return r ? { livre: r[1], chap: +r[2], v1: +r[3], v2: +(r[4] ?? r[3]) } : null;
}

/** Toutes les références d'un texte (« Matthieu 5:4 », « 1 Jean 3:8-10 »)
 * deviennent lisibles à voix haute ; le livre est reconnu dans la liste des
 * livres (trois langues), pour ne pas avaler les mots qui précèdent. */
let RE_LIVRES = null;
function reLivres() {
  if (RE_LIVRES) return RE_LIVRES;
  const noms = [...new Set(Object.values(DOSSIERS).flatMap((d) => JSON.parse(fs.readFileSync(`${d}/index.json`, "utf8")).map((b) => b.name)))]
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  RE_LIVRES = new RegExp(`(?<![\\p{L}])(${noms.join("|")})\\s+(\\d+):(\\d+)(?:\\s*[-–]\\s*(\\d+))?`, "gu");
  return RE_LIVRES;
}
const parler = (texte, langue) => {
  const m = MOTS[langue];
  return texte.replace(reLivres(), (_, livre, c, v1, v2) =>
    v2 ? `${livre}, ${m.chap} ${c}, ${m.vv} ${v1} ${m.a} ${v2}` : `${livre}, ${m.chap} ${c}, ${m.v} ${v1}`,
  );
};

export function texteAudioJour(jour, langue) {
  const m = MOTS[langue];
  const b = bible(langue);
  const parties = [`${m.jour} ${jour.day}. ${jour.title}.`];
  const passage = (ref) => {
    const r = decouper(ref);
    const livre = r && b.trouver(r.livre);
    if (!livre) return "";
    return b.versets(livre.id, r.chap, r.v1, r.v2).join(" ");
  };
  const lecture = jour.lecture ? decouper(jour.lecture) : null;
  if (jour.lecture) parties.push(`${m.lecture} : ${refParlee(jour.lecture, langue)}.\n\n${passage(jour.lecture)}`);
  const cles = (jour.verses ?? []).filter((ref) => {
    const r = decouper(ref);
    return !(lecture && r && norm(r.livre) === norm(lecture.livre) && r.chap === lecture.chap && r.v1 >= lecture.v1 && r.v2 <= lecture.v2);
  });
  if (cles.length) parties.push(`${m.cles}.\n\n${cles.map((ref) => `${refParlee(ref, langue)}. ${passage(ref)}`).join("\n\n")}`);
  parties.push(
    jour.meditation
      .split("\n\n")
      .map((p) => (p.startsWith("## ") ? `${p.slice(3)}.` : parler(p, langue)))
      .join("\n\n"),
  );
  if (jour.pratique?.length)
    parties.push(`${m.pratique}.\n\n${jour.pratique.map((x, i) => `${m.nums[i] ?? i + 1}. ${x.titre}. ${parler(x.texte, langue)}`).join("\n\n")}`);
  if (jour.question) parties.push(`${m.question}. ${jour.question}`);
  if (jour.priere) parties.push(`${m.priere}. ${jour.priere}`);
  if (jour.aRetenir) parties.push(`${m.retenir}. ${jour.aRetenir}`);
  return parties.join("\n\n").replace(/[ \t]+/g, " ");
}

/** Plan au nouveau format (lecture du jour + mettre en pratique) ? */
export const planApprofondi = (p) => p.days.some((d) => d.lecture || d.pratique);
