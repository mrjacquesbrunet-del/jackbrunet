"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildWhoRound,
  whoPoints,
  recordWho,
  getWhoBest,
  WHO_LEVELS,
  WHO_MAX_CLUES,
  type WhoRound,
} from "@/lib/whoami";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getVfXp } from "@/lib/vraifaux";
import { getQuizCoins } from "@/lib/quiz";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitWeeklyPoints } from "@/lib/game-scores";
import {
  ArcadeShell,
  ArcadeHeader,
  ArcadeOption,
  ArcadeActions,
  IcoBulb,
  IcoTrophy,
  IcoPlay,
  IcoStar,
  IcoRefresh,
} from "./ArcadeUI";

const LETTERS = ["A", "B", "C", "D"];
const LEVEL_COLORS = ["#a3e635", "#FCD34D", "#FB923C", "#EF4444"];

type Phase = "hub" | "play" | "over";

export function WhoAmIScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hub");
  const [level, setLevel] = useState(1); // 1..4
  const [deck, setDeck] = useState<WhoRound[]>([]);
  const [idx, setIdx] = useState(0);
  const [clues, setClues] = useState(1); // indices révélés (1..4)
  const [selected, setSelected] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const reveal = picked !== null;
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [best, setBest] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setBest(getWhoBest());
    setXp(getMemorizeXp() + getVfXp() + Math.floor(getQuizCoins() / 500));
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      try {
        const { data } = await sb.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        const prof = await getProfile(uid);
        const first =
          (prof?.pseudo && prof.pseudo.trim()) ||
          (data.user?.user_metadata?.first_name as string | undefined) ||
          "";
        setName(first);
        setAvatar(prof?.avatar_url || null);
      } catch {
        /* avatar neutre */
      }
    })();
  }, []);

  const lvl = levelFromXp(xp);

  const start = (lv: number) => {
    setLevel(lv);
    setDeck(buildWhoRound(lv));
    setIdx(0);
    setClues(1);
    setSelected(null);
    setPicked(null);
    setScore(0);
    setCorrect(0);
    setPhase("play");
  };

  const cur = deck[idx];
  const potential = whoPoints(clues);

  const validate = () => {
    if (picked !== null || !cur || selected === null) return;
    const choice = selected;
    setPicked(choice);
    const good = choice === cur.item.name;
    const gain = good ? whoPoints(clues) : 0;
    const ns = score + gain;
    if (good) {
      setScore(ns);
      setCorrect((c) => c + 1);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 550);
    }
    setTimeout(() => {
      if (idx + 1 >= deck.length) {
        const res = recordWho(ns);
        setBest(res.best);
        submitWeeklyPoints(good ? correct + 1 : correct); // bonnes réponses -> ligue
        setPhase("over");
      } else {
        setIdx((n) => n + 1);
        setClues(1);
        setSelected(null);
        setPicked(null);
      }
    }, 1400);
  };

  /* ---------------- HUB ---------------- */
  if (phase === "hub") {
    return (
      <ArcadeShell>
        <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={best} onBack={() => router.push("/jeux")} />

        {/* Héros */}
        <div className="qm-card relative mt-4 overflow-hidden p-5">
          <span className="qm-pill-o">DEVINE LE PERSONNAGE</span>
          <h1 className="mt-2 font-game text-4xl font-black leading-[0.95]">
            QUI <span className="text-fuchsia-300">SUIS-JE</span> ?
          </h1>
          <p className="mt-2 max-w-[16rem] font-game text-sm font-semibold text-white/75">
            Des indices se dévoilent un par un. Devine le plus tôt possible pour marquer plus de points.
          </p>
          <span className="pointer-events-none absolute -right-3 -top-2 text-white/10">
            <IcoStar className="h-28 w-28" />
          </span>
        </div>

        {/* Choix du niveau */}
        <p className="mt-5 font-game text-sm font-extrabold text-white/85">CHOISIS TON NIVEAU</p>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {WHO_LEVELS.map((lab, i) => (
            <button key={lab} type="button" onClick={() => start(i + 1)} className="qm-card flex items-center justify-between p-4 text-left active:scale-[.98]">
              <span className="font-game text-base font-extrabold" style={{ color: LEVEL_COLORS[i] }}>{lab}</span>
              <IcoPlay className="h-5 w-5 text-white/50" />
            </button>
          ))}
        </div>

        <button type="button" onClick={() => router.push("/jeux")} className="qm-ghost mt-5 flex w-full items-center justify-center gap-2">
          Accueil des jeux
        </button>
      </ArcadeShell>
    );
  }

  /* ---------------- OVER ---------------- */
  if (phase === "over") {
    return (
      <ArcadeShell>
        <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={best} onBack={() => setPhase("hub")} />
        <div className="qm-card mt-6 p-6 text-center">
          <p className="font-game text-sm text-white/60">Partie terminée · {WHO_LEVELS[level - 1]}</p>
          <p className="my-3 font-game text-6xl font-black text-fuchsia-300">{score}</p>
          <p className="text-sm text-white/70">{correct}/{deck.length} bien devinés</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-game text-sm">
            <IcoTrophy className="h-4 w-4 text-amber-300" /> Record <span className="font-extrabold text-amber-300">{best}</span>
          </div>
        </div>
        <button type="button" onClick={() => start(level)} className="qm-valid mt-4 flex w-full items-center justify-center gap-2">
          <IcoRefresh className="h-5 w-5" /> REJOUER
        </button>
        <button type="button" onClick={() => setPhase("hub")} className="qm-ghost mt-2 w-full">
          Changer de niveau
        </button>
      </ArcadeShell>
    );
  }

  /* ---------------- PLAY ---------------- */
  const canValidate = selected !== null && !reveal;
  return (
    <ArcadeShell>
      <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={score} onBack={() => setPhase("hub")} />

      {/* Carte niveau / progression */}
      <div className="qm-card relative mt-4 overflow-hidden p-4">
        <span className="qm-pill-o" style={{ background: `linear-gradient(180deg,${LEVEL_COLORS[level - 1]},${LEVEL_COLORS[level - 1]})` }}>
          {WHO_LEVELS[level - 1].toUpperCase()}
        </span>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-game text-4xl font-black leading-none">{score}</span>
          <span className="mb-1 font-game text-sm font-bold text-white/70">points</span>
        </div>
        <p className="mt-1 font-game text-xs font-semibold text-white/70">Personnage {idx + 1} / {deck.length} · devine vite pour plus de points&nbsp;!</p>
        <span className="pointer-events-none absolute -right-2 -top-2 text-white/10">
          <IcoStar className="h-24 w-24" />
        </span>
      </div>

      {/* Carte indices + réponses */}
      <div key={idx} className={`qm-card mt-4 p-4 ${shake ? "qm-shake" : ""}`} style={{ animation: shake ? undefined : "qm-optin .35s ease-out" }}>
        <div className="flex items-center justify-between">
          <span className="qm-pill-p">INDICES {clues} / {WHO_MAX_CLUES}</span>
          {!reveal ? <span className="font-game text-sm font-extrabold text-amber-300">+{potential} pts</span> : null}
        </div>
        <ul className="mt-3 space-y-2">
          {cur?.item.clues.slice(0, clues).map((cl, i) => (
            <li key={i} className="flex gap-2 font-game text-[15px] font-semibold leading-snug text-white/95">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-300" />
              <span>{cl}</span>
            </li>
          ))}
        </ul>
        {reveal ? (
          <p className="mt-3 rounded-xl bg-white/[0.08] px-3 py-2 font-game text-sm font-bold">
            Réponse : <span className="text-fuchsia-300">{cur?.item.name}</span>
          </p>
        ) : null}

        <div className="mt-4 space-y-2.5">
          {cur?.options.map((opt, i) => {
            const showCorrect = reveal && opt === cur.item.name;
            const showWrong = reveal && picked === opt && opt !== cur.item.name;
            const isSel = selected === opt;
            const state = showCorrect ? "correct" : showWrong ? "wrong" : isSel ? "sel" : "idle";
            return (
              <ArcadeOption key={opt} badge={LETTERS[i]} state={state} disabled={reveal} onClick={() => setSelected(opt)}>
                {opt}
              </ArcadeOption>
            );
          })}
        </div>
      </div>

      {/* Joker : indice suivant */}
      {!reveal && clues < WHO_MAX_CLUES ? (
        <button
          type="button"
          onClick={() => setClues((c) => Math.min(WHO_MAX_CLUES, c + 1))}
          className="qm-joker qm-joker-gold mt-4 flex w-full items-center justify-center gap-2"
        >
          <IcoBulb className="h-5 w-5" /> Indice suivant <span className="text-white/80">(−points)</span>
        </button>
      ) : null}

      {/* Actions */}
      <ArcadeActions
        onQuit={() => setPhase("hub")}
        action={
          reveal ? (
            <div className="flex-1 rounded-2xl bg-white/10 py-4 text-center font-game font-black">
              {picked === cur?.item.name ? "Bravo !" : "Raté…"}
            </div>
          ) : (
            <button type="button" disabled={!canValidate} onClick={validate} className="qm-valid">
              VALIDER MA RÉPONSE
            </button>
          )
        }
      />
    </ArcadeShell>
  );
}
