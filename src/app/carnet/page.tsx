import type { Metadata } from "next";
import Link from "next/link";
import { CarnetView } from "@/components/notebook/CarnetView";
import { getThemePlans } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mon carnet",
  description:
    "Ton carnet personnel: versets surlignés, pensées du jour, punchlines, publications et notes, regroupés au même endroit. Privé, sur ton appareil.",
};

export default function CarnetPage() {
  const plans = getThemePlans();

  return (
    <>
      <CarnetView />

      {/* Plans de lecture */}
      <section className="container-x pb-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-2xl font-extrabold">Plans de lecture</h2>
          <p className="mt-1 text-sm text-night-900/60">
            Avance pas à pas, thème par thème. Choisis un parcours selon ce que tu traverses.
          </p>
          <Link href="/plans" className="btn-primary mt-4 inline-flex">
            Découvre nos plans →
          </Link>
        </div>
        <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
          {plans.map((p) => (
            <Link
              key={p.slug}
              href={`/plans/${p.slug}`}
              className="group flex h-full flex-col rounded-3xl border border-night-900/10 bg-white p-6 transition-all hover:-translate-y-1 hover:border-dawn-400/50 hover:shadow-card"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-spirit-600">
                {p.days.length} jours
              </span>
              <h3 className="mt-2 font-display text-xl font-extrabold">{p.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-night-900/65">{p.subtitle}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-semibold text-spirit-700">
                Commencer
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
