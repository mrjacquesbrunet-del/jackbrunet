"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { asset } from "@/lib/asset";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { ModeratorBadge } from "@/components/community/ModeratorBadge";
import { ReportButton } from "@/components/community/ReportButton";
import { ProfileInfoPills } from "@/components/community/ProfileInfoPills";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
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
    <section className="bg-night-950 pb-10 text-cream">
      <PlansDarkBg />
      {/* ---- Bloc total : la photo fond dans le flou sombre, le texte vient dessus ---- */}
      <div className="dark-ctx relative h-[calc(100svh-7.5rem-env(safe-area-inset-bottom))] min-h-[580px] w-full overflow-hidden bg-night-950">
        {/* Fond : la même photo floutée remplit l'écran… */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.banner_url || profile.avatar_url || asset("/img/profil-defaut.webp")}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
        />
        {/* …et la photo s'affiche ENTIÈRE par-dessus (pas de recadrage). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.banner_url || profile.avatar_url || asset("/img/profil-defaut.webp")}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-contain"
        />
        <div
          className="absolute inset-0 backdrop-blur-2xl"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent 48%, black 72%)",
            maskImage: "linear-gradient(to bottom, transparent 48%, black 72%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/25 via-transparent to-night-950" />

        {g? (
          <div
            className="absolute inset-x-4 top-[calc(env(safe-area-inset-top)+0.5rem)] h-1 overflow-hidden rounded-full bg-white/15"
            title={g.next? `Plus que ${g.toNext} pts → ${g.next.name}`: "Grade maximal"}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-dawn-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        ): null}
        <Link
          href="/communaute"
          aria-label="Retour à la communauté"
          className="absolute left-4 top-[calc(env(safe-area-inset-top)+1.4rem)] grid h-10 w-10 place-items-center rounded-full bg-night-950/60 text-cream backdrop-blur"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {g? (
          <span className="absolute right-4 top-[calc(env(safe-area-inset-top)+1.4rem)] rounded-full bg-night-950/70 px-3 py-1 text-[11px] font-bold text-dawn-300 backdrop-blur">
            {g.grade.name}
          </span>
        ): null}

        {/* Contenu posé directement sur la photo (réf. Olivia Beits) */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-center">
          <h2
            className="text-balance font-display text-3xl font-extrabold leading-tight text-cream sm:text-4xl"
            style={profile.name_color? { color: profile.name_color }: undefined}
          >
            {profile.pseudo}
            {profile.verified || profile.is_moderator? (
              <VerifiedBadge className="ml-2 inline-block h-7 w-7 align-middle" />
            ): null}
          </h2>
          {profile.life_phrase? (
            <p className="mt-1 text-sm italic text-dawn-300">{profile.life_phrase}</p>
          ): null}

          <div className="mx-auto mt-5 flex max-w-md items-center gap-2">
            {isMe? (
              <Link
                href="/profil"
                className="flex-1 rounded-full bg-cream py-3 text-center text-sm font-bold text-night-950"
              >
                Modifier mon profil
              </Link>
            ): userId? (
              <button
                type="button"
                onClick={toggleFollow}
                disabled={busy}
                className={`flex-1 rounded-full py-3 text-center text-sm font-bold transition-colors disabled:opacity-60 ${
                  following
? "border border-white/20 bg-white/10 text-cream hover:bg-white/20"
: "bg-cream text-night-950 hover:-translate-y-0.5"
                }`}
              >
                {following? "Abonné(e) ✓": "S'abonner"}
              </button>
            ): (
              <Link
                href="/communaute"
                className="flex-1 rounded-full bg-cream py-3 text-center text-sm font-bold text-night-950"
              >
                Se connecter pour s'abonner
              </Link>
            )}
            {userId &&!isMe? (
              <Link
                href={`/messages?u=${memberId}`}
                aria-label="Envoyer un message"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-cream backdrop-blur"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ): null}
          </div>

          <div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-2">
            <div>
              <p className="font-display text-2xl font-extrabold text-cream">{counts.followers}</p>
              <p className="text-[11px] text-cream/55">Abonnés</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-cream">{counts.following}</p>
              <p className="text-[11px] text-cream/55">Abonnements</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-dawn-300">{prayers.length}</p>
              <p className="text-[11px] text-cream/55">Sujets</p>
            </div>
          </div>

          {profile.bio &&
          profile.bio.trim().toLowerCase()!== profile.pseudo.trim().toLowerCase()? (
            <p className="mx-auto mt-4 max-w-md rounded-2xl bg-white/[0.07] px-4 py-3 text-sm leading-relaxed text-cream/85 backdrop-blur">
              {profile.bio}
            </p>
          ): null}
          <ProfileInfoPills
            church={profile.church}
            city={profile.city}
            country={profile.country}
            show={isMe || profile.location_privacy!== "prive"}
            centered
          />
          {verses.slice(0, 1).map((v, i) => (
            <p key={i} className="mx-auto mt-3 max-w-md text-sm italic text-cream/75">
              «&nbsp;{v.text}&nbsp;»{" "}
              {v.reference? (
                <span className="font-semibold not-italic text-dawn-200">{v.reference}</span>
              ): null}
            </p>
          ))}
        </div>
      </div>

      <div className="profile-dark container-x relative mt-2">
      <div className="dark-ctx bg-topo-dark relative rounded-4xl border border-white/10 p-6 text-cream shadow-card sm:p-8">
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
          <p className="mt-3 text-cream/55">
            Aucun sujet visible pour l'instant.
            {!isMe &&!following? " Abonne-toi pour voir ses prières réservées à ses abonnés.": ""}
          </p>
        ): (
          <ul className="mt-3 space-y-3">
            {prayers.map((p) => (
              <li key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-cream/85">
                  {p.body}
                </p>
                <p className="mt-2 text-xs text-cream/45">
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  {p.answered? " · Exaucé": ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </section>
  );
}
