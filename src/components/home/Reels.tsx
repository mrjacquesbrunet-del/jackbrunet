import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { getReels } from "@/lib/content";

/** Reels / Shorts — défilement horizontal au format vertical (mobile-first). */
export function Reels() {
  const reels = getReels();

  return (
    <section className="py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Reels & Shorts"
              title={
                <>
                  Une dose de foi <span className="text-gradient-spirit">en 30 secondes</span>
                </>
              }
            />
            <a href="#" className="btn-ghost shrink-0">
              Tout regarder
            </a>
          </div>
        </Reveal>
      </div>

      {/* Carrousel — déborde volontairement pour l'effet plateforme */}
      <Reveal delay={0.05}>
        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-12">
          {reels.map((reel) => (
            <a
              key={reel.id}
              href="#"
              className="group relative aspect-[9/16] w-44 shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 sm:w-52"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${reel.thumbnail} transition-transform duration-500 group-hover:scale-110`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-transparent to-night-950/20" />

              <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur ring-1 ring-white/20">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 translate-x-0.5 text-white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-semibold leading-snug text-white">
                  {reel.title}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-dawn-400" />
                  {reel.views} vues
                </p>
              </div>
            </a>
          ))}
          <span className="w-1 shrink-0" aria-hidden />
        </div>
      </Reveal>
    </section>
  );
}
