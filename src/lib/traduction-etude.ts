"use client";

import { useEffect, useState } from "react";
import { intlUrl } from "./asset";
import { getLangue, type Langue } from "./i18n";

/**
 * Commentaires mot à mot et lexique hébreu/grec en anglais et en portugais :
 * traduits D'AVANCE (scripts/i18n/traduire-etudes-openai.mjs, i18n/etude/)
 * et servis par le site international, avec la même structure que le
 * français :
 *   /etude/<langue>/commentary/<livre>/<chapitre>.json
 *   /etude/<langue>/lexique/<tranche>.json
 * Si un fichier manque, le français reste affiché.
 */

const fichiers = new Map<string, Promise<Record<string, unknown> | null>>();

function fichier(chemin: string): Promise<Record<string, unknown> | null> {
  let p = fichiers.get(chemin);
  if (!p) {
    p = fetch(intlUrl(chemin))
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    fichiers.set(chemin, p);
  }
  return p;
}

/** Commentaire traduit d'un verset (null en français ou s'il manque). */
export async function commentaireTraduit<T>(livre: number, chapitre: number, verset: number, l: Langue = getLangue()): Promise<T | null> {
  if (l === "fr") return null;
  const t = await fichier(`/etude/${l}/commentary/${livre}/${chapitre}.json`);
  return ((t?.[String(verset)] as T | undefined) ?? null);
}

/** Fiche du lexique traduite (null en français ou si elle manque). */
export async function motTraduit<T>(code: string, l: Langue = getLangue()): Promise<T | null> {
  if (l === "fr") return null;
  const t = await fichier(`/etude/${l}/lexique/${code.slice(0, 3)}.json`);
  return ((t?.[code] as T | undefined) ?? null);
}

/**
 * Pour un composant : le commentaire du verset dans la langue de l'app.
 * Renvoie le français tant que la traduction n'est pas arrivée.
 */
export function useCommentaireTraduit<T>(livre: number, chapitre: number, verset: number | null, fr: T | undefined): T | undefined {
  const [tr, setTr] = useState<{ cle: string; v: T } | null>(null);
  const cle = `${livre}/${chapitre}/${verset}`;
  useEffect(() => {
    if (verset === null || !fr || getLangue() === "fr") return;
    let vivant = true;
    commentaireTraduit<T>(livre, chapitre, verset).then((v) => {
      if (vivant && v) setTr({ cle, v });
    });
    return () => {
      vivant = false;
    };
  }, [cle, livre, chapitre, verset, fr]);
  return tr?.cle === cle ? tr.v : fr;
}
