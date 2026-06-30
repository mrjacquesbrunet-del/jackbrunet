import type { Metadata } from "next";
import { ProfileView } from "@/components/community/ProfileView";

export const metadata: Metadata = {
  title: "Mon profil",
  description:
    "Ton profil : tes sujets de prière, ton carnet, tes versets surlignés et enregistrés, synchronisés sur tous tes appareils.",
};

export default function ProfilPage() {
  return <ProfileView />;
}
