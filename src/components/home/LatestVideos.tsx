import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SectionHeader } from "@/components/ui/Section";
import { getLatestVideos } from "@/lib/content";

export function LatestVideos() {
  const videos = getLatestVideos();
  const [feature, ...rest] = videos;

  return (
    <section id="videos" className="container-x scroll-mt-24 py-20 sm:py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Dernières vidéos"
            title={
              <>
                Des messages qui <span className="text-gradient">réveillent</span>
              </>
            }
          />
          <a href="#" className="btn-ghost shrink-0">
            Voir toutes les vidéos
          </a>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {/* Vidéo à la une */}
        <Reveal from="scale">
          <a
            href="#"
            className="group relative block h-full overflow-hidden rounded-4xl border border-white/10"
          >
            <div
              className={`relative aspect-video w-full bg-gradient-to-br ${feature.thumbnail}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/20 to-transparent" />
              <PlayButton large />
              <span className="absolute right-4 top-4 rounded-full bg-night-950/70 px-3 py-1 text-xs font-semibold backdrop-blur">
                {feature.duration}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="eyebrow mb-3">{feature.category}</span>
              <h3 className="font-display text-2xl font-bold leading-tight text-balance transition-colors group-hover:text-dawn-300">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-cream/60">{feature.publishedAt}</p>
            </div>
          </a>
        </Reveal>

        {/* Liste secondaire */}
        <div className="flex flex-col gap-4">
          {rest.map((v, i) => (
            <Reveal key={v.id} from="right" delay={i * 0.08}>
              <a
                href="#"
                className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-3 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div
                  className={`relative aspect-video w-40 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${v.thumbnail}`}
                >
                  <div className="absolute inset-0 bg-night-950/20" />
                  <PlayButton />
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-night-950/70 px-1.5 py-0.5 text-[10px] font-semibold">
                    {v.duration}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-dawn-300">
                    {v.category}
                  </span>
                  <h4 className="mt-1 line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-dawn-300">
                    {v.title}
                  </h4>
                  <p className="mt-1 text-xs text-cream/55">{v.publishedAt}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Captation email après les vidéos */}
      <Reveal delay={0.1}>
        <div className="mt-10 glass flex flex-col items-center gap-5 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="font-display text-xl font-bold">
              Ne rate aucune nouvelle vidéo
            </h3>
            <p className="mt-1 text-sm text-cream/65">
              Sois prévenu(e) à chaque publication — et reçois les vidéos privées réservées à la communauté.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <NewsletterForm source="apres-videos" cta="Me prévenir" variant="spirit" note="" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function PlayButton({ large }: { large?: boolean }) {
  return (
    <span
      className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-dawn-400/90 ${
        large ? "h-16 w-16" : "h-10 w-10"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={large ? "h-6 w-6 translate-x-0.5 text-night-950" : "h-4 w-4 translate-x-0.5 text-white"}
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}
