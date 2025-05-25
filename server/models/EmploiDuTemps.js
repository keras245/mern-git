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
  seances: [seanceSchema]
});

// Middleware pour générer automatiquement l'id_edt
emploiDuTempsSchema.pre('save', function(next) {
  if (!this.id_edt) {
    // Format: EDT-[ID_PROGRAMME]-[SEMESTRE]-[ANNÉE]
    const annee = this.annee_academique.split('-')[0];
    this.id_edt = `EDT-${this.programme}-S${this.semestre}-${annee}`;
  }
  next();
});

module.exports = mongoose.model('EmploiDuTemps', emploiDuTempsSchema);
