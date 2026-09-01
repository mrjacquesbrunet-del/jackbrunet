"use client";

import { useEffect, useState } from "react";
import { missionProgress, claimMission, type MissionProgress } from "@/lib/missions";

/**
 * Carte « MISSIONS DE LA SEMAINE » du hub des jeux : 3 objectifs tirés au
 * sort chaque lundi, barres de progression, récompense en points de ligue
 * à récupérer quand c'est accompli.
 */
export function MissionsCard() {
  const [missions, setMissions] = useState<MissionProgress[]>([]);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  useEffect(() => {
    try {
      setMissions(missionProgress());
    } catch {
      /* stockage indisponible */
    }
  }, []);

  if (missions.length === 0) return null;

  function claim(id: string) {
    if (claimMission(id)) {
      setJustClaimed(id);
      setMissions(missionProgress());
      setTimeout(() => setJustClaimed(null), 2500);
    }
  }

  return (
    <div className="jx-card mt-4 p-4" style={{ background: "linear-gradient(120deg,#1E1E1D,#0C0C0B)", animationDelay: ".45s" }}>
      <span className="jx-shine" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-game text-sm font-black uppercase tracking-wide text-[#CAF000]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 21V4m0 1h11l-2.5 3.5L16 12H5" />
            </svg>
            Missions de la semaine
          </p>
          <span className="font-game text-[10px] font-bold text-white/45">
            {missions.filter((m) => m.claimed).length}/{missions.length}
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {missions.map((m) => {
            const complete = m.done >= m.target;
            const pct = Math.round((m.done / m.target) * 100);
            return (
              <div key={m.id} className={`rounded-2xl p-3 ${m.claimed ? "bg-[#CAF000]/10" : "bg-white/[0.05]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-[13px] font-bold leading-tight ${m.claimed ? "text-[#CAF000]/80" : "text-white/90"}`}>
                    {m.label}
                  </p>
                  {m.claimed ? (
                    <span className="shrink-0 rounded-full bg-[#CAF000]/20 px-2.5 py-1 font-game text-[10px] font-black text-[#CAF000]">
                      {justClaimed === m.id ? `+${m.reward} PTS !` : "FAIT"}
                    </span>
                  ) : complete ? (
                    <button
                      type="button"
                      onClick={() => claim(m.id)}
                      className="shrink-0 rounded-full px-3 py-1.5 font-game text-[11px] font-black text-[#1a2000] shadow"
                      style={{ background: "linear-gradient(180deg,#D8F53A,#AAD000)" }}
                    >
                      +{m.reward} PTS
                    </button>
                  ) : (
                    <span className="shrink-0 font-game text-[11px] font-bold text-white/50">
                      {m.done}/{m.target}
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${Math.max(complete ? 100 : 4, pct)}%`,
                      background: complete ? "linear-gradient(90deg,#D8F53A,#AAD000)" : "linear-gradient(90deg,#fbbf24,#f59e0b)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-2.5 text-center text-[10px] font-semibold text-white/40">
          Nouvelles missions chaque lundi · les points vont à ta ligue
        </p>
      </div>
    </div>
  );
}
