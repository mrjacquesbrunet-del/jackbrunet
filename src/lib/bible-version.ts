"use client";

import { useEffect, useState } from "react";
import { getLangue, type Langue } from "./i18n";

/**
 * VERSIONS DE LA BIBLE — une par langue, toutes libres de droits :
 *   - Louis Segond 1910 (français, domaine public)       → public/bible/
 *   - World English Bible (anglais, domaine public)       → public/bible/web/
 *   - King James Version (anglais, domaine public)        → public/bible/kjv/
 *   - Bíblia Livre (portugais du Brésil, CC BY 4.0)       → public/bible/blivre/
 * Par défaut, la version de la langue de l'app ; chacun peut en choisir une
 * autre (réglages de lecture), mémorisée sur l'appareil.
 */

export type VersionBible = "lsg" | "web" | "kjv" | "blivre";

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
    id: "web",
    nom: "World English Bible",
    abrev: "WEB",
    langue: "en",
    dossier: "web",
    voix: "en-US",
    credit: "World English Bible (WEB), public domain.",
  },
  {
    id: "kjv",
    nom: "King James Version",
    abrev: "KJV",
    langue: "en",
    dossier: "kjv",
    voix: "en-US",
    credit: "King James Version (KJV, 1769), public domain.",
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
  return l === "en" ? "web" : l === "pt" ? "blivre" : "lsg";
}

export function getVersionBible(): VersionBible {
  if (typeof window === "undefined") return "lsg";
  try {
    const v = localStorage.getItem(CLE);
    if (v === "lsg" || v === "web" || v === "kjv" || v === "blivre") return v;
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

/** Dossier des fichiers de la version : « /bible » ou « /bible/web ». */
export function baseBible(v: VersionBible = getVersionBible()): string {
  const d = infoVersion(v).dossier;
  return d ? `/bible/${d}` : "/bible";
}

/** Version courante, mise à jour quand on en change. */
export function useVersionBible(): VersionBible {
  const [v, setV] = useState<VersionBible>(getVersionBible);
  useEffect(() => {
    setV(getVersionBible());
    const sur = (e: Event) => setV((e as CustomEvent<VersionBible>).detail);
    window.addEventListener(EVT, sur);
    return () => window.removeEventListener(EVT, sur);
  }, []);
  return v;
}
