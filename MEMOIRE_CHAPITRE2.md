# CHAPITRE 2 : ANALYSE ET SPÉCIFICATIONS DU PROJET

## 2.1 Recueil des Besoins

### 2.1.1 Solution Existante

Avant le développement de notre application, le département de Génie Informatique de l'Université Nongo Conakry utilisait un système manuel de gestion des emplois du temps caractérisé par :

**Processus Actuel :**
1. **Collecte manuelle** des disponibilités des professeurs via formulaires papier
2. **Planification sur tableur Excel** par l'administration
3. **Vérification manuelle** des conflits de salles et professeurs
4. **Distribution papier** des emplois du temps finalisés
5. **Modifications ad-hoc** sans traçabilité

**Problèmes Identifiés :**
- **Temps de traitement** : 2-3 semaines pour générer un emploi du temps
- **Taux d'erreur** : ~15% de conflits non détectés initialement
- **Rigidité** : Difficultés pour intégrer les changements de dernière minute
- **Communication** : Délais importants pour informer les changements
- **Archivage** : Perte fréquente des versions antérieures

### 2.1.2 Analyse des Parties Prenantes

**Acteurs Primaires :**

1. **Administrateurs (3 personnes)**
   - Responsabilités : Gestion globale, configuration système
   - Besoins : Interface complète, rapports détaillés, contrôle total
   - Fréquence d'utilisation : Quotidienne

2. **Chefs de Classe (8 personnes)**
   - Responsabilités : Suivi emploi du temps de leur classe
   - Besoins : Consultation, modifications mineures, communication
   - Fréquence d'utilisation : Hebdomadaire

3. **Professeurs (25 personnes)**
   - Responsabilités : Déclaration disponibilités, consultation planning
   - Besoins : Interface simple, notifications, accès mobile
   - Fréquence d'utilisation : Bi-hebdomadaire

**Acteurs Secondaires :**
- **Étudiants** : Consultation des emplois du temps
- **Direction** : Rapports et statistiques
- **Service Technique** : Maintenance et support

### 2.1.3 Exigences Fonctionnelles

**RF1 - Gestion des Utilisateurs**
- RF1.1 : Authentification sécurisée (JWT)
- RF1.2 : CRUD Administrateurs
- RF1.3 : CRUD Chefs de Classe
- RF1.4 : CRUD Professeurs
- RF1.5 : Gestion des rôles et permissions

**RF2 - Gestion des Emplois du Temps**
- RF2.1 : Saisie disponibilités professeurs
- RF2.2 : Import données scolarité (CSV/Excel)
- RF2.3 : Attribution automatique des cours
- RF2.4 : Attribution manuelle avec drag-and-drop
- RF2.5 : Détection automatique des conflits
- RF2.6 : Génération emplois du temps optimisés

**RF3 - Fonctionnalités Transversales**
- RF3.1 : Tableau de bord avec indicateurs
- RF3.2 : Système de notifications
- RF3.3 : Gestion des présences
- RF3.4 : Module de feedback
- RF3.5 : Export PDF/Excel des plannings

### 2.1.4 Exigences Non-Fonctionnelles

**Performance :**
- Temps de réponse < 2 secondes pour 95% des requêtes
- Support de 100 utilisateurs simultanés
- Génération emploi du temps < 30 secondes

**Sécurité :**
- Chiffrement des mots de passe (bcrypt)
- Protection contre les attaques CSRF/XSS
- Authentification par tokens JWT
- Logs d'audit complets

**Utilisabilité :**
- Interface responsive (mobile, tablette, desktop)
- Navigation intuitive (max 3 clics pour toute action)
- Temps d'apprentissage < 2 heures pour utilisateurs novices

