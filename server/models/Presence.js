const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
  id_presence: { 
    type: String, 
    unique: true
  },
  date: { type: Date, required: true },
  heure_arrivee: { type: String }, // Heure d'arrivée du professeur
  statut: { type: String, enum: ['présent', 'absent', 'retard'], required: true },
  
  // Informations sur le professeur
  id_prof: { type: mongoose.Schema.Types.ObjectId, ref: 'Professeur', required: true },
  nom_prof: { type: String }, // Pour affichage rapide
  
  // Informations sur le cours
  id_cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Cours' },
  nom_matiere: { type: String },
  creneau: { type: String }, // "08h30 - 11h30", etc.
  salle: { type: String },
  type_cours: { type: String, enum: ['Cours', 'TD', 'TP', 'Projet'] },
  
  // Informations sur la classe et le programme
  id_programme: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme' },
  nom_programme: { type: String },
  groupe: { type: Number },
  
  // Enregistrement
  enregistre_par: { type: mongoose.Schema.Types.ObjectId, ref: 'ChefDeClasse', required: true },
  commentaire: { type: String }, // Commentaire facultatif (justification absence, etc.)
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware pour générer l'ID unique de manière simple et fiable
presenceSchema.pre('save', async function(next) {
  try {
    if (!this.id_presence) {
      // Trouver la dernière présence pour obtenir le prochain numéro
      const dernierePresence = await this.constructor.findOne(
        { id_presence: { $regex: /^PRS\d{3}$/ } },
        { id_presence: 1 }
      ).sort({ id_presence: -1 });

      let numero = 1;
      if (dernierePresence && dernierePresence.id_presence) {
        // Extraire le numéro du dernier id_presence (ex: PRS005 -> 5)
        const dernierNumero = parseInt(dernierePresence.id_presence.substring(3));
        numero = dernierNumero + 1;
      }

      // Générer l'ID au format PRS001, PRS002, etc.
      this.id_presence = `PRS${numero.toString().padStart(3, '0')}`;
      
      // Vérifier que cet ID n'existe pas déjà (sécurité supplémentaire)
      let tentatives = 0;
      while (await this.constructor.findOne({ id_presence: this.id_presence }) && tentatives < 100) {
        numero++;
        this.id_presence = `PRS${numero.toString().padStart(3, '0')}`;
        tentatives++;
      }
      
      console.log(`ID présence généré: ${this.id_presence}`);
    }
    
    // Mettre à jour le timestamp
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    console.error('Erreur génération ID présence:', error);
    next(error);
  }
});

// Index pour améliorer les performances
presenceSchema.index({ date: 1, id_prof: 1, creneau: 1, groupe: 1 });
presenceSchema.index({ enregistre_par: 1, date: -1 });
presenceSchema.index({ id_programme: 1, date: -1 });
presenceSchema.index({ id_presence: 1 }, { unique: true });

module.exports = mongoose.model('Presence', presenceSchema);
