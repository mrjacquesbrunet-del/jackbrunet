"use client";

import { mediaUrl } from "@/lib/asset";

/**
 * LEXIQUE GREC / HÉBREU — données servies par le site (public/lexique,
 * construites par scripts/build-lexique.mjs à partir de STEPBible, CC BY 4.0).
 *   index.json        : la liste (code, mot, translittération, vedette, emplois, langue)
 *   mots/<tranche>    : les fiches (sens, détail, traductions de la Segond, parentés)
 *   conc/<tranche>    : la concordance dans la Segond (versets + mots soulignés)
 */

/** g = grec, h = hébreu, a = araméen ; « n » ajouté pour un nom propre. */
export type Langue = "g" | "h" | "a" | "gn" | "hn" | "an";
/** [code, mot, translittération, vedette française, emplois, langue] */
export type EntreeIndex = [string, string, string, string, number, Langue];

export type Mot = {
  mot: string;
  translit: string;
  pron?: string;
  nature: string;
  fr: string;
  sens: string[];
  detail?: string;
  /** Traductions dans la Segond : [lemme, nombre] */
  trad: [string, number][];
  de?: string[];
  derives?: string[];
  nb: number;
};

/** [livre, chapitre, verset, début1, fin1, début2, fin2…] (positions dans le texte du verset) */
export type Emploi = number[];

const tranche = (code: string) => code.slice(0, 3);

function charger<T>(chemin: string, cache: Map<string, Promise<T>>): Promise<T> {
  let p = cache.get(chemin);
  if (!p) {
    p = fetch(mediaUrl(chemin)).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<T>;
    });
    p.catch(() => cache.delete(chemin));
    cache.set(chemin, p);
  }
  return p;
}

const cacheIndex = new Map<string, Promise<EntreeIndex[]>>();
const cacheMots = new Map<string, Promise<Record<string, Mot>>>();
const cacheConc = new Map<string, Promise<Record<string, Emploi[]>>>();

export const getIndexLexique = () => charger("/lexique/index.json", cacheIndex);

const cacheVersets = new Map<string, Promise<Record<string, [string, number?, number?][]>>>();
/** Les mots pleins d'un verset : [code, début, fin] dans le texte de la Segond. */
export async function getMotsDuVerset(livre: number, chapitre: number, verset: number) {
  const t = await charger(`/lexique/versets/${livre}.json`, cacheVersets);
  return t[`${chapitre}:${verset}`] ?? [];
}

export async function getMot(code: string): Promise<Mot | null> {
  const t = await charger(`/lexique/mots/${tranche(code)}.json`, cacheMots);
  return t[code] ?? null;
}

export async function getEmplois(code: string): Promise<Emploi[]> {
  const t = await charger(`/lexique/conc/${tranche(code)}.json`, cacheConc);
  return t[code] ?? [];
}

export const estGrec = (code: string) => code.startsWith("G");
export function nomLangue(l: Langue | string): string {
  return l.startsWith("g") ? "Grec" : l.startsWith("a") ? "Araméen" : "Hébreu";
}

/** « G0026 » → « G26 » (forme courte, comme dans les commentaires). */
export const codeCourt = (code: string) => code.replace(/^([GH])0+(\d)/, "$1$2");

/**
 * Retrouve l'entrée d'un numéro Strong simple (« H7462 », « G26 ») : parmi
 * ses variantes (H7462A, H7462B…), la plus employée.
 */
export function entreeDuStrong(index: EntreeIndex[], strong: string): EntreeIndex | null {
  const m = strong.trim().toUpperCase().match(/^([GH])0*(\d{1,4})([A-Z])?$/);
  if (!m) return null;
  const base = `${m[1]}${m[2].padStart(4, "0")}`;
  const exact = m[3] ? index.find((e) => e[0] === base + m[3]) : null;
  if (exact) return exact;
  let best: EntreeIndex | null = null;
  for (const e of index) if (e[0].startsWith(base) && (!best || e[4] > best[4])) best = e;
  return best;
}

/** Sans accents ni diacritiques (grec, hébreu, français) pour la recherche. */
export function plat(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u0591-\u05c7]/g, "")
    .replace(/[.’'-]/g, "")
    .toLowerCase()
    .trim();
}

/** Prononciation par la synthèse vocale du téléphone (grec moderne / hébreu). */
export function voixDisponible(langue: Langue | string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const code = langue.startsWith("g") ? "el" : "he";
  return window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(code));
}
export function prononcer(mot: string, langue: Langue | string) {
  try {
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(mot);
    u.lang = langue.startsWith("g") ? "el-GR" : "he-IL";
    u.rate = 0.8;
    const v = s.getVoices().find((x) => x.lang.toLowerCase().startsWith(u.lang.slice(0, 2)));
    if (v) u.voice = v;
    s.speak(u);
  } catch {
    /* synthèse indisponible */
  }
}

export const CREDIT_LEXIQUE =
  "Lexique : STEPBible.org (Tyndale House, Cambridge), licence CC BY 4.0 ; parentés et prononciation : Strong (1890), Open Scriptures. Définitions traduites en français ; correspondances avec la Segond 1910 établies automatiquement.";

/**
 * Code du lexique pour un numéro Strong cité dans un verset : la variante
 * (H7462A, H7462B…) réellement employée dans ce verset, sinon la plus courante.
 */
export async function codeDansVerset(strong: string, livre: number, chapitre: number, verset: number): Promise<string | null> {
  const index = await getIndexLexique();
  const m = strong.trim().toUpperCase().match(/^([GH])0*(\d{1,4})/);
  if (!m) return null;
  const base = `${m[1]}${m[2].padStart(4, "0")}`;
  const variantes = index.filter((e) => e[0].startsWith(base));
  if (variantes.length > 1) {
    try {
      const conc = await charger(`/lexique/conc/${tranche(base)}.json`, cacheConc);
      const ici = variantes.find((e) => conc[e[0]]?.some((x) => x[0] === livre && x[1] === chapitre && x[2] === verset));
      if (ici) return ici[0];
    } catch {
      /* concordance indisponible : variante la plus courante */
    }
  }
  return entreeDuStrong(index, strong)?.[0] ?? null;
}
