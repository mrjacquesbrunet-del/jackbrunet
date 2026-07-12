import type { Metadata } from "next";
import { Suspense } from "react";
import { GroupView } from "@/components/community/GroupView";

export const metadata: Metadata = {
  title: "Groupe",
  description: "Espace de groupe: feed, chat et membres.",
};

export default function GroupePage() {
  return (
    <Suspense fallback={<p className="container-x py-16 pt-32 text-night-900/50">Chargement…</p>}>
      <GroupView />
    </Suspense>
  );
}
