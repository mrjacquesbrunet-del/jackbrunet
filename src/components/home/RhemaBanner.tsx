import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

/** Bandeau précommande RHEMA — accueil, juste sous le héros. */
export function RhemaBanner() {
  return (
    <section className="container-x py-8">
      <Reveal>
        <Link
          href="/boutique"
          className="dark-ctx bg-topo-dark group relative block overflow-hidden rounded-4xl border border-dawn-400/40 p-7 sm:p-9"
        >
          <div className="blob -right-16 -top-16 h-48 w-48 bg-dawn-500/25" />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/rhema-cover.webp"
              alt="Couverture du livre RHEMA"
              className="w-28 shrink-0 drop-shadow-[0_20px_30px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.03] sm:w-32"
              loading="lazy"
            />
            <div className="text-center sm:flex-1 sm:text-left">
              <span className="inline-flex rounded-full bg-dawn-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-night-950">
                Précommande — sortie le 7 septembre
              </span>
              <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                RHEMA — <span className="text-gradient">une révélation chaque jour</span>
              </h2>
              <p className="mt-2 text-sm text-cream/70">
                365 révélations bibliques · 740 pages · Offre de lancement{" "}
                <s className="text-cream/40">29,90&nbsp;€</s>{" "}
                <b className="text-dawn-400">26,90&nbsp;€</b>
              </p>
            </div>
            <span className="btn-primary shrink-0">Découvrir le livre</span>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}
