const mongoose = require('mongoose');

const attributionTemporaireSchema = new mongoose.Schema({
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
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: true
  },
  groupe: {
    type: Number,  // Changé de String à Number
    required: true
  },
  jour: {
    type: String,
    required: true,
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  },
  creneau: {
    type: String,
    required: true,
    enum: ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30']
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateExpiration: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    enum: ['active', 'expiree'],
    default: 'active'
  },
  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Administrateur',
    required: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
attributionTemporaireSchema.index({ dateExpiration: 1 });
attributionTemporaireSchema.index({ professeur: 1, jour: 1, creneau: 1 });
attributionTemporaireSchema.index({ salle: 1, jour: 1, creneau: 1 });

module.exports = mongoose.model('AttributionTemporaire', attributionTemporaireSchema);