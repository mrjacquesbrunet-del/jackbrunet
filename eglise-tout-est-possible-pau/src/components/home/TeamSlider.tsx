"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { team } from "@/lib/content";
import { t } from "@/i18n";

// Équipe pastorale sur l'accueil — style « cartes programmes » de la
// référence : zone colorée avec pastilles + grand nom + bio, photo en
// dessous avec bouton pilule. Défilement horizontal, flèches en tête.
// Les profils se gèrent dans le CMS (rubrique Équipe pastorale).
export function TeamSlider() {
  const track = useRef<HTMLUListElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section className="bg-cream py-24 text-night sm:py-32">
      <div className="wrap">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="kicker text-leaf-deep">Équipe pastorale</p>
              <h2 className="display-2 mt-4 max-w-3xl">Une équipe là pour te servir.</h2>
            </div>
            <div className="hidden shrink-0 gap-3 sm:flex">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label={t("a11y.previous")}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-night text-cream transition-all duration-300 ease-smooth hover:bg-night-mist hover:text-pulse"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label={t("a11y.next")}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-night text-cream transition-all duration-300 ease-smooth hover:bg-night-mist hover:text-pulse"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ul
            ref={track}
            className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {team.members.map((member) => (
              <li
                key={member.name + member.role}
                className="w-[82%] max-w-[22rem] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
              >
                {/* Carte « profil » : photo plein cadre, texte par-dessus
                    sur un dégradé sombre — style référence */}
                <article className="group relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-night">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={`Portrait de ${member.name}`}
                      fill
                      sizes="(max-width: 640px) 82vw, 31vw"
                      className="object-cover object-top transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(140% 100% at 50% 0%, rgba(163,205,134,0.45) 0%, rgba(34,35,32,0.9) 60%, #121212 100%), #191A17",
                      }}
                      aria-hidden
                    />
                  )}

                  {/* Dégradé de lisibilité */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-night/95 via-night/60 to-transparent"
                    aria-hidden
                  />

                  {/* Texte sur la photo */}
                  <div className="absolute inset-x-0 bottom-0 p-6 text-cream sm:p-7">
                    <h3 className="flex items-center gap-2.5 text-2xl font-extrabold leading-tight tracking-tight">
                      {member.name}
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pulse text-night"
                        aria-hidden
                      >
                        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-[3]">
                          <path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </h3>
                    <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-kicker text-pulse">
                      {member.role}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-cream/75">{member.bio}</p>
                    <Link
                      href="/equipe"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-xs font-bold text-night transition-colors duration-300 hover:bg-pulse"
                    >
                      Faire connaissance
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2" aria-hidden>
                        <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
