# Alertes e-mail (nouveaux messages & demandes de prière)

Objectif : recevoir un e-mail à **contact@jackbrunet.com** quand :
1. un membre envoie un **message privé** au Pasteur (onglet Messages) ;
2. quelqu'un dépose une **demande de prière**.

Aucune clé secrète n'est mise dans l'application. La clé Brevo reste un
**secret côté serveur** (Supabase).

---

## 1) Messages privés → Edge Function Supabase

Tout se fait dans le **tableau de bord Supabase** (aucune ligne de commande).

### a. Créer la fonction
1. Supabase → **Edge Functions** → **Deploy a new function** (ou « Create a function »).
2. Nom : `notify-dm`.
3. Colle le contenu de `supabase/functions/notify-dm/index.ts` (ce dépôt).
4. **Désactive** l'option « Verify JWT » pour cette fonction (elle n'envoie
   qu'à ton adresse et ne lit que de vraies lignes → risque nul).
5. **Deploy**.

### b. Ajouter la clé Brevo (secret)
1. Edge Functions → **Manage secrets** (Secrets).
2. Ajoute : nom `BREVO_API_KEY`, valeur = ta **clé API Brevo v3**
   (Brevo → *SMTP & API* → *API Keys*). Ne la mets JAMAIS dans le code.
3. `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont déjà fournis
   automatiquement — rien à faire.

### c. Déclencher sur chaque nouveau message
1. Supabase → **Database** → **Webhooks** → **Create a new hook**.
2. Nom : `on_new_message`.
3. Table : `messages`. Événement : **Insert**.
4. Type : **Supabase Edge Functions** → choisis `notify-dm`
   (l'en-tête d'autorisation est ajouté automatiquement).
5. **Create**.

### d. Expéditeur vérifié
Dans Brevo → *Senders*, vérifie que **contact@jackbrunet.com** est un
expéditeur validé (sinon Brevo refuse l'envoi). C'est en général déjà le cas.

> Test : depuis un autre compte, envoie un message privé au Pasteur.
> Un e-mail « Nouveau message de … » doit arriver à contact@jackbrunet.com.

---

## 2) Demandes de prière → automatisation Brevo (sans code)

La demande de prière arrive déjà dans Brevo (liste **Prière**), avec le texte
dans l'attribut `MESSAGE`, plus `PRENOM`, `NOM`, `EMAIL`, `TELEPHONE`.

1. Brevo → **Automations** → **Create an automation** → *From scratch*.
2. Point de départ (trigger) : **A contact submits a form** → choisis le
   formulaire **Prière** (celui utilisé par l'app).
3. Action : **Send an email** →
   - À : `contact@jackbrunet.com` (envoi interne à toi-même).
   - Objet : `Nouvelle demande de prière`.
   - Corps : inclut les attributs, par ex.
     `{{ contact.PRENOM }} {{ contact.NOM }} ({{ contact.EMAIL }}) : {{ contact.MESSAGE }}`.
4. **Active** l'automatisation.

> Avec le déclencheur « soumission de formulaire », l'e-mail part à **chaque**
> demande (même si la personne a déjà écrit auparavant).

---

---

## 3) Notifications PUSH sur le téléphone des membres (OneSignal)

Pour que **chaque membre** reçoive une notification sur son téléphone quand :
message privé reçu, réponse à son commentaire, commentaire ou réaction sous sa
publication (groupe/prière), etc.

Fonctionnement : chaque interaction crée une ligne dans `public.notifications`
(via `migration-notifications-extra.sql`). Un webhook déclenche la fonction
`notify-push`, qui envoie la notification à la bonne personne via OneSignal.

> Pré-requis : lancer d'abord **`migration-notifications-extra.sql`**
> (SQL Editor) et installer la mise à jour de l'app (l'app associe chaque
> membre à OneSignal via son identifiant — `external_id`).

### a. Créer la fonction
1. Supabase → **Edge Functions** → **Deploy a new function** → nom `notify-push`.
2. Colle le contenu de `supabase/functions/notify-push/index.ts`.
3. **Désactive** « Verify JWT ». **Deploy**.

### b. Ajouter la clé REST OneSignal (secret)
1. OneSignal → ton app → **Settings** → **Keys & IDs** → copie la **REST API Key**.
2. Supabase → Edge Functions → **Manage secrets** → ajoute
   `ONESIGNAL_REST_API_KEY` = cette clé. (Ne la mets jamais dans le code.)

### c. Déclencher sur chaque notification
1. Supabase → **Database** → **Webhooks** → **Create a new hook**.
2. Nom : `on_new_notification`. Table : `notifications`. Événement : **Insert**.
3. Type : **Supabase Edge Functions** → `notify-push`. **Create**.

> Test : depuis un autre compte, commente/aime une de tes publications, ou
> envoie-toi un message. Une notification push doit arriver sur ton téléphone.
> Si OneSignal renvoie `401`, remplace dans la fonction `Basic ${apiKey}` par
> `Key ${apiKey}` et redéploie.

---

## Rappel sécurité
- Les clés (Brevo, OneSignal REST) vivent uniquement dans les **secrets
  Supabase** / les comptes respectifs — jamais dans le dépôt ni dans l'app.
- `notify-dm` n'envoie qu'à `contact@jackbrunet.com` (adresse figée dans le code).
- L'`App ID` OneSignal est public (déjà dans l'app) ; seule la **REST API Key**
  est secrète.
