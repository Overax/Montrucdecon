# Monteur Vidéo CRM

Ce projet est un CRM pour les monteurs vidéo, configuré pour être déployé sur Firebase. Il utilise les Cloud Functions de Firebase pour sécuriser les appels API.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :
- [Node.js](https://nodejs.org/) (qui inclut npm)
- [Firebase CLI](https://firebase.google.com/docs/cli)

Vous pouvez installer Firebase CLI globalement en utilisant npm :
```bash
npm install -g firebase-tools
```

## Installation

1.  **Clonez le dépôt :**
    ```bash
    git clone <url-du-depot>
    ```
2.  **Accédez au répertoire du projet :**
    ```bash
    cd <repertoire-du-projet>
    ```
3.  **Installez les dépendances du frontend :**
    ```bash
    npm install
    ```
4.  **Installez les dépendances du backend (Cloud Functions) :**
    ```bash
    cd functions
    npm install
    cd ..
    ```

## Configuration

### Frontend

La configuration du projet Firebase pour le frontend est stockée dans le fichier `.env`. Les valeurs nécessaires ont déjà été fournies et configurées. Aucune autre action n'est requise pour la configuration du frontend.

### Backend (Cloud Functions)

Le backend utilise une clé API pour un service externe (par exemple, Gemini) qui doit être configurée en toute sécurité.

1.  **Récupérez votre clé API :**
    Obtenez votre clé API auprès du fournisseur de services que vous souhaitez utiliser.

2.  **Définissez la clé API secrète dans la configuration de Firebase :**
    Exécutez la commande suivante en remplaçant `<VOTRE_CLE_API_GEMINI>` par votre clé API réelle.
    ```bash
    firebase functions:config:set gemini.key="<VOTRE_CLE_API_GEMINI>"
    ```
    Cette commande stocke votre clé en toute sécurité dans l'environnement de votre projet Firebase.

## Construire le projet

Pour construire l'application frontend pour la production, exécutez la commande suivante. Cela créera un répertoire `dist` avec les ressources statiques optimisées.

```bash
npm run build
```

Les Cloud Functions sont compilées depuis TypeScript vers JavaScript lorsque vous les déployez, il n'y a donc pas de commande de construction distincte à exécuter depuis la racine.

## Déploiement sur Firebase

1.  **Connectez-vous à Firebase :**
    Si ce n'est pas déjà fait, connectez-vous à votre compte Firebase à l'aide de la CLI :
    ```bash
    firebase login
    ```

2.  **Déployez tout :**
    Après avoir configuré votre clé API et construit le projet frontend, déployez l'application et les fonctions sur Firebase avec la commande suivante :
    ```bash
    firebase deploy
    ```
    Cette commande déploiera à la fois l'hébergement (votre application React) et les Cloud Functions.

Une fois la commande terminée, votre application sera en ligne à l'URL d'hébergement fournie par Firebase, et vos Cloud Functions seront prêtes à être appelées.
