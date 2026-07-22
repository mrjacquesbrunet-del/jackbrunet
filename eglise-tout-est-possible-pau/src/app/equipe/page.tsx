import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
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
                <article className="group">
                  <Media
                    src={member.photo || undefined}
                    alt={`Portrait de ${member.name}, ${member.role}`}
                    ratio="aspect-[3/4]"
                    variant="portrait"
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="transition-transform duration-700 ease-smooth group-hover:scale-[1.02]"
                  />
                  <h2 className="mt-6 text-xl font-extrabold tracking-tight">{member.name}</h2>
                  <p className="mt-1 text-sm font-bold uppercase tracking-kicker text-leaf-deep">
                    {member.role}
                  </p>
                  <p className="mt-3 leading-relaxed text-night/70">{member.bio}</p>
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
