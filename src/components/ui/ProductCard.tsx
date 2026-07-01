import type { Product } from "@/lib/types";
import { asset } from "@/lib/asset";
import { STRIPE_LINKS } from "@/config/stripe";
import { PayButton } from "@/components/ui/PayButton";

/** Carte produit boutique (photo + état de disponibilité). */
export function ProductCard({ p }: { p: Product }) {
  const img = asset(p.image);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-night-900/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-night-900/20 hover:shadow-card">
      <div className="relative aspect-[3/4] overflow-hidden bg-night-900">
        {img? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={p.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ): (
          <div className={`h-full w-full bg-gradient-to-br ${p.cover}`} />
        )}
        {p.badge? (
          <span className="absolute left-4 top-4 rounded-full bg-night-950/75 px-3 py-1 text-xs font-semibold text-dawn-300 backdrop-blur">
            {p.badge}
          </span>
        ): null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-night-900/50">
          {p.type}
        </span>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug transition-colors group-hover:text-spirit-600">
          {p.title}
        </h3>
        <div className="mt-5 flex items-center justify-between gap-3">
          {p.available? (
            <>
              <span className="font-display text-xl font-extrabold text-night-900">
                {p.price}
              </span>
              <PayButton href={STRIPE_LINKS.book} className="btn-primary px-5 py-2.5 text-sm">Ajouter</PayButton>
            </>
          ): (
            <span className="inline-flex items-center rounded-full border border-night-900/15 bg-night-900/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-night-900/60">
              Bientôt disponible
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
