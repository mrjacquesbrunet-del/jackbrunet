import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/PageHero";
import { MemberView } from "@/components/community/MemberView";

export const metadata: Metadata = {
  title: "Profil d'un membre",
  description: "Le profil d'un membre de la communauté de prière : sa bio, ses versets et ses sujets de prière.",
};

export default function MembrePage() {
  return (
    <>
      <PageHero
        eyebrow="Communauté"
        title={
          <>
            Profil d'un <span className="text-gradient">membre</span>
          </>
        }
        description="Découvre sa bio, ses versets préférés et ses sujets de prière. Abonne-toi pour le soutenir."
      />
      <Suspense fallback={<p className="container-x py-16 text-night-900/50">Chargement…</p>}>
        <MemberView />
      </Suspense>
    </>
  );
}
