const mongoose = require('mongoose');

const coursSchema = new mongoose.Schema({
  id_cours: {
    type: String,
    unique: true
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
  id_programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: [true, 'Le programme est requis']
  },
  id_prof: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professeur'
  }]
});

// Index composé pour éviter les doublons de cours dans le même programme
coursSchema.index({ nom_matiere: 1, id_programme: 1 }, { unique: true });

// Hook pour générer automatiquement l'ID au format CRS001
coursSchema.pre('save', async function(next) {
  try {
    if (!this.id_cours) {
      const dernierCours = await this.constructor.findOne(
        { id_cours: { $regex: /^CRS\d+$/ } },
        {},
        { sort: { 'id_cours': -1 } }
      );
      
      let numero = 1;
      
      if (dernierCours && dernierCours.id_cours) {
        const match = dernierCours.id_cours.match(/^CRS(\d+)$/);
        if (match) {
          numero = parseInt(match[1]) + 1;
        }
      }

      this.id_cours = `CRS${numero.toString().padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Cours', coursSchema);
