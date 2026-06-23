import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import { getFeaturedPredications } from "@/lib/content";
import { youtube } from "@/config/site";

/** Accueil : une sélection de 3 prédications (le reste est sur /videos). */
export function FeaturedPredications() {
  const videos = getFeaturedPredications();

  return (
    <section id="videos" className="container-x scroll-mt-24 py-20 sm:py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Prédications"
            title={
              <>
                Des messages qui <span className="text-gradient">réveillent</span>
              </>
            }
            description="Une sélection à regarder maintenant. Retrouve toutes les prédications, classées par thème, sur la page Vidéos."
          />
          <Link href="/videos" className="btn-ghost shrink-0">
            Voir toutes les prédications
          </Link>
        </div>
      </Reveal>

      {videos.length > 0 ? (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {videos.map((v, i) => (
            <Reveal key={v.id} from="up" delay={i * 0.1}>
              <article className="group">
                <LiteYouTube id={v.id} title={v.title} />
                <h3 className="mt-3 font-display text-lg font-bold leading-snug">
                  {v.title}
                </h3>
              </article>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal delay={0.05}>
          <div className="dark-ctx bg-topo-dark relative mt-10 overflow-hidden rounded-4xl border border-white/10 p-8 text-center sm:p-12">
            <div className="blob -right-10 -top-10 h-48 w-48 bg-dawn-400/30" />
            <div className="relative mx-auto max-w-xl">
              <span className="eyebrow">Prédications</span>
              <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                Mes prédications arrivent ici
              </h3>
              <p className="mt-3 text-cream/70">
                Active l'import automatique YouTube et tes formats longs s'afficheront ici.
              </p>
              <a
                href={youtube.videosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-7"
              >
                Voir les vidéos sur YouTube
              </a>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}
