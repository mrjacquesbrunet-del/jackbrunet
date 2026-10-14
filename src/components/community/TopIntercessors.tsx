"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { useAuth } from "@/components/community/useAuth";
import { topIntercessors, listFollowingIds, follow, unfollow, type Intercessor } from "@/lib/community";
import { PrayerMark } from "@/components/ui/PrayerMark";

/** Couronne (trait) pour les trois premières places. */
function Couronne({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 10H5L3 8z" />
    </svg>
  );
}

/**
 * « Intercesseurs de la semaine » : les 10 membres qui ont le plus porté les
 * autres dans la prière sur 7 jours (réactions « Je prie » + encouragements),
 * classés de 1 à 10, à faire glisser. Profil cliquable, « Suivre » en un clic.
 * « Voir tout » déplie le classement complet.
 */
export function TopIntercessors() {
  const { userId } = useAuth();
  const [items, setItems] = useState<Intercessor[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [tout, setTout] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    Promise.all([topIntercessors(7, 10), listFollowingIds(userId)]).then(([tops, ids]) => {
      if (!active) return;
      setItems(tops.slice(0, 10));
      setFollowed(new Set(ids));
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!userId || items.length === 0) return null;

  async function toggle(id: string) {
    if (!userId) return;
    setBusy(id);
    const isOn = followed.has(id);
    setFollowed((prev) => {
      const next = new Set(prev);
      if (isOn) next.delete(id);
      else next.add(id);
      return next;
    });
    if (isOn) await unfollow(id, userId);
    else await follow(id, userId);
    setBusy(null);
  }

  const bouton = (id: string, large = false) =>
    id === userId ? (
      <span className={`inline-flex h-6 items-center justify-center rounded-full border border-dawn-400/40 text-[11px] font-semibold text-dawn-300 ${large ? "px-3" : "w-full"}`}>
        Toi
      </span>
    ) : (
      <button
        type="button"
        disabled={busy === id}
        onClick={() => toggle(id)}
        className={`inline-flex h-6 items-center justify-center gap-1 rounded-full text-[11px] font-semibold transition-colors ${large ? "px-3" : "w-full"} ${
          followed.has(id) ? "border border-cream/20 text-cream/75" : "bg-cream text-night-950"
        }`}
      >
        {followed.has(id) ? (
          <>
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={2.6} aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Abonné
          </>
        ) : (
          "Suivre"
        )}
      </button>
    );

  return (
    <section className="mt-3 rounded-2xl border border-cream/10 bg-cream/[0.06] pb-3 pt-2.5">
      <div className="flex items-center gap-2 px-3">
        <PrayerMark className="h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[15px] font-bold leading-tight text-cream">Intercesseurs de la semaine</h2>
          <p className="truncate text-[11px] text-cream/50">Ils ont porté les autres dans la prière cette semaine. Merci !</p>
        </div>
        <button type="button" onClick={() => setTout((t) => !t)} className="flex shrink-0 items-center text-[11.5px] font-medium text-cream/65">
          {tout ? "Réduire" : "Voir tout"}
          <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 fill-none stroke-current transition-transform ${tout ? "rotate-90" : ""}`} strokeWidth={2.2} aria-hidden>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {tout ? (
        /* Classement complet, de 1 à 10 */
        <ol className="mt-2 divide-y divide-white/[0.06] px-3">
          {items.map(({ profile, score }, i) => (
            <li key={profile.id} className="flex items-center gap-2.5 py-2">
              <span className={`w-5 shrink-0 text-center text-[13px] font-bold ${i < 3 ? "text-dawn-400" : "text-cream/40"}`}>{i + 1}</span>
              <Link href={`/membre?u=${profile.id}`} className="shrink-0" aria-label="Voir le profil">
                <Avatar pseudo={profile.pseudo} url={profile.avatar_url} size={32} />
              </Link>
              <Link href={`/membre?u=${profile.id}`} className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-cream">{profile.pseudo}</span>
                <span className="block text-[11px] text-cream/45">{`${score} sujet${score > 1 ? "s" : ""}`}</span>
              </Link>
              {bouton(profile.id, true)}
            </li>
          ))}
        </ol>
      ) : (
        /* Cinq à l'écran, glisser pour voir les suivants (jusqu'au 10e) */
        <ul className="no-scrollbar mt-2.5 flex snap-x gap-1.5 overflow-x-auto scroll-px-3 px-3">
          {items.map(({ profile, score }, i) => (
            <li
              key={profile.id}
              className="w-[calc((100vw-2rem-1.5rem-0.375rem*4)/5)] max-w-[84px] shrink-0 snap-start rounded-xl border border-cream/[0.08] bg-cream/[0.05] px-1 pb-1.5 pt-2 text-center"
            >
              <Link href={`/membre?u=${profile.id}`} className="relative mx-auto block w-fit" aria-label="Voir le profil">
                <span className={`block rounded-full p-[1.5px] ${i < 3 ? "bg-dawn-400/80" : "bg-white/15"}`}>
                  <span className="block rounded-full bg-night-900 p-[1.5px]">
                    <Avatar pseudo={profile.pseudo} url={profile.avatar_url} size={38} />
                  </span>
                </span>
                <span
                  className={`absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-0.5 text-[9px] font-bold ${
                    i < 3 ? "bg-dawn-400 text-night-950" : "bg-night-700 text-cream/80"
                  }`}
                  aria-label={`${i + 1}e place`}
                >
                  {i === 0 ? <Couronne className="h-2.5 w-2.5" /> : i + 1}
                </span>
              </Link>
              <Link href={`/membre?u=${profile.id}`} className="mt-1 block truncate px-0.5 text-[11px] font-semibold text-cream">
                {profile.pseudo}
              </Link>
              <p className="text-[9.5px] text-cream/45">{`${score} sujet${score > 1 ? "s" : ""}`}</p>
              <div className="mt-1.5 px-0.5">{bouton(profile.id)}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
