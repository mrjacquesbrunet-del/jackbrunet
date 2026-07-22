import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
import { TestimonyCarousel } from "@/components/home/TestimonyCarousel";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import { home, meetings, testimonies, videos, settings } from "@/lib/content";
import { t } from "@/i18n";

export default function HomePage() {
  const sunday = meetings.items.find((m) => m.highlight) ?? meetings.items[0];
  const latestVideos = videos.slice(0, 3);

  return (
    <>
      <Hero />

      {/* Bienvenue à la maison — section claire, très aérée */}
      <Section tone="light">
        <div className="wrap grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="kicker text-leaf-deep">{home.welcome.kicker}</p>
            <h2 className="display-2 mt-5 text-balance">{home.welcome.title}</h2>
            {home.welcome.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="lead mt-6 text-night/70">
                {paragraph}
              </p>
            ))}
            <Link href="/a-propos" className="btn-dark mt-10">
              {home.welcome.cta}
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <Media alt="La famille de l'église réunie un dimanche" ratio="aspect-[4/5]" variant="leaf" />
          </Reveal>
        </div>
      </Section>

      {/* Mission : Annoncer. Restaurer. Équiper. Envoyer. */}
      <Section tone="dark">
        <div className="wrap">
          <Reveal>
            <p className="kicker">{home.pillars.kicker}</p>
            <h2 className="display-2 mt-5 max-w-3xl text-balance">{home.pillars.title}</h2>
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-cream/10 sm:grid-cols-2 lg:grid-cols-4">
            {home.pillars.items.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.08} className="h-full">
                <div className="group h-full bg-night p-8 transition-colors duration-500 ease-smooth hover:bg-night-soft sm:p-10">
                  <span className="text-sm font-bold text-leaf transition-colors duration-300 group-hover:text-pulse">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-tight">{pillar.title}</h3>
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
            <h2 className="display-2 mt-5 text-balance">{home.meetings.title}</h2>
            <p className="lead mt-6 max-w-xl text-night/75">{home.meetings.text}</p>
            <Link href="/reunions" className="btn-dark mt-10">
              {home.meetings.cta}
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-3xl bg-night p-10 text-cream shadow-[0_30px_80px_rgba(18,18,18,0.35)] sm:p-12">
              <p className="kicker">{sunday.day}</p>
              <p className="mt-4 text-6xl font-extrabold tracking-tight sm:text-7xl">{sunday.time}</p>
              <p className="mt-5 text-lg font-bold">{sunday.title}</p>
              <p className="mt-3 leading-relaxed text-cream/65">{sunday.description}</p>
              <p className="mt-6 border-t border-cream/10 pt-5 text-sm text-cream/60">
                {settings.address.venue} — {settings.address.postalCode} {settings.address.city}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Des vies transformées */}
      <Section tone="dark">
        <div className="wrap">
          <Reveal>
            <p className="kicker">{home.testimonies.kicker}</p>
            <h2 className="display-2 mt-5 max-w-3xl text-balance">{home.testimonies.title}</h2>
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

      {/* Derniers messages */}
      <Section tone="light">
        <div className="wrap">
          <Reveal>
            <p className="kicker text-leaf-deep">{home.messages.kicker}</p>
            <h2 className="display-2 mt-5 max-w-3xl text-balance">{home.messages.title}</h2>
            <p className="lead mt-6 max-w-xl text-night/70">{home.messages.text}</p>
          </Reveal>
          {latestVideos.length > 0 ? (
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {latestVideos.map((video, i) => (
                <Reveal key={video.id} delay={i * 0.08}>
                  <LiteYouTube videoId={video.id} title={video.title} />
                  <h3 className="mt-4 font-bold leading-snug">{video.title}</h3>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal delay={0.1}>
              <div className="mt-14 rounded-3xl border border-night/10 p-10 sm:p-14">
                <p className="text-xl font-bold">Les vidéos arrivent très bientôt.</p>
                <a
                  href={settings.youtube.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost-light mt-6"
                >
                  {t("common.watchOnYoutube")}
                </a>
              </div>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <Link href="/messages" className="btn-dark mt-12">
              {home.messages.cta}
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Bandeau première visite */}
      <Section tone="dark" className="grain overflow-hidden">
        <div className="glow-leaf absolute -bottom-40 left-1/2 h-[40rem] w-[60rem] -translate-x-1/2" aria-hidden />
        <div className="wrap relative text-center">
          <Reveal>
            <h2 className="display-2 text-balance">{home.firstVisitBanner.title}</h2>
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
