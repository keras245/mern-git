const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const comptableSchema = new mongoose.Schema({
  id_comptable: {
    type: String,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  mot_de_passe: {
    type: String,
    required: true
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif'
  }
}, {
  timestamps: true
});

comptableSchema.pre('save', async function(next) {
  if (!this.isModified('mot_de_passe')) return next();
  this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, 10);
  next();
});

comptableSchema.pre('validate', async function(next) {
  if (!this.id_comptable) {
    try {
      const dernier = await this.constructor.findOne(
        { id_comptable: { $regex: /^CPT\d+$/ } },
        {},
        { sort: { 'id_comptable': -1 } }
      );
      
      let numero = 1;
      if (dernier && dernier.id_comptable) {
        const match = dernier.id_comptable.match(/^CPT(\d+)$/);
        if (match) {
          numero = parseInt(match[1]) + 1;
        }
      }
      this.id_comptable = `CPT${numero.toString().padStart(3, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Comptable', comptableSchema); 