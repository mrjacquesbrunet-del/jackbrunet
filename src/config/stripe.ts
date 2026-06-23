/**
 * Liens de paiement Stripe (Payment Links).
 *
 * Comment obtenir un lien : Stripe → Paiements → Liens de paiement → Nouveau
 * → copier l'URL `https://buy.stripe.com/...`.
 *
 * `null` = lien pas encore créé : le bouton correspondant s'affiche désactivé.
 */
export const STRIPE_LINKS = {
  /** Don unique, montant libre. */
  donOnce: null as string | null,
  /** Don mensuel récurrent, montant libre. */
  donMonthly: null as string | null,
  /** Achat du livre RHEMA (activé à l'ouverture des ventes). */
  book: null as string | null,
};
