# Monteur Vidéo CRM

Ce projet est un CRM pour les monteurs vidéo, configuré pour être déployé sur Firebase.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :
- [Node.js](https://nodejs.org/) (qui inclut npm)
- [Firebase CLI](https://firebase.google.com/docs/cli)

Vous pouvez installer Firebase CLI globalement en utilisant npm :
```bash
npm install -g firebase-tools
```

## Installation

1.  Clonez le dépôt :
    ```bash
    git clone <url-du-depot>
    ```
2.  Accédez au répertoire du projet :
    ```bash
    cd <repertoire-du-projet>
    ```
3.  Installez les dépendances :
    ```bash
    npm install
    ```

## Configuration

La configuration du projet Firebase est stockée dans le fichier `.env`. Les valeurs nécessaires ont déjà été fournies et configurées. Aucune autre action n'est requise pour la configuration.

## Construire le projet

Pour construire l'application pour la production, exécutez la commande suivante. Cela créera un répertoire `dist` avec les ressources statiques optimisées.

```bash
npm run build
```

## Déploiement sur Firebase

1.  **Connectez-vous à Firebase :**
    Si ce n'est pas déjà fait, connectez-vous à votre compte Firebase à l'aide de la CLI :
    ```bash
    firebase login
    ```

2.  **Déployez :**
    Après avoir construit le projet, déployez l'application sur Firebase Hosting avec la commande suivante :
    ```bash
    firebase deploy --only hosting
    ```

Une fois la commande terminée, votre application sera en ligne à l'URL d'hébergement fournie par Firebase.
