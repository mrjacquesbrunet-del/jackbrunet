"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import {
  signOut,
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
import { ProfileNotifications } from "@/components/community/ProfileNotifications";
import { useNotebook } from "@/lib/notebook";
import { useToolkit } from "@/lib/toolkit";
import { useAllPlanProgress } from "@/lib/plan-progress";
import type { Activity } from "@/lib/grades";

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const notes = useNotebook();
  const toolkit = useToolkit();
  const planProgress = useAllPlanProgress();
  const activePlans = Object.values(planProgress).filter((days) => days.length > 0).length;

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
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className="container-x py-10">
      {/* Carte profil */}
      <div className="glass-strong p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar pseudo={pseudoVal || profile?.pseudo} url={avatarVal || profile?.avatar_url} size={64} />
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold leading-tight">
              {profile?.pseudo ?? "Mon profil"}
            </h2>
            {email ? <p className="truncate text-sm text-night-900/55">{email}</p> : null}
            <p className="mt-1 text-sm text-night-900/55">
              <strong className="text-night-900/80">{counts.followers}</strong> abonné
              {counts.followers > 1 ? "s" : ""} ·{" "}
              <strong className="text-night-900/80">{counts.following}</strong> abonnement
              {counts.following > 1 ? "s" : ""}
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <Link href={`/membre?u=${userId}`} className="text-sm font-semibold text-spirit-600 hover:underline">
              Voir mon profil public
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-night-900/50 hover:underline"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-40">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {saved ? <span className="text-sm text-spirit-600">✓ Enregistré</span> : null}
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

      {/* Mon espace (carnet, versets, plans) */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold">Mon espace</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Link href="/carnet" className="glass block p-5 transition-shadow hover:shadow-lg">
            <p className="font-display font-bold">Mon carnet</p>
            <p className="mt-1 text-sm text-night-900/60">
              {notes.length} note{notes.length > 1 ? "s" : ""} (prières, paroles reçues, réflexions)
            </p>
          </Link>
          <Link href="/favoris" className="glass block p-5 transition-shadow hover:shadow-lg">
            <p className="font-display font-bold">Mes favoris</p>
            <p className="mt-1 text-sm text-night-900/60">
              {toolkit.saved.length} enregistré{toolkit.saved.length > 1 ? "s" : ""} ·{" "}
              {toolkit.highlights.length} surligné{toolkit.highlights.length > 1 ? "s" : ""}
            </p>
          </Link>
          <Link href="/plans" className="glass block p-5 transition-shadow hover:shadow-lg">
            <p className="font-display font-bold">Mes plans</p>
            <p className="mt-1 text-sm text-night-900/60">
              {activePlans > 0
                ? `${activePlans} plan${activePlans > 1 ? "s" : ""} en cours`
                : "Démarrer un plan"}
            </p>
          </Link>
          <Link href="/exaucees" className="glass block p-5 transition-shadow hover:shadow-lg">
            <p className="font-display font-bold">Prières exaucées</p>
            <p className="mt-1 text-sm text-night-900/60">
              Les témoignages de la communauté 🙌
            </p>
          </Link>
          <Link href="/recherche" className="glass block p-5 transition-shadow hover:shadow-lg">
            <p className="font-display font-bold">Recherche Bible</p>
            <p className="mt-1 text-sm text-night-900/60">
              Trouve un mot, un verset, un thème
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
