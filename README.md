# Mini-projet Ionic : Gestion des films

Application Ionic + Angular (NgModules, comme en cours) de gestion des films :
inscription avec photo prise par la caméra, playlist de films favoris,
espace administrateur et **matching** entre utilisateurs.

**Stack** (mêmes versions que les TP du cours) : Ionic 8 · Angular 20 · Capacitor 8
(Camera, Preferences) · `@ionic/pwa-elements` · Firebase Realtime Database + Firebase Auth
(via `HttpClient`, API REST) · API TMDB pour la base de départ.

---

## 1. Exigences du prof → où elles sont réalisées

| Exigence | Réalisation |
|---|---|
| Base de départ via l'API MovieDB | `services/gestion-films.ts` → `importerDepuisTmdb()` (bouton dans **Administration**) |
| Inscription : nom, prénom, âge, **photo via caméra** | `auth/register` + `services/photos.ts` (`Camera.getPhoto`, source `Camera`) |
| S'authentifier | `auth/login` + `services/auth.ts` (Firebase Auth REST), session gardée avec Capacitor Preferences |
| Playlist de films favoris | `film-details` (Ajouter / Retirer) + page `favoris` |
| Admin : ajouter des films | page `add-film` (formulaire + aperçu de l'affiche) |
| Admin : **désactiver** un utilisateur (pas supprimer) | page `admin` → champ `actif: false` ; un compte désactivé ne peut plus se connecter |
| Données stockées dans Firebase | Realtime Database : `users/`, `films/`, `favoris/` |
| Matching > 75 % | `services/matching.ts` + page `matching` |

### Notions du cours utilisées
Pages générées avec `ionic g page` (lazy loading, `loadChildren`) · `ion-router-outlet` ·
**Tabs** (Connexion / Inscription) · **SideDrawer** `ion-menu` + `ion-menu-toggle` ·
`ion-back-button` · route avec paramètre `film-details/:id` + `ActivatedRoute.paramMap` ·
**Guards** (`authGuard`, `adminGuard`) · Services + injection de dépendances (`inject`) ·
Formulaires template-driven (`#f="ngForm"`, `ngModel`, `required`) · `HttpClient` ·
`AlertController`, `ToastController`, `LoadingController`, `NavController` ·
cycle de vie `ionViewWillEnter` · `ion-grid` (responsive) · Capacitor Camera + Preferences.

---

## 2. Structure des données (Firebase Realtime Database)

```
users/
  {uid}: { nom, prenom, age, email, photo, role: "user" | "admin", actif: true | false }
films/
  {idFilm}: { titre, resume, annee, affiche, note }
favoris/
  {uid}/
    {idFilm}: true
```

## 3. Calcul du matching

```
taux = (nombre de films en commun / nombre de films différents dans les deux listes) × 100
```
Un utilisateur s'affiche dans la page Matching si **taux > 75 %**
(les comptes désactivés sont exclus).

Exemple : A = {1,2,3,4,5}, B = {1,2,3,4} → 4 en commun / 5 au total = **80 % → match**.
A = {1,2,3,4,5}, C = {1,2} → 2 / 5 = 40 % → pas de match.

---

## 4. Installation

### Démarrage rapide (2 commandes)
Prérequis : **Node.js 20+** et **Git**.
```bash
git clone https://github.com/montaassarr/mini-projet-films.git
cd mini-projet-films
npm run setup
```
Le script demande **3 valeurs** (Firebase `apiKey`, URL de la Realtime Database, clé TMDB),
installe les dépendances puis ouvre l'application sur http://localhost:4200.
Les fois suivantes : `npm start`. Pour changer une clé : relancer `npm run setup`
(Entrée = garder la valeur actuelle).

> Les clés ne sont **jamais** dans le dépôt : `src/environments/environment.ts` et
> `environment.prod.ts` sont générés localement et ignorés par Git
> (modèle : `environment.example.ts`).
> Pour partager la même base de données, demandez les clés au propriétaire du projet Firebase.
> Sinon, créez votre propre projet en suivant les étapes ci-dessous.

### a) Firebase
1. https://console.firebase.google.com → **Ajouter un projet**.
2. **Authentication** → Commencer → activer **E-mail/Mot de passe**.
3. **Realtime Database** → Créer une base de données → démarrer en **mode test**,
   puis dans l'onglet **Règles** mettre (projet de démo) :
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
4. **Paramètres du projet** (⚙️) → Général → ajouter une **application Web** →
   récupérer `apiKey`. L'URL de la base est affichée en haut de la page Realtime Database.

### b) TMDB
Créer un compte sur https://www.themoviedb.org → Paramètres → **API** → copier la **clé API (v3)**.

### c) Configurer et lancer
```bash
npm run setup      # saisir les clés, installer, lancer
npm start          # les fois suivantes (ou : ionic serve)
```
La caméra fonctionne dans le navigateur grâce à `@ionic/pwa-elements` (autoriser la webcam).

### d) Créer le compte administrateur
1. S'inscrire normalement dans l'application.
2. Dans la console Firebase → Realtime Database → `users/{uid}` → changer `role` en `"admin"`.
3. Se déconnecter / reconnecter : le menu **Administration** apparaît.

### e) Android (chapitre Capacitor)
```bash
ionic build
npx cap add android
npx cap copy android
npx cap open android
```

---

## 5. Scénario de démonstration (validation)

1. **Admin** : se connecter → Administration → *Importer la base de départ (TMDB)* → *Ajouter un film*.
2. **Utilisateur 1** : Inscription (photo caméra, nom, prénom, âge) → ajouter 4 films à sa playlist.
3. **Utilisateur 2** : Inscription → ajouter les **mêmes 4 films + 1 autre** → page **Matching** :
   l'utilisateur 1 apparaît avec **80 %**.
4. **Admin** : désactiver l'utilisateur 1 → il ne peut plus se connecter et disparaît du matching
   (son profil reste dans la base).
