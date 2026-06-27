"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "./notifications";

/**
 * Détecte si on doit afficher l'expérience « application » (barre d'onglets en
 * bas, masquage du menu site…). Vrai dans l'app native (Capacitor) OU en mode
 * aperçu navigateur via `?app=1` (mémorisé) pour tester le rendu app.
 *
 * SSR-safe : commence à `false`, bascule au montage côté client (évite les
 * incohérences d'hydratation sur l'export statique).
 */
export function useAppMode(): boolean {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    let preview = false;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("app") === "1") localStorage.setItem("jb.appPreview", "1");
      if (params.get("app") === "0") localStorage.removeItem("jb.appPreview");
      preview = localStorage.getItem("jb.appPreview") === "1";
    } catch {
      /* ignore */
    }
    setIsApp(isNativeApp() || preview);
  }, []);

  return isApp;
}
