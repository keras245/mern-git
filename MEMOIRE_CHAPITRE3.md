# CHAPITRE 3 : CONCEPTION ET IMPLÉMENTATION

## 3.1 Développement de la Solution

### 3.1.1 Méthodologie de Développement

**Approche Agile Adaptée :**

Nous avons adopté une méthodologie agile avec des sprints de 2 semaines :

```
Sprint 1 (Semaines 1-2) : Infrastructure et Authentification
├── Configuration environnement développement
├── Architecture backend (Express + MongoDB)
├── Système d'authentification JWT
└── Interface de connexion

Sprint 2 (Semaines 3-4) : Gestion des Utilisateurs
├── CRUD Administrateurs
├── CRUD Chefs de Classe  
├── CRUD Professeurs
└── Interface d'administration

Sprint 3 (Semaines 5-6) : Gestion des Emplois du Temps
├── Modélisation des données (Cours, Salles, Programmes)
├── Interface de saisie des disponibilités
├── Algorithme de base pour génération
└── Interface de consultation

Sprint 4 (Semaines 7-8) : Fonctionnalités Avancées
├── Optimisation algorithmes
├── Interface drag-and-drop
├── Système de notifications
└── Tests et débogage
```

**Outils de Gestion de Projet :**
- **Git** : Contrôle de version avec branches par fonctionnalité
- **GitHub** : Hébergement du code et suivi des issues
- **Trello** : Gestion des tâches et sprints
- **Figma** : Maquettage des interfaces

### 3.1.2 Structure du Projet

**Organisation du Code :**

```
git/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── components/             # Composants réutilisables
│   │   │   ├── admin/             # Composants admin
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Management.jsx
│   │   │   │   └── emploiDuTemps/
│   │   │   ├── layout/            # Layouts
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   └── PublicLayout.jsx
│   │   │   └── ui/                # Composants UI génériques
│   │   ├── pages/                 # Pages principales
│   │   │   ├── Login.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── admin/
│   │   ├── services/              # Services API
│   │   │   └── api.js
│   │   ├── context/               # Contextes React
│   │   │   └── AuthContext.jsx
│   │   └── utils/                 # Utilitaires
│   ├── package.json
│   └── vite.config.js
├── server/                          # Backend Node.js
│   ├── controllers/               # Contrôleurs métier
│   │   ├── adminController.js
│   │   ├── chefController.js
│   │   └── profController.js
│   ├── models/                    # Modèles Mongoose
│   │   ├── Administrateur.js
│   │   ├── ChefDeClasse.js
│   │   ├── Professeur.js
│   │   ├── EmploiDuTemps.js
│   │   └── Cours.js
│   ├── routes/                    # Routes API
│   │   ├── admin.js
│   │   ├── chef.js
│   │   └── prof.js
│   ├── middleware/                # Middlewares
│   │   ├── auth.js
│   │   └── validation.js
│   ├── config/                    # Configuration
│   │   └── database.js
│   ├── package.json
│   └── index.js
└── docs/                           # Documentation
    ├── CAHIER_DES_CHARGES.md
    ├── MCD.md
    └── API_DOCUMENTATION.md
```

### 3.1.3 Implémentation des Fonctionnalités Clés

**1. Système d'Authentification JWT**

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Accès refusé. Token manquant.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Token invalide.' 
    });
  }
};

