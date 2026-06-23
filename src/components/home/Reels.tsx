import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import { youtube } from "@/config/site";

/** Vidéos courtes (Shorts) — lecture directe sur le site. */
export function Reels() {
  const shorts = youtube.shorts;
  const hasShorts = shorts.length > 0;

  return (
    <section id="shorts" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Vidéos courtes"
              title={
                <>
                  Une dose de foi <span className="text-gradient">en quelques minutes</span>
                </>
              }
              description="Mes Shorts, à regarder directement ici. Pour les formats longs, rendez-vous sur la chaîne."
            />
            <a
              href={youtube.shortsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost shrink-0"
            >
              Tous les Shorts
            </a>
          </div>
        </Reveal>
      </div>

      {hasShorts ? (
        <Reveal delay={0.05}>
          <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-12">
            {shorts.map((id) => (
              <div key={id} className="w-44 shrink-0 snap-start sm:w-52">
                <LiteYouTube id={id} vertical title="Short — Jack Brunet" />
              </div>
            ))}
            <span className="w-1 shrink-0" aria-hidden />
          </div>
        </Reveal>
      ) : (
        <div className="container-x">
          <Reveal delay={0.05}>
            <div className="dark-ctx bg-topo-dark relative mt-10 overflow-hidden rounded-4xl border border-white/10 p-8 text-center sm:p-12">
              <div className="blob -right-10 -top-10 h-48 w-48 bg-dawn-400/30" />
              <div className="relative mx-auto max-w-xl">
                <span className="eyebrow">▶ Shorts</span>
                <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                  Retrouve tous mes Shorts sur YouTube
                </h3>
                <p className="mt-3 text-cream/70">
                  Des vidéos courtes et percutantes, publiées régulièrement. Abonne-toi
                  pour ne rien manquer.
                </p>
                <a
                  href={youtube.shortsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-7"
                >
                  Regarder les Shorts
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}
