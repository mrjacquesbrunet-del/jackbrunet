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
import { imageLegere } from "@/lib/image-legere";

/**
 * Ligue de la semaine À DIVISIONS (style Duolingo, charte RHEMA) :
 * chaque joueur est classé DANS sa division (Élite, Or, Argent, Bronze).
 * Dimanche soir : tant que la ligue du dessus se remplit, la moitié
 * haute monte ; ensuite 3 montent et 3 descendent (si la division
 * compte au moins 6 joueurs), et tout repart de zéro.
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
  // Ma ligue, et la ligue affichée (un toucher sur une autre ligue l'ouvre).
  const [maDivision, setMaDivision] = useState<number | null>(null);
  const [vue, setVue] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [r, uid] = await Promise.all([fetchLeagueStandings(), currentUserId()]);
      setRows(r);
      setMeId(uid);
      const d = r.length > 0 ? r[0].division : 4;
      setMaDivision(d);
      setVue(d);
      // Badge « Étoile des ligues » : mémorise la meilleure ligue atteinte
      // (Bronze 1 → Élite 4) quand on figure au classement de sa division.
      if (uid && r.some((x) => x.user_id === uid) && r.length > 0) {
        setAchvMax("league_best", 5 - r[0].division);
        checkLocalBadges();
      }
    })();
  }, []);

  async function ouvrirLigue(d: number) {
    if (d === vue) return;
    setVue(d);
    setAll(false);
    setRows(null);
    setRows(await fetchLeagueStandings(d));
  }

  const division = vue ?? (rows && rows.length > 0 ? rows[0].division : 4);
  const autreLigue = maDivision !== null && division !== maDivision;
  const meta = leagueDivisionMeta(division);
  const countdown = useMemo(untilSunday, []);
  const shown = rows ? (all ? rows : rows.slice(0, 10)) : [];
  const hasRelegation = (rows?.length ?? 0) >= 6 && division < 4;

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
            <p className="text-[11px] font-semibold text-white/50">
              {autreLigue ? "Classement de cette ligue" : `Ta ligue · brassage dans ${countdown}`}
            </p>
          </div>
        </div>
      </div>

      {/* Les 4 ligues : un toucher pour voir leur classement */}
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {LEAGUE_DIVISIONS.map((d) => {
          const actif = d.n === division;
          return (
            <button
              key={d.n}
              type="button"
              onClick={() => void ouvrirLigue(d.n)}
              aria-pressed={actif}
              aria-label={`Voir la ligue ${d.name}`}
              className={`relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-colors ${actif ? "bg-white/[0.09] ring-1" : "bg-white/[0.03] opacity-60"}`}
              style={actif ? { boxShadow: `inset 0 0 0 1px ${d.color}66` } : undefined}
            >
              <IconShield className="h-6 w-6" color={d.color} />
              <span className="font-game text-[11px] font-black" style={{ color: actif ? d.color : "rgba(255,255,255,.7)" }}>
                {d.name}
              </span>
              {d.n === maDivision ? (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-[#CAF000] px-1 text-[8px] font-black uppercase leading-[13px] text-night-950">toi</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Classement de la division */}
      {rows === null ? (
        <p className="mt-4 text-center text-xs text-white/45">Chargement de la ligue…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white/[0.05] p-4 text-center text-xs font-semibold text-white/60">
          {autreLigue
            ? `Personne en ligue ${meta.name} pour l'instant.`
            : "Joue une partie cette semaine pour entrer en ligue Bronze — le haut du tableau monte le dimanche soir !"}
        </p>
      ) : (
        <ol className="mt-3 space-y-1">
          {shown.map((r, i) => {
            const me = !!meId && r.user_id === meId;
            // Flèches indicatives : en phase de remplissage (petite division),
            // la moitié haute monte ; sinon les 3 premiers. Les 3 derniers
            // descendent quand la division est assez peuplée.
            const nbPromo = rows.length < 6 ? Math.ceil(rows.length / 2) : 3;
            const promo = r.rank <= nbPromo && r.points > 0 && division > 1;
            const releg = hasRelegation && r.rank > rows.length - 3 && (all || rows.length <= 10);
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
                  <img {...imageLegere(r.avatar_url, 32, { carre: true })} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
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

      {autreLigue && maDivision !== null ? (
        <button
          type="button"
          onClick={() => void ouvrirLigue(maDivision)}
          className="mt-2 w-full rounded-full bg-white/[0.06] py-2 text-center font-game text-xs font-bold text-[#CAF000]"
        >
          Revenir à ma ligue ({leagueDivisionMeta(maDivision).name})
        </button>
      ) : null}

      {rows && rows.length > 0 ? (
        <p className="mt-3 text-center text-[10px] font-semibold text-white/40">
          Le haut du tableau monte{hasRelegation ? " · les 3 derniers descendent" : ""} · remise à zéro chaque lundi
        </p>
      ) : null}
    </div>
  );
}
