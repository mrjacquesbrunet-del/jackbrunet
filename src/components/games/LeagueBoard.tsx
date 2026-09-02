"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchLeagueStandings,
  leagueDivisionMeta,
  LEAGUE_DIVISIONS,
  currentUserId,
  type LeagueRow,
} from "@/lib/game-scores";
import { setAchvMax } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";

/**
 * Ligue de la semaine À DIVISIONS (style Duolingo, charte RHEMA) :
 * chaque joueur est classé DANS sa division (Élite, Or, Argent, Bronze).
 * Dimanche soir : la moitié haute du tableau monte, la moitié basse
 * descend (sauf depuis le Bronze), et tout repart de zéro.
 */

function IconShield({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" />
      <path d="M12 8v5M9.5 10.5h5" />
    </svg>
  );
}

function IconUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
function IconDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

/** Temps restant avant le brassage (dimanche soir). */
function untilSunday(): string {
  const now = new Date();
  const end = new Date(now);
  const day = now.getDay(); // 0 = dimanche
  const add = day === 0 ? 0 : 7 - day;
  end.setDate(now.getDate() + add);
  end.setHours(23, 59, 0, 0);
  const ms = end.getTime() - now.getTime();
  if (ms <= 0) return "ce soir";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days} j ${hours} h`;
  return `${hours} h`;
}

export function LeagueBoard() {
  const [rows, setRows] = useState<LeagueRow[] | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [all, setAll] = useState(false);

  useEffect(() => {
    (async () => {
      const [r, uid] = await Promise.all([fetchLeagueStandings(), currentUserId()]);
      setRows(r);
      setMeId(uid);
      // Badge « Étoile des ligues » : mémorise la meilleure ligue atteinte
      // (Bronze 1 → Élite 4) quand on figure au classement de sa division.
      if (uid && r.some((x) => x.user_id === uid) && r.length > 0) {
        setAchvMax("league_best", 5 - r[0].division);
        checkLocalBadges();
      }
    })();
  }, []);

  const division = rows && rows.length > 0 ? rows[0].division : 4;
  const meta = leagueDivisionMeta(division);
  const countdown = useMemo(untilSunday, []);
  const shown = rows ? (all ? rows : rows.slice(0, 10)) : [];
  const hasRelegation = (rows?.length ?? 0) >= 2 && division < 4;

  return (
    <div className="rounded-3xl p-4">
      {/* En-tête : division + échelle des 4 divisions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <IconShield className="h-9 w-9" color={meta.color} />
          <div>
            <p className="font-game text-base font-black leading-tight" style={{ color: meta.color }}>
              LIGUE {meta.name.toUpperCase()}
            </p>
            <p className="text-[11px] font-semibold text-white/50">Brassage dans {countdown}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {LEAGUE_DIVISIONS.map((d) => (
            <span key={d.n} title={`Ligue ${d.name}`} className={d.n === division ? "" : "opacity-30 grayscale"}>
              <IconShield className={d.n === division ? "h-6 w-6" : "h-5 w-5"} color={d.color} />
            </span>
          ))}
        </div>
      </div>

      {/* Classement de la division */}
      {rows === null ? (
        <p className="mt-4 text-center text-xs text-white/45">Chargement de la ligue…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white/[0.05] p-4 text-center text-xs font-semibold text-white/60">
          Joue une partie cette semaine pour entrer en ligue Bronze — la moitié haute de chaque division monte le dimanche soir !
        </p>
      ) : (
        <ol className="mt-3 space-y-1">
          {shown.map((r, i) => {
            const me = !!meId && r.user_id === meId;
            const moitie = Math.ceil(rows.length / 2);
            const promo = r.rank <= moitie && r.points > 0 && division > 1;
            const releg = hasRelegation && rows.length >= 2 && r.rank > moitie && (all || rows.length <= 10);
            return (
              <li
                key={r.user_id}
                className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 ${me ? "bg-[#CAF000]/12 ring-1 ring-[#CAF000]/40" : "bg-white/[0.04]"}`}
              >
                <span className={`w-6 shrink-0 text-center font-game text-sm font-black ${r.rank <= 3 ? "text-amber-300" : "text-white/55"}`}>
                  {r.rank}
                </span>
                {r.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/60">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" strokeLinecap="round" /></svg>
                  </span>
                )}
                <span className={`min-w-0 flex-1 truncate text-sm font-bold ${me ? "text-[#CAF000]" : "text-white/85"}`}>
                  {r.pseudo || "Membre"}
                  {me ? " (toi)" : ""}
                </span>
                <span className="shrink-0 font-game text-sm font-black text-white/85">{r.points}</span>
                {promo ? (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/20 text-emerald-300">
                    <IconUp className="h-3 w-3" />
                  </span>
                ) : releg ? (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-400/20 text-rose-300">
                    <IconDown className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="h-5 w-5 shrink-0" />
                )}
              </li>
            );
          })}
        </ol>
      )}

      {rows && rows.length > 10 ? (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="mt-2 w-full text-center font-game text-xs font-bold text-white/55"
        >
          {all ? "Réduire" : `Voir toute la division (${rows.length})`}
        </button>
      ) : null}

      {rows && rows.length > 0 ? (
        <p className="mt-3 text-center text-[10px] font-semibold text-white/40">
          La moitié haute monte{hasRelegation ? " · la moitié basse descend" : ""} · remise à zéro chaque lundi
        </p>
      ) : null}
    </div>
  );
}
