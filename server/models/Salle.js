const mongoose = require('mongoose');

const salleSchema = new mongoose.Schema({
  id_salle: { type: String, unique: true, required: true },
  nom: {type: String, required: true},
  type_salle: { type: String, enum: ['Ordinaire', 'Machine'], required: true },
  capacite: { type: Number, required: true }  
});

module.exports = mongoose.model('Salle', salleSchema);
