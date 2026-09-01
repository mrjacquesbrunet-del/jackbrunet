"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { PrayerMark } from "@/components/ui/PrayerMark";
import { VoiceNotePlayer } from "@/components/community/VoiceNote";
import {
  voiceExpired,
  canRecordVoice,
  startRecording,
  uploadVoice,
  VOICE_MAX_SECONDS,
  type VoiceRecording,
} from "@/lib/voice";
import { startSoaking, stopSoaking, isSoakingPlaying } from "@/lib/soaking";
import {
  listPrayersForPrayerTime,
  reactionsFor,
  toggleReaction,
  addComment,
  type Prayer,
} from "@/lib/community";
import { listBlockedIds } from "@/lib/moderation";
import { bumpAchv, markDayStreak } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";

/**
 * « Temps de prière » — mode plein écran, focus total :
 * la musique de méditation (soaking, la même que la Bible) démarre, les sujets
 * de prière défilent UN PAR UN (scroll vertical, un sujet par écran). D'abord
 * les sujets de moins de 7 jours (mélangés), puis ceux de moins de 14 jours,
 * puis les plus anciens : celui qui veut prier toute une journée le peut.
 * Sur chaque sujet : « J'ai prié » et un mot d'encouragement. La croix en haut
 * à droite quitte et affiche le bilan : « Tu as prié pour X personnes ».
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000; // tranche d'ancienneté (7 jours)
// Au-delà de cette longueur, un sujet ne tient plus sur un écran avec les
// boutons : on le laisse sur le mur classique, hors du scroll.
const MAX_BODY_CHARS = 500;

/** Date du sujet, en discret : « aujourd'hui », « hier », « il y a X j »,
 * puis la date courte au-delà de deux semaines. */
function whenLabel(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d <= 0) return "aujourd'hui";
  if (d === 1) return "hier";
  if (d <= 14) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/** Taille de texte adaptée à la longueur du sujet (tout doit tenir à l'écran). */
function bodySizeClass(body: string): string {
  const n = body.trim().length;
  if (n <= 90) return "text-2xl leading-snug sm:text-3xl";
  if (n <= 180) return "text-xl leading-snug sm:text-2xl";
  if (n <= 320) return "text-base leading-relaxed sm:text-lg";
  return "text-sm leading-relaxed sm:text-base";
}
const INTRO_KEY = "jb.praytime.intro.v1"; // intro vue (une seule fois)

