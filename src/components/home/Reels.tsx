import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { ShortsMarquee } from "@/components/home/ShortsMarquee";
import { getShorts } from "@/lib/content";
import { youtube } from "@/config/site";

/** Accueil : aperçu des derniers Shorts (bande défilante) — le reste sur /videos. */
export function Reels() {
  const all = getShorts();
  const preview = all.slice(0, 10); // les plus récents en avant
  const hasShorts = preview.length > 0;
  const count = all.length;
  const floorTxt = count >= 100 ? `${Math.floor(count / 100) * 100}+` : `${count}`;
  const description =
    count > 12
      ? `Explore mes ${floorTxt} Shorts : clique et scrolle d'une vidéo à l'autre, sans quitter le site.`
      : "Mes derniers Shorts. Clique pour les regarder en plein écran et scrolle d'une vidéo à l'autre.";

  return (
    <section id="shorts" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Vidéos courtes"
              title={
                <>
                  Une dose de foi <span className="text-gradient">en 1 clic</span>
                </>
              }
              description={description}
            />
            <Link href="/videos" className="btn-ghost shrink-0">
              Tout voir
            </Link>
          </div>
        </Reveal>
      </div>

      {hasShorts ? (
        <Reveal delay={0.05}>
          <ShortsMarquee preview={preview} all={all} />
        </Reveal>
      ) : (
        <div className="container-x">
          <Reveal delay={0.05}>
            <div className="dark-ctx bg-topo-dark relative mt-10 overflow-hidden rounded-4xl border border-white/10 p-8 text-center sm:p-12">
              <div className="blob -right-10 -top-10 h-48 w-48 bg-dawn-400/30" />
              <div className="relative mx-auto max-w-xl">
                <span className="eyebrow">Shorts</span>
                <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                  Mes Shorts arrivent ici
                </h3>
                <p className="mt-3 text-cream/70">
                  Active l'import automatique YouTube (ou ajoute-les dans l'admin).
                </p>
                <a
                  href={youtube.shortsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-7"
                >
                  Regarder les Shorts sur YouTube
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}
