"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/community/useAuth";
import { enableCloudSync, disableCloudSync } from "@/lib/cloud-sync";

/**
 * Monté dans le layout : dès qu'un membre est connecté, synchronise
 * son carnet, ses versets et ses plans avec son compte (tous appareils).
 */
export function CloudSync() {
  const { ready, userId } = useAuth();

  useEffect(() => {
    if (!ready) return;
    try {
      if (userId) void enableCloudSync(userId);
      else disableCloudSync();
    } catch {
      /* la synchro ne doit jamais casser l'affichage */
    }
  }, [ready, userId]);

  return null;
}
