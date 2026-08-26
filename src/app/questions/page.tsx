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

/** Mots utiles d'une question tapée (on ignore les mots vides). */
const STOP = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "a", "à", "au", "aux", "en",
  "que", "qui", "quoi", "est", "il", "elle", "on", "je", "tu", "ce", "se", "sa", "son", "mon",
  "ma", "mes", "pour", "par", "pas", "ne", "si", "y", "dans", "sur", "avec", "comment", "pourquoi",
  "quand", "quel", "quelle", "vraiment", "ça", "cest", "n", "l", "d", "s", "t",
]);
function tokens(q: string): string[] {
  return norm(q)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}
function score(item: Item, toks: string[]): number {
  const q = norm(item.q);
  const a = norm(item.a);
  let s = 0;
  for (const t of toks) {
    if (q.includes(t)) s += 5;
    if (a.includes(t)) s += 1;
  }
  return s;
}

export default function QuestionsPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const toks = tokens(query);
  const isSearch = query.trim().length >= 2;

  const results = useMemo(() => {
    let list = ITEMS.filter((i) => !cat || i.category === cat);
    if (isSearch) {
      list = list
        .map((i) => ({ i, s: score(i, toks) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.i);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, cat]);

  const best = isSearch ? results[0] : null;
  const rest = isSearch ? results.slice(1) : results;

  return (
    <main className="pb-16">
      <style dangerouslySetInnerHTML={{ __html: FX }} />

      {/* ---------- Entête cinématique ---------- */}
      <section className="qa-hero relative overflow-hidden px-4 pb-8 pt-[calc(5.5rem+env(safe-area-inset-top))] text-center text-cream">
        <div className="qa-orb qa-orb-1" />
        <div className="qa-orb qa-orb-2" />
        <div className="qa-orb qa-orb-3" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-dawn-300">
            Questions & réponses
          </p>
          <h1 className="qa-title mt-3 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            Tu te poses une question&nbsp;?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">
            Pose ta question — on te propose la réponse la plus proche, claire, biblique, et
            <span className="text-dawn-200"> avec amour</span>. Aucune question n&apos;est jugée.
          </p>

          {/* Barre « pose ta question » */}
          <div className="qa-search mx-auto mt-6 flex max-w-xl items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-md">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-dawn-300" fill="none" stroke="currentColor" strokeWidth={1.9}>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(null);
              }}
              placeholder="Écris ta question… (ex. pourquoi la souffrance ?)"
              className="w-full bg-transparent text-cream placeholder:text-cream/50 focus:outline-none"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Effacer" className="shrink-0 text-cream/50">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container-x mt-6">
        <div className="mx-auto max-w-2xl">
          {/* Catégories */}
          <div className="flex flex-wrap gap-2">
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
                onClick={() => setCat(cat === c ? null : c)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  cat === c ? "bg-spirit-600 text-white" : "bg-night-900/[0.06] text-night-900/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Résultat vedette (meilleure réponse à la question tapée) */}
          {isSearch && best ? (
            <div className="qa-in mt-6 overflow-hidden rounded-3xl border-2 border-dawn-400/40 bg-white shadow-card">
              <div className="flex items-center gap-2 bg-dawn-400/15 px-5 py-2.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-dawn-600" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wide text-dawn-700">
                  La réponse la plus proche
                </span>
              </div>
              <div className="p-5">
                <p className="font-display text-xl font-bold text-night-900">{best.q}</p>
                <span className="text-xs font-semibold uppercase tracking-wide text-spirit-600">{best.category}</span>
                <div className="mt-3 text-[15px] leading-relaxed text-night-900/75">
                  <RichText text={best.a} />
                  <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-dawn-400/15 px-3 py-1 text-xs font-bold text-dawn-700">
                    {best.verse}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {isSearch && best ? (
            <p className="mt-6 text-sm font-semibold text-night-900/50">
              {rest.length > 0 ? "Autres réponses qui pourraient t'aider" : "C'est la réponse la plus proche."}
            </p>
          ) : null}

          {/* Liste */}
          <div className="mt-3 space-y-3">
            {isSearch && results.length === 0 ? (
              <div className="rounded-2xl bg-night-900/[0.03] px-4 py-8 text-center text-night-900/60">
                <p className="font-semibold text-night-900/80">Aucune réponse ne correspond exactement.</p>
                <p className="mt-1 text-sm">Essaie d&apos;autres mots, ou parcours les thèmes ci-dessus.</p>
              </div>
            ) : (
              rest.map((i, idx) => {
                const isOpen = open === i.id;
                return (
                  <div
                    key={i.id}
                    className="qa-in overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-sm"
                    style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i.id)}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg font-bold text-night-900">{i.q}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-spirit-600">{i.category}</span>
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
              Ta question n&apos;est pas là&nbsp;?
            </p>
            <p className="mt-1 text-sm text-night-900/65">
              Explore la Bible, ta méditation du jour, ou écris-nous.
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
      </div>
    </main>
  );
}

const FX = `
.qa-hero{background:linear-gradient(160deg,#1e1b4b 0%,#4c1d95 55%,#831843 100%);}
.qa-title{background:linear-gradient(90deg,#F3F3ED,#FCD34D,#F3F3ED);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:qa-grad 6s linear infinite;}
@keyframes qa-grad{to{background-position:200% center}}
.qa-orb{position:absolute;border-radius:9999px;filter:blur(38px);opacity:.5;pointer-events:none;}
.qa-orb-1{width:220px;height:220px;background:#7c3aed;top:-60px;right:-40px;animation:qa-float1 9s ease-in-out infinite;}
.qa-orb-2{width:180px;height:180px;background:#db2777;bottom:-50px;left:-30px;animation:qa-float2 11s ease-in-out infinite;}
.qa-orb-3{width:140px;height:140px;background:#f59e0b;top:30px;left:40%;opacity:.3;animation:qa-float1 13s ease-in-out infinite;}
@keyframes qa-float1{0%,100%{transform:translateY(0)}50%{transform:translateY(24px)}}
@keyframes qa-float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-26px)}}
.qa-search:focus-within{border-color:rgba(202,240,0,.5);box-shadow:0 0 0 3px rgba(202,240,0,.15)}
@keyframes qa-in{0%{transform:translateY(12px);opacity:0}100%{transform:translateY(0);opacity:1}}
.qa-in{animation:qa-in .45s ease-out both}
`;
