"use client";

import { Fragment, type ReactNode } from "react";
import { useContenusPrets, type FichierContenu } from "@/lib/contenu-i18n";

/**
 * Affiche un écran de contenu (formation, études…) dans la langue de l'app :
 * attend la traduction des fichiers nécessaires (un instant, la première
 * fois), puis réaffiche l'écran avec les textes traduits.
 */
export function AvecContenus({ fichiers, children }: { fichiers: FichierContenu[]; children: ReactNode }) {
  const { pret, cle } = useContenusPrets(fichiers);
  if (!pret) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-night-900/15 border-t-spirit-600" />
      </div>
    );
  }
  return <Fragment key={cle}>{children}</Fragment>;
}
