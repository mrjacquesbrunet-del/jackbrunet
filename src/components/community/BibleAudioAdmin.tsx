"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { uploadBibleChapter, countBibleChapters } from "@/lib/bible-audio";
import { uploadAmbientBed } from "@/lib/ambient";
import { HeadphonesGlyph, MusicGlyph } from "@/components/ui/DevoIcons";

type BookIndex = { id: number; name: string; chapters: number };

/**
 * Importateur de la Bible audio (admin). Pour chaque livre, on sélectionne les
 * MP3 des chapitres DANS L'ORDRE (chapitre 1, 2, 3…): le fichier n°1 devient
 * le chapitre 1, etc. Les fichiers sont envoyés dans Supabase à l'emplacement
 * lu par le lecteur (bible/{bookId}/{chapitre}.mp3). Source recommandée:
 * Louis Segond 1910 (domaine public), zip par livre sur bibvoice.org / archive.org.
 */
export function BibleAudioAdmin() {
  const [books, setBooks] = useState<BookIndex[]>([]);
  const [bookId, setBookId] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // État réel dans Supabase: nombre de chapitres présents par livre.
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [checking, setChecking] = useState(false);

  // Instrumental de fond (fond musical doux sous la voix).
  const [ambBusy, setAmbBusy] = useState(false);
  const [ambMsg, setAmbMsg] = useState("");
  const ambRef = useRef<HTMLInputElement>(null);

  async function handleAmbient(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setAmbBusy(true);
    setAmbMsg("");
    const ok = await uploadAmbientBed(f);
    setAmbBusy(false);
    if (ambRef.current) ambRef.current.value = "";
    setAmbMsg(ok? "✓ Fond musical en ligne.": "Échec de l'envoi, réessaie.");
  }

  useEffect(() => {
    fetch(asset("/bible/index.json"))
.then((r) => r.json())
.then((data: BookIndex[]) => setBooks(data))
.catch(() => setBooks([]));
  }, []);

  // Lit l'état réel dans Supabase: combien de chapitres par livre.
  const checkStatus = useCallback(async (list: BookIndex[]) => {
    if (list.length === 0) return;
    setChecking(true);
    const entries = await Promise.all(
      list.map(async (b) => [b.id, await countBibleChapters(b.id)] as const),
    );
    setCounts(Object.fromEntries(entries));
    setChecking(false);
  }, []);

  useEffect(() => {
    if (books.length) checkStatus(books);
  }, [books, checkStatus]);

  const isDone = (b: BookIndex) => (counts[b.id]?? 0) >= b.chapters;
  const doneCount = books.filter(isDone).length;
  const book = books.find((b) => b.id === bookId);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    // Tri par nom pour respecter l'ordre des chapitres (01, 02, …).
    const list = Array.from(files).sort((a, b) =>
      a.name.localeCompare(b.name, "fr", { numeric: true }),
    );
    setBusy(true);
    setMsg("");
    setProgress({ done: 0, total: list.length });
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      const success = await uploadBibleChapter(bookId, i + 1, list[i]);
      if (success) ok++;
      setProgress({ done: i + 1, total: list.length });
    }
    setBusy(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    setMsg(
      ok === list.length
? `✓ ${ok} chapitre${ok > 1? "s": ""} envoyé${ok > 1? "s": ""} pour ${book?.name}.`
: `${ok}/${list.length} envoyés, vérifie ta connexion et réessaie les manquants.`,
    );
    checkStatus(books); // met à jour l'état des livres en ligne
  }

  return (
    <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <HeadphonesGlyph className="h-5 w-5 text-spirit-600" />
        Bible audio (narration)
      </h2>
      <p className="mt-1 text-sm text-night-900/60">
        Envoie les MP3 d'un livre <span className="font-semibold">dans l'ordre des chapitres</span>{" "}
        (le 1<sup>er</sup> fichier = chapitre 1). Une fois en ligne, la lecture se fait en
        arrière-plan avec minuteur. Source libre: Louis Segond 1910 (domaine public).
      </p>

      {/* État réel dans Supabase: livres terminés / en cours / manquants */}
      <div className="mt-4 rounded-2xl border border-night-900/10 bg-night-900/[0.02] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-night-900/80">
            {checking? "Lecture de Supabase…": `${doneCount} / ${books.length} livres terminés`}
          </p>
          <button
            type="button"
            onClick={() => checkStatus(books)}
            disabled={checking}
            className="text-xs font-semibold text-spirit-600 hover:underline disabled:opacity-50"
          >
            Rafraîchir
          </button>
        </div>
        <p className="mt-1 text-[11px] text-night-900/45">
          ✓ terminé · orange = en cours (manque des chapitres) · gris = rien
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {books.map((b) => {
            const n = counts[b.id]?? 0;
            const done = n >= b.chapters;
            const partial = n > 0 &&!done;
            return (
              <span
                key={b.id}
                title={
                  done
? `${b.name}, terminé (${b.chapters} ch.)`
: partial
? `${b.name}, ${n}/${b.chapters} chapitres`
: `${b.name}, aucun chapitre`
                }
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  done
? "bg-dawn-400/25 text-spirit-700 ring-1 ring-dawn-400/50"
: partial
? "bg-amber-400/20 text-amber-700 ring-1 ring-amber-400/40"
: "bg-night-900/[0.04] text-night-900/40"
                }`}
              >
                {done? "✓ ": ""}
                {b.name}
                {partial? ` ${n}/${b.chapters}`: ""}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={bookId}
          onChange={(e) => setBookId(Number(e.target.value))}
          className="field max-w-[15rem]"
          aria-label="Livre"
          disabled={busy}
        >
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.chapters} ch.)
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn-primary disabled:opacity-50"
        >
          {busy? "Envoi…": "Choisir les MP3 du livre"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {progress? (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-night-900/10">
            <div
              className="h-full rounded-full bg-dawn-400 transition-all"
              style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-night-900/55">
            {progress.done} / {progress.total} chapitres
          </p>
        </div>
      ): null}

      {msg? <p className="mt-3 text-sm font-semibold text-spirit-700">{msg}</p>: null}

      {/* Fond musical doux */}
      <div className="mt-6 border-t border-night-900/10 pt-5">
        <p className="flex items-center gap-2 font-display text-base font-bold">
          <MusicGlyph className="h-5 w-5 text-spirit-600" />
          Fond musical doux (sous la voix)
        </p>
        <p className="mt-1 text-sm text-night-900/60">
          Un instrumental paisible qui tourne <span className="font-semibold">en boucle</span> à
          faible volume sous la Bible audio. Les auditeurs l'activent d'un bouton.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => ambRef.current?.click()}
            disabled={ambBusy}
            className="btn-ghost disabled:opacity-50"
          >
            {ambBusy? "Envoi…": "Choisir l'instrumental"}
          </button>
          <input
            ref={ambRef}
            type="file"
            accept="audio/*,.mp3"
            hidden
            onChange={(e) => handleAmbient(e.target.files)}
          />
        </div>
        {ambMsg? <p className="mt-2 text-sm font-semibold text-spirit-700">{ambMsg}</p>: null}
      </div>
    </div>
  );
}
