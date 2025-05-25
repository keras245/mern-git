const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
  id_presence: { type: String, unique: true, required: true },
  date: { type: Date, required: true },
  heure: { type: String, required: true },
  statut: { type: String, enum: ['présent', 'absent'], required: true },
  id_prof: { type: String, ref: 'Professeur', required: true },
  enregistre_par: { type: String, ref: 'ChefDeClasse', required: true }
});

module.exports = mongoose.model('Presence', presenceSchema);
