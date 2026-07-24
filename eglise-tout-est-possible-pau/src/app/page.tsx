import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { QuickLinks } from "@/components/home/QuickLinks";
import { PhotoMarquee } from "@/components/home/PhotoMarquee";
import { Statement } from "@/components/home/Statement";
import { LatestMessage } from "@/components/home/LatestMessage";
import { Marquee } from "@/components/ui/Marquee";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AgendaCards } from "@/components/home/AgendaCards";
import { TeamSlider } from "@/components/home/TeamSlider";
import { TestimonyCarousel } from "@/components/home/TestimonyCarousel";
import { Title3D } from "@/components/ui/Title3D";
import { withScript } from "@/lib/script";
import { home, testimonies } from "@/lib/content";

export default function HomePage() {

  return (
    <>
      <Hero />

      {/* Bandeau photos des membres — humain, dès la sortie du hero */}
      <PhotoMarquee />

      {/* Trois portes d'entrée */}
      <QuickLinks />

      {/* Déclaration géante révélée au scroll */}
      <Statement />

      {/* Mission : Annoncer. Restaurer. Équiper. Envoyer. — section claire,
          rapprochée du bouton de la déclaration */}
      <Section tone="light" className="!pt-8 sm:!pt-10">
        <div className="wrap">
          <Reveal>
            <p className="kicker text-leaf-deep">{home.pillars.kicker}</p>
            <Title3D>
              <h2 className="display-2 mt-4 max-w-4xl">{home.pillars.title}</h2>
            </Title3D>
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-night/10 bg-night/10 sm:grid-cols-2 lg:grid-cols-4">
            {home.pillars.items.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.08} className="h-full">
                <div className="group h-full bg-cream p-8 transition-colors duration-500 ease-smooth hover:bg-leaf-faint sm:p-10">
                  <span className="text-sm font-extrabold text-leaf-deep">0{i + 1}</span>
                  <h3 className="mt-4 wordmark text-3xl leading-none">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-night/70">{pillar.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Agenda — remplace le rendez-vous du dimanche, en clair */}
      <Section tone="light" className="!bg-leaf-faint">
        <div className="wrap">
          <Reveal>
            <Title3D>
              <h2 className="display-2">Agenda</h2>
            </Title3D>
            <Link href="/agenda" className="btn-dark mt-7">
              Accéder à l&apos;agenda
            </Link>
          </Reveal>
          <div className="mt-14">
            <AgendaCards limit={3} />
          </div>
        </div>
      </Section>

      {/* Des vies transformées — section claire, cartes sombres en contraste */}
      <Section tone="light" className="!bg-leaf-faint">
        <div className="wrap">
          <Reveal>
            <p className="kicker text-leaf-deep">{home.testimonies.kicker}</p>
            <Title3D>
              <h2 className="display-2 mt-4 max-w-3xl">{withScript(home.testimonies.title)}</h2>
            </Title3D>
          </Reveal>
          <div className="mt-14">
            <Reveal delay={0.1}>
              <TestimonyCarousel items={testimonies.items} tone="light" />
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Link href="/temoignages" className="btn-dark mt-10">
              {home.testimonies.cta}
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Équipe pastorale — cartes défilantes style référence */}
      <TeamSlider />

      {/* Le dernier message */}
      <LatestMessage />

      {/* Marquee contour — la mission en très grand */}
      <Marquee items={home.marquee.outline} variant="outline" />

      {/* Bandeau première visite */}
      <Section tone="dark" className="grain overflow-hidden">
        <div className="glow-leaf absolute -bottom-40 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2" aria-hidden />
        <div className="wrap relative text-center">
          <Reveal>
            <Title3D>
              <h2 className="display-1 script-stack text-3d text-balance">
                {withScript(home.firstVisitBanner.title)}
              </h2>
            </Title3D>
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
