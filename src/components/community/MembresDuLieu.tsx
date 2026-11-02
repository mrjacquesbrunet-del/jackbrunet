"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { BoutonInviter } from "@/components/community/BoutonInviter";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { follow, unfollow, listFollowingIds, type Profile } from "@/lib/community";
import { membresDuLieu, type TypeLieu } from "@/lib/lieux";

/** Icônes en trait : église, épingle de lieu. */
export const ICONE_EGLISE = (
  <path d="M12 3v4M10 5h4M12 7l5 4v9h-4v-4a1 1 0 0 0-2 0v4H7v-9l5-4zM4 20h16" strokeLinecap="round" strokeLinejoin="round" />
);
export const ICONE_LIEU = (
  <>
    <path d="M12 21s-6.5-5.2-6.5-10a6.5 6.5 0 0 1 13 0c0 4.8-6.5 10-6.5 10z" strokeLinejoin="round" />
    <circle cx="12" cy="11" r="2.3" />
  </>
);

/**
 * Plein écran : tous les membres d'une église ou d'une ville, pour s'abonner
 * d'un toucher, ouvrir leur profil ou leur écrire. Ouvert depuis la pastille
 * « église » ou « ville » d'un profil.
 */
export function MembresDuLieu({
  lieu,
  fermer,
}: {
  lieu: { type: TypeLieu; valeur: string } | null;
  fermer: () => void;
}) {
  const { userId } = useAuth();
  const [membres, setMembres] = useState<Profile[] | null | undefined>(undefined);
  const [suivis, setSuivis] = useState<Set<string>>(new Set());
  const [filtre, setFiltre] = useState("");

  useEffect(() => {
    if (!lieu) return;
    setMembres(undefined);
    setFiltre("");
    membresDuLieu(lieu.type, lieu.valeur).then(setMembres);
    if (userId) listFollowingIds(userId).then((ids) => setSuivis(new Set(ids)));
  }, [lieu, userId]);

  async function basculer(id: string) {
    if (!userId) return;
    const suit = suivis.has(id);
    setSuivis((s) => {
      const n = new Set(s);
      if (suit) n.delete(id);
      else n.add(id);
      return n;
    });
    if (suit) await unfollow(id, userId);
    else await follow(id, userId);
  }

  const autres = (membres ?? []).filter((p) => p.id !== userId);
  const f = filtre.trim().toLowerCase();
  const affiches = (membres ?? []).filter((p) => !f || p.pseudo?.toLowerCase().includes(f));
  const eglise = lieu?.type === "eglise";

  return (
    <AnimatePresence>
      {lieu ? (
        <motion.div
          className="keep-dark fixed inset-0 z-[130] flex flex-col bg-night-950 text-left text-cream"
          role="dialog"
          aria-modal="true"
          aria-label={eglise ? "Membres de l'église" : "Membres de la ville"}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 border-b border-white/[0.08] px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <button type="button" onClick={fermer} aria-label="Fermer" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-cream/80">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-dawn-400/15 text-dawn-300">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                {eglise ? ICONE_EGLISE : ICONE_LIEU}
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[17px] font-bold leading-tight">{lieu.valeur}</p>
              <p className="text-xs text-cream/50">
                {membres === undefined
                  ? "Chargement…"
                  : membres === null
                    ? eglise
                      ? "Église"
                      : "Ville"
                    : `${membres.length} membre${membres.length > 1 ? "s" : ""} sur RHEMA`}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3">
            {membres === null ? (
              <p className="px-1 py-6 text-sm text-cream/55">Cette liste sera disponible très bientôt.</p>
            ) : membres === undefined ? null : !autres.length ? (
              <div className="px-1 py-6 text-center">
                <p className="font-semibold text-cream/85">
                  {eglise ? "Tu es le premier membre de cette église sur RHEMA." : "Personne d'autre n'a encore indiqué cette ville."}
                </p>
                <p className="mt-1 text-sm text-cream/55">Invite tes amis à rejoindre l&apos;app pour vous retrouver ici.</p>
                <BoutonInviter className="mt-4" />
              </div>
            ) : (
              <>
                {membres.length > 12 ? (
                  <input
                    type="search"
                    value={filtre}
                    onChange={(e) => setFiltre(e.target.value)}
                    placeholder="Chercher dans la liste…"
                    className="mb-2 w-full rounded-2xl bg-white/[0.08] px-4 py-2.5 text-[15px] text-cream outline-none placeholder:text-cream/40"
                  />
                ) : null}
                <ul className="divide-y divide-white/[0.06]">
                  {affiches.map((p) => {
                    const moi = p.id === userId;
                    const suit = suivis.has(p.id);
                    const detail = eglise ? [p.city, p.country].filter(Boolean).join(", ") : p.church;
                    return (
                      <li key={p.id} className="flex items-center gap-3 py-2.5">
                        <Link href={moi ? "/profil" : `/membre?u=${p.id}`} onClick={fermer} className="flex min-w-0 flex-1 items-center gap-3">
                          <Avatar pseudo={p.pseudo} url={p.avatar_url} size={48} streak={p.streak_days} badge={p.badge_tier} />
                          <span className="min-w-0">
                            <span className="flex items-center gap-1 text-[15px] font-bold">
                              <span className="truncate">{p.pseudo}</span>
                              {p.verified ? <VerifiedBadge className="h-4 w-4 shrink-0" /> : null}
                              {moi ? <span className="shrink-0 text-xs font-medium text-cream/45">(toi)</span> : null}
                            </span>
                            {detail ? <span className="block truncate text-xs text-cream/45">{detail}</span> : null}
                          </span>
                        </Link>
                        {userId && !moi ? (
                          <>
                            <Link
                              href={`/messages?u=${p.id}`}
                              onClick={fermer}
                              aria-label={`Écrire à ${p.pseudo}`}
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/75"
                            >
                              <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                                <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" strokeLinejoin="round" />
                              </svg>
                            </Link>
                            <button
                              type="button"
                              onClick={() => void basculer(p.id)}
                              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                                suit ? "border border-white/20 text-cream/80" : "bg-dawn-400 text-night-950"
                              }`}
                            >
                              {suit ? "Abonné" : "Suivre"}
                            </button>
                          </>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <BoutonInviter className="mt-5" />
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
