import type { Metadata } from "next";
import { Suspense } from "react";
import { AssistantView } from "@/components/assistant/AssistantView";

export const metadata: Metadata = {
  title: "Assistant biblique",
  description:
    "Pose tes questions sur la Bible : des réponses claires, ancrées dans la version Louis Segond, avec les versets à ouvrir d'un tap.",
};

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-night-950" />}>
      <AssistantView />
    </Suspense>
  );
}