function localStorageIntroSeen(): boolean {
  try {
    return localStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

const PT_CSS = `
.pt-root{position:fixed;inset:0;z-index:120;background:
  radial-gradient(120% 60% at 50% -10%, #30302F 0%, transparent 60%),
  radial-gradient(90% 50% at 50% 115%, rgba(202,240,0,.14) 0%, transparent 60%),
  linear-gradient(180deg,#0C0C0B,#171716 55%,#0C0C0B);color:#F3F3ED}
.pt-scroll{height:100%;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.pt-scroll::-webkit-scrollbar{display:none}
.pt-slide{height:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5.5rem 1.5rem 2rem;position:relative;content-visibility:auto}
@keyframes pt-in{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
.pt-card{animation:pt-in .5s cubic-bezier(.2,.8,.3,1) both}
@keyframes pt-tw{0%,100%{opacity:.15;transform:scale(.8)}50%{opacity:.8;transform:scale(1.15)}}
.pt-tw{position:absolute;width:6px;height:6px;border-radius:9999px;background:#CAF000;filter:blur(.5px);animation:pt-tw 3.2s ease-in-out infinite;pointer-events:none}
.pt-pray{position:relative;background:linear-gradient(180deg,#D8F53A,#AAD000);color:#1a2000;box-shadow:0 6px 0 #5b7300,0 0 24px rgba(202,240,0,.35)}
.pt-pray:active{transform:translateY(3px);box-shadow:0 3px 0 #5b7300}
/* Halo pulsant peu coûteux : ombre FIXE sur un pseudo-élément dont seule
   l'OPACITÉ varie (compositée par le GPU) — l'animation d'ombre elle-même
   forçait des redessins permanents et faisait bégayer la musique. */
.pt-pray::after{content:"";position:absolute;inset:-4px;border-radius:9999px;box-shadow:0 0 36px 8px rgba(202,240,0,.5);opacity:0;animation:pt-glow 2.6s ease-in-out infinite;pointer-events:none}
@keyframes pt-glow{0%,100%{opacity:0}50%{opacity:1}}
.pt-done{background:#1E1E1D;color:#CAF000;border:1px solid rgba(202,240,0,.35);box-shadow:none;animation:none}
@keyframes pt-burst{0%{opacity:1;transform:translate(-50%,-50%) scale(.4)}100%{opacity:0;transform:translate(-50%,-50%) scale(2.4)}}
.pt-burst{position:absolute;left:50%;top:50%;width:120px;height:120px;border-radius:9999px;border:3px solid #CAF000;animation:pt-burst .7s ease-out both;pointer-events:none}
@keyframes pt-rec{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.45)}50%{box-shadow:0 0 0 16px rgba(239,68,68,0)}}
.pt-recing{background:linear-gradient(180deg,#f87171,#dc2626);color:#fff;animation:pt-rec 1.4s ease-out infinite}
@keyframes pt-hint{0%,100%{transform:translateY(0);opacity:.55}50%{transform:translateY(7px);opacity:1}}
.pt-hint{animation:pt-hint 1.8s ease-in-out infinite}
@keyframes pt-endpop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
.pt-end{animation:pt-endpop .5s cubic-bezier(.2,.8,.3,1) both}
@keyframes pt-step{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}
.pt-step{animation:pt-step .55s cubic-bezier(.2,.8,.3,1) both}
@keyframes pt-up{0%{transform:translateY(12px);opacity:0}30%{opacity:1}100%{transform:translateY(-14px);opacity:0}}
.pt-up{animation:pt-up 1.7s ease-in-out infinite}
`;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PrayerTime({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [prayers, setPrayers] = useState<Prayer[] | null>(null);
  const [prayed, setPrayed] = useState<Set<string>>(new Set()); // déjà « prié » (avant + pendant)
  const [sessionPrayed, setSessionPrayed] = useState(0); // compteur de CE temps de prière
  const [burst, setBurst] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);

  // Fin de session (écran « Tu as prié pour X personnes ») → badge
  // « Scrolleur du ciel » + vérification des paliers fraîchement atteints.
  useEffect(() => {
    if (!ended) return;
    bumpAchv("pray_sessions");
    checkLocalBadges();
  }, [ended]);
  // Micro disponible ? (même garde-fou de version native que VoiceRecorderButton)
  const [micOk, setMicOk] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedMusic = useRef(false);
  // Sujets encore sans AUCUN « Je prie » (pour le badge « Premier au front »).
  const virginIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      if (!canRecordVoice()) return;
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const { App } = await import("@capacitor/app");
          const info = await App.getInfo();
          const [maj = 0, min = 0] = String(info.version)
            .split(".")
            .map((x) => parseInt(x, 10) || 0);
          if (maj < 1 || (maj === 1 && min < 8)) return;
        }
        setMicOk(true);
      } catch {
        setMicOk(true);
      }
    })();
  }, []);

  // Écran d'introduction animé : seulement à la PREMIÈRE utilisation (il
  // explique les gestes) ; ensuite on entre directement dans la prière.
  const [intro, setIntro] = useState(() => {
    try {
      return localStorage.getItem(INTRO_KEY) !== "1";
    } catch {
      return true;
    }
  });

  function startMusic() {
    if (!isSoakingPlaying()) {
      startedMusic.current = true;
      startSoaking();
    }
  }

  // Intro déjà vue → musique dès l'entrée ; en sortant, on ne coupe que ce
  // qu'on a lancé nous-mêmes.
  useEffect(() => {
    if (localStorageIntroSeen()) startMusic();
    return () => {
      if (startedMusic.current) stopSoaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function begin() {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* stockage indisponible */
    }
    startMusic();
    setIntro(false);
  }

  // Verrouille le défilement de la page derrière.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Charge les sujets : pas les miens, pas les bloqués, pas les exaucés.
  // Ordre : les moins de 7 jours d'abord (mélangés), puis 7-14 jours, puis
  // 14-21 jours, etc. — mélangés dans chaque tranche : le fil ne s'arrête
  // que quand TOUT le mur a été porté.
  useEffect(() => {
    let alive = true;
    (async () => {
      const [all, blocked] = await Promise.all([listPrayersForPrayerTime(), listBlockedIds()]);
      if (!alive) return;
      const now = Date.now();
      const candidates = all.filter(
        (p) =>
          p.author_id !== userId &&
          !blocked.includes(p.author_id) &&
          !p.answered &&
          p.body.trim().length <= MAX_BODY_CHARS,
      );
      // On ne repropose JAMAIS un sujet pour lequel on a déjà prié
      // (réaction « Je prie » posée aujourd'hui ou lors d'une session passée).
      const rx = await reactionsFor(candidates.map((p) => p.id));
      if (!alive) return;
      const alreadyPrayed = new Set(
        rx.filter((r) => r.user_id === userId && r.type === "pray").map((r) => r.prayer_id),
      );
      const anyPray = new Set(rx.filter((r) => r.type === "pray").map((r) => r.prayer_id));
      virginIds.current = new Set(candidates.filter((p) => !anyPray.has(p.id)).map((p) => p.id));
      const fresh = candidates.filter((p) => !alreadyPrayed.has(p.id));
      const tiers = new Map<number, Prayer[]>();
      for (const p of fresh) {
        const tier = Math.floor((now - new Date(p.created_at).getTime()) / WEEK_MS);
        const list = tiers.get(tier) ?? [];
        list.push(p);
        tiers.set(tier, list);
      }
      const pool = [...tiers.keys()].sort((a, b) => a - b).flatMap((t) => shuffle(tiers.get(t)!));
      setPrayers(pool);
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  function next(after: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: (after + 1) * el.clientHeight, behavior: "smooth" });
  }

  async function pray(p: Prayer, at: number) {
    if (prayed.has(p.id)) {
      next(at);
      return;
    }
    setPrayed((s) => new Set(s).add(p.id));
    setSessionPrayed((n) => n + 1);
    setBurst(p.id);
    setTimeout(() => setBurst(null), 750);
    // Badges : série de jours en prière + « Premier au front ».
    markDayStreak("pray");
    if (virginIds.current.has(p.id)) {
      virginIds.current.delete(p.id);
      bumpAchv("first_prayers");
    }
    void toggleReaction(p.id, userId, "pray", true);
    setTimeout(() => next(at), 650);
  }

  const twinkles = useMemo(
    () =>
      [
        { left: "12%", top: "18%", d: "0s" },
        { left: "85%", top: "12%", d: "1.1s" },
        { left: "78%", top: "72%", d: ".6s" },
        { left: "18%", top: "80%", d: "1.7s" },
        { left: "50%", top: "8%", d: "2.2s" },
      ] as const,
    [],
  );

  /* ---------- Intro animée (première utilisation seulement) ---------- */
  if (intro) {
    return (
      <div className="pt-root grid place-items-center overflow-y-auto px-6 py-10">
        <style>{PT_CSS}</style>
        {twinkles.map((t, i) => (
          <span key={i} className="pt-tw" style={{ left: t.left, top: t.top, animationDelay: t.d }} />
        ))}
        <div className="absolute right-4 top-[calc(env(safe-area-inset-top)+0.9rem)]">
          <CloseX onClick={onClose} />
        </div>

        <div className="w-full max-w-sm">
          <div
            className="pt-step mx-auto grid h-20 w-20 place-items-center rounded-full border border-dawn-400/40 bg-night-900"
            style={{ boxShadow: "0 0 50px rgba(202,240,0,.28)" }}
          >
            <PrayerMark className="h-12 w-12" />
          </div>
          <h2 className="pt-step mt-5 text-center font-display text-3xl font-extrabold" style={{ animationDelay: ".1s" }}>
            Scrolle <span className="text-dawn-300">&amp;</span> prie
          </h2>
          <p className="pt-step mt-2 text-center text-sm text-cream/65" style={{ animationDelay: ".2s" }}>
            Ta génération scrolle. Ici, chaque scroll porte quelqu&apos;un dans la prière — un sujet à la fois, en musique.
          </p>

          <div className="mt-7 space-y-3.5">
            <div className="pt-step flex items-center gap-3.5" style={{ animationDelay: ".35s" }}>
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-night-900 text-dawn-300">
                <svg viewBox="0 0 24 24" className="pt-up h-6 w-6 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
              </span>
              <p className="text-sm text-cream/85">
                <span className="font-bold text-cream">Glisse vers le haut</span> pour passer au sujet suivant.
              </p>
            </div>

            <div className="pt-step flex items-center gap-3.5" style={{ animationDelay: ".5s" }}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-night-900">
                <PrayerMark className="h-7 w-7" />
              </span>
              <p className="text-sm text-cream/85">
                <span className="font-bold text-cream">« Je prie »</span> : la personne saura que tu as prié pour elle.
              </p>
            </div>

            <div className="pt-step flex items-center gap-3.5" style={{ animationDelay: ".65s" }}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-dawn-400/35 bg-night-900 text-dawn-300">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.7} aria-hidden>
                  <path
                    d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-sm text-cream/85">
                <span className="font-bold text-cream">Le gros micro</span> : prie à voix haute, ta prière part dans les
                commentaires du sujet.
              </p>
            </div>

            <div className="pt-step flex items-center gap-3.5" style={{ animationDelay: ".8s" }}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-night-900 text-cream/85">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.7} aria-hidden>
                  <path
                    d="M21 12a8 8 0 0 1-8 8H5.6L3 21.4V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-sm text-cream/85">
                <span className="font-bold text-cream">La bulle</span> : laisse un mot d&apos;encouragement écrit.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={begin}
            className="pt-pray pt-step mt-8 w-full rounded-full py-4 font-display text-lg font-extrabold"
            style={{ animationDelay: ".95s" }}
          >
            Commencer
          </button>
          <p className="pt-step mt-3 text-center text-[11px] text-cream/45" style={{ animationDelay: "1.05s" }}>
            La musique t&apos;accompagne pendant tout ton temps de prière.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Écran de fin (croix ou liste terminée) ---------- */
  if (ended) {
    return (
      <div className="pt-root grid place-items-center px-6">
        <style>{PT_CSS}</style>
        {twinkles.map((t, i) => (
          <span key={i} className="pt-tw" style={{ left: t.left, top: t.top, animationDelay: t.d }} />
        ))}
        <div className="pt-end w-full max-w-sm text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-dawn-400/40 bg-night-900" style={{ boxShadow: "0 0 60px rgba(202,240,0,.3)" }}>
            <PrayerMark className="h-14 w-14" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-extrabold">
            {sessionPrayed > 0 ? (
              <>
                Tu as prié pour{" "}
                <span className="text-dawn-300">
                  {sessionPrayed} personne{sessionPrayed > 1 ? "s" : ""}
                </span>
              </>
            ) : (
              "Merci d'être venu(e) prier"
            )}
          </h2>
          <p className="mt-3 text-cream/65">
            {sessionPrayed > 0
              ? "La famille RHEMA est portée par tes prières. Elles seront prévenues que tu as prié pour elles."
              : "Reviens quand tu veux, le mur a toujours besoin d'intercesseurs."}
          </p>
          <p className="mt-4 border-l-2 border-dawn-400 pl-3 text-left text-sm italic text-cream/75">
            « Priez les uns pour les autres, afin que vous soyez guéris. »
            <span className="mt-0.5 block text-xs font-semibold not-italic text-dawn-300">Jacques 5:16</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="pt-pray mt-8 w-full rounded-full py-3.5 font-display text-base font-extrabold"
          >
            Retour au mur de prière
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Chargement / aucun sujet ---------- */
  if (prayers === null || prayers.length === 0) {
    return (
      <div className="pt-root grid place-items-center px-6">
        <style>{PT_CSS}</style>
        <div className="absolute right-4 top-[calc(env(safe-area-inset-top)+0.9rem)]">
          <CloseX onClick={() => (sessionPrayed > 0 ? setEnded(true) : onClose())} />
        </div>
        {prayers === null ? (
          <p className="text-cream/60">Préparation de ton temps de prière…</p>
        ) : (
          <div className="text-center">
            <PrayerMark className="mx-auto h-14 w-14" />
            <p className="mt-4 font-display text-xl font-bold">Aucun nouveau sujet à porter</p>
            <p className="mt-2 text-sm text-cream/60">
              Tu as déjà prié pour les sujets du moment. Reviens quand la famille en aura publié de nouveaux.
            </p>
            <button type="button" onClick={onClose} className="pt-pray mt-6 rounded-full px-8 py-3 font-display font-extrabold">
              Retour au mur
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Le fil plein écran ---------- */
  return (
    <div className="pt-root">
      <style>{PT_CSS}</style>
      {twinkles.map((t, i) => (
        <span key={i} className="pt-tw" style={{ left: t.left, top: t.top, animationDelay: t.d }} />
      ))}

      {/* En-tête fixe : titre + croix pour quitter (pas de compteur : on prie
          aussi longtemps qu'on veut, sans notion de progression) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.9rem)]">
        <div className="rounded-full border border-white/10 bg-night-950/70 px-3.5 py-1.5 backdrop-blur">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-dawn-300">
            <PrayerMark className="h-3.5 w-3.5" />
            Scrolle &amp; prie
          </p>
        </div>
        <CloseX onClick={() => setEnded(true)} />
      </div>

      <div ref={scrollRef} className="pt-scroll">
        {prayers.map((p, i) => {
          const hasPrayed = prayed.has(p.id);
          return (
            <section key={p.id} className="pt-slide">
              <div className="pt-card w-full max-w-md">
                {/* Auteur */}
                <div className="flex items-center justify-center gap-2.5">
                  <Avatar pseudo={p.author?.pseudo} url={p.author?.avatar_url} size={38} streak={p.author?.streak_days} badge={p.author?.badge_tier} />
                  <div className="text-left">
                    <p className="flex items-center gap-1 text-sm font-bold">
                      {p.author?.pseudo ?? "Un membre"}
                      {p.author?.verified ? <VerifiedBadge className="h-4 w-4" /> : null}
                    </p>
                    <p className="text-[11px] text-cream/50">
                      demande la prière <span className="text-cream/35">· {whenLabel(p.created_at)}</span>
                    </p>
                  </div>
                </div>

                {/* Le sujet, au centre, en grand (taille adaptée à sa longueur) */}
                <p className={`mt-6 text-balance text-center font-display font-bold ${bodySizeClass(p.body)}`}>
                  {p.body}
                </p>
                {p.audio_url && !voiceExpired(p.created_at) ? (
                  <div className="mx-auto mt-5 max-w-xs">
                    <VoiceNotePlayer src={p.audio_url} />
                  </div>
                ) : null}

                {/* Actions : Je prie · gros micro (vocal → commentaire) · message */}
                <div className="relative mx-auto mt-9 w-full max-w-sm">
                  {burst === p.id ? <span className="pt-burst" /> : null}
                  <SlideActions
                    p={p}
                    userId={userId}
                    micOk={micOk}
                    hasPrayed={hasPrayed}
                    onPray={() => pray(p, i)}
                  />
                </div>
              </div>

              {/* Indice de défilement (sauf dernier écran) */}
              {i < prayers.length - 1 ? (
                <div className="pt-hint absolute bottom-[calc(env(safe-area-inset-bottom)+0.9rem)] left-1/2 -translate-x-1/2 text-cream/60">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" aria-hidden>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              ) : null}
            </section>
          );
        })}

        {/* Dernier écran du fil : tout a été porté */}
        <section className="pt-slide">
          <div className="pt-card w-full max-w-sm text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-dawn-400/40 bg-night-900" style={{ boxShadow: "0 0 50px rgba(202,240,0,.28)" }}>
              <PrayerMark className="h-12 w-12" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-extrabold">Tu as porté tout le mur</h3>
            <p className="mt-2 text-sm text-cream/65">Chaque sujet du mur de prière est passé devant toi. Merci pour eux.</p>
            <button
              type="button"
              onClick={() => setEnded(true)}
              className="pt-pray mt-6 w-full rounded-full py-3.5 font-display font-extrabold"
            >
              Terminer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Les trois actions d'un sujet : « Je prie » (réaction sur la publication),
 * GROS micro au centre (le vocal part en commentaire de la publication) et
 * bulle message (encouragement écrit → commentaire). Tout part directement
 * sur la publication, sans quitter le mode.
 */
function SlideActions({
  p,
  userId,
  micOk,
  hasPrayed,
  onPray,
}: {
  p: Prayer;
  userId: string;
  micOk: boolean;
  hasPrayed: boolean;
  onPray: () => void;
}) {
  const [mode, setMode] = useState<"idle" | "rec" | "preview" | "sendingVoice" | "text">("idle");
  const [seconds, setSeconds] = useState(0);
  const [pending, setPending] = useState<{ blob: Blob; url: string } | null>(null);
  const [text, setText] = useState("");
  const [sendingText, setSendingText] = useState(false);
  const [done, setDone] = useState<"" | "vocal" | "texte">("");
  const [err, setErr] = useState("");
  const recRef = useRef<VoiceRecording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      recRef.current?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  async function beginRec() {
    setErr("");
    setDone("");
    try {
      recRef.current = await startRecording();
    } catch {
      setErr("Micro refusé. Autorise-le dans les réglages du téléphone.");
      setTimeout(() => setErr(""), 3500);
      return;
    }
    setSeconds(0);
    setMode("rec");
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= VOICE_MAX_SECONDS) void stopRec();
        return s + 1;
      });
    }, 1000);
  }

  async function stopRec() {
    if (timerRef.current) clearInterval(timerRef.current);
    const rec = recRef.current;
    recRef.current = null;
    if (!rec) {
      setMode("idle");
      return;
    }
    const blob = await rec.stop();
    if (!blob || blob.size < 1000) {
      setErr("Enregistrement trop court.");
      setTimeout(() => setErr(""), 2500);
      setMode("idle");
      return;
    }
    setPending({ blob, url: URL.createObjectURL(blob) });
    setMode("preview");
  }

  function cancelPending() {
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);
    setMode("idle");
  }

  /** Envoie le vocal en COMMENTAIRE de la publication (expire après 7 jours). */
  async function sendVoice() {
    if (!pending) return;
    setMode("sendingVoice");
    setErr("");
    const url = await uploadVoice(userId, pending.blob);
    if (url) {
      const ok = await addComment(p.id, "Note vocale", userId, null, url);
      if (ok) {
        bumpAchv("voice_prayers");
        checkLocalBadges();
        URL.revokeObjectURL(pending.url);
        setPending(null);
        setMode("idle");
        setDone("vocal");
        return;
      }
    }
    setErr("Échec de l'envoi. Vérifie ta connexion et réessaie.");
    setMode("preview");
  }

  /** Envoie l'encouragement écrit en commentaire de la publication. */
  async function sendText() {
    const t = text.trim();
    if (!t || sendingText) return;
    setSendingText(true);
    await addComment(p.id, t, userId);
    setSendingText(false);
    setText("");
    setMode("idle");
    setDone("texte");
  }

  const recording = mode === "rec";

  return (
    <div>
      {/* La rangée des trois boutons */}
      <div className="flex items-start justify-center gap-8">
        {/* Je prie — la réaction qu'on connaît, posée sur la publication */}
        <div className="flex w-16 flex-col items-center gap-1.5 pt-3">
          <button
            type="button"
            onClick={onPray}
            aria-label={hasPrayed ? "Tu as prié" : "Je prie"}
            className={`grid h-14 w-14 place-items-center rounded-full transition-transform active:scale-95 ${
              hasPrayed ? "pt-done" : "border border-white/15 bg-night-900/80"
            }`}
          >
            <PrayerMark className="h-8 w-8" />
          </button>
          <span className={`text-[11px] font-bold ${hasPrayed ? "text-dawn-300" : "text-cream/70"}`}>
            {hasPrayed ? "Tu pries" : "Je prie"}
          </span>
        </div>

        {/* Le GROS micro : prie à voix haute, le vocal part en commentaire */}
        {micOk ? (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={recording ? stopRec : mode === "idle" ? beginRec : undefined}
              aria-label={recording ? "Terminer l'enregistrement" : "Prier en vocal"}
              className={`grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full transition-transform active:scale-95 ${
                recording ? "pt-recing" : "pt-pray"
              }`}
            >
              {recording ? (
                <svg viewBox="0 0 24 24" className="h-9 w-9 fill-current" aria-hidden>
                  <rect x="7" y="7" width="10" height="10" rx="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-11 w-11 fill-none stroke-current" strokeWidth={1.7} aria-hidden>
                  <path
                    d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <span className={`text-[11px] font-bold tabular-nums ${recording ? "text-red-300" : "text-cream/70"}`}>
              {recording
                ? `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`
                : "Prier en vocal"}
            </span>
          </div>
        ) : null}

        {/* Bulle message : un mot d'encouragement, en commentaire */}
        <div className="flex w-16 flex-col items-center gap-1.5 pt-3">
          <button
            type="button"
            onClick={() => {
              setDone("");
              setMode(mode === "text" ? "idle" : "text");
            }}
            aria-label="Laisser un encouragement écrit"
            className={`grid h-14 w-14 place-items-center rounded-full transition-transform active:scale-95 ${
              mode === "text" ? "bg-dawn-400 text-night-950" : "border border-white/15 bg-night-900/80 text-cream/85"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.7} aria-hidden>
              <path
                d="M21 12a8 8 0 0 1-8 8H5.6L3 21.4V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="text-[11px] font-bold text-cream/70">Encourager</span>
        </div>
      </div>

      {/* Pré-écoute du vocal avant envoi */}
      {mode === "preview" || mode === "sendingVoice" ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-night-900/85 p-3">
          {pending ? <VoiceNotePlayer src={pending.url} tone="dark" /> : null}
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={cancelPending}
              disabled={mode === "sendingVoice"}
              className="flex-1 rounded-full border border-white/15 py-2.5 text-sm font-bold text-cream/70 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={sendVoice}
              disabled={mode === "sendingVoice"}
              className="flex-1 rounded-full bg-dawn-400 py-2.5 text-sm font-bold text-night-950 disabled:opacity-60"
            >
              {mode === "sendingVoice" ? "Envoi…" : "Envoyer ma prière"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-cream/45">Ta prière vocale reste écoutable 7 jours dans les commentaires.</p>
        </div>
      ) : null}

      {/* Encouragement écrit */}
      {mode === "text" ? (
        <div className="mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            autoFocus
            placeholder={`Encourage ${p.author?.pseudo ?? "ce membre"}…`}
            className="w-full resize-none rounded-2xl border border-white/15 bg-night-900/90 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-dawn-400/60 focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("idle");
                setText("");
              }}
              className="flex-1 rounded-full border border-white/15 py-2.5 text-sm font-bold text-cream/70"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={sendText}
              disabled={sendingText || !text.trim()}
              className="flex-1 rounded-full bg-dawn-400 py-2.5 text-sm font-bold text-night-950 disabled:opacity-40"
            >
              {sendingText ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </div>
      ) : null}

      {done ? (
        <p className="mt-3 text-center text-xs font-semibold text-dawn-300">
          {done === "vocal" ? "Prière vocale envoyée dans les commentaires" : "Encouragement envoyé dans les commentaires"}
        </p>
      ) : null}
      {err ? <p className="mt-3 text-center text-xs font-semibold text-red-300">{err}</p> : null}
    </div>
  );
}

/** Croix de sortie, en haut à droite. */
function CloseX({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Quitter Scrolle & prie"
      className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-night-950/70 text-cream/85 backdrop-blur transition-colors hover:text-cream"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}
