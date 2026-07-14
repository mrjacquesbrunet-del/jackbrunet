"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    router.replace("/devotionnel");

    // Filet de sécurité (démarrage à froid depuis une notification) : si la
    // navigation douce n'a pas quitté l'accueil, on force une navigation dure.
    const t = setTimeout(() => {
      try {
        const p = window.location.pathname.replace(/\/+$/, "");
        if (p === "" || p.endsWith("/index.html")) {
          window.location.replace(asset("/devotionnel/"));
        }
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [router]);

  if (!appMode) return null;
  return <div aria-hidden className="fixed inset-0 z-[9999]" style={{ background: "#14160E" }} />;
}