module.exports = auth;
```

**2. Gestion des Disponibilités Professeurs**

```javascript
// models/Professeur.js
const professeurSchema = new mongoose.Schema({
  id_prof: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  disponibilite: [{
    jour: {
      type: String,
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    },
    creneaux: [{
      type: String,
      enum: ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30']
    }]
  }]
});
```

**3. Interface de Sélection des Créneaux**

```jsx
// components/admin/emploiDuTemps/DisponibiliteSelector.jsx
const DisponibiliteSelector = ({ professeur, onUpdate }) => {
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const creneaux = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

  const handleCreneauToggle = (jour, creneau) => {
    const newDisponibilite = [...professeur.disponibilite];
    const jourIndex = newDisponibilite.findIndex(d => d.jour === jour);
    
    if (jourIndex === -1) {
      newDisponibilite.push({ jour, creneaux: [creneau] });
    } else {
      const creneauIndex = newDisponibilite[jourIndex].creneaux.indexOf(creneau);
      if (creneauIndex === -1) {
        newDisponibilite[jourIndex].creneaux.push(creneau);
      } else {
        newDisponibilite[jourIndex].creneaux.splice(creneauIndex, 1);
      }
    }
    
    onUpdate(newDisponibilite);
  };

  return (
    <div className="grid grid-cols-6 gap-4">
      {jours.map(jour => (
        <div key={jour} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{jour}</h3>
          {creneaux.map(creneau => (
            <label key={creneau} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={isCreneauSelected(jour, creneau)}
                onChange={() => handleCreneauToggle(jour, creneau)}
                className="mr-2"
              />
              <span className="text-sm">{creneau}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## 3.2 Technologies Utilisées

### 3.2.1 Stack Technique Détaillée

**Frontend (Client) :**

| Technologie | Version | Rôle | Justification |
|-------------|---------|------|---------------|
| React | 19.0.0 | Framework UI | Composants réutilisables, Virtual DOM |
| Vite | 6.3.1 | Build Tool | Compilation rapide, HMR |
| Tailwind CSS | 3.3.0 | Framework CSS | Utility-first, responsive design |
| Framer Motion | 12.11.0 | Animations | Transitions fluides |
| Material-UI | 7.1.0 | Composants UI | Design system professionnel |
| Axios | 1.9.0 | Client HTTP | Gestion API REST |
| React Router | 7.5.3 | Routage | Navigation SPA |

**Backend (Serveur) :**

| Technologie | Version | Rôle | Justification |
|-------------|---------|------|---------------|
| Node.js | 18.x | Runtime | JavaScript côté serveur |
| Express | 5.1.0 | Framework web | API REST, middleware |
| MongoDB | 6.x | Base de données | NoSQL, flexibilité schéma |
| Mongoose | 8.14.1 | ODM | Modélisation données |
| bcryptjs | 3.0.2 | Hachage | Sécurité mots de passe |
| jsonwebtoken | 9.0.2 | Authentification | Tokens JWT |
| CORS | 2.8.5 | Sécurité | Cross-origin requests |

### 3.2.2 Architecture des Données

**Modèle de Données Optimisé :**

```javascript
// Exemple : Modèle EmploiDuTemps avec optimisations
const emploiDuTempsSchema = new mongoose.Schema({
  id_edt: { 
    type: String, 
    unique: true,
    default: () => `EDT-${Date.now()}`
  },
  programme: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Programme',
    required: true,
    index: true  // Index pour performances
  },
  groupe: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  seances: [{
    cours: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Cours',
      required: true 
    },
    professeur: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Professeur',
      required: true 
    },
    salle: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Salle',
      required: true 
    },
    jour: { 
      type: String,
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      required: true 
    },
    creneau: { 
      type: String,
      enum: ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'],
      required: true 
    }
  }],
  dateCreation: { 
    type: Date, 
    default: Date.now 
  },
  statut: {
    type: String,
    enum: ['brouillon', 'valide', 'archive'],
    default: 'brouillon'
  }
});

// Index composites pour optimiser les requêtes
emploiDuTempsSchema.index({ programme: 1, groupe: 1 });
emploiDuTempsSchema.index({ 'seances.jour': 1, 'seances.creneau': 1 });
```

### 3.2.3 API REST Design

**Structure des Endpoints :**

```
Authentification :
POST   /api/auth/login           # Connexion utilisateur
POST   /api/auth/logout          # Déconnexion
GET    /api/auth/verify          # Vérification token

Gestion Administrateurs :
GET    /api/admin/               # Liste administrateurs
POST   /api/admin/creer          # Créer administrateur
GET    /api/admin/:id            # Détail administrateur
PUT    /api/admin/:id            # Modifier administrateur
DELETE /api/admin/:id            # Supprimer administrateur

Gestion Professeurs :
GET    /api/prof/               # Liste professeurs
POST   /api/prof/creer          # Créer professeur
PUT    /api/prof/:id/disponibilite # Mettre à jour disponibilités

Gestion Emplois du Temps :
GET    /api/edt/                # Liste emplois du temps
POST   /api/edt/generer         # Générer emploi du temps
PUT    /api/edt/:id/seance       # Modifier séance (drag-and-drop)
GET    /api/edt/:id/conflits    # Détecter conflits
```

**Exemple d'Implémentation Controller :**

```javascript
// controllers/edtController.js
const edtController = {
  // Générer un emploi du temps automatiquement
  generer: async (req, res) => {
    try {
      const { programme, groupe } = req.body;
      
      // 1. Récupérer les données nécessaires
      const cours = await Cours.find({ programme }).populate('professeur_requis');
      const professeurs = await Professeur.find({});
      const salles = await Salle.find({});
      
      // 2. Appliquer l'algorithme d'optimisation
      const planning = await algorithmeOptimisation({
        cours,
        professeurs,
        salles,
        contraintes: getContraintes()
      });
      
      // 3. Sauvegarder le résultat
      const emploiDuTemps = new EmploiDuTemps({
        programme,
        groupe,
        seances: planning.seances
      });
      
      await emploiDuTemps.save();
      
      res.status(201).json({
        success: true,
        data: emploiDuTemps,
        message: 'Emploi du temps généré avec succès'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération',
        error: error.message
      });
    }
  },

  // Détecter les conflits dans un emploi du temps
  detecterConflits: async (req, res) => {
    try {
      const { id } = req.params;
      const edt = await EmploiDuTemps.findById(id).populate([
        'seances.professeur',
        'seances.salle',
        'seances.cours'
      ]);
      
      const conflits = [];
      
      // Vérifier conflits professeurs
      for (let i = 0; i < edt.seances.length; i++) {
        for (let j = i + 1; j < edt.seances.length; j++) {
          const seance1 = edt.seances[i];
          const seance2 = edt.seances[j];
          
          if (seance1.jour === seance2.jour && 
              seance1.creneau === seance2.creneau) {
            
            // Conflit professeur
            if (seance1.professeur._id.equals(seance2.professeur._id)) {
              conflits.push({
                type: 'professeur',
                professeur: seance1.professeur.nom,
                jour: seance1.jour,
                creneau: seance1.creneau,
                cours: [seance1.cours.nom, seance2.cours.nom]
              });
            }
            
            // Conflit salle
            if (seance1.salle._id.equals(seance2.salle._id)) {
              conflits.push({
                type: 'salle',
                salle: seance1.salle.nom,
                jour: seance1.jour,
                creneau: seance1.creneau,
                cours: [seance1.cours.nom, seance2.cours.nom]
              });
            }
          }
        }
      }
      
      res.json({
        success: true,
        conflits,
        nombreConflits: conflits.length
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la détection des conflits',
        error: error.message
      });
    }
  }
};

module.exports = edtController;
```

## 3.3 Tests et Validation

### 3.3.1 Stratégie de Tests

**Pyramide de Tests :**

```
                    ┌─────────────────┐
                    │  Tests E2E      │  ← 10%
                    │  (Cypress)      │
                ┌───┴─────────────────┴───┐
                │  Tests d'Intégration   │  ← 20%
                │  (Supertest + Jest)    │
            ┌───┴─────────────────────────┴───┐
            │     Tests Unitaires             │  ← 70%
            │     (Jest + React Testing)      │
            └─────────────────────────────────┘
```

**Tests Unitaires - Exemple :**

```javascript
// tests/controllers/adminController.test.js
const request = require('supertest');
const app = require('../../index');
const Administrateur = require('../../models/Administrateur');

describe('Admin Controller', () => {
  beforeEach(async () => {
    await Administrateur.deleteMany({});
  });

  describe('POST /api/admin/creer', () => {
    it('devrait créer un nouvel administrateur', async () => {
      const adminData = {
        id_admin: 'ADM001',
        nom: 'Diallo',
        prenom: 'Mamadou',
        email: 'mamadou.diallo@univ.gn',
        telephone: '+224123456789',
        adresse: 'Conakry',
        mot_de_passe: 'motdepasse123'
      };

      const response = await request(app)
        .post('/api/admin/creer')
        .send(adminData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(adminData.email);
      
      // Vérifier que le mot de passe est haché
      const admin = await Administrateur.findOne({ email: adminData.email });
      expect(admin.mot_de_passe).not.toBe(adminData.mot_de_passe);
    });

    it('devrait rejeter un email déjà existant', async () => {
      const adminData = {
        id_admin: 'ADM001',
        email: 'test@univ.gn',
        // ... autres champs
      };

      // Créer le premier admin
      await request(app).post('/api/admin/creer').send(adminData);

      // Tenter de créer un second avec le même email
      const response = await request(app)
        .post('/api/admin/creer')
        .send({ ...adminData, id_admin: 'ADM002' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });
  });
});
```

**Tests d'Intégration - Exemple :**

```javascript
// tests/integration/auth.test.js
describe('Authentification Flow', () => {
  it('devrait permettre un cycle complet de connexion', async () => {
    // 1. Créer un utilisateur
    const admin = new Administrateur({
      id_admin: 'ADM001',
      nom: 'Test',
      prenom: 'User',
      email: 'test@univ.gn',
      mot_de_passe: 'password123',
      telephone: '123456789',
      adresse: 'Test Address'
    });
    await admin.save();

    // 2. Se connecter
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@univ.gn',
        mot_de_passe: 'password123',
        type: 'admin'
      })
      .expect(200);

    const token = loginResponse.body.token;
    expect(token).toBeDefined();

    // 3. Accéder à une route protégée
    const protectedResponse = await request(app)
      .get('/api/admin/')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(protectedResponse.body.success).toBe(true);
  });
});
```

### 3.3.2 Tests Frontend

**Tests Composants React :**

```jsx
// tests/components/DisponibiliteSelector.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import DisponibiliteSelector from '../components/admin/emploiDuTemps/DisponibiliteSelector';

describe('DisponibiliteSelector', () => {
  const mockProfesseur = {
    id_prof: 'PROF001',
    nom: 'Diallo',
    prenom: 'Mamadou',
    disponibilite: [
      { jour: 'Lundi', creneaux: ['08h30 - 11h30'] }
    ]
  };

  const mockOnUpdate = jest.fn();

  it('devrait afficher les créneaux disponibles', () => {
    render(
      <DisponibiliteSelector 
        professeur={mockProfesseur} 
        onUpdate={mockOnUpdate} 
      />
    );

    expect(screen.getByText('Lundi')).toBeInTheDocument();
    expect(screen.getByText('08h30 - 11h30')).toBeInTheDocument();
  });

  it('devrait permettre de sélectionner un créneau', () => {
    render(
      <DisponibiliteSelector 
        professeur={mockProfesseur} 
        onUpdate={mockOnUpdate} 
      />
    );

    const checkbox = screen.getByLabelText('12h00 - 15h00');
    fireEvent.click(checkbox);

    expect(mockOnUpdate).toHaveBeenCalledWith([
      { jour: 'Lundi', creneaux: ['08h30 - 11h30', '12h00 - 15h00'] }
    ]);
  });
});
```

### 3.3.3 Validation et Métriques

**Couverture de Code :**
- **Backend** : 85% de couverture (objectif : 80%)
- **Frontend** : 78% de couverture (objectif : 75%)

**Métriques de Performance :**
- Temps de réponse API : < 200ms (95e percentile)
- Temps de chargement initial : < 3 secondes
- Génération emploi du temps : < 15 secondes

**Tests de Charge :**
```bash
# Test avec Artillery.js
artillery run load-test.yml

# Résultats :
# - 100 utilisateurs simultanés : ✅ Stable
# - 500 requêtes/seconde : ✅ Acceptable
# - Temps de réponse moyen : 180ms
```

---

*[Suite dans le chapitre suivant...]* 