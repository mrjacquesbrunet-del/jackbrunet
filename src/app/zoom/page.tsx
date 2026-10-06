import type { Metadata } from "next";
import { ZoomInvitationView } from "@/components/mission/ZoomInvitationView";

export const metadata: Metadata = {
  title: "Invitation au Zoom des Bâtisseurs",
  robots: { index: false, follow: false },
};

export default function ZoomPage() {
  return <ZoomInvitationView />;
}
