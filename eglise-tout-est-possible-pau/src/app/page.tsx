import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { QuickLinks } from "@/components/home/QuickLinks";
import { Statement } from "@/components/home/Statement";
import { LatestMessage } from "@/components/home/LatestMessage";
import { Marquee } from "@/components/ui/Marquee";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonyCarousel } from "@/components/home/TestimonyCarousel";
import { Countdown } from "@/components/ui/Countdown";
import { home, meetings, testimonies, settings } from "@/lib/content";

export default function HomePage() {
  const sunday = meetings.items.find((m) => m.highlight) ?? meetings.items[0];

  return (
    <>
      <Hero />

      {/* Bande défilante — l'énergie dès la sortie du hero */}
      <Marquee items={home.marquee.band} />

      {/* Trois portes d'entrée */}
      <QuickLinks />

      {/* Déclaration géante révélée au scroll */}
      <Statement />

      {/* Mission : Annoncer. Restaurer. Équiper. Envoyer. */}
      <Section tone="dark">
        <div className="wrap">
          <Reveal>
            <p className="kicker">{home.pillars.kicker}</p>
            <h2 className="display-2 mt-4 max-w-4xl">{home.pillars.title}</h2>
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-cream/10 sm:grid-cols-2 lg:grid-cols-4">
            {home.pillars.items.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.08} className="h-full">
                <div className="group h-full bg-night p-8 transition-colors duration-500 ease-smooth hover:bg-night-soft sm:p-10">
                  <span className="text-sm font-extrabold text-pulse">0{i + 1}</span>
                  <h3 className="mt-4 font-display text-3xl uppercase leading-none">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-cream/65">{pillar.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Rendez-vous du dimanche */}
      <Section tone="leaf">
        <div className="wrap grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="kicker text-night/60">{home.meetings.kicker}</p>
            <h2 className="display-2 mt-4">{home.meetings.title}</h2>
            <p className="lead mt-6 max-w-xl text-night/75">{home.meetings.text}</p>
            <Link href="/reunions" className="btn-dark mt-10">
              {home.meetings.cta}
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-3xl bg-night p-10 text-cream shadow-[0_30px_80px_rgba(18,18,18,0.35)] sm:p-12">
              <p className="kicker">{sunday.day}</p>
              <p className="mt-4 font-display text-7xl uppercase leading-none text-pulse sm:text-8xl">
                {sunday.time}
              </p>
              <p className="mt-5 text-lg font-bold">{sunday.title}</p>
              <p className="mt-3 leading-relaxed text-cream/65">{sunday.description}</p>
              <p className="mt-6 border-t border-cream/10 pt-5 text-sm text-cream/60">
                {settings.address.venue} — {settings.address.postalCode} {settings.address.city}
              </p>
              <div className="mt-6">
                <Countdown />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Des vies transformées */}
      <Section tone="dark">
        <div className="wrap">
          <Reveal>
            <p className="kicker">{home.testimonies.kicker}</p>
            <h2 className="display-2 mt-4 max-w-3xl">{home.testimonies.title}</h2>
          </Reveal>
          <div className="mt-14">
            <Reveal delay={0.1}>
              <TestimonyCarousel items={testimonies.items} />
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Link href="/temoignages" className="btn-ghost-dark mt-10">
              {home.testimonies.cta}
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Le dernier message */}
      <LatestMessage />

      {/* Marquee contour — la mission en très grand */}
      <Marquee items={home.marquee.outline} variant="outline" />

      {/* Bandeau première visite */}
      <Section tone="dark" className="grain overflow-hidden">
        <div className="glow-leaf absolute -bottom-40 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2" aria-hidden />
        <div className="wrap relative text-center">
          <Reveal>
            <h2 className="display-1 text-balance">{home.firstVisitBanner.title}</h2>
            <p className="lead mx-auto mt-6 max-w-2xl text-cream/75">{home.firstVisitBanner.text}</p>
            <Link href="/premiere-visite" className="btn-primary mt-10">
              {home.firstVisitBanner.cta}
            </Link>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
