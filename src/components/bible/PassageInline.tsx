"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { Markable } from "@/components/ui/Markable";
import { CommentaryPanel, type Commentary } from "@/components/bible/CommentaryPanel";
import { resolveRef, getBook } from "@/lib/bible-client";

/**
 * Affiche le texte d'un passage (ex. « Philippiens 4:6-7 ») directement, avec
 * les mêmes actions que la Bible (surligner / copier / enregistrer / noter) et
 * le commentaire d'étude — sans quitter la page.
 */
export function PassageInline({ reference }: { reference: string }) {
  const [verses, setVerses] = useState<{ n: number; text: string }[] | null>(null);
  const [meta, setMeta] = useState<{ bookId: number; bookName: string; chapter: number } | null>(
    null,
  );
  const [comm, setComm] = useState<Record<number, Commentary>>({});
  const [commState, setCommState] = useState<"idle" | "loading" | "loaded" | "none">("idle");
  const [openV, setOpenV] = useState<Set<number>>(new Set());

  useEffect(() => {
    let active = true;
    (async () => {
      const r = await resolveRef(reference);
      if (!r) {
        if (active) setVerses([]);
        return;
      }
      const book = await getBook(r.bookId);
      if (!active) return;
      const chap = book.chapters[r.chapter - 1] || [];
      const list: { n: number; text: string }[] = [];
      for (let v = r.vStart; v <= Math.min(r.vEnd, chap.length); v++) {
        list.push({ n: v, text: chap[v - 1] });
      }
      setMeta({ bookId: r.bookId, bookName: r.bookName, chapter: r.chapter });
      setVerses(list);
    })();
    return () => {
      active = false;
    };
  }, [reference]);

  function loadComm(bookId: number, chapter: number) {
    if (commState!== "idle") return;
    setCommState("loading");
    fetch(asset(`/commentary/${bookId}/${chapter}.json`))
.then((r) => (r.ok? r.json(): Promise.reject()))
.then((d: Record<number, Commentary>) => {
        setComm(d);
        setCommState("loaded");
      })
.catch(() => setCommState("none"));
  }

  function toggle(v: number) {
    if (meta) loadComm(meta.bookId, meta.chapter);
    setOpenV((p) => {
      const n = new Set(p);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  }

  if (verses === null) {
    return <p className="text-sm text-night-900/40">Chargement du passage…</p>;
  }
  if (verses.length === 0 ||!meta) {
    // Référence non résolue: on affiche au moins la référence.
    return <p className="text-sm font-semibold text-spirit-700">{reference}</p>;
  }

  return (
    <div className="rounded-2xl border border-night-900/10 bg-white p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-spirit-600">
        {reference}
      </p>
      <div className="space-y-1.5 text-[15px] leading-relaxed text-night-900/85">
        {verses.map(({ n, text }) => {
          const open = openV.has(n);
          return (
            <div key={n}>
              <Markable
                id={`bible:${meta.bookId}:${meta.chapter}:${n}`}
                text={text}
                reference={`${meta.bookName} ${meta.chapter}:${n}`}
                kind="verset"
              >
                <p>
                  <sup className="mr-1 align-super text-xs font-bold text-spirit-600">{n}</sup>
                  {text}
                </p>
              </Markable>
              <button
                type="button"
                onClick={() => toggle(n)}
                aria-expanded={open}
                className="mt-1 text-xs font-semibold text-spirit-600 hover:underline"
              >
                {open? "Masquer le commentaire": "Commentaire & sens des mots"}
              </button>
              {open? <CommentaryPanel state={commState} data={comm[n]} />: null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
