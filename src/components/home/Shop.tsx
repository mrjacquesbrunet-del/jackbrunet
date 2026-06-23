import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SectionHeader } from "@/components/ui/Section";
import { ProductCard } from "@/components/ui/ProductCard";
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
            <ProductCard p={p} />
          </Reveal>
        ))}
      </div>

      {/* Captation email — boutique (liste d'attente) */}
      <Reveal delay={0.1}>
        <div className="mt-10 glass flex flex-col items-center gap-5 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="font-display text-xl font-bold">
              Sois prévenu(e) de la sortie du livre
            </h3>
            <p className="mt-1 text-sm text-night-900/65">
              Laisse ton email : tu seras parmi les premiers informés de la sortie de RHEMA.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <NewsletterForm source="boutique" cta="Me prévenir" note="" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
