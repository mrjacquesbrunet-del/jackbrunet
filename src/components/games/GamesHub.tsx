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
import { getWhoXp } from "@/lib/whoami";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitGameScore } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";
import { pendingChallenges } from "@/lib/challenges";
import { asset } from "@/lib/asset";
import { AchievementsOverlay } from "@/components/community/ProfileBadges";

const S = (d: string) => (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconUser = S("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0");
const IconEdit = S("M4 20h4L18 10l-4-4L4 16zM14 6l4 4");
const IconGear = S("M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V20a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 18.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13H4a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5.7 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4.7V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a2 2 0 1 1 0 4h-.5z");
const IconGem = S("M6 3h12l3 5-9 13L3 8zM3 8h18M9 3l-1 5M15 3l1 5");
const IconArrow = S("M5 12h14M13 6l6 6-6 6");
const IconCap = S("M3 9l9-4 9 4-9 4zM7 11v4c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-4");
const IconBulb = S("M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10 3 3 0 0 0-1 2H9a3 3 0 0 0-1-2 6 6 0 0 1 4-10z");
const IconScale = S("M12 4v16M8 20h8M6 7h12M6 7l-2.5 5a3 3 0 0 0 5 0zM18 7l-2.5 5a3 3 0 0 0 5 0z");
const IconMask = S("M12 3C7 3 3 6 3 11c0 4 3 6 4 8 .5 1 1.5 2 5 2s4.5-1 5-2c1-2 4-4 4-8 0-5-4-8-9-8zM8.5 11h.01M15.5 11h.01M9 15c1 1 5 1 6 0");
const IconTrophy = S("M8 4h8v3a4 4 0 0 1-8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M9 20h6M12 12v4");

/** Illustration 3D du bouton « Défier un ami » (vide tant que Jack n'a pas fourni la sienne). */
const DEFI_ILLO = "/img/jeux/trophee.png";

type Game = {
  id: string;
  title1: string;
  title2: string;
  desc: string;
  href: string;
  illo: string;
  /** Illustration pleine carte (style maquette) : titre + illustration déjà intégrés. */
  card?: string;
  Icon: (p: { className?: string }) => React.ReactElement;
  from: string;
  to: string;
  arrow: string;
};
const GAMES: Game[] = [
  { id: "quiz", title1: "QUIZ", title2: "BIBLIQUE", desc: "Réponds aux questions et deviens incollable sur la Bible !", href: "/quiz", illo: "/img/jeux/quiz.png", Icon: IconCap, from: "#FBBF24", to: "#F59E0B", arrow: "#F59E0B" },
  { id: "memo", title1: "MÉMORISER", title2: "LES VERSETS", desc: "Grave la Parole dans ton cœur, verset après verset !", href: "/memoriser", illo: "/img/jeux/memoriser.png", Icon: IconBulb, from: "#2DD4BF", to: "#0D9488", arrow: "#0D9488" },
  { id: "quisuisje", title1: "QUI", title2: "SUIS-JE ?", desc: "Devine le personnage biblique grâce aux indices !", href: "/qui-suis-je", illo: "/img/jeux/quisuisje.png", Icon: IconMask, from: "#60A5FA", to: "#3B82F6", arrow: "#2563EB" },
  { id: "vraifaux", title1: "VRAI", title2: "OU FAUX", desc: "Réponds vite et enchaîne les bonnes réponses !", href: "/vrai-faux", illo: "/img/jeux/vraifaux.png", Icon: IconScale, from: "#F472B6", to: "#EC4899", arrow: "#DB2777" },
];

const CSS = `
@keyframes jx-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes jx-in{0%{opacity:0;transform:translateY(20px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes jx-tw{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}
@keyframes jx-shine{0%{transform:translateX(-140%) rotate(20deg)}60%,100%{transform:translateX(320%) rotate(20deg)}}
@keyframes jx-wave{0%,100%{transform:rotate(0)}25%{transform:rotate(18deg)}75%{transform:rotate(-8deg)}}
.jx-card{position:relative;overflow:hidden;border-radius:28px;box-shadow:0 16px 34px -12px rgba(0,0,0,.45);animation:jx-in .5s cubic-bezier(.2,.8,.2,1) both}
.jx-card:active{transform:scale(.98)}
.jx-shine{position:absolute;top:0;left:0;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);filter:blur(6px);animation:jx-shine 4.5s ease-in-out infinite}
.jx-illo{animation:jx-float 3.2s ease-in-out infinite}
.jx-tw{position:absolute;border-radius:9999px;background:#fff;animation:jx-tw 2.4s ease-in-out infinite}
`;

export function GamesHub() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [memoXp, setMemoXp] = useState(0);
  const [vfXp, setVfXp] = useState(0);
  const [pending, setPending] = useState(0);
  const [broken, setBroken] = useState<Set<string>>(new Set());

  useEffect(() => {
    pendingChallenges().then(setPending);
    setStreak(getQuizStreak());
    setUnlocked(getUnlockedAchievements());
    const memo = getMemorizeXp();
    const vf = getVfXp();
    const cn = getQuizCoins();
    setMemoXp(memo);
    setVfXp(vf);
    setCoins(cn);
    submitGameScore("quiz", Math.floor(cn / 500));
    submitGameScore("vraifaux", vf);
    submitGameScore("memoriser", memo);
    submitGameScore("quisuisje", getWhoXp());

    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      try {
        const { data } = await sb.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        setUserId(uid);
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

  const totalXp = memoXp + vfXp + Math.floor(coins / 500);
  const { level, into, span } = useMemo(() => levelFromXp(totalXp), [totalXp]);
  const trophyCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  const pct = Math.max(4, Math.round((into / span) * 100));

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-[#171716] via-[#0C0C0B] to-[#171716] px-4 pb-28 pt-[calc(0.75rem+env(safe-area-inset-top))] text-white">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* halos + étincelles décoratifs */}
      <div className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-[#CAF000]/12 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 rounded-full bg-[#AAD000]/8 blur-3xl" />
      {[
        { l: "16%", t: "18%", s: 6, d: "0s" },
        { l: "82%", t: "14%", s: 8, d: ".6s" },
        { l: "62%", t: "24%", s: 5, d: "1.1s" },
        { l: "30%", t: "9%", s: 5, d: "1.6s" },
      ].map((sp, i) => (
        <span key={i} className="jx-tw" style={{ left: sp.l, top: sp.t, width: sp.s, height: sp.s, animationDelay: sp.d }} />
      ))}

      <div className="relative mx-auto w-full max-w-md">
        {/* ---------- Header ---------- */}
        <header className="flex items-center gap-3">
          <Link href="/profil" aria-label="Mon profil" className="relative shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-16 w-16 rounded-full object-cover ring-4 ring-white/40" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/20 text-white/80 ring-4 ring-white/30">
                <IconUser className="h-9 w-9" />
              </span>
            )}
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-[#171716] shadow">
              <IconEdit className="h-3.5 w-3.5" />
            </span>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-game text-sm text-white/85">
              Bonjour
              <span className="inline-block origin-bottom text-amber-300" style={{ animation: "jx-wave 2.5s ease-in-out infinite" }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V10m0-.5V5a1.5 1.5 0 0 1 3 0v5m0-.5V6a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6h-1a5 5 0 0 1-3.6-1.5L4 14.5a1.5 1.5 0 0 1 2.2-2L8 14" />
                </svg>
              </span>
            </p>
            <p className="truncate font-game text-2xl font-black leading-none drop-shadow">{name || "Joueur"}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="shrink-0 rounded-full bg-gradient-to-b from-[#D8F53A] to-[#AAD000] px-2.5 py-0.5 font-game text-[11px] font-extrabold text-[#0C0C0B]">NIV. {level}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/25">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <p className="mt-0.5 text-right font-game text-[10px] text-white/70">{into} / {span} <span className="text-amber-300">XP</span></p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link href="/profil" aria-label="Réglages" className="grid h-9 w-9 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <IconGear className="h-5 w-5" />
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 font-game text-sm font-extrabold ring-1 ring-white/15">
              <IconGem className="h-4 w-4 text-[#CAF000]" /> {formatCoins(coins)}
            </span>
          </div>
        </header>

        {/* ---------- Titre ---------- */}
        <div className="relative mt-6 text-center">
          <h1 className="font-game text-4xl font-black tracking-wide drop-shadow-[0_3px_0_rgba(0,0,0,0.25)]">CHOISIS TON JEU</h1>
          <p className="mt-1 font-game text-sm font-semibold text-white/80">Quel défi vas-tu relever aujourd&apos;hui&nbsp;?</p>
        </div>

        {/* ---------- Cartes ---------- */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          {GAMES.map((g, i) => {
            // Carte « maquette » : illustration pleine carte (titre + visuel intégrés).
            const useCard = g.card && !broken.has(g.id);
            return (
              <Link key={g.id} href={g.href} className="jx-card block" style={{ background: `linear-gradient(160deg, ${g.from}, ${g.to})`, animationDelay: `${0.08 * i}s` }}>
                <span className="jx-shine" />
                {useCard ? (
                  <div className="relative min-h-[15rem]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset(g.card!)}
                      alt={`${g.title1} ${g.title2}`}
                      onError={() => setBroken((s) => new Set(s).add(g.id))}
                      className="block h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative flex h-full min-h-[15rem] flex-col p-4">
                    <p className="font-game text-xl font-black uppercase leading-[0.95] drop-shadow">{g.title1}<br />{g.title2}</p>
                    <p className="mt-1.5 font-game text-[11px] font-semibold leading-tight text-white/90">{g.desc}</p>
                    {/* Illustration (avec repli icône) */}
                    <div className="jx-illo relative mt-2 flex flex-1 items-end justify-center">
                      {g.illo && !broken.has(g.id) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset(g.illo)}
                          alt=""
                          onError={() => setBroken((s) => new Set(s).add(g.id))}
                          className="h-36 w-auto object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.3)]"
                        />
                      ) : (
                        <span
                          className="mb-4 grid h-28 w-28 place-items-center rounded-[2rem] text-white shadow-[0_14px_28px_-8px_rgba(0,0,0,.5),inset_0_2px_0_rgba(255,255,255,.4)] ring-1 ring-white/30"
                          style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,.45), rgba(255,255,255,.12) 60%, rgba(0,0,0,.12))" }}
                        >
                          <g.Icon className="h-14 w-14 drop-shadow" />
                        </span>
                      )}
                    </div>
                    <span className="pointer-events-none absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-white shadow-lg" style={{ color: g.arrow }}>
                      <IconArrow className="h-5 w-5" />
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* ---------- Défier un ami ---------- */}
        <Link href="/defi" className="jx-card mt-4 flex items-center gap-3 p-4" style={{ background: "linear-gradient(120deg,#1E1E1D,#0C0C0B)", animationDelay: ".4s" }}>
          <span className="jx-shine" />
          {DEFI_ILLO ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(DEFI_ILLO)} alt="" className="jx-illo h-16 w-16 shrink-0 object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.35)]" />
          ) : (
            <span
              className="jx-illo grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-amber-300 shadow-[0_10px_20px_-6px_rgba(0,0,0,.5),inset_0_2px_0_rgba(255,255,255,.4)] ring-1 ring-white/30"
              style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,.4), rgba(255,255,255,.1) 60%, rgba(0,0,0,.15))" }}
            >
              <IconTrophy className="h-8 w-8" />
            </span>
          )}
          <div className="relative min-w-0 flex-1">
            <p className="font-game text-lg font-black uppercase leading-tight drop-shadow">Défier un ami</p>
            <p className="font-game text-[11px] font-semibold text-white/85">
              {pending > 0 ? `${pending} défi${pending > 1 ? "s" : ""} à relever !` : "Duel sur 10 questions, qui sera le meilleur ?"}
            </p>
          </div>
          <span className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2.5 font-game text-sm font-black text-[#4a2c00] shadow-lg">
            DÉFIER <IconArrow className="h-4 w-4" />
          </span>
          {pending > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-6 min-w-[1.5rem] place-items-center rounded-full bg-rose-500 px-1.5 font-game text-xs font-extrabold text-white ring-2 ring-[#30302F]">{pending}</span>
          ) : null}
        </Link>

        {/* ---------- Accomplissements & titres ---------- */}
        {userId ? (
          <button
            type="button"
            onClick={() => setShowAchievements(true)}
            className="jx-card mt-4 flex w-full items-center gap-3 p-4 text-left"
            style={{ background: "linear-gradient(120deg,#1E1E1D,#0C0C0B)", animationDelay: ".5s" }}
          >
            <span className="jx-shine" />
            <span
              className="jx-illo grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-[#CAF000] shadow-[0_10px_20px_-6px_rgba(0,0,0,.5),inset_0_2px_0_rgba(255,255,255,.25)] ring-1 ring-[#CAF000]/40"
              style={{ background: "radial-gradient(circle at 32% 28%, rgba(202,240,0,.28), rgba(202,240,0,.08) 60%, rgba(0,0,0,.2))" }}
            >
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 18h16M5 16l-1-8 5 3 3-6 3 6 5-3-1 8z" />
              </svg>
            </span>
            <div className="relative min-w-0 flex-1">
              <p className="font-game text-lg font-black uppercase leading-tight drop-shadow">Accomplissements</p>
              <p className="font-game text-[11px] font-semibold text-white/85">
                Badges à paliers, titres de champion · vois ce qu&apos;il te reste à décrocher
              </p>
            </div>
            <span className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 font-game text-sm font-black text-[#1a2000] shadow-lg" style={{ background: "linear-gradient(180deg,#D8F53A,#AAD000)" }}>
              VOIR <IconArrow className="h-4 w-4" />
            </span>
          </button>
        ) : null}

        {/* ---------- Classements ---------- */}
        <div className="mt-6 rounded-3xl bg-white/[0.08] p-1 ring-1 ring-white/10">
          <ScoreBoard mode="weekly" accent="#FDE047" title="Ligue de la semaine" />
        </div>
        <div className="mt-4 rounded-3xl bg-white/[0.08] p-1 ring-1 ring-white/10">
          <ScoreBoard mode="total" accent="#8FE23C" title="Classement général" />
        </div>
        <p className="mt-4 text-center font-game text-[11px] text-white/50">
          {trophyCount}/{ACHIEVEMENTS.length} trophées · série {streak}
        </p>
      </div>

      {showAchievements && userId ? (
        <AchievementsOverlay userId={userId} onClose={() => setShowAchievements(false)} />
      ) : null}
    </div>
  );
}
