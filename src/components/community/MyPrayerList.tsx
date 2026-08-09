"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import {
  listMyPrayers,
  listPrayingFor,
  createPrayer,
  setPrayerAnswered,
  type Prayer,
  type Visibility,
} from "@/lib/community";

/** Coche (trait de la charte). */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Ajout rapide d'un sujet à MA liste de prière (profil). Par défaut le sujet
 * est privé (visible de moi seul) ; on peut aussi le partager sur le mur.
 */
export function PrayerListQuickAdd({
  userId,
  onAdded,
}: {
  userId: string;
  onAdded: () => void;
}) {
  const [body, setBody] = useState("");
  const [share, setShare] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    const visibility: Visibility = share ? "public" : "private";
    await createPrayer(text, visibility, userId);
    setBody("");
    setShare(false);
    setBusy(false);
    onAdded();
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-2xl border border-night-900/10 bg-white p-3">
      <div className="flex items-center gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ajouter un sujet à ma liste de prière…"
          className="field w-full text-sm"
        />
        <button
          type="submit"
          disabled={busy || !body.trim()}
          className="btn-primary text-sm disabled:opacity-40"
        >
          Ajouter
        </button>
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs text-night-900/55">
        <input
          type="checkbox"
          checked={share}
          onChange={(e) => setShare(e.target.checked)}
          className="h-4 w-4 accent-spirit-600"
        />
        Partager aussi sur le mur de prière (sinon, visible de toi seul)
      </label>
    </form>
  );
}

/**
 * MA liste de prière sur l'accueil (sous le sujet du jour) : mes sujets non
 * exaucés à porter, avec une coche « Exaucé ». Vide → bouton vers le profil,
 * où la liste se remplit.
 */
export function MyPrayerTodo() {
  const { ready, userId } = useAuth();
  const [items, setItems] = useState<Prayer[] | null>(null);
  // Les sujets des autres pour lesquels je prie (mes « Je prie » actifs).
  const [prayingFor, setPrayingFor] = useState<Prayer[]>([]);

  useEffect(() => {
    if (!ready || !userId) return;
    let active = true;
    listMyPrayers(userId).then((ps) => {
      if (active) setItems(ps.filter((p) => !p.answered));
    });
    listPrayingFor(userId, 5).then((ps) => {
      if (active) setPrayingFor(ps);
    });
    return () => {
      active = false;
    };
  }, [ready, userId]);

  if (!ready || !userId || items === null) return null;

  async function markAnswered(id: string) {
    setItems((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
    await setPrayerAnswered(id, true);
  }

  return (
    <section className="container-x">
      <div className="glass p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spirit-600">
            Ma liste de prière
          </p>
          <Link
            href="/profil"
            className="text-xs font-semibold text-spirit-600 underline-offset-2 hover:underline"
          >
            Gérer ma liste
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="mt-3">
            <p className="text-sm text-night-900/60">
              Ta liste est vide. Note les sujets que tu portes devant Dieu — et coche-les
              quand Il agit.
            </p>
            <Link href="/profil" className="btn-primary mt-3 inline-flex text-sm">
              Remplir ma liste
            </Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {items.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-night-900/10 bg-white px-3.5 py-2.5"
              >
                <button
                  type="button"
                  onClick={() => markAnswered(p.id)}
                  aria-label="Marquer comme exaucé"
                  title="Exaucé — Dieu a agi"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-night-900/20 text-transparent transition-colors hover:border-dawn-500 hover:bg-dawn-400/15 hover:text-dawn-600"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <p className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug text-night-900/85">
                  {p.body}
                </p>
              </li>
            ))}
            {items.length > 5 ? (
              <li className="pl-10 text-xs text-night-900/45">
                + {items.length - 5} autre{items.length - 5 > 1 ? "s" : ""} sujet
                {items.length - 5 > 1 ? "s" : ""} dans mon profil
              </li>
            ) : null}
          </ul>
        )}

        {/* Les sujets des autres que je porte (mes « Je prie » sur le mur) */}
        {prayingFor.length > 0 ? (
          <div className="mt-5 border-t border-night-900/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spirit-600">
              Je prie pour…
            </p>
            <ul className="mt-3 space-y-2">
              {prayingFor.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/communaute/?prayer=${p.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-night-900/10 bg-white px-3.5 py-2.5 transition-colors hover:border-night-900/25"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-spirit-600">
                        {p.author?.pseudo ?? "Ami(e)"}
                      </span>
                      <span className="line-clamp-1 block text-sm leading-snug text-night-900/80">
                        {p.body}
                      </span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 shrink-0 fill-none stroke-current text-night-900/30"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
