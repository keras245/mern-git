const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  id_feedback: { 
    type: String, 
    unique: true
  },
  contenu: { 
    type: String, 
    required: true,
    maxlength: [1000, 'Le contenu ne peut pas dépasser 1000 caractères']
  },
  type: {
    type: String,
    enum: ['general', 'pedagogique', 'technique', 'comportement'],
    default: 'general'
  },
  priorite: {
    type: String,
    enum: ['basse', 'normale', 'haute', 'urgente'],
    default: 'normale'
  },
  statut: {
    type: String,
    enum: ['brouillon', 'envoye', 'en_attente', 'traite'],
    default: 'brouillon'
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  dateReponse: {
    type: Date
  },
  reponse: {
    type: String,
    maxlength: [1000, 'La réponse ne peut pas dépasser 1000 caractères']
  },
  
  // Relations
  id_chef: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ChefDeClasse', 
    required: true 
  },
  id_cours: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cours' 
  },
  id_programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme'
  },
  
  // Metadata
  lu: {
    type: Boolean,
    default: false
  },
  traite_par: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Administrateur'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware pour générer automatiquement l'ID feedback - VERSION AMÉLIORÉE
feedbackSchema.pre('save', async function(next) {
  // Générer l'ID seulement pour les nouveaux documents et si pas déjà défini
  if (this.isNew && !this.id_feedback) {
    try {
      // Compter les documents existants de manière sécurisée
      const count = await this.constructor.countDocuments({});
      let numero = count + 1;
      
      // Générer l'ID avec un format simple
      this.id_feedback = `FB${String(numero).padStart(3, '0')}`;
      
      // Vérifier l'unicité et incrémenter si nécessaire
      let tentatives = 0;
      while (tentatives < 100) {
        const existe = await this.constructor.findOne({ id_feedback: this.id_feedback });
        if (!existe) {
          break; // ID unique trouvé
        }
        numero++;
        this.id_feedback = `FB${String(numero).padStart(3, '0')}`;
        tentatives++;
      }
      
      if (tentatives >= 100) {
        throw new Error('Impossible de générer un ID unique pour le feedback');
      }
      
      console.log('ID feedback généré:', this.id_feedback);
    } catch (error) {
      console.error('Erreur génération ID feedback:', error);
      return next(error);
    }
  }
  next();
});

// Validation post-middleware pour s'assurer que l'ID est défini
feedbackSchema.pre('save', function(next) {
  if (!this.id_feedback) {
    return next(new Error('ID feedback non généré'));
  }
  next();
});

// Index pour optimiser les recherches
feedbackSchema.index({ id_chef: 1, date: -1 });
feedbackSchema.index({ statut: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ id_feedback: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
