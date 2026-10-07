"use client";

import { useEffect, useState } from "react";
import { mediaUrl } from "./asset";
import { getLangue, type Langue } from "./i18n";

/**
 * AUDIOS TRADUITS (anglais, portugais) des méditations, plans, formation et
 * études : public/audio/<langue>/<nom>.mp3, importés par le workflow
 * « Importer des audios » qui tient à jour public/audio/<langue>/index.json.
 *
 * Noms des fichiers (identiques en en/ et pt/) :
 *   devotion-<i>.mp3                 méditation n° i (même numéro qu'en français)
 *   plan-<slug>-<jour>.mp3           jour d'un plan thématique
 *   formation-<leçon>-<partie>.mp3   partie (1, 2, …) d'une leçon de la formation
 *   etude-<étude>-<partie>.mp3       partie (1, 2, …) d'une étude biblique
 * Tant qu'un fichier manque, le lecteur reste caché dans cette langue.
 */

const listes = new Map<Langue, Promise<Set<string>>>();

function liste(l: Langue): Promise<Set<string>> {
  if (!listes.has(l)) {
    listes.set(
      l,
      fetch(mediaUrl(`/audio/${l}/index.json`))
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => [])
        .then((noms: string[]) => new Set(noms)),
    );
  }
  return listes.get(l)!;
}

/** Adresse de l'audio traduit (ou null s'il n'existe pas encore). */
export async function audioTraduit(nom: string, l: Langue = getLangue()): Promise<string | null> {
  if (l === "fr") return null;
  return (await liste(l)).has(nom) ? mediaUrl(`/audio/${l}/${nom}`) : null;
}

/** Pour un composant : adresses des audios traduits demandés (null si absents ou en français). */
export function useAudiosTraduits(noms: string[]): (string | null)[] | null {
  const [v, setV] = useState<(string | null)[] | null>(null);
  const cle = noms.join("|");
  useEffect(() => {
    const l = getLangue();
    if (l === "fr") return;
    let vivant = true;
    Promise.all(cle.split("|").map((n) => (n ? audioTraduit(n, l) : Promise.resolve(null)))).then((r) => {
      if (vivant) setV(r);
    });
    return () => {
      vivant = false;
    };
  }, [cle]);
  return v;
}
