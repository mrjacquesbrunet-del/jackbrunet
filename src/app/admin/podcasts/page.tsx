import type { Metadata } from "next";
import { PodcastsAdmin } from "@/components/audio/PodcastsAdmin";

export const metadata: Metadata = {
  title: "Podcasts · Administration",
  robots: { index: false, follow: false },
};

export default function PodcastsAdminPage() {
  return <PodcastsAdmin />;
}
