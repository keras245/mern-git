const mongoose = require('mongoose');

const accesEntreeSchema = new mongoose.Schema({
  etudiant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etudiant',
    required: true
  },
  vigile_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vigile',
    required: true
  },
  qr_code_scanne: {
    type: String,
    required: true
  },
  autorisation: {
    type: Boolean,
    required: true
  },
  pourcentage_paiement: {
    type: Number,
    required: true
  },
  localisation: {
    type: String,
    default: 'porte_principale'
  },
  motif_refus: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AccesEntree', accesEntreeSchema); 