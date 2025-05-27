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
}, {
  timestamps: true
});

// Hook de pré-sauvegarde pour hasher le mot de passe
chefDeClasseSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié (ou est nouveau)
  if (!this.isModified('mot_de_passe')) return next();
  
  try {
    console.log('Hachage du mot de passe pour:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
    console.log('Mot de passe haché avec succès');
    next();
  } catch (error) {
    console.error('Erreur hachage mot de passe:', error);
    next(error);
  }
});

module.exports = mongoose.model('ChefDeClasse', chefDeClasseSchema);
