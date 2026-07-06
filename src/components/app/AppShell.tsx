"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppMode } from "@/lib/app-mode";
import { BottomNav } from "@/components/app/BottomNav";
import { AppOnboarding } from "@/components/app/AppOnboarding";
import { AnnouncementBanner } from "@/components/app/AnnouncementBanner";
import { NotifOptIn } from "@/components/app/NotifOptIn";
import { RatingPrompt } from "@/components/app/RatingPrompt";
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
  const router = useRouter();

  useEffect(() => {
    const root = document.documentElement;
    if (isApp) root.classList.add("app-native");
    else root.classList.remove("app-native");
  }, [isApp]);

  useEffect(() => {
    if (isApp && pathname === "/") router.replace("/devotionnel");
  }, [isApp, pathname, router]);

  // Compte l'ouverture (une fois) pour déclencher les propositions au bon moment.
  useEffect(() => {
    if (isApp) recordOpen();
  }, [isApp]);

  if (!isApp) return null;
  return (
    <>
      <BottomNav />
      <AppOnboarding />
      <AnnouncementBanner />
      <NotifOptIn />
      <RatingPrompt />
    </>
  );
}
