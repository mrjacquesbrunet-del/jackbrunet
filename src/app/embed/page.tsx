import type { Metadata } from "next";
import { Embed } from "./Embed";

export const metadata: Metadata = {
  title: "Lecteur vidéo",
  robots: { index: false, follow: false },
};

export default function EmbedPage() {
  return <Embed />;
}
