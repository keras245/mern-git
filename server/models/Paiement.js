const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  etudiant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etudiant',
    required: true
  },
  montant_paye: {
    type: Number,
    required: true,
    min: 0
  },
  montant_total_requis: {
    type: Number,
    required: true,
    min: 0
  },
  pourcentage_paye: {
    type: Number,
    min: 0,
    max: 100
  },
  type_paiement: {
    type: String,
    enum: ['scolarite', 'inscription', 'autre'],
    default: 'scolarite'
  },
  comptable_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comptable',
    required: true
  },
  statut: {
    type: String,
    enum: ['complet', 'partiel', 'en_retard'],
    default: 'partiel'
  },
  remarques: {
    type: String
  }
}, {
  timestamps: true
});

// Calculer automatiquement le pourcentage
paiementSchema.pre('save', function(next) {
  if (this.montant_total_requis > 0) {
    this.pourcentage_paye = Math.round((this.montant_paye / this.montant_total_requis) * 100);
    this.statut = this.pourcentage_paye >= 100 ? 'complet' : 'partiel';
  }
  next();
});

module.exports = mongoose.model('Paiement', paiementSchema); 