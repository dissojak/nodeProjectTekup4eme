# Recouvra+ — API de Gestion du Recouvrement

API REST pour gérer les clients, factures impayées et actions de recouvrement.

## Installation

```bash
git clone <repository-url>
cd nodeProjectTekup4eme
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
