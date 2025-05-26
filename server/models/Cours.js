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

coursSchema.pre('save', async function(next) {
  try {
    if (!this.id_cours) {
      // Compter le nombre total de cours existants
      const count = await this.constructor.countDocuments();
      const numero = count + 1;
      
      // Générer l'ID au format CRS001, CRS002, etc.
      this.id_cours = `CRS${numero.toString().padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Cours', coursSchema);
