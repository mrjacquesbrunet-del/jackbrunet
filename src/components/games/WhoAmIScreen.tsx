"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildWhoRound,
  whoPoints,
  recordWho,
  getWhoBest,
  getWhoGames,
  getWhoXp,
  getWhoCorrect,
  getWhoStreak,
  WHO_LEVELS,
  WHO_MAX_CLUES,
  type WhoRound,
} from "@/lib/whoami";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getVfXp } from "@/lib/vraifaux";
import { getQuizCoins } from "@/lib/quiz";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { bumpAchv, markDayStreak } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";
import { submitGameScore, submitWeeklyPoints } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";
import { asset } from "@/lib/asset";
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
  IcoArrowL,
  IcoGem,
  IcoPlus,
} from "./ArcadeUI";

const LETTERS = ["A", "B", "C", "D"];
const LEVEL_COLORS = ["#a3e635", "#FCD34D", "#FB923C", "#EF4444"];

/** Niveaux : couleur, dégradé, sous-titres (comme la maquette). */
const LEVEL_CARDS = [
  { grad: "linear-gradient(180deg,#4ade80,#22c55e)", shadow: "#15803d", star: "#dcfce7", l1: "Moins d'indices", l2: "Plus de temps" },
  { grad: "linear-gradient(180deg,#fbbf24,#f59e0b)", shadow: "#b45309", star: "#fffbeb", l1: "Indices équilibrés", l2: "Défi modéré" },
  { grad: "linear-gradient(180deg,#fb923c,#ea580c)", shadow: "#9a3412", star: "#fff7ed", l1: "Peu d'indices", l2: "Défi relevé" },
  { grad: "linear-gradient(180deg,#f87171,#dc2626)", shadow: "#991b1b", star: "#fef2f2", l1: "Indices limités", l2: "Vrai challenge" },
];

type Phase = "hub" | "play" | "over";

