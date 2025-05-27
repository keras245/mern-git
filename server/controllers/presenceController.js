const Presence = require('../models/Presence');
const Professeur = require('../models/Professeur');
const Cours = require('../models/Cours');

const presenceController = {
  // Créer une nouvelle présence
  creerPresence: async (req, res) => {
    try {
      const { date, heure, statut, id_prof, enregistre_par } = req.body;
      
      // Générer un ID unique pour la présence
      const count = await Presence.countDocuments();
      const id_presence = `PRES${String(count + 1).padStart(3, '0')}`;
      
      const presence = new Presence({
        id_presence,
        date,
        heure,
        statut,
        id_prof,
        enregistre_par
      });
      
      await presence.save();
      res.status(201).json(presence);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Récupérer toutes les présences
  getAllPresences: async (req, res) => {
    try {
      const presences = await Presence.find()
        .populate('id_prof', 'nom prenom')
        .populate('enregistre_par', 'nom prenom classe')
        .sort({ date: -1 });
      
      res.json(presences);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer une présence par ID
  getPresenceById: async (req, res) => {
    try {
      const { id } = req.params;
      const presence = await Presence.findById(id)
        .populate('id_prof', 'nom prenom')
        .populate('enregistre_par', 'nom prenom classe');
      
      if (!presence) {
        return res.status(404).json({ message: 'Présence non trouvée' });
      }
      
      res.json(presence);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les présences par date
  getPresencesByDate: async (req, res) => {
    try {
      const { date } = req.params;
      const presences = await Presence.find({ date })
        .populate('id_prof', 'nom prenom')
        .populate('enregistre_par', 'nom prenom classe');
      
      res.json(presences);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les présences par chef de classe
  getPresencesByChef: async (req, res) => {
    try {
      const { chefId } = req.params;
      const presences = await Presence.find({ enregistre_par: chefId })
        .populate('id_prof', 'nom prenom')
        .sort({ date: -1 });
      
      res.json(presences);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour une présence
  updatePresence: async (req, res) => {
    try {
      const { id } = req.params;
      const presence = await Presence.findByIdAndUpdate(id, req.body, { new: true })
        .populate('id_prof', 'nom prenom')
        .populate('enregistre_par', 'nom prenom classe');
      
      if (!presence) {
        return res.status(404).json({ message: 'Présence non trouvée' });
      }
      
      res.json(presence);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Supprimer une présence
  deletePresence: async (req, res) => {
    try {
      const { id } = req.params;
      const presence = await Presence.findByIdAndDelete(id);
      
      if (!presence) {
        return res.status(404).json({ message: 'Présence non trouvée' });
      }
      
      res.json({ message: 'Présence supprimée avec succès' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Statistiques de présence
  getStatistiques: async (req, res) => {
    try {
      const { chefId, dateDebut, dateFin } = req.query;
      
      const filter = {};
      if (chefId) filter.enregistre_par = chefId;
      if (dateDebut && dateFin) {
        filter.date = { $gte: new Date(dateDebut), $lte: new Date(dateFin) };
      }
      
      const presences = await Presence.find(filter);
      const total = presences.length;
      const presents = presences.filter(p => p.statut === 'présent').length;
      const absents = total - presents;
      const tauxPresence = total > 0 ? Math.round((presents / total) * 100) : 0;
      
      res.json({
        total,
        presents,
        absents,
        tauxPresence
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = presenceController;

