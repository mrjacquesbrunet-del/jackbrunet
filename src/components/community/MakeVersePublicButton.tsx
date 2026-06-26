"use client";

import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { addFavoriteVerse } from "@/lib/community";

/**
 * Petit bouton pour publier un verset enregistré sur son profil public
 * (« Mes versets »). Nécessite d'être connecté.
 */
export function MakeVersePublicButton({
  text,
  reference,
}: {
  text: string;
  reference?: string;
}) {
  const { ready, userId } = useAuth();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  if (!isSupabaseConfigured) return null;

  async function publish() {
    if (!ready) return;
    if (!userId) {
      setState("error");
      return;
    }
    setState("busy");
    const ok = await addFavoriteVerse(userId, { text, reference: reference ?? "" });
    setState(ok ? "done" : "error");
  }

  if (state === "done") {
    return <span className="text-xs font-semibold text-spirit-600">✓ Sur ton profil</span>;
  }

  return (
    <button
      type="button"
      onClick={publish}
      disabled={state === "busy"}
      className="text-xs font-semibold text-spirit-600 transition-colors hover:underline disabled:opacity-50"
      title="Afficher ce verset sur mon profil public"
    >
      {state === "busy"
        ? "Publication…"
        : state === "error"
          ? userId
            ? "Réessayer"
            : "Connecte-toi"
          : "Rendre public"}
    </button>
  );
}
