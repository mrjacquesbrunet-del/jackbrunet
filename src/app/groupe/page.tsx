import type { Metadata } from "next";
import { Suspense } from "react";
import { GroupDetailView } from "@/components/community/GroupDetailView";

export const metadata: Metadata = {
  title: "Groupe de prière",
  description: "Le fil de prière privé de ton groupe.",
};

export default function GroupePage() {
  return (
    <Suspense fallback={<p className="container-x py-16 pt-32 text-night-900/50">Chargement…</p>}>
      <GroupDetailView />
    </Suspense>
  );
}
