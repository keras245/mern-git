# CAHIER DES CHARGES

## Application de Gestion des Emplois du Temps - Département de Génie Informatique

### Université Nongo Conakry

---

## 1. CONTEXTE ET OBJECTIFS

### 1.1 Contexte

Le département de Génie Informatique de l'Université Nongo Conakry fait face à des défis majeurs dans la gestion manuelle des emplois du temps :

- Conflits de créneaux horaires fréquents
- Difficultés de coordination entre professeurs et salles
- Absence de traçabilité des modifications
- Processus chronophage et source d'erreurs

### 1.2 Objectifs

Développer une application web moderne permettant :

- **Automatisation** de la génération des emplois du temps
- **Optimisation** de l'allocation des ressources (professeurs, salles)
- **Centralisation** de la gestion pédagogique
- **Amélioration** de la communication entre les acteurs

---

## 2. PÉRIMÈTRE FONCTIONNEL

### 2.1 Acteurs du Système

- **Administrateurs** : Gestion globale du système
- **Chefs de Classe** : Suivi des emplois du temps de leur classe
- **Professeurs** : Consultation et gestion de leurs disponibilités

### 2.2 Fonctionnalités Principales

#### 2.2.1 Gestion des Utilisateurs

- **CRUD Administrateurs** : Création, lecture, modification, suppression
- **CRUD Chefs de Classe** : Gestion complète des responsables de classe
- **CRUD Professeurs** : Gestion du corps enseignant
- **Authentification sécurisée** : JWT, hashage des mots de passe

#### 2.2.2 Gestion des Emplois du Temps

- **Disponibilité Professeurs** : Interface de sélection des créneaux
- **Intégration Données Scolarité** : Import manuel et CSV
- **Attribution Automatique/Manuelle** : Algorithmes d'optimisation
- **Modification Interactive** : Drag-and-drop pour ajustements
- **Stockage Créneaux Non Utilisés** : Optimisation des ressources

#### 2.2.3 Fonctionnalités Transversales

- **Tableau de Bord** : Statistiques et indicateurs
- **Gestion des Présences** : Suivi assiduité
- **Système de Feedback** : Communication bidirectionnelle
- **Notifications** : Alertes et rappels
- **Contact** : Support et communication

---

## 3. EXIGENCES TECHNIQUES

### 3.1 Architecture

- **Frontend** : Application React SPA (Single Page Application)
- **Backend** : API REST Node.js/Express
- **Base de Données** : MongoDB (NoSQL)
- **Authentification** : JWT (JSON Web Tokens)

### 3.2 Technologies Imposées

- **Frontend** : React 19, Vite, Tailwind CSS
- **Backend** : Node.js, Express 5, Mongoose
- **Sécurité** : bcryptjs, CORS
- **UI/UX** : Material-UI, Framer Motion, Lucide Icons

### 3.3 Contraintes Non-Fonctionnelles

- **Performance** : Temps de réponse < 2 secondes
- **Sécurité** : Chiffrement des mots de passe, protection CSRF
- **Compatibilité** : Navigateurs modernes (Chrome, Firefox, Safari)
- **Responsive** : Adaptation mobile et tablette
- **Disponibilité** : 99% de temps de fonctionnement

---

## 4. SPÉCIFICATIONS DÉTAILLÉES

### 4.1 Gestion des Créneaux Horaires

- **Jours** : Lundi à Samedi
- **Créneaux** :
  - Matin : 08h30 - 11h30
  - Après-midi : 12h00 - 15h00
  - Soir : 15h30 - 18h30

### 4.2 Contraintes Métier

- Un professeur ne peut être dans deux endroits simultanément
- Une salle ne peut accueillir qu'un cours à la fois
- Respect des disponibilités déclarées par les professeurs
- Cohérence entre matières et professeurs qualifiés

### 4.3 Règles de Gestion

- **Priorité** : Cours obligatoires > Cours optionnels
- **Équilibrage** : Répartition équitable de la charge enseignante
- **Flexibilité** : Possibilité de modifications manuelles
- **Historique** : Traçabilité de toutes les modifications

---

## 5. LIVRABLES ATTENDUS

### 5.1 Documentation

- Cahier des charges (ce document)
- Modèle Conceptuel de Données (MCD)
- Diagrammes UML (cas d'usage, séquence, classes)
- Documentation technique (API, déploiement)

### 5.2 Application

- Code source complet (frontend + backend)
- Base de données avec jeu de données de test
- Interface utilisateur responsive
- Tests unitaires et d'intégration

### 5.3 Déploiement

- Guide d'installation
- Configuration serveur
- Procédures de sauvegarde
- Plan de maintenance

---

## 6. PLANNING ET JALONS

### Phase 1 : Analyse et Conception (2 semaines)

- Recueil des besoins détaillés
- Modélisation UML
- Architecture technique

### Phase 2 : Développement Core (4 semaines)

- Authentification et gestion utilisateurs
- Interface d'administration
- CRUD de base

### Phase 3 : Fonctionnalités Avancées (3 semaines)

- Gestion emplois du temps
- Algorithmes d'attribution
- Interface drag-and-drop

### Phase 4 : Tests et Déploiement (1 semaine)

- Tests complets
- Optimisations
- Mise en production

---

## 7. CRITÈRES D'ACCEPTATION

### 7.1 Fonctionnels

- ✅ Toutes les fonctionnalités CRUD opérationnelles
- ✅ Interface intuitive et responsive
- ✅ Gestion complète des emplois du temps
- ✅ Système d'authentification sécurisé

### 7.2 Techniques

- ✅ Code maintenable et documenté
- ✅ Performance conforme aux exigences
- ✅ Sécurité validée par audit
- ✅ Compatibilité multi-navigateurs

### 7.3 Qualité

- ✅ Tests de couverture > 80%
- ✅ Documentation utilisateur complète
- ✅ Formation des utilisateurs finaux
- ✅ Support technique assuré

---

**Document validé par :**

- Direction du Département de Génie Informatique
- Service Informatique de l'Université
- Équipe de Développement

**Version :** 1.0  
**Date :** 25 Mai 2025
