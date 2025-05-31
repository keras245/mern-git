const mongoose = require('mongoose');

const seanceSchema = new mongoose.Schema({
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
});

const emploiDuTempsSchema = new mongoose.Schema({
  id_edt: {
    type: String,
    unique: true
  },
  nom: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: true
  },
  groupe: {
    type: Number,
    required: true,
    min: 1
  },
  seances: [seanceSchema],
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'brouillon'],
    default: 'actif'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware corrigé pour générer un ID unique
emploiDuTempsSchema.pre('save', function(next) {
  if (!this.id_edt) {
    // Format: EDT-YYYYMMDD-HHMMSS-RANDOM
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.id_edt = `EDT-${dateStr}-${timeStr}-${random}`;
  }
  
  // Mettre à jour updatedAt à chaque sauvegarde
  this.updatedAt = new Date();
  
  next();
});

// Index pour optimiser les requêtes
emploiDuTempsSchema.index({ programme: 1, groupe: 1 });
emploiDuTempsSchema.index({ 'seances.jour': 1, 'seances.creneau': 1 });
emploiDuTempsSchema.index({ nom: 1, programme: 1, groupe: 1 });
emploiDuTempsSchema.index({ statut: 1 });
emploiDuTempsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmploiDuTemps', emploiDuTempsSchema);
