"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/community/useAuth";
import { enableCloudSync, disableCloudSync } from "@/lib/cloud-sync";
import { captureEmail } from "@/lib/email-capture";
import { enregistrerLangueProfil } from "@/lib/notif-prefs";
import { useLangue } from "@/lib/i18n";

/**
 * Monté dans le layout: dès qu'un membre est connecté, synchronise
 * son carnet/versets/plans ET ajoute son email à la liste de contacts
 * Brevo (récupération automatique de tous les emails inscrits).
 */
export function CloudSync() {
  const { ready, userId, email } = useAuth();
  const langue = useLangue();

  // Langue de l'app sur le profil (annonces de podcasts : en français seulement).
  useEffect(() => {
    if (ready && userId) void enregistrerLangueProfil(userId, langue).catch(() => undefined);
  }, [ready, userId, langue]);

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
