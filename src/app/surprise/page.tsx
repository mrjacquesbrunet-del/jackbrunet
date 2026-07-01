import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Ta surprise — 100 jours de fidélité",
  description: "Un cadeau spécial pour récompenser 100 jours de fidélité avec Jésus.",
  robots: { index: false, follow: false },
};

// NOTE pour Jack: c'est le cadeau « surprise » du palier 100 jours. Tu peux
// remplacer librement le contenu ci-dessous (code promo RHEMA, vidéo privée,
// audio inédit, message vidéo…). Pour l'instant: un mot personnel + une
// invitation à t'écrire pour recevoir un cadeau personnalisé.
export default function SurprisePage() {
  return (
    <section className="dark-ctx bg-topo-dark min-h-screen pt-28 pb-16 sm:pt-32">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Ta surprise est là</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            100 jours <span className="text-gradient">avec Jésus</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">
            Cent jours de fidélité, l'un après l'autre. Ce n'est pas rien: c'est une histoire
            d'amour qui s'écrit, jour après jour, entre toi et ton Père. Je suis fier de toi.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-white/10 bg-night-900/60 p-6 text-center shadow-card sm:p-8">
          <div className="text-5xl"></div>
          <p className="mt-4 font-display text-xl font-bold">Ton cadeau personnel</p>
          <p className="mt-2 text-sm text-cream/70">
            Pour te remercier de ta fidélité, j'aimerais t'offrir quelque chose de personnel.
            Écris-moi avec le mot <strong className="text-dawn-300">« FIDÈLE&nbsp;100 »</strong> et
            je te répondrai personnellement.
          </p>
          <a
            href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
              "FIDÈLE 100 — ma surprise",
            )}`}
            className="btn-primary mt-5 inline-flex"
          >
            Recevoir ma surprise
          </a>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-cream/45">
          Réservé à ceux qui ont tenu 100 jours. Merci pour ta fidélité — Pasteur Jack Brunet
        </p>
      </div>
    </section>
  );
}
