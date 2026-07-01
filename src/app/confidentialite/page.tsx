import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité du site jackbrunet.com — données collectées, finalités, droits RGPD et cookies.",
};

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero
        eyebrow="Légal"
        title={
          <>
            Politique de <span className="text-gradient">confidentialité</span>
          </>
        }
      />

      <section className="container-x py-12">
        <div className="mx-auto max-w-3xl space-y-8 text-night-900/80 leading-relaxed">
          <p className="text-sm text-night-900/50">Dernière mise à jour: juin 2026</p>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Responsable du traitement
            </h2>
            <p className="mt-3">
              Les données personnelles collectées sur ce site sont traitées par Jack Brunet
              (micro-entreprise). Pour toute question, contactez:{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="underline underline-offset-2">
                {siteConfig.contactEmail}
              </a>
.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Données collectées</h2>
            <p className="mt-3">
              Selon les formulaires que vous utilisez, nous pouvons collecter:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>votre adresse email</li>
              <li>votre prénom et votre nom</li>
              <li>votre numéro de téléphone (facultatif)</li>
              <li>le contenu de vos messages (requêtes de prière, témoignages)</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Finalités</h2>
            <p className="mt-3">Ces données sont utilisées pour:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>vous envoyer la newsletter et les contenus quotidiens d'édification</li>
              <li>vous envoyer le cadeau gratuit (ebook)</li>
              <li>répondre à vos requêtes de prière et à vos témoignages</li>
              <li>vous tenir informé(e) des dons, des missions et de la sortie du livre</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Base légale</h2>
            <p className="mt-3">
              Le traitement repose sur votre consentement, que vous donnez en remplissant et en
              validant un formulaire. Vous pouvez le retirer à tout moment.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Destinataires et sous-traitants
            </h2>
            <p className="mt-3">
              Vos données ne sont jamais vendues. Elles peuvent être traitées par nos prestataires:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>
                Brevo (Sendinblue SAS, France) — gestion des emails et des contacts
              </li>
              <li>Stripe — traitement sécurisé des paiements (dons et achats)</li>
              <li>GitHub Pages — hébergement du site</li>
            </ul>
            <p className="mt-3">
              Ces prestataires présentent des garanties conformes au RGPD.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Durée de conservation
            </h2>
            <p className="mt-3">
              Vos données sont conservées tant que vous restez abonné(e) ou jusqu'à votre demande de
              suppression. Vous pouvez vous désinscrire à tout moment via le lien présent dans chaque
              email.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Vos droits</h2>
            <p className="mt-3">
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
              d'effacement, d'opposition, de limitation et de portabilité de vos données. Pour les
              exercer, écrivez à{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="underline underline-offset-2">
                {siteConfig.contactEmail}
              </a>
. Vous pouvez également introduire une réclamation auprès de la CNIL (
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                www.cnil.fr
              </a>
              ).
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Cookies et traceurs
            </h2>
            <p className="mt-3">
              Ce site n'utilise pas de cookies publicitaires. Un stockage local est utilisé pour
              mémoriser la fermeture de certaines fenêtres (par exemple le pop-up). La lecture de
              vidéos YouTube intégrées peut déposer des cookies tiers gérés par YouTube/Google.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
