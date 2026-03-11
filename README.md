# Recouvra+ — API de Gestion du Recouvrement

API REST pour gérer les clients, factures impayées et actions de recouvrement.

## 🚀 Démarrage rapide

```bash
git clone <repository-url>
cd nodeProjectTekup4eme
npm install
npm run dev
```

Accédez à `http://localhost:5500/api-docs` pour la documentation Swagger.

## Technologies

- **Node.js** 22
- **Express.js** v5.2.1 — Framework web
- **MongoDB** + **Mongoose** — Base de données
- **JWT** (jsonwebtoken) — Authentification
- **express-validator** — Validation
- **Swagger** — Documentation API
- **Jest** + **Supertest** — Tests unitaires
- **bcryptjs** — Hashage des mots de passe
- **Helmet** — Sécurité HTTP

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` à la racine :

```env
PORT=5500
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/RECOUVRA_PLUS
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

## Lancement

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:5500`.

## API Endpoints

### Auth
- `POST /api/auth/register` — S'inscrire
- `POST /api/auth/login` — Se connecter
- `POST /api/auth/logout` — Se déconnecter
- `GET /api/auth/me` — Profil utilisateur

### Clients
- `GET /api/clients` — Liste
- `GET /api/clients/:id` — Détail
- `POST /api/clients` — Créer (Agent, Manager)
- `PUT /api/clients/:id` — Modifier (Agent, Manager)
- `DELETE /api/clients/:id` — Supprimer (Manager, Admin)

### Factures
- `GET /api/invoices` — Liste
- `GET /api/invoices/:id` — Détail
- `GET /api/invoices/client/:clientId` — Par client
- `POST /api/invoices` — Créer (Agent, Manager)
- `PUT /api/invoices/:id` — Modifier (Agent, Manager)
- `DELETE /api/invoices/:id` — Supprimer (Manager, Admin)

### Paiements
- `GET /api/payments` — Liste
- `GET /api/payments/invoice/:invoiceId` — Par facture
- `POST /api/payments` — Enregistrer (Agent, Manager)

### Recovery Actions
- `GET /api/recovery-actions` — Liste
- `GET /api/recovery-actions/client/:clientId` — Par client
- `GET /api/recovery-actions/invoice/:invoiceId` — Par facture
- `POST /api/recovery-actions` — Créer (Agent, Manager)
- `PUT /api/recovery-actions/:id` — Modifier (Agent, Manager)
- `DELETE /api/recovery-actions/:id` — Supprimer (Manager, Admin)

### Utilisateurs
- `GET /api/users` — Liste (Admin)
- `GET /api/users/:id` — Détail (Admin, Manager)
- `PUT /api/users/:id` — Modifier (Admin)
- `DELETE /api/users/:id` — Supprimer (Admin)

### Statistiques
- `GET /api/stats/overview` — Résumé global (Manager, Admin)
- `GET /api/stats/invoices` — Data factures (Manager, Admin)
- `GET /api/stats/agents` — Performance agents (Manager, Admin)

## Design Patterns

- **MVC** — Séparation models/controllers/routes
- **Singleton** — Connexion unique à MongoDB (`config/db.js`)
- **Chain of Responsibility** — Chaîne de middlewares (auth → validate → controller → error)
- **Decorator** — `asyncHandler` pour gestion des erreurs async
- **Factory** — Création d'erreurs HTTP personnalisées (`utils/HttpError.js`)
- **Strategy** — Traitement par méthode de paiement (cash/check/transfer)

## Structure du projet

```
├── config/
│   ├── db.js
│   └── swagger.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── clientController.js
│   ├── invoiceController.js
│   ├── paymentController.js
│   ├── recoveryActionController.js
│   └── statsController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validateMiddleware.js
├── models/
│   ├── User.js
│   ├── Client.js
│   ├── Invoice.js
│   ├── Payment.js
│   └── RecoveryAction.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── clients.js
│   ├── invoices.js
│   ├── payments.js
│   ├── recoveryActions.js
│   └── stats.js
├── strategies/
│   └── paymentStrategies.js
├── validators/
│   └── *.js
├── utils/
│   ├── generateToken.js
│   └── HttpError.js
├── tests/
│   ├── auth.test.js
│   ├── client.test.js
│   ├── invoice.test.js
│   ├── payment.test.js
│   ├── recoveryAction.test.js
│   ├── user.test.js
│   └── stats.test.js
├── app.js
├── server.js
├── .env
└── package.json
```

## Rôles et Permissions

| Action | Agent | Manager | Admin |
|--------|:-----:|:-------:|:-----:|
| Voir clients/factures | ✅ | ✅ | ✅ |
| Créer/modifier clients | ✅ | ✅ | ❌ |
| Supprimer clients | ❌ | ✅ | ✅ |
| Voir statistiques | ❌ | ✅ | ✅ |
| Gérer utilisateurs | ❌ | ❌ | ✅ |

## Tests

```bash
npm test
```

Les tests couvrent :
- Authentification (register, login, logout, profil)
- Gestion des clients (CRUD + validation)
- Gestion des factures (CRUD + statuts)
- Paiements avec stratégies
- Actions de recouvrement (5 types)
- Gestion des utilisateurs (admin-only)
- Statistiques (manager-only)

> Créer un fichier `.env.test` pour les tests

## Documentation Swagger

Accessible à : `http://localhost:5500/api-docs`

Tous les endpoints sont documentés avec exemples et schémas.

## Équipe

- **Adem** — Setup, Models, Auth, Client CRUD, Payment (Strategy), Swagger, Tests, README
- **Baha** — Error Middleware, Invoice, Recovery Actions, User Management, Stats
