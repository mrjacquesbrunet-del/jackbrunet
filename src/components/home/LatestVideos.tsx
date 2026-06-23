import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SectionHeader } from "@/components/ui/Section";
import { VideosExperience } from "@/components/home/VideosExperience";
import { getLongVideoCategories } from "@/lib/content";
import { youtube } from "@/config/site";

export function LatestVideos() {
  const categories = getLongVideoCategories();
  const hasVideos = categories.length > 0;

  return (
    <section id="videos" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Prédications"
              title={
                <>
                  Des messages qui <span className="text-gradient">réveillent</span>
                </>
              }
              description="Mes enseignements complets, à regarder directement ici, classés par thème."
            />
            <a
              href={youtube.videosUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost shrink-0"
            >
              Voir sur YouTube
            </a>
          </div>
        </Reveal>
      </div>

      {hasVideos ? (
        <Reveal delay={0.05}>
          <VideosExperience categories={categories} />
        </Reveal>
      ) : (
        <div className="container-x">
          <Reveal delay={0.05}>
            <div className="dark-ctx bg-topo-dark relative mt-10 overflow-hidden rounded-4xl border border-white/10 p-8 text-center sm:p-12">
              <div className="blob -right-10 -top-10 h-48 w-48 bg-dawn-400/30" />
              <div className="relative mx-auto max-w-xl">
                <span className="eyebrow">▶ Prédications</span>
                <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                  Mes prédications arrivent ici
                </h3>
                <p className="mt-3 text-cream/70">
                  Active l'import automatique YouTube (ou ajoute des vidéos dans
                  l'admin) et tes formats longs s'afficheront ici, classés par thème.
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
        </div>
      )}

      {/* Captation email après les vidéos */}
      <div className="container-x">
        <Reveal delay={0.1}>
          <div className="mt-12 glass flex flex-col items-center gap-5 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="font-display text-xl font-bold">Ne rate aucune prédication</h3>
              <p className="mt-1 text-sm text-night-900/65">
                Sois prévenu(e) à chaque nouvelle vidéo et reçois les contenus réservés à la communauté.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <NewsletterForm source="apres-videos" cta="Me prévenir" variant="spirit" note="" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
