const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vigileSchema = new mongoose.Schema({
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
    required: true,
    unique: true
  },
  code_acces: {
    type: String,
    required: true
  },
  poste: {
    type: String,
    default: 'porte_principale'
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif'
  }
}, {
  timestamps: true
});

vigileSchema.pre('save', async function(next) {
  if (!this.isModified('code_acces')) return next();
  this.code_acces = await bcrypt.hash(this.code_acces, 10);
  next();
});

module.exports = mongoose.model('Vigile', vigileSchema); 