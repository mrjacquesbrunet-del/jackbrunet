import type { Metadata } from "next";
import { Suspense } from "react";
import { MemberView } from "@/components/community/MemberView";

export const metadata: Metadata = {
  title: "Profil d'un membre",
  description:
    "Le profil d'un membre de la communauté de prière: sa bio, ses versets et ses sujets de prière.",
};

export default function MembrePage() {
  return (
    <Suspense fallback={<p className="container-x py-16 pt-32 text-night-900/50">Chargement…</p>}>
      <MemberView />
    </Suspense>
  );
}
