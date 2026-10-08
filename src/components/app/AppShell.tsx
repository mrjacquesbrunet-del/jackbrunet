"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { useAppMode } from "@/lib/app-mode";
import { getSupabase } from "@/lib/supabase";
import { pingPresence } from "@/lib/presence";
import { BottomNav } from "@/components/app/BottomNav";
import { AppOnboarding } from "@/components/app/AppOnboarding";
import { AnnouncementBanner } from "@/components/app/AnnouncementBanner";
import { NotifOptIn } from "@/components/app/NotifOptIn";
import { PopupMission } from "@/components/mission/PopupMission";
import { RatingPrompt } from "@/components/app/RatingPrompt";
import { CarnetBubble } from "@/components/app/CarnetBubble";
import { BadgeCelebration } from "@/components/app/BadgeCelebration";
import { BandeauBatisseurs } from "@/components/mission/BandeauBatisseurs";
import { recordOpen } from "@/lib/usage";
import { ProfilMenu, BarreHaut } from "@/components/app/ProfilMenu";
import { FondDebordement } from "@/components/app/FondDebordement";

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

  // Toutes les zones de texte de l'app grandissent avec le message (comme
  // une messagerie) : la hauteur suit le contenu, plafonnée à 40 % de
  // l'écran, puis défilement interne. Délégué au document pour couvrir
  // chaque <textarea> présent et futur, sans toucher aux formulaires.
  useEffect(() => {
    const grow = (el: HTMLTextAreaElement) => {
      el.style.height = "auto";
      const max = Math.floor(window.innerHeight * 0.4);
      const h = Math.min(el.scrollHeight + 2, max);
      el.style.height = `${h}px`;
      el.style.overflowY = el.scrollHeight + 2 > max ? "auto" : "hidden";
    };
    const onEvent = (e: Event) => {
      if (e.target instanceof HTMLTextAreaElement) grow(e.target);
    };
    document.addEventListener("input", onEvent);
    document.addEventListener("focusin", onEvent);
    return () => {
      document.removeEventListener("input", onEvent);
      document.removeEventListener("focusin", onEvent);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isApp) root.classList.add("app-native");
    else root.classList.remove("app-native");
  }, [isApp]);

  // Mesure EN PERMANENCE la hauteur réelle du menu du bas (--bottom-nav-h),
  // pour que les éléments flottants (flèches et bouton audio de la Bible,
  // lecteur…) se calent au-dessus, barre audio affichée ou non.
  // On prend la HAUTEUR du menu (et non « hauteur de fenêtre − haut du menu ») :
  // sur iOS (contentInset), window.innerHeight ne correspond pas au repère des
  // éléments fixes, ce qui faisait passer la barre d'envoi des messages sous
  // le menu. Un ResizeObserver suit aussi tout changement de taille du menu.
  useEffect(() => {
    const apply = () => {
      const nav = document.querySelector(".bottom-nav") as HTMLElement | null;
      const h = nav ? nav.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty("--bottom-nav-h", `${Math.max(0, h - 1)}px`);
    };
    apply();
    const t = setTimeout(apply, 300); // après le premier rendu du menu
    const t2 = setTimeout(apply, 1500);
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);
    const nav = document.querySelector(".bottom-nav");
    const ro = nav && typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
    if (nav) ro?.observe(nav);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      window.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("resize", apply);
      ro?.disconnect();
    };
  }, [isApp, pathname]);

  // NOTE: la redirection de l'accueil « / » est gérée UNIQUEMENT par
  // AppHomeGuard (qui sait aussi ouvrir le contenu d'une notification tapée).
  // Ne pas rediriger ici : deux redirections concurrentes peuvent écraser le
  // deep-link d'une notification.

  // Couleur de l'heure/notifications adaptée au haut de chaque page (edge-to-edge):
  // texte clair sur les pages à en-tête sombre, foncé sur les pages claires.
  // (iPhone : géré par FondDebordement, d'après la couleur réelle du haut.)
  useEffect(() => {
    if (!isApp || Capacitor.getPlatform() === "ios") return;
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

  // Présence « En ligne » : battement régulier tant que l'app est ouverte.
  useEffect(() => {
    if (!isApp) return;
    const beat = async () => {
      try {
        const { data } = (await getSupabase()?.auth.getUser()) ?? { data: null };
        pingPresence(data?.user?.id);
      } catch {
        /* hors ligne */
      }
    };
    void beat();
    const t = setInterval(beat, 120_000);
    return () => clearInterval(t);
  }, [isApp]);

  if (!isApp) return null;
  return (
    <>
      <BottomNav />
      <BarreHaut />
      <FondDebordement />
      <ProfilMenu />
      <BandeauBatisseurs />
      <CarnetBubble />
      <AppOnboarding />
      <AnnouncementBanner />
      <PopupMission />
      <NotifOptIn />
      <RatingPrompt />
      <BadgeCelebration />
    </>
  );
}
