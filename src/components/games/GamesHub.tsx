"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getQuizCoins,
  getQuizGames,
  getQuizBest,
  formatCoins,
  ACHIEVEMENTS,
  getUnlockedAchievements,
} from "@/lib/quiz";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getVfXp } from "@/lib/vraifaux";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";

/* ---------------- Icônes (trait de la charte) ---------------- */
const S = (d: string) => (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconTrophy = S("M8 4h8v3a4 4 0 0 1-8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M9 20h6M12 12v4");
const IconUser = S("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0");
const IconChevron = S("M9 6l6 6-6 6");
/* Mémoriser : ampoule (grave la Parole dans la mémoire) */
const IconBulb = S("M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10 3 3 0 0 0-1 2H9a3 3 0 0 0-1-2 6 6 0 0 1 4-10z");
/* Connaissances : toque de diplômé (le jeu de savoir) */
const IconCap = S("M3 9l9-4 9 4-9 4zM7 11v4c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-4M21 9v4");

/* ---------------- Les deux jeux ---------------- */
type Game = {
  id: string;
  title: string;
  tag: string;
  href: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  from: string;
  to: string;
};
const GAMES: Game[] = [
  {
    id: "connaissances",
    title: "Le jeu des connaissances",
    tag: "Quiz biblique · 30 paliers",
    href: "/quiz",
    Icon: IconCap,
    from: "#4c1d95",
    to: "#9d174d",
  },
  {
    id: "memo",
    title: "Mémoriser",
    tag: "Grave la Parole dans ton cœur",
    href: "/memoriser",
    Icon: IconBulb,
    from: "#3f6212",
    to: "#0b3b2e",
  },
];

export function GamesHub() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [games, setGames] = useState(0);
  const [best, setBest] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [memoXp, setMemoXp] = useState(0);
  const [vfXp, setVfXp] = useState(0);

  useEffect(() => {
    setCoins(getQuizCoins());
    setGames(getQuizGames());
    setBest(getQuizBest());
    setUnlocked(getUnlockedAchievements());
    setMemoXp(getMemorizeXp());
    setVfXp(getVfXp());

    // Profil réel : photo + prénom (pseudo) de l'utilisateur connecté.
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
        /* pas connecté : on garde l'avatar neutre */
      }
    })();
  }, []);

  const totalXp = memoXp + vfXp + Math.floor(coins / 500);
  const { level, into, span } = useMemo(() => levelFromXp(totalXp), [totalXp]);
  const trophyCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  const unlockedList = ACHIEVEMENTS.filter((a) => unlocked.has(a.id));

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-[calc(4.5rem+env(safe-area-inset-top))] text-cream">
      {/* ---------- Profil joueur (photo réelle + prénom) ---------- */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-violet-900 via-violet-950 to-night-950 p-5 shadow-2xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-[#8FE23C]/20 blur-3xl" />

        <div className="relative flex items-center gap-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              className="h-[84px] w-[84px] shrink-0 rounded-full object-cover ring-2 ring-[#8FE23C]/70"
            />
          ) : (
            <div className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-full bg-white/10 text-cream/70 ring-2 ring-white/15">
              <IconUser className="h-10 w-10" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-0.5 font-game text-xs font-extrabold text-night-950">
              Niveau {level}
            </span>
            <p className="mt-1 truncate font-game text-2xl font-extrabold">{name || "Joueur"}</p>
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

      {/* ---------- Les deux jeux ---------- */}
      <section className="mt-7">
        <h2 className="font-game text-xl font-extrabold">Choisis ton jeu</h2>
        <div className="mt-3 space-y-3">
          {GAMES.map((g) => (
            <Link
              key={g.id}
              href={g.href}
              className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-white/10 p-4 shadow-card active:scale-[.99]"
              style={{ background: `linear-gradient(120deg, ${g.from}, ${g.to})` }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,.16),transparent_55%)]" />
              <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                <g.Icon className="h-8 w-8 text-white" />
              </span>
              <div className="relative min-w-0 flex-1">
                <p className="font-game text-xl font-extrabold leading-tight text-white drop-shadow">{g.title}</p>
                <p className="mt-0.5 font-game text-xs font-semibold text-white/70">{g.tag}</p>
              </div>
              <IconChevron className="relative h-6 w-6 shrink-0 text-white/60 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Accomplissements ---------- */}
      <section className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="font-game text-xl font-extrabold">Accomplissements</h2>
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
