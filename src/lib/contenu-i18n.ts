"use client";

import { useLayoutEffect, useState } from "react";
import { getLangue, type Langue } from "./i18n";

/**
 * MULTILINGUE — contenus traduits (méditations, formation, études).
 *
 * Les contenus restent écrits en français dans content/*.json. Leur
 * traduction (scripts/i18n/traduire-contenu.mjs) est une copie de même
 * structure, publiée dans public/i18n/contenu/<langue>/<fichier>.json et
 * chargée à la demande. Tant qu'elle n'est pas là, le français s'affiche.
 */

export type FichierContenu =
  | "devotions"
  | "formations"
  | "etudes"
  | "reading-plan"
  | "plans"
  | "quiz"
  | "vraifaux"
  | "whoami"
  | "chronologie-biblique"
  | "chrono"
  | "verses"
  | "moods"
  | "prayer-focus"
  | "questions-faq";
export const FICHIERS_CONTENU: FichierContenu[] = [
  "devotions",
  "formations",
  "etudes",
  "reading-plan",
  "plans",
  "quiz",
  "vraifaux",
  "whoami",
  "chronologie-biblique",
  "chrono",
  "verses",
  "moods",
  "prayer-focus",
  "questions-faq",
];

/**
 * Données françaises importées par un module (quiz, jeux…) : à l'arrivée de
 * la traduction, leurs textes sont remplacés SUR PLACE (mêmes objets), ce
 * qui traduit aussi les constantes du module qui pointent dessus. `apres`
 * recalcule ce qui en a été copié.
 */
const enregistres = new Map<FichierContenu, { data: unknown; apres?: () => void }>();
export function enregistrerContenu(f: FichierContenu, data: unknown, apres?: () => void): void {
  enregistres.set(f, { data, apres });
  if (typeof window === "undefined") return;
  const l = getLangue();
  const deja = l === "fr" ? undefined : charges.get(cle(l, f));
  if (deja) appliquer(f, deja);
}
const appliques = new Set<FichierContenu>();
function remplacer(fr: unknown, tr: unknown): void {
  if (Array.isArray(fr) && Array.isArray(tr)) {
    fr.forEach((v, i) => {
      if (typeof v === "string" && typeof tr[i] === "string") fr[i] = tr[i];
      else remplacer(v, tr[i]);
    });
  } else if (fr && typeof fr === "object" && tr && typeof tr === "object") {
    const o = fr as Record<string, unknown>;
    const t = tr as Record<string, unknown>;
    for (const k of Object.keys(o)) {
      if (typeof o[k] === "string" && typeof t[k] === "string") o[k] = t[k];
      else remplacer(o[k], t[k]);
    }
  }
}
function appliquer(f: FichierContenu, tr: unknown): void {
  const e = enregistres.get(f);
  if (!e || appliques.has(f) || !tr) return;
  appliques.add(f);
  remplacer(e.data, tr);
  e.apres?.();
}

const charges = new Map<string, unknown>();
const enCours = new Map<string, Promise<unknown>>();

const cle = (l: Langue, f: FichierContenu) => `${l}/${f}`;

/** Charge la traduction d'un fichier (une fois) ; null si absente. */
export function chargerContenu(l: Langue, f: FichierContenu): Promise<unknown> {
  if (l === "fr") return Promise.resolve(null);
  const k = cle(l, f);
  if (charges.has(k)) return Promise.resolve(charges.get(k));
  let p = enCours.get(k);
  if (!p) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    p = fetch(`${base}/i18n/contenu/${k}.json`, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((j) => {
        charges.set(k, j);
        if (j) appliquer(f, j);
        return j;
      });
    enCours.set(k, p);
  }
  return p;
}

/** Précharge tous les contenus de la langue (au démarrage de l'app). */
export function prechargerContenus(l: Langue): Promise<unknown> {
  return Promise.all(FICHIERS_CONTENU.map((f) => chargerContenu(l, f)));
}

/** Traduction déjà chargée (sinon undefined), dans la langue de l'app. */
export function contenuCharge<T>(f: FichierContenu): T | undefined {
  if (typeof window === "undefined") return undefined;
  const l = getLangue();
  if (l === "fr") return undefined;
  return (charges.get(cle(l, f)) ?? undefined) as T | undefined;
}

/**
 * Pour un composant : la traduction du fichier (ou null en français, ou tant
 * qu'elle n'est pas chargée). Le composant se réaffiche quand elle arrive.
 */
export function useContenu<T>(f: FichierContenu): T | null {
  const [v, setV] = useState<T | null>(null);
  useLayoutEffect(() => {
    const l = getLangue();
    if (l === "fr") return;
    const deja = contenuCharge<T>(f);
    if (deja) {
      setV(deja);
      return;
    }
    let vivant = true;
    chargerContenu(l, f).then((j) => {
      if (vivant && j) setV(j as T);
    });
    return () => {
      vivant = false;
    };
  }, [f]);
  return v;
}

/**
 * Prêt à afficher dans la langue de l'app ? Renvoie une clé à poser sur le
 * contenu : elle change quand les traductions arrivent, ce qui réaffiche
 * l'écran avec les textes traduits (les getters lisent contenuCharge).
 */
export function useContenusPrets(fichiers: FichierContenu[]): { pret: boolean; cle: string } {
  const [etat, setEtat] = useState<{ pret: boolean; cle: string }>({ pret: true, cle: "fr" });
  const liste = fichiers.join(",");
  useLayoutEffect(() => {
    const l = getLangue();
    if (l === "fr") return;
    const fs = liste.split(",") as FichierContenu[];
    if (fs.every((f) => charges.has(cle(l, f)))) {
      setEtat({ pret: true, cle: l });
      return;
    }
    let vivant = true;
    setEtat({ pret: false, cle: "attente" });
    Promise.all(fs.map((f) => chargerContenu(l, f))).then(() => {
      if (vivant) setEtat({ pret: true, cle: l });
    });
    return () => {
      vivant = false;
    };
  }, [liste]);
  return etat;
}

/**
 * Adresse d'un fichier d'étude de la Bible (fiches, introductions, généalogie)
 * dans la langue de l'app : sa traduction, sinon le français.
 */
export async function fichierBibleTraduit(nom: "fiches" | "introductions" | "genealogie" | "paralleles"): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const l = getLangue();
  if (l !== "fr") {
    try {
      const r = await fetch(`${base}/i18n/contenu/${l}/bible/${nom}.json`, { cache: "force-cache" });
      if (r.ok) return r;
    } catch {
      /* repli sur le français */
    }
  }
  return fetch(`${base}/bible/${nom}.json`);
}
