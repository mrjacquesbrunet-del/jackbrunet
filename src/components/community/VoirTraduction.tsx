"use client";

import { useEffect, useMemo, useState } from "react";
import { useLangue } from "@/lib/i18n";
import { devinerLangue, estConnecte, traduireTexteMembre } from "@/lib/traduction-membres";

/**
 * « Voir la traduction », comme sur les réseaux sociaux : sous un texte écrit
 * par un membre dans une autre langue que celle de l'app, un clic affiche sa
 * traduction, un second clic remet l'original.
 *
 * Utilisation : const tr = useVoirTraduction(texte);
 *   afficher tr.texte à la place du texte, et tr.bouton juste en dessous.
 */
/** Traductions déjà affichées : survivent au rechargement d'une carte. */
const affichees = new Map<string, string>();

export function useVoirTraduction(texte: string | null | undefined, tone: "light" | "dark" = "light") {
  const langue = useLangue();
  const source = useMemo(() => (texte ? devinerLangue(texte) : null), [texte]);
  const [connecte, setConnecte] = useState(false);
  const cle = `${langue}|${texte ?? ""}`;
  const [traduction, setTraduction] = useState<string | null>(() => affichees.get(cle) ?? null);
  const [voir, setVoir] = useState(() => affichees.has(cle));
  const [charge, setCharge] = useState(false);
  const [echec, setEchec] = useState(false);

  useEffect(() => {
    estConnecte().then(setConnecte);
  }, []);

  const possible = !!texte && texte.trim().length > 2 && !!source && source !== langue && connecte;

  async function basculer() {
    if (voir) {
      affichees.delete(cle);
      return setVoir(false);
    }
    if (traduction) {
      affichees.set(cle, traduction);
      return setVoir(true);
    }
    setCharge(true);
    setEchec(false);
    const r = await traduireTexteMembre(texte!, langue);
    setCharge(false);
    if (r) {
      affichees.set(cle, r);
      setTraduction(r);
      setVoir(true);
    } else setEchec(true);
  }

  const couleur = tone === "dark" ? "text-cream/55 hover:text-cream" : "text-night-900/45 hover:text-night-900/80";
  const bouton = possible ? (
    <button type="button" onClick={basculer} disabled={charge} className={`mt-1 block text-xs font-semibold ${couleur}`}>
      {charge ? "Traduction…" : voir ? "Voir l'original" : echec ? "Traduction indisponible, réessayer" : "Voir la traduction"}
    </button>
  ) : null;

  return { texte: voir && traduction ? traduction : (texte ?? ""), traduit: voir && !!traduction, bouton };
}

/** Un texte de membre + son bouton « Voir la traduction ». */
export function TexteMembre({
  texte,
  rendu,
  tone = "light",
}: {
  texte: string;
  rendu: (t: string) => React.ReactNode;
  tone?: "light" | "dark";
}) {
  const tr = useVoirTraduction(texte, tone);
  return (
    <>
      {rendu(tr.texte)}
      {tr.bouton}
    </>
  );
}
