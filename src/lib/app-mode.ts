"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "./notifications";

/**
 * Détecte si on doit afficher l'expérience « application » (barre d'onglets en
 * bas, masquage du menu site…).
 *
 * - VRAI uniquement dans l'app native (Capacitor) → le SITE web n'est JAMAIS
 * affecté pour les visiteurs.
 * - Aperçu pour tester depuis un navigateur: `?app=1`, mais limité à l'onglet
 * en cours (sessionStorage, effacé à la fermeture). `?app=0` quitte l'aperçu.
 *
 * SSR-safe: commence à `false`, bascule au montage côté client.
 */
export function useAppMode(): boolean {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    let preview = false;
    try {
      // Nettoyage de l'ancien mécanisme persistant (qui collait au navigateur).
      localStorage.removeItem("jb.appPreview");
      const params = new URLSearchParams(window.location.search);
      if (params.get("app") === "1") sessionStorage.setItem("jb.appPreview", "1");
      if (params.get("app") === "0") sessionStorage.removeItem("jb.appPreview");
      preview = sessionStorage.getItem("jb.appPreview") === "1";
    } catch {
      /* ignore */
    }
    setIsApp(isNativeApp() || preview);
  }, []);

  return isApp;
}
