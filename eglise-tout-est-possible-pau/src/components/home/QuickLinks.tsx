import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { home } from "@/lib/content";

const variants = ["leaf", "portrait", "night"] as const;

// Grandes tuiles-images « Commencer ici » — le parcours du nouveau
// visiteur en trois portes d'entrée, façon Nouvelle Vie.
export function QuickLinks() {
  const { quickLinks } = home;

  return (
    <section className="bg-night py-24 text-cream sm:py-32">
      <div className="wrap">
        <Reveal>
          <p className="kicker">{quickLinks.kicker}</p>
          <h2 className="display-2 mt-4 max-w-3xl">{quickLinks.title}</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {quickLinks.items.map((item, i) => (
            <Reveal key={item.href} delay={i * 0.08} className="h-full">
              <Link href={item.href} className="group block h-full">
                <article className="relative h-full overflow-hidden rounded-3xl">
                  <div className="transition-transform duration-700 ease-smooth group-hover:scale-105">
                    <Media
                      src={item.photo || undefined}
                      alt=""
                      ratio="aspect-[3/4] sm:aspect-[4/5]"
                      variant={variants[i % variants.length]}
                      className="!rounded-none"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <h3 className="font-display text-3xl uppercase leading-none sm:text-4xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/75">
                      {item.text}
                    </p>
                    <span className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 transition-all duration-300 ease-smooth group-hover:border-pulse group-hover:bg-pulse group-hover:text-night">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                        <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
