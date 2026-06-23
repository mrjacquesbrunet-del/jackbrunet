import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { getAbout } from "@/lib/content";
import { asset } from "@/lib/asset";

/** Présentation de Jack et du ministère — placée avant la section dons. */
export function AboutFounder() {
  const about = getAbout();
  const photo = asset(about.photo);

  return (
    <section id="qui-suis-je" className="container-x scroll-mt-24 py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Photo */}
        <Reveal from="left">
          <div className="relative mx-auto w-full max-w-md">
            <div className="blob -left-8 -top-8 h-48 w-48 bg-dawn-400/40" />
            <div className="blob -bottom-10 -right-6 h-44 w-44 bg-spirit-400/30" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-5xl border border-night-900/10 bg-night-800 shadow-card">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={about.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="dark-ctx bg-topo-dark flex h-full w-full items-center justify-center p-8 text-center">
                  <div>
                    <span className="font-display text-6xl">📸</span>
                    <p className="mt-4 text-sm text-cream/70">
                      Ajoute ta photo dans l'admin
                      <br />
                      (rubrique « Qui suis-je »)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Étiquette nom */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-dawn-400 px-5 py-2 text-center shadow-glow">
              <span className="font-display text-sm font-bold uppercase tracking-tight text-night-950">
                {about.title}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Texte */}
        <Reveal from="right" delay={0.1}>
          <SectionHeader
            eyebrow={about.eyebrow}
            title={
              <>
                Rencontre <span className="text-gradient">{about.title}</span>
              </>
            }
          />
          {about.role ? (
            <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-spirit-600">
              {about.role}
            </p>
          ) : null}

          <div className="mt-5 space-y-4">
            {about.paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-night-900/75">
                {p}
              </p>
            ))}
          </div>

          {about.points?.length ? (
            <ul className="mt-6 space-y-2.5">
              {about.points.map((pt) => (
                <li key={pt} className="flex items-center gap-3 text-night-900/80">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-dawn-400/25 text-xs text-spirit-700">
                    ✓
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#soutenir" className="btn-primary">
              Soutenir la mission
            </Link>
            <Link href="/videos" className="btn-ghost">
              Découvrir mes vidéos
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
