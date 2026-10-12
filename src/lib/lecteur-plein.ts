"use client";

import { useSyncExternalStore } from "react";

/**
 * Lien entre le GRAND lecteur d'une page (Bible, jour de plan) et la barre de
 * lecture globale du bas : un seul lecteur à l'écran.
 *  - grand lecteur déplié → la barre du bas se cache ;
 *  - grand lecteur replié (flèche vers le bas) → la barre du bas prend le
 *    relais, avec une flèche vers le haut pour le redéplier.
 * La lecture « voix du téléphone » ne passe pas par le lecteur global : le
 * grand lecteur la publie ici pour que la barre puisse l'afficher aussi.
 */
export type VoixEnCours = { titre: string; enLecture: boolean; basculer: () => void; arreter: () => void };

type Etat = {
  present: boolean;
  ouvert: boolean;
  ouvrir: (() => void) | null;
  voix: VoixEnCours | null;
};

const INITIAL: Etat = { present: false, ouvert: false, ouvrir: null, voix: null };
let etat: Etat = INITIAL;
const abonnes = new Set<() => void>();

export function majLecteurPlein(maj: Partial<Etat>) {
  etat = { ...etat, ...maj };
  abonnes.forEach((f) => f());
}

export function useLecteurPlein(): Etat {
  return useSyncExternalStore(
    (cb) => {
      abonnes.add(cb);
      return () => abonnes.delete(cb);
    },
    () => etat,
    () => INITIAL,
  );
}
