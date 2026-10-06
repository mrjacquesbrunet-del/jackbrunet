"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { openExternal } from "@/lib/external";
import { dateZoom, derniereInvitationZoom, type InvitationZoom } from "@/lib/batisseurs";
import { IconeBatisseur } from "@/components/community/BatisseurBadge";

/**
 * Page ouverte par la notification « Invitation au Zoom des Bâtisseurs » :
 * la dernière invitation (date, petit mot, bouton Rejoindre). Réservée aux
 * Bâtisseurs (et à l'admin) par les règles Supabase.
 */
export function ZoomInvitationView() {
  const { ready, userId } = useAuth();
  const [inv, setInv] = useState<InvitationZoom | null | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      setInv(null);
      return;
    }
    derniereInvitationZoom().then(setInv);
  }, [ready, userId]);

  const passe = !!inv?.date_zoom && new Date(inv.date_zoom).getTime() < Date.now() - 3 * 3600_000;

  return (
    <section className="min-h-screen bg-[#0A0B07] px-4 pb-32 pt-[calc(2rem+env(safe-area-inset-top))] text-[#F3F3ED]">
      <div className="mx-auto max-w-md">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#CAF000] text-[#0A0B07]">
          <IconeBatisseur className="h-7 w-7" />
        </span>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#CAF000]">Espace Bâtisseurs</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight">Le Zoom avec Pasteur Jack</h1>

        {inv === undefined ? (
          <p className="mt-6 text-[#A5A5A1]">Chargement…</p>
        ) : inv === null ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[15px] leading-relaxed text-[#CFCFCB]">
              {userId
                ? "Cette invitation est réservée aux Bâtisseurs, celles et ceux qui soutiennent RHEMA."
                : "Connecte-toi avec ton compte pour voir ton invitation."}
            </p>
            <Link
              href={userId ? "/don" : "/profil"}
              className="mt-4 block rounded-2xl bg-[#CAF000] py-3 text-center font-display font-extrabold text-[#0A0B07]"
            >
              {userId ? "Devenir Bâtisseur" : "Me connecter"}
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-[#CAF000]/35 bg-white/[0.03] p-5">
            {inv.date_zoom ? (
              <p className="font-display text-xl font-extrabold">{dateZoom(inv.date_zoom)}</p>
            ) : null}
            {inv.message ? <p className="mt-2 text-[15px] leading-relaxed text-[#CFCFCB]">{inv.message}</p> : null}
            {passe ? (
              <p className="mt-4 text-sm text-[#A5A5A1]">
                Ce Zoom est passé. La prochaine invitation arrivera par notification et par e-mail.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => openExternal(inv.lien)}
                className="mt-5 w-full rounded-2xl bg-[#CAF000] py-3.5 font-display text-lg font-extrabold text-[#0A0B07]"
              >
                Rejoindre le Zoom
              </button>
            )}
            <p className="mt-4 text-xs text-[#A5A5A1]">Le lien t&apos;a aussi été envoyé par e-mail.</p>
          </div>
        )}
      </div>
    </section>
  );
}
