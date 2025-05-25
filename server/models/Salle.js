const mongoose = require('mongoose');

const salleSchema = new mongoose.Schema({
  id_salle: {
    type: String,
    unique: true
  },
  nom: {
    type: String,
    required: true,
    unique: true
  },
  capacite: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['Ordinaire', 'Machine']
  },
  disponibilite: [{
    jour: {
      type: String,
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    },
    creneaux: [{
      type: String,
      enum: ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30']
    }]
  }]
});

salleSchema.pre('save', async function(next) {
  try {
    if (!this.id_salle) {
      const derniereSalle = await this.constructor.findOne({}, {}, { sort: { 'id_salle': -1 } });
      let numero = 1;
      
      if (derniereSalle && derniereSalle.id_salle) {
        const match = derniereSalle.id_salle.match(/\d+$/);
        if (match) {
          numero = parseInt(match[0]) + 1;
        }
      }

      const typePrefix = this.type === 'Machine' ? 'M' : 'O';
      this.id_salle = `SLL-${typePrefix}-${numero.toString().padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Salle', salleSchema);

