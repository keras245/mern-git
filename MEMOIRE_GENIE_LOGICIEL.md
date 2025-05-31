# MÉMOIRE EN GÉNIE LOGICIEL
## Développement d'une Application Web de Gestion des Emplois du Temps
### Département de Génie Informatique - Université Nongo Conakry

---

**Présenté par :** [Nom de l'étudiant]  
**Encadré par :** [Nom de l'encadreur]  
**Année académique :** 2024-2025

---

## TABLE DES MATIÈRES

1. [Introduction Générale](#introduction)
2. [Chapitre 1 : État de l'Art et Fondements Théoriques](#chapitre1)
3. [Chapitre 2 : Analyse et Spécifications du Projet](#chapitre2)
4. [Chapitre 3 : Conception et Implémentation](#chapitre3)
5. [Chapitre 4 : Évaluation et Améliorations Possibles](#chapitre4)
6. [Conclusion](#conclusion)
7. [Références Bibliographiques](#references)

---

## INTRODUCTION GÉNÉRALE {#introduction}

### Contexte

La gestion des emplois du temps dans les établissements d'enseignement supérieur représente un défi logistique majeur, particulièrement dans les départements techniques comme celui de Génie Informatique. L'Université Nongo Conakry, comme de nombreuses institutions académiques, fait face à des difficultés récurrentes dans l'organisation et la planification des cours.

### Problématique

Les méthodes traditionnelles de gestion des emplois du temps, souvent manuelles ou semi-automatisées, génèrent de nombreux problèmes :
- **Conflits de ressources** : Superposition de cours dans les mêmes salles
- **Surcharge administrative** : Temps considérable consacré à la planification
- **Erreurs humaines** : Oublis et incohérences dans les plannings
- **Manque de flexibilité** : Difficultés d'adaptation aux changements
- **Communication défaillante** : Information fragmentée entre les acteurs

### Objectifs

Ce mémoire présente le développement d'une solution web moderne pour automatiser et optimiser la gestion des emplois du temps, avec pour objectifs :

1. **Automatiser** la génération des plannings
2. **Optimiser** l'allocation des ressources pédagogiques
3. **Centraliser** la gestion des informations
4. **Améliorer** la communication entre les acteurs
5. **Réduire** les erreurs et conflits

### Méthodologie

Notre approche s'appuie sur :
- **Analyse des besoins** auprès des utilisateurs finaux
- **Conception orientée utilisateur** (UX/UI)
- **Développement agile** avec itérations courtes
- **Architecture moderne** (MERN Stack)
- **Tests continus** et validation utilisateur

---

## CHAPITRE 1 : ÉTAT DE L'ART ET FONDEMENTS THÉORIQUES {#chapitre1}

### 1.1 Concepts Clés et Définitions

#### 1.1.1 Gestion des Emplois du Temps

La **gestion des emplois du temps** (Timetabling) est un problème d'optimisation combinatoire qui consiste à attribuer des ressources (professeurs, salles, créneaux horaires) à des activités (cours) tout en respectant un ensemble de contraintes.

**Définition formelle :** Soit E = (P, S, C, T) où :
- P = ensemble des professeurs
- S = ensemble des salles  
- C = ensemble des cours
- T = ensemble des créneaux temporels

L'objectif est de trouver une fonction f : C → P × S × T qui respecte toutes les contraintes.

#### 1.1.2 Types de Contraintes

**Contraintes dures (Hard Constraints) :**
- Un professeur ne peut être dans deux endroits simultanément
- Une salle ne peut accueillir qu'un cours à la fois
- Respect des disponibilités déclarées

**Contraintes souples (Soft Constraints) :**
- Équilibrage de la charge de travail
- Préférences horaires des professeurs
- Optimisation de l'utilisation des salles

#### 1.1.3 Complexité Algorithmique

Le problème de timetabling appartient à la classe NP-complet, ce qui signifie qu'il n'existe pas d'algorithme polynomial pour le résoudre de manière optimale. Les approches courantes incluent :

- **Algorithmes exacts** : Programmation linéaire, backtracking
- **Métaheuristiques** : Algorithmes génétiques, recuit simulé
- **Heuristiques constructives** : Algorithmes gloutons, recherche locale

### 1.2 Technologies et Frameworks

#### 1.2.1 Architecture MERN Stack

Notre choix technologique s'appuie sur la stack MERN pour ses avantages :

**MongoDB :**
- Base de données NoSQL flexible
- Gestion native des documents JSON
- Scalabilité horizontale
- Requêtes complexes avec aggregation pipeline

*Justification :* La flexibilité de MongoDB permet de gérer facilement les structures complexes comme les disponibilités des professeurs et les emplois du temps avec leurs multiples relations.

**Express.js :**
- Framework web minimaliste pour Node.js
- Middleware modulaire
- API REST robuste
- Gestion des sessions et authentification

**React.js :**
- Bibliothèque JavaScript pour interfaces utilisateur
- Composants réutilisables
- Virtual DOM pour performances optimales
- Écosystème riche (Redux, Router, etc.)

**Node.js :**
- Runtime JavaScript côté serveur
- Event-driven et non-bloquant
- NPM pour la gestion des dépendances
- Performance élevée pour applications I/O intensives

#### 1.2.2 Technologies Complémentaires

**Frontend :**
- **Vite** : Build tool moderne et rapide
- **Tailwind CSS** : Framework CSS utility-first
- **Framer Motion** : Animations fluides
- **Material-UI** : Composants UI professionnels
- **Axios** : Client HTTP pour API REST

**Backend :**
- **Mongoose** : ODM pour MongoDB
- **bcryptjs** : Hachage sécurisé des mots de passe
- **jsonwebtoken** : Authentification JWT
- **CORS** : Gestion des requêtes cross-origin

**Outils de Développement :**
- **ESLint** : Analyse statique du code
- **Prettier** : Formatage automatique
- **Nodemon** : Rechargement automatique en développement

### 1.3 Études de Cas Similaires

#### 1.3.1 Solutions Commerciales

**Hyperplanning (Index Éducation) :**
- Solution leader en France
- Interface desktop traditionnelle
- Fonctionnalités complètes mais complexes
- Coût élevé pour les établissements

**Emploi du Temps (EDT) :**
- Solution française spécialisée
- Algorithmes d'optimisation avancés
- Interface vieillissante
- Manque de flexibilité

#### 1.3.2 Solutions Open Source

**FET (Free Timetabling Software) :**
- Logiciel libre et gratuit
- Algorithmes génétiques
- Interface Qt peu intuitive
- Courbe d'apprentissage élevée

**OpenTimetool :**
- Solution web open source
- Architecture modulaire
- Communauté active mais limitée
- Documentation insuffisante

#### 1.3.3 Analyse Comparative

| Critère | Solutions Commerciales | Solutions Open Source | Notre Solution |
|---------|----------------------|---------------------|----------------|
| Coût | Élevé | Gratuit | Gratuit |
| Interface | Variable | Souvent datée | Moderne (React) |
| Flexibilité | Limitée | Élevée | Très élevée |
| Support | Professionnel | Communautaire | Personnalisé |
| Déploiement | Complexe | Variable | Simple (Web) |

### 1.4 Fondements Théoriques

#### 1.4.1 Théorie des Graphes

La modélisation des emplois du temps peut être représentée comme un problème de coloration de graphe :
- **Sommets** : Cours à planifier
- **Arêtes** : Conflits potentiels (même professeur, même salle)
- **Couleurs** : Créneaux horaires disponibles

#### 1.4.2 Programmation par Contraintes

Approche déclarative où le problème est défini par :
- **Variables** : Créneaux, salles, professeurs
- **Domaines** : Valeurs possibles pour chaque variable
- **Contraintes** : Relations entre variables

#### 1.4.3 Algorithmes d'Optimisation

**Algorithme Génétique :**
```
1. Initialiser population de solutions
2. Évaluer fitness de chaque individu
3. Sélectionner parents
4. Croiser et muter
5. Remplacer génération
6. Répéter jusqu'à convergence
```

**Recherche Tabou :**
- Exploration du voisinage
- Mémorisation des mouvements interdits
- Diversification et intensification

---

*[La suite du mémoire sera dans les fichiers suivants...]* 