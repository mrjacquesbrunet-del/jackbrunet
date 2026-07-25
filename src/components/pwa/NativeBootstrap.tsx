"use client";

import { useEffect } from "react";
import { openNotifRoute } from "@/lib/notif-route";
import { isNativeApp, readReminder, enableDailyReminder } from "@/lib/notifications";
import { initOneSignal } from "@/lib/onesignal";

/**
 * Initialisation propre à l'application native (Capacitor):
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
      // 0) EN TOUT PREMIER, et sans rien attendre d'autre : confirmer à Capgo
      // que l'app a bien démarré. CRITIQUE — si cet appel est retardé (par ex.
      // derrière une init qui traîne), Capgo croit la mise à jour ratée et
      // revient à l'ancienne version, ce qui peut laisser un écran olive vide.
      try {
        const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
        await CapacitorUpdater.notifyAppReady();
      } catch {
        /* plugin absent (web) */
      }

      // 1) Cacher l'écran de démarrage tôt, sans dépendre des étapes suivantes.
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        /* plugin absent */
      }

      // 2) Tap sur un rappel local → ouvre la route fournie (dévotionnel).
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const handle = await LocalNotifications.addListener(
          "localNotificationActionPerformed",
          (event) => {
            const route = (event.notification.extra as { route?: string } | undefined)?.route;
            openNotifRoute(route);
          },
        );
        cleanup = () => handle.remove();
      } catch {
        /* plugin absent */
      }

      // Notifications push OneSignal (attache aussi l'écouteur de clic → ouvre
      // le bon contenu). Isolé : une init lente ne bloque plus rien de critique.
      initOneSignal().catch(() => undefined);

      // 3) Barre de statut: edge-to-edge (le fond de l'app passe SOUS l'heure,
      // sans bande). Le style (texte clair/foncé) est ajusté par page dans AppShell.
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch {
          /* iOS: recouvrement géré nativement */
        }
        // Écran d'accueil (dévotionnel) = fond sombre → texte clair par défaut.
        await StatusBar.setStyle({ style: Style.Light });
      } catch {
        /* plugin absent */
      }

      // 4) Re-arme le rappel quotidien si l'utilisateur l'avait activé.
      const pref = readReminder();
      if (pref.enabled) {
        await enableDailyReminder(pref.hour, pref.minute).catch(() => undefined);
      }
    })();

    return () => cleanup?.();
  }, []);

  return null;
}
