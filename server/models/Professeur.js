const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  disponibilite: {
    type: [String],
    required: true
  }
});

// Hook de pré-sauvegarde pour hasher le mot de passe
professeurSchema.pre('save', async function(next) {
  if (this.isModified('mot_de_passe')) {
    this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, 10);
  }
  next();
});

module.exports = mongoose.model('Professeur', professeurSchema);
