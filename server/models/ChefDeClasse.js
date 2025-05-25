const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const chefDeClasseSchema = new mongoose.Schema({
  matricule: { 
    type: String,
    unique: true,
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  adresse: {
    type: String,
    required: true
  }, 
  email: {
    type: String,
    unique: true,
    required: true
  },
  mot_de_passe: {
    type: String,
    required: true
  },
  classe: {
    type: String,
    required: true
  }
});
//Hook de pré-sauvegarde pour hasher le mot de passe
chefDeClasseSchema.pre('save', async function(next) {
  if (this.isModified('mot_de_passe')) {
    this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, 10);
  }
  next();
});

module.exports = mongoose.model('ChefDeClasse', chefDeClasseSchema);
