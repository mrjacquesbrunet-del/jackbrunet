"use client";

import { useEffect, useState } from "react";
import { fichierBibleTraduit } from "./contenu-i18n";

/**
 * Graphe généalogique de la Bible (public/bible/genealogie.json, construit par
 * scripts/build-genealogie.mjs). Chargé à la demande, une seule fois.
 */

export type Personne = {
  /** Nom affiché */
  n: string;
  s?: "h" | "f";
  /** Fiche liée (portrait, histoire) */
  f?: string;
  /** Parents (père d'abord), enfants (ordre de naissance), conjoints */
  p?: string[];
  e?: string[];
  c?: string[];
  /** Référence biblique du lien avec ses parents, et note éventuelle */
  r?: string;
  o?: string;
};
export type ArbreDef = { id: string; type?: undefined; titre: string; ref: string; desc: string; note?: string; racine: string; noeuds: string[] };
export type LigneeItem = { n: string; id?: string; avec?: string; avecId?: string };
export type LigneeDef = {
  id: string;
  type: "lignee";
  titre: string;
  ref: string;
  desc: string;
  note?: string;
  sections: { titre: string; noms: LigneeItem[] }[];
};
export type Genealogie = {
  personnes: Record<string, Personne>;
  /** Fiche → personne à centrer */
  fiches: Record<string, string>;
  /** Liens « parent>enfant » adoptifs (trait pointillé) */
  adoptifs: string[];
  arbres: (ArbreDef | LigneeDef)[];
};

let promesse: Promise<Genealogie | null> | null = null;
export function getGenealogie(): Promise<Genealogie | null> {
  if (!promesse) {
    promesse = fichierBibleTraduit("genealogie")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => {
        promesse = null;
        return null;
      });
  }
  return promesse;
}

/** La personne de l'arbre qui correspond à une fiche (ou null). */
export function useArbreDeFiche(ficheId: string | null): string | null {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    let actif = true;
    if (!ficheId) {
      setId(null);
      return;
    }
    getGenealogie().then((g) => actif && setId(g?.fiches[ficheId] ?? null));
    return () => {
      actif = false;
    };
  }, [ficheId]);
  return id;
}
