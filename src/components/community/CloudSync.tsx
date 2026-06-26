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
    if (userId) enableCloudSync(userId);
    else disableCloudSync();
  }, [ready, userId]);

  return null;
}
