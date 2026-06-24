import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { VideoLibrary } from "@/components/home/VideoLibrary";
import { WhatsAppChannel } from "@/components/ui/WhatsAppChannel";
import { getLongVideos, getShorts } from "@/lib/content";
import { youtube } from "@/config/site";

export const metadata: Metadata = {
  title: "Vidéos",
  description:
    "Toutes les prédications et les Shorts de Jack Brunet, à regarder directement sur le site.",
};

export default function VideosPage() {
  const videos = getLongVideos();
  const shorts = getShorts();
  const hasContent = videos.length > 0 || shorts.length > 0;

  return (
    <>
      {hasContent ? (
        <section className="scroll-mt-24 pb-16">
          <VideoLibrary videos={videos} shorts={shorts} />
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
            <Reveal>
              <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-4xl border border-white/10 p-8 text-center sm:p-12">
                <div className="blob -right-10 -top-10 h-48 w-48 bg-dawn-400/30" />
                <div className="relative mx-auto max-w-xl">
                  <p className="text-cream/70">
                    Les vidéos apparaîtront ici dès l'activation de l'import YouTube.
                  </p>
                  <a
                    href={youtube.videosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-6"
                  >
                    Voir la chaîne sur YouTube
                  </a>
                </div>
              </div>
            </Reveal>
          </section>
        </>
      )}
      <WhatsAppChannel />
    </>
  );
}
