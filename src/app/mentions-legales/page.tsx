import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site jackbrunet.com, éditeur, hébergement, propriété intellectuelle et responsabilité.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero eyebrow="Légal" title="Mentions légales" />

      <section className="container-x py-12">
        <div className="mx-auto max-w-3xl space-y-8 text-night-900/80 leading-relaxed">
          <p className="text-sm text-night-900/50">Dernière mise à jour: juin 2026</p>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Éditeur du site</h2>
            <p className="mt-3">
              Le présent site est édité par Jack Brunet, entrepreneur individuel (micro-entreprise).
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5">
              <li>Nom: Jack Brunet</li>
              <li>Adresse: 24 rue Maurice Ravel, 64000 Pau</li>
              <li>SIRET: 94164311600010</li>
              <li>
                Email:{" "}
                <a href={`mailto:${siteConfig.contactEmail}`} className="underline underline-offset-2">
                  {siteConfig.contactEmail}
                </a>
              </li>
              <li>TVA: TVA non applicable, article 293 B du Code général des impôts.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Directeur de la publication
            </h2>
            <p className="mt-3">Jack Brunet.</p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Hébergement</h2>
            <p className="mt-3">
              Le site est hébergé par GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco,
              CA 94107, États-Unis ,{" "}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                https://github.com
              </a>
.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">
              Propriété intellectuelle
            </h2>
            <p className="mt-3">
              L'ensemble des contenus présents sur ce site (textes, images, vidéos, logos, éléments
              graphiques) est protégé par le droit d'auteur. Toute reproduction ou utilisation sans
              autorisation préalable est interdite.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-night-900">Responsabilité</h2>
            <p className="mt-3">
              L'éditeur s'efforce d'assurer l'exactitude des informations diffusées, mais ne saurait
              être tenu responsable des erreurs, omissions ou indisponibilités du site. Le site peut
              contenir des liens vers des sites tiers dont l'éditeur n'est pas responsable du
              contenu.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
