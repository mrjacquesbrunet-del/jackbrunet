"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/community/useAuth";
import { soutienDispo } from "@/lib/soutien";
import { IconeBatisseur } from "@/components/community/BatisseurBadge";

/** Pages d'entrée des onglets où le bandeau apparaît (en bas du contenu). */
const ONGLETS = ["/devotionnel", "/communaute", "/plans", "/bible", "/profil", "/ecole", "/jeux", "/ecouter", "/a-propos"];
const CLE_PLUS_TARD = "jb.batisseurs.plustard";
const PAUSE_MS = 3 * 24 * 3600_000;

/**
 * Bandeau « Deviens Bâtisseur » en bas de chaque onglet : rappelle que
 * l'app a un coût, et présente les avantages du soutien (badge exclusif,
 * Zoom mensuel avec Pasteur Jack). Uniquement dans l'app qui sait payer en
 * un clic, jamais pour un Bâtisseur, et « Plus tard » le masque 3 jours.
 */
export function BandeauBatisseurs() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [cible, setCible] = useState<HTMLElement | null>(null);
  const [masque, setMasque] = useState(true);

  const chemin = (pathname || "/").replace(/\/+$/, "") || "/";
  const surOnglet = ONGLETS.includes(chemin);
  const batisseur = !!(profile as { batisseur_depuis?: string | null } | null)?.batisseur_depuis;

  useEffect(() => {
    let pause = false;
    try {
      pause = Date.now() - Number(localStorage.getItem(CLE_PLUS_TARD) || 0) < PAUSE_MS;
    } catch {
      /* stockage indisponible */
    }
    setMasque(pause || !soutienDispo());
    setCible(document.querySelector("main"));
  }, [chemin]);

  if (masque || !surOnglet || batisseur || !cible) return null;

  function plusTard() {
    try {
      localStorage.setItem(CLE_PLUS_TARD, String(Date.now()));
    } catch {
      /* ignore */
    }
    setMasque(true);
  }

  return createPortal(
    <aside className="mx-auto mt-8 max-w-lg px-4 pb-2">
      <div className="rounded-3xl border border-[#CAF000]/35 bg-[#0A0B07] p-5 text-[#F3F3ED] shadow-lg">
        <div className="flex items-start gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#CAF000] text-[#0A0B07]">
            <IconeBatisseur className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-extrabold leading-tight">Deviens Bâtisseur de RHEMA</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#CFCFCB]">
              RHEMA est gratuite, mais elle a un coût : serveurs, voix audio, développement. En la soutenant,
              tu reçois le <b className="text-[#CAF000]">badge Bâtisseur</b> et tu rejoins chaque mois le{" "}
              <b className="text-[#CAF000]">Zoom avec Pasteur Jack</b>.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/don"
            className="flex-1 rounded-2xl bg-[#CAF000] py-3 text-center font-display text-[15px] font-extrabold text-[#0A0B07]"
          >
            Je deviens Bâtisseur
          </Link>
          <button type="button" onClick={plusTard} className="px-2 text-sm font-semibold text-[#A5A5A1]">
            Plus tard
          </button>
        </div>
      </div>
    </aside>,
    cible,
  );
}
