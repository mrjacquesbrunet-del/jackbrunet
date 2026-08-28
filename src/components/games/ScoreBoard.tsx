"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchGameLeaderboard, fetchTotalLeaderboard, fetchWeeklyLeague, currentUserId, type GameId, type ScoreRow } from "@/lib/game-scores";

/** Thèmes du podium : or (1er), argent (2e), bronze (3e). */
const PODIUM = [
  { ring: "#FCD34D", glow: "rgba(252,211,77,.22)", glow2: "rgba(252,211,77,.5)", label: "#FCD34D", badge: "linear-gradient(180deg,#FDE68A,#F59E0B)" },
  { ring: "#CBD5E1", glow: "rgba(203,213,225,.16)", glow2: "rgba(203,213,225,.4)", label: "#CBD5E1", badge: "linear-gradient(180deg,#E2E8F0,#94A3B8)" },
  { ring: "#D9843B", glow: "rgba(217,132,59,.16)", glow2: "rgba(217,132,59,.4)", label: "#E8A05E", badge: "linear-gradient(180deg,#F3B27A,#B5691F)" },
];

const SB_CSS = `
@keyframes sb-in{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
@keyframes sb-crown{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(8deg)}}
@keyframes sb-shimmer{0%{transform:translateX(-170%) skewX(-16deg)}55%,100%{transform:translateX(280%) skewX(-16deg)}}
@keyframes sb-pts{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes sb-tw{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:.9;transform:scale(1.1)}}
.sb-card{position:relative;overflow:hidden;border-radius:1.4rem;background:linear-gradient(180deg,#1E1E1D,#0C0C0B);animation:sb-in .5s cubic-bezier(.2,.8,.2,1) both}
.sb-shimmer{position:absolute;top:0;bottom:0;left:0;width:38%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent);filter:blur(4px);animation:sb-shimmer 3.6s ease-in-out infinite;pointer-events:none}
.sb-crown{animation:sb-crown 2.2s ease-in-out infinite;transform-origin:50% 100%}
.sb-pts{animation:sb-pts .55s cubic-bezier(.2,.8,.2,1) .25s both}
.sb-tw{position:absolute;border-radius:9999px;background:#FDE68A;animation:sb-tw 2.6s ease-in-out infinite;pointer-events:none}
.sb-row{animation:sb-in .4s ease-out both}
.sb-more{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:10px;padding:11px;border-radius:9999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);font-family:var(--font-game);font-weight:800;font-size:12px;color:rgba(243,243,237,.8)}
.sb-more:active{transform:translateY(1px)}
`;

function fmtShort(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}
function fmtFull(n: number) {
  try {
    return n.toLocaleString("fr-FR").replace(/ | /g, " ");
  } catch {
    return String(n);
  }
}

