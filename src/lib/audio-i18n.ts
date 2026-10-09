"use client";

import { useEffect, useState } from "react";
import { intlUrl } from "./asset";
import { getLangue, type Langue } from "./i18n";

/**
 * AUDIOS TRADUITS (anglais, portugais) des méditations, plans, formation et
 * études : public/audio/<langue>/<nom>.mp3, importés par le workflow
 * « Importer des audios » qui tient à jour public/audio/<langue>/index.json,
 * et servis par le site international (voir intlUrl).
 *
 * Noms des fichiers (identiques en en/ et pt/) :
 *   devotion-<i>.mp3                 méditation n° i (même numéro qu'en français)
 *   plan-<slug>-<jour>.mp3           jour d'un plan thématique
 *   formation-<leçon>-<partie>.mp3   partie (1, 2, …) d'une leçon de la formation
 *   etude-<étude>-<partie>.mp3       partie (1, 2, …) d'une étude biblique
 * Tant qu'un fichier manque, le lecteur reste caché dans cette langue.
 */

/** Deuxième site d'audios traduits (plans approfondis), publié à part car le
 * site international approche lui aussi la limite de 1 Go de GitHub Pages.
 * Tant qu'il n'existe pas, sa liste est simplement vide. */
const AUDIOS2_BASE = "https://mrjacquesbrunet-del.github.io/rhema-audios";

/** Nom du fichier → adresse, fusion des listes des deux sites. */
const listes = new Map<Langue, Promise<Map<string, string>>>();

const lireListe = (url: string): Promise<string[]> =>
  fetch(url)
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);

function liste(l: Langue): Promise<Map<string, string>> {
  if (!listes.has(l)) {
    listes.set(
      l,
      Promise.all([lireListe(intlUrl(`/audio/${l}/index.json`)), lireListe(`${AUDIOS2_BASE}/audio/${l}/index.json`)]).then(
        ([intl, deux]) => {
          const m = new Map<string, string>();
          for (const n of deux) m.set(n, `${AUDIOS2_BASE}/audio/${l}/${n}`);
          for (const n of intl) m.set(n, intlUrl(`/audio/${l}/${n}`));
          return m;
        },
      ),
    );
  }
  return listes.get(l)!;
}

/** Adresse de l'audio traduit (ou null s'il n'existe pas encore). */
export async function audioTraduit(nom: string, l: Langue = getLangue()): Promise<string | null> {
  if (l === "fr") return null;
  return (await liste(l)).get(nom) ?? null;
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
