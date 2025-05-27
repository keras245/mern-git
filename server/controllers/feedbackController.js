const Feedback = require('../models/Feedback');
const Cours = require('../models/Cours');
const ChefDeClasse = require('../models/ChefDeClasse');

const feedbackController = {
  // Créer un nouveau feedback
  creerFeedback: async (req, res) => {
    try {
      const { contenu, id_chef, id_cours, type, priorite } = req.body;
      
      // Générer un ID unique pour le feedback
      const count = await Feedback.countDocuments();
      const id_feedback = `FB${String(count + 1).padStart(3, '0')}`;
      
      const feedback = new Feedback({
        id_feedback,
        contenu,
        id_chef,
        id_cours,
        type: type || 'general',
        priorite: priorite || 'normale',
        statut: 'envoye'
      });
      
      await feedback.save();
      
      // Populer les données pour la réponse
      const feedbackPopule = await Feedback.findById(feedback._id)
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere');
      
      res.status(201).json(feedbackPopule);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Récupérer tous les feedbacks
  getAllFeedbacks: async (req, res) => {
    try {
      const feedbacks = await Feedback.find()
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere')
        .sort({ date: -1 });
      
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les feedbacks par chef de classe
  getFeedbacksByChef: async (req, res) => {
    try {
      const { chefId } = req.params;
      const feedbacks = await Feedback.find({ id_chef: chefId })
        .populate('id_cours', 'nom_matiere')
        .sort({ date: -1 });
      
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer un feedback par ID
  getFeedbackById: async (req, res) => {
    try {
      const { id } = req.params;
      const feedback = await Feedback.findById(id)
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere');
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback non trouvé' });
      }
      
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour un feedback
  updateFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const feedback = await Feedback.findByIdAndUpdate(id, req.body, { new: true })
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere');
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback non trouvé' });
      }
      
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Supprimer un feedback
  deleteFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const feedback = await Feedback.findByIdAndDelete(id);
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback non trouvé' });
      }
      
      res.json({ message: 'Feedback supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Répondre à un feedback (pour l'admin)
  repondreFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const { reponse } = req.body;
      
      const feedback = await Feedback.findByIdAndUpdate(
        id, 
        { 
          reponse,
          dateReponse: new Date(),
          statut: 'traite'
        }, 
        { new: true }
      ).populate('id_chef', 'nom prenom classe')
       .populate('id_cours', 'nom_matiere');
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback non trouvé' });
      }
      
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Statistiques des feedbacks
  getStatistiques: async (req, res) => {
    try {
      const { chefId } = req.query;
      
      const filter = chefId ? { id_chef: chefId } : {};
      
      const [total, envoyes, traites, enAttente] = await Promise.all([
        Feedback.countDocuments(filter),
        Feedback.countDocuments({ ...filter, statut: 'envoye' }),
        Feedback.countDocuments({ ...filter, statut: 'traite' }),
        Feedback.countDocuments({ ...filter, statut: 'en_attente' })
      ]);
      
      res.json({
        total,
        envoyes,
        traites,
        enAttente,
        tauxReponse: total > 0 ? Math.round((traites / total) * 100) : 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = feedbackController;
