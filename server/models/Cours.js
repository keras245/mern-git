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

coursSchema.pre('save', async function(next) {
  try {
    if (!this.id_cours) {
      // Trouver le dernier id_cours existant
      const dernierCours = await this.constructor.findOne(
        { id_cours: { $regex: /^CRS\d{3}$/ } },
        { id_cours: 1 }
      ).sort({ id_cours: -1 });

      let numero = 1;
      if (dernierCours && dernierCours.id_cours) {
        // Extraire le numéro du dernier id_cours (ex: CRS005 -> 5)
        const dernierNumero = parseInt(dernierCours.id_cours.substring(3));
        numero = dernierNumero + 1;
      }

      // Générer l'ID au format CRS001, CRS002, etc.
      this.id_cours = `CRS${numero.toString().padStart(3, '0')}`;
      
      // Vérifier que cet ID n'existe pas déjà (sécurité supplémentaire)
      let tentatives = 0;
      while (await this.constructor.findOne({ id_cours: this.id_cours }) && tentatives < 100) {
        numero++;
        this.id_cours = `CRS${numero.toString().padStart(3, '0')}`;
        tentatives++;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Cours', coursSchema);
