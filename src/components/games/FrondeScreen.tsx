"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FRONDE_LEVELS, FRONDE_CHAPTERS } from "@/lib/fronde-engine/levels";
import { frondeStars, getFrondeXp } from "@/lib/fronde";
import { FrondeGame } from "@/components/games/FrondeGame";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getVfXp } from "@/lib/vraifaux";
import { getQuizCoins } from "@/lib/quiz";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitGameScore } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";
import { asset } from "@/lib/asset";
import { ArcadeShell, HubHeader, IcoRefresh, IcoTrophy, IcoTarget } from "./ArcadeUI";

const AMBER = "#FCD34D";

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

type Phase = "hub" | "play";

export function FrondeScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hub");
  const [levelIdx, setLevelIdx] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (phase !== "hub") return;
    setXp(getMemorizeXp() + getVfXp() + getFrondeXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("fronde", getFrondeXp());
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      try {
        const { data } = await sb.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        const prof = await getProfile(uid);
        setName((prof?.pseudo && prof.pseudo.trim()) || "");
        setAvatar(prof?.avatar_url || null);
      } catch {
        /* avatar neutre */
      }
    })();
  }, [phase]);

  const lvl = levelFromXp(xp);
  const totalStars = useMemo(() => {
    void phase;
    return FRONDE_LEVELS.reduce((n, _, i) => n + frondeStars(i), 0);
  }, [phase]);

  if (phase === "play") {
    return (
      <FrondeGame
        levelIdx={levelIdx}
        onExit={() => setPhase("hub")}
        onNext={() => {
          if (levelIdx + 1 < FRONDE_LEVELS.length) setLevelIdx((i) => i + 1);
          else setPhase("hub");
        }}
      />
    );
  }

  return (
    <ArcadeShell>
      <HubHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={totalStars} onGear={() => router.push("/profil")} />

      <div className="qm-hero mt-4" style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(252,211,77,.2), transparent 55%), linear-gradient(135deg,rgba(30,30,29,.72) 0%,rgba(12,12,11,.84) 100%)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/img/jeux/fronde.png")} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} className="qm-illo pointer-events-none absolute -bottom-2 -right-2 h-32 w-auto max-w-[38%] object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,.35)]" />
        <div className="relative max-w-[62%]">
          <span className="qm-rapide" style={{ background: "rgba(252,211,77,.16)", color: AMBER }}>ADRESSE</span>
          <h1 className="mt-2.5 font-game text-[2rem] font-black leading-[0.9] drop-shadow">
            LA FRONDE <span style={{ color: AMBER }}>DE DAVID</span>
          </h1>
          <p className="mt-2.5 font-game text-[13px] font-semibold leading-tight text-white/85">
            Vise, tends, lâche — attention au vent&nbsp;!
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="qm-obj flex items-center gap-3">
          <span className="qm-obj-ic"><IcoTarget className="h-6 w-6" /></span>
          <div className="min-w-0">
            <p className="font-game text-xs font-black text-teal-800">OBJECTIF</p>
            <p className="text-[11px] font-semibold leading-tight text-teal-900/80">Touche toutes les cibles, vise le meilleur score.</p>
          </div>
        </div>
        <div className="qm-rec flex items-center gap-3">
          <span className="qm-rec-ic"><IcoTrophy className="h-6 w-6" /></span>
          <div className="min-w-0">
            <p className="font-game text-xs font-black text-amber-700">ÉTOILES</p>
            <p className="font-game text-2xl font-black leading-none text-[#4a2600]">{totalStars}/{FRONDE_LEVELS.length * 3}</p>
          </div>
        </div>
      </div>

      {FRONDE_CHAPTERS.map((ch, ci) => {
        const to = ci + 1 < FRONDE_CHAPTERS.length ? FRONDE_CHAPTERS[ci + 1].from : FRONDE_LEVELS.length;
        return (
          <div key={ch.from} className="mt-5">
            <p className="font-game text-sm font-black tracking-wide" style={{ color: AMBER }}>
              CHAPITRE {ci + 1} — {ch.title.toUpperCase()}
            </p>
            <p className="mt-1 text-[11px] italic leading-snug text-white/50">{ch.verse}</p>
            <div className="mt-2.5 grid grid-cols-5 gap-2">
              {FRONDE_LEVELS.slice(ch.from, to).map((l, k) => {
                const i = ch.from + k;
                const stars = frondeStars(i);
                const locked = i > 0 && frondeStars(i - 1) === 0;
                const boss = l.targets.some((t) => t.type === "giant");
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      setLevelIdx(i);
                      setPhase("play");
                      buzz(15);
                    }}
                    className="relative grid aspect-square place-items-center rounded-2xl font-game text-lg font-black transition-transform active:scale-95"
                    style={
                      locked
                        ? { background: "rgba(255,255,255,.05)", color: "rgba(243,243,237,.25)" }
                        : stars > 0
                          ? { background: "linear-gradient(180deg,#FCD34D,#F59E0B)", color: "#4a2600", boxShadow: "0 3px 0 #92400e" }
                          : { background: "linear-gradient(180deg,#30302F,#1E1E1D)", color: "#F3F3ED", boxShadow: "0 3px 0 rgba(0,0,0,.5)", border: boss ? "1px solid rgba(252,211,77,.5)" : "1px solid rgba(255,255,255,.12)" }
                    }
                  >
                    {locked ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}><path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : (
                      <>
                        {boss ? <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-1.5 text-[8px] font-black text-white">GÉANT</span> : null}
                        {i + 1}
                      </>
                    )}
                    {!locked && stars > 0 ? (
                      <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-[1px]">
                        {[1, 2, 3].map((s) => (
                          <svg key={s} viewBox="0 0 24 24" className="h-3 w-3" fill={s <= stars ? "#4a2600" : "rgba(74,38,0,.25)"} aria-hidden>
                            <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.2l5.9-.9z" />
                          </svg>
                        ))}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="mt-4 flex justify-center">
        <button type="button" onClick={() => router.push("/jeux")} className="qm-retour">
          <IcoRefresh className="h-4 w-4" /> RETOUR AUX JEUX
        </button>
      </div>

      <div className="mt-5">
        <ScoreBoard mode="fronde" accent={AMBER} title="Classement · La Fronde" />
      </div>
    </ArcadeShell>
  );
}
