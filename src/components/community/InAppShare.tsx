"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import {
  searchProfiles,
  createPrayer,
  type Profile,
  type Visibility,
} from "@/lib/community";
import { sendMessage } from "@/lib/messages";

/**
 * Partage INTERNE à l'application: envoyer un verset / une parole à un membre
 * en message privé, ou le publier sur le mur de prière. Complète les boutons de
 * partage externes (WhatsApp, etc.). Visible uniquement pour un membre connecté.
 */
export function InAppShare({ text }: { text: string }) {
  const { ready, userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "dm" | "wall">("menu");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recherche de membre (débounce).
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (mode!== "dm" || q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      setResults(await searchProfiles(q));
      setLoading(false);
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, mode]);

  if (ready &&!userId) return null;

  function close() {
    setOpen(false);
    setMode("menu");
    setQ("");
    setResults([]);
    setDone("");
  }

  async function toMember(p: Profile) {
    if (!userId || busy) return;
    setBusy(true);
    await sendMessage(userId, p.id, text);
    setBusy(false);
    setDone(`Envoyé à ${p.pseudo?? "ce membre"}`);
    setTimeout(close, 1500);
  }

  async function toWall() {
    if (!userId || busy) return;
    setBusy(true);
    await createPrayer(text, visibility, userId);
    setBusy(false);
    setDone("Publié sur le mur");
    setTimeout(close, 1500);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMode("menu");
        }}
        className="btn-ghost px-4 py-2 text-sm"
        aria-label="Partager dans l'application"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Dans l'app
      </button>

      {open? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Fermer"
            onClick={close}
            className="absolute inset-0 bg-night-950/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg font-bold text-night-900">
                {mode === "menu"
? "Partager dans l'app"
: mode === "dm"
? "Envoyer à un ami"
: "Publier sur le mur"}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer"
                className="grid h-8 w-8 place-items-center rounded-full text-night-900/40 hover:bg-night-900/5"
              >
                ✕
              </button>
            </div>

            {/* Aperçu du contenu partagé */}
            <p className="mb-4 line-clamp-3 rounded-2xl bg-night-900/[0.04] px-4 py-3 text-sm text-night-900/70">
              {text}
            </p>

            {done? (
              <p className="rounded-2xl bg-spirit-500/10 px-4 py-3 text-center text-sm font-semibold text-spirit-700">
                ✓ {done}
              </p>
            ): mode === "menu"? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("dm")}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-night-900/10 bg-white p-4 text-center transition-colors hover:border-spirit-600/40"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-dawn-400/15 text-spirit-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm font-bold text-night-900/85">Envoyer à un ami</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("wall")}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-night-900/10 bg-white p-4 text-center transition-colors hover:border-spirit-600/40"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-dawn-400/15 text-spirit-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                      <path d="M12 3c-1 2-1 4 0 6m0 0c1-2 1-4 0-6M7 21l1.5-7.5a3.5 3.5 0 0 1 7 0L17 21" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm font-bold text-night-900/85">Publier sur le mur</span>
                </button>
              </div>
            ): mode === "dm"? (
              <div>
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-night-900/40"
                    strokeWidth={1.8}
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                  </svg>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    autoFocus
                    placeholder="Rechercher un membre par pseudo…"
                    className="field w-full pl-10"
                  />
                </div>
                <div className="mt-3 max-h-64 overflow-y-auto">
                  {q.trim().length < 2? (
                    <p className="px-1 py-3 text-sm text-night-900/45">
                      Tape au moins 2 lettres pour chercher.
                    </p>
                  ): loading? (
                    <p className="px-1 py-3 text-sm text-night-900/45">Recherche…</p>
                  ): results.length === 0? (
                    <p className="px-1 py-3 text-sm text-night-900/45">Aucun membre trouvé.</p>
                  ): (
                    <ul>
                      {results.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => toMember(p)}
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-night-900/[0.04] disabled:opacity-50"
                          >
                            <Avatar pseudo={p.pseudo} url={p.avatar_url} size={36} />
                            <span className="font-semibold text-night-900/85">{p.pseudo}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMode("menu")}
                  className="mt-2 text-sm font-semibold text-night-900/50 hover:underline"
                >
                  ← Retour
                </button>
              </div>
            ): (
              <div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      visibility === "public"
? "border-spirit-600 bg-spirit-500/10 text-spirit-700"
: "border-night-900/15 text-night-900/60"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("friends")}
                    className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      visibility === "friends"
? "border-spirit-600 bg-spirit-500/10 text-spirit-700"
: "border-night-900/15 text-night-900/60"
                    }`}
                  >
                    Mes abonnés
                  </button>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={toWall}
                  className="btn-primary mt-4 w-full justify-center disabled:opacity-50"
                >
                  {busy? "Publication…": "Publier sur le mur"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("menu")}
                  className="mt-2 text-sm font-semibold text-night-900/50 hover:underline"
                >
                  ← Retour
                </button>
              </div>
            )}
          </div>
        </div>
      ): null}
    </>
  );
}
