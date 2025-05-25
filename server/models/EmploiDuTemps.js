const mongoose = require('mongoose');

const emploiDuTempsSchema = new mongoose.Schema({
  id_edt: { type: String, unique: true, required: true },
  jour: {
    type: String,
    required: true
  },
  heure_debut: {
    type: String,
    required: true
  },
  heure_fin: {
    type: String,
    required: true
  },
  id_cours: {
    type: String,
    required: true
  },
  id_salle: {
    type: String,
    required: true
  }
  });

module.exports = mongoose.model('EmploiDuTemps', emploiDuTempsSchema);
