"use client";

import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import { AdminAnnounce } from "@/components/community/AdminAnnounce";
import { AnalyticsDashboard } from "@/components/community/AnalyticsDashboard";
import {
  BookGlyph,
  ChartGlyph,
  GiftGlyph,
  HeadphonesGlyph,
  MegaphoneGlyph,
  MusicGlyph,
} from "@/components/ui/DevoIcons";
import { BibleAudioAdmin } from "@/components/community/BibleAudioAdmin";
import { MissionRaisedAdmin } from "@/components/community/MissionRaisedAdmin";
import { DevotionsAdmin } from "@/components/community/DevotionsAdmin";
import { FormationAdmin } from "@/components/community/FormationAdmin";
import { MediasAdmin } from "@/components/community/MediasAdmin";
import { AdminBatisseurs } from "@/components/community/AdminBatisseurs";
import { IconeBatisseur } from "@/components/community/BatisseurBadge";
import {
  Rubrique,
  RubriquesProvider,
  SommaireAdmin,
  useRubriques,
  type RubriqueDef,
} from "@/components/community/AdminRubrique";

const IconeFormation = () => (
  <svg viewBox="0 0 24 24" className="fill-none stroke-current" strokeWidth={1.9} aria-hidden>
    <path
      d="M2 9.5l10-5 10 5-10 5-10-5M5.8 12.4v3.8c0 1.4 2.8 2.8 6.2 2.8s6.2-1.4 6.2-2.8v-3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconeMedias = () => (
  <svg viewBox="0 0 24 24" className="fill-none stroke-current" strokeWidth={1.8} aria-hidden>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="M4 17l5-5 4 4 3-3 4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Rubriques de l'espace admin, dans l'ordre d'affichage. */
const RUBRIQUES: RubriqueDef[] = [
  { id: "stats", titre: "Statistiques", icone: <ChartGlyph /> },
  { id: "formation", titre: "Formation", icone: <IconeFormation /> },
  { id: "devotions", titre: "Dévotionnels", icone: <BookGlyph /> },
  { id: "medias", titre: "Médias", icone: <IconeMedias /> },
  { id: "annonces", titre: "Annonces", icone: <MegaphoneGlyph /> },
  { id: "podcasts", titre: "Podcasts", icone: <HeadphonesGlyph /> },
  { id: "batisseurs", titre: "Bâtisseurs", icone: <IconeBatisseur /> },
  { id: "mission", titre: "Mission", icone: <GiftGlyph /> },
  { id: "bible-audio", titre: "Bible audio", icone: <MusicGlyph /> },
];
const R = Object.fromEntries(RUBRIQUES.map((r) => [r.id, r])) as Record<string, RubriqueDef>;

/** Espace admin unique et masqué (/admin): stats, annonces, podcasts, etc.
 * Invisible et inaccessible pour les non-admins. */
export function AdminSpace() {
  const { ready, email } = useAuth();
  const rubriques = useRubriques(RUBRIQUES.map((r) => r.id));

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

        <SommaireAdmin rubriques={RUBRIQUES} {...rubriques} />

        <RubriquesProvider value={rubriques}>
          {/* Statistiques */}
          <Rubrique def={R.stats}>
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
          </Rubrique>

          {/* Formation biblique : inscrits, complétion, notes */}
          <Rubrique def={R.formation}>
            <FormationAdmin />
          </Rubrique>

          {/* Gestion des dévotionnels */}
          <Rubrique def={R.devotions}>
            <DevotionsAdmin />
          </Rubrique>

          {/* Médias : import multiple d'images */}
          <Rubrique def={R.medias}>
            <MediasAdmin />
          </Rubrique>

          {/* Annonces & notifications */}
          <Rubrique def={R.annonces}>
            <AdminAnnounce />
          </Rubrique>

          {/* Podcasts */}
          <Rubrique def={R.podcasts}>
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
          </Rubrique>

          {/* Bâtisseurs : Zoom mensuel + soutiens reçus */}
          <Rubrique def={R.batisseurs}>
            <AdminBatisseurs />
          </Rubrique>

          {/* Collecte Mission Madagascar */}
          <Rubrique def={R.mission}>
            <MissionRaisedAdmin />
          </Rubrique>

          {/* Bible audio */}
          <Rubrique def={R["bible-audio"]}>
            <BibleAudioAdmin />
          </Rubrique>
        </RubriquesProvider>

        <p className="mt-8 text-center text-xs text-night-900/40">
          Espace réservé, cette page n'apparaît nulle part dans les menus.
        </p>
      </div>
    </section>
  );
}
