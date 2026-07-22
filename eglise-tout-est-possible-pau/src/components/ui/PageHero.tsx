import { Reveal } from "@/components/ui/Reveal";
import type { PageHero as PageHeroType } from "@/lib/types";

// En-tête des pages intérieures : grande typographie, beaucoup d'air.
export function PageHero({ hero, tone = "dark" }: { hero: PageHeroType; tone?: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <div className={`${dark ? "bg-night text-cream" : "bg-cream text-night"} relative overflow-hidden`}>
      {dark && <div className="glow-leaf absolute -top-40 right-0 h-[36rem] w-[36rem]" aria-hidden />}
      <div className="wrap relative pb-20 pt-40 sm:pb-28 sm:pt-48">
        <Reveal>
          <p className="kicker">{hero.kicker}</p>
          <h1 className="display-2 mt-5 max-w-4xl text-balance">{hero.title}</h1>
          <p className={`lead mt-7 max-w-2xl ${dark ? "text-cream/75" : "text-night/70"}`}>
            {hero.subtitle}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
