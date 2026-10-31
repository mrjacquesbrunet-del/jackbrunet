"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { MemberSuggestions } from "@/components/community/MemberSuggestions";
import { searchProfiles, follow, unfollow, listFollowingIds, type Profile } from "@/lib/community";

/**
 * Recherche de membres plein écran (la loupe du profil), façon Instagram :
 * on tape un pseudo, les résultats arrivent pendant la frappe, on s'abonne
 * d'un toucher ou on ouvre le profil. Sans recherche : suggestions.
 */
export function RechercheProfils({ ouvert, fermer }: { ouvert: boolean; fermer: () => void }) {
  const { userId } = useAuth();
  const [q, setQ] = useState("");
  const [resultats, setResultats] = useState<Profile[]>([]);
  const [chargement, setChargement] = useState(false);
  const [suivis, setSuivis] = useState<Set<string>>(new Set());
  const champ = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    setTimeout(() => champ.current?.focus(), 250);
    if (userId) listFollowingIds(userId).then((ids) => setSuivis(new Set(ids)));
  }, [ouvert, userId]);

  useEffect(() => {
    const texte = q.trim();
    if (texte.length < 2) {
      setResultats([]);
      setChargement(false);
      return;
    }
    setChargement(true);
    const t = setTimeout(async () => {
      const r = await searchProfiles(texte, 30);
      setResultats(r.filter((p) => p.id !== userId));
      setChargement(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q, userId]);

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

  return (
    <AnimatePresence>
      {ouvert ? (
        <motion.div
          className="keep-dark fixed inset-0 z-[130] flex flex-col bg-night-950 text-cream"
          role="dialog"
          aria-modal="true"
          aria-label="Rechercher des membres"
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
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white/[0.08] px-3.5">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current text-cream/50" strokeWidth={2} aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={champ}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un membre…"
                enterKeyHint="search"
                autoCapitalize="none"
                autoCorrect="off"
                className="min-w-0 flex-1 appearance-none bg-transparent py-3 text-[16px] text-cream outline-none placeholder:text-cream/40 [&::-webkit-search-cancel-button]:hidden"
              />
              {q ? (
                <button type="button" onClick={() => setQ("")} aria-label="Effacer" className="grid h-7 w-7 place-items-center rounded-full text-cream/50">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              ) : null}
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3">
            {q.trim().length < 2 ? (
              <>
                <p className="px-1 text-sm text-cream/50">Tape au moins 2 lettres du pseudo.</p>
                <p className="mb-2 mt-6 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-cream/45">Suggestions pour toi</p>
                <MemberSuggestions compact dark />
              </>
            ) : chargement && !resultats.length ? (
              <p className="px-1 py-4 text-sm text-cream/50">Recherche…</p>
            ) : !resultats.length ? (
              <p className="px-1 py-4 text-sm text-cream/50">Aucun membre trouvé pour « {q.trim()} ».</p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {resultats.map((p) => {
                  const suit = suivis.has(p.id);
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-2.5">
                      <Link href={`/membre?u=${p.id}`} onClick={fermer} className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar pseudo={p.pseudo} url={p.avatar_url} size={48} />
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-bold">{p.pseudo}</span>
                          <span className="block text-xs text-cream/45">Voir le profil</span>
                        </span>
                      </Link>
                      {userId ? (
                        <button
                          type="button"
                          onClick={() => void basculer(p.id)}
                          className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                            suit ? "border border-white/20 text-cream/80" : "bg-dawn-400 text-night-950"
                          }`}
                        >
                          {suit ? "Abonné" : "Suivre"}
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
