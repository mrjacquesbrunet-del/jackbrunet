"use client";

import { useEffect, useState } from "react";
import { getLangue, type Langue } from "./i18n";

/**
 * VERSIONS DE LA BIBLE — une par langue, toutes libres de droits :
 *   - Louis Segond 1910 (français, domaine public)       → public/bible/
 *   - Berean Standard Bible (anglais, domaine public)     → public/bible/bsb/
 *   - Bíblia Livre (portugais du Brésil, CC BY 4.0)       → public/bible/blivre/
 * Par défaut, la version de la langue de l'app ; chacun peut en choisir une
 * autre (réglages de lecture), mémorisée sur l'appareil.
 */

export type VersionBible = "lsg" | "bsb" | "blivre";

export const VERSIONS_BIBLE: {
  id: VersionBible;
  nom: string;
  abrev: string;
  langue: Langue;
  dossier: string;
  /** Voix de l'appareil pour la lecture à voix haute. */
  voix: string;
  /** Mention de la source (obligatoire pour la Bíblia Livre). */
  credit: string;
}[] = [
  {
    id: "lsg",
    nom: "Louis Segond 1910",
    abrev: "LSG",
    langue: "fr",
    dossier: "",
    voix: "fr-FR",
    credit: "Louis Segond 1910, domaine public.",
  },
  {
    id: "bsb",
    nom: "Berean Standard Bible",
    abrev: "BSB",
    langue: "en",
    dossier: "bsb",
    voix: "en-US",
    credit: "The Holy Bible, Berean Standard Bible, BSB, dedicated to the public domain.",
  },
  {
    id: "blivre",
    nom: "Bíblia Livre",
    abrev: "BLIVRE",
    langue: "pt",
    dossier: "blivre",
    voix: "pt-BR",
    credit:
      "Bíblia Livre (BLIVRE) © 2018 Diego Santos, Mario Sérgio e Marco Teles, licença Creative Commons Atribuição 4.0 Brasil (CC BY 4.0). Fonte : bibliaportugues.com / eBible.org.",
  },
];

const CLE = "jb.bible.version";
const EVT = "jb:bible-version";

export function versionParDefaut(l: Langue = getLangue()): VersionBible {
  return l === "en" ? "bsb" : l === "pt" ? "blivre" : "lsg";
}

export function getVersionBible(): VersionBible {
  if (typeof window === "undefined") return "lsg";
  try {
    const v = localStorage.getItem(CLE);
    if (v === "lsg" || v === "bsb" || v === "blivre") return v;
  } catch {
    /* stockage indisponible */
  }
  return versionParDefaut();
}

export function setVersionBible(v: VersionBible): void {
  try {
    localStorage.setItem(CLE, v);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: v }));
}

export function infoVersion(v: VersionBible) {
  return VERSIONS_BIBLE.find((x) => x.id === v) ?? VERSIONS_BIBLE[0];
}

/** Dossier des fichiers de la version : « /bible » ou « /bible/bsb ». */
export function baseBible(v: VersionBible = getVersionBible()): string {
  const d = infoVersion(v).dossier;
  return d ? `/bible/${d}` : "/bible";
}

/** Version courante, mise à jour quand on en change (« lsg » au premier rendu). */
export function useVersionBible(): VersionBible {
  const [v, setV] = useState<VersionBible>("lsg");
  useEffect(() => {
    setV(getVersionBible());
    const sur = (e: Event) => setV((e as CustomEvent<VersionBible>).detail);
    window.addEventListener(EVT, sur);
    return () => window.removeEventListener(EVT, sur);
  }, []);
  return v;
}
