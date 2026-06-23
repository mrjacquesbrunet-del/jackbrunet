import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SectionHeader } from "@/components/ui/Section";
import { getProducts } from "@/lib/content";

export function Shop() {
  const products = getProducts();

  return (
    <section className="container-x py-20 sm:py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Boutique"
            title={
              <>
                Va plus <span className="text-gradient">loin</span>
              </>
            }
            description="Des ressources pour approfondir ta foi et nourrir ta marche avec Jésus au quotidien."
          />
          <Link href="/boutique" className="btn-ghost shrink-0">
            Toute la boutique
          </Link>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <Reveal key={p.id} from="up" delay={i * 0.1}>
            <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-night-900/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-night-900/20 hover:shadow-card">
              <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${p.cover}`}>
                <div className="absolute inset-0 bg-night-950/10 transition-opacity group-hover:opacity-0" />
                {p.badge ? (
                  <span className="absolute left-4 top-4 rounded-full bg-night-950/70 px-3 py-1 text-xs font-semibold text-dawn-300 backdrop-blur">
                    {p.badge}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-night-900/50">
                  {p.type}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug transition-colors group-hover:text-spirit-600">
                  {p.title}
                </h3>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-display text-xl font-extrabold text-night-900">
                    {p.price}
                  </span>
                  <button className="btn-primary px-5 py-2.5 text-sm">Ajouter</button>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Captation email — boutique */}
      <Reveal delay={0.1}>
        <div className="mt-10 glass flex flex-col items-center gap-5 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="font-display text-xl font-bold">
              -10 % sur ta première commande
            </h3>
            <p className="mt-1 text-sm text-night-900/65">
              Inscris-toi et reçois ton code promo, plus les nouveautés en avant-première.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <NewsletterForm source="boutique" cta="Recevoir mon code" note="" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
