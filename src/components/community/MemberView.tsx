"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { asset } from "@/lib/asset";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { ModeratorBadge } from "@/components/community/ModeratorBadge";
import { ReportButton } from "@/components/community/ReportButton";
import { ProfileInfoPills } from "@/components/community/ProfileInfoPills";
import { blockUser, unblockUser, listBlockedIds } from "@/lib/moderation";
import {
  getProfile,
  getProfileByPseudo,
  follow,
  unfollow,
  isFollowing,
  followCounts,
  getActivity,
  listPrayersByAuthor,
  setModerator,
  type Profile,
  type Prayer,
} from "@/lib/community";
import { gradeFor, type Activity } from "@/lib/grades";

export function MemberView() {
  const params = useSearchParams();
  const paramId = params.get("u");
  const paramPseudo = params.get("pseudo");
  const { ready, userId, isAdmin } = useAuth();

  const [memberId, setMemberId] = useState<string | null>(paramId);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [activity, setActivity] = useState<Activity | null>(null);
  const [following, setFollowing] = useState(false);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);

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
      // Toujours le profil complet (la recherche par pseudo n'en renvoie qu'une partie).
      getProfile(id),
      followCounts(id),
      listPrayersByAuthor(id),
      getActivity(id),
    ]);
    setProfile(prof);
    setCounts(c);
    setPrayers(pr);
    setActivity(act);
    if (userId && userId!== id) {
      setFollowing(await isFollowing(id, userId));
      setBlocked((await listBlockedIds()).includes(id));
    }
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

  async function toggleBlock() {
    if (!memberId) return;
    const next =!blocked;
    setBusy(true);
    const ok = next? await blockUser(memberId): await unblockUser(memberId);
    setBusy(false);
    if (ok) setBlocked(next);
  }

  async function toggleModerator() {
    if (!memberId ||!profile) return;
    const next =!profile.is_moderator;
    setBusy(true);
    const ok = await setModerator(memberId, next);
    setBusy(false);
    // Modérateur = aussi certifié (sceau lime), comme l'admin.
    if (ok) setProfile({...profile, is_moderator: next, verified: next });
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
      {/* En-tête nouveau design : grande photo, nom par-dessus, carte sombre. */}
      <div className="dark-ctx bg-topo-dark relative rounded-4xl border border-white/10 p-6 text-cream shadow-card sm:p-8">
        {/* ---- Héros photo ---- */}
        <div className="relative -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-4xl sm:-mx-8 sm:-mt-8">
          <div className="relative aspect-[4/5] max-h-[440px] w-full sm:aspect-[16/9]">
            {profile.avatar_url? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              />
            ): (
              // Image de référence de la charte (croix) quand pas de photo.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset("/img/profil-defaut.webp")}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/25 to-transparent" />
            {g? (
              <span className="absolute left-4 top-4 rounded-full bg-night-950/70 px-3 py-1 text-[11px] font-bold text-dawn-300 backdrop-blur">
                {g.grade.name}
              </span>
            ): null}
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h2 className="flex items-center gap-2 font-display text-3xl font-extrabold leading-tight text-cream">
                {profile.pseudo}
                {profile.verified || profile.is_moderator? <VerifiedBadge className="h-6 w-6" />: null}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {profile.is_moderator? <ModeratorBadge /> : null}
                {profile.life_phrase? (
                  <p className="text-sm italic text-dawn-300">{profile.life_phrase}</p>
                ): null}
              </div>
            </div>
          </div>
        </div>

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

        {/* Statistiques (le portrait est dans le héros photo) */}
        <div>
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/[0.05] py-2 text-center">
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

        {/* Bio + église/localisation + versets */}
        <div className="mt-4">
          {profile.bio? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/80">
              {profile.bio}
            </p>
          ): null}
          <ProfileInfoPills
            church={profile.church}
            city={profile.city}
            country={profile.country}
            show={isMe || profile.location_privacy!== "prive"}
          />
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
: "bg-cream text-night-950 hover:-translate-y-0.5"
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

        {/* Signaler / Bloquer ce membre */}
        {userId &&!isMe? (
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-cream/60">
            <ReportButton targetType="profile" targetId={memberId ?? ""} label="Signaler" tone="dark" />
            <button type="button" onClick={toggleBlock} disabled={busy} className="inline-flex items-center gap-1 font-semibold hover:text-cream disabled:opacity-50">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.8}>
                <circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" strokeLinecap="round" />
              </svg>
              {blocked? "Débloquer": "Bloquer"}
            </button>
          </div>
        ): null}

        {/* Admin : nommer / retirer un modérateur, en un clic */}
        {isAdmin &&!isMe? (
          <button
            type="button"
            onClick={toggleModerator}
            disabled={busy}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-center text-sm font-bold transition-colors disabled:opacity-60 ${
              profile.is_moderator
? "border border-red-400/40 text-red-300 hover:bg-red-500/10"
: "bg-spirit-600 text-cream hover:bg-spirit-500"
            }`}
          >
            {profile.is_moderator? "Retirer le rôle de modérateur": "Nommer modérateur/modératrice"}
          </button>
        ): null}
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
