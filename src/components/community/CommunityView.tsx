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
import { MemberSuggestions } from "@/components/community/MemberSuggestions";
import { MentionField } from "@/components/community/MentionField";
import { CommunityLanding } from "@/components/community/CommunityLanding";
import { openExternal } from "@/lib/external";
import { siteConfig } from "@/config/site";
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
            La connexion n'est pas encore activée. Reviens très vite!
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
  const [pseudoVal, setPseudoVal] = useState(profile?.pseudo?? "");
  const [pseudoErr, setPseudoErr] = useState("");
  const [tab, setTab] = useState<"all" | "following">("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const ps = tab === "following"? await listFollowingFeed(userId): await listPrayers();
    setPrayers(ps);
    setReactions(await reactionsFor(ps.map((p) => p.id)));
    setLoading(false);
  }, [tab, userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPseudoVal(profile?.pseudo?? "");
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
    if (isReservedPseudo(p) &&!admin) {
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

  // Recherche dans les sujets de prière (filtre le fil affiché).
  const q = search.trim().toLowerCase();
  const shown = q? prayers.filter((p) => p.body.toLowerCase().includes(q)): prayers;

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

      <section className="container-x pt-6 pb-12">
      <div className="max-w-2xl">
      {/* Module de profil (charte olive) + partage d'un sujet en extension */}
      <div className="dark-ctx bg-topo-dark rounded-4xl border border-white/10 text-cream shadow-card">
        {/* En-tête profil */}
        <div className="flex items-center gap-3 p-4">
          <Avatar pseudo={profile?.pseudo} url={profile?.avatar_url} />
          <div className="min-w-0 flex-1">
            {editPseudo? (
              <div>
                <div className="flex gap-2">
                  <input
                    value={pseudoVal}
                    onChange={(e) => {
                      setPseudoVal(e.target.value);
                      if (pseudoErr) setPseudoErr("");
                    }}
                    className="flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-dawn-400/60 focus:outline-none"
                    placeholder="Ton pseudo"
                  />
                  <button
                    type="button"
                    onClick={savePseudo}
                    className="rounded-xl bg-dawn-400 px-4 text-sm font-bold text-night-900"
                  >
                    OK
                  </button>
                </div>
                {pseudoErr? <p className="mt-1 text-xs font-semibold text-red-300">{pseudoErr}</p>: null}
              </div>
            ): (
              <p className="font-display font-bold leading-tight text-cream">
                {profile?.pseudo?? "Ami(e)"}{" "}
                <button
                  type="button"
                  onClick={() => setEditPseudo(true)}
                  className="text-xs font-semibold text-dawn-300 hover:underline"
                >
                  modifier
                </button>
              </p>
            )}
            <p className="text-xs text-cream/55">Connecté(e)</p>
          </div>
          <NotificationsBell userId={userId} tone="dark" />
          <Link
            href="/profil"
            className="rounded-full bg-dawn-400 px-4 py-2 text-sm font-bold text-night-900 transition-transform hover:-translate-y-0.5"
          >
            Mon profil
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-sm text-cream/55 hover:text-cream/80 hover:underline"
          >
            Déconnexion
          </button>
        </div>

        {/* Séparateur */}
        <div className="mx-4 h-px bg-white/10" />

        {/* Partager un sujet de prière — intégré au module de profil */}
        <div className="p-4">
          <MentionField
            value={body}
            onChange={setBody}
            rows={3}
            placeholder="Partage un sujet de prière… (cite quelqu'un avec @)"
            className="w-full resize-y rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-dawn-400/60 focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="max-w-[12rem] rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-cream focus:border-dawn-400/60 focus:outline-none"
              aria-label="Visibilité"
            >
              <option value="public">Public — tout le monde</option>
              <option value="friends">Abonnés — ceux qui me suivent</option>
              <option value="private">Privé — moi seul</option>
            </select>
            <button
              type="button"
              onClick={post}
              disabled={posting ||!body.trim()}
              className="ml-auto rounded-full bg-dawn-400 px-5 py-2 text-sm font-bold text-night-900 transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            >
              {posting? "Publication…": "Publier"}
            </button>
          </div>
        </div>
      </div>

      {/* Trouver des profils — recherche par pseudo + suggestions (compact) */}
      <div className="mt-5">
        <h3 className="font-display text-base font-bold">Trouver des profils</h3>
        <p className="mt-0.5 text-xs text-night-900/55">
          Cherche un membre par pseudo et abonne-toi, comme sur un réseau social.
        </p>
        <div className="mt-2.5">
          <MemberSearch />
        </div>
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-night-900/45">
            Suggestions pour toi
          </p>
          <div className="mt-2">
            <MemberSuggestions compact />
          </div>
        </div>
      </div>

      {/* Focus de prière de la semaine */}
      <div className="mt-8">
        <PrayerFocus />
      </div>

      {/* Onglets — mis en valeur (olive + actif lime) */}
      <div className="dark-ctx bg-topo-dark mt-8 flex gap-1.5 rounded-full border border-white/10 p-1.5 shadow-card">
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
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
              tab === key
? "bg-dawn-400 text-night-900 shadow-sm"
: "text-cream/70 hover:text-cream"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Recherche sur le mur de prière — carte sombre, écriture fluo */}
      <div className="relative mt-4">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-dawn-400"
          strokeWidth={2}
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher sur le mur de prière…"
          className="w-full rounded-full border border-white/10 bg-night-950 py-3 pl-11 pr-4 text-sm font-semibold text-dawn-300 placeholder:font-medium placeholder:text-dawn-300/45 focus:border-dawn-400/60 focus:outline-none"
        />
      </div>

      {/* Fil */}
      <div className="mt-5">
        {loading? (
          <p className="text-night-900/50">Chargement du fil…</p>
        ): shown.length === 0? (
          <p className="text-night-900/55">
            {q
? "Aucun sujet ne correspond à ta recherche."
: tab === "following"
? "Abonne-toi à des membres pour voir leurs prières ici."
: "Aucune prière pour l'instant. Sois le premier à partager."}
          </p>
        ): (
          <ul className="space-y-4">
            {shown.map((p) => (
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

      {/* Lien discret vers la page de soutien du site (ouvre le navigateur externe) */}
      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => openExternal(`${siteConfig.url}/dons`)}
          className="inline-flex items-center gap-1 text-xs text-night-900/40 underline-offset-2 transition-colors hover:text-night-900/70 hover:underline"
        >
          Soutenir la mission
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={2}>
            <path d="M14 5h5v5M19 5l-8 8M11 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      </div>
      </section>
    </>
  );
}
