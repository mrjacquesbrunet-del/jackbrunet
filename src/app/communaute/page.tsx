import type { Metadata } from "next";
import { CommunityView } from "@/components/community/CommunityView";

export const metadata: Metadata = {
  title: "Mur de prière",
  description:
    "Le mur de prière de Jack Brunet : un réseau social de prière. Partage tes sujets, abonne-toi à d'autres croyants, priez et encouragez-vous les uns les autres. Connexion par Google ou email.",
};

export default function CommunautePage() {
  return <CommunityView />;
}
