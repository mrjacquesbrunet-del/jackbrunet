import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { TestimonyCarousel } from "@/components/home/TestimonyCarousel";
import { testimonies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Témoignages — des vies transformées",
  description:
    "L'espérance change des vies. Découvre les histoires vraies de personnes transformées à l'Église Tout est possible Pau.",
  alternates: { canonical: "/temoignages" },
};

export default function TestimoniesPage() {
  return (
    <>
      <PageHero hero={testimonies.hero} />

      <Section tone="dark" className="!pt-0">
        <div className="wrap">
          <Reveal>
            <TestimonyCarousel items={testimonies.items} />
          </Reveal>
        </div>
      </Section>

      <Marquee items={["Des vies transformées", "L'espérance change des vies"]} variant="outline" />

      <Section tone="leaf">
        <div className="wrap text-center">
          <Reveal>
            <h2 className="display-2 text-balance">{testimonies.share.title}</h2>
            <p className="lead mx-auto mt-6 max-w-2xl text-night/75">{testimonies.share.text}</p>
            <Link href="/contact" className="btn-dark mt-10">
              {testimonies.share.cta}
            </Link>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
