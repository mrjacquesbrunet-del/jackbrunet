"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SEEN_KEY = "jb.news.games.v1";

const S = (d: string) => (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconCap = S("M3 9l9-4 9 4-9 4zM7 11v4c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-4");
const IconBulb = S("M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10 3 3 0 0 0-1 2H9a3 3 0 0 0-1-2 6 6 0 0 1 4-10z");
const IconScale = S("M12 4v16M8 20h8M6 7h12M6 7l-2.5 5a3 3 0 0 0 5 0zM18 7l-2.5 5a3 3 0 0 0 5 0z");
const IconTrophy = S("M8 4h8v3a4 4 0 0 1-8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M9 20h6M12 12v4");
const IconSword = S("M14.5 4H20v5.5L9.5 20 4 14.5zM15 9l-6 6M4 20l3-3");
const IconPlay = S("M8 5v14l11-7z");
const IconClose = S("M6 6l12 12M18 6L6 18");

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
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[2rem] border border-white/10 bg-gradient-to-b from-night-800 via-night-900 to-night-950 text-cream shadow-2xl sm:rounded-[2rem]"
        style={{ animation: "gm-in .35s cubic-bezier(.2,.8,.2,1)" }}
      >
        <style dangerouslySetInnerHTML={{ __html: "@keyframes gm-in{0%{transform:translateY(28px);opacity:0}100%{transform:translateY(0);opacity:1}}@keyframes gm-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}" }} />

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
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-dawn-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-10 h-40 w-40 rounded-full bg-dawn-400/10 blur-3xl" />
          <span className="relative inline-block rounded-full bg-dawn-400 px-4 py-1 font-game text-xs font-extrabold uppercase tracking-wide text-night-950">
            Nouveau
          </span>
          <h2 className="relative mt-3 font-game text-3xl font-black leading-tight">
            Les <span className="text-dawn-300">Jeux</span> sont là&nbsp;!
          </h2>
          <p className="relative mx-auto mt-2 max-w-xs font-game text-sm font-semibold text-cream/70">
            Apprends la Bible en t&apos;amusant, seul ou contre tes amis.
          </p>

          {/* 3 jeux */}
          <div className="relative mt-5 flex items-end justify-center gap-3">
            {[
              { Icon: IconCap, label: "Connaissances", c: "#CAF000" },
              { Icon: IconBulb, label: "Mémoriser", c: "#8FE23C" },
              { Icon: IconScale, label: "Vrai ou Faux", c: "#34D3C6" },
            ].map((g, i) => (
              <div key={g.label} className="flex flex-col items-center" style={{ animation: `gm-pop .4s ease-out ${0.15 + i * 0.1}s both` }}>
                <span
                  className="grid h-16 w-16 place-items-center rounded-2xl ring-1 ring-white/10"
                  style={{ background: `radial-gradient(circle at 30% 25%, ${g.c}33, rgba(255,255,255,0.04) 70%)`, color: g.c }}
                >
                  <g.Icon className="h-8 w-8" />
                </span>
                <span className="mt-1.5 font-game text-[10px] font-bold text-cream/60">{g.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nouveautés */}
        <div className="mt-6 space-y-2.5 px-6">
          <Feature Icon={IconPlay} tint="#CAF000" title="4 jeux bibliques" desc="Quiz, mémoriser, vrai ou faux, qui suis-je ?" />
          <Feature Icon={IconTrophy} tint="#FB923C" title="Classements & Ligue de la semaine" desc="Grimpe le classement, remis à zéro chaque lundi." />
          <Feature Icon={IconSword} tint="#34D3C6" title="Défie tes amis" desc="Même questions pour vous deux, le meilleur gagne." />
        </div>

        {/* Actions */}
        <div className="px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
          <Link
            href="/jeux"
            onClick={close}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-dawn-300 to-dawn-500 py-4 font-game text-lg font-black text-night-950 shadow-[inset_0_2px_0_rgba(255,255,255,.4),0_5px_0_#5b7300] active:translate-y-[2px]"
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
