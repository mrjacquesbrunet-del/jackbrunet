"use client";

import { useSyncExternalStore } from "react";

/**
 * État partagé de la partie Podcasts :
 *  - les favoris (même cœur dans la liste et dans le lecteur plein écran) ;
 *  - « Mes listes » (listes de lecture personnelles, sur l'appareil) ;
 *  - l'ouverture du lecteur plein écran (la barre du bas se cache quand il
 *    est ouvert, et sa flèche le rouvre) et de la feuille « Ajouter à une liste ».
 */

const FAV_KEY = "jb.podcast.favs.v1";
const LISTES_KEY = "jb.podcast.listes.v1";

export type ListePodcast = { id: string; nom: string; ids: string[] };
/** Épisode pour lequel la feuille « Ajouter à une liste » est ouverte. */
export type ChoixListe = { id: string; titre: string } | null;

type Etat = { favoris: Set<string>; pleinEcran: boolean; listes: ListePodcast[]; choixListe: ChoixListe };
const INITIAL: Etat = { favoris: new Set(), pleinEcran: false, listes: [], choixListe: null };
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
    etat = {
      ...etat,
      favoris: new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[]),
      listes: JSON.parse(localStorage.getItem(LISTES_KEY) || "[]") as ListePodcast[],
    };
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

/* ————— Mes listes ————— */

function ecrireListes(listes: ListePodcast[]) {
  try {
    localStorage.setItem(LISTES_KEY, JSON.stringify(listes));
  } catch {
    /* ignore */
  }
  emettre({ listes });
}

/** Crée une liste (avec un premier épisode facultatif) ; renvoie son id. */
export function creerListe(nom: string, premierEpisode?: string): string {
  chargerFavoris();
  const id = `l${Date.now().toString(36)}`;
  ecrireListes([...etat.listes, { id, nom: nom.trim() || "Ma liste", ids: premierEpisode ? [premierEpisode] : [] }]);
  return id;
}

/** Ajoute l'épisode à la liste, ou l'en retire s'il y est déjà. */
export function basculerDansListe(listeId: string, episodeId: string) {
  chargerFavoris();
  ecrireListes(
    etat.listes.map((l) =>
      l.id !== listeId ? l : { ...l, ids: l.ids.includes(episodeId) ? l.ids.filter((x) => x !== episodeId) : [...l.ids, episodeId] },
    ),
  );
}

export function renommerListe(listeId: string, nom: string) {
  chargerFavoris();
  ecrireListes(etat.listes.map((l) => (l.id === listeId ? { ...l, nom: nom.trim() || l.nom } : l)));
}

export function supprimerListe(listeId: string) {
  chargerFavoris();
  ecrireListes(etat.listes.filter((l) => l.id !== listeId));
}

export function ouvrirChoixListe(choix: ChoixListe) {
  emettre({ choixListe: choix });
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
