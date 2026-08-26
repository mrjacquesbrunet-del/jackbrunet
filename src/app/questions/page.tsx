"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import faq from "../../../content/questions-faq.json";

type Item = { id: number; category: string; q: string; a: string; verse: string };
const ITEMS = (faq as { items: Item[] }).items;
const CATEGORIES = Array.from(new Set(ITEMS.map((i) => i.category)));

/** Rend un paragraphe avec **gras** simple. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((para, pi) => (
        <p key={pi} className={pi === 0 ? "" : "mt-3"}>
          {para.split(/(\*\*[^*]+\*\*)/g).map((chunk, ci) =>
            chunk.startsWith("**") && chunk.endsWith("**") ? (
              <strong key={ci} className="font-bold text-night-900">
                {chunk.slice(2, -2)}
              </strong>
            ) : (
              <span key={ci}>{chunk}</span>
            ),
          )}
        </p>
      ))}
    </>
  );
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default function QuestionsPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const results = useMemo(() => {
    const nq = norm(query.trim());
    return ITEMS.filter((i) => {
      if (cat && i.category !== cat) return false;
      if (!nq) return true;
      return norm(i.q).includes(nq) || norm(i.a).includes(nq);
    });
  }, [query, cat]);

  return (
    <main className="container-x py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-spirit-600">
            Questions & réponses
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
            Tu te poses une question ?
          </h1>
          <p className="mt-3 text-night-900/65">
            Des réponses claires et bibliques aux questions que chacun se pose — sur Dieu, Jésus,
            la foi, la souffrance, la vie chrétienne.
          </p>
          <p className="mt-2 text-sm text-night-900/55">
            Ici, aucune question n&apos;est bête, et aucune n&apos;est jugée. On te répond avec la
            Parole de Dieu et avec amour.
          </p>
        </header>

        {/* Recherche */}
        <div className="mt-6">
          <div className="flex items-center gap-2 rounded-2xl border border-night-900/10 bg-white px-4 py-3 shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-night-900/40" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cherche une question (ex. souffrance, pardon, prière…)"
              className="w-full bg-transparent text-night-900 placeholder:text-night-900/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Catégories */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCat(null)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              cat === null ? "bg-spirit-600 text-white" : "bg-night-900/[0.06] text-night-900/70"
            }`}
          >
            Tout
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                cat === c ? "bg-spirit-600 text-white" : "bg-night-900/[0.06] text-night-900/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="mt-6 space-y-3">
          {results.length === 0 ? (
            <p className="rounded-2xl bg-night-900/[0.03] px-4 py-8 text-center text-night-900/55">
              Aucune question trouvée. Essaie un autre mot.
            </p>
          ) : (
            results.map((i) => {
              const isOpen = open === i.id;
              return (
                <div
                  key={i.id}
                  className="overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i.id)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-bold text-night-900">{i.q}</span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-spirit-600">
                        {i.category}
                      </span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 shrink-0 text-night-900/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-night-900/10 px-5 py-4 text-[15px] leading-relaxed text-night-900/75">
                      <RichText text={i.a} />
                      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-dawn-400/15 px-3 py-1 text-xs font-bold text-dawn-700">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 3v16" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {i.verse}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Aller plus loin */}
        <div className="mt-8 rounded-2xl border border-spirit-500/20 bg-spirit-500/[0.06] p-5 text-center">
          <p className="font-display text-lg font-bold text-night-900">
            Une autre question, ou envie d&apos;aller plus loin ?
          </p>
          <p className="mt-1 text-sm text-night-900/65">
            Écris-nous, ou explore la Bible et les méditations du jour.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/bible" className="btn-primary text-sm">
              Ouvrir la Bible
            </Link>
            <Link href="/devotionnel" className="btn-ghost text-sm">
              Ma méditation du jour
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
