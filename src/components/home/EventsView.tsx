"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import type { AgendaEvent } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  live: "En ligne",
  presentiel: "Présentiel",
  annonce: "Annonce",
};

function isExternal(href?: string) {
  return!!href && /^https?:\/\//i.test(href);
}

function Cta({ link, label }: { link?: string; label?: string }) {
  if (!link) return null;
  const text = label || "En savoir plus";
  if (isExternal(link)) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 inline-flex">
        {text}
      </a>
    );
  }
  return (
    <Link href={link} className="btn-primary mt-4 inline-flex">
      {text}
    </Link>
  );
}

export function EventsView({ events }: { events: AgendaEvent[] }) {
  const [filter, setFilter] = useState<"tout" | "live" | "presentiel">("tout");

  const annonces = events.filter((e) => e.type === "annonce");

  const agenda = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const horizon = new Date(today);
    horizon.setMonth(horizon.getMonth() + 3);

    return events
.filter((e) => e.type!== "annonce" && e.date)
.map((e) => ({ e, d: new Date(`${e.date}T${e.time || "00:00"}`) }))
.filter(({ d }) => d >= today && d <= horizon)
.filter(({ e }) => filter === "tout" || e.type === filter)
.sort((a, b) => a.d.getTime() - b.d.getTime());
  }, [events, filter]);

  // Groupe par mois (ex. "Juillet 2026")
  const groups: { label: string; items: { e: AgendaEvent; d: Date }[] }[] = [];
  for (const item of agenda) {
    const label = item.d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    let g = groups.find((x) => x.label === label);
    if (!g) {
      g = { label, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }

  return (
    <>
      {/* Annonces importantes */}
      {annonces.length > 0? (
        <section className="container-x py-12">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            À ne pas <span className="text-gradient">manquer</span>
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {annonces.map((e, i) => (
              <Reveal key={i} from="up" delay={i * 0.06}>
                <div className="dark-ctx bg-topo-dark relative flex h-full flex-col overflow-hidden rounded-3xl p-6 shadow-card">
                  <div className="blob -right-10 -top-8 h-32 w-32 bg-dawn-400/20" />
                  <div className="relative flex flex-1 flex-col">
                    {e.badge? (
                      <span className="inline-flex w-fit items-center rounded-full border border-dawn-400/30 bg-dawn-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-dawn-300">
                        {e.badge}
                      </span>
                    ): null}
                    <h3 className="mt-3 font-display text-xl font-bold">{e.title}</h3>
                    {e.description? (
                      <p className="mt-2 flex-1 text-sm text-cream/70">{e.description}</p>
                    ): null}
                    <Cta link={e.link} label={e.linkLabel} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ): null}

      {/* Agenda, 3 prochains mois */}
      <section className="container-x py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            Agenda, <span className="text-gradient">3 prochains mois</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["tout", "Tout"],
                ["live", "En ligne"],
                ["presentiel", "Présentiel"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  filter === key
? "bg-night-900 text-cream"
: "border border-night-900/15 text-night-900/70 hover:border-night-900/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {groups.length === 0? (
          <p className="mt-8 text-night-900/55">
            Aucun événement programmé pour le moment. Reviens bientôt, ou laisse ton email
            plus bas pour être prévenu(e) dès qu'une date est annoncée.
          </p>
        ): (
          <div className="mt-8 space-y-10">
            {groups.map((g) => (
              <div key={g.label}>
                <h3 className="font-display text-lg font-bold capitalize text-night-900/70">
                  {g.label}
                </h3>
                <ul className="mt-4 space-y-4">
                  {g.items.map(({ e, d }, i) => (
                    <Reveal key={i} from="up">
                      <li className="flex flex-col gap-4 rounded-3xl border border-night-900/10 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
                        {/* Bloc date */}
                        <div className="flex shrink-0 items-center gap-4 sm:w-40">
                          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-dawn-400 to-spirit-500 text-night-950">
                            <div className="text-center leading-none">
                              <span className="block text-2xl font-extrabold">{d.getDate()}</span>
                              <span className="block text-[10px] font-bold uppercase">
                                {d.toLocaleDateString("fr-FR", { month: "short" })}
                              </span>
                            </div>
                          </div>
                          {e.time? (
                            <span className="font-display text-lg font-bold text-night-900 sm:hidden">
                              {e.time}
                            </span>
                          ): null}
                        </div>

                        {/* Contenu */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                                e.type === "live"
? "bg-spirit-500/15 text-spirit-700"
: "bg-dawn-400/20 text-spirit-700"
                              }`}
                            >
                              {TYPE_LABEL[e.type]}
                            </span>
                            {e.time? (
                              <span className="hidden text-sm font-semibold text-night-900/70 sm:inline">
                                {e.time}
                              </span>
                            ): null}
                            {e.location? (
                              <span className="text-sm text-night-900/55">· {e.location}</span>
                            ): null}
                          </div>
                          <h4 className="mt-1.5 font-display text-xl font-bold">{e.title}</h4>
                          {e.description? (
                            <p className="mt-1 text-sm text-night-900/70">{e.description}</p>
                          ): null}
                        </div>

                        {/* Lien 1 clic */}
                        {e.link? (
                          isExternal(e.link)? (
                            <a
                              href={e.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary shrink-0 sm:self-center"
                            >
                              {e.linkLabel || "Y participer"}
                            </a>
                          ): (
                            <Link href={e.link} className="btn-primary shrink-0 sm:self-center">
                              {e.linkLabel || "En savoir plus"}
                            </Link>
                          )
                        ): null}
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Captation email */}
      <section className="container-x py-12">
        <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-4xl p-8 text-center sm:p-12">
          <div className="blob -right-16 -top-10 h-52 w-52 bg-spirit-500/20" />
          <div className="relative mx-auto max-w-xl">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Ne rate <span className="text-gradient">aucune date</span>
            </h2>
            <p className="mt-3 text-cream/70">
              Reçois les prochains lives, déplacements et grandes annonces directement par email.
            </p>
            <div className="mt-6">
              <NewsletterForm
                source="actualite"
                cta="Me tenir au courant"
                note="Gratuit. Désinscription en un clic."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
