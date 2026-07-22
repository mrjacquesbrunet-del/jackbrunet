import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
import { about } from "@/lib/content";

export const metadata: Metadata = {
  title: "À propos — notre histoire et nos valeurs",
  description:
    "Découvre l'Église Tout est possible Pau : notre histoire, nos valeurs et ce que nous croyons. Une famille, pas une institution.",
  alternates: { canonical: "/a-propos" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero hero={about.hero} />

      <Section tone="light">
        <div className="wrap grid items-start gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <h2 className="display-3">{about.story.title}</h2>
            {about.story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="lead mt-6 text-night/70">
                {paragraph}
              </p>
            ))}
          </Reveal>
          <Reveal delay={0.15}>
            <Media alt="Moment de vie de l'église" ratio="aspect-[4/5]" variant="leaf" />
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <div className="wrap">
          <Reveal>
            <h2 className="display-3">{about.values.title}</h2>
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {about.values.items.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.08}>
                <div className="group h-full rounded-3xl bg-night-soft p-10 transition-shadow duration-500 ease-smooth hover:shadow-[0_0_50px_rgba(163,205,134,0.12)]">
                  <h3 className="text-2xl font-extrabold tracking-tight text-leaf transition-colors duration-300 group-hover:text-pulse">
                    {value.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-cream/70">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="light">
        <div className="wrap max-w-4xl">
          <Reveal>
            <h2 className="display-3">{about.beliefs.title}</h2>
            <p className="lead mt-6 text-night/70">{about.beliefs.text}</p>
            <Link href="/vision" className="btn-dark mt-10">
              Découvrir notre vision
            </Link>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
