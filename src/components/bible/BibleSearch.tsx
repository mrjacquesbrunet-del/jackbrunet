"use client";

import { useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";

type BookIndex = { id: number; name: string; chapters: number };
type Book = { id: number; name: string; chapters: string[][] };
type Hit = { livre: number; nom: string; chap: number; verset: number; texte: string };

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Corpus chargé une seule fois puis gardé en mémoire (rapide ensuite).
let CORPUS: { id: number; name: string; chapters: string[][] }[] | null = null;

async function loadCorpus(): Promise<NonNullable<typeof CORPUS>> {
  if (CORPUS) return CORPUS;
  const index: BookIndex[] = await fetch(asset("/bible/index.json")).then((r) => r.json());
  const books = await Promise.all(
    index.map((b) =>
      fetch(asset(`/bible/${b.id}.json`))
        .then((r) => r.json() as Promise<Book>)
        .then((bk) => ({ id: b.id, name: b.name, chapters: bk.chapters }))
        .catch(() => ({ id: b.id, name: b.name, chapters: [] as string[][] })),
    ),
  );
  CORPUS = books;
  return books;
}

const MAX = 80;

export function BibleSearch() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [total, setTotal] = useState(0);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const query = norm(q.trim());
    if (query.length < 2) return;
    setBusy(true);
    setDone(false);
    try {
      const corpus = await loadCorpus();
      const out: Hit[] = [];
      let count = 0;
      outer: for (const b of corpus) {
        for (let c = 0; c < b.chapters.length; c++) {
          const verses = b.chapters[c];
          for (let v = 0; v < verses.length; v++) {
            if (norm(verses[v]).includes(query)) {
              count++;
              if (out.length < MAX)
                out.push({ livre: b.id, nom: b.name, chap: c + 1, verset: v + 1, texte: verses[v] });
              else if (count > MAX + 500) break outer; // garde-fou
            }
          }
        }
      }
      setHits(out);
      setTotal(count);
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  // Surligne le terme recherché dans un extrait.
  function highlight(text: string) {
    const query = q.trim();
    if (!query) return text;
    const i = norm(text).indexOf(norm(query));
    if (i < 0) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="rounded bg-dawn-400/40 px-0.5 text-inherit">{text.slice(i, i + query.length)}</mark>
        {text.slice(i + query.length)}
      </>
    );
  }

  return (
    <section className="py-10">
      <div className="container-x max-w-3xl">
        <form onSubmit={run} className="flex gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cherche un mot, un verset… (ex. « berger », « ne crains point »)"
            className="field w-full"
          />
          <button type="submit" disabled={busy} className="btn-primary shrink-0">
            {busy ? "…" : "Chercher"}
          </button>
        </form>

        {busy ? (
          <p className="mt-6 text-sm text-night-900/60">Recherche dans toute la Bible…</p>
        ) : done ? (
          <p className="mt-6 text-sm text-night-900/60">
            {total === 0
              ? "Aucun résultat. Essaie un autre mot."
              : `${total} résultat${total > 1 ? "s" : ""}${total > MAX ? ` (les ${MAX} premiers affichés)` : ""}.`}
          </p>
        ) : null}

        <ul className="mt-4 space-y-2">
          {hits.map((h) => (
            <li key={`${h.livre}:${h.chap}:${h.verset}`}>
              <Link
                href={`/bible?livre=${h.livre}&chap=${h.chap}`}
                className="block rounded-2xl border border-night-900/10 bg-white/70 p-4 transition-colors hover:border-spirit-600/30 hover:bg-white"
              >
                <span className="text-xs font-bold uppercase tracking-wide text-spirit-700">
                  {h.nom} {h.chap}:{h.verset}
                </span>
                <p className="mt-1 text-[15px] leading-relaxed text-night-900/85">{highlight(h.texte)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
