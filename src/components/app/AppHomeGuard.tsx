"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/notifications";
import { asset } from "@/lib/asset";

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

    // Redirection DURE et immédiate vers « Mon temps avec Jésus ». Fiable au
    // démarrage à froid (clic sur le rappel du matin), là où la navigation
    // douce du routeur peut échouer et laisser l'utilisateur bloqué sur le
    // voile olive. On ne dépend d'aucun routeur : window.location.replace.
    const go = () => {
      try {
        const here = window.location.pathname.replace(/\/+$/, "");
        if (!/devotionnel$/.test(here)) {
          window.location.replace(asset("/devotionnel/"));
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
