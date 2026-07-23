"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
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
            {team.members.map((member, i) => {
              const flashy = i === 0;
              return (
                <li
                  key={member.name + member.role}
                  className="w-[82%] max-w-[22rem] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
                >
                  <article
                    className={`flex h-full flex-col overflow-hidden rounded-3xl ${
                      flashy ? "bg-pulse" : "border border-night/10 bg-[#FFFFFC]"
                    }`}
                  >
                    {/* Zone haute : pastilles + badge logo + nom + bio */}
                    <div className="p-6 sm:p-7">
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                            flashy ? "bg-cream text-night" : "bg-night/5 text-night"
                          }`}
                        >
                          {member.role}
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-night">
                          <Image src="/logo-blanc.png" alt="" width={18} height={18} className="h-4 w-auto object-contain" />
                        </span>
                      </div>
                      <h3 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight">
                        {member.name}
                      </h3>
                      <p className={`mt-3 text-sm leading-relaxed ${flashy ? "text-night/75" : "text-night/60"}`}>
                        {member.bio}
                      </p>
                    </div>

                    {/* Photo avec bouton pilule, comme la référence */}
                    <div className="relative mt-auto">
                      <Media
                        src={member.photo || undefined}
                        alt={`Portrait de ${member.name}`}
                        ratio="aspect-[4/5]"
                        variant="portrait"
                        sizes="(max-width: 640px) 82vw, 31vw"
                        className="!rounded-none"
                      />
                      <Link
                        href="/equipe"
                        className="group absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-night/70 py-2 pl-4 pr-2 text-xs font-bold text-cream backdrop-blur transition-colors duration-300 hover:bg-night"
                      >
                        Faire connaissance
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-night transition-colors duration-300 group-hover:bg-pulse">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2" aria-hidden>
                            <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
