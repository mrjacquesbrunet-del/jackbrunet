"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { TexteAvecRefs } from "@/components/bible/FichesChapitre";
import {
  askAssistant,
  assistantUsedToday,
  ASSISTANT_DAILY_LIMIT,
  type AssistantMsg,
} from "@/lib/assistant";
import { getEtudes, type Etude } from "@/lib/etudes";

/**
 * ASSISTANT BIBLIQUE — un échange simple, ancré dans la Bible (LSG).
 * Les références bibliques des réponses « (Jean 3.16) » sont cliquables
 * et ouvrent le lecteur. Quota : 10 questions / 24 h (vérifié serveur).
 */

const SUGGESTIONS = [
  "Que dit la Bible sur la peur ?",
  "Comment prier quand je ne sais pas quoi dire ?",
  "C'est quoi, la grâce ?",
  "Comment savoir si Dieu me parle ?",
];

function LivreGlyphe({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={1.9}>
      <path d="M12 6c-1.8-1.4-4.2-2-7-2v14c2.8 0 5.2.6 7 2 1.8-1.4 4.2-2 7-2V4c-2.8 0-5.2.6-7 2z" strokeLinejoin="round" />
      <path d="M12 6v14" />
    </svg>
  );
}

export function AssistantView() {
  const { userId } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"question" | "etudes">("question");
  const [etudeOuverte, setEtudeOuverte] = useState<Etude | null>(null);
  const etudes = getEtudes();
  const [messages, setMessages] = useState<AssistantMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      assistantUsedToday(userId).then((n) => setRemaining(Math.max(0, ASSISTANT_DAILY_LIMIT - n)));
    }
  }, [userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text?: string) {
    const q = (text ?? draft).trim();
    if (!q || busy || !userId) return;
    setErreur(null);
    setDraft("");
    const next: AssistantMsg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setBusy(true);
    const res = await askAssistant(next);
    setBusy(false);
    if (res.ok) {
      setMessages([...next, { role: "assistant", content: res.answer }]);
      setRemaining(res.remaining);
    } else {
      setMessages(messages);
      setDraft(q);
      setErreur(
        res.error === "quota"
          ? "Tu as posé tes 10 questions des dernières 24 h. Reviens un peu plus tard — et bonne méditation d'ici là."
          : res.error === "auth"
            ? "Connecte-toi pour utiliser l'assistant."
            : "Petit souci de connexion. Réessaie dans un instant.",
      );
    }
  }

  const navigate = (l: number, c: number) => router.push(`/bible/?livre=${l}&chap=${c}`);

  return (
    <div className="dark-ctx flex min-h-screen flex-col bg-night-950 text-cream">
      {/* En-tête */}
      <header className="container-x border-b border-white/10 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/"
            aria-label="Retour"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-cream/80"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-extrabold leading-tight">Assistant biblique</h1>
            <p className="text-xs text-cream/55">
              Réponses ancrées dans la Bible (LSG). Ne remplace ni la prière, ni ton pasteur.
            </p>
          </div>
          {remaining !== null && tab === "question" ? (
            <span className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-cream/70">
              {remaining}/{ASSISTANT_DAILY_LIMIT}
            </span>
          ) : null}
        </div>
        <div className="mx-auto mt-3 flex max-w-2xl rounded-full bg-white/[0.06] p-1">
          {(
            [
              ["question", "Pose ta question"],
              ["etudes", "Études bibliques"],
            ] as ["question" | "etudes", string][]
          ).map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`flex-1 rounded-full py-2 font-display text-sm font-bold transition-colors ${
                tab === t ? "bg-night-950 text-dawn-300 shadow-card" : "text-cream/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Fil de conversation / bibliothèque d'études */}
      <main className="container-x mx-auto w-full max-w-2xl flex-1 pb-36 pt-5">
        {tab === "etudes" ? (
          <div className="space-y-3">
            <p className="text-sm text-cream/60">
              Les grands thèmes de la foi, expliqués simplement — chaque référence s&apos;ouvre
              dans ta Bible d&apos;un tap.
            </p>
            {etudes.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setEtudeOuverte(e)}
                className="flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:bg-white/[0.07]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-spirit-500/20 font-display text-lg font-extrabold text-cream/90">
                  {e.titre.replace(/^(Le |La |Les |L')/, "").charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-extrabold text-cream">{e.titre}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-cream/60">{e.accroche}</span>
                </span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-cream/35" strokeWidth={2}>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        ) : !userId ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <p className="font-display text-lg font-bold">Connecte-toi pour poser ta question</p>
            <p className="mt-1 text-sm text-cream/60">
              L&apos;assistant est réservé aux membres (10 questions par jour).
            </p>
            <Link
              href="/profil"
              className="mt-4 inline-flex rounded-full bg-dawn-400 px-5 py-2.5 font-display text-sm font-bold text-night-950"
            >
              Se connecter
            </Link>
          </div>
        ) : messages.length === 0 ? (
          <div className="mt-6 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-dawn-400/15 text-dawn-300">
              <LivreGlyphe className="h-8 w-8" />
            </span>
            <p className="mt-4 font-display text-lg font-bold">Pose ta question sur la Bible</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-cream/60">
              Un passage difficile, un thème, une situation à éclairer par la Parole — chaque réponse
              s&apos;appuie sur des versets que tu peux ouvrir d&apos;un tap.
            </p>
            <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left text-sm font-semibold text-cream/85 transition-colors hover:bg-white/[0.09]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-dawn-400 px-4 py-2.5 text-[15px] font-semibold leading-relaxed text-night-950">
                    {m.content}
                  </p>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dawn-400/15 text-dawn-300">
                    <LivreGlyphe className="h-4 w-4" />
                  </span>
                  <div className="max-w-[88%] space-y-2.5 rounded-3xl rounded-tl-lg border border-white/10 bg-white/[0.05] px-4 py-3">
                    {m.content.split("\n\n").map((par, j) => (
                      <TexteAvecRefs key={j} texte={par} onNavigate={navigate} />
                    ))}
                  </div>
                </div>
              ),
            )}
            {busy ? (
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dawn-400/15 text-dawn-300">
                  <LivreGlyphe className="h-4 w-4" />
                </span>
                <span className="flex gap-1.5 rounded-3xl border border-white/10 bg-white/[0.05] px-4 py-3.5">
                  {[0, 1, 2].map((n) => (
                    <span
                      key={n}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-cream/50"
                      style={{ animationDelay: `${n * 150}ms` }}
                    />
                  ))}
                </span>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
        )}
        {erreur ? (
          <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">
            {erreur}
          </p>
        ) : null}
      </main>

      {/* Feuille : l'étude ouverte */}
      {etudeOuverte ? (
        <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center">
          <button type="button" aria-label="Fermer" onClick={() => setEtudeOuverte(null)} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
          <div className="relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 sm:rounded-3xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dawn-400">Étude biblique</p>
                <h2 className="mt-0.5 font-display text-xl font-extrabold leading-tight">{etudeOuverte.titre}</h2>
              </div>
              <button type="button" onClick={() => setEtudeOuverte(null)} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <p className="text-[15px] font-semibold leading-relaxed text-cream/80">{etudeOuverte.accroche}</p>
              {etudeOuverte.sections.map((sec, i) => (
                <div key={i}>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">{sec.t}</p>
                  <div className="mt-1.5">
                    <TexteAvecRefs
                      texte={sec.p}
                      onNavigate={(l, c) => {
                        setEtudeOuverte(null);
                        navigate(l, c);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Zone de saisie */}
      {userId && tab === "question" ? (
        <div
          className="fixed inset-x-0 bottom-0 border-t border-white/10 bg-night-950/95 backdrop-blur-md"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="container-x mx-auto flex max-w-2xl items-center gap-2 pt-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Ta question sur la Bible…"
              disabled={busy}
              className="flex-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-3 text-[15px] text-cream placeholder:text-cream/40 focus:outline-none disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => send()}
              disabled={!draft.trim() || busy}
              aria-label="Envoyer"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
                <path d="M4 12l16-7-4.5 7L20 19zM4 12h11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
