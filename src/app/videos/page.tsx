import type { Metadata } from "next";
import { VideosScreen } from "@/components/home/VideosScreen";
import { getLongVideos, getShorts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Vidéos",
  description:
    "Toutes les prédications et les Shorts de Jack Brunet, à regarder directement sur le site.",
};

export default function VideosPage() {
  return <VideosScreen videos={getLongVideos()} shorts={getShorts()} />;
}
