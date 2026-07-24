import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { team } from "@/lib/content";

export const metadata: Metadata = {
  title: "Équipe pastorale",
  description:
    "Rencontre l'équipe pastorale de l'Église Tout est possible Pau — des visages avant des fonctions, au service de la famille de l'église.",
  alternates: { canonical: "/equipe" },
};

export default function TeamPage() {
  return (
    <>
      <PageHero hero={team.hero} />

      <Section tone="light">
        <div className="wrap">
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {team.members.map((member, i) => (
              <Reveal key={member.name + member.role} delay={i * 0.07}>
                {/* Carte « profil » : photo plein cadre, texte par-dessus
                    sur un dégradé sombre — style référence */}
                <article className="group relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-night">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={`Portrait de ${member.name}, ${member.role}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
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
                  <div
                    className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-night/95 via-night/60 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                    <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
                      {member.name}
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pulse text-night"
                        aria-hidden
                      >
                        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-[3]">
                          <path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </h2>
                    <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-kicker text-pulse">
                      {member.role}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-cream/75">{member.bio}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <div className="wrap text-center">
          <Reveal>
            <h2 className="display-2 text-balance">{team.join.title}</h2>
            <p className="lead mx-auto mt-6 max-w-2xl text-cream/75">{team.join.text}</p>
            <Link href="/contact" className="btn-primary mt-10">
              {team.join.cta}
            </Link>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
