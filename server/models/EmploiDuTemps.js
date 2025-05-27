const mongoose = require('mongoose');

const seanceSchema = new mongoose.Schema({
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true
  },
  professeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professeur',
    required: true
  },
  salle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salle',
    required: true
  },
  jour: {
    type: String,
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    required: true
  },
  creneau: {
    type: String,
    enum: ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'],
    required: true
  }
});

const emploiDuTempsSchema = new mongoose.Schema({
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: true
  },
  groupe: {
    type: Number,
    required: true,
    min: 1
  },
  seances: [seanceSchema],
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

// Supprimer le middleware problématique ou le corriger
// Si vous voulez garder un ID unique, voici une version corrigée :
emploiDuTempsSchema.pre('save', function(next) {
  if (!this.id_edt) {
    // Format simple: EDT-[TIMESTAMP]
    const timestamp = Date.now();
    this.id_edt = `EDT-${timestamp}`;
  }
  next();
});

// Ajouter le champ id_edt au schéma si nécessaire
emploiDuTempsSchema.add({
  id_edt: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model('EmploiDuTemps', emploiDuTempsSchema);
