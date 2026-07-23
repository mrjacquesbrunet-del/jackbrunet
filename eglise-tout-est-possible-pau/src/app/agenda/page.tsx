import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { AgendaCards } from "@/components/home/AgendaCards";
import agenda from "../../../content/agenda.json";

export const metadata: Metadata = {
  title: "Agenda — les prochains rendez-vous",
  description:
    "L'agenda de l'Église Tout est possible Pau : célébrations, soirées, baptêmes, sorties. Tous les prochains rendez-vous.",
  alternates: { canonical: "/agenda" },
};

export default function AgendaPage() {
  return (
    <>
      <PageHero hero={agenda.hero} />

      <Section tone="light">
        <div className="wrap">
          <AgendaCards />
        </div>
      </Section>
    </>
  );
}
