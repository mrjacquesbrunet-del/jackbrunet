"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { GradeBadge } from "@/components/community/GradeBadge";
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
import type { Activity } from "@/lib/grades";

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

  const isMe = !!userId && !!memberId && userId === memberId;

  const load = useCallback(async () => {
    setLoading(true);
    // Profil ciblé par id (?u=) ou par pseudo (?pseudo=, depuis une mention).
    let id = paramId;
    let p: Profile | null = null;
    if (!id && paramPseudo) {
      p = await getProfileByPseudo(paramPseudo);
      id = p?.id ?? null;
    }
    setMemberId(id);
    if (!id) {
      setProfile(p);
      setLoading(false);
      return;
    }
    const [prof, c, pr, act] = await Promise.all([
      p ? Promise.resolve(p) : getProfile(id),
      followCounts(id),
      listPrayersByAuthor(id),
      getActivity(id),
    ]);
    setProfile(prof);
    setCounts(c);
    setPrayers(pr);
    setActivity(act);
    if (userId && userId !== id) setFollowing(await isFollowing(id, userId));
    setLoading(false);
  }, [paramId, paramPseudo, userId]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  async function toggleFollow() {
    if (!userId || !memberId) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    setCounts((c) => ({ ...c, followers: c.followers + (next ? 1 : -1) }));
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
  if (!paramId && !paramPseudo) {
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

  const verses = profile.favorite_verses ?? [];

  return (
    <section className="container-x py-10">
      <div className="glass-strong p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar pseudo={profile.pseudo} url={profile.avatar_url} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-1.5 font-display text-2xl font-extrabold leading-tight">
                {profile.pseudo}
                {profile.verified ? <VerifiedBadge className="h-5 w-5" /> : null}
              </h2>
              {activity ? <GradeBadge activity={activity} /> : null}
            </div>
            <p className="mt-1 text-sm text-night-900/55">
              <strong className="text-night-900/80">{counts.followers}</strong> abonné
              {counts.followers > 1 ? "s" : ""} ·{" "}
              <strong className="text-night-900/80">{counts.following}</strong> abonnement
              {counts.following > 1 ? "s" : ""}
            </p>
          </div>
          {isMe ? (
            <Link href="/profil" className="btn-ghost">
              Modifier mon profil
            </Link>
          ) : userId ? (
            <button
              type="button"
              onClick={toggleFollow}
              disabled={busy}
              className={following ? "btn-ghost" : "btn-primary"}
            >
              {following ? "Abonné(e) ✓" : "S'abonner"}
            </button>
          ) : (
            <Link href="/communaute" className="btn-primary">
              Se connecter pour s'abonner
            </Link>
          )}
        </div>

        {profile.bio ? (
          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/85">
            {profile.bio}
          </p>
        ) : null}

        {verses.length > 0 ? (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-night-900/45">
              Mes versets
            </p>
            {verses.map((v, i) => (
              <blockquote
                key={i}
                className="rounded-2xl border-l-4 border-spirit-500/40 bg-spirit-500/[0.05] px-4 py-3"
              >
                <p className="text-[15px] italic leading-relaxed text-night-900/85">« {v.text} »</p>
                {v.reference ? (
                  <cite className="mt-1 block text-xs font-semibold not-italic text-spirit-700">
                    {v.reference}
                  </cite>
                ) : null}
              </blockquote>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Ses sujets de prière</h3>
        {prayers.length === 0 ? (
          <p className="mt-3 text-night-900/55">
            Aucun sujet visible pour l'instant.
            {!isMe && !following ? " Abonne-toi pour voir ses prières réservées à ses abonnés." : ""}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {prayers.map((p) => (
              <li key={p.id} className="rounded-2xl border border-night-900/10 bg-white p-4">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/85">
                  {p.body}
                </p>
                <p className="mt-2 text-xs text-night-900/45">
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  {p.answered ? " · Exaucé 🙌" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
