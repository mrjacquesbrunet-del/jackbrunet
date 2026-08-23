"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/community/Avatar";
import { useAuth } from "@/components/community/useAuth";
import {
  fetchWeeklyLeaderboard,
  fetchPastChampions,
  type LeaderRow,
  type PastChampion,
} from "@/lib/game-leaderboard";

/** Couronne (1er). */
function Crown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 8l3.5 3L12 5l5.5 6L21 8l-1.5 10h-15L3 8zm2.2 12h13.6" />
    </svg>
  );
}

const RANK_COLORS = ["#FDE047", "#CBD5E1", "#FB923C"]; // or, argent, bronze

/**
 * Champions de la semaine : classement des joueurs du jeu de mémorisation,
 * par points gagnés cette semaine (remis à zéro chaque lundi côté serveur).
 * Le 1er est mis en avant. Nécessite d'être connecté pour apparaître.
 */
export function WeeklyChampions() {
  const { userId } = useAuth();
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const [past, setPast] = useState<PastChampion[]>([]);

  useEffect(() => {
    let active = true;
    fetchWeeklyLeaderboard().then((r) => active && setRows(r));
    fetchPastChampions().then((r) => active && setPast(r));
    return () => {
      active = false;
    };
  }, []);

  if (rows === null) {
    return (
      <section className="mt-8">
        <h2 className="font-game text-2xl font-bold">
          Champions <span className="text-[#FDE047]">de la semaine</span>
        </h2>
        <p className="mt-3 font-game text-sm text-cream/45">Chargement du classement…</p>
      </section>
    );
  }

  const champ = rows[0];
  const rest = rows.slice(1);
  const myRank = userId ? rows.findIndex((r) => r.user_id === userId) : -1;

  return (
    <section className="mt-8">
      <h2 className="font-game text-2xl font-bold">
        Champions <span className="text-[#FDE047]">de la semaine</span>
      </h2>
      <p className="mt-1 font-game text-sm text-cream/55">
        Gagne des points au jeu pour grimper — le classement repart chaque lundi.
      </p>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-3xl border-2 border-white/10 bg-night-900/60 p-6 text-center">
          <p className="font-game text-base font-bold text-cream/85">Sois le premier champion !</p>
          <p className="mt-1 font-game text-sm text-cream/55">
            Joue une partie cette semaine pour ouvrir le classement.
          </p>
        </div>
      ) : (
        <>
          {/* 1er — grande carte dorée */}
          <Link
            href={`/membre?u=${champ.user_id}`}
            className="mt-4 flex items-center gap-4 overflow-hidden rounded-3xl border-2 p-4"
            style={{ borderColor: "#FDE04766", background: "linear-gradient(135deg,#FDE04722,rgba(23,23,22,0.6))" }}
          >
            <div className="relative shrink-0">
              <span className="block rounded-full ring-4" style={{ boxShadow: "0 0 0 3px #FDE047" }}>
                <Avatar pseudo={champ.pseudo} url={champ.avatar_url} size={56} />
              </span>
              <Crown className="absolute -left-1 -top-3 h-6 w-6 text-[#FDE047]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-game text-[11px] font-bold uppercase tracking-wide text-[#FDE047]">
                1er cette semaine
              </p>
              <p className="truncate font-game text-lg font-bold text-cream">{champ.pseudo || "Membre"}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-game text-2xl font-bold text-[#FDE047]">{champ.points}</p>
              <p className="font-game text-[10px] font-bold uppercase tracking-wide text-cream/45">points</p>
            </div>
          </Link>

          {/* Suivants */}
          {rest.length > 0 ? (
            <div className="mt-3 space-y-2">
              {rest.map((r, i) => {
                const rank = i + 2;
                const isMe = r.user_id === userId;
                return (
                  <Link
                    key={r.user_id}
                    href={`/membre?u=${r.user_id}`}
                    className={`flex items-center gap-3 rounded-2xl border p-3 ${
                      isMe ? "border-dawn-400/50 bg-dawn-400/[0.08]" : "border-white/10 bg-night-900/50"
                    }`}
                  >
                    <span
                      className="w-6 shrink-0 text-center font-game text-sm font-bold"
                      style={{ color: RANK_COLORS[rank - 1] || "rgba(243,243,237,0.5)" }}
                    >
                      {rank}
                    </span>
                    <Avatar pseudo={r.pseudo} url={r.avatar_url} size={36} />
                    <span className="min-w-0 flex-1 truncate font-game text-sm font-bold text-cream/90">
                      {r.pseudo || "Membre"}
                      {isMe ? <span className="ml-1 text-dawn-300">· toi</span> : null}
                    </span>
                    <span className="shrink-0 font-game text-sm font-bold text-cream/70">{r.points}</span>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {/* Mon rang si hors du top affiché */}
          {userId && myRank === -1 ? (
            <p className="mt-3 text-center font-game text-xs text-cream/45">
              Joue cette semaine pour entrer dans le classement.
            </p>
          ) : null}
        </>
      )}

      {/* Anciens champions */}
      {past.length > 0 ? (
        <div className="mt-6">
          <p className="font-game text-sm font-bold text-cream/70">Anciens champions</p>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
            {past.map((p) => (
              <Link
                key={p.week}
                href={`/membre?u=${p.user_id}`}
                className="flex w-20 shrink-0 flex-col items-center text-center"
              >
                <span className="relative">
                  <Avatar pseudo={p.pseudo} url={p.avatar_url} size={48} />
                  <Crown className="absolute -left-1 -top-2 h-4 w-4 text-[#FDE047]" />
                </span>
                <span className="mt-1 truncate font-game text-[11px] font-bold text-cream/80">
                  {p.pseudo || "Membre"}
                </span>
                <span className="font-game text-[10px] text-cream/40">{p.week.replace("-W", " · sem. ")}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {!userId ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center font-game text-xs text-cream/60">
          Connecte-toi (onglet Prière) pour apparaître dans le classement des champions.
        </p>
      ) : null}
    </section>
  );
}
