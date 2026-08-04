"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { listBlockedIds } from "@/lib/moderation";
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
  getPrayer,
  createPrayer,
  notifyMentions,
  isPseudoTaken,
  isReservedPseudo,
  reactionsFor,
  commentCountsFor,
  gradesFor,
  isAdminEmail,
  type Prayer,
  type Reaction,
  type Visibility,
} from "@/lib/community";

export function CommunityView() {
  const { ready, userId, email, profile, isModerator, refreshProfile } = useAuth();
  // Admin OU modérateur: peut supprimer les sujets/commentaires du mur de prière.
  const admin = isAdminEmail(email) || isModerator;

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
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [posting, setPosting] = useState(false);
  const [editPseudo, setEditPseudo] = useState(false);
  const [pseudoVal, setPseudoVal] = useState(profile?.pseudo?? "");
  const [pseudoErr, setPseudoErr] = useState("");
  const [tab, setTab] = useState<"all" | "following">("all");
  const [search, setSearch] = useState("");
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  // Sujet ciblé par un clic sur une notification (/communaute?prayer=<id>) :
  // sa carte s'ouvre sur les commentaires et défile jusqu'à elle.
  const [targetPrayer, setTargetPrayer] = useState<string | null>(null);
  useEffect(() => {
    try {
      const pid = new URLSearchParams(window.location.search).get("prayer");
      if (pid) setTargetPrayer(pid);
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    setBlockedIds(await listBlockedIds());
    const result = tab === "following"? await listFollowingFeed(userId): await listPrayers();
    // `null` = erreur réseau/serveur : on l'affiche (≠ mur réellement vide).
    if (result === null) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    let ps = result;
    // Deep-link de notification : si la prière ciblée n'est plus dans les 60
    // récentes, on va la chercher directement et on l'affiche en tête.
    let pid: string | null = null;
    try {
      pid = new URLSearchParams(window.location.search).get("prayer");
    } catch {
      /* ignore */
    }
    if (pid && !ps.some((p) => p.id === pid)) {
      const missing = await getPrayer(pid);
      if (missing) ps = [missing, ...ps];
    }
    setPrayers(ps);
    const ids = ps.map((p) => p.id);
    const [rx, counts] = await Promise.all([reactionsFor(ids), commentCountsFor(ids)]);
    setReactions(rx);
    setCommentCounts(counts);
    setLoading(false);
    // Grades des auteurs (chargés après coup pour ne pas retarder le fil).
    gradesFor(ps.map((p) => p.author_id)).then(setGrades);
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
      setPseudoErr("Ce pseudo est déjà pris, choisis-en un autre.");
      return;
    }
    setPseudoErr("");
    await updateProfile(userId, { pseudo: p });
    setEditPseudo(false);
    refreshProfile();
  }

  // Recherche dans les sujets de prière (filtre le fil affiché).
  const q = search.trim().toLowerCase();
  const visible = prayers.filter((p) => !blockedIds.includes(p.author_id));
  const shown = q? visible.filter((p) => p.body.toLowerCase().includes(q)): visible;

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
      {/* Accès aux groupes fermés */}
      <Link
        href="/groupes"
        className="mb-4 flex items-center gap-3 rounded-2xl border border-night-900/10 bg-white p-4 transition-colors hover:bg-night-900/[0.02]"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-dawn-300 to-spirit-500 text-night-950">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.8}>
            <path d="M16 19v-1a4 4 0 0 0-3-3.9M8 19v-1a4 4 0 0 1 3-3.9M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M4 20v-1a3 3 0 0 1 3-3M20 20v-1a3 3 0 0 0-3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display font-bold text-night-900">Mes groupes</span>
          <span className="block text-xs text-night-900/55">Rejoins ou crée un groupe: feed, chat, plans, percées, prière.</span>
        </span>
        <span className="shrink-0 text-night-900/30">→</span>
      </Link>

      {/* Module de profil (charte olive) + partage d'un sujet en extension */}
      <div className="dark-ctx bg-topo-dark rounded-4xl border border-white/10 text-cream shadow-card">
        {/* En-tête profil */}
        <div className="p-4">
          <div className="flex items-center gap-3">
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
                      className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-dawn-400/60 focus:outline-none"
                      placeholder="Ton pseudo"
                    />
                    <button
                      type="button"
                      onClick={savePseudo}
                      className="shrink-0 rounded-xl bg-dawn-400 px-4 text-sm font-bold text-night-900"
                    >
                      OK
                    </button>
                  </div>
                  {pseudoErr? <p className="mt-1 text-xs font-semibold text-red-300">{pseudoErr}</p>: null}
                </div>
              ): (
                <div className="flex items-baseline gap-2">
                  <p className="min-w-0 truncate font-display font-bold leading-tight text-cream">
                    {profile?.pseudo?? "Ami(e)"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditPseudo(true)}
                    className="shrink-0 text-xs font-semibold text-dawn-300 hover:underline"
                  >
                    modifier
                  </button>
                </div>
              )}
              <p className="text-xs text-cream/55">Connecté(e)</p>
            </div>
            <NotificationsBell userId={userId} tone="dark" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/profil"
              className="flex-1 rounded-full bg-dawn-400 px-4 py-2 text-center text-sm font-bold text-night-900 transition-transform hover:-translate-y-0.5"
            >
              Mon profil
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-sm text-cream/70 transition-colors hover:text-cream"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Séparateur */}
        <div className="mx-4 h-px bg-white/10" />

        {/* Partager un sujet de prière, intégré au module de profil */}
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
              <option value="public">Public, tout le monde</option>
              <option value="friends">Abonnés, ceux qui me suivent</option>
              <option value="private">Privé, moi seul</option>
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

      {/* Trouver des profils, recherche par pseudo + suggestions (compact) */}
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

      {/* Onglets, mis en valeur (olive + actif lime) */}
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

      {/* Recherche sur le mur de prière, carte sombre, écriture fluo */}
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
        ): loadError? (
          <div className="rounded-2xl border border-night-900/10 bg-night-900/[0.03] p-5 text-center">
            <p className="font-semibold text-night-900/75">
              Impossible de charger le mur de prière.
            </p>
            <p className="mt-1 text-sm text-night-900/55">
              Vérifie ta connexion internet, puis réessaie.
            </p>
            <button type="button" onClick={load} className="btn-primary mt-4 text-sm">
              Réessayer
            </button>
          </div>
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
                initialCommentCount={commentCounts[p.id]?? 0}
                grade={grades[p.author_id]}
                onDeleted={load}
                autoOpenComments={p.id === targetPrayer}
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

      {/* Bouton de soutien (ouvre la page de dons du site, navigateur externe) */}
      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => openExternal(`${siteConfig.url}/dons`)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-dawn-400 bg-dawn-400/15 px-6 py-3 text-sm font-bold text-spirit-700 transition-colors hover:bg-dawn-400/25"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21z" />
          </svg>
          Soutenir la mission
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2}>
            <path d="M14 5h5v5M19 5l-8 8M11 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      </div>
      </section>
    </>
  );
}
