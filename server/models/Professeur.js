const mongoose = require('mongoose');

const professeurSchema = new mongoose.Schema({
  id_prof: {
    type: String,
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  adresse: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  matiere: {
    type: String,
    required: true
  },
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

module.exports = mongoose.model('Professeur', professeurSchema);
