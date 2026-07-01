"use client";

import { useEffect, useState } from "react";
import { analyticsSummary, analyticsTop, type AnalyticsSummary } from "@/lib/analytics";
import { listPodcasts } from "@/lib/audio-library";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-night-900/10 bg-white p-3 text-center">
      <p className="font-display text-2xl font-extrabold text-spirit-700">{value}</p>
      <p className="text-[11px] text-night-900/55">{label}</p>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [sum, setSum] = useState<AnalyticsSummary | null>(null);
  const [pages, setPages] = useState<{ label: string; n: number }[]>([]);
  const [plays, setPlays] = useState<{ label: string; n: number }[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, p, pl, pods] = await Promise.all([
        analyticsSummary(),
        analyticsTop("page", 30),
        analyticsTop("play", 30),
        listPodcasts(),
      ]);
      setSum(s);
      setPages(p);
      setPlays(pl);
      const map: Record<string, string> = {};
      for (const t of pods) map[t.id] = t.title;
      setTitles(map);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-sm text-night-900/50">Chargement des statistiques…</p>;
  if (!sum)
    return (
      <p className="text-sm text-night-900/55">
        Statistiques indisponibles — vérifie que la migration <code>migration-analytics.sql</code>{" "}
        est bien passée.
      </p>
    );

  return (
    <div className="space-y-6">
      {/* Visiteurs */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
          Visiteurs (uniques)
        </p>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <Stat label="Aujourd'hui" value={sum.visitors_day} />
          <Stat label="7 jours" value={sum.visitors_week} />
          <Stat label="30 jours" value={sum.visitors_month} />
        </div>
      </div>

      {/* Auditeurs podcast */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
          Auditeurs du podcast (uniques)
        </p>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <Stat label="Aujourd'hui" value={sum.listeners_day} />
          <Stat label="7 jours" value={sum.listeners_week} />
          <Stat label="30 jours" value={sum.listeners_month} />
        </div>
        <p className="mt-2 text-xs text-night-900/50">
          Écoutes lancées: {sum.plays_day} aujourd'hui · {sum.plays_week} cette semaine ·{" "}
          {sum.plays_month} ce mois
        </p>
      </div>

      {/* Top pages */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
          Pages les plus vues (30 j)
        </p>
        {pages.length === 0? (
          <p className="mt-2 text-sm text-night-900/45">Pas encore de données.</p>
        ): (
          <ul className="mt-2 divide-y divide-night-900/5">
            {pages.map((p) => (
              <li key={p.label} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate text-night-900/80">{p.label}</span>
                <span className="shrink-0 font-semibold text-spirit-700">{p.n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Top épisodes */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-night-900/50">
          Épisodes les plus écoutés (30 j)
        </p>
        {plays.length === 0? (
          <p className="mt-2 text-sm text-night-900/45">Pas encore d'écoute.</p>
        ): (
          <ul className="mt-2 divide-y divide-night-900/5">
            {plays.map((p) => (
              <li key={p.label} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="truncate text-night-900/80">{titles[p.label]?? p.label}</span>
                <span className="shrink-0 font-semibold text-spirit-700">{p.n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
