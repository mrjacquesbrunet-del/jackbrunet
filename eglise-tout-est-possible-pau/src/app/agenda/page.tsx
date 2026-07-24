import type { Metadata } from "next";
import Link from "next/link";
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

      {/* Pour ne rien manquer : pont vers les annonces par mail */}
      <Section tone="dark" className="grain overflow-hidden">
        <div className="wrap text-center">
          <h2 className="display-3 text-balance">Ne manque aucun rendez-vous.</h2>
          <p className="lead mx-auto mt-5 max-w-xl text-cream/75">
            Reçois les annonces de la semaine directement par mail.
          </p>
          <Link href="/annonces" className="btn-primary mt-9">
            Recevoir les annonces
          </Link>
        </div>
      </Section>
    </>
  );
}
