"use client";

import { useEffect, useState } from "react";
import { fetchGameLeaderboard, fetchTotalLeaderboard, fetchWeeklyLeague, currentUserId, type GameId, type ScoreRow } from "@/lib/game-scores";

const MEDALS = ["#FCD34D", "#CBD5E1", "#D9843B"]; // or, argent, bronze

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

/**
 * Classement (photos + noms + score). `mode` : un jeu précis ou "total"
 * (cumul des trois). `light` pour les thèmes clairs (fond crème).
 */
export function ScoreBoard({
  mode,
  accent,
  title,
  light = false,
  limit = 20,
}: {
  mode: GameId | "total" | "weekly";
  accent: string;
  title: string;
  light?: boolean;
  limit?: number;
}) {
  const [rows, setRows] = useState<ScoreRow[] | null>(null);
  const [meId, setMeId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    currentUserId().then((id) => alive && setMeId(id));
    const load =
      mode === "total"
        ? fetchTotalLeaderboard(limit)
        : mode === "weekly"
          ? fetchWeeklyLeague(limit)
          : fetchGameLeaderboard(mode, limit);
    load.then((r) => alive && setRows(r));
    return () => {
      alive = false;
    };
  }, [mode, limit]);

  const txt = light ? "text-night-900" : "text-cream";
  const sub = light ? "text-night-900/55" : "text-cream/55";
  const rowBg = light ? "bg-night-900/[0.04]" : "bg-white/[0.05]";
  const cardBg = light
    ? "border border-night-900/10 bg-white"
    : "border border-white/10 bg-white/[0.04]";

  return (
    <section className={`rounded-3xl p-4 ${cardBg}`}>
      <div className="flex items-center justify-between">
        <h2 className={`font-game text-lg font-extrabold ${txt}`}>{title}</h2>
        <span className="font-game text-[11px] font-bold uppercase tracking-wide" style={{ color: accent }}>
          Score
        </span>
      </div>

      {rows === null ? (
        <p className={`mt-3 text-sm ${sub}`}>Chargement…</p>
      ) : rows.length === 0 ? (
        <p className={`mt-3 text-sm ${sub}`}>
          Personne au classement pour l&apos;instant — joue une partie (en étant connecté) pour y figurer&nbsp;!
        </p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {rows.map((r) => {
            const me = meId && r.user_id === meId;
            const medal = r.rank <= 3 ? MEDALS[r.rank - 1] : null;
            return (
              <li
                key={r.user_id}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${rowBg}`}
                style={me ? { boxShadow: `inset 0 0 0 2px ${accent}` } : undefined}
              >
                {/* Rang / médaille */}
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-game text-xs font-extrabold"
                  style={
                    medal
                      ? { background: medal, color: "#0C0C0B" }
                      : { background: light ? "rgba(23,23,22,.08)" : "rgba(255,255,255,.1)", color: light ? "#171716" : "#F3F3ED" }
                  }
                >
                  {r.rank}
                </span>
                {/* Photo */}
                {r.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-black/10" />
                ) : (
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${light ? "bg-night-900/10 text-night-900/50" : "bg-white/10 text-cream/60"}`}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" /></svg>
                  </span>
                )}
                {/* Nom */}
                <span className={`min-w-0 flex-1 truncate font-game text-sm font-bold ${txt}`}>
                  {r.pseudo || "Joueur"} {me ? <span style={{ color: accent }}>· toi</span> : null}
                </span>
                {/* Score */}
                <span className="shrink-0 font-game text-sm font-extrabold" style={{ color: accent }}>
                  {fmt(r.points)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
