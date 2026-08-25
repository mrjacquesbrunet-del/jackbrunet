"use client";

import { useEffect, useRef, useState } from "react";
import { listMedia, uploadMedia, deleteMedia, type MediaItem, type UploadResult } from "@/lib/media";

/**
 * CMS — section « Médias » : import de PLUSIEURS images en une fois
 * (sélection multiple ou glisser-déposer), puis galerie avec copie du lien
 * et suppression. Sert notamment aux cartes punchline.
 */
export function MediasAdmin() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [report, setReport] = useState<UploadResult[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setLoading(true);
    setItems(await listMedia());
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    setBusy(true);
    setReport(null);
    setProgress({ done: 0, total: files.length });
    const res = await uploadMedia(files, (done, total) => setProgress({ done, total }));
    setReport(res);
    setProgress(null);
    setBusy(false);
    await refresh();
    if (inputRef.current) inputRef.current.value = "";
  }

  async function copy(url: string, name: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(name);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  }

  async function remove(name: string) {
    if (!confirm(`Supprimer « ${name} » ?`)) return;
    if (await deleteMedia(name)) setItems((l) => l.filter((x) => x.name !== name));
  }

  const okCount = report?.filter((r) => r.ok).length ?? 0;
  const failCount = report?.filter((r) => !r.ok).length ?? 0;

  return (
    <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-spirit-600" strokeWidth={1.8} aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="M4 17l5-5 4 4 3-3 4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Médias
      </h2>
      <p className="mt-1 text-sm text-night-900/60">
        Importe plusieurs images d&apos;un coup (sélection multiple ou glisser-déposer). Idéal pour
        tes cartes punchline.
      </p>

      {/* Zone d'import */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-4 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-spirit-600 bg-spirit-500/10" : "border-night-900/20 bg-night-900/[0.02] hover:border-spirit-600/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8 fill-none stroke-spirit-600" strokeWidth={1.6} aria-hidden>
          <path d="M12 16V4m0 0l-4 4m4-4l4 4M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-2 text-sm font-semibold text-night-900/80">
          {busy ? "Import en cours…" : "Choisir des images (plusieurs à la fois)"}
        </p>
        <p className="mt-0.5 text-xs text-night-900/45">
          ou glisse-dépose tes fichiers ici · JPG, PNG, WebP
        </p>
      </div>

      {/* Progression */}
      {progress ? (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-night-900/10">
            <div
              className="h-full rounded-full bg-spirit-600 transition-all"
              style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-night-900/55">
            {progress.done} / {progress.total} importées…
          </p>
        </div>
      ) : null}

      {/* Rapport */}
      {report ? (
        <p className={`mt-3 text-sm font-semibold ${failCount ? "text-amber-600" : "text-spirit-700"}`}>
          {okCount} image{okCount > 1 ? "s" : ""} importée{okCount > 1 ? "s" : ""}
          {failCount ? ` · ${failCount} en échec (réessaie)` : " ✓"}
        </p>
      ) : null}

      {/* Galerie */}
      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-night-900/45">
          {loading ? "Chargement…" : `${items.length} média${items.length > 1 ? "s" : ""}`}
        </p>
        {!loading && items.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((m) => (
              <div key={m.name} className="overflow-hidden rounded-2xl border border-night-900/10 bg-night-900/[0.02]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.name} className="aspect-square w-full object-cover" />
                <div className="p-2">
                  <p className="truncate text-[11px] font-semibold text-night-900/70" title={m.name}>
                    {m.name}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copy(m.url, m.name)}
                      className="flex-1 rounded-full bg-night-900 px-2 py-1 text-[11px] font-bold text-cream"
                    >
                      {copied === m.name ? "Copié !" : "Copier le lien"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(m.name)}
                      aria-label="Supprimer"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-night-900/15 text-night-900/50 hover:text-rose-500"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
                        <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
