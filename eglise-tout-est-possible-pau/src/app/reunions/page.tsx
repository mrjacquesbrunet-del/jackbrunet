import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Countdown } from "@/components/ui/Countdown";
import { meetings, settings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Nos réunions — horaires et infos pratiques",
  description:
    "Célébration du dimanche à 10h30 à Pau, soirée de prière, groupes de maison : retrouve tous les horaires et infos pratiques de l'Église Tout est possible Pau.",
  alternates: { canonical: "/reunions" },
};

export default function MeetingsPage() {
  return (
    <>
      <PageHero hero={meetings.hero} />

      <Section tone="light">
        <div className="wrap space-y-8">
          {meetings.items.map((meeting, i) => (
            <Reveal key={meeting.title} delay={i * 0.05}>
              <article
                className={`grid gap-8 rounded-3xl p-10 sm:p-12 lg:grid-cols-[1fr_2fr] lg:gap-14 ${
                  meeting.highlight
                    ? "bg-night text-cream shadow-[0_30px_80px_rgba(18,18,18,0.25)]"
                    : "border border-night/10"
                }`}
              >
                <div>
                  <p className={`kicker ${meeting.highlight ? "" : "text-leaf-deep"}`}>
                    {meeting.day}
                  </p>
                  <p className="mt-3 text-5xl font-extrabold tracking-tight sm:text-6xl">
                    {meeting.time}
                  </p>
                  <p className={`mt-2 text-sm ${meeting.highlight ? "text-cream/60" : "text-night/50"}`}>
                    {meeting.duration}
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {meeting.title}
                  </h2>
                  <p className={`lead mt-4 ${meeting.highlight ? "text-cream/75" : "text-night/70"}`}>
                    {meeting.description}
                  </p>
                  <p
                    className={`mt-5 text-sm font-semibold ${
                      meeting.highlight ? "text-leaf" : "text-leaf-deep"
                    }`}
                  >
                    {meeting.audience}
                  </p>
                  {meeting.highlight && (
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <Link href="/premiere-visite" className="btn-primary">
                        Prépare ta première visite
                      </Link>
                      <Countdown />
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="dark">
        <div className="wrap grid gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <h2 className="display-3">{meetings.practical.title}</h2>
            <dl className="mt-10 divide-y divide-cream/10">
              {meetings.practical.items.map((info) => (
                <div key={info.label} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="text-sm font-bold uppercase tracking-kicker text-leaf">
                    {info.label}
                  </dt>
                  <dd className="text-cream/75">{info.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex h-full flex-col justify-center rounded-3xl bg-night-soft p-10 sm:p-12">
              <h3 className="text-2xl font-extrabold tracking-tight">Une question avant de venir ?</h3>
              <p className="mt-4 leading-relaxed text-cream/70">
                Écris-nous, on te répond personnellement. Et si tu préfères, on peut même
                t&apos;accueillir à l&apos;entrée le jour de ta première visite.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary">
                  Nous écrire
                </Link>
                <a
                  href={settings.address.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost-dark"
                >
                  Voir sur la carte
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
