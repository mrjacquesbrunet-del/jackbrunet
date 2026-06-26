"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { AgendaEvent } from "@/lib/types";

function isExternal(href?: string) {
  return !!href && /^https?:\/\//i.test(href);
}

/**
 * Bandeau discret sur l'accueil : annonce le prochain live (à défaut, le
 * prochain événement de l'agenda) avec un lien direct. Masqué s'il n'y a rien.
 */
export function NextLiveBanner({ events }: { events: AgendaEvent[] }) {
  const next = useMemo(() => {
    const now = Date.now();
    const upcoming = events
      .filter((e) => e.type !== "annonce" && e.date)
      .map((e) => ({ e, t: new Date(`${e.date}T${e.time || "00:00"}`).getTime() }))
      .filter(({ t }) => t >= now - 2 * 3600 * 1000) // garde un live commencé depuis <2h
      .sort((a, b) => a.t - b.t);
    // priorité au prochain live
    return upcoming.find(({ e }) => e.type === "live") ?? upcoming[0] ?? null;
  }, [events]);

  if (!next) return null;
  const { e } = next;
  const d = new Date(`${e.date}T${e.time || "00:00"}`);
  const when = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const isLive = e.type === "live";
  const label = isLive ? "Prochain live" : "Prochain événement";
  const cta = e.link
    ? e.linkLabel || (isLive ? "Rejoindre le live" : "En savoir plus")
    : "Voir l'agenda";
  const href = e.link || "/actualite";

  return (
    <section className="container-x pt-4">
      <div className="dark-ctx bg-topo-dark relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl p-5 text-center sm:flex-row sm:gap-5 sm:p-6 sm:text-left">
        <div className="blob -right-10 -top-8 h-32 w-32 bg-spirit-500/25" />
        <span className="relative flex items-center gap-2 rounded-full border border-dawn-400/30 bg-dawn-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-dawn-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dawn-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-dawn-400" />
          </span>
          {label}
        </span>

        <div className="relative min-w-0 flex-1">
          <p className="font-display text-lg font-bold leading-tight">{e.title}</p>
          <p className="text-sm text-cream/70">
            <span className="capitalize">{when}</span>
            {e.time ? ` · ${e.time}` : ""}
            {e.location ? ` · ${e.location}` : ""}
          </p>
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          {isExternal(href) ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="btn-primary">
              {cta}
            </a>
          ) : (
            <Link href={href} className="btn-primary">
              {cta}
            </Link>
          )}
          <Link href="/actualite" className="btn-ghost hidden sm:inline-flex">
            Tout l'agenda
          </Link>
        </div>
      </div>
    </section>
  );
}
