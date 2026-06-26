"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { signOut, updateProfile, listMyPrayers, type Prayer } from "@/lib/community";
import { useNotebook } from "@/lib/notebook";
import { useToolkit } from "@/lib/toolkit";

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
      <section className="container-x py-16 text-center">
        <p className="text-night-900/70">
          Connecte-toi pour accéder à ton profil.{" "}
          <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
            Aller à la communauté
          </Link>
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
  profile: { pseudo: string; avatar_url: string | null } | null;
  refreshProfile: () => void;
}) {
  const [myPrayers, setMyPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pseudoVal, setPseudoVal] = useState(profile?.pseudo ?? "");
  const [avatarVal, setAvatarVal] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const notes = useNotebook();
  const toolkit = useToolkit();

  const load = useCallback(async () => {
    setLoading(true);
    setMyPrayers(await listMyPrayers(userId));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPseudoVal(profile?.pseudo ?? "");
    setAvatarVal(profile?.avatar_url ?? "");
  }, [profile?.pseudo, profile?.avatar_url]);

  async function save() {
    setSaving(true);
    await updateProfile(userId, {
      pseudo: pseudoVal.trim() || "Ami(e)",
      avatar_url: avatarVal.trim() || null,
    });
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
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="ml-auto self-start text-sm text-night-900/50 hover:underline"
          >
            Déconnexion
          </button>
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
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
              Photo (URL)
            </span>
            <input
              value={avatarVal}
              onChange={(e) => setAvatarVal(e.target.value)}
              placeholder="https://…"
              className="field mt-1 w-full"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="btn-primary disabled:opacity-40">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {saved ? <span className="text-sm text-spirit-600">✓ Enregistré</span> : null}
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
                      ? "Amis"
                      : "Privé"}
                  {p.answered ? " · Exaucé 🙌" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mon carnet (local) */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/carnet" className="glass block p-5 transition-shadow hover:shadow-lg">
          <p className="font-display font-bold">Mon carnet</p>
          <p className="mt-1 text-sm text-night-900/60">
            {notes.length} note{notes.length > 1 ? "s" : ""} (prières, paroles reçues, réflexions)
          </p>
        </Link>
        <Link href="/carnet" className="glass block p-5 transition-shadow hover:shadow-lg">
          <p className="font-display font-bold">Mes versets</p>
          <p className="mt-1 text-sm text-night-900/60">
            {toolkit.saved.length} enregistré{toolkit.saved.length > 1 ? "s" : ""} ·{" "}
            {toolkit.highlights.length} surligné{toolkit.highlights.length > 1 ? "s" : ""}
          </p>
        </Link>
      </div>
    </section>
  );
}
