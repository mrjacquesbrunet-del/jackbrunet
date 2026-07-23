import Image from "next/image";
import { home } from "@/lib/content";

// Bandeau vert flashy avec photos carrées des membres qui défilent —
// pour humaniser dès la sortie du hero. Les photos se gèrent dans le
// CMS (Accueil → Bandes défilantes → Photos) ; tant qu'il n'y en a
// pas, des vignettes de substitution élégantes tiennent la place.
const FALLBACKS = [
  "radial-gradient(120% 120% at 20% 10%, rgba(18,18,18,0.25) 0%, rgba(18,18,18,0.55) 100%), #7FAE63",
  "radial-gradient(140% 100% at 50% 0%, rgba(163,205,134,0.9) 0%, rgba(18,18,18,0.75) 100%), #191A17",
  "radial-gradient(120% 140% at 80% 0%, rgba(252,254,233,0.5) 0%, rgba(18,18,18,0.6) 100%), #A3CD86",
  "radial-gradient(100% 100% at 50% 100%, rgba(18,18,18,0.7) 0%, rgba(127,174,99,0.9) 100%), #121212",
  "radial-gradient(130% 110% at 30% 90%, rgba(163,205,134,0.8) 0%, rgba(34,35,32,0.85) 100%), #222320",
  "radial-gradient(110% 130% at 70% 20%, rgba(18,18,18,0.35) 0%, rgba(18,18,18,0.65) 100%), #A3CD86",
];

export function PhotoMarquee() {
  const photos: string[] = ((home.marquee as { photos?: string[] }).photos ?? []).filter(Boolean);
  const tiles = photos.length > 0 ? photos : FALLBACKS;
  // Boucle continue : la séquence est répétée pour couvrir la largeur.
  const sequence = [...tiles, ...tiles, ...tiles];

  return (
    <div className="relative overflow-hidden bg-pulse py-6" aria-hidden>
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-5 pr-5">
            {sequence.map((tile, i) => (
              <div
                key={`${copy}-${i}`}
                className={`relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-night/15 shadow-[0_10px_24px_rgba(18,18,18,0.25)] sm:h-32 sm:w-32 ${
                  i % 2 === 0 ? "rotate-2" : "-rotate-2"
                }`}
              >
                {photos.length > 0 ? (
                  <Image
                    src={tile}
                    alt=""
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full" style={{ background: tile }} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
