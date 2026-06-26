import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CommunityView } from "@/components/community/CommunityView";

export const metadata: Metadata = {
  title: "Communauté de prière",
  description:
    "Rejoins la communauté de prière de Jack Brunet : partage tes sujets de prière, prie pour les autres, encourage-toi mutuellement. Connexion par Google ou lien magique.",
};

export default function CommunautePage() {
  return (
    <>
      <PageHero
        eyebrow="Communauté"
        title={
          <>
            Le mur de <span className="text-gradient">prière</span>
          </>
        }
        description="Partage tes sujets de prière, prie pour les autres et encourage la famille. Ensemble, portons-nous les uns les autres devant Dieu."
      />
      <CommunityView />
    </>
  );
}
