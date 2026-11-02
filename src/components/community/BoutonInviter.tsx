"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/community/useAuth";
import { inviterDesAmis, memoriserParrain, validerInvitationEnAttente } from "@/lib/invitation";

/** « Inviter mes amis » : partage mon lien d'invitation personnel. */
export function BoutonInviter({ sombre = true, className = "" }: { sombre?: boolean; className?: string }) {
  const { userId, profile } = useAuth();
  const [copie, setCopie] = useState(false);
  if (!userId) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        const partage = await inviterDesAmis(userId, profile?.pseudo);
        if (!partage) {
          setCopie(true);
          setTimeout(() => setCopie(false), 2500);
        }
      }}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors active:scale-[0.99] ${
        sombre ? "border-dawn-400/30 bg-dawn-400/[0.08] text-cream" : "border-night-900/10 bg-white text-night-900"
      } ${className}`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${sombre ? "bg-dawn-400 text-night-950" : "bg-night-900 text-dawn-400"}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
          <circle cx="9.5" cy="8" r="3.5" />
          <path d="M3 19.5a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold">{copie ? "Lien copié !" : "Inviter mes amis"}</span>
        <span className={`block text-[12.5px] ${sombre ? "text-cream/55" : "text-night-900/55"}`}>
          Vous serez amis directement sur RHEMA.
        </span>
      </span>
    </button>
  );
}

/** Monté une fois dans l'app : retient le parrain d'un lien d'invitation,
 * puis valide l'invitation dès que le compte est connecté. */
export function SuiviInvitation() {
  const { userId } = useAuth();
  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get("invite");
      if (id && /^[0-9a-f-]{36}$/i.test(id)) memoriserParrain(id);
    } catch {
      /* URL illisible */
    }
  }, []);
  useEffect(() => {
    if (userId) void validerInvitationEnAttente(userId);
  }, [userId]);
  return null;
}
