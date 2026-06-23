# Mode d'emploi — jackbrunet.com

Ton guide simple pour gérer ton site, sans coder.

---

## 1. Les adresses à connaître

| Quoi | Adresse |
|---|---|
| **Ton site** (à partager) | https://jackbrunet.com |
| **Espace d'administration** (modifier le contenu) | https://app.pagescms.org → connecte-toi avec GitHub, ouvre le dépôt `jackbrunet` |
| **Le code** (coulisses, à ne pas confondre avec le site) | github.com/mrjacquesbrunet-del/jackbrunet |
| **Tes contacts / emails** | https://app.brevo.com |
| **Tes dons / paiements** | https://dashboard.stripe.com |

---

## 2. Modifier le contenu du site (sans coder)

Tout passe par l'**espace d'administration** (Pages CMS). Tu modifies, tu enregistres, et le site se met à jour **tout seul** en quelques minutes. Chaque modification crée aussi une **sauvegarde** automatique.

Tu peux modifier, entre autres :
- la **pensée du jour** et le **verset du jour**,
- le **plan de lecture**,
- les **prédications et Shorts** mis en avant (les vidéos s'ajoutent aussi automatiquement depuis ta chaîne YouTube),
- le **livre** (texte, photo, prix, disponibilité),
- la page **À propos**,
- les **paliers de dons** et les **statistiques d'impact**,
- la **mission Madagascar** (voir §5),
- ta **photo**, ton **email de contact**, ton **Instagram**.

> Astuce : après une modification, attends 2-3 minutes puis recharge la page (Ctrl/Cmd + Maj + R) pour voir le résultat.

---

## 3. Suivre tes contacts (Brevo)

Tous les formulaires du site envoient automatiquement les inscriptions dans **Brevo**, dans des listes séparées :

| Formulaire du site | Liste Brevo |
|---|---|
| Newsletter (accueil, pensée, plan…) | Newsletter |
| Pop-up / cadeau PDF | Ebook |
| Liste d'attente du livre | Boutique |
| Page dons | Dons |
| Espace prière (prénom, nom, téléphone, message) | Prière |
| Témoignages (prénom, téléphone, message) | Témoignages |
| Mission Madagascar | Mission |

Pour écrire à ta communauté : **Brevo → Campagnes**. Pense à utiliser une adresse d'expéditeur **@jackbrunet.com** (domaine authentifié = bonne délivrabilité).

---

## 4. Suivre tes dons (Stripe)

Tous les boutons « Donner / Soutenir » mènent à une page de paiement **Stripe** sécurisée. Tu retrouves chaque don dans **dashboard.stripe.com → Paiements**.

- Dons reliés : **don unique**, **Ami (20 €/mois)**, **Partenaire (50 €/mois)**, **Bâtisseur (100 €/mois)**, **Mission Madagascar**.
- ⚠️ À vérifier : que ton **compte bancaire** est bien renseigné dans Stripe (pour recevoir les virements).

---

## 5. Gérer la mission Madagascar

Dans l'espace d'administration, section **Mission** :
- **Montant collecté** (`raisedEur`) : mets-le à jour au fil des dons → la **barre de progression** avance toute seule vers les 10 000 €.
- **Dates / lieu** : modifiables.
- **active** : passe-le sur `false` quand la mission est terminée → le bandeau disparaît de la page d'accueil.

---

## 6. Sauvegardes et sécurité

- Chaque modification (par toi via le CMS, ou par un développeur) est **sauvegardée automatiquement** dans l'historique GitHub : on peut toujours revenir en arrière.
- Tes **clés secrètes ne sont jamais exposées** : Brevo et Stripe gèrent la collecte et les paiements de leur côté.

---

## 7. À finaliser (rappels)

- [ ] Cocher **« Enforce HTTPS »** dans GitHub → Settings → Pages (quand le certificat est prêt).
- [ ] Renseigner le **compte bancaire** dans Stripe.
- [ ] Compléter ta fiche **expéditeur** dans Brevo (adresse @jackbrunet.com).
- [ ] Quand le livre sortira : créer un **Payment Link Stripe** pour RHEMA et passer le produit en « disponible ».

---

*Pour toute évolution (nouvelle page, podcast, vente du livre, application mobile…), il suffit de demander.*