export function WhoAmIScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hub");
  // Repart du haut de l'écran à chaque changement de vue (hub <-> jeu),
  // sinon la position de défilement est conservée sous la barre de statut.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

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
  const [games, setGames] = useState(0);
  const [correctTotal, setCorrectTotal] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);

  const refreshStats = () => {
    setBest(getWhoBest());
    setGames(getWhoGames());
    setCorrectTotal(getWhoCorrect());
    setBestStreak(getWhoStreak());
  };

  useEffect(() => {
    refreshStats();
    setXp(getMemorizeXp() + getVfXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("quisuisje", getWhoXp());
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
    streakRef.current = 0;
    bestStreakRef.current = 0;
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
      streakRef.current += 1;
      bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
      // Badges : « Démineur » (personnage ardu) et « Fin limier »
      // (trouvé dès le premier indice).
      if ((cur.item.difficulty ?? 0) >= 4) bumpAchv("hard_correct");
      if (clues === 1) bumpAchv("first_clue");
    } else {
      streakRef.current = 0;
      setShake(true);
      setTimeout(() => setShake(false), 550);
    }
    setTimeout(() => {
      if (idx + 1 >= deck.length) {
        const finalCorrect = correct + (good ? 1 : 0);
        const res = recordWho(ns, finalCorrect, bestStreakRef.current);
        setBest(res.best);
        refreshStats();
        submitGameScore("quisuisje", getWhoXp());
        submitWeeklyPoints(finalCorrect); // bonnes réponses -> ligue
        bumpAchv("games_played");
        markDayStreak("play");
        checkLocalBadges();
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
    const starFill = "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.2l5.9-.9z";
    return (
      <ArcadeShell decor="/img/jeux/decors/quisuisje.jpg">
        <button type="button" onClick={() => router.push("/jeux")} className="flex items-center gap-1.5 font-game text-sm font-semibold text-white/70">
          <IcoArrowL className="h-4 w-4" /> Retour aux jeux
        </button>

        {/* En-tête profil + Record */}
        <div className="mt-3 flex items-center gap-3">
          <span className="relative shrink-0 rounded-full p-[3px]" style={{ background: "linear-gradient(180deg,#D8F53A,#AAD000)", boxShadow: "0 0 18px rgba(202,240,0,.4)" }}>
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#1E1E1D] text-white/75">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" /></svg>
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-game text-xl font-black leading-tight">{name || "Joueur"}</p>
              <span className="shrink-0 rounded-full bg-gradient-to-b from-[#D8F53A] to-[#AAD000] px-2 py-0.5 font-game text-[10px] font-extrabold text-[#0C0C0B]">NIV. {lvl.level}</span>
            </div>
            <div className="qm-xpbar mt-1"><i style={{ width: `${Math.round((lvl.into / lvl.span) * 100)}%` }} /></div>
            <p className="mt-0.5 font-game text-[10px] font-bold text-white/70">{lvl.into} / {lvl.span} <span className="text-amber-300">XP</span></p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="qm-gem"><IcoGem className="h-4 w-4 text-[#CAF000]" /> {xp}<span className="qm-gem-plus"><IcoPlus className="h-3.5 w-3.5" /></span></span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C0C0B] px-3 py-1.5 font-game text-xs font-black text-amber-300 ring-1 ring-white/10">
              <IcoTrophy className="h-4 w-4" /> Record {best}
            </span>
          </div>
        </div>

        {/* Héros */}
        <div className="qm-hero mt-4" style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(202,240,0,.16), transparent 55%), linear-gradient(135deg,rgba(30,30,29,.72) 0%,rgba(12,12,11,.84) 100%)" }}>
          <span className="inline-block rounded-full bg-gradient-to-b from-[#D8F53A] to-[#AAD000] px-3.5 py-1.5 font-game text-[11px] font-black tracking-wide text-[#0C0C0B] shadow-[inset_0_1px_0_rgba(255,255,255,.35)]">DEVINE LE PERSONNAGE</span>
          <div className="relative max-w-[62%]">
            <h1 className="mt-2.5 font-game text-4xl font-black leading-[0.88] drop-shadow">
              QUI<br /><span className="text-[#CAF000]">SUIS-JE</span> ?
            </h1>
            <p className="mt-2.5 font-game text-[13px] font-semibold leading-tight text-white/80">
              Des indices se dévoilent un par un. Devine le plus tôt possible pour marquer plus de points.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/jeux/quisuisje.png")} alt="" className="qm-illo pointer-events-none absolute -bottom-1 -right-2 h-32 w-auto max-w-[38%] object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,.3)]" />
        </div>

        {/* Choix du niveau */}
        <p className="mt-5 font-game text-sm font-black tracking-wide text-white/85">CHOISIS TON NIVEAU</p>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {WHO_LEVELS.map((lab, i) => {
            const c = LEVEL_CARDS[i];
            return (
              <button key={lab} type="button" onClick={() => start(i + 1)} className="relative flex items-center gap-2.5 rounded-2xl p-3.5 text-left transition-transform active:translate-y-[2px]"
                style={{ background: c.grad, boxShadow: `inset 0 2px 0 rgba(255,255,255,.4),0 5px 0 ${c.shadow}` }}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "rgba(255,255,255,.28)" }}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill={c.star} aria-hidden><path d={starFill} /></svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-game text-base font-black uppercase leading-none text-white drop-shadow">{lab}</p>
                  <p className="mt-0.5 text-[10px] font-semibold leading-tight text-white/90">{c.l1}<br />{c.l2}</p>
                </div>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/25 text-white"><IcoPlay className="h-4 w-4" /></span>
              </button>
            );
          })}
        </div>

        {/* Accueil des jeux */}
        <button type="button" onClick={() => router.push("/jeux")} className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-game text-xl font-black text-[#4a2600]"
          style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.5),0 7px 0 #b45309" }}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M12 3l9 8h-2.5v9h-5.5v-6h-2v6H5.5v-9H3z" /></svg>
          ACCUEIL DES JEUX
        </button>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { icon: "M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2z", tint: "#c4b5fd", val: games, lab: "Parties jouées", fill: false },
            { icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z", tint: "#fb7185", val: correctTotal, lab: "Bonnes réponses", fill: false },
            { icon: starFill, tint: "#fbbf24", val: bestStreak, lab: "Meilleure série", fill: true },
          ].map((s) => (
            <div key={s.lab} className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5" style={{ color: s.tint }} fill={s.fill ? "currentColor" : "none"} stroke={s.fill ? "none" : "currentColor"} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                <span className="font-game text-2xl font-black text-white">{s.val}</span>
              </div>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-white/55">{s.lab}</p>
            </div>
          ))}
        </div>

        {/* Classement de ce jeu */}
        <div className="mt-5">
          <ScoreBoard mode="quisuisje" accent="#CAF000" title="Classement · Qui suis-je" />
        </div>
      </ArcadeShell>
    );
  }

  /* ---------------- OVER ---------------- */
  if (phase === "over") {
    return (
      <ArcadeShell decor="/img/jeux/decors/quisuisje.jpg">
        <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={best} onBack={() => setPhase("hub")} />
        <div className="qm-card mt-6 p-6 text-center">
          <p className="font-game text-sm text-white/60">Partie terminée · {WHO_LEVELS[level - 1]}</p>
          <p className="my-3 font-game text-6xl font-black text-[#CAF000]">{score}</p>
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
    <ArcadeShell decor="/img/jeux/decors/quisuisje.jpg">
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
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#CAF000]" />
              <span>{cl}</span>
            </li>
          ))}
        </ul>
        {reveal ? (
          <p className="mt-3 rounded-xl bg-white/[0.08] px-3 py-2 font-game text-sm font-bold">
            Réponse : <span className="text-[#CAF000]">{cur?.item.name}</span>
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
