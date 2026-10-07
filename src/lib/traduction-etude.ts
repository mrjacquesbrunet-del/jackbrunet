"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import { getLangue, type Langue } from "./i18n";

/**
 * Commentaires mot à mot et lexique hébreu/grec en anglais et en portugais :
 * traduits À LA DEMANDE par la fonction Supabase « traduire-etude »
 * (gpt-4o-mini), la première fois qu'on les ouvre, puis gardés en mémoire
 * pour tout le monde. En cas d'échec, le français reste affiché.
 */

type TypeEtude = "commentaire" | "lexique";
const memo = new Map<string, Promise<unknown | null>>();

export function traduireEtude<T>(type: TypeEtude, ref: string, l: Langue = getLangue()): Promise<T | null> {
  if (l === "fr") return Promise.resolve(null);
  const k = `${type}:${ref}:${l}`;
  let p = memo.get(k);
  if (!p) {
    const sb = getSupabase();
    p = !sb
      ? Promise.resolve(null)
      : Promise.race([
          sb.functions
            .invoke("traduire-etude", { body: { type, ref, langue: l } })
            .then(({ data, error }) => (error ? null : (data?.traduction ?? null)))
            .catch(() => null),
          // Jamais plus de 20 s d'attente : le français reste alors affiché.
          new Promise<null>((ok) => setTimeout(() => ok(null), 20000)),
        ]);
    p.then((v) => {
      if (v === null) memo.delete(k);
    });
    memo.set(k, p);
  }
  return p as Promise<T | null>;
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
    traduireEtude<T>("commentaire", cle).then((v) => {
      if (vivant && v) setTr({ cle, v });
    });
    return () => {
      vivant = false;
    };
  }, [cle, verset, fr]);
  return tr?.cle === cle ? tr.v : fr;
}
