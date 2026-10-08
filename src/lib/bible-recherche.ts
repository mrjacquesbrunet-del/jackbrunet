"use client";

import { getBook, getIndex } from "@/lib/bible-client";
import { getVersionBible } from "@/lib/bible-version";

/**
 * Recherche par mot dans toute la Bible (version lue). Le texte complet est
 * chargé une seule fois par version puis gardé en mémoire.
 */
export type LivreTexte = { id: number; name: string; chapters: string[][] };
export type Resultat = { livre: number; nom: string; chap: number; verset: number; texte: string };
export type Portee = "tout" | "at" | "nt" | "livre";

const CORPUS = new Map<string, Promise<LivreTexte[]>>();

export function chargerCorpus(): Promise<LivreTexte[]> {
  const v = getVersionBible();
  let p = CORPUS.get(v);
  if (!p) {
    p = getIndex(v).then((index) =>
      Promise.all(
        index.map((b) =>
          getBook(b.id, v)
            .then((bk) => ({ id: b.id, name: b.name, chapters: bk.chapters }))
            .catch(() => ({ id: b.id, name: b.name, chapters: [] as string[][] })),
        ),
      ),
    );
    p.catch(() => CORPUS.delete(v));
    CORPUS.set(v, p);
  }
  return p;
}

/** Sans accents ni majuscules, pour comparer « Éternel » et « eternel ». */
export const normaliser = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const echapper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Le mot (ou l'expression) doit commencer un mot : « berger » trouve « bergers », pas « hébergera ». */
export function motif(requete: string): RegExp | null {
  const q = normaliser(requete.trim()).replace(/\s+/g, " ");
  if (q.length < 2) return null;
  return new RegExp(`(^|[^a-z0-9])${echapper(q)}`);
}

export function chercher(
  corpus: LivreTexte[],
  requete: string,
  portee: Portee,
  livreCourant: number,
  max = 300,
): { resultats: Resultat[]; total: number } {
  const re = motif(requete);
  if (!re) return { resultats: [], total: 0 };
  const resultats: Resultat[] = [];
  let total = 0;
  for (const b of corpus) {
    if (portee === "at" && b.id > 39) continue;
    if (portee === "nt" && b.id < 40) continue;
    if (portee === "livre" && b.id !== livreCourant) continue;
    b.chapters.forEach((versets, c) =>
      versets.forEach((t, v) => {
        if (!re.test(normaliser(t))) return;
        total++;
        if (resultats.length < max) resultats.push({ livre: b.id, nom: b.name, chap: c + 1, verset: v + 1, texte: t });
      }),
    );
  }
  return { resultats, total };
}

/** Repère les passages du texte où le mot apparaît (pour les surligner). */
export function segments(texte: string, requete: string): { t: string; m: boolean }[] {
  const q = normaliser(requete.trim()).replace(/\s+/g, " ");
  if (q.length < 2) return [{ t: texte, m: false }];
  // La normalisation garde la même longueur pour les lettres latines usuelles
  // (une lettre accentuée = une lettre + un accent retiré).
  const plat = normaliser(texte);
  if (plat.length !== texte.length) return [{ t: texte, m: false }];
  const out: { t: string; m: boolean }[] = [];
  let i = 0;
  const re = new RegExp(`(^|[^a-z0-9])(${echapper(q)})`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(plat))) {
    const debut = m.index + m[1].length;
    if (debut > i) out.push({ t: texte.slice(i, debut), m: false });
    // On surligne le mot entier (« bergers », pas seulement « berger »).
    let fin = debut + q.length;
    while (fin < plat.length && /[a-z0-9]/.test(plat[fin])) fin++;
    out.push({ t: texte.slice(debut, fin), m: true });
    i = fin;
    re.lastIndex = i;
  }
  if (i < texte.length) out.push({ t: texte.slice(i), m: false });
  return out;
}
