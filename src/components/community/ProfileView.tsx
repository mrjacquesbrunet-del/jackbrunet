"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { asset } from "@/lib/asset";
import { Avatar } from "@/components/community/Avatar";
import { withJesusLabel, STREAK_BADGE_MIN } from "@/lib/spiritual";
import { ReminderToggle } from "@/components/pwa/ReminderToggle";
import { ProfileBadgesRow } from "@/components/community/ProfileBadges";
import { ProfileSettings } from "@/components/community/ProfileSettings";
import {
  signOut,
  deleteAccount,
  updateProfile,
  isPseudoTaken,
  isReservedPseudo,
  listMyPrayers,
  setPrayerAnswered,
  followCounts,
  getActivity,
  uploadAvatar,
  isAdminEmail,
  type Prayer,
  type FavoriteVerse,
} from "@/lib/community";
import { ProfileSignIn } from "@/components/community/ProfileSignIn";
import { PrayerListQuickAdd } from "@/components/community/MyPrayerList";
import { MemberSearch } from "@/components/community/MemberSearch";
import { MemberSuggestions } from "@/components/community/MemberSuggestions";
import { ProfileActivity } from "@/components/community/ProfileActivity";
import { ModerationQueue } from "@/components/community/ModerationQueue";
import { NotificationsBell } from "@/components/community/NotificationsBell";
import { MessagesButton } from "@/components/community/MessagesButton";
import { DeleteAccountButton } from "@/components/community/DeleteAccountButton";
import { WhatsAppCard } from "@/components/ui/WhatsAppChannel";
import { WallSection } from "@/components/wall/WallSection";
import { countUserPosts } from "@/lib/wall";
import { StoriesBar } from "@/components/stories/StoriesBar";
import { BootDiagnostic } from "@/components/app/BootDiagnostic";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { BatisseurBadge } from "@/components/community/BatisseurBadge";
import { ZoomBatisseursCard } from "@/components/mission/ZoomBatisseurs";
import { ModeratorBadge } from "@/components/community/ModeratorBadge";
import { FollowList } from "@/components/community/FollowList";
import { ProfileBanners } from "@/components/community/ProfileBanners";
import { ProfileInfoPills } from "@/components/community/ProfileInfoPills";
import { ProfileThemeBg, ProfileThemeToggle, useProfileTheme } from "@/components/community/ProfileTheme";
import { useEngagement } from "@/lib/engagement";
import { FIDELITY_REWARDS } from "@/lib/rewards";
import { FlameGlyph, StarGlyph, GiftGlyph } from "@/components/ui/DevoIcons";
import { useNotebook } from "@/lib/notebook";
import { useAllPlanProgress } from "@/lib/plan-progress";
import { getThemePlans } from "@/lib/content";
import { YEAR_PLAN_SLUG, YEAR_PLAN_DAYS } from "@/lib/year-plan";
import { gradeFor, type Activity } from "@/lib/grades";
import { ACCENTS, type AccentKey, useProfileAccent } from "@/lib/profile-accent";
import { siteConfig } from "@/config/site";

/** Couleur du cadre d'avatar selon le grade (bronze → argent → or). */
function gradeRing(gradeName: string): string {
  if (gradeName.includes("Sentinelle")) return "linear-gradient(135deg,#FFD86B,#C9971F)";
  if (gradeName.includes("Guerrier")) return "linear-gradient(135deg,#E3E7EE,#9AA3B2)";
  return "linear-gradient(135deg,#E2A66B,#A86A33)";
}

export function ProfileView() {
  const { ready, userId, email, profile, refreshProfile } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <section className="container-x py-16">
        <div className="glass-strong mx-auto max-w-xl p-8 text-center">
          <p className="font-display text-xl font-bold">Profil bientôt disponible</p>
          <p className="mt-2 text-night-900/65">La connexion n'est pas encore activée.</p>
        </div>
      </section>
    );
  }

  if (!ready) return <p className="container-x py-16 text-night-900/50">Chargement…</p>;

  if (!userId) {
    return (
      <section className="container-x pb-12 pt-24 sm:pt-32">
        <ProfileSignIn />
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-night-900/55">
          Tu peux aussi continuer à utiliser l'app sans compte ,{" "}
          <Link href="/communaute" className="font-semibold text-dawn-300 hover:underline">
            découvrir la communauté
          </Link>
.
        </p>
      </section>
    );
  }

  return (
    <Profile
      userId={userId}
      email={email}
      profile={profile}
      refreshProfile={refreshProfile}
    />
  );
}

