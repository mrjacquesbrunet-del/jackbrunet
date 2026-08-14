import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité du site jackbrunet.com, données collectées, finalités, droits RGPD et cookies.",
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
          <p className="text-sm text-night-900/50">Dernière mise à jour: août 2026</p>

          <p>
            Cette politique couvre à la fois le site jackbrunet.com et
            l'application mobile RHEMA (anciennement « Jack Brunet : Foi &
            Prière »).
          </p>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Responsable du traitement
            </h2>
            <p className="mt-3">
              Les données personnelles collectées sur le site et dans
              l'application sont traitées par Jack Brunet (micro-entreprise, SIRET
              802 639 583 00029). Pour toute question, contactez:{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="underline underline-offset-2">
                {siteConfig.contactEmail}
              </a>
.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Données collectées</h2>
            <p className="mt-3">
              Sur le <strong>site</strong>, selon les formulaires que vous
              utilisez, nous pouvons collecter:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>votre adresse email</li>
              <li>votre prénom et votre nom</li>
              <li>votre numéro de téléphone (facultatif)</li>
              <li>le contenu de vos messages (requêtes de prière, témoignages)</li>
            </ul>
            <p className="mt-4">
              Dans l'<strong>application</strong>, lorsque vous créez un compte
              et utilisez la communauté, nous traitons:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>votre e-mail et vos identifiants de connexion</li>
              <li>
                votre profil: pseudo, photo, courte présentation, versets et
                contenus favoris
              </li>
              <li>
                vos contenus communautaires: sujets de prière, commentaires,
                réponses, messages privés, réactions et abonnements
              </li>
              <li>
                votre progression: méditations lues, plans de lecture commencés,
                notes de votre carnet
              </li>
              <li>
                des données techniques strictement nécessaires: identifiant
                d'appareil pour les notifications, statistiques de fréquentation
                anonymisées (pages consultées, écoutes)
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Finalités</h2>
            <p className="mt-3">Ces données sont utilisées pour:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>créer et gérer votre compte et votre profil dans l'application</li>
              <li>
                faire fonctionner la communauté (mur de prière, groupes,
                messages, abonnements)
              </li>
              <li>
                vous envoyer, avec votre accord, des notifications (parole du
                jour, réponses à vos prières)
              </li>
              <li>vous envoyer la newsletter et les contenus quotidiens d'édification</li>
              <li>vous envoyer le cadeau gratuit (ebook)</li>
              <li>répondre à vos requêtes de prière et à vos témoignages</li>
              <li>mesurer l'audience de façon agrégée pour améliorer l'application</li>
              <li>vous tenir informé(e) des dons, des missions et de la sortie du livre</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Notifications
            </h2>
            <p className="mt-3">
              Les notifications push ne sont envoyées qu'après votre
              autorisation, demandée par votre téléphone lors de la première
              utilisation. Vous pouvez les désactiver à tout moment dans les
              réglages de votre appareil ou dans l'application. La gestion
              technique de l'envoi est assurée par notre prestataire OneSignal.
            </p>
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
                Supabase, hébergement sécurisé de la base de données et gestion
                des comptes de l'application (authentification, profils,
                contenus communautaires)
              </li>
              <li>
                OneSignal, envoi des notifications push de l'application
              </li>
              <li>
                Brevo (Sendinblue SAS, France), gestion des emails et des contacts
              </li>
              <li>Stripe, traitement sécurisé des paiements (dons et achats)</li>
              <li>GitHub Pages, hébergement du site</li>
            </ul>
            <p className="mt-3">
              Ces prestataires présentent des garanties conformes au RGPD.
              Certains peuvent héberger des données en dehors de l'Union
              européenne; dans ce cas, les transferts sont encadrés par les
              clauses contractuelles types de la Commission européenne.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Durée de conservation
            </h2>
            <p className="mt-3">
              Les données du site sont conservées tant que vous restez abonné(e)
              ou jusqu'à votre demande de suppression; vous pouvez vous
              désinscrire à tout moment via le lien présent dans chaque email.
              Les données de votre compte dans l'application sont conservées tant
              que votre compte existe. Vous pouvez supprimer votre compte et
              toutes les données associées à tout moment, directement depuis
              l'application (onglet Profil → « Supprimer mon compte »), ce qui
              efface définitivement vos données.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Mineurs
            </h2>
            <p className="mt-3">
              L'application n'est pas destinée aux enfants de moins de 15 ans. Si
              vous avez moins de 15 ans, l'accord d'un titulaire de l'autorité
              parentale est nécessaire pour créer un compte.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Vos droits</h2>
            <p className="mt-3">
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
              d'effacement, d'opposition, de limitation et de portabilité de vos données. Vous pouvez
              effacer vous-même l'essentiel de vos données en supprimant votre compte depuis
              l'application. Pour exercer vos autres droits, écrivez à{" "}
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
