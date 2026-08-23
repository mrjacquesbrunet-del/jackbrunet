"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useMemorize,
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

  async function add() {
    const query = ref.trim();
    if (!query) return;
    setState("loading");
    const r = await resolveRef(query);
    if (!r) {
      setState("notfound");
      return;
    }
    const book = await getBook(r.bookId);
    const chap = book.chapters[r.chapter - 1] || [];
    const verses: string[] = [];
    for (let v = r.vStart; v <= Math.min(r.vEnd, chap.length); v++) verses.push(chap[v - 1]);
    if (verses.length === 0) {
      setState("notfound");
      return;
    }
    const reference = `${r.bookName} ${r.chapter}:${r.vStart}${r.vEnd > r.vStart ? `-${r.vEnd}` : ""}`;
    const ok = addMemorizeVerse(reference, verses.join(" "));
    setState(ok ? "idle" : "duplicate");
    if (ok) setRef("");
  }

  return (
    <div className="dark-ctx min-h-screen bg-night-950 pb-24 pt-24 text-cream sm:pt-28">
      <PlansDarkBg />
      <div className="container-x mx-auto max-w-2xl">
        <Link href="/bible" className="text-xs font-semibold text-cream/50 hover:text-cream/80">
          ← Retour à la Bible
        </Link>
        <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.22em] text-dawn-400">
          Mémoriser la Parole
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold">
          Apprends tes versets <span className="text-dawn-400">par cœur</span>
        </h1>
        <p className="mt-2 text-sm text-cream/65">
          Ajoute un verset, puis entraîne-toi : à chaque étape, des mots disparaissent —
          jusqu&apos;à le connaître entièrement. « Je serre ta parole dans mon cœur » (Psaume 119:11).
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

        {/* Le jeu : remets les mots du verset dans l'ordre */}
        {items.length > 0 ? (
          gaming ? (
            <VerseGame items={items} onClose={() => setGaming(false)} />
          ) : (
            <div className="mt-6 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="min-w-0">
                <p className="font-display text-lg font-bold leading-tight">Le jeu du verset</p>
                <p className="mt-1 text-sm text-cream/60">
                  4 manches par verset : puzzle, trous, référence, par cœur — points, combo, 3 vies.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGaming(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-bold text-night-950"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                  <path d="M6 5v14l12-7z" strokeLinejoin="round" />
                </svg>
                Jouer
              </button>
            </div>
          )
        ) : null}

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
