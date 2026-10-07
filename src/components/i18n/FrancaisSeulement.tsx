"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLangue } from "@/lib/i18n";

/**
 * Pages qui n'existent qu'en français (podcasts, vidéos) : en anglais et en
 * portugais, on renvoie vers l'accueil (lien partagé, notification…).
 */
export function FrancaisSeulement() {
  const router = useRouter();
  useEffect(() => {
    if (getLangue() !== "fr") router.replace("/devotionnel/");
  }, [router]);
  return null;
}
