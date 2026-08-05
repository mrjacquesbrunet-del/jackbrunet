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
 * Lien de PRÉCOMMANDE du livre RHEMA (boutique Shopify quand elle sera prête,
 * ou lien Stripe). Tant qu'il est null, la page /boutique affiche la liste
 * d'attente (email + ebook offert) à la place du bouton d'achat.
 */
export const RHEMA_PREORDER_URL: string | null = null;

/**
 * Liens de paiement mensuels, un par palier (la clé = le nom du palier dans
 * content/support-tiers.json). `null` = lien pas encore créé.
 */
export const STRIPE_MONTHLY: Record<string, string | null> = {
  Ami: "https://buy.stripe.com/3cI7sMe6CfVU4Ip6Aga3u01",
  Partenaire: "https://donate.stripe.com/bJe7sMe6CgZY0s9f6Ma3u02",
  Bâtisseur: "https://donate.stripe.com/cNi5kEgeK8tseiZ3o4a3u03",
};
