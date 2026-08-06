/**
 * Liens de paiement Stripe (Payment Links).
 *
 * Comment obtenir un lien: Stripe → Paiements → Liens de paiement → Nouveau
 * → copier l'URL `https://buy.stripe.com/...`.
 *
 * `null` = lien pas encore créé: le bouton correspondant s'affiche désactivé.
 */
export const STRIPE_LINKS = {
  /** Don unique, montant libre. */
  donOnce: "https://buy.stripe.com/14A5kEaUqfVU5MtgaQa3u00" as string | null,
  /** Achat du livre RHEMA (activé à l'ouverture des ventes). */
  book: null as string | null,
  /** Don dédié à la mission Madagascar (objectif 10 000 €). */
  missionMadagascar: "https://donate.stripe.com/28EfZi5A6bFEeiZaQwa3u04" as string | null,
};

/**
 * Boutique Shopify RHEMA : les pages produits définitives. `null` = pas
 * encore créée (la ligne d'offre reste non cliquable).
 */
export const SHOP_LINKS = {
  livre:
    "https://ippngf-9s.myshopify.com/products/rhema-365-revelations-bibliques-livre" as
      | string
      | null,
  carnet:
    "https://ippngf-9s.myshopify.com/products/carnet-de-meditation-rhema" as string | null,
  pack: "https://ippngf-9s.myshopify.com/products/pack-rhema-livre-carnet" as string | null,
  ebook:
    "https://ippngf-9s.myshopify.com/products/rhema-e-book-365-revelations-bibliques" as
      | string
      | null,
};

/**
 * Lien du bouton « Précommander maintenant » de la page /boutique : le PACK
 * (panier moyen le plus élevé), sinon le livre. Tant que tout est null, la
 * page affiche la liste d'attente (email + ebook offert).
 */
export const RHEMA_PREORDER_URL: string | null = SHOP_LINKS.pack ?? SHOP_LINKS.livre;

/**
 * Liens de paiement mensuels, un par palier (la clé = le nom du palier dans
 * content/support-tiers.json). `null` = lien pas encore créé.
 */
export const STRIPE_MONTHLY: Record<string, string | null> = {
  Ami: "https://buy.stripe.com/3cI7sMe6CfVU4Ip6Aga3u01",
  Partenaire: "https://donate.stripe.com/bJe7sMe6CgZY0s9f6Ma3u02",
  Bâtisseur: "https://donate.stripe.com/cNi5kEgeK8tseiZ3o4a3u03",
};
