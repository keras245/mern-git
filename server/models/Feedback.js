const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  id_feedback: { type: String, unique: true, required: true }, 
  contenu: {type: String, required: true},
  date: { type: Date, default: Date.now },
  id_chef: { type: String, ref: 'ChefDeClasse', required: true },
  id_cours: { type: String, ref: 'Cours', required: true }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
