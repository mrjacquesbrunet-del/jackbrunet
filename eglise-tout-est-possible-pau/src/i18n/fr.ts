// Dictionnaire français (langue par défaut)
const fr = {
  "nav.firstVisit": "Première visite",
  "nav.about": "À propos",
  "nav.vision": "Vision",
  "nav.team": "Équipe",
  "nav.meetings": "Nos réunions",
  "nav.messages": "Messages",
  "nav.testimonies": "Témoignages",
  "nav.contact": "Contact",
  "nav.newsletter": "Annonces",
  "nav.give": "Soutenir",
  "nav.plan": "Planifie ta visite",
  "nav.menu": "Menu",
  "nav.close": "Fermer",
  "nav.home": "Accueil",

  "footer.legal": "Mentions légales",
  "footer.privacy": "Politique de confidentialité",
  "footer.rights": "Tous droits réservés.",
  "footer.follow": "Suis-nous",
  "footer.visit": "Viens nous voir",

  "a11y.skipToContent": "Aller au contenu principal",
  "a11y.openMenu": "Ouvrir le menu",
  "a11y.closeMenu": "Fermer le menu",
  "a11y.playVideo": "Lire la vidéo",
  "a11y.next": "Suivant",
  "a11y.previous": "Précédent",

  "common.watchOnYoutube": "Voir sur YouTube",
  "common.learnMore": "En savoir plus",
} as const;

export default fr;
export type DictionaryKey = keyof typeof fr;
