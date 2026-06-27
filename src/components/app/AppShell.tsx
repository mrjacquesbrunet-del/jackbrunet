"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppMode } from "@/lib/app-mode";
import { BottomNav } from "@/components/app/BottomNav";

/**
 * Pilote l'expérience « application » :
 * - ajoute la classe `app-native` sur <html> (masque le menu/pied de page du
 *   site, ajoute la marge basse pour la barre d'onglets) ;
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

  if (!isApp) return null;
  return <BottomNav />;
}
