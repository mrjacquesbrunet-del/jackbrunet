"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { asset } from "@/lib/asset";
import { Avatar } from "@/components/community/Avatar";
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
import { MyFavorites } from "@/components/profile/MyFavorites";
import { AnsweredFeed } from "@/components/community/AnsweredFeed";
import { MemberSearch } from "@/components/community/MemberSearch";
import { MemberSuggestions } from "@/components/community/MemberSuggestions";
import { ProfileActivity } from "@/components/community/ProfileActivity";
import { ModerationQueue } from "@/components/community/ModerationQueue";
import { NotificationsBell } from "@/components/community/NotificationsBell";
import { MessagesButton } from "@/components/community/MessagesButton";
import { DeleteAccountButton } from "@/components/community/DeleteAccountButton";
import { BootDiagnostic } from "@/components/app/BootDiagnostic";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { ModeratorBadge } from "@/components/community/ModeratorBadge";
import { FollowList } from "@/components/community/FollowList";
import { ProfileBanners } from "@/components/community/ProfileBanners";
import { ProfileInfoPills } from "@/components/community/ProfileInfoPills";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
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
    life_phrase?: string | null;
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
  const [phraseVal, setPhraseVal] = useState(profile?.life_phrase?? "");
  const [bannerVal, setBannerVal] = useState(profile?.banner_url?? "");
  const [nameColorVal, setNameColorVal] = useState(profile?.name_color?? "");
  const [bannerBusy, setBannerBusy] = useState(false);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [activity, setActivity] = useState<Activity>({ prayers: 0, comments: 0, prays: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pseudoError, setPseudoError] = useState("");
  const [editing, setEditing] = useState(false);
  const [followModal, setFollowModal] = useState<null | "followers" | "following">(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const notes = useNotebook();
  const eng = useEngagement();
  const planProgress = useAllPlanProgress();

  const { accent, setAccent } = useProfileAccent();

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
    setPhraseVal(profile?.life_phrase?? "");
    setBannerVal(profile?.banner_url?? "");
    setNameColorVal(profile?.name_color?? "");
  }, [profile?.pseudo, profile?.avatar_url, profile?.bio, profile?.favorite_verses,
      profile?.church, profile?.city, profile?.country, profile?.location_privacy,
      profile?.life_phrase, profile?.banner_url, profile?.name_color]);

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
      life_phrase: phraseVal.trim() || null,
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
    <section className="bg-night-950 pb-8 text-cream">
      <PlansDarkBg />
      {/* ---- Bloc total : la photo fond dans le flou sombre, le texte vient dessus ---- */}
      <div className="dark-ctx relative h-[calc(100svh-7.5rem-env(safe-area-inset-bottom))] min-h-[580px] w-full overflow-hidden bg-night-950">
        {/* Fond : la même photo floutée remplit l'écran… */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile?.banner_url || profile?.avatar_url || asset("/img/profil-defaut.webp")}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
        />
        {/* …et la photo s'affiche ENTIÈRE par-dessus (pas de recadrage). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile?.banner_url || profile?.avatar_url || asset("/img/profil-defaut.webp")}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-contain"
        />
        {/* Flou progressif : la photo reste nette en haut et fond en bas */}
        <div
          className="absolute inset-0 backdrop-blur-2xl"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent 48%, black 72%)",
            maskImage: "linear-gradient(to bottom, transparent 48%, black 72%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/25 via-transparent to-night-950" />

        {/* Progression du grade : fine barre design en haut de la photo */}
        {(() => {
          const g = gradeFor(activity);
          const pct = g.next? Math.min(100, Math.round((g.points / g.next.min) * 100)): 100;
          return (
            <div
              className="absolute inset-x-4 top-[calc(env(safe-area-inset-top)+0.5rem)] h-1 overflow-hidden rounded-full bg-white/15"
              title={g.next? `Plus que ${g.toNext} pts → ${g.next.name}`: "Grade maximal"}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-dawn-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          );
        })()}
        <span
          className="absolute left-4 top-[calc(env(safe-area-inset-top)+1.4rem)] rounded-full px-3 py-1 text-[11px] font-bold text-night-950"
          style={{ background: gradeRing(gradeFor(activity).grade.name) }}
        >
          {gradeFor(activity).grade.name} · {gradeFor(activity).points} pts
        </span>

        {/* Contenu posé directement sur la photo (réf. Olivia Beits) */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-center">
          <h2
            className="text-balance font-display text-3xl font-extrabold leading-tight text-cream sm:text-4xl"
            style={profile?.name_color? { color: profile.name_color }: undefined}
          >
            {profile?.pseudo?? "Ami(e)"}
            {profile?.verified || isAdminEmail(email)? (
              <VerifiedBadge className="ml-2 inline-block h-7 w-7 align-middle" />
            ): null}
          </h2>
          {profile?.life_phrase? (
            <p className="mt-1 text-sm italic text-dawn-300">{profile.life_phrase}</p>
          ): null}

          <div className="mx-auto mt-5 flex max-w-md items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing((e) =>!e)}
              className="flex-1 rounded-full bg-cream py-3 text-sm font-bold text-night-950 transition-transform hover:-translate-y-0.5"
            >
              {editing? "Fermer": "Modifier le profil"}
            </button>
            <button
              type="button"
              onClick={shareProfile}
              aria-label="Partager mon profil"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-cream backdrop-blur"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-2">
            <button type="button" onClick={() => setFollowModal("followers")}>
              <p className="font-display text-2xl font-extrabold text-cream">{counts.followers}</p>
              <p className="text-[11px] text-cream/55">Abonnés</p>
            </button>
            <button type="button" onClick={() => setFollowModal("following")}>
              <p className="font-display text-2xl font-extrabold text-cream">{counts.following}</p>
              <p className="text-[11px] text-cream/55">Abonnements</p>
            </button>
            <div>
              <p className="flex items-center justify-center gap-1 font-display text-2xl font-extrabold text-dawn-300">
                <FlameGlyph className="h-5 w-5" />
                {eng.ready? eng.streak: 0}
              </p>
              <p className="text-[11px] text-cream/55">Série</p>
            </div>
          </div>

          {profile?.bio &&
          profile.bio.trim().toLowerCase()!== (profile?.pseudo?? "").trim().toLowerCase()? (
            <p className="mx-auto mt-4 max-w-md rounded-2xl bg-white/[0.07] px-4 py-3 text-sm leading-relaxed text-cream/85 backdrop-blur">
              {profile.bio}
            </p>
          ): null}
          <ProfileInfoPills
            church={profile?.church}
            city={profile?.city}
            country={profile?.country}
            show
            centered
          />
          {(profile?.favorite_verses?? []).slice(0, 1).map((v, i) => (
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
      <div className="dark-ctx bg-topo-dark relative rounded-4xl border border-white/10 p-6 shadow-card sm:p-8">
        {/* Actions: Modifier / Partager / Rechercher / Messages / Cloche.
            flex-wrap: sur mobile les icônes passent à la ligne suivante au lieu
            de déborder hors de la carte (cloche coupée). */}
        <div className="relative mt-4 flex flex-wrap items-center justify-end gap-2">
          {/* Icônes groupées: recherche, messages, notifications */}
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
          </div>
        </div>
      </div>

      {editing? (
        <div className="dark-ctx glass-strong mt-4 p-6 text-cream sm:p-8">
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

      {/* File de modération (admin + modérateurs) */}
      {isAdminEmail(email) || profile?.is_moderator? <ModerationQueue /> : null}

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

      {/* Mon espace (carnet, plans, à propos) */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Mon espace</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {/* Mon carnet, accent lime */}
          <Link
            href="/carnet"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-dawn-400/40 bg-gradient-to-br from-dawn-400/20 via-dawn-300/[0.06] to-cream p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-night-900 text-dawn-400 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7}>
                  <path d="M5 4h11l3 3v13H5zM15 4v4h4M8.5 12h7M8.5 15.5h5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-cream/30 transition-transform group-hover:translate-x-0.5 group-hover:text-dawn-300">→</span>
            </div>
            <p className="mt-4 font-display text-base font-extrabold text-cream">Mon carnet</p>
            <p className="mt-0.5 text-sm text-cream/65">
              {notes.length} note{notes.length > 1? "s": ""} · prières & paroles reçues
            </p>
          </Link>

          {/* Mes plans, accent olive */}
          <Link
            href="/plans"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-spirit-500/35 bg-gradient-to-br from-spirit-500/18 via-spirit-400/[0.06] to-cream p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-night-900 text-dawn-400 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7}>
                  <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-cream/30 transition-transform group-hover:translate-x-0.5 group-hover:text-dawn-300">→</span>
            </div>
            <p className="mt-4 font-display text-base font-extrabold text-cream">Mes plans</p>
            <p className="mt-0.5 text-sm text-cream/65">
              {activePlans > 0
? `${activePlans} plan${activePlans > 1? "s": ""} en cours`
: "Démarrer un plan"}
            </p>
          </Link>

          {/* À propos, carte sombre premium */}
          <Link
            href="/a-propos"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-spirit-700 to-night-900 p-5 text-cream shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
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
        <p className="mt-3 text-xs text-cream/45">
          ✓ Carnet, versets et plans sont synchronisés sur ton compte: tu les retrouves
          sur tous tes appareils dès que tu te connectes.
        </p>
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

      {/* Mes favoris, regroupés directement dans le profil */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Mes favoris</h3>
        <MyFavorites />
      </div>

      {/* Prières exaucées, directement dans le profil */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Prières exaucées</h3>
        <AnsweredFeed />
      </div>

      {isAdminEmail(email)? (
        <div className="mt-8">
          <Link
            href="/admin"
            className="group flex items-center justify-between gap-4 rounded-3xl border border-dawn-400/40 bg-gradient-to-br from-spirit-700 to-night-900 p-5 text-cream transition-transform hover:-translate-y-0.5"
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

      {followModal? (
        <FollowList
          userId={userId}
          mode={followModal}
          onClose={() => setFollowModal(null)}
          onChange={load}
        />
      ): null}
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