function Avatar({ url, size, light }: { url: string | null; size: number; light: boolean }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span className={`grid place-items-center rounded-full ${light ? "bg-night-900/10 text-night-900/50" : "bg-white/10 text-cream/60"}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" style={{ width: size * 0.55, height: size * 0.55 }} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" /></svg>
    </span>
  );
}

/** Carte du podium (1er / 2e / 3e) — champion en grand, or/argent/bronze animés. */
function PodiumCard({ r, tier, weekly, me }: { r: ScoreRow; tier: 0 | 1 | 2; weekly: boolean; me: boolean }) {
  const t = PODIUM[tier];
  const big = tier === 0;
  const label = `${r.rank === 1 ? "1ER" : `${r.rank}E`}${weekly ? " CETTE SEMAINE" : ""}`;
  return (
    <div
      className="sb-card"
      style={{
        padding: big ? "16px 18px" : "10px 14px",
        boxShadow: `inset 0 0 0 1.5px ${t.ring}55, 0 0 ${big ? 24 : 12}px ${t.glow}`,
        animationDelay: `${tier * 0.12}s`,
      }}
    >
      <span className="sb-shimmer" style={{ animationDelay: `${tier * 0.7}s` }} />
      {big ? (
        <>
          <span className="sb-tw" style={{ right: "14%", top: "18%", width: 5, height: 5 }} />
          <span className="sb-tw" style={{ right: "30%", bottom: "20%", width: 4, height: 4, animationDelay: ".9s" }} />
          <span className="sb-tw" style={{ left: "38%", top: "14%", width: 4, height: 4, animationDelay: "1.6s" }} />
        </>
      ) : null}
      <div className="relative flex items-center gap-3.5">
        {/* Avatar + couronne / médaille */}
        <span className="relative shrink-0">
          <span className="block rounded-full p-[3px]" style={{ background: t.badge }}>
            <Avatar url={r.avatar_url} size={big ? 58 : 42} light={false} />
          </span>
          {big ? (
            <svg viewBox="0 0 24 24" className="sb-crown absolute -left-1.5 -top-2.5 h-6 w-6" fill="#FCD34D" stroke="#B45309" strokeWidth={1} strokeLinejoin="round" aria-hidden>
              <path d="M4 8l4 3.5L12 5l4 6.5L20 8l-1.4 10H5.4z" />
            </svg>
          ) : (
            <span className="absolute -left-1 -top-1 grid h-5 w-5 place-items-center rounded-full font-game text-[10px] font-black text-[#0C0C0B]" style={{ background: t.badge }}>
              {r.rank}
            </span>
          )}
        </span>
        {/* Nom : clic -> profil */}
        <Link href={`/membre/?u=${r.user_id}`} className="min-w-0 flex-1">
          <p className="font-game text-[10px] font-black tracking-wide" style={{ color: t.label }}>{label}</p>
          <p className={`truncate font-game font-black text-cream ${big ? "text-xl" : "text-sm"}`}>
            {r.pseudo || "Joueur"} {me ? <span className="text-[#CAF000]">· toi</span> : null}
          </p>
        </Link>
        {/* Points */}
        <div className="sb-pts shrink-0 text-right" style={{ animationDelay: `${0.25 + tier * 0.12}s` }}>
          <p className={`font-game font-black leading-none ${big ? "text-3xl" : "text-lg"}`} style={{ color: t.label }}>
            {big ? fmtFull(r.points) : fmtShort(r.points)}
          </p>
          <p className="font-game text-[9px] font-bold uppercase tracking-[0.15em] text-cream/40">points</p>
        </div>
        {/* Médaille / couronne à droite (mise en avant du podium) */}
        <span className="shrink-0" style={{ color: t.ring }}>
          {tier === 0 ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" stroke="#B45309" strokeWidth={0.8} strokeLinejoin="round" aria-hidden>
              <path d="M4 8l4 3.5L12 5l4 6.5L20 8l-1.4 10H5.4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M8 3l2 6M16 3l-2 6M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
            </svg>
          )}
        </span>
      </div>
    </div>
  );
}

/**
 * Classement (photos + noms + score). Podium animé (or/argent/bronze), top 10,
 * bouton « Afficher tout le classement ». `mode` : un jeu précis, "total" ou "weekly".
 */
export function ScoreBoard({
  mode,
  accent,
  title,
  light = false,
  limit = 100,
}: {
  mode: GameId | "total" | "weekly";
  accent: string;
  title: string;
  light?: boolean;
  limit?: number;
}) {
  const [rows, setRows] = useState<ScoreRow[] | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

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
  const cardBg = light ? "border border-night-900/10 bg-white" : "border border-white/10 bg-white/[0.04]";

  const podium = rows ? rows.slice(0, 3) : [];
  const rest = rows ? rows.slice(3) : [];
  const visible = expanded ? rest : rest.slice(0, 2); // podium (3) + 2 = top 5
  const hasMore = rest.length > 2;

  return (
    <section className={`rounded-3xl p-4 ${cardBg}`}>
      <style dangerouslySetInnerHTML={{ __html: SB_CSS }} />
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
        <>
          {/* Podium animé */}
          <div className="mt-3 space-y-2">
            {podium.map((r, i) => (
              <PodiumCard key={r.user_id} r={r} tier={i as 0 | 1 | 2} weekly={mode === "weekly"} me={!!meId && r.user_id === meId} />
            ))}
          </div>

          {/* Rangs 4+ */}
          {visible.length > 0 ? (
            <ol className="mt-2 space-y-1.5">
              {visible.map((r, i) => {
                const me = meId && r.user_id === meId;
                return (
                  <li
                    key={r.user_id}
                    className={`sb-row flex items-center gap-3 rounded-2xl px-3 py-2 ${rowBg}`}
                    style={{ animationDelay: `${Math.min(i, 8) * 0.05}s`, ...(me ? { boxShadow: `inset 0 0 0 2px ${accent}` } : null) }}
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-game text-xs font-extrabold"
                      style={{ background: light ? "rgba(23,23,22,.08)" : "rgba(255,255,255,.1)", color: light ? "#171716" : "#F3F3ED" }}
                    >
                      {r.rank}
                    </span>
                    <Link href={`/membre/?u=${r.user_id}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar url={r.avatar_url} size={36} light={light} />
                      <span className={`min-w-0 flex-1 truncate font-game text-sm font-bold ${txt}`}>
                        {r.pseudo || "Joueur"} {me ? <span style={{ color: accent }}>· toi</span> : null}
                      </span>
                    </Link>
                    <span className="shrink-0 font-game text-sm font-extrabold" style={{ color: accent }}>
                      {fmtShort(r.points)}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : null}

          {/* Afficher tout / réduire */}
          {hasMore ? (
            <button type="button" onClick={() => setExpanded((v) => !v)} className="sb-more">
              <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              {expanded ? "Réduire le classement" : "Afficher tout le classement"}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
