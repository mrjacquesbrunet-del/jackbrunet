"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { useAuth } from "@/components/community/useAuth";
import {
  topIntercessors,
  listFollowingIds,
  follow,
  unfollow,
  type Intercessor,
} from "@/lib/community";

/** Mains en prière (trait de la charte). */
function PrayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path d="M12 3c-1 2-1 4 0 6m0 0c1-2 1-4 0-6M7 21l1.5-7.5a3.5 3.5 0 0 1 7 0L17 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * « Intercesseurs de la semaine » : met en avant les 2 membres qui ont le
 * plus porté les autres dans la prière (réactions « Je prie » +
 * encouragements) sur 7 jours. Profil cliquable, abonnement en un clic —
 * pour encourager tout le monde à prier les uns pour les autres.
 */
export function TopIntercessors() {
  const { userId } = useAuth();
  const [items, setItems] = useState<Intercessor[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    Promise.all([topIntercessors(7, 4), listFollowingIds(userId)]).then(([tops, ids]) => {
      if (!active) return;
      // On ne se met pas soi-même en avant, et on garde les 2 premiers.
      setItems(tops.filter((t) => t.profile.id !== userId).slice(0, 2));
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

  return (
    <div className="mt-5 rounded-3xl border border-dawn-400/40 bg-dawn-400/[0.08] p-4 sm:p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-spirit-700">
        <PrayGlyph className="h-4 w-4 text-spirit-600" />
        Intercesseurs de la semaine
      </p>
      <p className="mt-1 text-xs text-night-900/55">
        Ils ont porté les autres dans la prière cette semaine. Merci !
      </p>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map(({ profile, score }) => {
          const isOn = followed.has(profile.id);
          return (
            <li
              key={profile.id}
              className="flex items-center gap-3 rounded-2xl border border-night-900/10 bg-white px-3.5 py-3"
            >
              <Link href={`/membre?u=${profile.id}`} className="shrink-0" aria-label="Voir le profil">
                <Avatar pseudo={profile.pseudo} url={profile.avatar_url} size={40} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/membre?u=${profile.id}`}
                  className="block truncate font-display font-bold leading-tight text-night-900 hover:underline"
                >
                  {profile.pseudo}
                </Link>
                <p className="text-[11px] text-night-900/55">
                  a porté {score} sujet{score > 1 ? "s" : ""} dans la prière
                </p>
              </div>
              <button
                type="button"
                disabled={busy === profile.id}
                onClick={() => toggle(profile.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  isOn
                    ? "border border-night-900/15 text-night-900/60"
                    : "bg-dawn-400 text-night-950 hover:bg-dawn-300"
                }`}
              >
                {isOn ? "Abonné" : "S'abonner"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
