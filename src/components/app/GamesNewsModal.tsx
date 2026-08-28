"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";

/** v2 : refonte de l'espace Jeux (icônes 3D, podium, ligue, défis) — le pop-up
 * réapparaît une fois, même pour ceux qui avaient fermé la v1. */
const SEEN_KEY = "jb.news.games.v2";

const S = (d: string) => (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconTrophy = S("M8 4h8v3a4 4 0 0 1-8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M9 20h6M12 12v4");
const IconSword = S("M14.5 4H20v5.5L9.5 20 4 14.5zM15 9l-6 6M4 20l3-3");
const IconPlay = S("M8 5v14l11-7z");
const IconClose = S("M6 6l12 12M18 6L6 18");
const IconSpark = S("M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8");

const GAMES = [
  { img: "/img/jeux/quiz.png", label: "Quiz" },
  { img: "/img/jeux/memoriser.png", label: "Mémoriser" },
  { img: "/img/jeux/quisuisje.png", label: "Qui suis-je" },
  { img: "/img/jeux/vraifaux.png", label: "Vrai ou Faux" },
];

const CSS = `
@keyframes gm-in{0%{transform:translateY(28px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes gm-pop{0%{transform:scale(.5) translateY(8px);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1) translateY(0);opacity:1}}
@keyframes gm-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes gm-tw{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:.9;transform:scale(1.15)}}
@keyframes gm-glow{0%,100%{box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 5px 0 #5b7300,0 0 0 rgba(202,240,0,0)}50%{box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 5px 0 #5b7300,0 0 26px rgba(202,240,0,.45)}}
.gm-tw{position:absolute;border-radius:9999px;background:#CAF000;animation:gm-tw 2.6s ease-in-out infinite;pointer-events:none}
`;

export function GamesNewsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = !!localStorage.getItem(SEEN_KEY);
    } catch {
      /* stockage indisponible */
    }
    if (seen) return;
    // Petit délai pour ne pas surgir brutalement à l'ouverture.
    const t = setTimeout(() => setOpen(true), 1100);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Fermer" onClick={close} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[2rem] border border-[#CAF000]/25 bg-gradient-to-b from-[#1E1E1D] via-[#171716] to-[#0C0C0B] text-cream shadow-2xl sm:rounded-[2rem]"
        style={{ animation: "gm-in .35s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 0 40px rgba(202,240,0,.12), 0 24px 60px rgba(0,0,0,.6)" }}
      >
        <style dangerouslySetInnerHTML={{ __html: CSS }} />

        {/* Étincelles */}
        <span className="gm-tw" style={{ left: "10%", top: "12%", width: 5, height: 5 }} />
        <span className="gm-tw" style={{ right: "12%", top: "8%", width: 6, height: 6, animationDelay: ".7s" }} />
        <span className="gm-tw" style={{ left: "30%", top: "5%", width: 4, height: 4, animationDelay: "1.4s" }} />
        <span className="gm-tw" style={{ right: "28%", top: "20%", width: 4, height: 4, animationDelay: "2s" }} />

        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream/70"
        >
          <IconClose className="h-4 w-4" />
        </button>

        {/* Héros */}
        <div className="relative px-6 pt-8 text-center">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#CAF000]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-10 h-40 w-40 rounded-full bg-[#CAF000]/10 blur-3xl" />
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#D8F53A] to-[#AAD000] px-4 py-1 font-game text-xs font-extrabold uppercase tracking-wide text-night-950">
            <IconSpark className="h-3.5 w-3.5" /> Nouveau
          </span>
          <h2 className="relative mt-3 font-game text-3xl font-black leading-tight">
            L&apos;espace <span className="text-[#CAF000]">Jeux</span> fait peau neuve&nbsp;!
          </h2>
          <p className="relative mx-auto mt-2 max-w-xs font-game text-sm font-semibold text-cream/70">
            Apprends la Bible en t&apos;amusant, seul ou contre tes amis.
          </p>

          {/* Les 4 jeux — icônes 3D */}
          <div className="relative mt-5 flex items-end justify-center gap-2">
            {GAMES.map((g, i) => (
              <div key={g.label} className="flex flex-col items-center" style={{ animation: `gm-pop .45s cubic-bezier(.2,.8,.2,1) ${0.15 + i * 0.12}s both` }}>
                <span style={{ animation: `gm-float 3.2s ease-in-out ${i * 0.4}s infinite` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(g.img)} alt="" className="h-16 w-16 object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,.5)]" />
                </span>
                <span className="mt-1 font-game text-[10px] font-bold text-cream/60">{g.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nouveautés */}
        <div className="mt-6 space-y-2.5 px-6">
          <Feature Icon={IconPlay} tint="#CAF000" title="4 jeux, nouveau look" desc="Interfaces refaites, illustrations 3D, animations." />
          <Feature Icon={IconTrophy} tint="#FCD34D" title="Podium or, argent, bronze" desc="Classements animés + Ligue de la semaine (remise à zéro le lundi)." />
          <Feature Icon={IconSword} tint="#34D3C6" title="Défie tes amis" desc="Mêmes questions pour vous deux, le meilleur gagne." />
        </div>

        {/* Actions */}
        <div className="px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
          <Link
            href="/jeux"
            onClick={close}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#D8F53A] to-[#AAD000] py-4 font-game text-lg font-black text-night-950"
            style={{ animation: "gm-glow 2.2s ease-in-out infinite" }}
          >
            <IconPlay className="h-5 w-5" /> Découvrir les jeux
          </Link>
          <button
            type="button"
            onClick={close}
            className="mt-2 w-full rounded-2xl py-3 font-game text-sm font-bold text-cream/60"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({ Icon, tint, title, desc }: { Icon: (p: { className?: string }) => React.ReactElement; tint: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${tint}1f`, color: tint }}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="font-game text-sm font-extrabold leading-tight">{title}</p>
        <p className="text-[11px] leading-tight text-cream/55">{desc}</p>
      </div>
    </div>
  );
}
