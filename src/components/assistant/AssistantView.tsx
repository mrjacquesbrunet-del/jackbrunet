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
    if (remaining !== null && remaining <= 0) {
      setErreur(
        `Tu as posé tes ${ASSISTANT_DAILY_LIMIT} questions des dernières 24 h. Reviens un peu plus tard — et bonne méditation d'ici là.`,
      );
      return;
    }
    setErreur(null);
    setDraft("");
    const next: AssistantMsg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setBusy(true);
    const res = await askAssistant(next);
    setBusy(false);
    if (res.ok) {
      setMessages([...next, { role: "assistant", content: res.answer }]);
      setRemaining((r) => Math.max(0, (r ?? ASSISTANT_DAILY_LIMIT) - 1));
    } else {
      setMessages(messages);
      setDraft(q);
      setErreur(
        res.error === "quota"
          ? `Tu as posé tes ${ASSISTANT_DAILY_LIMIT} questions des dernières 24 h. Reviens un peu plus tard — et bonne méditation d'ici là.`
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
          {remaining !== null ? (
            <span className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-cream/70">
              {remaining}/{ASSISTANT_DAILY_LIMIT}
            </span>
          ) : null}
        </div>
      </header>

      {/* Fil de conversation / bibliothèque d'études */}
      <main className="container-x mx-auto w-full max-w-2xl flex-1 pb-[calc(9rem+var(--bottom-nav-h,0px))] pt-5">
        {!userId ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <p className="font-display text-lg font-bold">Connecte-toi pour poser ta question</p>
            <p className="mt-1 text-sm text-cream/60">
              L&apos;assistant est réservé aux membres (5 questions par jour).
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
            {/* Question personnalisée : la porte d'entrée principale */}
            <div className="mx-auto mt-6 max-w-sm rounded-3xl border border-dawn-400/30 bg-white/[0.05] p-3 text-left">
              <label htmlFor="question-libre" className="block px-1 text-[11px] font-black uppercase tracking-[0.18em] text-dawn-300">
                Écris ta propre question
              </label>
              <textarea
                id="question-libre"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={3}
                maxLength={1500}
                placeholder="Par exemple : que veut dire Jésus quand il dit « je suis le cep » ?"
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-night-950/60 px-3.5 py-3 text-[15px] leading-relaxed text-cream placeholder:text-cream/35 focus:border-dawn-400/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!draft.trim() || busy}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-dawn-400 py-3 font-display text-sm font-bold text-night-950 disabled:opacity-40"
              >
                Poser ma question
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
                  <path d="M20 12L4 5l4.5 7L4 19zM20 12H9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <p className="mx-auto mt-6 max-w-sm px-1 text-left text-[11px] font-black uppercase tracking-[0.18em] text-cream/45">
              Ou choisis un exemple
            </p>
            <div className="mx-auto mt-2 flex max-w-sm flex-col gap-2">
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

      {/* Zone de saisie (une fois la conversation commencée) : posée JUSTE
          au-dessus de la barre d'onglets de l'app, jamais cachée dessous. */}
      {userId && messages.length > 0 ? (
        <div
          className="fixed inset-x-0 z-[55] border-t border-white/10 bg-night-950/95 backdrop-blur-md"
          style={{
            bottom: "var(--bottom-nav-h, 0px)",
            paddingBottom: "max(0.75rem, calc(env(safe-area-inset-bottom) - var(--bottom-nav-h, 0px)))",
          }}
        >
          <div className="container-x mx-auto flex max-w-2xl items-center gap-2 pt-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Une autre question sur la Bible…"
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
                <path d="M20 12L4 5l4.5 7L4 19zM20 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
