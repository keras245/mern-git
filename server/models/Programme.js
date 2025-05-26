const mongoose = require('mongoose');

const programmeSchema = new mongoose.Schema({
  id_programme: {
    type: String,
    unique: true,
    required: true
  },
  nom: {
    type: String,
    required: true,
    enum: [
      'Génie Informatique et Télécommunications',
      'MIAGE',
      'Génie Logiciel',
      'Réseaux et Télécoms',
      'Génie Civil',
      'Génie Electronique'
    ]
  },
  licence: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
    validate: {
      validator: Number.isInteger,
      message: 'Le niveau doit être un nombre entier'
    }
  },
  semestre: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7, 8],
    validate: {
      validator: Number.isInteger,
      message: 'Le semestre doit être un nombre entier'
    }
  },
  groupe: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Le groupe doit être un nombre entier'
    }
  },
  description: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Programme', programmeSchema); 