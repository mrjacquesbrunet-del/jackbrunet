# Espace communautaire de prière — mise en place (Supabase)

Cet espace ajoute : comptes, profils (pseudo + photo), mur de prière
(public / amis / privé), likes ❤️🙏 et commentaires, et un profil qui regroupe
prières + carnet + versets + plans, synchronisé entre appareils.

Tout passe par **Supabase** (auth + base de données managées, gratuites).
Le site reste statique : il parle directement à Supabase. Voici ta partie (~10 min).

---

## 1. Créer le projet Supabase
1. Va sur **https://supabase.com** → **Start your project** → connecte-toi (GitHub ou email).
2. **New project** : nom « jackbrunet », choisis une région **Europe (West)**, crée un
   mot de passe de base (garde-le), puis **Create**. Attends ~2 min.

## 2. Récupérer les 2 clés
- Menu **Project Settings → API**.
- Copie **Project URL** (ex. `https://xxxx.supabase.co`).
- Copie la clé **anon public** (longue chaîne).
> Ces 2 valeurs sont **publiques** (sécurité assurée par les règles RLS) — pas de risque.

## 3. Les ajouter en secrets GitHub
Sur **https://github.com/mrjacquesbrunet-del/jackbrunet/settings/secrets/actions** → **New repository secret** (x2) :
- `NEXT_PUBLIC_SUPABASE_URL` = le Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clé anon public

## 4. Créer les tables (1 copier-coller)
- Dans Supabase : **SQL Editor → New query**.
- Ouvre le fichier **`supabase/schema.sql`** de ce dépôt, copie **tout**, colle, **Run**.
- Ça crée profils, prières, réactions, commentaires, abonnements + les règles de confidentialité.

### Déjà installé l'ancienne version ? (migration abonnements)
Si tu as exécuté `schema.sql` **avant** l'ajout du système d'abonnement (follow) :
- Ouvre **`supabase/migration-follows.sql`**, copie tout, colle dans **SQL Editor → Run**.
- Ça ajoute la bio + les versets préférés au profil, crée la table `follows`
  (s'abonner / se désabonner) et passe la visibilité « abonnés » au bon modèle.
- C'est sans risque à relancer.

### Activer l'upload de photo de profil
Pour que les membres puissent déposer leur photo depuis leur appareil :
- Ouvre **`supabase/migration-avatars.sql`**, copie tout, colle dans **SQL Editor → Run**.
- Ça crée le bucket public `avatars` et autorise chacun à gérer sa propre photo.
- Sans risque à relancer.

## 5. Activer la connexion
Menu **Authentication → Providers** :
- **Email** : déjà activé (connexion par lien magique). Rien à faire.
- **Google** :
  1. Crée des identifiants OAuth sur https://console.cloud.google.com (API & Services → Identifiants → ID client OAuth → type « Application Web »).
  2. Dans « URI de redirection autorisés », mets l'URL indiquée par Supabase (Authentication → Providers → Google : « Callback URL »).
  3. Colle le **Client ID** et **Client Secret** dans Supabase, **Save**.

Menu **Authentication → URL Configuration** :
- **Site URL** : `https://jackbrunet.com`
- **Redirect URLs** : ajoute `https://jackbrunet.com` (et `http://localhost:3000` pour les tests).

## 6. (Optionnel) Photos de profil
- **Storage → New bucket** → nom `avatars` → coche **Public**. (Je gérerai l'upload côté app.)

---

## 7. Préviens-moi
Quand les étapes 1 à 5 sont faites (les 2 secrets ajoutés + le SQL exécuté), **dis-moi « c'est prêt »**.
Je construis alors : page **Connexion**, **profil** (pseudo + photo), **mur de prière**
(public/amis/privé) avec ❤️🙏 + commentaires, puis la **synchronisation** du carnet /
surlignages / plans sur le compte, et enfin les **plans à plusieurs**.

> Récupération des emails : tous les comptes créés apparaissent dans
> Supabase → **Authentication → Users** (exportables, et synchronisables vers Brevo).
