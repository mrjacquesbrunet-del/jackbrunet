"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import {
  signOut,
  deleteAccount,
  updateProfile,
  isPseudoTaken,
  isReservedPseudo,
  listMyPrayers,
  followCounts,
  getActivity,
  uploadAvatar,
  isAdminEmail,
  type Prayer,
  type FavoriteVerse,
} from "@/lib/community";
import { ProfileSignIn } from "@/components/community/ProfileSignIn";
import { MyFavorites } from "@/components/profile/MyFavorites";
import { AnsweredFeed } from "@/components/community/AnsweredFeed";
import { MemberSearch } from "@/components/community/MemberSearch";
import { MemberSuggestions } from "@/components/community/MemberSuggestions";
import { ProfileActivity } from "@/components/community/ProfileActivity";
import { NotificationsBell } from "@/components/community/NotificationsBell";
import { MessagesButton } from "@/components/community/MessagesButton";
import { DeleteAccountButton } from "@/components/community/DeleteAccountButton";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { ModeratorBadge } from "@/components/community/ModeratorBadge";
import { FollowList } from "@/components/community/FollowList";
import { ProfileBanners } from "@/components/community/ProfileBanners";
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
          <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
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
  } | null;
  refreshProfile: () => void;
}) {
  const [myPrayers, setMyPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pseudoVal, setPseudoVal] = useState(profile?.pseudo?? "");
  const [avatarVal, setAvatarVal] = useState(profile?.avatar_url?? "");
  const [bioVal, setBioVal] = useState(profile?.bio?? "");
  const [verses, setVerses] = useState<FavoriteVerse[]>(profile?.favorite_verses?? []);
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
          title: "Mon profil, Jack Brunet",
          text: "Rejoins-moi sur l'application Jack Brunet: Foi & Prière",
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
  }, [profile?.pseudo, profile?.avatar_url, profile?.bio, profile?.favorite_verses]);

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
    });
    setVerses(cleanVerses);
    refreshProfile();
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className="container-x pb-8 pt-24 sm:pt-32">
      {/* En-tête façon Instagram, sur olive sombre texturé.
          Pas d'overflow-hidden: sinon le panneau de notifications serait rogné. */}
      <div className="dark-ctx bg-topo-dark relative rounded-4xl border border-white/10 p-6 shadow-card sm:p-8">
        {/* Teinte de couleur personnalisable (bannière). Couche de décor clippée
            à part, pour ne pas rogner le panneau de notifications. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-4xl"
        >
          <div
            className="absolute inset-x-0 top-0 h-40 opacity-30"
            style={{
              backgroundImage: `linear-gradient(120deg, ${ACCENTS[accent].from}, ${ACCENTS[accent].to})`,
            }}
          />
          <div
            className="absolute -right-8 -top-10 h-44 w-44 rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: ACCENTS[accent].from }}
          />
        </div>
        {/* Jauge de grade de prière (compacte) */}
        {(() => {
          const g = gradeFor(activity);
          const pct = g.next? Math.min(100, Math.round((g.points / g.next.min) * 100)): 100;
          return (
            <div className="relative mb-4">
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
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundImage: `linear-gradient(90deg, ${ACCENTS[accent].from}, ${ACCENTS[accent].to})`,
                  }}
                />
              </div>
            </div>
          );
        })()}

        {/* Ligne avatar + stats (façon Instagram) */}
        <div className="relative flex items-end gap-5">
          <span
            className="shrink-0 rounded-full p-[3px]"
            style={{ background: gradeRing(gradeFor(activity).grade.name) }}
            title={gradeFor(activity).grade.name}
          >
            <span className="block rounded-full bg-night-900 p-[3px]">
              <Avatar pseudo={profile?.pseudo} url={profile?.avatar_url} size={84} />
            </span>
          </span>
          <div className="grid flex-1 grid-cols-3 gap-1 text-center">
            <button
              type="button"
              onClick={() => setFollowModal("followers")}
              className="rounded-xl py-1 transition-colors hover:bg-white/10"
            >
              <p className="font-display text-xl font-extrabold text-cream">{counts.followers}</p>
              <p className="text-[11px] text-cream/60">Abonnés</p>
            </button>
            <button
              type="button"
              onClick={() => setFollowModal("following")}
              className="rounded-xl py-1 transition-colors hover:bg-white/10"
            >
              <p className="font-display text-xl font-extrabold text-cream">{counts.following}</p>
              <p className="text-[11px] text-cream/60">Abonnements</p>
            </button>
            <div className="rounded-xl py-1">
              <p className="flex items-center justify-center gap-1 font-display text-xl font-extrabold text-dawn-300">
                <FlameGlyph className="h-4 w-4" />
                {eng.ready? eng.streak: 0}
              </p>
              <p className="text-[11px] text-cream/60">Série</p>
            </div>
          </div>
        </div>

        {/* Nom + grade + bio + versets (lecture seule) */}
        <div className="relative mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="flex items-center gap-1.5 font-display text-xl font-extrabold leading-tight text-cream">
              {profile?.pseudo?? "Ami(e)"}
              {profile?.verified || isAdminEmail(email)? (
                <VerifiedBadge className="h-5 w-5" />
              ): null}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-dawn-400/20 px-2.5 py-0.5 text-[11px] font-bold text-dawn-200">
              {gradeFor(activity).grade.name}
            </span>
            {profile?.is_moderator? <ModeratorBadge /> : null}
          </div>
          {profile?.bio? (
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-cream/80">
              {profile.bio}
            </p>
          ): null}
          {(profile?.favorite_verses?? []).slice(0, 2).map((v, i) => (
            <p key={i} className="mt-1.5 border-l-2 border-dawn-400 pl-2.5 text-sm italic text-cream/75">
              «&nbsp;{v.text}&nbsp;»{" "}
              {v.reference? (
                <span className="font-semibold not-italic text-dawn-200">{v.reference}</span>
              ): null}
            </p>
          ))}
        </div>

        {/* Actions: Modifier / Partager / Rechercher / Messages / Cloche.
            flex-wrap: sur mobile les icônes passent à la ligne suivante au lieu
            de déborder hors de la carte (cloche coupée). */}
        <div className="relative mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing((e) =>!e)}
            className="btn-primary flex-1 justify-center text-sm sm:flex-none sm:px-8"
          >
            {editing? "Fermer": "Modifier le profil"}
          </button>
          <button
            type="button"
            onClick={shareProfile}
            className="btn-ghost flex-1 justify-center text-sm sm:flex-none sm:px-8"
          >
            Partager
          </button>
          {/* Icônes groupées: elles passent ensemble à la ligne si besoin */}
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
        <div className="glass-strong mt-4 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
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
            <span className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
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

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
            Bio
          </span>
          <textarea
            value={bioVal}
            onChange={(e) => setBioVal(e.target.value)}
            rows={3}
            placeholder="Présente-toi en quelques mots…"
            className="field mt-1 w-full resize-y"
          />
        </label>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
              Mes versets préférés
            </span>
            <button
              type="button"
              onClick={addVerse}
              className="text-sm font-semibold text-spirit-600 hover:underline"
            >
              + Ajouter un verset
            </button>
          </div>
          <div className="mt-2 space-y-3">
            {verses.length === 0? (
              <p className="text-sm text-night-900/45">
                Ajoute les versets qui te portent, ils s'afficheront sur ton profil.
              </p>
            ): (
              verses.map((v, i) => (
                <div key={i} className="rounded-2xl border border-night-900/10 p-3">
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
                      className="shrink-0 text-sm text-night-900/40 hover:text-night-900/70"
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
          <span className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
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
          {saved? <span className="text-sm text-spirit-600">✓ Enregistré</span>: null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-night-900/10 pt-4 text-sm">
          <Link href={`/membre?u=${userId}`} className="font-semibold text-spirit-600 hover:underline">
            Voir mon profil public
          </Link>
          <button type="button" onClick={() => signOut()} className="text-night-900/50 hover:underline">
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
              const ok = await deleteAccount();
              if (!ok) alert("La suppression a échoué. Réessaie ou écris-nous.");
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
          <span className="font-display text-sm font-bold text-spirit-700">Mon carnet</span>
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
          <span className="font-display text-sm font-bold text-spirit-700">Mes plans</span>
        </Link>
      </div>

      {/* Annonces défilantes (RHEMA, exclusivités…) */}
      <div className="mt-4">
        <ProfileBanners />
      </div>

      {/* Badges débloqués */}
      {eng.ready && eng.best >= FIDELITY_REWARDS[0].days? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
            Badges débloqués
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FIDELITY_REWARDS.filter((r) => eng.best >= r.days).map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-dawn-400/40 bg-dawn-400/10 px-3 py-1 text-sm font-semibold text-spirit-700"
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
        <p className="mt-1 text-sm text-night-900/60">
          Cherche un membre par pseudo et abonne-toi, comme sur un réseau social.
        </p>
        <div className="mt-3">
          <MemberSearch />
        </div>

        {/* Suggestions de contacts (intercesseurs) à suivre */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
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
          <div className="rounded-2xl border border-night-900/10 bg-white p-3">
            <p className="font-display text-xl font-extrabold text-spirit-700">{activity.prayers}</p>
            <p className="text-xs text-night-900/55">prières</p>
          </div>
          <div className="rounded-2xl border border-night-900/10 bg-white p-3">
            <p className="font-display text-xl font-extrabold text-spirit-700">{activity.prays}</p>
            <p className="text-xs text-night-900/55">je prie</p>
          </div>
          <div className="rounded-2xl border border-night-900/10 bg-white p-3">
            <p className="font-display text-xl font-extrabold text-spirit-700">{activity.comments}</p>
            <p className="text-xs text-night-900/55">encouragements</p>
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
              <span className="text-night-900/30 transition-transform group-hover:translate-x-0.5 group-hover:text-spirit-600">→</span>
            </div>
            <p className="mt-4 font-display text-base font-extrabold text-spirit-700">Mon carnet</p>
            <p className="mt-0.5 text-sm text-night-900/60">
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
              <span className="text-night-900/30 transition-transform group-hover:translate-x-0.5 group-hover:text-spirit-600">→</span>
            </div>
            <p className="mt-4 font-display text-base font-extrabold text-spirit-700">Mes plans</p>
            <p className="mt-0.5 text-sm text-night-900/60">
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
        <p className="mt-3 text-xs text-night-900/45">
          ✓ Carnet, versets et plans sont synchronisés sur ton compte: tu les retrouves
          sur tous tes appareils dès que tu te connectes.
        </p>
      </div>

      {/* Mes prières */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Mes sujets de prière</h3>
        {loading? (
          <p className="mt-3 text-night-900/50">Chargement…</p>
        ): myPrayers.length === 0? (
          <p className="mt-3 text-night-900/55">
            Tu n'as pas encore partagé de prière.{" "}
            <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
              Partager maintenant
            </Link>
          </p>
        ): (
          <ul className="mt-3 space-y-3">
            {myPrayers.map((p) => (
              <li key={p.id} className="rounded-2xl border border-night-900/10 bg-white p-4">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-night-900/85">
                  {p.body}
                </p>
                <p className="mt-2 text-xs text-night-900/45">
                  {new Date(p.created_at).toLocaleDateString("fr-FR")} ·{" "}
                  {p.visibility === "public"
? "Public"
: p.visibility === "friends"
? "Abonnés"
: "Privé"}
                  {p.answered? " · Exaucé": ""}
                </p>
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
                className="block rounded-2xl border border-night-900/10 bg-white p-4 transition-shadow hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display font-bold">{p.title}</p>
                  <span className="shrink-0 text-sm font-semibold text-spirit-700">{p.pct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-night-900/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-night-900/55">
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
          className="text-sm font-semibold text-night-900/50 hover:underline"
        >
          Déconnexion
        </button>
        <DeleteAccountButton />
      </div>

      {followModal? (
        <FollowList
          userId={userId}
          mode={followModal}
          onClose={() => setFollowModal(null)}
          onChange={load}
        />
      ): null}
    </section>
  );
}

/** Icône maison du badge de fidélité selon le palier. */
function BadgeGlyph({ id }: { id: string }) {
  if (id === "d7") return <FlameGlyph className="h-4 w-4" />;
  if (id === "d30") return <StarGlyph className="h-4 w-4" />;
  return <GiftGlyph className="h-4 w-4" />;
}
