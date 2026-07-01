"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { useAuth } from "@/components/community/useAuth";
import { suggestedProfiles, follow, unfollow, type Profile } from "@/lib/community";

/**
 * « Suggestions pour toi » façon Instagram: propose des intercesseurs à
 * suivre. Chaque carte ouvre le profil du membre ; le bouton s'abonne
 * directement, sans quitter la page.
 */
export function MemberSuggestions() {
  const { userId } = useAuth();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setLoading(true);
    suggestedProfiles(userId).then((list) => {
      if (active) {
        setMembers(list);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [userId]);

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

  if (loading) {
    return <p className="text-sm text-night-900/45">Chargement des suggestions…</p>;
  }
  if (members.length === 0) {
    return (
      <p className="text-sm text-night-900/45">
        Pas encore de suggestion — reviens bientôt, la communauté grandit chaque jour
      </p>
    );
  }

  return (
    <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
      {members.map((m) => {
        const on = followed.has(m.id);
        return (
          <div
            key={m.id}
            className="flex w-40 shrink-0 flex-col items-center rounded-3xl border border-night-900/10 bg-white p-4 text-center shadow-sm"
          >
            <Link href={`/membre?u=${m.id}`} className="flex flex-col items-center">
              <Avatar pseudo={m.pseudo} url={m.avatar_url} size={64} />
              <span className="mt-2 line-clamp-1 w-full font-display font-bold text-night-900/85">
                {m.pseudo}
              </span>
              <span className="mt-0.5 text-[11px] text-night-900/45">Intercesseur</span>
            </Link>
            <button
              type="button"
              onClick={() => toggle(m.id)}
              disabled={busy === m.id}
              className={`mt-3 w-full justify-center rounded-full px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                on
? "border border-night-900/15 bg-white text-night-900/70"
: "bg-spirit-700 text-cream hover:bg-spirit-600"
              }`}
            >
              {on? "Abonné(e) ✓": "Suivre"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
