import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { EventsView } from "@/components/home/EventsView";
import { getEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "Actualité",
  description:
    "Toute l'actualité de Jack Brunet: lives en ligne, événements en présentiel, et grandes annonces (livre, application, missions). L'agenda des 3 prochains mois.",
};

export default function ActualitePage() {
  const events = getEvents();
  return (
    <>
      <PageHero
        eyebrow="Actualité"
        title={
          <>
            Mon <span className="text-gradient">actualité</span> & mon agenda
          </>
        }
        description="Retrouve mes lives, mes déplacements en présentiel et mes grandes annonces. Tout, en un clic."
      />
      <EventsView events={events} />
    </>
  );
}
