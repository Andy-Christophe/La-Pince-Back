# 🚀 Documentation de déploiement – Projet *LaPince*

## 🧩 Contexte du projet

**LaPince** est une application web permettant aux utilisateurs de suivre leurs dépenses, créer des budgets personnalisés et visualiser leurs statistiques financières.  
Le projet est développé en **Node.js** avec **Express.js** pour le backend, et utilise **PostgreSQL** comme base de données.  

Cette documentation décrit la procédure complète pour **déployer le backend sur Railway**, afin de le rendre accessible en ligne de manière sécurisée et automatisée.

---

## ⚙️ Technologies utilisées

- **Langage :** JavaScript (Node.js)
- **Framework :** Express.js
- **Base de données :** PostgreSQL
- **Hébergement :** [Railway](https://railway.app)
- **Gestionnaire de version :** Git / GitHub

---

## 📁 Structure du projet (simplifiée)
LaPinceBack/
│
├── src/
│ └── controllers/
│ └── middlewares/
│ └── models/
│ └── routes/
│ └── utils/
│ ├── database.js
│ ├── router.js
│
├── package.json
├── .env.example
├── index.js

---
## 🔐 Variables d’environnement

Avant de lancer le déploiement, il est nécessaire de configurer les variables suivantes :

| Nom de la variable | Description | Exemple de valeur (non réelle) |
|--------------------|--------------|--------------------------------|
| `PG_URL` | Chaîne de connexion PostgreSQL fournie par Railway | `postgresql://user:password@host:port/dbname` |
| `JWT_SECRET` | Clé secrète utilisée pour les tokens JWT | `ma_cle_secrete` |

> ⚠️ **Important :**  
> Les vraies valeurs de ces variables **ne doivent pas apparaître dans le code ni dans la documentation.**  
> Elles doivent être renseignées :
> - Localement dans un fichier `.env` (non versionné dans GitHub)
> - Ou directement dans l’onglet **Variables** du projet sur Railway

---
## 🧰 Fichier `.env.example`

Un fichier d’exemple (`.env.example`) est fourni pour indiquer les variables nécessaires sans exposer de données sensibles :

```bash
# .env.example
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_secret_key
```
## 🚀 Procédure de déploiement sur Railway

### 1. Préparation

- Vérifier que le backend fonctionne correctement en local :
  ```bash
  npm install
  npm start
  ```
- Confirmer que toutes les dépendances sont bien listées dans package.json.
- Ajouter le fichier .env au .gitignore pour éviter qu’il ne soit versionné.
- Créer un fichier .env.example afin d’indiquer les variables d’environnement nécessaires sans exposer de valeurs sensibles.

### 2. Création du projet sur Railway
- Se rendre sur https://railway.app et se connecter à son compte.
- Cliquer sur New Project → Deploy from GitHub repo.
- Sélectionner le dépôt GitHub contenant le backend du projet LaPince.
- Railway détecte automatiquement qu’il s’agit d’un projet Node.js / Express.

---

### 3. Configuration du service
1. Une fois le projet créé, ouvrir l’onglet Variables.
2. Ajouter les variables d’environnement nécessaires :
    - DATABASE_URL
    - JWT_SECRET
3. Vérifier les commandes de build et de démarrage :
```bash
    Build Command : npm install
    Start Command : npm start
```
4. Railway télécharge le dépôt, installe les dépendances et lance automatiquement le déploiement.
5. Attendre la fin du déploiement (le statut passe à Running).

### 4. Tests et validation

- Une fois le déploiement terminé, Railway fournit une URL publique (exemple : https://lapince-production.up.railway.app).
- Tester les principales routes de l’API via Postman ou curl : GET https://lapince-production.up.railway.app/api/users
- Vérifier les logs dans l’interface Railway pour s’assurer qu’aucune erreur n’est survenue.
- Confirmer que la base PostgreSQL est bien connectée et que les données sont accessibles.

### ✅ Résultat attendu

- Le backend LaPince est désormais en ligne et fonctionnel.
- Le déploiement est automatisé à chaque git push sur la branche principale du dépôt GitHub.
- Les variables sensibles sont sécurisées et gérées directement dans Railway.














