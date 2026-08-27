"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

const ACC = "#8B5CF6"; // violet « mystère »
const S = (d: string) => (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconUser = S("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0");
const IconMask = S("M12 3C7 3 3 6 3 11c0 4 3 6 4 8 .5 1 1.5 2 5 2s4.5-1 5-2c1-2 4-4 4-8 0-5-4-8-9-8zM8.5 11h.01M15.5 11h.01M9 15c1 1 5 1 6 0");
const IconPlay = S("M8 5v14l11-7z");
const IconClose = S("M6 6l12 12M18 6L6 18");
const IconBulb = S("M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10 3 3 0 0 0-1 2H9a3 3 0 0 0-1-2 6 6 0 0 1 4-10z");
const IconTrophy = S("M8 4h8v3a4 4 0 0 1-8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M9 20h6M12 12v4");
const LEVEL_COLORS = ["#8FE23C", "#FCD34D", "#FB923C", "#EF4444"];

type Phase = "hub" | "play" | "over";

export function WhoAmIScreen() {
  const [phase, setPhase] = useState<Phase>("hub");
  const [level, setLevel] = useState(1); // 1..4
  const [deck, setDeck] = useState<WhoRound[]>([]);
  const [idx, setIdx] = useState(0);
  const [clues, setClues] = useState(1); // indices révélés (1..4)
  const [picked, setPicked] = useState<string | null>(null);
  const reveal = picked !== null;
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [best, setBest] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState(0);

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

  // Verrou du défilement de fond.
  useEffect(() => {
    const b = document.body,
      h = document.documentElement;
    const pb = b.style.overflow,
      ph = h.style.overflow;
    b.style.overflow = "hidden";
    h.style.overflow = "hidden";
    return () => {
      b.style.overflow = pb;
      h.style.overflow = ph;
    };
  }, []);

  const lvl = levelFromXp(xp);

  const start = (lv: number) => {
    setLevel(lv);
    setDeck(buildWhoRound(lv));
    setIdx(0);
    setClues(1);
    setPicked(null);
    setScore(0);
    setCorrect(0);
    setPhase("play");
  };

  const cur = deck[idx];
  const potential = whoPoints(clues);

  const answer = (choice: string) => {
    if (picked !== null || !cur) return;
    setPicked(choice);
    const good = choice === cur.item.name;
    const gain = good ? whoPoints(clues) : 0;
    const ns = score + gain;
    if (good) {
      setScore(ns);
      setCorrect((c) => c + 1);
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
        setPicked(null);
      }
    }, 1300);
  };

  /* ---------------- HUB ---------------- */
  if (phase === "hub") {
    return (
      <Shell>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Hud name={name} avatar={avatar} lvl={lvl} />
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 font-game text-xs font-extrabold" style={{ color: ACC }}>
            <IconTrophy className="h-4 w-4" /> Record {best}
          </span>
        </div>

        {/* Héros */}
        <div className="relative mt-4 overflow-hidden rounded-3xl border border-white/10 p-5" style={{ background: `radial-gradient(130% 120% at 0% 0%, ${ACC}33, rgba(23,23,22,.6) 62%)` }}>
          <span className="pointer-events-none absolute -right-3 -top-3" style={{ color: `${ACC}22` }}>
            <IconMask className="h-32 w-32" />
          </span>
          <span className="inline-block rounded-lg px-3 py-0.5 font-game text-[10px] font-extrabold text-night-950" style={{ background: ACC }}>
            DEVINE LE PERSONNAGE
          </span>
          <h1 className="mt-2 font-game text-4xl font-black leading-[0.95]">
            QUI <span style={{ color: ACC }}>SUIS-JE</span> ?
          </h1>
          <p className="mt-2 max-w-[16rem] font-game text-sm font-semibold text-cream/70">
            Des indices se dévoilent un par un. Devine le plus tôt possible pour marquer plus de points.
          </p>
        </div>

        {/* Choix du niveau */}
        <p className="mt-5 font-game text-sm font-extrabold text-cream/80">CHOISIS TON NIVEAU</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {WHO_LEVELS.map((lab, i) => (
            <button
              key={lab}
              type="button"
              onClick={() => start(i + 1)}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left active:scale-[.98]"
            >
              <span className="font-game text-base font-extrabold" style={{ color: LEVEL_COLORS[i] }}>{lab}</span>
              <IconPlay className="h-5 w-5 text-cream/50" />
            </button>
          ))}
        </div>

        <Link
          href="/jeux"
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] py-3 font-game text-sm font-bold text-cream"
        >
          Accueil des jeux
        </Link>
      </Shell>
    );
  }

  /* ---------------- OVER ---------------- */
  if (phase === "over") {
    return (
      <Shell>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center">
          <p className="font-game text-sm text-cream/60">Partie terminée · {WHO_LEVELS[level - 1]}</p>
          <p className="my-3 font-game text-6xl font-black" style={{ color: ACC }}>{score}</p>
          <p className="text-sm text-cream/60">{correct}/{deck.length} bien devinés</p>
          <p className="mt-4 font-game text-sm">Record : <span className="font-extrabold text-amber-300">{best}</span></p>
        </div>
        <button type="button" onClick={() => start(level)} className="mt-4 w-full rounded-2xl py-4 font-game text-lg font-black text-night-950" style={{ background: ACC }}>
          REJOUER
        </button>
        <button type="button" onClick={() => setPhase("hub")} className="mt-2 w-full rounded-2xl border border-white/12 bg-white/[0.06] py-3 font-game text-sm font-bold text-cream">
          Changer de niveau
        </button>
      </Shell>
    );
  }

  /* ---------------- PLAY ---------------- */
  return (
    <Shell>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setPhase("hub")} aria-label="Quitter" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
          <IconClose className="h-5 w-5" />
        </button>
        <span className="rounded-full bg-white/10 px-3 py-1 font-game text-xs font-extrabold" style={{ color: ACC }}>
          {idx + 1}/{deck.length} · {WHO_LEVELS[level - 1]}
        </span>
        <span className="font-game text-sm font-extrabold">Score {score}</span>
      </div>

      {/* Indices */}
      <div key={idx} className="mt-4 rounded-3xl border border-white/10 bg-white/[0.05] p-5" style={{ animation: "fadeup .3s ease-out" }}>
        <div className="flex items-center justify-between">
          <span className="font-game text-xs font-extrabold" style={{ color: ACC }}>INDICES {clues}/{WHO_MAX_CLUES}</span>
          {!reveal ? <span className="font-game text-xs font-bold text-cream/60">+{potential} pts</span> : null}
        </div>
        <ul className="mt-3 space-y-2">
          {cur?.item.clues.slice(0, clues).map((cl, i) => (
            <li key={i} className="flex gap-2 text-sm text-cream/90">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ACC }} />
              <span>{cl}</span>
            </li>
          ))}
        </ul>
        {reveal ? (
          <p className="mt-3 rounded-xl bg-white/[0.06] px-3 py-2 font-game text-sm font-bold">
            Réponse : <span style={{ color: ACC }}>{cur?.item.name}</span>
          </p>
        ) : clues < WHO_MAX_CLUES ? (
          <button
            type="button"
            onClick={() => setClues((c) => Math.min(WHO_MAX_CLUES, c + 1))}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 font-game text-xs font-bold text-cream/80"
          >
            <IconBulb className="h-4 w-4" /> Indice suivant
          </button>
        ) : null}
      </div>

      {/* Propositions */}
      <div className="mt-4 grid grid-cols-1 gap-2.5">
        {cur?.options.map((opt) => {
          const showCorrect = reveal && opt === cur.item.name;
          const showWrong = reveal && picked === opt && opt !== cur.item.name;
          const cls = showCorrect
            ? "border-[#22c55e] bg-[#22c55e] text-white"
            : showWrong
              ? "border-rose-500 bg-rose-500 text-white"
              : "border-white/12 bg-night-900/60 text-cream";
          return (
            <button
              key={opt}
              type="button"
              disabled={reveal}
              onClick={() => answer(opt)}
              className={`rounded-2xl border-2 px-4 py-3.5 text-left font-game text-base font-bold ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function Hud({ name, avatar, lvl }: { name: string; avatar: string | null; lvl: { level: number; into: number; span: number } }) {
  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20" />
      ) : (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-cream/70 ring-2 ring-white/15">
          <IconUser className="h-7 w-7" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-game text-sm font-extrabold">{name || "Joueur"}</p>
        <p className="font-game text-[11px] font-bold" style={{ color: ACC }}>NIVEAU {lvl.level}</p>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-night-950 text-cream [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch]">
      <style dangerouslySetInnerHTML={{ __html: "@keyframes fadeup{0%{transform:translateY(12px);opacity:0}100%{transform:translateY(0);opacity:1}}" }} />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#1a1230] via-night-950 to-night-950" />
      <div className="relative mx-auto w-full max-w-md px-4 pb-16 pt-[calc(0.75rem+env(safe-area-inset-top))]">{children}</div>
    </div>
  );
}
