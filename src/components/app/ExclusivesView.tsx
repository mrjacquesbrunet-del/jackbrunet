"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

const KEY = "jb.exclus.unlocked";

/* Petit store pour mémoriser le déverrouillage (et réagir tout de suite). */
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("jb-exclus", cb as EventListener);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("jb-exclus", cb as EventListener);
  };
}
function getSnapshot() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function unlock() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("jb-exclus"));
}

type Item = { title: string; desc: string; href: string; tag: string };

const ITEMS: Item[] = [
  {
    tag: "Ebook",
    title: "7 jours pour retrouver la paix",
    desc: "Le mini-parcours offert : 7 méditations pour ancrer ta journée en Jésus.",
    href: "/ebook/7-jours",
  },
  {
    tag: "Audio",
    title: "Soaking & prédication",
    desc: "Un temps de présence pour méditer et te reposer en Dieu.",
    href: "/devotionnel",
  },
  {
    tag: "Bonus",
    title: "Premières méditations de RHEMA",
    desc: "Un avant-goût exclusif du livre — des révélations bibliques à méditer.",
    href: "/ebook/rhema",
  },
];

export function ExclusivesView() {
  const unlocked = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return (
    <section className="dark-ctx relative overflow-hidden bg-night-950 pt-28 sm:pt-32">
      <div className="absolute inset-0 bg-grid opacity-[0.1]" />
      <div className="blob -right-10 top-10 h-64 w-64 bg-dawn-400/25" />
      <div className="container-x relative pb-16">
        <span className="eyebrow">✦ Réservé aux abonnés</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">
          Mes <span className="text-gradient">exclusivités</span>
        </h1>
        <p className="mt-3 max-w-xl text-cream/70">
          Des cadeaux et contenus réservés : ebooks, audios, bonus… Débloque-les
          gratuitement en laissant ton email.
        </p>

        {!unlocked ? (
          <div className="mt-8 max-w-md rounded-4xl border border-white/10 bg-night-800/70 p-6 shadow-card sm:p-8">
            <p className="font-display text-xl font-extrabold">Débloque tout, gratuitement</p>
            <p className="mt-1 text-sm text-cream/70">
              Entre ton email : tu accèdes immédiatement aux contenus exclusifs et tu reçois la
              pensée du jour.
            </p>
            <div className="mt-5">
              <NewsletterForm
                source="exclusivites"
                layout="stacked"
                size="lg"
                cta="Débloquer les exclusivités"
                note="Gratuit. Désinscription en un clic."
                onSuccess={unlock}
              />
            </div>
          </div>
        ) : (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-dawn-400/15 px-4 py-1.5 text-sm font-bold text-dawn-300">
            ✓ Accès débloqué — profite bien 🙏
          </p>
        )}

        {/* Contenus */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-night-800/60 p-5"
            >
              <span className="text-[11px] font-bold uppercase tracking-wide text-dawn-300">
                {it.tag}
              </span>
              <p className="mt-2 font-display text-lg font-bold">{it.title}</p>
              <p className="mt-1 text-sm text-cream/65">{it.desc}</p>
              {unlocked ? (
                <Link href={it.href} className="btn-primary mt-4 text-sm">
                  Y accéder
                </Link>
              ) : (
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cream/45">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.7}>
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
                  </svg>
                  Verrouillé
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
