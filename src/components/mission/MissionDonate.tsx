"use client";

import type { ReactNode } from "react";
import { openExternal } from "@/lib/external";
import { isNativeApp } from "@/lib/notifications";

/**
 * Bouton de don pour la Mission Madagascar.
 * - Sur le web: ouvre directement le lien de don (Stripe) en nouvel onglet.
 * - Dans l'app: Apple interdit un bouton de paiement intégré, mais AUTORISE les
 *   dons à une association via un navigateur web. On envoie donc l'utilisateur
 *   vers la page de don du SITE, ouverte dans le navigateur du téléphone.
 */
export function MissionDonate({
  stripeUrl,
  siteUrl,
  className,
  children,
}: {
  stripeUrl: string | null;
  siteUrl: string;
  className?: string;
  children: ReactNode;
}) {
  const target = isNativeApp()? siteUrl: stripeUrl?? siteUrl;
  return (
    <button type="button" onClick={() => openExternal(target)} className={className}>
      {children}
    </button>
  );
}
