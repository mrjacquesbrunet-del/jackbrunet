"use client";

import type { ReactNode } from "react";
import { openExternal } from "@/lib/external";
import { isNativeApp } from "@/lib/notifications";

/**
 * Bouton de paiement: rend un lien Stripe si `href` est défini, sinon un
 * bouton désactivé (lien pas encore configuré). Style passé via `className`.
 *
 * Conformité App Store (règle 3.1.1): les transactions (dons, achats) sont
 * RETIRÉES de l'application native, elles restent disponibles sur le site web.
 * Sur le web, lien classique en nouvel onglet.
 */
export function PayButton({
  href,
  className,
  children,
}: {
  href: string | null;
  className?: string;
  children: ReactNode;
}) {
  // App native: on n'affiche aucun bouton de paiement/don (exigence Apple 3.1.1).
  if (isNativeApp()) return null;

  if (!href) {
    return (
      <button type="button" className={className} disabled aria-disabled="true">
        {children}
      </button>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => {
        // En natif: ouvre dans le navigateur système plutôt que dans la webview.
        const isNative = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } })
.Capacitor?.isNativePlatform?.();
        if (isNative) {
          e.preventDefault();
          void openExternal(href);
        }
      }}
    >
      {children}
    </a>
  );
}
