"use client";

import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import { AdminAnnounce } from "@/components/community/AdminAnnounce";
import { AnalyticsDashboard } from "@/components/community/AnalyticsDashboard";
import { ChartGlyph, HeadphonesGlyph } from "@/components/ui/DevoIcons";
import { BibleAudioAdmin } from "@/components/community/BibleAudioAdmin";

/** Espace admin unique et masqué (/admin): stats, annonces, podcasts, etc.
 * Invisible et inaccessible pour les non-admins. */
export function AdminSpace() {
  const { ready, email } = useAuth();

  if (!ready) {
    return <section className="container-x py-24 text-center text-night-900/50">Chargement…</section>;
  }

  if (!isAdminEmail(email)) {
    // Page masquée: un non-admin voit une page « introuvable ».
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

  return (
    <section className="container-x pb-28 pt-24 sm:pt-28">
      <div className="mx-auto max-w-2xl">
        <span className="eyebrow">Réservé à Pasteur Jack</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Espace admin</h1>
        <p className="mt-1 text-sm text-night-900/60">
          Ton tableau de bord pour tout piloter: statistiques, annonces, podcasts.
        </p>

        {/* Statistiques */}
        <div className="glass-strong mt-8 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <ChartGlyph className="h-5 w-5 text-spirit-600" />
            Statistiques
          </h2>
          <p className="mt-1 text-sm text-night-900/60">
            Fréquentation et écoutes (anonymes), jour / semaine / mois.
          </p>
          <div className="mt-4">
            <AnalyticsDashboard />
          </div>
        </div>

        {/* Annonces & notifications */}
        <div className="mt-6">
          <AdminAnnounce />
        </div>

        {/* Podcasts */}
        <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <HeadphonesGlyph className="h-5 w-5 text-spirit-600" />
            Podcasts
          </h2>
          <p className="mt-1 text-sm text-night-900/60">
            Ajoute, renomme, décris ou supprime tes audios depuis la page Écouter.
          </p>
          <Link href="/ecouter" className="btn-ghost mt-3 inline-flex">
            Gérer les podcasts
          </Link>
        </div>

        {/* Bible audio */}
        <BibleAudioAdmin />

        <p className="mt-8 text-center text-xs text-night-900/40">
          Espace réservé, cette page n'apparaît nulle part dans les menus.
        </p>
      </div>
    </section>
  );
}
