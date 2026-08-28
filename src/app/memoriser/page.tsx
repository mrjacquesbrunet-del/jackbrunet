"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  useMemorize,
  getMemorizeXp,
  levelFromXp,
  GAME_BEST_KEY,
  addMemorizeVerse,
  removeMemorizeVerse,
  advanceMemorize,
  maskedIndices,
  isReviewDue,
  markReviewed,
  regressMemorize,
  currentStreak,
  getDailyXp,
  DAILY_GOAL,
  BADGES,
  getSeenBadges,
  markBadgesSeen,
  MEMORIZE_MAX_LEVEL,
  type MemorizeItem,
} from "@/lib/memorize";
import { resolveRef, getBook } from "@/lib/bible-client";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
import { VerseGame } from "@/components/memorize/VerseGame";
import { asset } from "@/lib/asset";
import { WeeklyChampions } from "@/components/memorize/WeeklyChampions";
import { VERSE_PACKS } from "@/config/verse-packs";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitGameScore, submitWeeklyPoints } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";

const LEVEL_LABELS = ["Découverte", "Quelques trous", "La moitié", "Presque tout", "Par cœur"];

/**
 * Versets pré-chargés au tout premier lancement (thème « identité en Christ »),
 * pour que chacun puisse commencer à apprendre sans rien ajouter. On ne le fait
 * qu'une seule fois : ceux qui suppriment/ajoutent gardent la main.
 */
const SEED_KEY = "jb.memorize.seeded.v1";
const SEED_VERSES = [
  "2 Corinthiens 5:17",
  "Galates 2:20",
  "Romains 8:1",
  "Éphésiens 2:10",
  "1 Pierre 2:9",
  "Jean 1:12",
  "Romains 8:37",
  "Colossiens 2:10",
  "Éphésiens 1:7",
  "Philippiens 4:13",
];

/** Un mot du verset : visible, ou masqué (tap pour révéler). */
function Word({
  word,
  hidden,
  revealed,
  onReveal,
}: {
  word: string;
  hidden: boolean;
  revealed: boolean;
  onReveal: () => void;
}) {
  if (!hidden || revealed) {
    return <span className={hidden ? "text-amber-300" : undefined}>{word} </span>;
  }
  return (
    <button
      type="button"
      onClick={onReveal}
      aria-label="Révéler le mot"
      className="mx-0.5 inline-block h-[1.15em] translate-y-[0.2em] rounded-md bg-white/15 align-baseline transition-colors hover:bg-white/25"
      style={{ width: `${Math.max(2, word.length * 0.62)}ch` }}
    />
  );
}

