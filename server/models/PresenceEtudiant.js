const mongoose = require('mongoose');

const presenceEtudiantSchema = new mongoose.Schema({
  etudiant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etudiant',
    required: true
  },
  cours_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true
  },
  emploi_du_temps_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmploiDuTemps',
    required: true
  },
  date_cours: {
    type: Date,
    required: true
  },
  jour: {
    type: String,
    required: true
  },
  creneau: {
    type: String,
    required: true
  },
  heure_demande: {
    type: Date,
    default: Date.now
  },
  heure_confirmation: {
    type: Date
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'rejetee'],
    default: 'en_attente'
  },
  chef_classe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChefDeClasse'
  },
  est_entre_fac: {
    type: Boolean,
    required: true
  },
  remarques: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PresenceEtudiant', presenceEtudiantSchema); 