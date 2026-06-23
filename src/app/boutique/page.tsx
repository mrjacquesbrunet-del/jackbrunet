import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { ProductCard } from "@/components/ui/ProductCard";
import { getProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "RHEMA — 365 révélations bibliques à méditer chaque jour. Le livre de Jack Brunet, bientôt disponible.",
};

export default function BoutiquePage() {
  const products = getProducts();

  return (
    <>
      <PageHero
        eyebrow="Boutique"
        title={
          <>
            Des ressources pour <span className="text-gradient">aller plus loin</span>
          </>
        }
        description="Chaque ressource est pensée pour nourrir ta foi au quotidien — et soutenir la mission."
      />

      <section className="container-x py-10">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.id} from="up" delay={i * 0.08}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Captation email — liste d'attente */}
      <section className="container-x pb-8">
        <Reveal>
          <div className="glass flex flex-col items-center gap-5 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="font-display text-xl font-bold">Sois prévenu(e) de la sortie</h3>
              <p className="mt-1 text-sm text-night-900/65">
                Laisse ton email : tu seras parmi les premiers informés de la sortie de RHEMA.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <NewsletterForm source="page-boutique" cta="Me prévenir" note="" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
