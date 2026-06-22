import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { getTestimonies } from "@/lib/content";

export function Testimonies() {
  const testimonies = getTestimonies();

  return (
    <section id="temoignages" className="container-x scroll-mt-24 py-20 sm:py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Témoignages"
            title={
              <>
                Des vies qui <span className="text-gradient">changent</span>
              </>
            }
            description="Dieu agit, concrètement, dans le quotidien. Voici quelques histoires de la communauté."
          />
          <a href="#" className="btn-ghost shrink-0">
            Partager mon témoignage
          </a>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonies.map((t, i) => (
          <Reveal key={t.id} from="up" delay={i * 0.1}>
            <figure className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-card">
              <span className="font-display text-5xl leading-none text-dawn-400/60">
                &ldquo;
              </span>
              <blockquote className="-mt-3 flex-1 text-base leading-relaxed text-cream/80">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${t.avatarColor} font-display font-bold text-night-950`}
                >
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-cream">{t.name}</p>
                  <p className="text-xs text-cream/55">{t.location}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
