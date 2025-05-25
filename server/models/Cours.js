const mongoose = require('mongoose');

const coursSchema = new mongoose.Schema({
  id_cours: {
    type: String,
    unique: true,
    sparse: true // Permet d'avoir des documents sans id_cours pendant la création
  },
  nom_matiere: {
    type: String,
    required: [true, 'Le nom de la matière est requis']
  },
  duree: {
    type: Number,
    required: [true, 'La durée est requise'],
    min: [1, 'La durée doit être supérieure à 0']
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: [true, 'Le programme est requis']
  },
  professeurs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professeur'
  }]
});

coursSchema.pre('save', async function(next) {
  try {
    if (!this.id_cours) {
      // Trouver le dernier numéro de cours
      const dernierCours = await this.constructor.findOne({}, {}, { sort: { 'id_cours': -1 } });
      let numero = 1;
      
      if (dernierCours && dernierCours.id_cours) {
        const match = dernierCours.id_cours.match(/\d+$/);
        if (match) {
          numero = parseInt(match[0]) + 1;
        }
      }

      // Utiliser un timestamp pour garantir l'unicité
      const timestamp = Date.now().toString().slice(-4);
      const nomCourt = this.nom_matiere
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();

      this.id_cours = `CRS-${nomCourt}-${timestamp}-${numero.toString().padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Cours', coursSchema);
