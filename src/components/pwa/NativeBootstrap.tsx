"use client";

import { useEffect } from "react";
import { asset } from "@/lib/asset";
import { isNativeApp, readReminder, enableDailyReminder } from "@/lib/notifications";
import { initOneSignal } from "@/lib/onesignal";

/**
 * Initialisation propre à l'application native (Capacitor) :
 * - masque l'écran de démarrage une fois prêt ;
 * - style de la barre de statut ;
 * - ouverture du dévotionnel quand on tape la notification ;
 * - re-programme le rappel quotidien au lancement (si activé).
 * Ne fait rien sur le web.
 */
export function NativeBootstrap() {
  useEffect(() => {
    if (!isNativeApp()) return;
    let cleanup: (() => void) | undefined;

    (async () => {
      // Barre de statut claire sur fond sombre + écran de démarrage masqué.
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        /* plugin absent */
      }
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        /* plugin absent */
      }

      // Tap sur la notification → ouvre la route fournie (dévotionnel).
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const handle = await LocalNotifications.addListener(
          "localNotificationActionPerformed",
          (event) => {
            const route =
              (event.notification.extra as { route?: string } | undefined)?.route ??
              "/devotionnel/";
            window.location.href = asset(route);
          },
        );
        cleanup = () => handle.remove();
      } catch {
        /* plugin absent */
      }

      // Re-arme le rappel quotidien si l'utilisateur l'avait activé.
      const pref = readReminder();
      if (pref.enabled) {
        await enableDailyReminder(pref.hour, pref.minute).catch(() => undefined);
      }

      // Notifications push OneSignal (annonces à tous les utilisateurs).
      await initOneSignal();
    })();

    return () => cleanup?.();
  }, []);

  return null;
}
