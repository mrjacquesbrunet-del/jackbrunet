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
  listMyPrayers,
  followCounts,
  getActivity,
  uploadAvatar,
  isAdminEmail,
  type Prayer,
  type FavoriteVerse,
} from "@/lib/community";
import { AdminAnnounce } from "@/components/community/AdminAnnounce";
import { ProfileSignIn } from "@/components/community/ProfileSignIn";
import { GradeProgress } from "@/components/community/GradeBadge";
import { MyFavorites } from "@/components/profile/MyFavorites";
import { AnsweredFeed } from "@/components/community/AnsweredFeed";
import { MemberSearch } from "@/components/community/MemberSearch";
import { ProfileBanners } from "@/components/community/ProfileBanners";
import { useEngagement } from "@/lib/engagement";
import { FIDELITY_REWARDS } from "@/lib/rewards";
import { FlameGlyph, StarGlyph, GiftGlyph } from "@/components/ui/DevoIcons";
import { ProfileNotifications } from "@/components/community/ProfileNotifications";
import { useNotebook } from "@/lib/notebook";
import { useAllPlanProgress } from "@/lib/plan-progress";
import { getThemePlans } from "@/lib/content";
import { YEAR_PLAN_SLUG, YEAR_PLAN_DAYS } from "@/lib/year-plan";
import { gradeFor, type Activity } from "@/lib/grades";
import { siteConfig } from "@/config/site";

