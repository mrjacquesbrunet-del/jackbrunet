"use client";

import { useAuth } from "@/components/community/useAuth";

/** Salutation personnalisée en haut du dévotionnel (si l'utilisateur est connu). */
export function Greeting() {
  const { profile } = useAuth();
  const name = profile?.pseudo?.trim();
  return (
    <p className="text-sm font-semibold text-spirit-600">
      {name? `Bonjour ${name}`: "Heureux de te retrouver"}
    </p>
  );
}
