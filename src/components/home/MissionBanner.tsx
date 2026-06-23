import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { getMission } from "@/lib/content";

export function MissionBanner() {
  const mission = getMission();

  if (!mission.active) return null;

  return (
    <section className="container-x py-8">
      <Reveal>
        <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-4xl border border-dawn-400/40 p-7 sm:p-9">
          <div className="blob -right-16 -top-16 h-48 w-48 bg-dawn-500/25" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-dawn-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-night-950">
                Prochaine mission
              </span>
              <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                Soutiens notre mission à{" "}
                <span className="text-gradient">Madagascar</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm text-cream/70">
                {mission.period} d'évangélisation. Conférence, évangélisation
                de rue et soutien aux œuvres. Objectif :{" "}
                {mission.objectiveEur.toLocaleString("fr-FR")} €.
                Rejoins-nous dans la prière ou le soutien.
              </p>
            </div>
            <Link href="/mission-madagascar" className="btn-primary shrink-0">
              Découvrir la mission
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
