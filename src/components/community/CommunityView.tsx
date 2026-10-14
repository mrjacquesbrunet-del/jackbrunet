"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { listBlockedIds } from "@/lib/moderation";
import { Avatar } from "@/components/community/Avatar";
import { PrayerCard } from "@/components/community/PrayerCard";
import { PrayerTime } from "@/components/community/PrayerTime";
import { NotificationsBell } from "@/components/community/NotificationsBell";
import { MentionField } from "@/components/community/MentionField";
import { VoiceRecorderButton } from "@/components/community/VoiceNote";
import { CommunityLanding } from "@/components/community/CommunityLanding";
import { TopIntercessors } from "@/components/community/TopIntercessors";
import { VersetPriere } from "@/components/community/VersetPriere";
import { PrayerMark } from "@/components/ui/PrayerMark";
import { useLangue } from "@/lib/i18n";
import {
  listPrayers,
  listFollowingFeed,
  getPrayer,
  createPrayer,
  notifyMentions,
  reactionsFor,
  apercuCommentaires,
  gradesFor,
  isAdminEmail,
  type Prayer,
  type Reaction,
  type Comment,
  type Visibility,
} from "@/lib/community";

export function CommunityView() {
  const { ready, userId, email, profile, isModerator } = useAuth();
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

  return <Feed userId={userId} admin={admin} profile={profile} />;
}

/* ---------- Fil de prières ---------- */
type Vue = "public" | "amis" | "reponses";

/** Onglets du mur : Public · Amis · Réponses (prières exaucées). */
const VUES: { cle: Vue; lbl: string; icone: React.ReactNode }[] = [
  {
    cle: "public",
    lbl: "Public",
    icone: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cle: "amis",
    lbl: "Amis",
    icone: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    cle: "reponses",
    lbl: "Réponses",
    icone: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
        <path d="M21 11.5a8 8 0 0 1-11.5 7.2L4 20l1.3-4.5A8 8 0 1 1 21 11.5z" strokeLinejoin="round" />
        <path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" strokeLinecap="round" strokeWidth={2.6} />
      </svg>
    ),
  },
];