function Profile({
  userId,
  email,
  profile,
  refreshProfile,
}: {
  userId: string;
  email: string | null;
  profile: {
    pseudo: string;
    avatar_url: string | null;
    bio?: string | null;
    favorite_verses?: FavoriteVerse[];
    verified?: boolean | null;
    is_moderator?: boolean | null;
    banner_url?: string | null;
    name_color?: string | null;
    church?: string | null;
    city?: string | null;
    country?: string | null;
    location_privacy?: "public" | "prive" | null;
    follows_privacy?: "public" | "prive" | null;
    life_phrase?: string | null;
    converted_at?: string | null;
    streak_days?: number | null;
    batisseur_depuis?: string | null;
  } | null;
  refreshProfile: () => void;
}) {
  const [myPrayers, setMyPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pseudoVal, setPseudoVal] = useState(profile?.pseudo?? "");
  const [avatarVal, setAvatarVal] = useState(profile?.avatar_url?? "");
  const [bioVal, setBioVal] = useState(profile?.bio?? "");
  const [verses, setVerses] = useState<FavoriteVerse[]>(profile?.favorite_verses?? []);
  const [churchVal, setChurchVal] = useState(profile?.church?? "");
  const [cityVal, setCityVal] = useState(profile?.city?? "");
  const [countryVal, setCountryVal] = useState(profile?.country?? "");
  const [locPrivVal, setLocPrivVal] = useState<"public" | "prive">(profile?.location_privacy === "prive"? "prive": "public");
  const [followsPrivVal, setFollowsPrivVal] = useState<"public" | "prive">(profile?.follows_privacy === "prive"? "prive": "public");
  const [phraseVal, setPhraseVal] = useState(profile?.life_phrase?? "");
  const [convertedVal, setConvertedVal] = useState(profile?.converted_at?? "");
  const [bannerVal, setBannerVal] = useState(profile?.banner_url?? "");
  const [nameColorVal, setNameColorVal] = useState(profile?.name_color?? "");
  const [bannerBusy, setBannerBusy] = useState(false);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [postCount, setPostCount] = useState(0);
  useEffect(() => {
    countUserPosts(userId).then(setPostCount);
  }, [userId]);
  const [activity, setActivity] = useState<Activity>({ prayers: 0, comments: 0, prays: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pseudoError, setPseudoError] = useState("");
  const [editing, setEditing] = useState(false);
  const [followModal, setFollowModal] = useState<null | "followers" | "following">(null);
  // Le profil est d'abord un MUR (réseau social) ; les outils personnels
  // (carnet, plans, liste de prière…) vivent dans « Mon espace ».
  const [view, setView] = useState<"mur" | "espace">("mur");
  // Écran Paramètres (notifications par type, sons, rappel, compte, termes).
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const notes = useNotebook();
  const eng = useEngagement();
  const planProgress = useAllPlanProgress();

  const { accent, setAccent } = useProfileAccent();
  const { jour, toggle: toggleTheme } = useProfileTheme();

  async function shareProfile() {
    const url = `${siteConfig.url}/membre?u=${userId}`;
    try {
      const nav = navigator as Navigator & {
        share?: (d: { title?: string; text?: string; url?: string }) => Promise<void>;
      };
      if (nav.share) {
        await nav.share({
          title: "Mon profil RHEMA",
          text: "Rejoins-moi sur l'application RHEMA – Bible & Prière",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* partage annulé */
    }
  }
  const activePlans = Object.values(planProgress).filter((days) => days.length > 0).length;

  // Avancée détaillée de chaque plan en cours (titre + % + jours)
  const planMeta: Record<string, { title: string; total: number }> = {};
  for (const p of getThemePlans()) planMeta[p.slug] = { title: p.title, total: p.days.length };
  planMeta[YEAR_PLAN_SLUG] = { title: "La Bible en 1 an", total: YEAR_PLAN_DAYS };
  const myPlans = Object.entries(planProgress)
.filter(([, days]) => days.length > 0)
.map(([slug, days]) => {
      const meta = planMeta[slug]?? { title: slug, total: days.length };
      const done = days.length;
      return { slug, title: meta.title, done, total: meta.total,
        pct: meta.total? Math.min(100, Math.round((done / meta.total) * 100)): 0 };
    })
.sort((a, b) => b.pct - a.pct);

  const load = useCallback(async () => {
    setLoading(true);
    const [mp, c, act] = await Promise.all([
      listMyPrayers(userId),
      followCounts(userId),
      getActivity(userId),
    ]);
    setMyPrayers(mp);
    setCounts(c);
    setActivity(act);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPseudoVal(profile?.pseudo?? "");
    setAvatarVal(profile?.avatar_url?? "");
    setBioVal(profile?.bio?? "");
    setVerses(profile?.favorite_verses?? []);
    setChurchVal(profile?.church?? "");
    setCityVal(profile?.city?? "");
    setCountryVal(profile?.country?? "");
    setLocPrivVal(profile?.location_privacy === "prive"? "prive": "public");
    setFollowsPrivVal(profile?.follows_privacy === "prive"? "prive": "public");
    setPhraseVal(profile?.life_phrase?? "");
    setConvertedVal(profile?.converted_at?? "");
    setBannerVal(profile?.banner_url?? "");
    setNameColorVal(profile?.name_color?? "");
  }, [profile?.pseudo, profile?.avatar_url, profile?.bio, profile?.favorite_verses,
      profile?.church, profile?.city, profile?.country, profile?.location_privacy, profile?.follows_privacy,
      profile?.life_phrase, profile?.converted_at, profile?.banner_url, profile?.name_color]);

  /** Téléverse la bannière (même bucket que les avatars). */
  async function onPickBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBannerBusy(true);
    const url = await uploadAvatar(userId, file);
    setBannerBusy(false);
    if (url) {
      setBannerVal(url);
      await updateProfile(userId, { banner_url: url });
      refreshProfile();
    }
  }

  // Raccourcis « caméra » de l'en-tête : changer la photo ou la couverture
  // en deux taps, sans passer par le formulaire d'édition.
  const quickBannerRef = useRef<HTMLInputElement>(null);
  const quickAvatarRef = useRef<HTMLInputElement>(null);
  const [quickBusy, setQuickBusy] = useState<null | "banner" | "avatar">(null);
  async function quickUpload(kind: "banner" | "avatar", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setQuickBusy(kind);
    const url = await uploadAvatar(userId, file);
    if (url) {
      await updateProfile(userId, kind === "banner" ? { banner_url: url } : { avatar_url: url });
      if (kind === "banner") setBannerVal(url);
      else setAvatarVal(url);
      refreshProfile();
    }
    setQuickBusy(null);
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Choisis une image (jpg, png…).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image trop lourde (5 Mo max).");
      return;
    }
    setUploadError("");
    setUploading(true);
    const url = await uploadAvatar(userId, file);
    if (url) {
      setAvatarVal(url);
      await updateProfile(userId, { avatar_url: url });
      refreshProfile();
    } else {
      setUploadError("Échec du téléversement. Réessaie.");
    }
    setUploading(false);
  }

  function updateVerse(i: number, patch: Partial<FavoriteVerse>) {
    setVerses((prev) => prev.map((v, idx) => (idx === i? {...v,...patch }: v)));
  }
  function addVerse() {
    setVerses((prev) => [...prev, { reference: "", text: "" }]);
  }
  function removeVerse(i: number) {
    setVerses((prev) => prev.filter((_, idx) => idx!== i));
  }

  async function save() {
    setSaving(true);
    const newPseudo = pseudoVal.trim() || "Ami(e)";
    if (isReservedPseudo(newPseudo) &&!isAdminEmail(email)) {
      setPseudoError("Ce pseudo est réservé à Pasteur Jack Brunet.");
      setSaving(false);
      return;
    }
    if (await isPseudoTaken(newPseudo, userId)) {
      setPseudoError("Ce pseudo est déjà pris, choisis-en un autre.");
      setSaving(false);
      return;
    }
    setPseudoError("");
    const cleanVerses = verses
.map((v) => ({ reference: v.reference.trim(), text: v.text.trim() }))
.filter((v) => v.text || v.reference);
    await updateProfile(userId, {
      pseudo: pseudoVal.trim() || "Ami(e)",
      avatar_url: avatarVal.trim() || null,
      bio: bioVal.trim() || null,
      favorite_verses: cleanVerses,
      church: churchVal.trim() || null,
      city: cityVal.trim() || null,
      country: countryVal.trim() || null,
      location_privacy: locPrivVal,
      follows_privacy: followsPrivVal,
      life_phrase: phraseVal.trim() || null,
      converted_at: convertedVal || null,
      banner_url: bannerVal.trim() || null,
      name_color: nameColorVal || null,
    });
    setVerses(cleanVerses);
    refreshProfile();
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className={jour? "bg-cream pb-8 text-night-900": "bg-night-950 pb-8 text-cream"}>
      <ProfileThemeBg jour={jour} />
      {/* ---- En-tête façon page Facebook : bannière, avatar rond sur carte,
           nom + certification, compteurs en ligne, badges ---- */}
      <div className={jour? "bg-cream text-night-900": "dark-ctx bg-night-950 text-cream"}>
        {/* Bannière : format horizontal façon couverture Facebook */}
        <div className="relative h-44 w-full overflow-hidden sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile?.banner_url || profile?.avatar_url || asset("/img/profil-defaut.webp")}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-night-950/25 via-transparent to-night-950/30" />
          {/* Changer la couverture en deux taps */}
          <input ref={quickBannerRef} type="file" accept="image/*" className="hidden" onChange={(e) => quickUpload("banner", e)} />
          <button
            type="button"
            onClick={() => quickBannerRef.current?.click()}
            disabled={quickBusy === "banner"}
            aria-label="Changer la couverture"
            className="absolute right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-10 grid h-9 w-9 place-items-center rounded-full bg-night-950/70 text-cream ring-1 ring-white/25 backdrop-blur disabled:animate-pulse"
          >
            <CameraGlyphe />
          </button>
        </div>

        {/* La carte remonte à peine : la couverture reste bien visible */}
        <div className={`relative -mt-3 rounded-t-3xl px-5 pb-3 text-center ${jour? "bg-cream": "rounded-b-3xl bg-night-900 shadow-[0_-1px_0_rgba(255,255,255,0.14)]"}`}>
          <div className="relative mx-auto -mt-10 h-24 w-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile?.avatar_url || asset("/img/profil-defaut.webp")}
              alt=""
              className={`h-24 w-24 rounded-full object-cover ring-4 ${jour? "ring-cream": "ring-night-900"}`}
            />
            {/* Changer la photo de profil en deux taps */}
            <input ref={quickAvatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => quickUpload("avatar", e)} />
            <button
              type="button"
              onClick={() => quickAvatarRef.current?.click()}
              disabled={quickBusy === "avatar"}
              aria-label="Changer la photo de profil"
              className={`absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center rounded-full disabled:animate-pulse ${jour? "bg-white text-night-900 shadow-card": "bg-night-950 text-cream ring-1 ring-white/25"}`}
            >
              <CameraGlyphe small />
            </button>
          </div>

          <h2
            className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight"
            style={profile?.name_color? { color: profile.name_color }: undefined}
          >
            {profile?.pseudo?? "Ami(e)"}
            {profile?.verified || isAdminEmail(email)? (
              <VerifiedBadge className="ml-2 inline-block h-7 w-7 align-middle" />
            ): null}
          </h2>
          {profile?.batisseur_depuis ? <BatisseurBadge className="mt-2" /> : null}
          {/* Espace Bâtisseurs : le Zoom mensuel (Bâtisseurs et admin) */}
          {profile?.batisseur_depuis || isAdminEmail(email) ? (
            <div className="mx-auto max-w-md text-left">
              <ZoomBatisseursCard />
            </div>
          ) : null}
          {profile?.life_phrase? (
            <p className={`mt-1 text-sm italic ${jour? "text-dawn-600": "text-dawn-300"}`}>{profile.life_phrase}</p>
          ): null}

          {/* Compteurs en ligne, comme une page : abonnés · abonnements · publications */}
          <p className={`mt-2 flex flex-wrap items-center justify-center gap-x-1.5 text-sm ${jour? "text-night-900/70": "text-cream/70"}`}>
            <button type="button" onClick={() => setFollowModal("followers")}>
              <span className={`font-display font-extrabold ${jour? "text-night-900": "text-cream"}`}>{counts.followers}</span> abonnés
            </button>
            <span aria-hidden>·</span>
            <button type="button" onClick={() => setFollowModal("following")}>
              <span className={`font-display font-extrabold ${jour? "text-night-900": "text-cream"}`}>{counts.following}</span> abonnements
            </button>
            <span aria-hidden>·</span>
            <span>
              <span className={`font-display font-extrabold ${jour? "text-night-900": "text-cream"}`}>{postCount}</span> publications
            </span>
          </p>

          {/* Badges : ancienneté avec Jésus, série, médaillons de trophées */}
          {withJesusLabel(profile?.converted_at) || (profile?.streak_days ?? 0) >= STREAK_BADGE_MIN ? (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              {withJesusLabel(profile?.converted_at) ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${jour? "bg-dawn-500/15 text-dawn-600": "bg-dawn-400/15 text-dawn-300"}`}>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M12 3v18M7 8h10" />
                  </svg>
                  {withJesusLabel(profile?.converted_at)}
                </span>
              ) : null}
              {(profile?.streak_days ?? 0) >= STREAK_BADGE_MIN ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${jour? "bg-orange-500/15 text-orange-600": "bg-orange-400/15 text-orange-300"}`}>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z" />
                  </svg>
                  Série de {profile?.streak_days} jours
                </span>
              ) : null}
            </div>
          ) : null}
          {/* Badge + grade : une seule ligne compacte et homogène */}
          <div className="mt-2.5 flex items-center justify-center gap-3">
            <ProfileBadgesRow userId={userId} streakDays={profile?.streak_days} self single />
            {(() => {
              const g = gradeFor(activity);
              const pct = g.next? Math.min(100, Math.round((g.points / g.next.min) * 100)): 100;
              return (
                <div
                  className="text-left"
                  title={g.next? `Plus que ${g.toNext} pts → ${g.next.name}`: "Grade maximal"}
                >
                  <p className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.15em] ${jour? "text-night-900/50": "text-cream/50"}`}>
                    {g.grade.name} · {g.points} pts
                  </p>
                  <div className={`mt-1.5 h-1 w-36 overflow-hidden rounded-full ${jour? "bg-night-900/10": "bg-white/10"}`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-dawn-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}
          </div>

          {profile?.bio &&
          profile.bio.trim().toLowerCase()!== (profile?.pseudo?? "").trim().toLowerCase()? (
            <p className={`mx-auto mt-3 max-w-md text-sm leading-relaxed ${jour? "text-night-900/80": "text-cream/80"}`}>
              {profile.bio}
            </p>
          ): null}
          <ProfileInfoPills
            church={profile?.church}
            city={profile?.city}
            country={profile?.country}
            show
            centered
            light={jour}
          />
          {(profile?.favorite_verses?? []).slice(0, 1).map((v, i) => (
            <p key={i} className={`mx-auto mt-2 max-w-md text-sm italic ${jour? "text-night-900/70": "text-cream/70"}`}>
              «&nbsp;{v.text}&nbsp;»{" "}
              {v.reference? (
                <span className={`font-semibold not-italic ${jour? "text-dawn-600": "text-dawn-200"}`}>{v.reference}</span>
              ): null}
            </p>
          ))}

          <div className="mx-auto mt-4 flex max-w-md items-center gap-2">
            <button
              type="button"
              onClick={() => {
                // Le formulaire d'édition vit dans « Mon espace ».
                setEditing((e) => !e);
                setView(editing ? "mur" : "espace");
              }}
              className={`flex-1 rounded-full py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 ${jour? "bg-night-900 text-cream": "bg-cream text-night-950"}`}
            >
              {editing? "Fermer": "Modifier le profil"}
            </button>
            <button
              type="button"
              onClick={shareProfile}
              aria-label="Partager mon profil"
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border ${jour? "border-night-900/15 bg-night-900/5 text-night-900": "border-white/15 bg-white/10 text-cream"}`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${jour? "profile-jour-scope": "profile-dark"} container-x relative mt-2`}>
      {/* Recherche / Messages / Notifications — rangée sobre, sans carte.
          Les badges de récompense se glissent discrètement à gauche. */}
      <div className={`relative flex items-center justify-end gap-2 ${jour? "": "dark-ctx"}`}>
          <span className="mr-auto" />
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Rechercher des profils"
              onClick={() =>
                document.getElementById("trouver-profils")?.scrollIntoView({ behavior: "smooth" })
              }
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-cream transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
            </button>
            {/* Messagerie privée */}
            <MessagesButton tone="dark" />
            {/* Cloche: s'allume quand on interagit avec tes sujets de prière */}
            <NotificationsBell userId={userId} tone="dark" />
            <ProfileThemeToggle jour={jour} onToggle={toggleTheme} />
            {/* Mon espace : carnet, plans, liste de prière, badges, compte… */}
            <button
              type="button"
              onClick={() => setView((v) => (v === "espace" ? "mur" : "espace"))}
              aria-label="Mon espace (carnet, plans, prière…)"
              aria-pressed={view === "espace"}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${
                view === "espace"
                  ? "border-dawn-400 bg-dawn-400 text-night-950"
                  : "border-white/20 bg-white/10 text-cream hover:bg-white/20"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                <rect x="4" y="4" width="7" height="7" rx="2" />
                <rect x="13" y="4" width="7" height="7" rx="2" />
                <rect x="4" y="13" width="7" height="7" rx="2" />
                <rect x="13" y="13" width="7" height="7" rx="2" />
              </svg>
            </button>
            {/* Paramètres : notifications par type, sons, rappel, compte */}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Paramètres"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-cream transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7} aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.07-.4.1-.8.1-1.2z" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
      </div>

      {view === "mur" ? (
        <div className="mt-3">
          {/* Stories 24 h : ma story + celles des amis */}
          <StoriesBar me={userId} myProfile={profile ? { id: userId, ...profile } : null} dark={!jour} />
          {/* Suggestions pour toi : juste avant le mur, en rotation permanente */}
          <div className="mb-4">
            <p className={`mb-2 text-[11px] font-black uppercase tracking-[0.18em] ${jour ? "text-night-900/45" : "text-cream/45"}`}>
              Suggestions pour toi
            </p>
            <MemberSuggestions compact dark={!jour} />
          </div>
          <WallSection
            me={userId}
            myProfile={profile ? { id: userId, ...profile } : null}
            isModerator={Boolean(profile?.is_moderator) || isAdminEmail(email)}
            dark={!jour}
          />
        </div>
      ) : (
        <>
      {/* Retour au mur depuis Mon espace */}
      <button
        type="button"
        onClick={() => setView("mur")}
        className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${jour ? "border-night-900/15 text-night-900/75" : "border-white/15 text-cream/75"}`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Retour au profil
      </button>
      {editing? (
        <div className={`glass-strong mt-4 p-6 sm:p-8 ${jour? "": "dark-ctx text-cream"}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
              Pseudo
            </span>
            <input
              value={pseudoVal}
              onChange={(e) => {
                setPseudoVal(e.target.value);
                if (pseudoError) setPseudoError("");
              }}
              placeholder="Ton pseudo"
              className="field mt-1 w-full"
            />
            {pseudoError? <p className="field-error mt-1">{pseudoError}</p>: null}
          </label>
          <div className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
              Photo de profil
            </span>
            <div className="mt-1 flex items-center gap-3">
              <Avatar pseudo={pseudoVal || profile?.pseudo} url={avatarVal || profile?.avatar_url} size={48} />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-ghost text-sm disabled:opacity-40"
              >
                {uploading? "Envoi…": "Choisir une photo"}
              </button>
            </div>
            {uploadError? <p className="field-error mt-1">{uploadError}</p>: null}
          </div>
        </div>

        {/* Bannière du profil (grande image plein écran) */}
        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Bannière du profil
          </span>
          <div className="mt-2 flex items-center gap-3">
            <div
              className="h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url(${bannerVal || asset("/img/profil-defaut.webp")})` }}
            />
            <input
              ref={bannerRef}
              type="file"
              accept="image/*"
              onChange={onPickBanner}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => bannerRef.current?.click()}
              disabled={bannerBusy}
              className="btn-ghost text-sm disabled:opacity-50"
            >
              {bannerBusy? "Envoi…": "Changer la bannière"}
            </button>
            {bannerVal? (
              <button
                type="button"
                onClick={() => setBannerVal("")}
                className="text-sm text-cream/45 hover:text-cream/80"
              >
                Retirer
              </button>
            ): null}
          </div>
          <p className="field-note mt-1">Grande photo affichée en haut de ton profil (paysage de préférence).</p>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Bio
          </span>
          <textarea
            value={bioVal}
            onChange={(e) => setBioVal(e.target.value)}
            rows={3}
            placeholder="Ex. Marié, papa de 3 enfants • Bordeaux"
            className="field mt-1 w-full resize-y"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Ta phrase (facultatif)
          </span>
          <input
            value={phraseVal}
            onChange={(e) => setPhraseVal(e.target.value)}
            placeholder="Ex. Jésus a changé ma vie en 2019"
            className="field mt-1 w-full"
          />
        </label>

        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Couleur de ton nom (sur ta photo)
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {[
              ["", "Crème (défaut)"],
              ["#CAF000", "Lime"],
              ["#FFD86B", "Or"],
              ["#38BDF8", "Ciel"],
              ["#FB7185", "Rose"],
              ["#171716", "Noir"],
            ].map(([c, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => setNameColorVal(c)}
                aria-label={label}
                title={label}
                className={`h-9 w-9 rounded-full border-2 ${
                  nameColorVal === c? "border-dawn-400": "border-white/20"
                }`}
                style={{ background: c || "#F3F3ED" }}
              />
            ))}
          </div>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Ton église (facultatif)
          </span>
          <input
            value={churchVal}
            onChange={(e) => setChurchVal(e.target.value)}
            placeholder="Ex. Église Vie Nouvelle, Bordeaux"
            className="field mt-1 w-full"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Ta rencontre avec Jésus (facultatif)
          </span>
          <input
            type="date"
            value={convertedVal}
            onChange={(e) => setConvertedVal(e.target.value)}
            className="field mt-1 w-full"
          />
          <span className="mt-1 block text-[11px] text-cream/40">
            {withJesusLabel(convertedVal)
              ? <>Ton profil affichera « {withJesusLabel(convertedVal)} ».</>
              : "La date de ta conversion — ton profil affichera « X ans avec Jésus »."}
          </span>
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
              Ville (facultatif)
            </span>
            <input
              value={cityVal}
              onChange={(e) => setCityVal(e.target.value)}
              placeholder="Ex. Bordeaux"
              className="field mt-1 w-full"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
              Pays (facultatif)
            </span>
            <input
              value={countryVal}
              onChange={(e) => setCountryVal(e.target.value)}
              placeholder="Ex. France"
              className="field mt-1 w-full"
            />
          </label>
        </div>

        <div className="mt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Qui peut voir ta ville / ton pays ?
          </span>
          <div className="mt-2 flex gap-2">
            {([
              ["public", "Tout le monde"],
              ["prive", "Seulement moi"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setLocPrivVal(k)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  locPrivVal === k
                    ? "bg-cream text-night-950"
                    : "border border-white/15 bg-white/5 text-cream/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Qui peut voir tes abonnés / abonnements ?
          </span>
          <div className="mt-2 flex gap-2">
            {([
              ["public", "Tout le monde"],
              ["prive", "Seulement moi"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFollowsPrivVal(k)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  followsPrivVal === k
                    ? "bg-cream text-night-950"
                    : "border border-white/15 bg-white/5 text-cream/70"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Rappel quotidien « pensée du jour » (app native) : le réglage vit
            ici — sur la page du jour, la carte disparaît une fois activé. */}
        <div className="mt-5">
          <ReminderToggle />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
              Mes versets préférés
            </span>
            <button
              type="button"
              onClick={addVerse}
              className="text-sm font-semibold text-dawn-300 hover:underline"
            >
              + Ajouter un verset
            </button>
          </div>
          <div className="mt-2 space-y-3">
            {verses.length === 0? (
              <p className="text-sm text-cream/45">
                Ajoute les versets qui te portent, ils s'afficheront sur ton profil.
              </p>
            ): (
              verses.map((v, i) => (
                <div key={i} className="rounded-2xl border border-white/10 p-3">
                  <textarea
                    value={v.text}
                    onChange={(e) => updateVerse(i, { text: e.target.value })}
                    rows={2}
                    placeholder="Le texte du verset…"
                    className="field w-full resize-y text-sm"
                  />
                  <div className="mt-2 flex gap-2">
                    <input
                      value={v.reference}
                      onChange={(e) => updateVerse(i, { reference: e.target.value })}
                      placeholder="Référence (ex. Philippiens 4:13)"
                      className="field flex-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeVerse(i)}
                      className="shrink-0 text-sm text-cream/40 hover:text-cream/80"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Couleur d'accent du profil (bannière) */}
        <div className="mt-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Couleur du profil
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setAccent(k)}
                aria-label={ACCENTS[k].label}
                className={`h-8 w-8 rounded-full ring-2 ring-offset-2 transition ${
                  accent === k? "ring-night-900": "ring-transparent"
                }`}
                style={{ backgroundImage: `linear-gradient(120deg, ${ACCENTS[k].from}, ${ACCENTS[k].to})` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-40">
            {saving? "Enregistrement…": "Enregistrer"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
            Annuler
          </button>
          {saved? <span className="text-sm text-dawn-300">✓ Enregistré</span>: null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-sm">
          <Link href={`/membre?u=${userId}`} className="font-semibold text-dawn-300 hover:underline">
            Voir mon profil public
          </Link>
          <button type="button" onClick={() => signOut()} className="text-cream/50 hover:underline">
            Déconnexion
          </button>
          <button
            type="button"
            onClick={async () => {
              if (
!confirm(
                  "Supprimer définitivement ton compte et tes données? Cette action est irréversible.",
                )
              )
                return;
              const res = await deleteAccount();
              if (!res.ok)
                alert(
                  `La suppression a échoué${res.error ? ` (${res.error})` : ""}. Réessaie ou écris-nous.`,
                );
            }}
            className="text-red-600/70 hover:underline"
          >
            Supprimer mon compte
          </button>
        </div>
        </div>
      ): null}

      {/* Mes trophées : une seule entrée vers la vitrine complète. La rangée
          de médaillons devenait illisible à mesure que les badges s'ajoutaient. */}
      <div className="mt-4">
        <ProfileBadgesRow userId={userId} streakDays={profile?.streak_days} self bouton />
      </div>

      {/* Accès rapides: carnet + plans */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/carnet"
          className="flex items-center gap-2.5 rounded-2xl border border-dawn-400/45 bg-gradient-to-br from-dawn-400/20 to-dawn-300/5 px-4 py-3 transition-shadow hover:shadow-md"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-night-900 text-dawn-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7}>
              <path d="M5 4h11l3 3v13H5zM15 4v4h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-sm font-bold text-cream">Mon carnet</span>
        </Link>
        <Link
          href="/plans"
          className="flex items-center gap-2.5 rounded-2xl border border-spirit-500/45 bg-gradient-to-br from-spirit-500/20 to-spirit-700/10 px-4 py-3 transition-shadow hover:shadow-md"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-night-900 text-dawn-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7}>
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-sm font-bold text-cream">Mes plans</span>
        </Link>
      </div>

      {/* Annonces défilantes (RHEMA, exclusivités…) */}
      <div className="mt-4">
        <ProfileBanners />
      </div>

      {/* Badges débloqués */}
      {eng.ready && eng.best >= FIDELITY_REWARDS[0].days? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Badges débloqués
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FIDELITY_REWARDS.filter((r) => eng.best >= r.days).map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-dawn-400/40 bg-dawn-400/10 px-3 py-1 text-sm font-semibold text-cream"
              >
                <BadgeGlyph id={r.id} /> {r.days} jours
              </span>
            ))}
          </div>
        </div>
      ): null}

      {/* Trouver des profils à suivre */}
      <div id="trouver-profils" className="mt-6 scroll-mt-20">
        <h3 className="font-display text-lg font-bold">Trouver des profils</h3>
        <p className="mt-1 text-sm text-cream/65">
          Cherche un membre par pseudo et abonne-toi, comme sur un réseau social.
        </p>
        <div className="mt-3">
          <MemberSearch />
        </div>

        {/* Suggestions de contacts (intercesseurs) à suivre */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-cream/50">
            Suggestions pour toi
          </p>
          <div className="mt-3">
            <MemberSuggestions />
          </div>
        </div>
      </div>

      {/* Suivi (semaine), plans de lecture, sujets de prière */}
      <ProfileActivity />

      {/* Mon activité de prière */}
      <div className="mt-6">
        <h3 className="font-display text-lg font-bold">Mon activité</h3>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
            <p className="font-display text-xl font-extrabold text-cream">{activity.prayers}</p>
            <p className="text-xs text-cream/55">prières</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
            <p className="font-display text-xl font-extrabold text-cream">{activity.prays}</p>
            <p className="text-xs text-cream/55">je prie</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
            <p className="font-display text-xl font-extrabold text-cream">{activity.comments}</p>
            <p className="text-xs text-cream/55">encouragements</p>
          </div>
        </div>
      </div>

      {/* À propos + soutien */}
      <div className="mt-8">
        <div>
          {/* À propos, carte sombre premium */}
          <Link
            href="/a-propos"
            className="keep-dark group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-spirit-700 to-night-900 p-5 text-cream shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-dawn-400/20 blur-2xl"
            />
            <div className="relative flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-dawn-400 text-night-900 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-cream/50 transition-transform group-hover:translate-x-0.5 group-hover:text-dawn-300">→</span>
            </div>
            <p className="relative mt-4 font-display text-base font-extrabold">À propos</p>
            <p className="relative mt-0.5 text-sm text-cream/70">
              Découvre Jack, sa vision & son histoire.
            </p>
          </Link>
        </div>
        {/* Soutenir : appel au cœur, bien visible */}
        <Link
          href="/don"
          className="group mt-4 flex items-center gap-4 rounded-3xl bg-dawn-400 p-5 text-night-950 shadow-glow transition-all hover:-translate-y-0.5 hover:bg-dawn-300"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-night-950 text-dawn-400">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.8}>
              <path
                d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6.6 5.5 5.5 0 0 1 21.5 12c-2.5 4.5-9.5 9-9.5 9z"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-extrabold leading-tight">
              Soutiens cette application
            </span>
            <span className="mt-0.5 block text-sm font-semibold text-night-950/70">
              Ton don fait vivre RHEMA et les projets de Jack.
            </span>
          </span>
          <span className="shrink-0 text-2xl transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* Ma liste de prière (mes sujets, privés ou partagés) */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Ma liste de prière</h3>
        <p className="mt-1 text-sm text-cream/55">
          Les sujets que tu portes devant Dieu. Coche-les quand Il agit : ils passent en
          « Exaucé ».
        </p>
        <PrayerListQuickAdd userId={userId} onAdded={load} />
        {loading? (
          <p className="mt-3 text-cream/50">Chargement…</p>
        ): myPrayers.length === 0? (
          <p className="mt-3 text-cream/55">
            Ta liste est vide : ajoute ton premier sujet ci-dessus, ou{" "}
            <Link href="/communaute" className="font-semibold text-dawn-300 hover:underline">
              partage-le sur le mur
            </Link>
            .
          </p>
        ): (
          <ul className="mt-3 space-y-3">
            {myPrayers.map((p) => (
              <li key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-cream/85">
                  {p.body}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-cream/45">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")} ·{" "}
                    {p.visibility === "public"
? "Public"
: p.visibility === "friends"
? "Abonnés"
: "Privé"}
                    {p.answered? " · Exaucé": ""}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await setPrayerAnswered(p.id, !p.answered);
                      load();
                    }}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                      p.answered
? "bg-dawn-400/20 text-dawn-700"
: "border border-white/15 text-cream/65 hover:border-dawn-500 hover:text-dawn-700"
                    }`}
                  >
                    {p.answered? "✓ Exaucé": "Exaucé ?"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Avancée de mes plans */}
      {myPlans.length > 0? (
        <div className="mt-8">
          <h3 className="font-display text-lg font-bold">Mes plans en cours</h3>
          <div className="mt-3 space-y-3">
            {myPlans.map((p) => (
              <Link
                key={p.slug}
                href={p.slug === YEAR_PLAN_SLUG? "/bible-1-an": `/plans/${p.slug}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition-shadow hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display font-bold">{p.title}</p>
                  <span className="shrink-0 text-sm font-semibold text-cream">{p.pct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-night-900/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-cream/55">
                  {p.done} / {p.total} jours
                </p>
              </Link>
            ))}
          </div>
        </div>
      ): null}

      {/* La chaîne WhatsApp : le rendez-vous quotidien hors de l'app */}
      <div className="mt-8">
        <WhatsAppCard />
      </div>

      {isAdminEmail(email)? (
        <div className="mt-8">
          <Link
            href="/admin"
            className="keep-dark group flex items-center justify-between gap-4 rounded-3xl border border-dawn-400/40 bg-gradient-to-br from-spirit-700 to-night-900 p-5 text-cream transition-transform hover:-translate-y-0.5"
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-dawn-300">
                Réservé
              </span>
              <p className="mt-1 font-display text-lg font-extrabold">Espace admin</p>
              <p className="mt-0.5 text-sm text-cream/70">
                Stats, annonces, notifications & podcasts.
              </p>
            </div>
            <span className="shrink-0 text-2xl transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      ): null}

      {/* File de modération (admin + modérateurs) — tout en bas du profil */}
      {isAdminEmail(email) || profile?.is_moderator? <ModerationQueue /> : null}

      {/* Gestion du compte: déconnexion + suppression (exigence App Store) */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => signOut()}
          className="text-sm font-semibold text-cream/50 hover:underline"
        >
          Déconnexion
        </button>
        <DeleteAccountButton />
        <BootDiagnostic />
      </div>

      </>
      )}

      {followModal? (
        <FollowList
          userId={userId}
          mode={followModal}
          onClose={() => setFollowModal(null)}
          onChange={load}
        />
      ): null}

      {settingsOpen ? <ProfileSettings userId={userId} onClose={() => setSettingsOpen(false)} /> : null}
      </div>
    </section>
  );
}

/** Icône maison du badge de fidélité selon le palier. */
function BadgeGlyph({ id }: { id: string }) {
  if (id === "d7") return <FlameGlyph className="h-4 w-4" />;
  if (id === "d30") return <StarGlyph className="h-4 w-4" />;
  return <GiftGlyph className="h-4 w-4" />;
}

/** Petite icône appareil photo en trait (raccourcis photo/couverture). */
function CameraGlyphe({ small = false }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`${small ? "h-4 w-4" : "h-5 w-5"} fill-none stroke-current`} strokeWidth={1.9} aria-hidden>
      <path d="M4 8.5a2 2 0 0 1 2-2h1.6l1.2-1.8a1 1 0 0 1 .9-.5h4.6a1 1 0 0 1 .9.5l1.2 1.8H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" strokeLinejoin="round" />
      <circle cx="12" cy="12.6" r="3.2" />
    </svg>
  );
}
