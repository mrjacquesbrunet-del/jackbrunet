"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/notifications";
import { asset } from "@/lib/asset";
import { consumeStashedNotifRoute } from "@/lib/notif-route";

/**
 * Sur l'accueil marketing « / », en mode application (natif ou aperçu ?app=1),
 * on redirige immédiatement vers « Mon temps avec Jésus » (/devotionnel) et on
 * masque le contenu marketing par un voile olive : cette page ne doit JAMAIS
 * être visible ni accessible dans l'app (ex. clic sur le rappel du matin).
 * Pour les visiteurs web, ce composant ne fait rien.
 */
export function AppHomeGuard() {
  const [appMode, setAppMode] = useState(false);

  useEffect(() => {
    let preview = false;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("app") === "1") sessionStorage.setItem("jb.appPreview", "1");
      preview =
        sessionStorage.getItem("jb.appPreview") === "1" || params.get("app") === "1";
    } catch {
      /* ignore */
    }
    if (!(isNativeApp() || preview)) return;

    setAppMode(true);

    // Cible : la route d'une notification tapée si elle a été mémorisée
    // (clic sur « X a commenté ta prière » → on va droit au contenu), sinon
    // « Mon temps avec Jésus » (rappel du matin, ouverture simple de l'app).
    const target = consumeStashedNotifRoute() || "/devotionnel/";
    const bare = target.split("?")[0].replace(/\/+$/, "");

    // Redirection DURE et immédiate. Fiable au démarrage à froid, là où la
    // navigation douce du routeur peut échouer et laisser l'utilisateur bloqué
    // sur le voile olive. On ne dépend d'aucun routeur : window.location.replace.
    const go = () => {
      try {
        const here = window.location.pathname.replace(/\/+$/, "");
        if (here !== bare) {
          window.location.replace(asset(target));
        }
      } catch {
        /* navigation impossible */
      }
    };
    go(); // tout de suite
    // Filet indépendant : si le tout premier appel n'a pas encore pris effet
    // (WebView pas prête au tout démarrage), on réessaie sans dépendre du 1er.
    const t = setTimeout(go, 400);
    return () => clearTimeout(t);
  }, []);

  if (!appMode) return null;
  return <div aria-hidden className="fixed inset-0 z-[9999]" style={{ background: "#14160E" }} />;
}
