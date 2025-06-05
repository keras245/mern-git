const mongoose = require('mongoose');

const programmeSchema = new mongoose.Schema({
  id_programme: {
    type: String,
    unique: true
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

// Hook pour générer automatiquement l'ID au format PRG001
programmeSchema.pre('save', async function(next) {
  try {
    if (!this.id_programme) {
      const dernierProgramme = await this.constructor.findOne(
        { id_programme: { $regex: /^PRG\d+$/ } },
        {},
        { sort: { 'id_programme': -1 } }
      );
      
      let numero = 1;
      
      if (dernierProgramme && dernierProgramme.id_programme) {
        const match = dernierProgramme.id_programme.match(/^PRG(\d+)$/);
        if (match) {
          numero = parseInt(match[1]) + 1;
        }
      }

      this.id_programme = `PRG${numero.toString().padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Programme', programmeSchema); 