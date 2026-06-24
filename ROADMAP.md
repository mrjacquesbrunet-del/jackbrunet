# Feuille de route — jackbrunet.com

Suivi des prochaines étapes (mises à jour au fil des sessions).

---

## ✅ Déjà en ligne
- Site complet sur **jackbrunet.com** (domaine + DNS), icône/logo officiel
- Captation Brevo partout (newsletter, ebook, boutique, dons, prière + téléphone, témoignages + téléphone, mission)
- Stripe : don unique + paliers mensuels (Ami / Partenaire / Bâtisseur) + Mission Madagascar
- Page Mission Madagascar (objectif 10 000 €), page À propos, pages légales (mentions, RGPD, CGV)
- Brevo : domaine authentifié (délivrabilité)
- Éditable sans coder (CMS) + sauvegardes auto

## ⏳ À finaliser côté Jack (rien d'urgent)
- [ ] Renseigner le **compte bancaire** dans Stripe (recevoir les virements)
- [ ] Cocher **« Enforce HTTPS »** (GitHub → Settings → Pages) quand le certificat est prêt
- [ ] Tester un envoi prière/témoignage avec téléphone → vérifier dans Brevo

### Ebooks cadeaux (2 cadeaux DIFFÉRENTS — envoi auto par Brevo)
- [ ] **Jack** : préparer le PDF « 7 jours pour retrouver la paix » (cadeau du pop-up)
- [ ] **Jack** : préparer le PDF « 7 premières méditations de RHEMA » (cadeau de la boutique)
- [ ] **Jack** : créer une **2ᵉ liste** Brevo (ex. « Ebook RHEMA ») + un **2ᵉ formulaire** (me coller le code)
- [ ] **Jack** : créer **2 automatisations** Brevo (déclencheur = ajout à la liste → email avec le lien du PDF)
- [ ] **Claude** : héberger les 2 PDF sur le site (liens propres) + séparer les 2 sources côté site (pop-up → Ebook 1, boutique → Ebook 2)

---

## 1) Audio avec ta voix (prochaine session)
- Exhortations / **pensée du jour en audio** (IA)
- **Passage du jour en audio** (Bible Louis Segond 1910, libre de droits)
- **Voix clonée de Jack** (ElevenLabs)
- Prérequis Jack : créer le compte ElevenLabs, **cloner sa voix → Voice ID**, ajouter le secret **`ELEVENLABS_API_KEY`** sur GitHub
- Technique : génération des MP3 au build (clé en secret), lecteur « ▶ Écouter », cache pour maîtriser le coût

## 2) Engagement (fidélité + temps passé) — faisable sans serveur
- ✅ **Série quotidienne (streak)** + record (mémorisé sur l'appareil)
- ✅ **Progression** : méditations marquées « méditées » + bouton du jour
- ✅ **Favoris** (dévotionnels) + section « Mon parcours »
- ✅ **Cartes à partager** (punchline du jour, format story)
- ✅ **Lecteur Bible intégré** (Louis Segond)
- [ ] Reste à faire : **parcours thématiques** (mini-plans : anxiété, identité, pardon, intimité…)

## 3) Application mobile (les 2 stores)
- ✅ Phase 1 : **PWA installable** (manifest, service worker hors-ligne, icônes 192/512 + maskable, invite d'installation Android/iOS)
- ✅ Phase 2 : **emballage Capacitor** (projets iOS + Android, icônes natives, scripts, guide APP.md)
- ✅ Phase 3a : **rappel quotidien** « pensée du jour » (notification locale, sans serveur)
- [ ] Phase 3b : **pushs à distance** (Firebase + APNs) pour les annonces de masse — optionnel
- [ ] Phase 4-7 : comptes développeurs, build & soumission stores (côté Jack, voir APP.md)
- Phase 3 : **notifications push** (pensée du jour — clé pour l'engagement ET l'acceptation Apple)
- Phase 4 : visuels & fiches store
- Phase 5-7 : comptes développeurs (Google Play 25 $ / Apple 99 $/an), builds & soumissions
- À décider : Jack a-t-il un **Mac** ? (sinon service de build cloud pour iOS)

## 4) Plus tard
- **Vente du livre RHEMA** (Stripe Payment Link + livraison par Jack) à l'ouverture des ventes
- Comptes utilisateurs + synchronisation entre appareils (nécessite un petit serveur) → débloque mur de prière communautaire, favoris synchronisés, journal de prière

---

*Ordre conseillé : Audio → Engagement → Application mobile.*
