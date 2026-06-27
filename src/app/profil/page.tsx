import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ProfileView } from "@/components/community/ProfileView";

export const metadata: Metadata = {
  title: "Mon profil",
  description:
    "Ton profil : tes sujets de prière, ton carnet, tes versets surlignés et enregistrés, synchronisés sur tous tes appareils.",
};

export default function ProfilPage() {
  return (
    <>
      <PageHero tone="creme"
        eyebrow="Mon profil"
        title={
          <>
            Mon <span className="text-gradient">profil</span>
          </>
        }
        description="Retrouve tes sujets de prière, ton carnet et tes versets, partout où tu te connectes."
      />
      <ProfileView />
    </>
  );
}
