"use client";

import { useEffect, useState } from "react";
import { openExternal } from "@/lib/external";
import { dateZoom, getZoomBatisseurs, type ZoomBatisseurs as Zoom } from "@/lib/batisseurs";
import { IconeBatisseur } from "@/components/community/BatisseurBadge";

/**
 * Carte « Zoom des Bâtisseurs » (profil) : visible par les Bâtisseurs.
 * Date et lien réglés par l'admin (Espace admin → Bâtisseurs).
 */
export function ZoomBatisseursCard() {
  const [zoom, setZoom] = useState<Zoom | null>(null);

  useEffect(() => {
    getZoomBatisseurs().then(setZoom);
  }, []);

  const date = dateZoom(zoom?.prochaine_date);
  const aVenir = !!zoom?.prochaine_date && new Date(zoom.prochaine_date).getTime() > Date.now() - 3 * 3600_000;

  return (
    <div className="mt-4 rounded-3xl border border-[#CAF000]/40 bg-[#0A0B07] p-5 text-[#F3F3ED]">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#CAF000] text-[#0A0B07]">
          <IconeBatisseur className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#CAF000]">Espace Bâtisseurs</p>
          <p className="font-display text-lg font-extrabold leading-tight">Le Zoom avec Pasteur Jack</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#CFCFCB]">
        {aVenir
          ? `Prochain rendez-vous : ${date}.`
          : "Une fois par mois, Pasteur Jack retrouve les Bâtisseurs en direct. La date du prochain Zoom arrive bientôt ici."}
        {zoom?.message ? ` ${zoom.message}` : ""}
      </p>
      {aVenir && zoom?.lien ? (
        <button
          type="button"
          onClick={() => openExternal(zoom.lien!)}
          className="mt-4 w-full rounded-2xl bg-[#CAF000] py-3 font-display text-base font-extrabold text-[#0A0B07]"
        >
          Rejoindre le Zoom
        </button>
      ) : null}
    </div>
  );
}