/** Couleurs d'accent personnalisables (bannière du profil). */
const ACCENTS = {
  lime: { from: "#CAF000", to: "#5E6A3A", label: "Lime" },
  ocean: { from: "#38BDF8", to: "#1E3A8A", label: "Océan" },
  sunset: { from: "#FB923C", to: "#BE123C", label: "Coucher" },
  violet: { from: "#A78BFA", to: "#5B21B6", label: "Violet" },
  rose: { from: "#FB7185", to: "#9D174D", label: "Rose" },
} as const;
type AccentKey = keyof typeof ACCENTS;

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
      <section className="container-x py-12">
        <ProfileSignIn />
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-night-900/55">
          Tu peux aussi continuer à utiliser l'app sans compte —{" "}
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
  } | null;
  refreshProfile: () => void;
}) {
  const [myPrayers, setMyPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pseudoVal, setPseudoVal] = useState(profile?.pseudo ?? "");
  const [avatarVal, setAvatarVal] = useState(profile?.avatar_url ?? "");
  const [bioVal, setBioVal] = useState(profile?.bio ?? "");
  const [verses, setVerses] = useState<FavoriteVerse[]>(profile?.favorite_verses ?? []);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [activity, setActivity] = useState<Activity>({ prayers: 0, comments: 0, prays: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const notes = useNotebook();
  const eng = useEngagement();
  const planProgress = useAllPlanProgress();

  const [accent, setAccent] = useState<AccentKey>("lime");
  useEffect(() => {
    try {
      const a = localStorage.getItem("jb.profile.accent") as AccentKey | null;
      if (a && ACCENTS[a]) setAccent(a);
    } catch {
      /* indisponible */
    }
  }, []);
  function pickAccent(k: AccentKey) {
    setAccent(k);
    try {
      localStorage.setItem("jb.profile.accent", k);
    } catch {
      /* ignore */
    }
  }
  const a = ACCENTS[accent];

  async function shareProfile() {
    const url = `${siteConfig.url}/membre?u=${userId}`;
    try {
      const nav = navigator as Navigator & {
        share?: (d: { title?: string; text?: string; url?: string }) => Promise<void>;
      };
      if (nav.share) {
        await nav.share({
          title: "Mon profil — Jack Brunet",
          text: "Rejoins-moi sur l'application Jack Brunet : Foi & Prière 🙏",
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
      const meta = planMeta[slug] ?? { title: slug, total: days.length };
      const done = days.length;
      return { slug, title: meta.title, done, total: meta.total,
        pct: meta.total ? Math.min(100, Math.round((done / meta.total) * 100)) : 0 };
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
    setPseudoVal(profile?.pseudo ?? "");
    setAvatarVal(profile?.avatar_url ?? "");
    setBioVal(profile?.bio ?? "");
    setVerses(profile?.favorite_verses ?? []);
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
    setVerses((prev) => prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }
  function addVerse() {
    setVerses((prev) => [...prev, { reference: "", text: "" }]);
  }
  function removeVerse(i: number) {
    setVerses((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
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
    <section className="container-x py-8">
      {/* En-tête façon Instagram, sur olive sombre texturé */}
      <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-4xl border border-white/10 p-6 shadow-card sm:p-8">
        {/* Halo d'accent personnalisable */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-40 blur-3xl"
          style={{ backgroundImage: `linear-gradient(120deg, ${a.from}, ${a.to})` }}
        />

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
            <Link
              href={`/membre?u=${userId}`}
              className="rounded-xl py-1 transition-colors hover:bg-white/10"
            >
              <p className="font-display text-xl font-extrabold text-cream">{counts.followers}</p>
              <p className="text-[11px] text-cream/60">Abonnés</p>
            </Link>
            <Link
              href={`/membre?u=${userId}`}
              className="rounded-xl py-1 transition-colors hover:bg-white/10"
            >
              <p className="font-display text-xl font-extrabold text-cream">{counts.following}</p>
              <p className="text-[11px] text-cream/60">Abonnements</p>
            </Link>
            <div className="rounded-xl py-1">
              <p className="flex items-center justify-center gap-1 font-display text-xl font-extrabold text-dawn-300">
                <FlameGlyph className="h-4 w-4" />
                {eng.ready ? eng.streak : 0}
              </p>
              <p className="text-[11px] text-cream/60">Série</p>
            </div>
          </div>
        </div>

        {/* Nom + grade + bio + versets (lecture seule) */}
        <div className="relative mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-extrabold leading-tight text-cream">
              {profile?.pseudo ?? "Ami(e)"}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-dawn-400/20 px-2.5 py-0.5 text-[11px] font-bold text-dawn-200">
              {gradeFor(activity).grade.name}
            </span>
          </div>
          {profile?.bio ? (
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-cream/80">
              {profile.bio}
            </p>
          ) : null}
          {(profile?.favorite_verses ?? []).slice(0, 2).map((v, i) => (
            <p key={i} className="mt-1.5 border-l-2 border-dawn-400 pl-2.5 text-sm italic text-cream/75">
              «&nbsp;{v.text}&nbsp;»{" "}
              {v.reference ? (
                <span className="font-semibold not-italic text-dawn-200">— {v.reference}</span>
              ) : null}
            </p>
          ))}
        </div>

        {/* Actions : Modifier / Partager / Rechercher */}
        <div className="relative mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="btn-primary flex-1 justify-center text-sm sm:flex-none sm:px-8"
          >
            {editing ? "Fermer" : "Modifier le profil"}
          </button>
          <button
            type="button"
            onClick={shareProfile}
            className="btn-ghost flex-1 justify-center text-sm sm:flex-none sm:px-8"
          >
            Partager
          </button>
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
        </div>
      </div>

      {editing ? (
        <div className="glass-strong mt-4 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
              Pseudo
            </span>
            <input
              value={pseudoVal}
              onChange={(e) => setPseudoVal(e.target.value)}
              placeholder="Ton pseudo"
              className="field mt-1 w-full"
            />
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
                {uploading ? "Envoi…" : "Choisir une photo"}
              </button>
            </div>
            {uploadError ? <p className="field-error mt-1">{uploadError}</p> : null}
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
            {verses.length === 0 ? (
              <p className="text-sm text-night-900/45">
                Ajoute les versets qui te portent — ils s'afficheront sur ton profil.
              </p>
            ) : (
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
                onClick={() => pickAccent(k)}
                aria-label={ACCENTS[k].label}
                className={`h-8 w-8 rounded-full ring-2 ring-offset-2 transition ${
                  accent === k ? "ring-night-900" : "ring-transparent"
                }`}
                style={{ backgroundImage: `linear-gradient(120deg, ${ACCENTS[k].from}, ${ACCENTS[k].to})` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-40">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
            Annuler
          </button>
          {saved ? <span className="text-sm text-spirit-600">✓ Enregistré</span> : null}
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
                  "Supprimer définitivement ton compte et tes données ? Cette action est irréversible.",
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
      ) : null}

      {/* Annonces défilantes (RHEMA, exclusivités…) */}
      <div className="mt-4">
        <ProfileBanners />
      </div>

      {/* Badges débloqués */}
      {eng.ready && eng.best >= FIDELITY_REWARDS[0].days ? (
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
      ) : null}

      {/* Trouver des profils à suivre */}
      <div id="trouver-profils" className="mt-6 scroll-mt-20">
        <h3 className="font-display text-lg font-bold">Trouver des profils</h3>
        <p className="mt-1 text-sm text-night-900/60">
          Cherche un membre par pseudo et abonne-toi, comme sur un réseau social.
        </p>
        <div className="mt-3">
          <MemberSearch />
        </div>
      </div>

      {/* Notifications */}
      <div className="mt-6">
        <ProfileNotifications userId={userId} />
      </div>

      {/* Grade de prière */}
      <div className="mt-6">
        <GradeProgress activity={activity} />
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

      {/* Mes prières */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Mes sujets de prière</h3>
        {loading ? (
          <p className="mt-3 text-night-900/50">Chargement…</p>
        ) : myPrayers.length === 0 ? (
          <p className="mt-3 text-night-900/55">
            Tu n'as pas encore partagé de prière.{" "}
            <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
              Partager maintenant
            </Link>
          </p>
        ) : (
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
                  {p.answered ? " · Exaucé 🙌" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Avancée de mes plans */}
      {myPlans.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-display text-lg font-bold">Mes plans en cours</h3>
          <div className="mt-3 space-y-3">
            {myPlans.map((p) => (
              <Link
                key={p.slug}
                href={p.slug === YEAR_PLAN_SLUG ? "/bible-1-an" : `/plans/${p.slug}`}
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
      ) : null}

      {/* Mes favoris — regroupés directement dans le profil */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Mes favoris</h3>
        <MyFavorites />
      </div>

      {/* Prières exaucées — directement dans le profil */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Prières exaucées 🙌</h3>
        <AnsweredFeed />
      </div>

      {/* Mon espace (carnet, plans, exaucées) */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Mon espace</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Link
            href="/carnet"
            className="block rounded-3xl border border-dawn-400/45 bg-gradient-to-br from-dawn-400/25 to-dawn-300/5 p-5 transition-shadow hover:shadow-lg"
          >
            <p className="font-display font-bold text-spirit-700">Mon carnet</p>
            <p className="mt-1 text-sm text-night-900/65">
              {notes.length} note{notes.length > 1 ? "s" : ""} (prières, paroles reçues, réflexions)
            </p>
          </Link>
          <Link
            href="/plans"
            className="block rounded-3xl border border-spirit-500/45 bg-gradient-to-br from-spirit-500/25 to-spirit-700/10 p-5 transition-shadow hover:shadow-lg"
          >
            <p className="font-display font-bold text-spirit-700">Mes plans</p>
            <p className="mt-1 text-sm text-night-900/65">
              {activePlans > 0
                ? `${activePlans} plan${activePlans > 1 ? "s" : ""} en cours`
                : "Démarrer un plan"}
            </p>
          </Link>
          <Link
            href="/a-propos"
            className="block rounded-3xl border border-amber-400/50 bg-gradient-to-br from-amber-400/25 to-orange-300/5 p-5 transition-shadow hover:shadow-lg"
          >
            <p className="font-display font-bold text-spirit-700">À propos</p>
            <p className="mt-1 text-sm text-night-900/65">
              Découvre Jack, sa vision & son histoire.
            </p>
          </Link>
        </div>
        <p className="mt-3 text-xs text-night-900/45">
          ✓ Carnet, versets et plans sont synchronisés sur ton compte : tu les retrouves
          sur tous tes appareils dès que tu te connectes.
        </p>
      </div>

      {isAdminEmail(email) ? <AdminAnnounce /> : null}
    </section>
  );
}

/** Icône maison du badge de fidélité selon le palier. */
function BadgeGlyph({ id }: { id: string }) {
  if (id === "d7") return <FlameGlyph className="h-4 w-4" />;
  if (id === "d30") return <StarGlyph className="h-4 w-4" />;
  return <GiftGlyph className="h-4 w-4" />;
}
