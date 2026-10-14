"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { useAuth } from "@/components/community/useAuth";
import { topIntercessors, listFollowingIds, follow, unfollow, type Intercessor } from "@/lib/community";
import { HandsGlyph } from "@/components/ui/DevoIcons";

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
      <span className={`inline-flex items-center justify-center rounded-full border border-dawn-400/40 text-[13px] font-bold text-dawn-300 ${large ? "h-9 px-4" : "h-9 w-full"}`}>
        Toi
      </span>
    ) : (
      <button
        type="button"
        disabled={busy === id}
        onClick={() => toggle(id)}
        className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full text-[13.5px] font-bold transition-colors ${large ? "px-4" : "w-full"} ${
          followed.has(id) ? "border border-white/15 text-cream/75" : "bg-dawn-400 text-night-950"
        }`}
      >
        {followed.has(id) ? (
          <>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Abonné
          </>
        ) : (
          "Suivre"
        )}
      </button>
    );

  const rang = (i: number) => (
    <span
      className={`absolute -right-1 -top-1 grid h-7 min-w-7 place-items-center rounded-full border-2 border-night-900 px-1 text-[12px] font-black ${
        i < 3 ? "bg-dawn-400 text-night-950" : "bg-night-700 text-cream"
      }`}
      aria-label={`${i + 1}e place`}
    >
      {i < 3 ? (
        <span className="flex items-center gap-0.5">
          <Couronne className="h-3 w-3" />
          {i + 1}
        </span>
      ) : (
        i + 1
      )}
    </span>
  );

  return (
    <section className="mt-5 rounded-[28px] border border-dawn-400/30 bg-night-900 py-4">
      <div className="flex items-start gap-3 px-4">
        <HandsGlyph className="mt-0.5 h-7 w-7 shrink-0 text-dawn-400" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[19px] font-bold leading-tight text-cream">Intercesseurs de la semaine</h2>
          <p className="mt-0.5 text-[12.5px] text-cream/55">Ils ont porté les autres dans la prière cette semaine. Merci !</p>
        </div>
        <button type="button" onClick={() => setTout((t) => !t)} className="flex shrink-0 items-center gap-0.5 pt-0.5 text-[13.5px] font-semibold text-cream/75">
          {tout ? "Réduire" : "Voir tout"}
          <svg viewBox="0 0 24 24" className={`h-4 w-4 fill-none stroke-current transition-transform ${tout ? "rotate-90" : ""}`} strokeWidth={2.2} aria-hidden>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {tout ? (
        /* Classement complet, de 1 à 10 */
        <ol className="mt-3 divide-y divide-white/[0.06] px-4">
          {items.map(({ profile, score }, i) => (
            <li key={profile.id} className="flex items-center gap-3 py-2.5">
              <span className={`w-6 shrink-0 text-center font-display text-[17px] font-black ${i < 3 ? "text-dawn-400" : "text-cream/45"}`}>{i + 1}</span>
              <Link href={`/membre?u=${profile.id}`} className="shrink-0" aria-label="Voir le profil">
                <Avatar pseudo={profile.pseudo} url={profile.avatar_url} size={42} />
              </Link>
              <Link href={`/membre?u=${profile.id}`} className="min-w-0 flex-1">
                <span className="block truncate font-bold text-cream">{profile.pseudo}</span>
                <span className="block text-[12px] text-cream/50">{`${score} sujet${score > 1 ? "s" : ""}`}</span>
              </Link>
              {bouton(profile.id, true)}
            </li>
          ))}
        </ol>
      ) : (
        /* Du premier au dixième, à faire glisser */
        <ul className="no-scrollbar mt-3.5 flex snap-x gap-2.5 overflow-x-auto scroll-px-4 px-4 pb-0.5">
          {items.map(({ profile, score }, i) => (
            <li key={profile.id} className="w-[108px] shrink-0 snap-start rounded-[22px] border border-white/[0.08] bg-white/[0.035] px-2 pb-3 pt-3.5 text-center">
              <Link href={`/membre?u=${profile.id}`} className="relative mx-auto block w-fit" aria-label="Voir le profil">
                <span className={`block rounded-full p-[2px] ${i < 3 ? "bg-dawn-400" : "bg-white/15"}`}>
                  <span className="block rounded-full bg-night-900 p-[2px]">
                    <Avatar pseudo={profile.pseudo} url={profile.avatar_url} size={56} />
                  </span>
                </span>
                {rang(i)}
              </Link>
              <Link href={`/membre?u=${profile.id}`} className="mt-2 block truncate text-[14px] font-bold text-cream">
                {profile.pseudo}
              </Link>
              <p className="text-[12px] text-cream/50">{`${score} sujet${score > 1 ? "s" : ""}`}</p>
              <div className="mt-2.5">{bouton(profile.id)}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
