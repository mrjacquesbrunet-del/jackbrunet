"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { PrayerCard } from "@/components/community/PrayerCard";
import { PrayerFocus } from "@/components/community/PrayerFocus";
import { NotificationsBell } from "@/components/community/NotificationsBell";
import { MemberSearch } from "@/components/community/MemberSearch";
import { MentionField } from "@/components/community/MentionField";
import { CommunityLanding } from "@/components/community/CommunityLanding";
import {
  signOut,
  updateProfile,
  listPrayers,
  listFollowingFeed,
  createPrayer,
  notifyMentions,
  isPseudoTaken,
  isReservedPseudo,
  reactionsFor,
  isAdminEmail,
  type Prayer,
  type Reaction,
  type Visibility,
} from "@/lib/community";

export function CommunityView() {
  const { ready, userId, email, profile, refreshProfile } = useAuth();
  const admin = isAdminEmail(email);

  if (!isSupabaseConfigured) {
    return (
      <section className="container-x py-16 pt-32">
        <div className="glass-strong mx-auto max-w-xl p-8 text-center">
          <p className="font-display text-xl font-bold">Mur de prière bientôt disponible</p>
          <p className="mt-2 text-night-900/65">
            La connexion n'est pas encore activée. Reviens très vite !
          </p>
        </div>
      </section>
    );
  }

  if (!ready) {
    return <p className="container-x py-16 pt-32 text-night-900/50">Chargement…</p>;
  }

  if (!userId) {
    return <CommunityLanding />;
  }

  return <Feed userId={userId} admin={admin} profile={profile} refreshProfile={refreshProfile} />;
}

/* ---------- Fil de prières ---------- */
function Feed({
  userId,
  admin,
  profile,
  refreshProfile,
}: {
  userId: string;
  admin: boolean;
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
  const [pseudoErr, setPseudoErr] = useState("");
  const [tab, setTab] = useState<"all" | "following">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const ps = tab === "following" ? await listFollowingFeed(userId) : await listPrayers();
    setPrayers(ps);
    setReactions(await reactionsFor(ps.map((p) => p.id)));
    setLoading(false);
  }, [tab, userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPseudoVal(profile?.pseudo ?? "");
  }, [profile?.pseudo]);

  async function post() {
    if (!body.trim()) return;
    setPosting(true);
    const text = body.trim();
    const newId = await createPrayer(text, visibility, userId);
    await notifyMentions(text, userId, newId);
    setBody("");
    await load();
    setPosting(false);
  }

  async function savePseudo() {
    const p = pseudoVal.trim() || "Ami(e)";
    if (isReservedPseudo(p) && !admin) {
      setPseudoErr("Ce pseudo est réservé à Pasteur Jack Brunet.");
      return;
    }
    if (await isPseudoTaken(p, userId)) {
      setPseudoErr("Ce pseudo est déjà pris — choisis-en un autre.");
      return;
    }
    setPseudoErr("");
    await updateProfile(userId, { pseudo: p });
    setEditPseudo(false);
    refreshProfile();
  }

  return (
    <>
      {/* Bandeau du mur */}
      <div className="dark-ctx relative overflow-hidden bg-night-950 pt-28 pb-10 sm:pt-32">
        <div className="absolute inset-0 bg-grid opacity-[0.1]" />
        <div className="blob -right-10 top-6 h-56 w-56 bg-dawn-400/25" />
        <div className="container-x relative">
          <span className="eyebrow">Réseau social de prière</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
            Le mur de <span className="text-gradient">prière</span>
          </h1>
          <p className="mt-2 max-w-xl text-cream/70">
            Partage, prie pour les autres, encourage la famille. Vous portez les uns les autres.
          </p>
        </div>
      </div>

      <section className="container-x -mt-6 pb-12">
      {/* En-tête profil */}
      <div className="glass-strong flex items-center gap-3 p-4 shadow-card">
        <Avatar pseudo={profile?.pseudo} url={profile?.avatar_url} />
        <div className="min-w-0 flex-1">
          {editPseudo ? (
            <div>
              <div className="flex gap-2">
                <input
                  value={pseudoVal}
                  onChange={(e) => {
                    setPseudoVal(e.target.value);
                    if (pseudoErr) setPseudoErr("");
                  }}
                  className="field flex-1 text-sm"
                  placeholder="Ton pseudo"
                />
                <button type="button" onClick={savePseudo} className="btn-primary text-sm">
                  OK
                </button>
              </div>
              {pseudoErr ? <p className="field-error mt-1">{pseudoErr}</p> : null}
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
        <NotificationsBell userId={userId} />
        <Link href="/profil" className="btn-ghost text-sm">
          Mon profil
        </Link>
        <button type="button" onClick={() => signOut()} className="text-sm text-night-900/50 hover:underline">
          Déconnexion
        </button>
      </div>

      {/* Recherche de membres */}
      <div className="mt-5">
        <MemberSearch />
      </div>

      {/* Composer */}
      <div className="glass-strong mt-5 p-5">
        <MentionField
          value={body}
          onChange={setBody}
          rows={3}
          placeholder="Partage un sujet de prière… (cite quelqu'un avec @)"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className="field max-w-[12rem]"
            aria-label="Visibilité"
          >
            <option value="public">Public — tout le monde</option>
            <option value="friends">Abonnés — ceux qui me suivent</option>
            <option value="private">Privé — moi seul</option>
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

      {/* Focus de prière de la semaine */}
      <div className="mt-8">
        <PrayerFocus />
      </div>

      {/* Onglets */}
      <div className="mt-8 flex gap-1 rounded-full border border-night-900/10 bg-night-900/[0.03] p-1">
        {(
          [
            ["all", "Le mur"],
            ["following", "Mes amis"],
          ] as const
        ).map(([key, lbl]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === key ? "bg-white text-night-900 shadow-sm" : "text-night-900/55 hover:text-night-900/80"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Fil */}
      <div className="mt-5">
        {loading ? (
          <p className="text-night-900/50">Chargement du fil…</p>
        ) : prayers.length === 0 ? (
          <p className="text-night-900/55">
            {tab === "following"
              ? "Abonne-toi à des membres pour voir leurs prières ici."
              : "Aucune prière pour l'instant. Sois le premier à partager. 🙏"}
          </p>
        ) : (
          <ul className="space-y-4">
            {prayers.map((p) => (
              <PrayerCard
                key={p.id}
                prayer={p}
                userId={userId}
                isAdmin={admin}
                initialReactions={reactions.filter((r) => r.prayer_id === p.id)}
                onDeleted={load}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Laisser un témoignage */}
      <div className="mt-8">
        <Link
          href="/temoignages"
          className="dark-ctx group flex items-center justify-between gap-4 overflow-hidden rounded-4xl border border-dawn-500/40 bg-night-900 p-6 text-cream transition-transform hover:-translate-y-1 sm:p-7"
        >
          <div>
            <span className="eyebrow">Témoignages</span>
            <p className="mt-1.5 font-display text-xl font-extrabold sm:text-2xl">
              Dieu a agi dans ta vie&nbsp;?
            </p>
            <p className="mt-1 text-sm text-cream/70">Laisse ton témoignage et encourage la famille.</p>
          </div>
          <span className="shrink-0 text-2xl transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
      </section>
    </>
  );
}
