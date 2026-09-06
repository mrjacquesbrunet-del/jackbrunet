"use client";

import { useEffect, useRef, useState } from "react";
import type { BadgeUnlock, BadgeTier } from "@/lib/badges";

/**
 * Célébration « Tu viens de décrocher un badge ! » — écoute l'évènement
 * global `jb:badge-unlocked` (déclenché par checkLocalBadges /
 * fetchProfileBadges) et affiche les paliers gagnés l'un après l'autre.
 */

const TIER_LABEL: Record<BadgeTier, string> = { bronze: "Bronze", argent: "Argent", or: "Or", platine: "Platine", diamant: "Diamant", elixir: "Élixir" };
const TIER_RING: Record<BadgeTier, string> = {
  bronze: "conic-gradient(from 210deg,#8a5a2b,#d29a5c,#f0c896,#8a5a2b)",
  argent: "conic-gradient(from 210deg,#8e9296,#d7dbdf,#f4f6f8,#8e9296)",
  or: "conic-gradient(from 210deg,#a06a00,#f2c14e,#ffe9a8,#a06a00)",
  platine: "conic-gradient(from 210deg,#5f7a86,#bcd6de,#f0fbff,#5f7a86)",
  diamant: "conic-gradient(from 210deg,#2f7fa8,#7fd6f5,#e8fbff,#2f7fa8)",
  elixir: "conic-gradient(from 210deg,#5b1f8a,#c05cf0,#ffd6ff,#5b1f8a)",
};

const CSS = `
@keyframes bcx-pop{0%{opacity:0;transform:scale(.5) translateY(30px)}60%{transform:scale(1.06) translateY(-4px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes bcx-veil{from{opacity:0}to{opacity:1}}
@keyframes bcx-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes bcx-ray{0%,100%{opacity:.25;transform:scale(.9)}50%{opacity:.7;transform:scale(1.08)}}
@keyframes bcx-tw{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1.2)}}
.bcx-card{animation:bcx-pop .45s cubic-bezier(.2,.9,.25,1.2) both}
.bcx-halo{animation:bcx-ray 2.2s ease-in-out infinite}
.bcx-tw{position:absolute;border-radius:9999px;background:#fff;animation:bcx-tw 1.6s ease-in-out infinite}
`;

export function BadgeCelebration() {
  const [queue, setQueue] = useState<BadgeUnlock[]>([]);
  const [current, setCurrent] = useState<BadgeUnlock | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onUnlock = (e: Event) => {
      const d = (e as CustomEvent<BadgeUnlock>).detail;
      if (d && d.kind && d.tier) setQueue((q) => [...q, d]);
    };
    window.addEventListener("jb:badge-unlocked", onUnlock);
    return () => window.removeEventListener("jb:badge-unlocked", onUnlock);
  }, []);

  // File d'attente : un badge à la fois, ~4 s chacun.
  useEffect(() => {
    if (current || queue.length === 0) return;
    const [head, ...rest] = queue;
    setCurrent(head);
    setQueue(rest);
    timer.current = setTimeout(() => setCurrent(null), 4200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [current, queue]);

  if (!current) return null;
  const t = current.tier;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center px-8" role="status">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <button
        type="button"
        aria-label="Fermer"
        onClick={() => {
          if (timer.current) clearTimeout(timer.current);
          setCurrent(null);
        }}
        className="absolute inset-0 bg-night-950/75 backdrop-blur-sm"
        style={{ animation: "bcx-veil .3s ease-out both" }}
      />
      <div className="bcx-card relative w-full max-w-xs rounded-3xl border border-white/10 bg-night-900 p-7 text-center text-cream shadow-2xl">
        {[
          { l: "12%", t2: "16%", s: 5, d: "0s" },
          { l: "86%", t2: "22%", s: 6, d: ".4s" },
          { l: "20%", t2: "78%", s: 4, d: ".8s" },
          { l: "78%", t2: "72%", s: 5, d: "1.1s" },
        ].map((sp, i) => (
          <span key={i} className="bcx-tw" style={{ left: sp.l, top: sp.t2, width: sp.s, height: sp.s, animationDelay: sp.d }} />
        ))}
        <p className="font-game text-[11px] font-black uppercase tracking-[0.25em] text-[#CAF000]">
          Badge décroché !
        </p>
        <div className="relative mx-auto mt-4 h-24 w-24">
          <span
            className="bcx-halo absolute -inset-3 rounded-full blur-md"
            style={{ background: TIER_RING[t], opacity: 0.35 }}
          />
          <span
            className="absolute inset-0 rounded-full p-[5px]"
            style={{ background: TIER_RING[t] }}
          >
            <span className="grid h-full w-full place-items-center rounded-full bg-night-800 text-[#CAF000]">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 18h16M5 16l-1-8 5 3 3-6 3 6 5-3-1 8z" />
              </svg>
            </span>
          </span>
        </div>
        <p className="mt-4 font-game text-xl font-black leading-tight">{current.label}</p>
        <p
          className="mt-1 inline-block rounded-full px-3 py-1 font-game text-[11px] font-black uppercase tracking-wider text-night-950"
          style={{ background: TIER_RING[t] }}
        >
          Palier {TIER_LABEL[t]}
        </p>
        <p className="mt-2 text-xs text-cream/60">{current.detail}</p>
      </div>
    </div>
  );
}
