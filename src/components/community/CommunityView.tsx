"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { PrayerCard } from "@/components/community/PrayerCard";
import {
  signInEmail,
  signInGoogle,
  signOut,
  updateProfile,
  listPrayers,
  createPrayer,
  reactionsFor,
  type Prayer,
  type Reaction,
  type Visibility,
} from "@/lib/community";

export function CommunityView() {
  const { ready, userId, profile, refreshProfile } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <section className="container-x py-16">
        <div className="glass-strong mx-auto max-w-xl p-8 text-center">
          <p className="font-display text-xl font-bold">Espace communautaire bientôt disponible</p>
          <p className="mt-2 text-night-900/65">
            La connexion n'est pas encore activée. Reviens très vite !
          </p>
        </div>
      </section>
    );
  }

  if (!ready) {
    return <p className="container-x py-16 text-night-900/50">Chargement…</p>;
  }

  if (!userId) {
    return <AuthPanel />;
  }

  return <Feed userId={userId} profile={profile} refreshProfile={refreshProfile} />;
}

/* ---------- Connexion ---------- */
function AuthPanel() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Entre une adresse email valide.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await signInEmail(email);
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container-x py-12">
      <div className="glass-strong mx-auto max-w-md p-7 sm:p-8">
        <h2 className="font-display text-2xl font-extrabold">Rejoins la communauté</h2>
        <p className="mt-2 text-sm text-night-900/65">
          Connecte-toi pour partager tes sujets de prière, prier pour les autres et retrouver
          ton carnet partout.
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-spirit-500/30 bg-spirit-500/[0.06] p-4 text-sm">
            ✓ Un lien de connexion vient d'être envoyé à <strong>{email}</strong>. Ouvre ta boîte
            mail et clique dessus.
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => signInGoogle()}
              className="btn-ghost mt-6 w-full justify-center"
            >
              Continuer avec Google
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-night-900/40">
              <span className="h-px flex-1 bg-night-900/10" /> ou <span className="h-px flex-1 bg-night-900/10" />
            </div>

            <form onSubmit={sendLink} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ton adresse email"
                className="field w-full"
              />
              <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
                {busy ? "Un instant…" : "Recevoir mon lien de connexion"}
              </button>
              {error ? <p className="field-error">{error}</p> : null}
            </form>
            <p className="mt-3 text-xs text-night-900/45">
              Pas de mot de passe : tu reçois un lien sécurisé par email.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

/* ---------- Fil de prières ---------- */
function Feed({
  userId,
  profile,
  refreshProfile,
}: {
  userId: string;
  profile: { pseudo: string; avatar_url: string | null } | null;
  refreshProfile: () => void;
}) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [posting, setPosting] = useState(false);
  const [editPseudo, setEditPseudo] = useState(false);
  const [pseudoVal, setPseudoVal] = useState(profile?.pseudo ?? "");

  const load = useCallback(async () => {
    setLoading(true);
    const ps = await listPrayers();
    setPrayers(ps);
    setReactions(await reactionsFor(ps.map((p) => p.id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPseudoVal(profile?.pseudo ?? "");
  }, [profile?.pseudo]);

  async function post() {
    if (!body.trim()) return;
    setPosting(true);
    await createPrayer(body.trim(), visibility, userId);
    setBody("");
    await load();
    setPosting(false);
  }

  async function savePseudo() {
    await updateProfile(userId, { pseudo: pseudoVal.trim() || "Ami(e)" });
    setEditPseudo(false);
    refreshProfile();
  }

  return (
    <section className="container-x py-10">
      {/* En-tête profil */}
      <div className="glass flex items-center gap-3 p-4">
        <Avatar pseudo={profile?.pseudo} url={profile?.avatar_url} />
        <div className="min-w-0 flex-1">
          {editPseudo ? (
            <div className="flex gap-2">
              <input
                value={pseudoVal}
                onChange={(e) => setPseudoVal(e.target.value)}
                className="field flex-1 text-sm"
                placeholder="Ton pseudo"
              />
              <button type="button" onClick={savePseudo} className="btn-primary text-sm">
                OK
              </button>
            </div>
          ) : (
            <p className="font-display font-bold leading-tight">
              {profile?.pseudo ?? "Ami(e)"}{" "}
              <button
                type="button"
                onClick={() => setEditPseudo(true)}
                className="text-xs font-semibold text-spirit-600 hover:underline"
              >
                modifier
              </button>
            </p>
          )}
          <p className="text-xs text-night-900/50">Connecté(e)</p>
        </div>
        <Link href="/profil" className="btn-ghost text-sm">
          Mon profil
        </Link>
        <button type="button" onClick={() => signOut()} className="text-sm text-night-900/50 hover:underline">
          Déconnexion
        </button>
      </div>

      {/* Composer */}
      <div className="glass-strong mt-5 p-5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Partage un sujet de prière…"
          className="field w-full resize-y"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className="field max-w-[12rem]"
            aria-label="Visibilité"
          >
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Amis</option>
            <option value="private">🔒 Privé (moi seul)</option>
          </select>
          <button
            type="button"
            onClick={post}
            disabled={posting || !body.trim()}
            className="btn-primary ml-auto disabled:opacity-40"
          >
            {posting ? "Publication…" : "Publier"}
          </button>
        </div>
      </div>

      {/* Fil */}
      <div className="mt-8">
        {loading ? (
          <p className="text-night-900/50">Chargement du fil…</p>
        ) : prayers.length === 0 ? (
          <p className="text-night-900/55">
            Aucune prière pour l'instant. Sois le premier à partager. 🙏
          </p>
        ) : (
          <ul className="space-y-4">
            {prayers.map((p) => (
              <PrayerCard
                key={p.id}
                prayer={p}
                userId={userId}
                initialReactions={reactions.filter((r) => r.prayer_id === p.id)}
                onDeleted={load}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
