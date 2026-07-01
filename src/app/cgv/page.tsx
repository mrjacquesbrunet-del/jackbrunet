import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Conditions générales",
  description:
    "Conditions générales de vente du site jackbrunet.com — dons, produits, droit de rétractation et service client.",
};

export default function CGVPage() {
  return (
    <>
      <PageHero
        eyebrow="Légal"
        title={
          <>
            Conditions générales <span className="text-gradient">de vente</span>
          </>
        }
      />

      <section className="container-x py-12">
        <div className="mx-auto max-w-3xl space-y-8 text-night-900/80 leading-relaxed">
          <p className="text-sm text-night-900/50">Dernière mise à jour: juin 2026</p>

          <p>
            Les présentes conditions régissent les dons effectués en faveur du ministère ainsi que,
            à terme, la vente de produits (notamment le livre RHEMA) via le site.
          </p>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Dons et soutien</h2>
            <p className="mt-3">
              Les dons, ponctuels ou mensuels, sont des contributions volontaires destinées à
              soutenir le ministère et ses missions. Ils sont sans contrepartie commerciale. Les
              paiements sont traités de manière sécurisée par Stripe. Un don mensuel peut être
              résilié à tout moment. Les dons ne sont pas remboursables, sauf erreur manifeste
              signalée rapidement à{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="underline underline-offset-2">
                {siteConfig.contactEmail}
              </a>
.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Produits (livre RHEMA)
            </h2>
            <p className="mt-3">
              Le livre RHEMA n'est pas encore disponible à la vente. Dès son ouverture, les
              conditions suivantes s'appliqueront.
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>
                Prix: indiqué sur la page du produit, en euros, toutes taxes comprises
              </li>
              <li>Paiement: sécurisé via Stripe</li>
              <li>
                Livraison: le produit est expédié par l'éditeur à l'adresse indiquée lors de la
                commande ; les délais et frais de port sont précisés avant le paiement
              </li>
              <li>
                Disponibilité: en cas d'indisponibilité, le client est informé et remboursé le cas
                échéant
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Droit de rétractation
            </h2>
            <p className="mt-3">
              Conformément au Code de la consommation, vous disposez d'un délai de quatorze (14)
              jours à compter de la réception d'un produit pour exercer votre droit de rétractation,
              sans avoir à justifier de motif. Pour cela, contactez{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="underline underline-offset-2">
                {siteConfig.contactEmail}
              </a>
. Les frais de retour sont à la charge du client. Ce droit ne s'applique pas aux dons
              ni aux produits numériques téléchargés.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Service client</h2>
            <p className="mt-3">
              Pour toute question relative à une commande ou à un don, contactez{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="underline underline-offset-2">
                {siteConfig.contactEmail}
              </a>
.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
