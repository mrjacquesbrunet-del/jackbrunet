"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { PrayerMark } from "@/components/ui/PrayerMark";
import { VoiceNotePlayer } from "@/components/community/VoiceNote";
import { voiceExpired } from "@/lib/voice";
import { startSoaking, stopSoaking, isSoakingPlaying } from "@/lib/soaking";
import {
  listPrayersForPrayerTime,
  reactionsFor,
  toggleReaction,
  addComment,
  type Prayer,
} from "@/lib/community";
import { listBlockedIds } from "@/lib/moderation";

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

const PT_CSS = `
.pt-root{position:fixed;inset:0;z-index:120;background:
  radial-gradient(120% 60% at 50% -10%, #30302F 0%, transparent 60%),
  radial-gradient(90% 50% at 50% 115%, rgba(202,240,0,.14) 0%, transparent 60%),
  linear-gradient(180deg,#0C0C0B,#171716 55%,#0C0C0B);color:#F3F3ED}
.pt-scroll{height:100%;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.pt-scroll::-webkit-scrollbar{display:none}
.pt-slide{height:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5.5rem 1.5rem 2rem;position:relative}
@keyframes pt-in{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
.pt-card{animation:pt-in .5s cubic-bezier(.2,.8,.3,1) both}
@keyframes pt-tw{0%,100%{opacity:.15;transform:scale(.8)}50%{opacity:.8;transform:scale(1.15)}}
.pt-tw{position:absolute;width:6px;height:6px;border-radius:9999px;background:#CAF000;filter:blur(.5px);animation:pt-tw 3.2s ease-in-out infinite;pointer-events:none}
@keyframes pt-pulse{0%,100%{box-shadow:0 6px 0 #5b7300,0 0 24px rgba(202,240,0,.35)}50%{box-shadow:0 6px 0 #5b7300,0 0 44px rgba(202,240,0,.6)}}
.pt-pray{background:linear-gradient(180deg,#D8F53A,#AAD000);color:#1a2000;box-shadow:0 6px 0 #5b7300,0 0 24px rgba(202,240,0,.35);animation:pt-pulse 2.6s ease-in-out infinite}
.pt-pray:active{transform:translateY(3px);box-shadow:0 3px 0 #5b7300}
.pt-done{background:#1E1E1D;color:#CAF000;border:1px solid rgba(202,240,0,.35);box-shadow:none;animation:none}
@keyframes pt-burst{0%{opacity:1;transform:translate(-50%,-50%) scale(.4)}100%{opacity:0;transform:translate(-50%,-50%) scale(2.4)}}
.pt-burst{position:absolute;left:50%;top:50%;width:120px;height:120px;border-radius:9999px;border:3px solid #CAF000;animation:pt-burst .7s ease-out both;pointer-events:none}
@keyframes pt-hint{0%,100%{transform:translateY(0);opacity:.55}50%{transform:translateY(7px);opacity:1}}
.pt-hint{animation:pt-hint 1.8s ease-in-out infinite}
@keyframes pt-endpop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
.pt-end{animation:pt-endpop .5s cubic-bezier(.2,.8,.3,1) both}
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
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [sentFor, setSentFor] = useState<Set<string>>(new Set());
  const [ended, setEnded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedMusic = useRef(false);

  // Musique : on lance le soaking (même ambiance que la Bible) si elle ne joue
  // pas déjà, et on ne coupe en sortant que ce qu'on a lancé nous-mêmes.
  useEffect(() => {
    if (!isSoakingPlaying()) {
      startedMusic.current = true;
      startSoaking();
    }
    return () => {
      if (startedMusic.current) stopSoaking();
    };
  }, []);

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
        (p) => p.author_id !== userId && !blocked.includes(p.author_id) && !p.answered,
      );
      const tiers = new Map<number, Prayer[]>();
      for (const p of candidates) {
        const tier = Math.floor((now - new Date(p.created_at).getTime()) / WEEK_MS);
        const list = tiers.get(tier) ?? [];
        list.push(p);
        tiers.set(tier, list);
      }
      const pool = [...tiers.keys()].sort((a, b) => a - b).flatMap((t) => shuffle(tiers.get(t)!));
      setPrayers(pool);
      const rx = await reactionsFor(pool.map((p) => p.id));
      if (!alive) return;
      setPrayed(new Set(rx.filter((r) => r.user_id === userId && r.type === "pray").map((r) => r.prayer_id)));
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
    void toggleReaction(p.id, userId, "pray", true);
    setTimeout(() => next(at), 650);
  }

  async function sendComment(p: Prayer) {
    const text = commentText.trim();
    if (!text || sending) return;
    setSending(true);
    await addComment(p.id, text, userId);
    setSending(false);
    setSentFor((s) => new Set(s).add(p.id));
    setCommentText("");
    setCommentFor(null);
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
          <p className="text-cream/60">Préparation du temps de prière…</p>
        ) : (
          <div className="text-center">
            <PrayerMark className="mx-auto h-14 w-14" />
            <p className="mt-4 font-display text-xl font-bold">Aucun sujet à porter pour le moment</p>
            <p className="mt-2 text-sm text-cream/60">Les sujets de prière du mur apparaissent ici.</p>
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
            Temps de prière
          </p>
        </div>
        <CloseX onClick={() => setEnded(true)} />
      </div>

      <div ref={scrollRef} className="pt-scroll">
        {prayers.map((p, i) => {
          const hasPrayed = prayed.has(p.id);
          const isCommenting = commentFor === p.id;
          return (
            <section key={p.id} className="pt-slide">
              <div className="pt-card w-full max-w-md">
                {/* Auteur */}
                <div className="flex items-center justify-center gap-2.5">
                  <Avatar pseudo={p.author?.pseudo} url={p.author?.avatar_url} size={38} streak={p.author?.streak_days} />
                  <div className="text-left">
                    <p className="flex items-center gap-1 text-sm font-bold">
                      {p.author?.pseudo ?? "Un membre"}
                      {p.author?.verified ? <VerifiedBadge className="h-4 w-4" /> : null}
                    </p>
                    <p className="text-[11px] text-cream/50">demande la prière</p>
                  </div>
                </div>

                {/* Le sujet, au centre, en grand */}
                <p className="mt-6 text-balance text-center font-display text-2xl font-bold leading-snug sm:text-3xl">
                  {p.body}
                </p>
                {p.audio_url && !voiceExpired(p.created_at) ? (
                  <div className="mx-auto mt-5 max-w-xs">
                    <VoiceNotePlayer src={p.audio_url} />
                  </div>
                ) : null}

                {/* Actions */}
                <div className="relative mx-auto mt-9 w-full max-w-xs">
                  {burst === p.id ? <span className="pt-burst" /> : null}
                  <button
                    type="button"
                    onClick={() => pray(p, i)}
                    className={`w-full rounded-full py-4 font-display text-lg font-extrabold transition-transform ${hasPrayed ? "pt-done" : "pt-pray"}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <PrayerMark className="h-6 w-6" />
                      {hasPrayed ? "Tu as prié" : "J'ai prié"}
                    </span>
                  </button>

                  {isCommenting ? (
                    <div className="mt-3">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={2}
                        autoFocus
                        placeholder={`Encourage ${p.author?.pseudo ?? "ce membre"}…`}
                        className="w-full resize-none rounded-2xl border border-white/15 bg-night-900/90 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-dawn-400/60 focus:outline-none"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCommentFor(null);
                            setCommentText("");
                          }}
                          className="flex-1 rounded-full border border-white/15 py-2.5 text-sm font-bold text-cream/70"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => sendComment(p)}
                          disabled={sending || !commentText.trim()}
                          className="flex-1 rounded-full bg-dawn-400 py-2.5 text-sm font-bold text-night-950 disabled:opacity-40"
                        >
                          {sending ? "Envoi…" : "Envoyer"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCommentFor(p.id);
                        setCommentText("");
                      }}
                      className="mt-3 w-full rounded-full border border-white/15 bg-night-900/70 py-3 text-sm font-bold text-cream/85"
                    >
                      {sentFor.has(p.id) ? "Encouragement envoyé — en écrire un autre" : "Laisser un encouragement"}
                    </button>
                  )}
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

/** Croix de sortie, en haut à droite. */
function CloseX({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Quitter le temps de prière"
      className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-night-950/70 text-cream/85 backdrop-blur transition-colors hover:text-cream"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}
