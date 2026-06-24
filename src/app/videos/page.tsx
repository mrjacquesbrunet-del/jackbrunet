import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { VideosExperience } from "@/components/home/VideosExperience";
import { ShortsExperience } from "@/components/home/ShortsExperience";
import { getLongVideoCategories, getShortCategories } from "@/lib/content";
import { youtube } from "@/config/site";

export const metadata: Metadata = {
  title: "Vidéos",
  description:
    "Toutes les prédications et les Shorts de Jack Brunet, à regarder directement sur le site.",
};

export default function VideosPage() {
  const longCategories = getLongVideoCategories();
  const shortCategories = getShortCategories();
  const hasVideos = longCategories.length > 0;

  return (
    <>
      {/* Prédications — bannière + grille animée */}
      {hasVideos ? (
        <section id="predications" className="scroll-mt-24 pb-12 sm:pb-16">
          <VideosExperience categories={longCategories} />
        </section>
      ) : (
        <>
          <PageHero
            eyebrow="Vidéothèque"
            title={
              <>
                Toutes les <span className="text-gradient">vidéos</span>
              </>
            }
            description="Prédications et Shorts, à regarder directement ici."
          />
          <section className="container-x py-12">
            <EmptyState
              href={youtube.videosUrl}
              label="Voir les vidéos sur YouTube"
              text="Les prédications apparaîtront ici dès l'activation de l'import YouTube."
            />
          </section>
        </>
      )}

      {/* Shorts */}
      <section id="shorts" className="scroll-mt-24 py-12 sm:py-16">
        <div className="container-x">
          <Reveal>
            <SectionHeader
              eyebrow="Vidéos courtes"
              title="Tous les Shorts"
              description="Clique sur un Short puis scrolle d'une vidéo à l'autre."
            />
          </Reveal>
        </div>
        {shortCategories.length > 0 ? (
          <Reveal delay={0.05}>
            <ShortsExperience categories={shortCategories} />
          </Reveal>
        ) : (
          <div className="container-x">
            <EmptyState
              href={youtube.shortsUrl}
              label="Regarder les Shorts sur YouTube"
              text="Les Shorts apparaîtront ici dès l'activation de l'import YouTube."
            />
          </div>
        )}
      </section>
    </>
  );
}

function EmptyState({ href, label, text }: { href: string; label: string; text: string }) {
  return (
    <Reveal delay={0.05}>
      <div className="dark-ctx bg-topo-dark relative mt-8 overflow-hidden rounded-4xl border border-white/10 p-8 text-center sm:p-12">
        <div className="blob -right-10 -top-10 h-48 w-48 bg-dawn-400/30" />
        <div className="relative mx-auto max-w-xl">
          <p className="text-cream/70">{text}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-6"
          >
            {label}
          </a>
        </div>
      </div>
    </Reveal>
  );
}
