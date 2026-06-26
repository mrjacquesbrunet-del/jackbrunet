"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/community/useAuth";
import { enableCloudSync, disableCloudSync } from "@/lib/cloud-sync";
import { captureEmail } from "@/lib/email-capture";

/**
 * Monté dans le layout : dès qu'un membre est connecté, synchronise
 * son carnet/versets/plans ET ajoute son email à la liste de contacts
 * Brevo (récupération automatique de tous les emails inscrits).
 */
export function CloudSync() {
  const { ready, userId, email } = useAuth();

  useEffect(() => {
    if (!ready) return;
    try {
      if (userId) {
        void enableCloudSync(userId);
        void captureEmail(email);
      } else {
        disableCloudSync();
      }
    } catch {
      /* la synchro ne doit jamais casser l'affichage */
    }
  }, [ready, userId, email]);

  return null;
}
