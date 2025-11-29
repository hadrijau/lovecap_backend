# Analyse des Routes - LoveCap Backend

## 📋 Liste complète des Routes

### 🔵 Routes User (`/api/users`)

| Route | Méthode | Endpoint | Statut Actuel | Contrôleur |
|-------|---------|----------|---------------|------------|
| Créer un utilisateur | POST | `/api/users` | **Public** | `createUser` |
| Vérifier l'email | POST | `/api/users/emailExists` | **Public** | `checkEmail` |
| Connexion | POST | `/api/users/login` | **Public** | `loginUser` |
| Obtenir les utilisateurs (swipe) | GET | `/api/users/except/:id/:interestedBy/:ageOfInterest` | **Public** | `getUsers` |
| Obtenir un utilisateur | GET | `/api/users/:id` | **Public** | `getUser` |
| Obtenir un utilisateur par email | GET | `/api/users/email/:email` | **Public** | `getUserByEmail` |
| Mettre à jour un utilisateur | PUT | `/api/users/:id` | **Public** | `updateUser` |
| Supprimer un utilisateur | DELETE | `/api/users/:id` | **Public** (commentaire dit Private/admin) | `deleteUser` |

### 🔵 Routes Match (`/api/match`)

| Route | Méthode | Endpoint | Statut Actuel | Contrôleur |
|-------|---------|----------|---------------|------------|
| Créer un match | POST | `/api/match` | **Public** | `addMatch` |
| Obtenir les matches | GET | `/api/match/:id` | **Public** | `getMatches` |
| Obtenir les matches avec infos utilisateurs | GET | `/api/match/usersInfo/:id` | **Public** | `getMatchesWithUserInfos` |
| Supprimer le dernier match (rewind) | DELETE | `/api/match/:id` | **Public** | `deleteLastMatch` |
| Supprimer un match spécifique | DELETE | `/api/match/:id/:matchId` | **Public** | `deleteMatch` |

### 🔵 Routes Message (`/api/message`)

| Route | Méthode | Endpoint | Statut Actuel | Contrôleur |
|-------|---------|----------|---------------|------------|
| Créer un thread | POST | `/api/message` | **Public** | `createThread` |
| Mettre à jour un thread | PUT | `/api/message` | **Public** | `updateThread` |
| Obtenir les messages d'un utilisateur | GET | `/api/message/:id` | **Public** | `getMessages` |
| Obtenir le nombre de messages non lus | GET | `/api/message/:id/unread` | **Public** | `getNumberOfUnreadMessages` |
| Créer un message dans un thread | POST | `/api/message/thread` | **Public** | `createMessage` |
| Obtenir les messages d'un thread | GET | `/api/message/thread/:id` | **Public** | `getInnerMessages` |
| Supprimer un thread | DELETE | `/api/message/:id` | **Public** (commentaire dit Private/admin) | `deleteThread` |

### 🔵 Routes Email (`/api/email`)

| Route | Méthode | Endpoint | Statut Actuel | Contrôleur |
|-------|---------|----------|---------------|------------|
| Envoyer un email | POST | `/api/email` | **Public** | `sendEmail` |

---

## ⚠️ État Actuel de la Sécurité

**PROBLÈME CRITIQUE** : **TOUTES les routes sont actuellement publiques !**

Il n'existe **aucun middleware d'authentification** dans le code. Bien que JWT soit généré lors de la connexion/inscription, il n'est **jamais vérifié** dans les routes.

Cela signifie que :
- N'importe qui peut modifier n'importe quel utilisateur
- N'importe qui peut voir les messages privés
- N'importe qui peut créer/supprimer des matches
- N'importe qui peut accéder aux données personnelles

---

## ✅ Recommandations : Routes qui DEVRAIENT être Publiques

### Routes User
- ✅ `POST /api/users` - Créer un utilisateur (inscription)
- ✅ `POST /api/users/emailExists` - Vérifier si un email existe
- ✅ `POST /api/users/login` - Connexion

