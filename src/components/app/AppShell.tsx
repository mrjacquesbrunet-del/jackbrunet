"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppMode } from "@/lib/app-mode";
import { BottomNav } from "@/components/app/BottomNav";
import { AppOnboarding } from "@/components/app/AppOnboarding";
import { AnnouncementBanner } from "@/components/app/AnnouncementBanner";
import { NotifOptIn } from "@/components/app/NotifOptIn";
import { RatingPrompt } from "@/components/app/RatingPrompt";
import { CarnetBubble } from "@/components/app/CarnetBubble";
import { recordOpen } from "@/lib/usage";

/**
 * Pilote l'expérience « application »:
 * - ajoute la classe `app-native` sur <html> (masque le menu/pied de page du
 * site, ajoute la marge basse pour la barre d'onglets) ;
 * - affiche la barre d'onglets en bas ;
 * - à l'ouverture, redirige l'accueil « / » vers la pensée du jour.
 */
export function AppShell() {
  const isApp = useAppMode();
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (isApp) root.classList.add("app-native");
    else root.classList.remove("app-native");
  }, [isApp]);

  // NOTE: la redirection de l'accueil « / » est gérée UNIQUEMENT par
  // AppHomeGuard (qui sait aussi ouvrir le contenu d'une notification tapée).
  // Ne pas rediriger ici : deux redirections concurrentes peuvent écraser le
  // deep-link d'une notification.

  // Couleur de l'heure/notifications adaptée au haut de chaque page (edge-to-edge):
  // texte clair sur les pages à en-tête sombre, foncé sur les pages claires.
  useEffect(() => {
    if (!isApp) return;
    const darkTop = ["/devotionnel", "/communaute", "/membre", "/mission-madagascar"].some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    (async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: darkTop? Style.Light: Style.Dark });
      } catch {
        /* plugin absent */
      }
    })();
  }, [isApp, pathname]);

  // Compte l'ouverture (une fois) pour déclencher les propositions au bon moment.
  useEffect(() => {
    if (isApp) recordOpen();
  }, [isApp]);

  if (!isApp) return null;
  return (
    <>
      <BottomNav />
      <CarnetBubble />
      <AppOnboarding />
      <AnnouncementBanner />
      <NotifOptIn />
      <RatingPrompt />
    </>
  );
}
