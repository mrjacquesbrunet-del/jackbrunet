import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Supprimer mon compte",
  description:
    "Comment supprimer votre compte de l'application Jack Brunet : Foi & Prière et les données associées.",
};

export default function SuppressionComptePage() {
  return (
    <>
      <PageHero
        eyebrow="Compte"
        title={
          <>
            Supprimer mon <span className="text-gradient">compte</span>
          </>
        }
        description="Application « Jack Brunet : Foi & Prière », procédure de suppression de compte et de données."
      />

      <section className="container-x py-12">
        <div className="mx-auto max-w-3xl space-y-8 text-night-900/80 leading-relaxed">
          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Directement dans l'application (recommandé)
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Ouvre l'application et connecte-toi à ton compte.</li>
              <li>
                Va dans l'onglet <strong>Profil</strong>.
              </li>
              <li>
                Descends tout en bas jusqu'à la section <strong>« Supprimer mon compte »</strong>{" "}
                (encadré rouge).
              </li>
              <li>
                Touche <strong>« Supprimer mon compte »</strong> et confirme (double confirmation).
              </li>
              <li>Ton compte et tes données sont alors supprimés définitivement.</li>
            </ol>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Par email (si tu n'as plus l'application)
            </h2>
            <p className="mt-3">
              Écris-nous à{" "}
              <a
                href={`mailto:${siteConfig.contactEmail}?subject=Suppression%20de%20mon%20compte`}
                className="underline underline-offset-2"
              >
                {siteConfig.contactEmail}
              </a>{" "}
              depuis l'adresse email de ton compte, avec l'objet « Suppression de mon compte ». Nous
              traitons la demande sous 30 jours.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Données supprimées
            </h2>
            <p className="mt-3">
              La suppression efface définitivement : ton compte (email et identifiants), ton profil
              (pseudo, photo, bio, versets favoris), tes sujets de prière, tes commentaires et
              réponses, tes messages privés, tes abonnements et tes réactions.
            </p>
            <p className="mt-3">
              Aucune donnée personnelle n'est conservée après la suppression, hormis, le cas
              échéant, les informations que la loi nous oblige à garder (par ex. justificatifs liés
              à un don effectué en dehors de l'application). Ces éléments légaux sont conservés le
              temps strictement requis, puis supprimés.
            </p>
          </div>

          <p className="text-sm text-night-900/50">
            Éditeur de l'application : Jack Brunet, {siteConfig.contactEmail}
          </p>
        </div>
      </section>
    </>
  );
}
