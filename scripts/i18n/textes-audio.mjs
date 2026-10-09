/**
 * Textes à enregistrer pour les audios anglais et portugais (Magnific), avec
 * le nom exact de chaque fichier attendu par l'app :
 *   devotion-<i>.mp3, plan-<slug>-<jour>.mp3, formation-<leçon>-<partie>.mp3,
 *   etude-<étude>-<partie>.mp3
 * Sortie : i18n/audio/<langue>.json  [{ fichier, type, titre, texte }]
 * Les fichiers enregistrés s'importent dans public/audio/<langue>/ (workflow
 * « Importer des audios », dossier « en » ou « pt »).
 */
import fs from "node:fs";
import { texteAudioJour, planApprofondi } from "../plans/texte-audio.mjs";

const lire = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const MOT_JOUR = { en: "Day", pt: "Dia" };

/** Texte lisible d'un bloc d'étude (tous ses champs de texte, dans l'ordre). */
function texteBloc(b) {
  const out = [];
  const go = (v, cle) => {
    if (typeof v === "string") {
      if (!["type", "fichier"].includes(cle)) out.push(cle === "ref" ? `(${v})` : v);
    } else if (Array.isArray(v)) v.forEach((x) => go(x, cle));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) go(x, k);
  };
  go(b, "");
  return out.join("\n\n");
}

/** Découpe d'une étude en parties, calée sur les parties de l'audio français. */
function partiesEtude(blocs, nb) {
  const idx = (pred, from = 0) => {
    for (let i = from; i < blocs.length; i++) if (pred(blocs[i])) return i;
    return -1;
  };
  const partie2 = idx((b) => b.type === "partie" && b.n === 2);
  const appli1 = idx((b) => b.type === "application");
  const appli2 = idx((b) => b.type === "application", appli1 + 1);
  const conclusion = idx((b) => b.type === "rubrique" && /conclu/i.test(b.t), partie2);
  const h = (n) => idx((b) => b.type === "histoire" && b.n === n);
  const point3 = idx((b) => b.type === "point" && b.n === 3, appli1);
  // Bornes de début des 10 parties (étude « David 1 ») ; ailleurs, parts égales.
  let bornes = [0, idx((b) => b.type === "partie" && b.n === 1), h(3), h(5), appli1, point3, partie2, h(8), appli2, conclusion];
  if (nb !== 10 || bornes.some((x) => x < 0)) {
    bornes = Array.from({ length: nb }, (_, i) => Math.round((i * blocs.length) / nb));
  }
  return bornes.map((d, i) => blocs.slice(d, bornes[i + 1] ?? blocs.length).map(texteBloc).filter(Boolean).join("\n\n"));
}

for (const l of ["en", "pt"]) {
  const sortie = [];
  // Méditations
  const dev = lire(`public/i18n/contenu/${l}/devotions.json`).items;
  dev.forEach((d, i) =>
    sortie.push({ fichier: `devotion-${i}.mp3`, type: "méditation", titre: d.theme, texte: `${d.verseText} — ${d.verseReference}.\n\n${d.meditation}` }),
  );
  // Plans thématiques
  for (const p of lire(`public/i18n/contenu/${l}/plans.json`).items)
    for (const d of p.days)
      sortie.push({
        fichier: `plan-${p.slug}-${d.day}.mp3`,
        type: "plan",
        titre: `${p.title} — ${MOT_JOUR[l]} ${d.day}`,
        texte: planApprofondi(p) ? texteAudioJour(d, l) : `${MOT_JOUR[l]} ${d.day}. ${d.title}.\n\n${d.meditation}`,
      });
  // Formation : une partie par étape de lecture guidée
  for (const f of lire(`public/i18n/contenu/${l}/formations.json`).formations)
    for (const le of f.lecons)
      (le.etapes ?? []).forEach((e, k) => {
        const morceaux = e.tranches.map((t) => {
          const s = le.sections[t.s];
          const pars = s.p.split("\n\n").slice(t.d, t.f + 1);
          return (t.d === 0 ? [s.t, ...pars] : pars).join("\n\n");
        });
        sortie.push({ fichier: `formation-${le.id}-${k + 1}.mp3`, type: "formation", titre: `${le.titre} — ${e.titre}`, texte: morceaux.join("\n\n") });
      });
  // Études bibliques
  for (const e of lire(`public/i18n/contenu/${l}/etudes.json`).etudes) {
    const nb = (e.audio ?? []).length;
    if (!nb) continue;
    partiesEtude(e.blocs ?? [], nb).forEach((texte, k) =>
      sortie.push({ fichier: `etude-${e.id}-${k + 1}.mp3`, type: "étude", titre: `${e.titre} — ${e.audio[k].titre}`, texte }),
    );
  }
  fs.mkdirSync("i18n/audio", { recursive: true });
  fs.writeFileSync(`i18n/audio/${l}.json`, JSON.stringify(sortie, null, 1));
  // Ce qui reste à enregistrer (pas encore importé dans public/audio/<langue>/).
  const faits = fs.existsSync(`public/audio/${l}/index.json`) ? new Set(lire(`public/audio/${l}/index.json`)) : new Set();
  // Magnific limite la longueur d'une génération : les textes longs sont
  // coupés en parties (aux paragraphes), recollées à l'import (« nom.mp3|url1,url2 »).
  const MAX = 4500;
  const couper = (t) => {
    if (t.length <= MAX) return [t];
    const parts = [];
    let cur = "";
    for (const p of t.split("\n\n")) {
      if (cur && cur.length + p.length + 2 > MAX) {
        parts.push(cur);
        cur = p;
      } else cur = cur ? `${cur}\n\n${p}` : p;
    }
    if (cur) parts.push(cur);
    return parts;
  };
  const reste = sortie
    .filter((x) => !faits.has(x.fichier))
    .map((x) => {
      const parties = couper(x.texte);
      return parties.length > 1 ? { ...x, parties } : x;
    });
  fs.writeFileSync(`i18n/audio/${l}-a-faire.json`, JSON.stringify(reste, null, 1));
  console.log(`${l} : ${reste.length} audios à enregistrer, ${reste.reduce((n, x) => n + x.texte.length, 0)} caractères`);
  const parType = {};
  for (const x of sortie) parType[x.type] = (parType[x.type] ?? 0) + 1;
  const car = sortie.reduce((n, x) => n + x.texte.length, 0);
  console.log(l, sortie.length, "audios", JSON.stringify(parType), car, "caractères");
}
