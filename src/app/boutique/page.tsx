import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { getProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Livres, carnets et formations pour nourrir ta foi et grandir avec Jésus chaque jour.",
};

const categories = ["Tout", "Livres", "Carnets", "Formations", "Cadeaux"];

export default function BoutiquePage() {
  const products = getProducts();
  // On duplique pour étoffer la grille de démonstration.
  const catalog = [...products, ...products.map((p) => ({ ...p, id: p.id + "-b", badge: undefined }))];

  return (
    <>
      <PageHero
        eyebrow="Boutique"
        title={
          <>
            Des ressources pour <span className="text-gradient">aller plus loin</span>
          </>
        }
        description="Chaque achat soutient aussi la mission et la création de contenus gratuits pour tous."
      />

      {/* Filtres */}
      <section className="container-x py-10">
        <Reveal>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {categories.map((c, i) => (
              <button
                key={c}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  i === 0
                    ? "bg-gradient-to-r from-dawn-500 to-dawn-400 text-night-950"
                    : "border border-white/15 bg-white/5 text-cream/70 hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((p, i) => (
            <Reveal key={p.id} from="up" delay={(i % 3) * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-card">
                <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${p.cover}`}>
                  {p.badge ? (
                    <span className="absolute left-4 top-4 rounded-full bg-night-950/70 px-3 py-1 text-xs font-semibold text-dawn-300 backdrop-blur">
                      {p.badge}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cream/50">
                    {p.type}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug transition-colors group-hover:text-dawn-300">
                    {p.title}
                  </h3>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-display text-xl font-extrabold">{p.price}</span>
                    <button className="btn-primary px-5 py-2.5 text-sm">Ajouter</button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Captation email — boutique */}
      <section className="container-x pb-8">
        <Reveal>
          <div className="glass flex flex-col items-center gap-5 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="font-display text-xl font-bold">-10 % sur ta première commande</h3>
              <p className="mt-1 text-sm text-cream/65">
                Inscris-toi et reçois ton code promo, plus les nouveautés en avant-première.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <NewsletterForm source="page-boutique" cta="Recevoir mon code" note="" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
