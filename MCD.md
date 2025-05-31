# MODÈLE CONCEPTUEL DE DONNÉES (MCD)
## Application de Gestion des Emplois du Temps

---

## 1. VUE D'ENSEMBLE

Le MCD de l'application de gestion des emplois du temps est conçu pour supporter un système complet de planification académique avec trois types d'utilisateurs principaux et leurs interactions avec les ressources pédagogiques.

---

## 2. ENTITÉS PRINCIPALES

### 2.1 ADMINISTRATEUR
**Description :** Gestionnaire principal du système avec tous les privilèges

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| id_admin | String | PK, Unique, Required | Identifiant unique administrateur |
| nom | String | Required | Nom de famille |
| prenom | String | Required | Prénom |
| adresse | String | Required | Adresse physique |
| telephone | String | Required | Numéro de téléphone |
| email | String | Unique, Required | Adresse email |
| mot_de_passe | String | Required, Hashed | Mot de passe chiffré |

### 2.2 CHEF_DE_CLASSE
**Description :** Responsable pédagogique d'une classe spécifique

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| matricule | String | PK, Unique, Required | Matricule unique |
| nom | String | Required | Nom de famille |
| prenom | String | Required | Prénom |
| telephone | String | Required | Numéro de téléphone |
| adresse | String | Required | Adresse physique |
| email | String | Unique, Required | Adresse email |
| mot_de_passe | String | Required, Hashed | Mot de passe chiffré |
| classe | String | Required | Classe assignée |
| timestamps | Date | Auto | Dates création/modification |

### 2.3 PROFESSEUR
**Description :** Enseignant avec disponibilités et matières

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| id_prof | String | PK, Unique, Required | Identifiant unique professeur |
| nom | String | Required | Nom de famille |
| prenom | String | Required | Prénom |
| adresse | String | Required | Adresse physique |
| telephone | String | Required | Numéro de téléphone |
| disponibilite | Array | - | Créneaux disponibles |

**Structure Disponibilité :**
```json
{
  "jour": "Enum['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']",
  "creneaux": ["Enum['08h30-11h30', '12h00-15h00', '15h30-18h30']"]
}
```

### 2.4 PROGRAMME
**Description :** Programme d'études (Licence, Master, etc.)

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | Identifiant MongoDB |
| nom | String | Required | Nom du programme |
| niveau | String | Required | Niveau d'études |
| duree | Number | Required | Durée en semestres |

### 2.5 COURS
**Description :** Matière enseignée dans un programme

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | Identifiant MongoDB |
| nom | String | Required | Nom du cours |
| code | String | Unique, Required | Code matière |
| credits | Number | Required | Nombre de crédits |
| programme | ObjectId | FK, Required | Référence Programme |
| professeur_requis | ObjectId | FK | Professeur assigné |

### 2.6 SALLE
**Description :** Salle de cours avec capacité et équipements

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | Identifiant MongoDB |
| nom | String | Required | Nom/Numéro salle |
| capacite | Number | Required | Nombre de places |
| equipements | Array | - | Liste équipements |
| batiment | String | Required | Bâtiment |

### 2.7 EMPLOI_DU_TEMPS
**Description :** Planning d'un groupe pour un programme

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | Identifiant MongoDB |
| id_edt | String | Unique | Identifiant métier |
| programme | ObjectId | FK, Required | Référence Programme |
| groupe | Number | Required, Min:1 | Numéro de groupe |
| seances | Array | - | Liste des séances |
| dateCreation | Date | Auto | Date de création |

**Structure Séance :**
```json
{
  "cours": "ObjectId (ref: Cours)",
  "professeur": "ObjectId (ref: Professeur)",
  "salle": "ObjectId (ref: Salle)",
  "jour": "Enum['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']",
  "creneau": "Enum['08h30-11h30', '12h00-15h00', '15h30-18h30']"
}
```

### 2.8 NOTIFICATION
**Description :** Système de notifications pour les utilisateurs

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | Identifiant MongoDB |
| destinataire | ObjectId | FK, Required | Utilisateur destinataire |
| type_destinataire | String | Enum, Required | Type utilisateur |
| titre | String | Required | Titre notification |
| message | String | Required | Contenu message |
| type | String | Enum, Required | Type notification |
| lu | Boolean | Default: false | Statut lecture |
| dateCreation | Date | Auto | Date création |

### 2.9 ATTRIBUTION_TEMPORAIRE
**Description :** Gestion des attributions temporaires de cours

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | Identifiant MongoDB |
| cours | ObjectId | FK, Required | Référence Cours |
| professeur | ObjectId | FK, Required | Référence Professeur |
| salle | ObjectId | FK, Required | Référence Salle |
| jour | String | Enum, Required | Jour semaine |
| creneau | String | Enum, Required | Créneau horaire |
| statut | String | Enum, Required | Statut attribution |
| dateCreation | Date | Auto | Date création |

---

## 3. RELATIONS

### 3.1 Relations Principales

