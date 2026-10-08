"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { asset } from "@/lib/asset";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { BatisseurBadge } from "@/components/community/BatisseurBadge";
import { estBatisseurActif } from "@/lib/soutien";
import { ModeratorBadge } from "@/components/community/ModeratorBadge";
import { ReportButton } from "@/components/community/ReportButton";
import { ProfileInfoPills } from "@/components/community/ProfileInfoPills";
import { FollowListModal } from "@/components/community/FollowListModal";
import { presenceLabel } from "@/lib/presence";
import { withJesusLabel, STREAK_BADGE_MIN } from "@/lib/spiritual";
import { ProfileBadgesRow, AchievementsOverlay } from "@/components/community/ProfileBadges";
import { ProfileThemeBg, useProfileTheme } from "@/components/community/ProfileTheme";
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
import { WallSection } from "@/components/wall/WallSection";
import { localeApp } from "@/lib/i18n";

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
  const [showList, setShowList] = useState<null | "followers" | "following">(null);
  // Vitrine des accomplissements du membre (trophées, titres, badges).
  const [showAchievements, setShowAchievements] = useState(false);

  const isMe =!!userId &&!!memberId && userId === memberId;
  const { jour } = useProfileTheme();

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
    <section className={jour? "bg-cream pb-10 text-night-900": "bg-night-950 pb-10 text-cream"}>
      <ProfileThemeBg jour={jour} />
      {/* ---- En-tête identique à « Mon profil » : bannière, avatar rond sur
           carte, nom + certification, compteurs en ligne, badges, bio ---- */}
      <div className={jour? "bg-cream text-night-900": "dark-ctx bg-night-950 text-cream"}>
        <div className="relative h-44 w-full overflow-hidden sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.banner_url || asset("/img/banniere-rhema.webp")}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-night-950/25 via-transparent to-night-950/30" />
          <Link
            href="/communaute"
            aria-label="Retour à la communauté"
            className="absolute left-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-10 grid h-9 w-9 place-items-center rounded-full bg-night-950/70 text-cream ring-1 ring-white/25 backdrop-blur"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className={`relative -mt-3 rounded-t-3xl px-5 pb-4 text-center ${jour? "bg-cream": "rounded-b-3xl bg-night-900 shadow-[0_-1px_0_rgba(255,255,255,0.14)]"}`}>
          <div className="relative mx-auto -mt-10 h-24 w-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url || asset("/img/profil-defaut.webp")}
              alt=""
              className={`h-24 w-24 rounded-full object-cover ring-4 ${jour? "ring-cream": "ring-night-900"}`}
            />
            {!isMe && presenceLabel(profile.last_seen_at)?.online ? (
              <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 ring-4 ${jour? "ring-cream": "ring-night-900"}`} />
            ) : null}
          </div>

          <h2
            className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight"
            style={profile.name_color? { color: profile.name_color }: undefined}
          >
            {profile.pseudo}
            {profile.verified || profile.is_moderator? (
              <VerifiedBadge className="ml-2 inline-block h-7 w-7 align-middle" />
            ): null}
          </h2>
          {estBatisseurActif(profile) ? <BatisseurBadge className="mt-2" /> : null}
          {!isMe && presenceLabel(profile.last_seen_at) ? (
            <p className={`mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold ${jour? "text-night-900/55": "text-cream/60"}`}>
              <span
                className={`inline-block h-2 w-2 rounded-full ${presenceLabel(profile.last_seen_at)!.online ? "bg-emerald-400" : jour ? "bg-night-900/25" : "bg-cream/30"}`}
              />
              {presenceLabel(profile.last_seen_at)!.label}
            </p>
          ) : null}
          {profile.life_phrase? (
            <p className={`mt-1 text-sm italic ${jour? "text-dawn-600": "text-dawn-300"}`}>{profile.life_phrase}</p>
          ): null}

          {/* Compteurs en ligne, comme sur « Mon profil » */}
          <p className={`mt-2 flex flex-wrap items-center justify-center gap-x-1.5 text-sm ${jour? "text-night-900/70": "text-cream/70"}`}>
            <button type="button" onClick={() => setShowList("followers")}>
              <span className={`font-display font-extrabold ${jour? "text-night-900": "text-cream"}`}>{counts.followers}</span> abonnés
            </button>
            <span aria-hidden>·</span>
            <button type="button" onClick={() => setShowList("following")}>
              <span className={`font-display font-extrabold ${jour? "text-night-900": "text-cream"}`}>{counts.following}</span> abonnements
            </button>
            <span aria-hidden>·</span>
            <span>
              <span className={`font-display font-extrabold ${jour? "text-night-900": "text-cream"}`}>{prayers.length}</span> sujets
            </span>
          </p>

          {/* Badges : ancienneté avec Jésus, série */}
          {withJesusLabel(profile.converted_at) || (profile.streak_days ?? 0) >= STREAK_BADGE_MIN ? (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              {withJesusLabel(profile.converted_at) ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${jour? "bg-dawn-500/15 text-dawn-600": "bg-dawn-400/15 text-dawn-300"}`}>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M12 3v18M7 8h10" />
                  </svg>
                  {withJesusLabel(profile.converted_at)}
                </span>
              ) : null}
              {(profile.streak_days ?? 0) >= STREAK_BADGE_MIN ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${jour? "bg-orange-500/15 text-orange-600": "bg-orange-400/15 text-orange-300"}`}>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z" />
                  </svg>
                  Série de {profile.streak_days} jours
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Badge + grade : une ligne compacte, comme sur « Mon profil » */}
          <div className="mt-2.5 flex items-center justify-center gap-3">
            <ProfileBadgesRow userId={profile.id} streakDays={profile.streak_days} single />
            {g ? (
              <div className="text-left" title={g.next? `Plus que ${g.toNext} pts → ${g.next.name}`: "Grade maximal"}>
                <p className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.15em] ${jour? "text-night-900/50": "text-cream/50"}`}>
                  {g.grade.name} · {g.points} pts
                </p>
                <div className={`mt-1.5 h-1 w-36 overflow-hidden rounded-full ${jour? "bg-night-900/10": "bg-white/10"}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-dawn-300" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ) : null}
          </div>

          {profile.bio &&
          profile.bio.trim().toLowerCase()!== profile.pseudo.trim().toLowerCase()? (
            <p className={`mx-auto mt-3 max-w-md text-sm leading-relaxed ${jour? "text-night-900/80": "text-cream/80"}`}>
              {profile.bio}
            </p>
          ): null}
          <ProfileInfoPills
            church={profile.church}
            city={profile.city}
            country={profile.country}
            show={isMe || profile.location_privacy!== "prive"}
            centered
            light={jour}
          />
          {verses.slice(0, 1).map((v, i) => (
            <p key={i} className={`mx-auto mt-2 max-w-md text-sm italic ${jour? "text-night-900/70": "text-cream/70"}`}>
              «&nbsp;{v.text}&nbsp;»{" "}
              {v.reference? (
                <span className={`font-semibold not-italic ${jour? "text-dawn-600": "text-dawn-200"}`}>{v.reference}</span>
              ): null}
            </p>
          ))}

          {/* Vitrine complète du membre : trophées, titres, badges */}
          <button
            type="button"
            onClick={() => setShowAchievements(true)}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
              jour ? "bg-night-900/10 text-night-900/70 hover:bg-night-900/15" : "bg-white/10 text-cream/75 hover:bg-white/15"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 18h16M5 16l-1-8 5 3 3-6 3 6 5-3-1 8z" />
            </svg>
            Ses accomplissements
          </button>

          <div className="mx-auto mt-4 flex max-w-md items-center gap-2">
            {isMe? (
              <Link
                href="/profil"
                className={`flex-1 rounded-full py-3 text-center text-sm font-bold ${jour? "bg-night-900 text-cream": "bg-cream text-night-950"}`}
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
? jour
? "border border-night-900/20 bg-night-900/5 text-night-900 hover:bg-night-900/10"
: "border border-white/20 bg-white/10 text-cream hover:bg-white/20"
: jour
? "bg-night-900 text-cream hover:-translate-y-0.5"
: "bg-cream text-night-950 hover:-translate-y-0.5"
                }`}
              >
                {following? "Abonné(e) ✓": "S'abonner"}
              </button>
            ): (
              <Link
                href="/communaute"
                className={`flex-1 rounded-full py-3 text-center text-sm font-bold ${jour? "bg-night-900 text-cream": "bg-cream text-night-950"}`}
              >
                Se connecter pour s'abonner
              </Link>
            )}
            {userId &&!isMe? (
              <Link
                href={`/messages?u=${memberId}`}
                aria-label="Envoyer un message"
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border ${jour? "border-night-900/15 bg-night-900/10 text-night-900": "border-white/15 bg-white/10 text-cream"}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ): null}
          </div>
        </div>
      </div>

      <div className={`${jour? "profile-jour-scope": "profile-dark"} container-x relative mt-2`}>
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
                  {new Date(p.created_at).toLocaleDateString(localeApp())}
                  {p.answered? " · Exaucé": ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>

      {/* Le mur du membre : ses publications (photos, versets, liens…) */}
      {memberId ? (
        <div className="container-x mt-8">
          <p className={`mb-1 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] ${jour ? "text-night-900/40" : "text-cream/40"}`}>
            <span className="h-px flex-1 bg-current opacity-30" />
            Ses publications
            <span className="h-px flex-1 bg-current opacity-30" />
          </p>
          <WallSection me={userId ?? ""} onlyUser={memberId} dark={!jour} />
        </div>
      ) : null}

      {/* Liste des abonnés / abonnements (privée si le membre l'a choisi) */}
      {showList && memberId ? (
        <FollowListModal
          userId={memberId}
          kind={showList}
          locked={profile.follows_privacy === "prive" && !isMe && !isAdmin}
          onClose={() => setShowList(null)}
        />
      ) : null}

      {showAchievements ? (
        <AchievementsOverlay
          userId={profile.id}
          streakDays={profile.streak_days}
          self={isMe}
          onClose={() => setShowAchievements(false)}
        />
      ) : null}
    </section>
  );
}
