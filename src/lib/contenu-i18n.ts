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

export type FichierContenu = "devotions" | "formations" | "etudes" | "reading-plan";
export const FICHIERS_CONTENU: FichierContenu[] = ["devotions", "formations", "etudes", "reading-plan"];

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
