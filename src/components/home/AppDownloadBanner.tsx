import Link from "next/link";
import { StoreBadges } from "@/components/app/StoreBadges";

/**
 * Bloc d'annonce du lancement de l'application (accueil du site).
 * Renvoie vers la landing /app et propose les boutons de téléchargement.
 */
export function AppDownloadBanner() {
  return (
    <section className="container-x py-10">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-night-950 px-6 py-10 sm:px-10">
        <div className="blob right-[8%] top-0 h-48 w-48 bg-dawn-400/30" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-dawn-400/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-dawn-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dawn-400" />
              Nouveau · C'est officiel
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-cream sm:text-4xl">
              L'application est <span className="text-dawn-400">disponible</span> !
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-cream/70">
              Ton dévotionnel, la Bible, tes plans et la communauté de prière — dans ta
              poche, avec un rappel chaque matin.
            </p>
            <Link
              href="/app"
              className="mt-4 inline-block text-sm font-semibold text-dawn-400 underline-offset-4 hover:underline"
            >
              Découvrir l'application →
            </Link>
          </div>
          <div className="lg:justify-self-end">
            <StoreBadges />
          </div>
        </div>
      </div>
    </section>
  );
}
