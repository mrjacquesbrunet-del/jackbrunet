"use client";

import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import { getSupabase } from "@/lib/supabase";

declare global {
  interface Window {
    __studioSupabase?: ReturnType<typeof getSupabase>;
  }
}

/** Studio Jack (/admin/studio) : planning, punchlines, agenda et suivi des stats.
 * Le Studio est une page autonome (public/studio) chargée plein écran ; elle lit
 * et écrit la table studio_docs avec la session de cette page (voir bridge.js).
 * Invisible et inaccessible pour les non-admins, comme l'espace admin. */
export function StudioSpace() {
  const { ready, email } = useAuth();

  if (!ready) {
    return <section className="container-x py-24 text-center text-night-900/50">Chargement…</section>;
  }

  if (!isAdminEmail(email)) {
    return (
      <section className="container-x py-24 text-center">
        <p className="font-display text-2xl font-extrabold">Page introuvable</p>
        <p className="mt-2 text-night-900/60">Cette page n'existe pas.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Retour à l'accueil
        </Link>
      </section>
    );
  }

  // Avant le chargement de l'iframe : bridge.js y lit ce client au démarrage.
  window.__studioSupabase = getSupabase();
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return (
    <div className="keep-dark fixed inset-0 z-[80] bg-[#1b1b1a] pt-[env(safe-area-inset-top)]">
      <iframe
        src={`${base}/studio/index.html`}
        title="Studio Jack"
        allow="screen-wake-lock"
        className="h-full w-full border-0"
      />
    </div>
  );
}
