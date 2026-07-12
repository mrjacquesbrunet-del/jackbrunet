import type { Metadata } from "next";
import { Suspense } from "react";
import { GroupsDirectory } from "@/components/community/GroupsDirectory";

export const metadata: Metadata = {
  title: "Groupes",
  description:
    "Rejoins ou crée un groupe: partage tes plans, tes percées et tes sujets de prière avec les membres, dans un espace fermé façon feed.",
};

export default function GroupesPage() {
  return (
    <Suspense fallback={<p className="container-x py-16 pt-32 text-night-900/50">Chargement…</p>}>
      <GroupsDirectory />
    </Suspense>
  );
}
