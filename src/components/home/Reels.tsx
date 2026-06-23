import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { ShortsExperience } from "@/components/home/ShortsExperience";
import { getShortCategories } from "@/lib/content";
import { youtube } from "@/config/site";

/** Vidéos courtes (Shorts) — catalogue type Netflix + feed vertical natif. */
export function Reels() {
  const categories = getShortCategories();
  const hasShorts = categories.length > 0;

  return (
    <section id="shorts" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Vidéos courtes"
              title={
                <>
                  Mes Shorts, <span className="text-gradient">à dévorer</span>
                </>
              }
              description="Parcours le catalogue, clique et laisse-toi porter : scrolle pour passer d'un Short à l'autre, sans quitter le site."
            />
            <a
              href={youtube.shortsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost shrink-0"
            >
              Voir sur YouTube
            </a>
          </div>
        </Reveal>
      </div>

      {hasShorts ? (
        <Reveal delay={0.05}>
          <ShortsExperience categories={categories} />
        </Reveal>
      ) : (
        <div className="container-x">
          <Reveal delay={0.05}>
            <div className="dark-ctx bg-topo-dark relative mt-10 overflow-hidden rounded-4xl border border-white/10 p-8 text-center sm:p-12">
              <div className="blob -right-10 -top-10 h-48 w-48 bg-dawn-400/30" />
              <div className="relative mx-auto max-w-xl">
                <span className="eyebrow">▶ Shorts</span>
                <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                  Bientôt : mes Shorts en lecture directe ici
                </h3>
                <p className="mt-3 text-cream/70">
                  Ajoute tes Shorts depuis l'espace d'administration (ou active
                  l'import automatique YouTube) et ils s'afficheront ici en feed vertical.
                </p>
                <a
                  href={youtube.shortsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-7"
                >
                  Regarder les Shorts sur YouTube
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}
