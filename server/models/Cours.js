const mongoose = require('mongoose');

const coursSchema = new mongoose.Schema({
  id_cours: {
    type: String,
    unique: true,
      required: true
  },
  matiere: {
    type: String,
    required: true
  },
  duree: {
    type: Number,
    required: true
  },
  id_prof: {
    type: String,
     ref: 'Professeur',
    required: true
  } 
});

module.exports = mongoose.model('Cours', coursSchema);
