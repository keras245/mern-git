const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const etudiantSchema = new mongoose.Schema({
  matricule: {
    type: String,
    unique: true,
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  adresse: {
    type: String
  },
  mot_de_passe: {
    type: String,
    required: true
  },
  programme_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: true
  },
  groupe: {
    type: Number,
    required: true,
    min: 1
  },
  qr_code: {
    type: String,
    unique: true
  },
  statut_compte: {
    type: String,
    enum: ['en_attente', 'valide', 'suspendu'],
    default: 'en_attente'
  },
  chef_classe_validateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChefDeClasse'
  },
  date_validation_compte: {
    type: Date
  },
  pourcentage_paiement_seuil: {
    type: Number,
    default: 75
  },
  derniere_entree_fac: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password
etudiantSchema.pre('save', async function(next) {
  if (!this.isModified('mot_de_passe')) return next();
  this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, 10);
  next();
});

// Générer QR code unique
etudiantSchema.pre('save', async function(next) {
  if (!this.qr_code) {
    this.qr_code = `STU${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Etudiant', etudiantSchema);