"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getQuizName,
  setQuizName,
  getQuizCoins,
  getQuizGames,
  getQuizBest,
  getQuizBestRung,
  formatCoins,
  LADDER,
  ACHIEVEMENTS,
  getUnlockedAchievements,
} from "@/lib/quiz";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";

/* ---------------- Avatars de personnage (personnalisation locale) ---------------- */
const AV_KEY = "jb.games.avatar.v1";
type Char = { id: string; from: string; to: string; glyph: string };
const CHARACTERS: Char[] = [
  { id: "lime", from: "#8FE23C", to: "#4c8f0f", glyph: "M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z" }, // étoile
  { id: "violet", from: "#a78bfa", to: "#6d28d9", glyph: "M12 3c1.6 3 4.6 4 4.6 8.5A4.6 4.6 0 0 1 7.4 11.5c0-1 .4-2 1-2.7C9.5 10.5 10 7 12 3z" }, // flamme
  { id: "sky", from: "#38bdf8", to: "#0369a1", glyph: "M12 3l7 3v5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z" }, // bouclier
  { id: "amber", from: "#fbbf24", to: "#b45309", glyph: "M5 16l2-9 5 5 5-5 2 9zM5 19h14" }, // couronne
  { id: "rose", from: "#fb7185", to: "#9f1239", glyph: "M6 4h9a3 3 0 0 1 3 3v13l-6-3-6 3z" }, // livre/marque-page
  { id: "teal", from: "#2dd4bf", to: "#0f766e", glyph: "M4 12c4-6 12-6 16 0-4 6-12 6-16 0zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" }, // œil / oiseau stylisé
  { id: "orange", from: "#fb923c", to: "#c2410c", glyph: "M13 2L4 14h6l-1 8 9-12h-6z" }, // éclair
  { id: "fuchsia", from: "#e879f9", to: "#a21caf", glyph: "M12 4c3 3 3 6 0 9-3-3-3-6 0-9zM12 13c3 3 3 5 0 7-3-2-3-4 0-7z" }, // colombe stylisée
];
function getCharId(): string {
  try {
    return localStorage.getItem(AV_KEY) || CHARACTERS[0].id;
  } catch {
    return CHARACTERS[0].id;
  }
}
function charById(id: string): Char {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

function Avatar({ char, size = 96, ring = true }: { char: Char; size?: number; ring?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl ${ring ? "ring-4 ring-white/15" : ""}`}
      style={{ width: size, height: size, background: `linear-gradient(150deg, ${char.from}, ${char.to})` }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="none" stroke="#0C0C0B" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
        <path d={char.glyph} />
      </svg>
    </span>
  );
}

/* ---------------- Icônes ---------------- */
const S = (d: string) => (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconEdit = S("M4 20h4L18 10l-4-4L4 16zM14 6l4 4");
const IconTrophy = S("M8 4h8v3a4 4 0 0 1-8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M9 20h6M12 12v4");
const IconPlay = S("M8 5v14l11-7z");
const IconLock = S("M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5z");

/* ---------------- Catalogue des jeux ---------------- */
type Game = {
  id: string;
  title: string;
  tag: string;
  href?: string;
  from: string;
  to: string;
  soon?: boolean;
};
const GAMES: Game[] = [
  { id: "quiz", title: "Le Défi Biblique", tag: "Quiz · 30 paliers", href: "/quiz", from: "#4c1d95", to: "#9d174d" },
  { id: "memo", title: "Mémoriser", tag: "Grave la Parole", href: "/memoriser", from: "#3f6212", to: "#0b0713" },
  { id: "vraifaux", title: "Vrai ou Faux", tag: "Bientôt", from: "#0e7490", to: "#0b0713", soon: true },
  { id: "mystere", title: "Le Verset Mystère", tag: "Bientôt", from: "#7c2d12", to: "#0b0713", soon: true },
];

export function GamesHub() {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [charId, setCharId] = useState(CHARACTERS[0].id);
  const [picker, setPicker] = useState(false);
  const [coins, setCoins] = useState(0);
  const [games, setGames] = useState(0);
  const [best, setBest] = useState(0);
  const [bestRung, setBestRung] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [memoXp, setMemoXp] = useState(0);

  useEffect(() => {
    setName(getQuizName());
    setCharId(getCharId());
    setCoins(getQuizCoins());
    setGames(getQuizGames());
    setBest(getQuizBest());
    setBestRung(getQuizBestRung());
    setUnlocked(getUnlockedAchievements());
    setMemoXp(getMemorizeXp());
  }, []);

  const char = charById(charId);
  const chooseChar = (id: string) => {
    setCharId(id);
    try {
      localStorage.setItem(AV_KEY, id);
    } catch {
      /* ignore */
    }
    setPicker(false);
  };
  const saveName = (v: string) => {
    setName(v);
    setQuizName(v);
  };

  // Niveau joueur = XP mémorisation + XP dérivée du cumul du Défi.
  const totalXp = memoXp + Math.floor(coins / 500);
  const { level, into, span } = useMemo(() => levelFromXp(totalXp), [totalXp]);
  const trophyCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  const unlockedList = ACHIEVEMENTS.filter((a) => unlocked.has(a.id));

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-[calc(4.5rem+env(safe-area-inset-top))] text-cream">
      {/* ---------- Profil joueur ---------- */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-violet-900 via-violet-950 to-night-950 p-5 shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-[#8FE23C]/20 blur-3xl" />

        <div className="relative flex items-center gap-4">
          <button type="button" onClick={() => setPicker(true)} className="relative" aria-label="Changer d'avatar">
            <Avatar char={char} size={92} />
            <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-[#8FE23C] text-night-950 ring-2 ring-violet-950">
              <IconEdit className="h-3.5 w-3.5" />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-0.5 font-game text-xs font-extrabold text-night-950">
              Niveau {level}
            </span>
            <div className="mt-1 flex items-center gap-2">
              {editing ? (
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => saveName(e.target.value)}
                  onBlur={() => setEditing(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
                  placeholder="Ton pseudo"
                  className="w-full bg-transparent font-game text-2xl font-extrabold text-cream placeholder:text-cream/40 focus:outline-none"
                />
              ) : (
                <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-2 font-game text-2xl font-extrabold">
                  {name || "Ton pseudo"}
                  <IconEdit className="h-4 w-4 text-cream/50" />
                </button>
              )}
            </div>
            {/* Jauge de niveau */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#8FE23C] to-amber-400" style={{ width: `${Math.round((into / span) * 100)}%` }} />
            </div>
            <p className="mt-1 font-game text-[11px] text-cream/50">
              {into} / {span} XP vers le niveau {level + 1}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
          <Stat value={String(games)} label="Parties" />
          <Stat value={`${trophyCount}/${ACHIEVEMENTS.length}`} label="Trophées" />
          <Stat value={formatCoins(best)} label="Meilleur" />
        </div>
      </section>

      {/* ---------- Accomplissements ---------- */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-game text-xl font-extrabold">Accomplissements</h2>
          <Link href="/quiz" className="font-game text-xs font-bold text-[#8FE23C]">
            Voir tout
          </Link>
        </div>
        {unlockedList.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {unlockedList.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 font-game text-sm font-bold text-amber-200">
                <IconTrophy className="h-4 w-4" />
                {a.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-cream/60">
            Aucun trophée pour l&apos;instant — lance une partie pour commencer à en débloquer !
          </p>
        )}
      </section>

      {/* ---------- Catalogue (façon Netflix) ---------- */}
      <section className="mt-7">
        <h2 className="font-game text-xl font-extrabold">Choisis ton jeu</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2">
          {GAMES.map((g) => {
            const inner = (
              <div
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl p-4 shadow-card"
                style={{ background: `linear-gradient(160deg, ${g.from}, ${g.to})` }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,.18),transparent_55%)]" />
                <span className="pointer-events-none absolute right-4 top-2 select-none font-game text-[5rem] font-black leading-none text-white/10">
                  {g.soon ? "?" : g.title.charAt(0)}
                </span>
                {g.soon ? (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 font-game text-[11px] font-bold text-cream/80">
                    <IconLock className="h-3 w-3" /> Bientôt
                  </span>
                ) : null}
                <div className="relative">
                  <p className="font-game text-xl font-extrabold leading-tight text-white drop-shadow">{g.title}</p>
                  <p className="mt-0.5 font-game text-xs font-semibold text-white/70">{g.tag}</p>
                  {!g.soon ? (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#8FE23C] px-3 py-1.5 font-game text-sm font-extrabold text-night-950">
                      <IconPlay className="h-4 w-4" /> Jouer
                    </span>
                  ) : null}
                </div>
              </div>
            );
            return g.href ? (
              <Link key={g.id} href={g.href} className="block">
                {inner}
              </Link>
            ) : (
              <div key={g.id} className="cursor-not-allowed opacity-80">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Sélecteur d'avatar ---------- */}
      {picker ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <button aria-label="Fermer" onClick={() => setPicker(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-gradient-to-b from-violet-900 to-violet-950 p-5 text-cream shadow-2xl sm:rounded-3xl">
            <h3 className="text-center font-game text-xl font-extrabold">Choisis ton personnage</h3>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {CHARACTERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => chooseChar(c.id)}
                  className={`grid place-items-center rounded-2xl p-1.5 ${charId === c.id ? "ring-2 ring-[#8FE23C]" : ""}`}
                >
                  <Avatar char={c} size={64} ring={false} />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPicker(false)}
              className="mt-5 w-full rounded-2xl bg-amber-500 py-3 font-game text-lg font-bold text-night-950"
            >
              Valider
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 py-3">
      <p className="font-game text-lg font-extrabold text-amber-300">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-cream/50">{label}</p>
    </div>
  );
}