function Feed({
  userId,
  admin,
  profile,
}: {
  userId: string;
  admin: boolean;
  profile: { pseudo: string; avatar_url: string | null } | null;
}) {
  const langue = useLangue();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [apercus, setApercus] = useState<Record<string, Comment>>({});
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [posting, setPosting] = useState(false);
  const [vue, setVue] = useState<Vue>("public");
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  // Mode « Temps de prière » plein écran (musique + sujets un par un).
  const [prayerTime, setPrayerTime] = useState(false);
  // Sujet ciblé par un clic sur une notification (/communaute?prayer=<id>) :
  // sa carte s'ouvre sur les commentaires et défile jusqu'à elle.
  const [targetPrayer, setTargetPrayer] = useState<string | null>(null);
  // Commentaire précis ciblé par la notif (/communaute?prayer=<id>&c=<comment>).
  const [targetComment, setTargetComment] = useState<string | null>(null);
  // Deep-link de notification, réactif à l'URL : fonctionne aussi quand on
  // clique une notif de la cloche alors qu'on est déjà sur le mur (l'URL change
  // sans remonter le composant).
  const searchParams = useSearchParams();
  const prayerParam = searchParams.get("prayer");
  const commentParam = searchParams.get("c");
  useEffect(() => {
    if (prayerParam) setTargetPrayer(prayerParam);
    setTargetComment(commentParam);
  }, [prayerParam, commentParam]);
  // Si la prière ciblée n'est pas déjà chargée, on va la chercher et on la met
  // en tête (sans recharger tout le fil).
  useEffect(() => {
    if (!prayerParam || prayers.length === 0) return;
    if (prayers.some((p) => p.id === prayerParam)) return;
    let alive = true;
    getPrayer(prayerParam).then((m) => {
      if (alive && m) setPrayers((prev) => (prev.some((p) => p.id === m.id) ? prev : [m, ...prev]));
    });
    return () => {
      alive = false;
    };
  }, [prayerParam, prayers]);

  // Fond nuit jusqu'aux bords (comme les autres écrans sombres).
  useEffect(() => {
    const h = document.documentElement;
    h.classList.add("page-nuit");
    return () => h.classList.remove("page-nuit");
  }, []);

  const tab = vue === "amis" ? "following" : "all";
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
    const [rx, apercu] = await Promise.all([reactionsFor(ids), apercuCommentaires(ids)]);
    setReactions(rx);
    setCommentCounts(apercu.counts);
    setApercus(apercu.derniers);
    setLoading(false);
    // Grades des auteurs (chargés après coup pour ne pas retarder le fil).
    gradesFor(ps.map((p) => p.author_id)).then(setGrades);
  }, [tab, userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Brouillon « Sur le mur » depuis la Bible : pré-remplit le composeur.
  useEffect(() => {
    try {
      const draft = localStorage.getItem("jb.wall.draft");
      if (draft) {
        localStorage.removeItem("jb.wall.draft");
        setBody((b) => (b ? b : draft));
      }
    } catch {
      /* stockage indisponible */
    }
  }, []);

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

  /** Publie un sujet vocal (audio déjà téléversé — expire après 7 jours). */
  async function postVoice(audioUrl: string) {
    setPosting(true);
    const text = body.trim();
    const newId = await createPrayer(text, visibility, userId, audioUrl);
    if (text) await notifyMentions(text, userId, newId);
    setBody("");
    await load();
    setPosting(false);
  }

  const visible = prayers.filter((p) => !blockedIds.includes(p.author_id));
  // « Réponses » : les prières exaucées (Dieu a agi).
  const shown = vue === "reponses" ? visible.filter((p) => p.answered) : visible;

  return (
    <div className="keep-dark relative min-h-[100svh] bg-night-950 pb-16 text-cream">
      {/* Halo lime discret en haut */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96"
        style={{ background: "radial-gradient(80% 55% at 70% 0%, rgba(202,240,0,.13), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-2xl px-4 pt-[calc(env(safe-area-inset-top)+4.75rem)] sm:pt-28">
        {/* En-tête : titre, cloche + profil, verset sur la prière qui tourne */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 translate="no" className="notranslate font-display text-[40px] font-extrabold leading-none tracking-tight sm:text-5xl">
              {langue === "en" ? (
                <>
                  <span className="text-dawn-400">Prayer</span> wall
                </>
              ) : langue === "pt" ? (
                <>
                  Mural de <span className="text-dawn-400">oração</span>
                </>
              ) : (
                <>
                  Mur de <span className="text-dawn-400">prière</span>
                </>
              )}
            </h1>
            <span className="mt-3 block h-1 w-10 rounded-full bg-dawn-400" />
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <NotificationsBell userId={userId} tone="dark" />
            <Link href="/profil" aria-label="Mon profil" className="rounded-full ring-2 ring-dawn-400/50">
              <Avatar pseudo={profile?.pseudo} url={profile?.avatar_url} size={44} />
            </Link>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3">
          <p className="min-w-0 flex-1 text-[14.5px] leading-relaxed text-cream/75">
            Partage, prie pour les autres, encourage la famille. Vous portez les uns les autres.
          </p>
          <VersetPriere className="w-[54%] max-w-[250px] shrink-0" />
        </div>

        {/* Onglets */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {VUES.map((v) => {
            const actif = vue === v.cle;
            return (
              <button
                key={v.cle}
                type="button"
                onClick={() => setVue(v.cle)}
                className={`flex h-[52px] items-center justify-center gap-2 rounded-full border text-[15px] font-semibold transition-colors ${
                  actif ? "border-dawn-400 bg-dawn-400 text-night-950 shadow-[0_0_24px_-6px_rgba(202,240,0,.6)]" : "border-white/10 bg-white/[0.04] text-cream/75"
                }`}
              >
                {v.icone}
                {v.lbl}
              </button>
            );
          })}
        </div>

        {/* Partager un sujet */}
        <div className="mt-4 rounded-[28px] border border-white/10 bg-night-900 p-3.5">
          <div className="flex items-start gap-3">
            <span className="mt-1 shrink-0">
              <Avatar pseudo={profile?.pseudo} url={profile?.avatar_url} size={46} />
            </span>
            <div className="min-w-0 flex-1 rounded-[22px] border border-white/10 bg-white/[0.05] p-1.5">
              <MentionField
                value={body}
                onChange={setBody}
                rows={2}
                placeholder="Partage un sujet de prière… (cite quelqu'un avec @)"
                className="w-full resize-none bg-transparent px-2.5 py-1.5 text-[15px] text-cream placeholder:text-cream/40 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2 px-1 pb-0.5">
                <VoiceRecorderButton userId={userId} onSend={postVoice} tone="dark" />
                <button
                  type="button"
                  onClick={post}
                  disabled={posting || !body.trim()}
                  aria-label={posting ? "Publication…" : "Publier"}
                  className="grid h-11 w-11 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_20px_-4px_rgba(202,240,0,.6)] transition-transform active:scale-95 disabled:opacity-40"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.6} aria-hidden>
                    <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <label className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] py-2 pl-3.5 pr-3 text-[14px] text-cream/85">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" strokeLinejoin="round" />
            </svg>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              aria-label="Visibilité"
              className="appearance-none bg-transparent pr-1 text-cream focus:outline-none [&>option]:bg-night-900"
            >
              <option value="public">Public, tout le monde</option>
              <option value="friends">Abonnés, ceux qui me suivent</option>
              <option value="private">Privé, moi seul</option>
            </select>
            <svg viewBox="0 0 24 24" className="pointer-events-none h-4 w-4 shrink-0 fill-none stroke-current text-cream/60" strokeWidth={2.2} aria-hidden>
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
        </div>

        {/* Intercesseurs de la semaine, du 1er au 10e */}
        <TopIntercessors />

        {/* Scrolle & prie : prier en scrollant, sans être dérangé */}
        <button
          type="button"
          onClick={() => setPrayerTime(true)}
          className="group relative mt-5 flex w-full items-center gap-4 overflow-hidden rounded-[28px] border border-dawn-400/35 bg-night-900 p-4 text-left shadow-[0_0_40px_-18px_rgba(202,240,0,.55)] transition-transform active:scale-[0.99]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-dawn-400/15 blur-3xl"
          />
          <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-dawn-400/35 bg-night-950 shadow-[0_0_26px_rgba(202,240,0,.22)]">
            <PrayerMark className="h-9 w-9" />
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="block font-display text-[19px] font-bold leading-tight text-cream">
              Scrolle <span className="text-dawn-400">&amp;</span> prie
            </span>
            <span className="mt-1 block text-[13px] leading-snug text-cream/60">
              Prie en scrollant, sans être dérangé : un sujet à la fois, en musique.
            </span>
          </span>
          <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_22px_-4px_rgba(202,240,0,.7)] transition-transform group-active:scale-95">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>

        {/* Fil (les styles clairs hérités des commentaires passent en sombre) */}
        <div className="profile-dark mt-5">
          {loading? (
            <p className="text-cream/50">Chargement du fil…</p>
          ): loadError? (
            <div className="rounded-[28px] border border-white/10 bg-night-900 p-5 text-center">
              <p className="font-semibold text-cream/85">Impossible de charger le mur de prière.</p>
              <p className="mt-1 text-sm text-cream/55">Vérifie ta connexion internet, puis réessaie.</p>
              <button type="button" onClick={load} className="btn-primary mt-4 text-sm">
                Réessayer
              </button>
            </div>
          ): shown.length === 0? (
            <p className="rounded-[28px] border border-white/10 bg-night-900 p-6 text-center text-cream/60">
              {vue === "reponses"
                  ? "Aucune prière exaucée pour l'instant — elles apparaîtront ici quand Dieu agit."
                  : vue === "amis"
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
                  apercu={apercus[p.id] ?? null}
                  grade={grades[p.author_id]}
                  onDeleted={load}
                  autoOpenComments={p.id === targetPrayer}
                  targetCommentId={p.id === targetPrayer ? targetComment : null}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Laisser un témoignage */}
        <Link
          href="/temoignages"
          className="mt-8 flex items-center justify-between gap-4 rounded-[28px] border border-dawn-400/30 bg-night-900 p-5"
        >
          <div>
            <p className="font-display text-[19px] font-bold">Dieu a agi dans ta vie&nbsp;?</p>
            <p className="mt-0.5 text-sm text-cream/60">Laisse ton témoignage et encourage la famille.</p>
          </div>
          <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-none stroke-current text-dawn-400" strokeWidth={2.2} aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Temps de prière plein écran ; au retour, on rafraîchit le fil pour
          voir les « J'ai prié » et commentaires laissés pendant la session. */}
      {prayerTime ? (
        <PrayerTime
          userId={userId}
          onClose={() => {
            setPrayerTime(false);
            load();
          }}
        />
      ) : null}
    </div>
  );
}
