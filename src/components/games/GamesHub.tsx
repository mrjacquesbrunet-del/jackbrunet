"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getQuizCoins,
  getQuizGames,
  getQuizStreak,
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
const IconGear = S("M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V20a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 18.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13H4a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4.7V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a2 2 0 1 1 0 4h-.5z");
const IconFlame = S("M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z");
const IconGem = S("M6 3h12l3 5-9 13L3 8zM3 8h18M9 3l-1 5M15 3l1 5");
/* Connaissances : toque de diplômé */
const IconCap = S("M3 9l9-4 9 4-9 4zM7 11v4c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-4M21 9v4");
/* Mémoriser : ampoule */
const IconBulb = S("M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10 3 3 0 0 0-1 2H9a3 3 0 0 0-1-2 6 6 0 0 1 4-10z");
/* Vrai ou Faux : balance */
const IconScale = S("M12 4v16M8 20h8M6 7h12M6 7l-2.5 5a3 3 0 0 0 5 0zM18 7l-2.5 5a3 3 0 0 0 5 0z");

/* ---------------- Les trois jeux ---------------- */
type Game = {
  id: string;
  title1: string;
  title2: string;
  desc: string;
  href: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  accent: string; // couleur d'accent (halo + médaillon + flèche)
};
const GAMES: Game[] = [
  {
    id: "connaissances",
    title1: "Le jeu des",
    title2: "connaissances",
    desc: "Réponds aux questions et deviens incollable sur la Bible !",
    href: "/quiz",
    Icon: IconCap,
    accent: "#CAF000",
  },
  {
    id: "memo",
    title1: "Mémoriser",
    title2: "des versets",
    desc: "Grave la Parole dans ton cœur, verset après verset.",
    href: "/memoriser",
    Icon: IconBulb,
    accent: "#8FE23C",
  },
  {
    id: "vraifaux",
    title1: "Vrai",
    title2: "ou Faux",
    desc: "Réponds vite et enchaîne les bonnes réponses !",
    href: "/vrai-faux",
    Icon: IconScale,
    accent: "#34D3C6",
  },
];

export function GamesHub() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [games, setGames] = useState(0);
  const [streak, setStreak] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [memoXp, setMemoXp] = useState(0);
  const [vfXp, setVfXp] = useState(0);

  useEffect(() => {
    setCoins(getQuizCoins());
    setGames(getQuizGames());
    setStreak(getQuizStreak());
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
        /* pas connecté : avatar neutre */
      }
    })();
  }, []);

  const totalXp = memoXp + vfXp + Math.floor(coins / 500);
  const { level, into, span } = useMemo(() => levelFromXp(totalXp), [totalXp]);
  const trophyCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;

  return (
    <div className="mx-auto max-w-xl px-4 pb-28 pt-[calc(4.5rem+env(safe-area-inset-top))] text-cream">
      {/* ---------- Profil joueur ---------- */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-night-800 via-night-900 to-night-950 p-5 shadow-2xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-dawn-400/20 blur-3xl" />

        <Link
          href="/profil"
          aria-label="Réglages du profil"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-cream/80 ring-1 ring-white/10"
        >
          <IconGear className="h-5 w-5" />
        </Link>

        <div className="relative flex items-center gap-4 pr-12">
          <Link href="/profil" aria-label="Mon profil" className="relative shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-[76px] w-[76px] rounded-full object-cover ring-2 ring-dawn-400/70" />
            ) : (
              <span className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white/10 text-cream/70 ring-2 ring-white/15">
                <IconUser className="h-9 w-9" />
              </span>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-game text-sm text-cream/60">Bonjour</p>
            <p className="truncate font-game text-2xl font-extrabold leading-tight">{name || "Joueur"}</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="shrink-0 rounded-full bg-dawn-400 px-3 py-0.5 font-game text-xs font-extrabold text-night-950">
                NIV. {level}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-dawn-300 to-dawn-500" style={{ width: `${Math.round((into / span) * 100)}%` }} />
              </div>
            </div>
            <p className="mt-1 text-right font-game text-[11px] text-cream/50">
              {into} / {span} <span className="text-dawn-300">XP</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.04] p-1">
          <Stat Icon={IconTrophy} tint="#FCD34D" value={String(trophyCount)} label="Trophées" />
          <Stat Icon={IconFlame} tint="#FB923C" value={String(streak)} label="Série" />
          <Stat Icon={IconGem} tint="#CAF000" value={formatCoins(coins)} label="Pièces" />
        </div>
      </section>

      {/* ---------- Choisis ton jeu ---------- */}
      <div className="mt-7 flex items-center gap-2">
        <h2 className="font-game text-xl font-extrabold">Choisis ton jeu</h2>
        <IconPad className="h-5 w-5 text-dawn-300" />
      </div>

      <div className="mt-3 space-y-4">
        {GAMES.map((g) => (
          <Link
            key={g.id}
            href={g.href}
            className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-night-800 via-night-900 to-night-950 p-4 shadow-card active:scale-[.99]"
          >
            <span
              className="pointer-events-none absolute -left-8 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full blur-2xl"
              style={{ background: g.accent, opacity: 0.18 }}
            />
            {/* Médaillon illustré */}
            <span
              className="relative grid h-20 w-20 shrink-0 place-items-center rounded-2xl ring-1 ring-white/10"
              style={{ background: `radial-gradient(circle at 30% 25%, ${g.accent}33, rgba(255,255,255,0.04) 70%)` }}
            >
              <g.Icon className="h-10 w-10" />
              <span className="absolute inset-0 rounded-2xl" style={{ boxShadow: `inset 0 0 0 1px ${g.accent}55` }} />
            </span>
            <div className="relative min-w-0 flex-1">
              <p className="font-game text-lg font-extrabold uppercase leading-tight tracking-wide">
                {g.title1}
                <br />
                {g.title2}
              </p>
              <p className="mt-1 font-game text-xs font-semibold text-cream/60">{g.desc}</p>
            </div>
            <span
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream shadow-lg transition-transform group-hover:translate-x-0.5"
              style={{ color: "#0C0C0B" }}
            >
              <IconChevron className="h-5 w-5" />
            </span>
          </Link>
        ))}
      </div>

      {/* ---------- Récap discret ---------- */}
      <p className="mt-6 text-center font-game text-[11px] text-cream/40">
        {games} parties jouées · {trophyCount}/{ACHIEVEMENTS.length} trophées
      </p>
    </div>
  );
}

/* Manette (accent du titre) */
const IconPad = S("M7 12h4M9 10v4M15 11h.01M18 13h.01M8 7h8a5 5 0 0 1 5 5 4 4 0 0 1-7 3H10a4 4 0 0 1-7-3 5 5 0 0 1 5-5z");

function Stat({ Icon, tint, value, label }: { Icon: (p: { className?: string }) => React.ReactElement; tint: string; value: string; label: string }) {
  return (
    <div className="rounded-xl py-3 text-center">
      <span className="inline-flex items-center gap-1.5 font-game text-lg font-extrabold">
        <Icon className="h-4 w-4" />
        <span style={{ color: tint }}>{value}</span>
      </span>
      <p className="text-[10px] font-bold uppercase tracking-wide text-cream/50">{label}</p>
    </div>
  );
}