**Fiabilité :**
- Disponibilité 99% (max 7h d'arrêt/mois)
- Sauvegarde automatique toutes les 6 heures
- Récupération après panne < 15 minutes

## 2.2 Modélisation UML

### 2.2.1 Diagramme de Cas d'Usage

```
                    Système de Gestion des Emplois du Temps
    
    Administrateur                    Chef de Classe                    Professeur
         |                               |                               |
         |                               |                               |
    ┌────▼────┐                     ┌────▼────┐                   ┌────▼────┐
    │Gérer    │                     │Consulter│                   │Déclarer │
    │Utilisat.│                     │EDT      │                   │Disponib.│
    └─────────┘                     └─────────┘                   └─────────┘
         |                               |                               |
    ┌────▼────┐                     ┌────▼────┐                   ┌────▼────┐
    │Générer  │                     │Modifier │                   │Consulter│
    │EDT      │                     │Planning │                   │Planning │
    └─────────┘                     └─────────┘                   └─────────┘
         |                               |                               |
    ┌────▼────┐                     ┌────▼────┐                   ┌────▼────┐
    │Gérer    │                     │Gérer    │                   │Recevoir │
    │Salles   │                     │Présences│                   │Notificat│
    └─────────┘                     └─────────┘                   └─────────┘
         |
    ┌────▼────┐
    │Configur.│
    │Système  │
    └─────────┘
```

**Cas d'Usage Détaillés :**

**CU01 - Authentification**
- Acteur : Tous les utilisateurs
- Précondition : Compte valide
- Scénario principal :
  1. Utilisateur saisit identifiants
  2. Système vérifie credentials
  3. Système génère token JWT
  4. Redirection vers tableau de bord

**CU02 - Déclarer Disponibilités**
- Acteur : Professeur
- Précondition : Authentifié
- Scénario principal :
  1. Professeur accède à l'interface disponibilités
  2. Sélectionne jours et créneaux disponibles
  3. Valide la saisie
  4. Système sauvegarde et notifie admin
  

**CU03 - Générer Emploi du Temps**
- Acteur : Administrateur
- Précondition : Données complètes
- Scénario principal :
  1. Admin lance génération automatique
  2. Système applique algorithme d'optimisation
  3. Détection et résolution des conflits
  4. Génération du planning optimisé
  5. Notification aux parties prenantes

### 2.2.2 Diagrammes de Séquence

**Séquence 1 : Authentification Utilisateur**

```
Utilisateur    Interface    Serveur    Base de Données
    |             |           |              |
    |─login()────→|           |              |
    |             |─POST─────→|              |
    |             |           |─findUser()──→|
    |             |           |←─userData────|
    |             |           |─verify()─────|
    |             |           |─generateJWT()|
    |             |←─token────|              |
    |←─redirect───|           |              |
    |             |           |              |
```

**Séquence 2 : Génération Emploi du Temps**

```
Admin    Interface    Serveur    Algorithme    Base de Données
  |         |           |            |              |
  |─generate()→|        |            |              |
  |         |─POST─────→|            |              |
  |         |           |─getData()─→|              |
  |         |           |←─data──────|              |
  |         |           |─optimize()→|              |
  |         |           |            |─calculate()─→|
  |         |           |←─schedule──|              |
  |         |           |─save()────→|              |
  |         |←─result───|            |              |
  |←─success─|          |            |              |
```

**Séquence 3 : Modification Drag-and-Drop**

```
Utilisateur    Interface    Serveur    Validation    Base de Données
    |             |           |            |              |
    |─dragDrop()─→|           |            |              |
    |             |─PUT──────→|            |              |
    |             |           |─validate()→|              |
    |             |           |            |─checkConflict()→|
    |             |           |←─valid─────|←─result──────|
    |             |           |─update()──→|              |
    |             |←─success──|            |              |
    |←─refresh────|           |            |              |
```

### 2.2.3 Diagramme de Classes

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    Utilisateur      │    │    Administrateur   │    │   ChefDeClasse      │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ - id: String        │    │ - id_admin: String  │    │ - matricule: String │
│ - nom: String       │    │ - privileges: Array │    │ - classe: String    │
│ - prenom: String    │    └─────────────────────┘    └─────────────────────┘
│ - email: String     │              △                          △
│ - mot_de_passe: Str │              │                          │
├─────────────────────┤              │                          │
│ + authentifier()    │              │                          │
│ + changerMDP()      │              │                          │
└─────────────────────┘              │                          │
           △                         │                          │
           │                         │                          │
           └─────────────────────────┼──────────────────────────┘
                                     │
                    ┌─────────────────────┐
                    │    Professeur       │
                    ├─────────────────────┤
                    │ - id_prof: String   │
                    │ - disponibilite: [] │
                    ├─────────────────────┤
                    │ + declareDisponib() │
                    │ + consulterEDT()    │
                    └─────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   EmploiDuTemps     │    │       Seance        │    │       Cours         │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ - id_edt: String    │    │ - jour: String      │    │ - nom: String       │
│ - programme: ObjectId│   │ - creneau: String   │    │ - code: String      │
│ - groupe: Number    │    │ - cours: ObjectId   │    │ - credits: Number   │
│ - seances: Array    │    │ - professeur: ObjId │    └─────────────────────┘
├─────────────────────┤    │ - salle: ObjectId   │              │
│ + generer()         │    └─────────────────────┘              │
│ + detecterConflits()│              │                          │
│ + optimiser()       │              │                          │
└─────────────────────┘              │                          │
           │                         │                          │
           │ 1..*                    │ 1..*                     │ 1..*
           └─────────────────────────┼──────────────────────────┘
                                     │
                    ┌─────────────────────┐
                    │       Salle         │
                    ├─────────────────────┤
                    │ - nom: String       │
                    │ - capacite: Number  │
                    │ - equipements: []   │
                    └─────────────────────┘
```

## 2.3 Architecture Logicielle Choisie

### 2.3.1 Architecture Générale

Notre application adopte une **architecture 3-tiers** moderne :

```
┌─────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   React     │  │ Tailwind    │  │   Vite      │     │
│  │ Components  │  │    CSS      │  │   Build     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            │ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                    COUCHE MÉTIER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Express    │  │ Controllers │  │ Middleware  │     │
│  │   Router    │  │   Business  │  │    Auth     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            │ Mongoose ODM
┌─────────────────────────────────────────────────────────┐
│                    COUCHE DONNÉES                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   MongoDB   │  │   Models    │  │   Indexes   │     │
│  │  Database   │  │  Schemas    │  │    Cache    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 2.3.2 Patterns Architecturaux

**Pattern MVC (Model-View-Controller) :**
- **Model** : Modèles Mongoose (Administrateur, Professeur, etc.)
- **View** : Composants React (AdminDashboard, EmploiDuTemps, etc.)
- **Controller** : Contrôleurs Express (adminController, profController, etc.)

**Pattern Repository :**
- Abstraction de l'accès aux données
- Séparation logique métier / persistance
- Facilite les tests unitaires

**Pattern Middleware :**
- Authentification JWT
- Validation des données
- Gestion des erreurs
- Logging des requêtes

### 2.3.3 Choix Technologiques Justifiés

**Frontend - React :**
- **Avantages** : Composants réutilisables, Virtual DOM, écosystème riche
- **Inconvénients** : Courbe d'apprentissage, complexité état global
- **Justification** : Flexibilité pour interfaces complexes (drag-and-drop)

**Backend - Node.js/Express :**
- **Avantages** : JavaScript full-stack, performance I/O, NPM
- **Inconvénients** : Single-threaded, gestion mémoire
- **Justification** : Cohérence technologique, rapidité développement

**Base de Données - MongoDB :**
- **Avantages** : Flexibilité schéma, requêtes complexes, scalabilité
- **Inconvénients** : Pas de transactions ACID complètes, taille stockage
- **Justification** : Adaptation aux structures variables (disponibilités)

---

*[Suite dans le chapitre suivant...]* 