```
CHEF_DE_CLASSE (1) ←→ (1) CLASSE
PROFESSEUR (1) ←→ (N) COURS
PROGRAMME (1) ←→ (N) COURS
EMPLOI_DU_TEMPS (1) ←→ (1) PROGRAMME
EMPLOI_DU_TEMPS (1) ←→ (N) SEANCE
SEANCE (N) ←→ (1) COURS
SEANCE (N) ←→ (1) PROFESSEUR
SEANCE (N) ←→ (1) SALLE
NOTIFICATION (N) ←→ (1) UTILISATEUR
```

### 3.2 Contraintes d'Intégrité

#### Contraintes Temporelles
- Un professeur ne peut avoir qu'une séance par créneau
- Une salle ne peut accueillir qu'une séance par créneau
- Les créneaux doivent respecter les disponibilités des professeurs

#### Contraintes Métier
- Un chef de classe ne peut gérer qu'une seule classe
- Les cours doivent être assignés à des professeurs compétents
- La capacité des salles doit être respectée

#### Contraintes de Sécurité
- Tous les mots de passe sont hachés avec bcrypt
- Les emails doivent être uniques dans le système
- Les identifiants métier doivent être uniques

---

## 4. DIAGRAMME ENTITÉ-RELATION

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  ADMINISTRATEUR │    │  CHEF_DE_CLASSE │    │   PROFESSEUR    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id_admin (PK)   │    │ matricule (PK)  │    │ id_prof (PK)    │
│ nom             │    │ nom             │    │ nom             │
│ prenom          │    │ prenom          │    │ prenom          │
│ adresse         │    │ telephone       │    │ adresse         │
│ telephone       │    │ adresse         │    │ telephone       │
│ email           │    │ email           │    │ disponibilite   │
│ mot_de_passe    │    │ mot_de_passe    │    └─────────────────┘
└─────────────────┘    │ classe          │              │
                       │ timestamps      │              │
                       └─────────────────┘              │
                                                        │
┌─────────────────┐    ┌─────────────────┐              │
│    PROGRAMME    │    │      COURS      │              │
├─────────────────┤    ├─────────────────┤              │
│ _id (PK)        │───→│ _id (PK)        │              │
│ nom             │    │ nom             │              │
│ niveau          │    │ code            │              │
│ duree           │    │ credits         │              │
└─────────────────┘    │ programme (FK)  │              │
         │             │ professeur (FK) │←─────────────┘
         │             └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ EMPLOI_DU_TEMPS │    │     SEANCE      │
├─────────────────┤    ├─────────────────┤
│ _id (PK)        │───→│ cours (FK)      │
│ id_edt          │    │ professeur (FK) │
│ programme (FK)  │    │ salle (FK)      │
│ groupe          │    │ jour            │
│ seances         │    │ creneau         │
│ dateCreation    │    └─────────────────┘
└─────────────────┘              │
                                 │
                                 ▼
                       ┌─────────────────┐
                       │      SALLE      │
                       ├─────────────────┤
                       │ _id (PK)        │
                       │ nom             │
                       │ capacite        │
                       │ equipements     │
                       │ batiment        │
                       └─────────────────┘
```

---

## 5. RÈGLES DE GESTION

### 5.1 Gestion des Utilisateurs
- Chaque type d'utilisateur a un identifiant unique
- Les mots de passe sont automatiquement hachés avant stockage
- Les emails doivent être uniques dans tout le système

### 5.2 Gestion des Emplois du Temps
- Un emploi du temps est lié à un programme et un groupe
- Chaque séance doit avoir un cours, un professeur et une salle
- Les créneaux sont standardisés (3 par jour, 6 jours/semaine)

### 5.3 Gestion des Disponibilités
- Les professeurs déclarent leurs disponibilités par jour et créneau
- Le système respecte ces disponibilités lors de l'attribution
- Les modifications de disponibilité impactent les emplois du temps existants

### 5.4 Gestion des Conflits
- Aucun professeur ne peut être dans deux endroits simultanément
- Aucune salle ne peut accueillir deux cours simultanément
- Le système détecte et signale automatiquement les conflits

---

## 6. INDEX ET PERFORMANCES

### 6.1 Index Recommandés
```javascript
// Administrateur
{ "id_admin": 1 }
{ "email": 1 }

// ChefDeClasse  
{ "matricule": 1 }
{ "email": 1 }
{ "classe": 1 }

// Professeur
{ "id_prof": 1 }
{ "disponibilite.jour": 1 }

// EmploiDuTemps
{ "programme": 1, "groupe": 1 }
{ "seances.jour": 1, "seances.creneau": 1 }

// Cours
{ "code": 1 }
{ "programme": 1 }
```

### 6.2 Optimisations
- Utilisation de références MongoDB pour les relations
- Index composites pour les requêtes fréquentes
- Pagination pour les listes importantes
- Cache des emplois du temps générés

---

**Version :** 1.0  
**Date :** 23 Mai 2025  
**Auteur :** Équipe de Développement 