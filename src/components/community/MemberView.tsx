"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import {
  getProfile,
  getProfileByPseudo,
  follow,
  unfollow,
  isFollowing,
  followCounts,
  getActivity,
  listPrayersByAuthor,
  type Profile,
  type Prayer,
} from "@/lib/community";
import { gradeFor, type Activity } from "@/lib/grades";

export function MemberView() {
  const params = useSearchParams();
  const paramId = params.get("u");
  const paramPseudo = params.get("pseudo");
  const { ready, userId } = useAuth();

  const [memberId, setMemberId] = useState<string | null>(paramId);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [activity, setActivity] = useState<Activity | null>(null);
  const [following, setFollowing] = useState(false);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const isMe =!!userId &&!!memberId && userId === memberId;

  const load = useCallback(async () => {
    setLoading(true);
    // Profil ciblé par id (?u=) ou par pseudo (?pseudo=, depuis une mention).
    let id = paramId;
    let p: Profile | null = null;
    if (!id && paramPseudo) {
      p = await getProfileByPseudo(paramPseudo);
      id = p?.id?? null;
    }
    setMemberId(id);
    if (!id) {
      setProfile(p);
      setLoading(false);
      return;
    }
    const [prof, c, pr, act] = await Promise.all([
      p? Promise.resolve(p): getProfile(id),
      followCounts(id),
      listPrayersByAuthor(id),
      getActivity(id),
    ]);
    setProfile(prof);
    setCounts(c);
    setPrayers(pr);
    setActivity(act);
    if (userId && userId!== id) setFollowing(await isFollowing(id, userId));
    setLoading(false);
  }, [paramId, paramPseudo, userId]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  async function toggleFollow() {
    if (!userId ||!memberId) return;
    setBusy(true);
    const next =!following;
    setFollowing(next);
    setCounts((c) => ({...c, followers: c.followers + (next? 1: -1) }));
    if (next) await follow(memberId, userId);
    else await unfollow(memberId, userId);
    setBusy(false);
  }

  if (!isSupabaseConfigured) {
    return (
      <section className="container-x py-16 text-center text-night-900/60">
        Profils bientôt disponibles.
      </section>
    );
  }
  if (!paramId &&!paramPseudo) {
    return (
      <section className="container-x py-16 text-center text-night-900/60">
        Membre introuvable.{" "}
        <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
          Retour à la communauté
        </Link>
      </section>
    );
  }
  if (loading) return <p className="container-x py-16 text-night-900/50">Chargement…</p>;
  if (!profile) {
    return (
      <section className="container-x py-16 text-center text-night-900/60">
        Ce membre n'existe pas (ou plus).{" "}
        <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
          Retour à la communauté
        </Link>
      </section>
    );
  }

  const verses = profile.favorite_verses?? [];
  const g = activity? gradeFor(activity): null;
  const pct = g?.next? Math.min(100, Math.round((g.points / g.next.min) * 100)): 100;

  return (
    <section className="container-x pb-10 pt-24 sm:pt-32">
      {/* En-tête façon Instagram, sur olive sombre texturé (comme le profil). */}
      <div className="dark-ctx bg-topo-dark relative rounded-4xl border border-white/10 p-6 text-cream shadow-card sm:p-8">
        {/* Jauge de grade de la personne */}
        {g? (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-dawn-300">
                {g.grade.name} · {g.points} pts
              </span>
              <span className="text-cream/60">
                {g.next? `Plus que ${g.toNext} pts → ${g.next.name}`: "Grade maximal"}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ): null}

        {/* Avatar + stats */}
        <div className="flex items-end gap-5">
          <span className="shrink-0 rounded-full bg-dawn-400 p-[3px]">
            <span className="block rounded-full bg-night-900 p-[3px]">
              <Avatar pseudo={profile.pseudo} url={profile.avatar_url} size={84} />
            </span>
          </span>
          <div className="grid flex-1 grid-cols-3 gap-1 text-center">
            <div className="py-1">
              <p className="font-display text-xl font-extrabold text-cream">{counts.followers}</p>
              <p className="text-[11px] text-cream/60">Abonnés</p>
            </div>
            <div className="py-1">
              <p className="font-display text-xl font-extrabold text-cream">{counts.following}</p>
              <p className="text-[11px] text-cream/60">Abonnements</p>
            </div>
            <div className="py-1">
              <p className="font-display text-xl font-extrabold text-cream">{prayers.length}</p>
              <p className="text-[11px] text-cream/60">Sujets</p>
            </div>
          </div>
        </div>

        {/* Nom + grade + bio + versets */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="flex items-center gap-1.5 font-display text-xl font-extrabold leading-tight text-cream">
              {profile.pseudo}
              {profile.verified? <VerifiedBadge className="h-5 w-5" />: null}
            </h2>
            {g? (
              <span className="inline-flex items-center gap-1 rounded-full bg-dawn-400/20 px-2.5 py-0.5 text-[11px] font-bold text-dawn-200">
                {g.grade.name}
              </span>
            ): null}
          </div>
          {profile.bio? (
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-cream/80">
              {profile.bio}
            </p>
          ): null}
          {verses.slice(0, 3).map((v, i) => (
            <p key={i} className="mt-1.5 border-l-2 border-dawn-400 pl-2.5 text-sm italic text-cream/75">
              «&nbsp;{v.text}&nbsp;»{" "}
              {v.reference? (
                <span className="font-semibold not-italic text-dawn-200">{v.reference}</span>
              ): null}
            </p>
          ))}
        </div>

        {/* Bouton s'abonner (façon Instagram) */}
        <div className="mt-5">
          {isMe? (
            <Link
              href="/profil"
              className="block w-full rounded-full border border-white/20 bg-white/10 py-2.5 text-center text-sm font-bold text-cream transition-colors hover:bg-white/20"
            >
              Modifier mon profil
            </Link>
          ): userId? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleFollow}
                disabled={busy}
                className={`flex-1 rounded-full py-2.5 text-center text-sm font-bold transition-colors disabled:opacity-60 ${
                  following
? "border border-white/20 bg-white/10 text-cream hover:bg-white/20"
: "bg-dawn-400 text-night-900 hover:-translate-y-0.5"
                }`}
              >
                {following? "Abonné(e) ✓": "S'abonner"}
              </button>
              <Link
                href={`/messages?u=${memberId}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 py-2.5 text-center text-sm font-bold text-cream transition-colors hover:bg-white/20"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Message
              </Link>
            </div>
          ): (
            <Link
              href="/communaute"
              className="block w-full rounded-full bg-dawn-400 py-2.5 text-center text-sm font-bold text-night-900"
            >
              Se connecter pour s'abonner
            </Link>
          )}
        </div>
      </div>

      {/* Son feed: ses sujets de prière */}
      <div className="mx-auto mt-8 max-w-2xl">
        <h3 className="font-display text-lg font-bold">Ses sujets de prière</h3>
        {prayers.length === 0? (
          <p className="mt-3 text-night-900/55">
            Aucun sujet visible pour l'instant.
            {!isMe &&!following? " Abonne-toi pour voir ses prières réservées à ses abonnés.": ""}
          </p>
        ): (
          <ul className="mt-3 space-y-3">
            {prayers.map((p) => (
              <li key={p.id} className="rounded-2xl border border-night-900/10 bg-white p-4 shadow-sm">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/85">
                  {p.body}
                </p>
                <p className="mt-2 text-xs text-night-900/45">
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  {p.answered? " · Exaucé": ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
