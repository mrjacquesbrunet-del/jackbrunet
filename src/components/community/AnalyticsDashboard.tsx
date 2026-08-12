"use client";

import { useEffect, useState } from "react";
import {
  analyticsSummary,
  analyticsTop,
  analyticsTotals,
  analyticsAppInsights,
  type AnalyticsSummary,
  type AnalyticsTotals,
  type AppInsights,
} from "@/lib/analytics";

/** Libellés lisibles des écrans de l'app (préfixe de chemin → nom). */
const PAGE_LABELS: [string, string][] = [
  ["/devotionnel", "Temps avec Jésus"],
  ["/bible", "Bible"],
  ["/communaute", "Mur de prière"],
  ["/groupe", "Cercles de prière"],
  ["/plans", "Plans"],
  ["/videos", "Vidéos"],
  ["/messages", "Messages"],
  ["/profil", "Profil"],
  ["/boutique", "Boutique"],
  ["/ecouter", "Podcast"],
  ["/soaking", "Musique soaking"],
  ["/exclusivites", "Exclusivités"],
  ["/carnet", "Carnet"],
  ["/", "Accueil"],
];
function pageLabel(path: string): string {
  for (const [prefix, name] of PAGE_LABELS) {
    if (prefix === "/" ? path === "/" : path.startsWith(prefix)) return name;
  }
  return path;
}
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
  const [totals, setTotals] = useState<AnalyticsTotals | null>(null);
  const [app, setApp] = useState<AppInsights | null>(null);
  const [pages, setPages] = useState<{ label: string; n: number }[]>([]);
  const [plays, setPlays] = useState<{ label: string; n: number }[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, t, a, p, pl, pods] = await Promise.all([
        analyticsSummary(),
        analyticsTotals(),
        analyticsAppInsights(),
        analyticsTop("page", 30),
        analyticsTop("play", 30),
        listPodcasts(),
      ]);
      setSum(s);
      setTotals(t);
      setApp(a);
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
        Statistiques indisponibles, vérifie que la migration <code>migration-analytics.sql</code>{" "}
        est bien passée.
      </p>
    );

  return (
    <div className="space-y-6">
      {/* Total depuis le lancement — mis en avant */}
      {totals ? (
        <div className="dark-ctx rounded-3xl bg-night-900 p-6 text-center text-cream shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dawn-400">
            Visites totales
          </p>
          <p className="mt-2 font-display text-5xl font-extrabold">
            {totals.visits_total.toLocaleString("fr-FR")}
          </p>
          <p className="mt-2 text-sm text-cream/60">
            {totals.visitors_total.toLocaleString("fr-FR")} visiteurs uniques depuis le lancement
          </p>
          {(totals.visits_app ?? 0) + (totals.visits_site ?? 0) > 0 ? (
            <p className="mt-1 text-xs text-cream/45">
              dont {(totals.visits_app ?? 0).toLocaleString("fr-FR")} sur l'app ·{" "}
              {(totals.visits_site ?? 0).toLocaleString("fr-FR")} sur le site
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Engagement de l'application */}
      {app ? (
        <div className="rounded-3xl border border-dawn-400/40 bg-dawn-400/[0.07] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-night-900/60">
            Application — engagement
          </p>

          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-night-900/45">
            Utilisateurs actifs (app)
          </p>
          <div className="mt-1.5 grid grid-cols-3 gap-3">
            <Stat label="Aujourd'hui" value={app.app_active_day} />
            <Stat label="7 jours" value={app.app_active_week} />
            <Stat label="30 jours" value={app.app_active_month} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-night-900/10 bg-white p-3 text-center">
              <p className="font-display text-2xl font-extrabold text-spirit-700">{app.regulars_week}</p>
              <p className="text-[11px] text-night-900/55">
                fidèles cette semaine (venus 3 jours ou +)
              </p>
            </div>
            <div className="rounded-2xl border border-night-900/10 bg-white p-3 text-center">
              <p className="font-display text-2xl font-extrabold text-spirit-700">{app.returning_rate}%</p>
              <p className="text-[11px] text-night-900/55">
                des utilisateurs de la semaine passée sont revenus
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-night-900/45">
            Méditations complétées
          </p>
          <div className="mt-1.5 grid grid-cols-3 gap-3">
            <Stat label="Aujourd'hui" value={app.meditations_day} />
            <Stat label="7 jours" value={app.meditations_week} />
            <Stat label="30 jours" value={app.meditations_month} />
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-night-900/45">
            Plans de lecture
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            <Stat label="Commencés (30 j)" value={app.plan_starts_month} />
            <Stat label="Commencés (total)" value={app.plan_starts_total} />
          </div>
          {app.top_plans.length > 0 ? (
            <ul className="mt-2 divide-y divide-night-900/5">
              {app.top_plans.map((p) => (
                <li key={p.label} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-night-900/75">{p.label}</span>
                  <span className="font-semibold text-night-900">{p.n}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-night-900/45">
            Écrans les plus consultés dans l'app (30 j)
          </p>
          {app.top_app_pages.length === 0 ? (
            <p className="mt-1.5 text-sm text-night-900/45">
              Pas encore de données (la provenance se mesure depuis peu).
            </p>
          ) : (
            <ul className="mt-1.5 divide-y divide-night-900/5">
              {app.top_app_pages.map((p) => (
                <li key={p.label} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-night-900/75">{pageLabel(p.label)}</span>
                  <span className="font-semibold text-night-900">{p.n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

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
