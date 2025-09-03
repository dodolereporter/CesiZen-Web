# Déploiement de l'Application Next.js

Ce document explique comment déployer l'application dans différents environnements à l'aide de Docker.

## Prérequis

- Docker et Docker Compose installés
- Node.js 21+ et npm/pnpm pour le développement local

## Structure des environnements

L'application peut être déployée dans trois environnements distincts :

- **Développement** : Pour les tests en cours de développement
- **Préproduction** : Pour les tests avant mise en production
- **Production** : Pour l'environnement de production

## Fichiers d'environnement

- `.env.development` : Variables d'environnement pour le développement
- `.env.preprod` : Variables d'environnement pour la préproduction
- `.env.production` : Variables d'environnement pour la production

## Commandes de déploiement

Les scripts de déploiement sont compatibles avec Linux/macOS et Windows. Exécutez les commandes depuis la racine du
projet.

### Déploiement en développement

```bash
npm run deploy:dev
# ou directement sous Linux/macOS
sh scripts/deploy.sh dev
# ou directement sous Windows
scripts\deploy.bat dev
```

### Déploiement en préproduction

```bash
npm run deploy:preprod
# ou directement sous Linux/macOS
sh scripts/deploy.sh preprod
# ou directement sous Windows
scripts\deploy.bat preprod
```

### Déploiement en production

```bash
npm run deploy:prod
# ou directement sous Linux/macOS
sh scripts/deploy.sh prod
# ou directement sous Windows
scripts\deploy.bat prod
```

## Ports par défaut

- Développement : http://localhost:3000
- Préproduction : http://localhost:80 (port standard HTTP)
- Production : http://localhost:80 (port standard HTTP)

## Configuration de l'API

Les URL de l'API sont configurées dans les fichiers d'environnement correspondants :

- Développement : `http://api-dev:8080`
- Préproduction : `http://api-preprod:8080`
- Production : `http://api-prod:8080`

Vous pouvez les modifier selon votre infrastructure spécifique.