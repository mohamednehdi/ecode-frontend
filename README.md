# eCode : site web (Angular)

[![CI](https://github.com/mohamednehdi/ecode-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/mohamednehdi/ecode-frontend/actions/workflows/ci.yml)

Le site de la plateforme de localisation et d'extraction de codes-barres (projet de fin d'études, Progress Engineering). Il a trois parties :

- la **page publique gratuite** (`/`) : on dépose un PDF ou une image, les codes lus s'affichent sur le document ;
- la **connexion de l'administrateur** (`/login`, avec réinitialisation du mot de passe) ;
- le **back office** (`/dashboard`, administrateurs seulement) : clés API et statistiques d'utilisation.

Le backend (Flask) est dans le dépôt [ecode-backend](https://github.com/mohamednehdi/ecode-backend). L'adresse du backend se règle à un seul
endroit : `src/app/api.config.ts`.

## Démarrage

```powershell
npm ci                  # installe les dépendances (le fichier .npmrc est nécessaire : voir plus bas)
ng serve                # http://localhost:4200  (le backend doit tourner sur http://localhost:5000)
```

## Tests

| Commande | Ce que ça fait |
|---|---|
| `ng test` | tests unitaires en mode « suivi » (Karma + Jasmine, ouvre Chrome) |
| `npm run test:ci` | les mêmes, une seule fois, sans fenêtre, avec la couverture (ce que lance l'intégration continue) |
| `npm run e2e` | test de bout en bout (Playwright) : un vrai navigateur sur le vrai site et le vrai backend |

**Tests unitaires : 86**, exécutés dans un ordre aléatoire. Couverture mesurée le 20/11/2026 : **95,8 % des lignes**, 95,0 % des instructions,
92,9 % des fonctions, 73,6 % des branches (20 fichiers ; les fichiers de modules et de routage, simples déclarations, n'en font pas partie).
Ils couvrent : l'authentification et la garde d'accès administrateur, l'intercepteur HTTP (le jeton n'est jamais envoyé à un autre site),
les formulaires (connexion, réinitialisation du mot de passe en trois étapes, clés API), la page publique, la page de statistiques et
les calculs d'axes des graphiques.

**Test de bout en bout** (`e2e/main-flow.spec.ts`) : dépôt d'une image avec un code QR sur la page publique ; refus d'un mauvais type de
fichier ; accès refusé à un visiteur ; mauvais mot de passe ; puis tout le parcours de l'administrateur : connexion, création d'une clé,
appel du service web avec cette clé, apparition de la requête dans les statistiques, désactivation de la clé (le service la refuse) et suppression.
Il suppose un backend et un site en marche et lit `BASE_URL`, `API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (voir `playwright.config.ts`).

## Intégration continue

`.github/workflows/ci.yml` lance à chaque `push` et chaque demande de fusion : la construction du site, les tests unitaires avec couverture, puis
le test de bout en bout (le job récupère le dépôt du backend ; s'il est privé, créer un secret `BACKEND_REPO_TOKEN`). Détails et limites :
`docs/TESTING_CI_F7.md` dans le dépôt du backend.

## À savoir : le fichier `.npmrc`

Les paquets Angular du projet sont sur des versions `17.3.x` différentes avec des dépendances croisées exactes : sans l'option
`legacy-peer-deps=true` du fichier `.npmrc`, un simple `npm ci` s'arrête sur un conflit. Le remède propre (aligner tous les paquets `@angular/*`
sur la même version) n'a pas été fait.
