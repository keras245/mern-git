const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  etudiant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etudiant',
    required: true
  },
  pourcentage_paye: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  comptable_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comptable'
  },
  statut: {
    type: String,
    enum: ['insuffisant', 'partiel', 'complet'],
    default: 'insuffisant'
  },
  remarques: {
    type: String
  },
  date_derniere_mise_a_jour: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculer automatiquement le statut basé sur le pourcentage et le seuil de l'étudiant
paiementSchema.pre('save', async function(next) {
  try {
    if (this.isModified('pourcentage_paye')) {
      // Récupérer l'étudiant pour connaître son seuil
      const Etudiant = require('./Etudiant');
      const etudiant = await Etudiant.findById(this.etudiant_id);
      
      if (etudiant) {
        const seuil = etudiant.pourcentage_paiement_seuil || 75;
        
        if (this.pourcentage_paye >= seuil) {
          this.statut = 'complet';
        } else if (this.pourcentage_paye >= 50) {
          this.statut = 'partiel';
        } else {
          this.statut = 'insuffisant';
        }
      }
      
      this.date_derniere_mise_a_jour = new Date();
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Paiement', paiementSchema); 