/** Entraînement sur un verset : mots masqués selon l'étape. */
function Trainer({ item, onClose }: { item: MemorizeItem; onClose: () => void }) {
  const words = useMemo(() => item.text.split(/\s+/), [item.text]);
  const level = Math.min(MEMORIZE_MAX_LEVEL, item.level + 1); // on s'entraîne pour l'étape suivante
  const hidden = useMemo(() => maskedIndices(words, level), [words, level]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  function revealAll() {
    setRevealed(new Set(words.map((_, i) => i)));
  }

  function validate() {
    advanceMemorize(item.id);
    setDone(true);
  }

  const finished = item.level >= MEMORIZE_MAX_LEVEL;

  return (
    <div className="mt-4 rounded-2xl border border-amber-400/25 bg-[#1E1E1D]/60 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-300">
        {finished ? "Révision — par cœur" : `Entraînement — étape ${level}/${MEMORIZE_MAX_LEVEL} · ${LEVEL_LABELS[level]}`}
      </p>
      <p className="mt-3 text-[16px] leading-relaxed text-white/90">
        {words.map((w, i) => (
          <Word
            key={i}
            word={w}
            hidden={hidden.has(i)}
            revealed={revealed.has(i)}
            onReveal={() =>
              setRevealed((p) => {
                const n = new Set(p);
                n.add(i);
                return n;
              })
            }
          />
        ))}
      </p>
      <p className="mt-2 text-xs font-semibold text-white/45">{item.reference}</p>
      <p className="mt-1 text-xs text-white/40">
        Récite à voix haute, tape sur un trou si un mot t&apos;échappe.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {!done ? (
          <>
            <button
              type="button"
              onClick={validate}
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-night-950"
            >
              {finished ? "Révision faite" : "Je l'ai récité"}
            </button>
            <button
              type="button"
              onClick={revealAll}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/75"
            >
              Tout révéler
            </button>
          </>
        ) : (
          <p className="text-sm font-semibold text-amber-300">
            {item.level >= MEMORIZE_MAX_LEVEL
              ? "Bravo, ce verset est ancré dans ton cœur."
              : "Bien joué — étape validée."}
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/60"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

/**
 * Carte de révision : le verset appris réapparaît entièrement à trous,
 * référence affichée en dessous — on le récite, puis on valide.
 */
function ReviewDeck({ due }: { due: MemorizeItem[] }) {
  const [index, setIndex] = useState(0);
  const item = due[index];
  const words = useMemo(() => (item ? item.text.split(/\s+/) : []), [item]);
  const hidden = useMemo(() => maskedIndices(words, MEMORIZE_MAX_LEVEL), [words]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [shown, setShown] = useState(false);

  if (!item) {
    if (index === 0) return null;
    return (
      <div className="mt-6 rounded-3xl border border-amber-400/35 bg-amber-400/[0.07] p-5 text-center">
        <p className="font-display text-lg font-bold text-white">Révision terminée</p>
        <p className="mt-1 text-sm text-white/60">
          Bien joué — la Parole reste vivante dans ton cœur.
        </p>
      </div>
    );
  }

  function next() {
    setRevealed(new Set());
    setShown(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="mt-6 rounded-3xl border border-amber-400/35 bg-amber-400/[0.07] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-300">
          Révision — anciens versets
        </p>
        <span className="text-xs font-semibold text-white/45">
          {Math.min(index + 1, due.length)} / {due.length}
        </span>
      </div>
      <p className="mt-3 text-[16px] leading-relaxed text-white/90">
        {words.map((w, i) => (
          <Word
            key={`${item.id}-${i}`}
            word={w}
            hidden={hidden.has(i) && !shown}
            revealed={revealed.has(i)}
            onReveal={() =>
              setRevealed((p) => {
                const n = new Set(p);
                n.add(i);
                return n;
              })
            }
          />
        ))}
      </p>
      {/* La référence, en dessous, comme repère */}
      <p className="mt-2 text-sm font-bold text-amber-300">{item.reference}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            markReviewed(item.id);
            next();
          }}
          className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-night-950"
        >
          Je m&apos;en souviens
        </button>
        {!shown ? (
          <button
            type="button"
            onClick={() => setShown(true)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/75"
          >
            Tout révéler
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              regressMemorize(item.id);
              next();
            }}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/75"
          >
            À retravailler
          </button>
        )}
      </div>
    </div>
  );
}

export default function MemoriserPage() {
  const items = useMemorize();
  const [ref, setRef] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "notfound" | "duplicate">("idle");
  const [training, setTraining] = useState<string | null>(null);
  const [gaming, setGaming] = useState(false);

  // Niveau du joueur (XP gagnés au jeu) + record + série + XP du jour,
  // rechargés en sortant du jeu.
  const [xp, setXp] = useState(0);
  const [record, setRecord] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyXp, setDailyXp] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // Pré-chargement des versets « identité en Christ » au tout premier lancement.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    let already = false;
    try {
      already = !!localStorage.getItem(SEED_KEY);
    } catch {
      /* stockage indisponible */
    }
    if (already) return;
    // Déjà des versets (utilisateur existant) : on marque fait, sans rien ajouter.
    if (items.length > 0) {
      try {
        localStorage.setItem(SEED_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }
    (async () => {
      for (const r of SEED_VERSES) await addByReference(r);
      try {
        localStorage.setItem(SEED_KEY, "1");
      } catch {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
  const memoBaseRef = useRef(0);
  const playedRef = useRef(false);
  useEffect(() => {
    if (gaming) return;
    const mx = getMemorizeXp();
    setXp(mx);
    submitGameScore("memoriser", mx);
    // Retour d'une partie : envoie le gain d'XP (réduit) à la ligue de la semaine.
    if (playedRef.current) {
      playedRef.current = false;
      const gain = Math.max(0, mx - memoBaseRef.current);
      if (gain > 0) submitWeeklyPoints(Math.max(1, Math.round(gain / 10)));
    }
    setStreak(currentStreak());
    setDailyXp(getDailyXp());
    try {
      const b = Number(localStorage.getItem(GAME_BEST_KEY));
      if (Number.isFinite(b)) setRecord(b);
    } catch {
      /* stockage indisponible */
    }
  }, [gaming]);
  const lvl = levelFromXp(xp);
  const learned = items.filter((it) => it.level >= MEMORIZE_MAX_LEVEL).length;
  const inProgress = items.length - learned;

  // Trophées : calcule ceux atteints, repère les nouveaux (fraîchement débloqués).
  const badgeStats = { xp, streak, learned, best: record };
  const unlockedIds = BADGES.filter((b) => b.reached(badgeStats)).map((b) => b.id);
  useEffect(() => {
    if (gaming) return;
    const seen = getSeenBadges();
    const fresh = unlockedIds.filter((id) => !seen.includes(id));
    setNewBadges(fresh);
    if (fresh.length) markBadgesSeen(unlockedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gaming, xp, record, streak, learned]);

  // Jeu de révision figé à l'arrivée sur la page (les cartes ne bougent pas
  // pendant qu'on les valide).
  const [deckIds, setDeckIds] = useState<string[] | null>(null);
  useEffect(() => {
    if (deckIds === null) {
      setDeckIds(items.filter((it) => isReviewDue(it)).map((it) => it.id));
    }
  }, [items, deckIds]);
  const due = (deckIds ?? [])
    .map((id) => items.find((it) => it.id === id))
    .filter(Boolean) as MemorizeItem[];

  async function addByReference(query: string): Promise<"ok" | "notfound" | "duplicate"> {
    const r = await resolveRef(query);
    if (!r) return "notfound";
    const book = await getBook(r.bookId);
    const chap = book.chapters[r.chapter - 1] || [];
    const verses: string[] = [];
    for (let v = r.vStart; v <= Math.min(r.vEnd, chap.length); v++) verses.push(chap[v - 1]);
    if (verses.length === 0) return "notfound";
    const reference = `${r.bookName} ${r.chapter}:${r.vStart}${r.vEnd > r.vStart ? `-${r.vEnd}` : ""}`;
    return addMemorizeVerse(reference, verses.join(" ")) ? "ok" : "duplicate";
  }

  async function add() {
    const query = ref.trim();
    if (!query) return;
    setState("loading");
    const res = await addByReference(query);
    setState(res === "ok" ? "idle" : res);
    if (res === "ok") setRef("");
  }

  // Parcours proposés : ajout d'un verset ou de tout le niveau.
  const [openPack, setOpenPack] = useState<number | null>(null);
  const memorizedRefs = new Set(items.map((it) => it.reference.toLowerCase()));
  async function addPack(refs: string[]) {
    for (const q of refs) await addByReference(q);
  }

  // En partie : on n'affiche que le jeu (comme les autres jeux, plein écran).
  if (gaming) {
    return (
      <div className="dark-ctx min-h-screen mem-hub pb-24 pt-24 text-white sm:pt-28">
        <PlansDarkBg />
        <div className="container-x mx-auto max-w-2xl">
          <VerseGame items={items} onClose={() => setGaming(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="dark-ctx min-h-screen mem-hub pb-24 pt-24 text-white sm:pt-28">
      <PlansDarkBg />
      <div className="container-x mx-auto max-w-2xl">
        <Link href="/bible" className="text-xs font-semibold text-white/50 hover:text-white/80">
          ← Retour à la Bible
        </Link>
        {/* ---------- Hub premium (or / ambre) ---------- */}
        <section className="relative mt-3 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#30302F] via-[#1E1E1D] to-[#0C0C0B] p-4 shadow-2xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl" />

          {/* Profil joueur */}
          <div className="relative flex items-center gap-3">
            <Link href="/profil" aria-label="Mon profil" className="shrink-0">
              <span className="relative block rounded-full p-[3px]" style={{ background: "linear-gradient(180deg,#D8F53A,#AAD000)", boxShadow: "0 0 18px rgba(202,240,0,.5)" }}>
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#30302F] text-white/75">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0" /></svg>
                  </span>
                )}
              </span>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-game text-xl font-black leading-tight">{name || "Joueur"}</p>
                <span className="shrink-0 rounded-full bg-gradient-to-b from-[#D8F53A] to-[#AAD000] px-2 py-0.5 font-game text-[10px] font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25)]">NIV. {lvl.level}</span>
              </div>
              <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500" style={{ width: `${Math.round((lvl.into / lvl.span) * 100)}%` }} />
              </div>
              <p className="mt-0.5 font-game text-[10px] font-bold text-white/70">{lvl.into} / {lvl.span} <span className="text-amber-300">XP</span></p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0C0C0B] py-1.5 pl-3 pr-1.5 font-game text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12)] ring-1 ring-white/10">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#CAF000]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l3 5-9 13L3 8zM3 8h18M9 3l-1 5M15 3l1 5" /></svg>
              {record}
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-b from-[#D8F53A] to-[#AAD000] text-white">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M12 6v12M6 12h12" /></svg>
              </span>
            </span>
          </div>

          {/* Héros */}
          <div
            className="relative mt-4 overflow-hidden rounded-2xl border border-white/12 p-4"
            style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(251,146,60,.28), transparent 55%), linear-gradient(135deg,#30302F 0%,#30302F 62%,#1E1E1D 100%)" }}
          >
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute -right-3 -top-2 h-32 w-32 text-amber-300/10" fill="none" stroke="currentColor" strokeWidth={1.2}>
              <path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="inline-block rounded-lg bg-amber-400 px-3 py-0.5 font-game text-[10px] font-extrabold text-night-950">LE JEU DE LA PAROLE</span>
            <div className="relative max-w-[56%]">
              <h1 className="mt-2 font-game text-[1.7rem] font-black leading-[0.95] drop-shadow">
                MÉMORISER
                <br />
                <span className="text-amber-300">DES VERSETS</span>
              </h1>
              <p className="mt-2 font-game text-[13px] font-semibold leading-tight text-white/80">
                Grave la Parole dans ton cœur, manche après manche.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/img/jeux/memoriser.png")} alt="" className="mem-float pointer-events-none absolute -bottom-2 -right-2 h-36 w-auto object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,.35)]" />
          </div>

          {/* Objectif + Record */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-[#f472b6] to-[#c026a3] text-white shadow-[inset_0_2px_3px_rgba(255,255,255,.4)]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" /></svg>
              </span>
              <div className="min-w-0">
                <p className="font-game text-xs font-extrabold text-[#CAF000]">OBJECTIF</p>
                <p className="text-[11px] leading-tight text-white/70">Chaque verset par cœur, étape par étape.</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-amber-400/45 bg-white/[0.05] p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-[#f59e0b] to-[#d97706] text-white shadow-[inset_0_2px_3px_rgba(255,255,255,.4)]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v3a4 4 0 0 1-8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M9 20h6M12 12v4" /></svg>
              </span>
              <div className="min-w-0">
                <p className="font-game text-[10px] font-extrabold text-amber-300">RECORD</p>
                <p className="font-game text-2xl font-black leading-tight text-amber-300">{record}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/[0.06] py-3">
              <p className="flex items-center justify-center gap-1.5 font-game text-lg font-extrabold text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#CAF000]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2z" /></svg>
                {learned}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Appris</p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] py-3">
              <p className="flex items-center justify-center gap-1.5 font-game text-lg font-extrabold text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-400" fill="currentColor" aria-hidden><path d="M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z" /></svg>
                {inProgress}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">En cours</p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] py-3">
              <p className="flex items-center justify-center gap-1.5 font-game text-lg font-extrabold text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-violet-300" fill="currentColor" aria-hidden><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.2l5.9-.9z" /></svg>
                {streak}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Série</p>
            </div>
          </div>

          {/* JOUER */}
          <button
            type="button"
            onClick={() => {
              memoBaseRef.current = getMemorizeXp();
              playedRef.current = true;
              setGaming(true);
            }}
            disabled={items.length === 0}
            className="mem-glow mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 font-game text-xl font-black text-night-950 shadow-[inset_0_2px_0_rgba(255,255,255,.45),0_6px_0_#b45309] transition-all active:translate-y-[3px] active:shadow-[inset_0_2px_0_rgba(255,255,255,.45),0_3px_0_#b45309] disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden><path d="M8 5l11 7-11 7z" /></svg>
            {items.length > 0 ? "CONTINUER" : "JOUER"}
          </button>
          {items.length === 0 ? (
            <p className="mt-2 text-center font-game text-xs text-white/55">
              Ajoute d&apos;abord un verset pour lancer une partie.
            </p>
          ) : null}
          {/* Retour à l'accueil des jeux (changer de jeu) */}
          <Link
            href="/jeux"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#30302F] to-[#171716] py-3 font-game text-sm font-black text-[#CAF000] shadow-[inset_0_1px_0_rgba(255,255,255,.1)] active:translate-y-[1px]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>
            Accueil des jeux
          </Link>
        </section>

        {/* Classement de ce jeu */}
        <div className="mt-6">
          <ScoreBoard mode="memoriser" accent="#FBBF24" title="Classement · Mémoriser" />
        </div>

        {/* Ajout par référence */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <label htmlFor="memo-ref" className="text-[11px] font-bold uppercase tracking-wide text-white/45">
            Ajouter un verset
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="memo-ref"
              value={ref}
              onChange={(e) => {
                setRef(e.target.value);
                setState("idle");
              }}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Ex. Jean 3:16 ou Psaume 23:1-3"
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-[#1E1E1D] px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-amber-400/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={add}
              disabled={state === "loading"}
              className="shrink-0 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-night-950 disabled:opacity-50"
            >
              {state === "loading" ? "…" : "Ajouter"}
            </button>
          </div>
          {state === "notfound" ? (
            <p className="mt-2 text-xs text-rose-300">
              Référence non reconnue — vérifie le nom du livre et le verset.
            </p>
          ) : null}
          {state === "duplicate" ? (
            <p className="mt-2 text-xs text-white/55">Ce verset est déjà dans ta liste.</p>
          ) : null}
          <p className="mt-2 text-xs text-white/40">
            Astuce : depuis la Bible, tape sur un verset puis « Mémoriser ».
          </p>
        </div>

        {/* Série de jours + objectif quotidien */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Série (flamme) */}
          <div className="flex items-center gap-3 rounded-3xl border-2 border-[#FB923C]/40 bg-[#FB923C]/10 p-4">
            <svg viewBox="0 0 24 24" className="h-9 w-9 shrink-0 fill-[#FB923C]" aria-hidden>
              <path d="M12 2c1.5 3.5-1 5.5-2 7.5s-.5 5 2 5 3.5-2 3.5-4.5c2 1.2 3.5 3.2 3.5 5.5a7 7 0 1 1-13-3.5c1.2 2.2 2.5 2.2 2.5 0 0-3.5 1.5-6 3-10z" />
            </svg>
            <div>
              <p className="font-game text-2xl font-bold leading-none text-[#FB923C]">{streak}</p>
              <p className="mt-1 font-game text-[11px] font-bold uppercase tracking-wide text-white/55">
                {streak > 1 ? "jours de suite" : "jour de suite"}
              </p>
            </div>
          </div>
          {/* Objectif du jour */}
          <div className="flex items-center gap-3 rounded-3xl border-2 border-[#38BDF8]/40 bg-[#38BDF8]/10 p-4">
            <div className="relative h-9 w-9 shrink-0">
              <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
                <circle cx="18" cy="18" r="15" className="fill-none stroke-white/12" strokeWidth="4" />
                <circle
                  cx="18" cy="18" r="15"
                  className="fill-none stroke-[#38BDF8] transition-all duration-500"
                  strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 15}
                  strokeDashoffset={2 * Math.PI * 15 * (1 - Math.min(1, dailyXp / DAILY_GOAL))}
                />
              </svg>
              {dailyXp >= DAILY_GOAL ? (
                <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-4 w-4 fill-none stroke-[#38BDF8]" strokeWidth={3}>
                  <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </div>
            <div>
              <p className="font-game text-2xl font-bold leading-none text-[#38BDF8]">
                {Math.min(dailyXp, DAILY_GOAL)}<span className="text-sm text-white/50">/{DAILY_GOAL}</span>
              </p>
              <p className="mt-1 font-game text-[11px] font-bold uppercase tracking-wide text-white/55">
                objectif du jour
              </p>
            </div>
          </div>
        </div>

        {/* Trophées */}
        <section className="mt-8">
          <h2 className="font-game text-2xl font-bold">
            Tes <span className="text-[#FBBF24]">trophées</span>
            <span className="ml-2 align-middle font-game text-sm font-bold text-white/45">
              {unlockedIds.length}/{BADGES.length}
            </span>
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-4">
            {BADGES.map((b) => {
              const on = unlockedIds.includes(b.id);
              const fresh = newBadges.includes(b.id);
              return (
                <div key={b.id} className="flex flex-col items-center text-center" title={b.desc}>
                  <div
                    className={`relative grid h-16 w-16 place-items-center rounded-2xl ${fresh ? "animate-bounce" : ""}`}
                    style={
                      on
                        ? { background: `${b.color}22`, border: `2px solid ${b.color}` }
                        : { background: "rgba(255,255,255,0.03)", border: "2px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    {/* Médaille */}
                    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none" strokeWidth={1.8}
                      style={{ stroke: on ? b.color : "rgba(243,243,237,0.28)" }}>
                      <circle cx="12" cy="14" r="6" />
                      <path d="M9 8.5L7 3h10l-2 5.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 11.5l1 2 2 .2-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9.5 13.7l2-.2z" style={{ fill: on ? b.color : "transparent" }} />
                    </svg>
                    {fresh ? (
                      <span className="absolute -right-1 -top-1 rounded-full bg-[#FB7185] px-1.5 py-0.5 text-[8px] font-bold text-white">
                        NEW
                      </span>
                    ) : null}
                    {!on ? (
                      <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#1E1E1D]">
                        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-white/40" strokeWidth={2.2}>
                          <path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-1.5 font-game text-[10px] font-bold leading-tight ${on ? "text-white/80" : "text-white/35"}`}>
                    {b.title}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Champions de la semaine (classement social, Supabase) */}
        <WeeklyChampions />

        {/* Parcours de versets proposés, débloqués par niveau */}
        <section className="mt-8">
          <h2 className="font-game text-2xl font-bold">
            Parcours <span className="text-[#FB7185]">à débloquer</span>
          </h2>
          <p className="mt-1 font-game text-sm text-white/55">
            Des versets choisis pour la vie chrétienne — monte de niveau au jeu pour tout débloquer.
          </p>
          <div className="mt-4 space-y-3">
            {VERSE_PACKS.map((pack) => {
              const locked = lvl.level < pack.level;
              const open = openPack === pack.level;
              const addedCount = pack.refs.filter((r) => memorizedRefs.has(r.toLowerCase())).length;
              const colors = ["#CAF000", "#38BDF8", "#F472B6", "#FB923C", "#A78BFA"];
              const c = colors[(pack.level - 1) % colors.length];
              return (
                <div
                  key={pack.level}
                  className="overflow-hidden rounded-3xl border-2 p-4 transition-colors"
                  style={
                    locked
                      ? { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", opacity: 0.7 }
                      : { borderColor: `${c}55`, background: `linear-gradient(135deg, ${c}22, rgba(23,23,22,0.6))` }
                  }
                >
                  <button
                    type="button"
                    onClick={() => !locked && setOpenPack(open ? null : pack.level)}
                    className="flex w-full items-center gap-3.5 text-left"
                  >
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-game text-xl font-bold"
                      style={
                        locked
                          ? { background: "rgba(255,255,255,0.05)", color: "rgba(243,243,237,0.35)" }
                          : { background: c, color: "#0C0C0B", boxShadow: `0 4px 0 ${c}99` }
                      }
                    >
                      {pack.level}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-game text-base font-bold leading-tight">
                        {pack.title}
                      </span>
                      <span className="mt-0.5 block font-game text-xs text-white/55">
                        {locked
                          ? `Atteins le niveau ${pack.level} au jeu pour débloquer.`
                          : pack.subtitle}
                      </span>
                    </span>
                    {locked ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-white/35" strokeWidth={1.8}>
                        <path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="shrink-0 rounded-full px-2 py-0.5 font-game text-xs font-bold" style={{ background: `${c}22`, color: c }}>
                        {addedCount}/{pack.refs.length}
                      </span>
                    )}
                  </button>

                  {open && !locked ? (
                    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                      {pack.refs.map((r) => {
                        const added = memorizedRefs.has(r.toLowerCase());
                        return (
                          <div key={r} className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-white/85">{r}</span>
                            <button
                              type="button"
                              disabled={added}
                              onClick={() => addByReference(r)}
                              className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                                added
                                  ? "border border-amber-400/40 text-amber-300"
                                  : "bg-amber-400 text-night-950"
                              }`}
                            >
                              {added ? "Ajouté" : "Ajouter"}
                            </button>
                          </div>
                        );
                      })}
                      {addedCount < pack.refs.length ? (
                        <button
                          type="button"
                          onClick={() => addPack(pack.refs)}
                          className="mt-1 w-full rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white/80"
                        >
                          Tout ajouter à ma liste
                        </button>
                      ) : (
                        <p className="mt-1 text-center text-xs font-semibold text-amber-300">
                          Parcours complet dans ta liste — joue pour l&apos;ancrer !
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* Révision des versets déjà appris (cartes à trous) */}
        {!gaming && due.length > 0 ? <ReviewDeck due={due} /> : null}

        {/* Liste des versets */}
        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/8 bg-white/[0.03] p-8 text-center">
            <p className="font-display text-lg font-bold text-white/85">
              Commence par ton premier verset
            </p>
            <p className="mt-1 text-sm text-white/55">
              Par exemple Jean 3:16, Philippiens 4:13 ou Psaume 23:1.
            </p>
          </div>
        ) : (
          <ol className="mt-8 space-y-4">
            {items.map((it) => {
              const memorized = it.level >= MEMORIZE_MAX_LEVEL;
              return (
                <li
                  key={it.id}
                  className={`rounded-3xl border p-5 ${
                    memorized ? "border-amber-400/40 bg-amber-400/[0.06]" : "border-white/8 bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold leading-tight">{it.reference}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-white/60">{it.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMemorizeVerse(it.id)}
                      aria-label="Retirer ce verset"
                      title="Retirer"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-white/45 hover:text-white/80"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Progression par étapes */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {Array.from({ length: MEMORIZE_MAX_LEVEL }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-6 rounded-full ${
                            i < it.level ? "bg-amber-400" : "bg-white/15"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${memorized ? "text-amber-300" : "text-white/45"}`}>
                      {memorized ? "Mémorisé" : LEVEL_LABELS[it.level]}
                    </span>
                  </div>

                  {training === it.id ? (
                    <Trainer item={it} onClose={() => setTraining(null)} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTraining(it.id)}
                      className={`mt-4 rounded-full px-4 py-2 text-sm font-bold ${
                        memorized
                          ? "border border-amber-400/40 text-amber-300"
                          : "bg-amber-400 text-night-950"
                      }`}
                    >
                      {memorized ? "Réviser" : "S'entraîner"}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