### Routes Email
- ⚠️ `POST /api/email` - Envoyer un email (devrait être protégé contre le spam)

---

## 🔒 Recommandations : Routes qui DEVRAIENT être Privées

### Routes User
- 🔒 `GET /api/users/:id` - Obtenir un utilisateur (devrait vérifier que l'utilisateur peut voir ce profil)
- 🔒 `GET /api/users/email/:email` - Obtenir un utilisateur par email (devrait être privé)
- 🔒 `GET /api/users/except/:id/:interestedBy/:ageOfInterest` - Obtenir les utilisateurs pour swipe (devrait vérifier l'authentification)
- 🔒 `PUT /api/users/:id` - Mettre à jour un utilisateur (devrait vérifier que l'utilisateur modifie son propre profil)
- 🔒 `DELETE /api/users/:id` - Supprimer un utilisateur (devrait être privé, et admin pour supprimer d'autres utilisateurs)

### Routes Match
- 🔒 `POST /api/match` - Créer un match (devrait vérifier l'authentification)
- 🔒 `GET /api/match/:id` - Obtenir les matches (devrait vérifier que l'utilisateur demande ses propres matches)
- 🔒 `GET /api/match/usersInfo/:id` - Obtenir les matches avec infos (devrait vérifier l'authentification)
- 🔒 `DELETE /api/match/:id` - Supprimer le dernier match (devrait vérifier l'authentification)
- 🔒 `DELETE /api/match/:id/:matchId` - Supprimer un match spécifique (devrait vérifier l'authentification)

### Routes Message
- 🔒 `POST /api/message` - Créer un thread (devrait vérifier l'authentification)
- 🔒 `PUT /api/message` - Mettre à jour un thread (devrait vérifier l'authentification)
- 🔒 `GET /api/message/:id` - Obtenir les messages (devrait vérifier que l'utilisateur fait partie du thread)
- 🔒 `GET /api/message/:id/unread` - Obtenir le nombre de messages non lus (devrait vérifier l'authentification)
- 🔒 `POST /api/message/thread` - Créer un message (devrait vérifier l'authentification)
- 🔒 `GET /api/message/thread/:id` - Obtenir les messages d'un thread (devrait vérifier que l'utilisateur fait partie du thread)
- 🔒 `DELETE /api/message/:id` - Supprimer un thread (devrait être privé, admin pour supprimer n'importe quel thread)

### Routes Email
- 🔒 `POST /api/email` - Envoyer un email (devrait être protégé contre le spam, rate limiting)

---

## 🛡️ Actions Requises

1. ✅ **Ajouter du rate limiting** pour les routes publiques sensibles (email, login, inscription) - **FAIT**
2. **Créer un middleware d'authentification** qui vérifie le JWT token
3. **Créer un middleware de vérification de propriétaire** pour les routes qui nécessitent que l'utilisateur modifie/consulte ses propres données
4. **Ajouter le middleware aux routes appropriées**
5. **Implémenter un système de rôles** (user/admin) pour les routes admin

## ✅ Rate Limiting Implémenté

### Configuration actuelle :

- **Login** (`POST /api/users/login`) : 5 tentatives par 15 minutes
- **Inscription** (`POST /api/users`) : 3 créations par heure
- **Vérification email** (`POST /api/users/emailExists`) : 10 requêtes par minute
- **Envoi email** (`POST /api/email`) : 5 envois par heure

Les rate limiters sont configurés dans `/middleware/rateLimiter.ts` et appliqués dans les routes correspondantes.

---

## 📊 Résumé

- **Total de routes** : 20 routes
- **Routes actuellement publiques** : 20 (100%)
- **Routes qui devraient être publiques** : 3 (15%)
- **Routes qui devraient être privées** : 17 (85%)

**URGENCE** : Mise en place d'un système d'authentification immédiatement nécessaire pour sécuriser l'application.

