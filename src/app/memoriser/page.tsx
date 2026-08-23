"use client";

import { useEffect, useMemo, useState } from "react";
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
  MEMORIZE_MAX_LEVEL,
  type MemorizeItem,
} from "@/lib/memorize";
import { resolveRef, getBook } from "@/lib/bible-client";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
import { VerseGame } from "@/components/memorize/VerseGame";
import { VERSE_PACKS } from "@/config/verse-packs";

const LEVEL_LABELS = ["Découverte", "Quelques trous", "La moitié", "Presque tout", "Par cœur"];

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
    return <span className={hidden ? "text-dawn-300" : undefined}>{word} </span>;
  }
  return (
    <button
      type="button"
      onClick={onReveal}
      aria-label="Révéler le mot"
      className="mx-0.5 inline-block h-[1.15em] translate-y-[0.2em] rounded-md bg-cream/15 align-baseline transition-colors hover:bg-cream/25"
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
    <div className="mt-4 rounded-2xl border border-dawn-400/25 bg-night-950/60 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-dawn-300">
        {finished ? "Révision — par cœur" : `Entraînement — étape ${level}/${MEMORIZE_MAX_LEVEL} · ${LEVEL_LABELS[level]}`}
      </p>
      <p className="mt-3 text-[16px] leading-relaxed text-cream/90">
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
      <p className="mt-2 text-xs font-semibold text-cream/45">{item.reference}</p>
      <p className="mt-1 text-xs text-cream/40">
        Récite à voix haute, tape sur un trou si un mot t&apos;échappe.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {!done ? (
          <>
            <button
              type="button"
              onClick={validate}
              className="rounded-full bg-dawn-400 px-4 py-2 text-sm font-bold text-night-950"
            >
              {finished ? "Révision faite" : "Je l'ai récité"}
            </button>
            <button
              type="button"
              onClick={revealAll}
              className="rounded-full border border-cream/20 px-4 py-2 text-sm font-semibold text-cream/75"
            >
              Tout révéler
            </button>
          </>
        ) : (
          <p className="text-sm font-semibold text-dawn-300">
            {item.level >= MEMORIZE_MAX_LEVEL
              ? "Bravo, ce verset est ancré dans ton cœur."
              : "Bien joué — étape validée."}
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-full border border-cream/15 px-4 py-2 text-sm font-semibold text-cream/60"
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
      <div className="mt-6 rounded-3xl border border-dawn-400/35 bg-dawn-400/[0.07] p-5 text-center">
        <p className="font-display text-lg font-bold text-cream">Révision terminée</p>
        <p className="mt-1 text-sm text-cream/60">
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
    <div className="mt-6 rounded-3xl border border-dawn-400/35 bg-dawn-400/[0.07] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide text-dawn-300">
          Révision — anciens versets
        </p>
        <span className="text-xs font-semibold text-cream/45">
          {Math.min(index + 1, due.length)} / {due.length}
        </span>
      </div>
      <p className="mt-3 text-[16px] leading-relaxed text-cream/90">
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
      <p className="mt-2 text-sm font-bold text-dawn-300">{item.reference}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            markReviewed(item.id);
            next();
          }}
          className="rounded-full bg-dawn-400 px-4 py-2 text-sm font-bold text-night-950"
        >
          Je m&apos;en souviens
        </button>
        {!shown ? (
          <button
            type="button"
            onClick={() => setShown(true)}
            className="rounded-full border border-cream/20 px-4 py-2 text-sm font-semibold text-cream/75"
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
            className="rounded-full border border-cream/20 px-4 py-2 text-sm font-semibold text-cream/75"
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

  // Niveau du joueur (XP gagnés au jeu) + record, rechargés en sortant du jeu.
  const [xp, setXp] = useState(0);
  const [record, setRecord] = useState(0);
  useEffect(() => {
    if (gaming) return;
    setXp(getMemorizeXp());
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

  return (
    <div className="dark-ctx min-h-screen bg-night-950 pb-24 pt-24 text-cream sm:pt-28">
      <PlansDarkBg />
      <div className="container-x mx-auto max-w-2xl">
        <Link href="/bible" className="text-xs font-semibold text-cream/50 hover:text-cream/80">
          ← Retour à la Bible
        </Link>
        <span className="mt-3 block font-game text-xs font-bold uppercase tracking-[0.22em] text-[#FFB020]">
          Le jeu de la Parole
        </span>
        <h1 className="mt-2 font-game text-4xl font-bold leading-tight">
          Apprends en{" "}
          <span className="bg-gradient-to-r from-[#CAF000] via-[#38BDF8] to-[#FF5CA8] bg-clip-text text-transparent">
            jouant
          </span>
        </h1>
        <p className="mt-2 font-game text-sm text-cream/65">
          Mémorise tes versets par cœur, manche après manche. « Je serre ta parole dans mon cœur »
          (Psaume 119:11).
        </p>

        {/* Ajout par référence */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <label htmlFor="memo-ref" className="text-[11px] font-bold uppercase tracking-wide text-cream/45">
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
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-night-900 px-4 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:border-dawn-400/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={add}
              disabled={state === "loading"}
              className="shrink-0 rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-bold text-night-950 disabled:opacity-50"
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
            <p className="mt-2 text-xs text-cream/55">Ce verset est déjà dans ta liste.</p>
          ) : null}
          <p className="mt-2 text-xs text-cream/40">
            Astuce : depuis la Bible, tape sur un verset puis « Mémoriser ».
          </p>
        </div>

        {/* Le hub du jeu : carte colorée façon jeu mobile */}
        {gaming ? <VerseGame items={items} onClose={() => setGaming(false)} /> : null}
        <div
          className="relative mt-6 overflow-hidden rounded-[2rem] p-5 shadow-[0_18px_40px_-18px_rgba(124,92,255,0.7)]"
          style={{ background: "linear-gradient(140deg, #6D28D9 0%, #C026D3 48%, #FB7185 100%)" }}
        >
          {/* Bulles décoratives */}
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-[#38BDF8]/30 blur-2xl" />

          <div className="relative flex items-center gap-4">
            {/* Badge de niveau lumineux */}
            <div className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-3xl bg-white/95 shadow-[0_6px_0_rgba(0,0,0,0.18)]">
              <span className="text-center leading-none">
                <span className="block font-game text-[9px] font-bold uppercase tracking-wide text-[#7C3AED]/70">
                  Niveau
                </span>
                <span
                  className="block font-game text-3xl font-bold"
                  style={{ background: "linear-gradient(135deg,#6D28D9,#C026D3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  {lvl.level}
                </span>
              </span>
            </div>
            {/* Jauge d'XP */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between font-game text-xs font-bold text-white/85">
                <span>{xp} XP</span>
                <span className="tabular-nums">{lvl.into} / {lvl.span}</span>
              </div>
              <div className="mt-1.5 h-4 overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(4, (lvl.into / lvl.span) * 100))}%`,
                    background: "linear-gradient(90deg,#FDE047,#FB923C,#F472B6)",
                  }}
                />
              </div>
              <p className="mt-1 font-game text-xs text-white/70">
                Encore {lvl.span - lvl.into} XP avant le niveau {lvl.level + 1}
              </p>
            </div>
          </div>

          {/* Statistiques colorées */}
          <div className="relative mt-4 grid grid-cols-3 gap-2.5 text-center">
            {[
              { v: learned, label: "Appris", c: "#CAF000" },
              { v: inProgress, label: "En cours", c: "#38BDF8" },
              { v: record, label: "Record", c: "#FDE047" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/15 px-2 py-3 backdrop-blur-sm">
                <p className="font-game text-2xl font-bold" style={{ color: s.c }}>{s.v}</p>
                <p className="mt-0.5 font-game text-[11px] font-bold uppercase tracking-wide text-white/70">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* JOUER — gros bouton blanc qui rebondit */}
          <button
            type="button"
            onClick={() => setGaming(true)}
            disabled={items.length === 0}
            className="relative mt-4 w-full select-none rounded-2xl bg-white px-5 py-4 text-center font-game text-lg font-bold uppercase tracking-wide text-[#7C3AED] shadow-[0_6px_0_rgba(0,0,0,0.2)] transition-all duration-100 hover:brightness-105 active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:shadow-none"
          >
            <span className="inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden><path d="M6 5v14l12-7z" /></svg>
              {items.length > 0 ? "Continuer" : "Jouer"}
            </span>
          </button>
          {items.length === 0 ? (
            <p className="relative mt-2 text-center font-game text-xs text-white/75">
              Ajoute d&apos;abord un verset pour lancer une partie.
            </p>
          ) : null}
        </div>

        {/* Parcours de versets proposés, débloqués par niveau */}
        <section className="mt-8">
          <h2 className="font-game text-2xl font-bold">
            Parcours <span className="text-[#FB7185]">à débloquer</span>
          </h2>
          <p className="mt-1 font-game text-sm text-cream/55">
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
                      <span className="mt-0.5 block font-game text-xs text-cream/55">
                        {locked
                          ? `Atteins le niveau ${pack.level} au jeu pour débloquer.`
                          : pack.subtitle}
                      </span>
                    </span>
                    {locked ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-cream/35" strokeWidth={1.8}>
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
                            <span className="text-sm font-semibold text-cream/85">{r}</span>
                            <button
                              type="button"
                              disabled={added}
                              onClick={() => addByReference(r)}
                              className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                                added
                                  ? "border border-dawn-400/40 text-dawn-300"
                                  : "bg-dawn-400 text-night-950"
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
                          className="mt-1 w-full rounded-full border border-cream/20 px-4 py-2 text-sm font-bold text-cream/80"
                        >
                          Tout ajouter à ma liste
                        </button>
                      ) : (
                        <p className="mt-1 text-center text-xs font-semibold text-dawn-300">
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
            <p className="font-display text-lg font-bold text-cream/85">
              Commence par ton premier verset
            </p>
            <p className="mt-1 text-sm text-cream/55">
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
                    memorized ? "border-dawn-400/40 bg-dawn-400/[0.06]" : "border-white/8 bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold leading-tight">{it.reference}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-cream/60">{it.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMemorizeVerse(it.id)}
                      aria-label="Retirer ce verset"
                      title="Retirer"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-cream/45 hover:text-cream/80"
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
                            i < it.level ? "bg-dawn-400" : "bg-cream/15"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${memorized ? "text-dawn-300" : "text-cream/45"}`}>
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
                          ? "border border-dawn-400/40 text-dawn-300"
                          : "bg-dawn-400 text-night-950"
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
