"use client";

import { useSyncExternalStore } from "react";

/**
 * État partagé de la partie Podcasts :
 *  - les favoris (même cœur dans la liste et dans le lecteur plein écran) ;
 *  - l'ouverture du lecteur plein écran (la barre du bas se cache quand il
 *    est ouvert, et sa flèche le rouvre).
 */

const FAV_KEY = "jb.podcast.favs.v1";

type Etat = { favoris: Set<string>; pleinEcran: boolean };
const INITIAL: Etat = { favoris: new Set(), pleinEcran: false };
let etat: Etat = INITIAL;
let charge = false;
const abonnes = new Set<() => void>();

function emettre(maj: Partial<Etat>) {
  etat = { ...etat, ...maj };
  abonnes.forEach((f) => f());
}

function chargerFavoris() {
  if (charge || typeof window === "undefined") return;
  charge = true;
  try {
    etat = { ...etat, favoris: new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[]) };
  } catch {
    /* stockage indisponible */
  }
}

export function basculerFavori(id: string) {
  chargerFavoris();
  const f = new Set(etat.favoris);
  if (f.has(id)) f.delete(id);
  else f.add(id);
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(f)));
  } catch {
    /* ignore */
  }
  emettre({ favoris: f });
}

export function ouvrirLecteurPodcast() {
  emettre({ pleinEcran: true });
}
export function fermerLecteurPodcast() {
  emettre({ pleinEcran: false });
}

export function usePodcastEtat(): Etat {
  return useSyncExternalStore(
    (cb) => {
      chargerFavoris();
      abonnes.add(cb);
      return () => abonnes.delete(cb);
    },
    () => {
      chargerFavoris();
      return etat;
    },
    () => INITIAL,
  );
}
