import type { Metadata } from "next";
import { Suspense } from "react";
import { MessagesView } from "@/components/community/MessagesView";

export const metadata: Metadata = {
  title: "Messages",
  description: "Tes messages privés avec la communauté de prière.",
};

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className="container-x py-24 text-night-900/50">Chargement…</p>}>
      <MessagesView />
    </Suspense>
  );
}
