"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { appShareUrl } from "@/config/app-links";

/** Rubriques du quotidien, retirées du menu du site : elles vivent dans l'app. */
const RUBRIQUES = ["/devotionnel", "/bible", "/plans", "/communaute"];
const CLE = "jb.bandeau-app.ferme";
const PAUSE = 7 * 24 * 3600_000;

/**
 * Bandeau du SITE (jamais dans l'app, classe site-only) sur les rubriques du
 * quotidien : « Vis ce moment chaque jour dans l'app RHEMA ». Le bouton passe
 * par /lien, qui ouvre l'app sur la même page si elle est installée, sinon
 * le bon store. Fermé, il revient au bout de 7 jours.
 */
export function BandeauApp() {
  const pathname = usePathname() ?? "";
  const [visible, setVisible] = useState(false);
  const rubrique = RUBRIQUES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  useEffect(() => {
    if (!rubrique) return setVisible(false);
    try {
      setVisible(Date.now() > Number(localStorage.getItem(CLE) || 0));
    } catch {
      setVisible(true);
    }
  }, [rubrique]);

  // La bulle « vidéo du jour » (même coin) remonte au-dessus du bandeau.
  useEffect(() => {
    document.documentElement.classList.toggle("bandeau-app", visible);
    return () => document.documentElement.classList.remove("bandeau-app");
  }, [visible]);

  if (!visible) return null;

  const fermer = () => {
    try {
      localStorage.setItem(CLE, String(Date.now() + PAUSE));
    } catch {
      /* stockage indisponible */
    }
    setVisible(false);
  };

  return (
    <div className="site-only fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-night-950 py-3 pl-4 pr-2 text-cream shadow-2xl ring-1 ring-white/10">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-dawn-400/15 text-dawn-400">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
            <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
            <path d="M10.5 18.5h3" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">Vis ce moment chaque jour dans l'app RHEMA</p>
          <p className="mt-0.5 text-xs leading-snug text-cream/60">Gratuite · rappel chaque matin · iPhone et Android</p>
        </div>
        <a
          href={appShareUrl(pathname)}
          className="shrink-0 rounded-full bg-dawn-400 px-4 py-2 text-sm font-bold text-night-950 transition-transform active:scale-95"
        >
          Ouvrir
        </a>
        <button
          type="button"
          onClick={fermer}
          aria-label="Fermer"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-cream/50 hover:text-cream"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
