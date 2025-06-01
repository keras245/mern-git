const Feedback = require('../models/Feedback');
const Cours = require('../models/Cours');
const ChefDeClasse = require('../models/ChefDeClasse');
const Programme = require('../models/Programme');
const EmploiDuTemps = require('../models/EmploiDuTemps');

const feedbackController = {
  // Créer un nouveau feedback
  creerFeedback: async (req, res) => {
    try {
      console.log('=== CRÉATION FEEDBACK ===');
      console.log('Body reçu:', req.body);
      console.log('User:', req.user);
      
      const { 
        contenu, 
        id_cours, 
        type, 
        priorite, 
        statut,
        id_programme 
      } = req.body;
      
      // Validation des données requises
      if (!contenu || contenu.trim() === '') {
        console.log('Erreur: contenu manquant');
        return res.status(400).json({ 
          message: 'Le contenu du feedback est requis' 
        });
      }
      
      const id_chef = req.user.id;
      
      // Vérifier que l'ID chef est valide
      if (!id_chef) {
        console.log('Erreur: ID chef manquant');
        return res.status(400).json({ 
          message: 'Chef de classe non identifié' 
        });
      }
      
      // Vérifier que le chef existe
      const chef = await ChefDeClasse.findById(id_chef);
      if (!chef) {
        console.log('Erreur: Chef non trouvé dans la base');
        return res.status(404).json({ 
          message: 'Chef de classe non trouvé' 
        });
      }
      
      // Vérifier que le cours existe SEULEMENT si id_cours est fourni
      if (id_cours) {
        const cours = await Cours.findById(id_cours);
        if (!cours) {
          console.log('Erreur: Cours non trouvé');
          return res.status(404).json({ message: 'Cours non trouvé' });
        }
      }
      
      // GÉNÉRER L'ID DIRECTEMENT DANS LE CONTRÔLEUR
      const count = await Feedback.countDocuments({});
      let numero = count + 1;
      let id_feedback = `FB${String(numero).padStart(3, '0')}`;
      
      // Vérifier l'unicité
      while (await Feedback.findOne({ id_feedback })) {
        numero++;
        id_feedback = `FB${String(numero).padStart(3, '0')}`;
      }
      
      console.log('ID feedback généré:', id_feedback);
      
      const feedbackData = {
        id_feedback, // AJOUTER L'ID GÉNÉRÉ
        contenu: contenu.trim(),
        type: type || 'general',
        priorite: priorite || 'normale',
        statut: statut || 'brouillon',
        id_chef,
        lu: false
      };

      // Ajouter id_cours seulement s'il est fourni et valide
      if (id_cours) {
        feedbackData.id_cours = id_cours;
      }

      // Ajouter id_programme s'il est fourni
      if (id_programme) {
        feedbackData.id_programme = id_programme;
      }
      
      console.log('Données feedback avant sauvegarde:', feedbackData);
      
      const feedback = new Feedback(feedbackData);
      await feedback.save();
      
      console.log('Feedback sauvegardé avec ID:', feedback.id_feedback);
      
      // Populer les données pour la réponse
      const feedbackPopule = await Feedback.findById(feedback._id)
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere')
        .populate('id_programme', 'nom licence semestre');
      
      res.status(201).json({
        message: 'Feedback créé avec succès',
        feedback: feedbackPopule
      });
    } catch (error) {
      console.error('Erreur création feedback:', error);
      
      // Gérer les erreurs de validation MongoDB
      if (error.name === 'ValidationError') {
        console.log('Erreurs de validation détaillées:', error.errors);
        const messages = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ 
          message: 'Erreur de validation',
          details: messages,
          fields: Object.keys(error.errors)
        });
      }
      
      // Gérer les erreurs de duplication
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Cet ID de feedback existe déjà'
        });
      }
      
      res.status(500).json({ 
        message: 'Erreur serveur lors de la création du feedback',
        error: error.message
      });
    }
  },

  // Récupérer tous les feedbacks
  getAllFeedbacks: async (req, res) => {
    try {
      const feedbacks = await Feedback.find()
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere')
        .populate('id_programme', 'nom licence semestre')
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
      
      // S'assurer qu'on retourne toujours un tableau
      res.json(feedbacks || []);
    } catch (error) {
      console.error('Erreur getFeedbacksByChef:', error);
      res.status(500).json({ message: error.message, feedbacks: [] });
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

  // Mettre à jour un feedback (avec validation du délai)
  updateFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const id_chef = req.user.id;
      
      console.log('=== MISE À JOUR FEEDBACK ===');
      console.log('Feedback ID:', id);
      console.log('Chef ID:', id_chef);
      console.log('Données reçues:', req.body);
      
      // Vérifier que le feedback appartient au chef connecté
      const feedbackExistant = await Feedback.findOne({ _id: id, id_chef });
      if (!feedbackExistant) {
        return res.status(404).json({ 
          message: 'Feedback non trouvé ou vous n\'avez pas les droits pour le modifier' 
        });
      }

      console.log('Feedback existant:', feedbackExistant);
      
      // Vérifier les permissions de modification
      const maintenant = new Date();
      const dateCreation = new Date(feedbackExistant.date);
      const differenceMinutes = (maintenant - dateCreation) / (1000 * 60);
      
      // Permettre la modification si :
      // 1. Le statut est brouillon (toujours)
      // 2. Le statut est envoyé ET moins de 15 minutes se sont écoulées
      const peutModifier = 
        feedbackExistant.statut === 'brouillon' || 
        (feedbackExistant.statut === 'envoye' && differenceMinutes <= 15);
      
      if (!peutModifier) {
        return res.status(403).json({ 
          message: 'Ce feedback ne peut plus être modifié (délai de 15 minutes dépassé pour les feedbacks envoyés)' 
        });
      }
      
      // Préparer les données de mise à jour
      const updateData = { 
        ...req.body, 
        updatedAt: Date.now() 
      };
      
      console.log('Données de mise à jour:', updateData);
      
      const feedback = await Feedback.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      )
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere')
        .populate('id_programme', 'nom licence semestre');
      
      console.log('Feedback mis à jour:', feedback);
      
      res.json({
        message: 'Feedback mis à jour avec succès',
        feedback
      });
    } catch (error) {
      console.error('Erreur mise à jour feedback:', error);
      res.status(400).json({ message: error.message });
    }
  },

  // Supprimer un feedback (avec validation du délai)
  deleteFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const id_chef = req.user.id;
      
      console.log('=== SUPPRESSION FEEDBACK ===');
      console.log('Feedback ID:', id);
      console.log('Chef ID:', id_chef);
      
      // Vérifier que le feedback appartient au chef connecté
      const feedback = await Feedback.findOne({ _id: id, id_chef });
      if (!feedback) {
        return res.status(404).json({ 
          message: 'Feedback non trouvé ou vous n\'avez pas les droits pour le supprimer' 
        });
      }
      
      // Vérifier les permissions de suppression
      const maintenant = new Date();
      const dateCreation = new Date(feedback.date);
      const differenceMinutes = (maintenant - dateCreation) / (1000 * 60);
      
      // Permettre la suppression si :
      // 1. Le statut est brouillon (toujours)
      // 2. Le statut est envoyé ET moins de 15 minutes se sont écoulées
      const peutSupprimer = 
        feedback.statut === 'brouillon' || 
        (feedback.statut === 'envoye' && differenceMinutes <= 15);
      
      if (!peutSupprimer) {
        return res.status(403).json({ 
          message: 'Ce feedback ne peut plus être supprimé (délai de 15 minutes dépassé pour les feedbacks envoyés)' 
        });
      }
      
      await Feedback.findByIdAndDelete(id);
      
      console.log('Feedback supprimé avec succès');
      
      res.json({ message: 'Feedback supprimé avec succès' });
    } catch (error) {
      console.error('Erreur suppression feedback:', error);
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
  },

  // Récupérer les cours disponibles pour un chef - VERSION SIMPLIFIÉE ET ROBUSTE
  getCoursDisponibles: async (req, res) => {
    try {
      const id_chef = req.user.id;
      
      console.log('=== RÉCUPÉRATION COURS DISPONIBLES (DEBUG) ===');
      console.log('Chef ID:', id_chef);
      
      // 1. Récupérer les informations du chef
      const chef = await ChefDeClasse.findById(id_chef);
      if (!chef || !chef.classe) {
        console.log('Chef non trouvé ou classe manquante');
        return res.status(404).json({ 
          message: 'Chef de classe ou classe non trouvé',
          debug: { chef_id: id_chef, chef_exists: !!chef, has_classe: !!(chef && chef.classe) }
        });
      }
      
      console.log('Classe du chef:', chef.classe);
      
      // 2. Parser la classe pour extraire les composants
      const regex = /^(.+?)\s*-\s*L(\d+)\s*S(\d+)\s*G(\d+)$/;
      const match = chef.classe.match(regex);
      
      if (!match) {
        console.log('Format de classe invalide:', chef.classe);
        return res.status(400).json({ 
          message: 'Format de classe invalide', 
          format: 'Programme - L# S# G#',
          classe_actuelle: chef.classe
        });
      }
      
      const classeInfo = {
        nom: match[1].trim(),
        licence: parseInt(match[2]),
        semestre: parseInt(match[3]),
        groupe: parseInt(match[4])
      };
      
      console.log('Classe parsée:', classeInfo);
      
      // 3. Lister TOUS les programmes disponibles
      const tousLesProgrammes = await Programme.find({});
      console.log('Tous les programmes en base:', tousLesProgrammes.map(p => ({
        id: p._id,
        nom: p.nom,
        licence: p.licence,
        semestre: p.semestre,
        groupe: p.groupe
      })));
      
      // 4. Recherche flexible du programme
      let programme = await Programme.findOne({
        nom: classeInfo.nom,
        licence: classeInfo.licence,
        semestre: classeInfo.semestre,
        groupe: { $gte: classeInfo.groupe }
      });
      
      // Si pas trouvé, essayer une recherche plus flexible
      if (!programme) {
        console.log('Programme exact non trouvé, recherche flexible...');
        
        // Recherche par nom partiel (ignorer la casse)
        programme = await Programme.findOne({
          nom: { $regex: classeInfo.nom, $options: 'i' },
          licence: classeInfo.licence,
          semestre: classeInfo.semestre
        });
        
        if (programme) {
          console.log('Programme trouvé par recherche flexible:', programme);
        }
      }
      
      if (!programme) {
        console.log('Aucun programme trouvé');
        
        // Essayer de trouver des programmes similaires pour déboguer
        const programmesSimilaires = await Programme.find({
          $or: [
            { nom: { $regex: classeInfo.nom, $options: 'i' } },
            { licence: classeInfo.licence, semestre: classeInfo.semestre }
          ]
        });
        
        return res.status(404).json({ 
          message: 'Programme non trouvé pour cette classe',
          debug: {
            classe_recherchee: classeInfo,
            programmes_similaires: programmesSimilaires.map(p => ({
              nom: p.nom,
              licence: p.licence,
              semestre: p.semestre,
              groupe: p.groupe
            })),
            tous_programmes: tousLesProgrammes.map(p => p.nom)
          }
        });
      }
      
      console.log('Programme trouvé:', programme);
      
      // 5. Récupérer TOUS les cours
      const tousLesCours = await Cours.find({}).populate('id_programme id_prof');
      console.log('Nombre total de cours en base:', tousLesCours.length);
      
      // 6. Récupérer les cours liés à ce programme
      const cours = await Cours.find({
        id_programme: programme._id
      }).populate('id_prof', 'nom prenom id_prof');
      
      console.log('Cours trouvés pour ce programme:', cours.length);
      console.log('Détails des cours:', cours.map(c => ({
        id: c._id,
        nom: c.nom_matiere,
        programme: c.id_programme,
        profs: c.id_prof
      })));
      
      // 7. Formater les cours pour le frontend
      const coursFormats = cours.map(c => ({
        _id: c._id,
        id: c._id,
        nom_matiere: c.nom_matiere,
        professeur: c.id_prof && c.id_prof.length > 0 ? 
          `${c.id_prof[0].prenom} ${c.id_prof[0].nom}` : 
          'Professeur non assigné'
      }));
      
      console.log('Cours formatés pour le frontend:', coursFormats);
      
      // 8. Si aucun cours trouvé, proposer une solution
      if (coursFormats.length === 0) {
        return res.json({
          cours: [],
          message: 'Aucun cours trouvé pour votre programme',
          debug: {
            programme_trouve: {
              nom: programme.nom,
              licence: programme.licence,
              semestre: programme.semestre,
              groupe: programme.groupe
            },
            suggestion: 'Vérifiez que des cours ont été créés et assignés à votre programme',
            total_cours_systeme: tousLesCours.length
          }
        });
      }
      
      res.json(coursFormats);
      
    } catch (error) {
      console.error('Erreur getCoursDisponibles:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la récupération des cours',
        error: error.message,
        stack: error.stack
      });
    }
  },

  // Envoyer un feedback (changer le statut de brouillon à envoyé)
  envoyerFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const id_chef = req.user.id;
      
      const feedback = await Feedback.findOneAndUpdate(
        { _id: id, id_chef, statut: 'brouillon' },
        { statut: 'envoye', updatedAt: Date.now() },
        { new: true }
      )
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere')
        .populate('id_programme', 'nom licence semestre');
      
      if (!feedback) {
        return res.status(404).json({ 
          message: 'Feedback non trouvé ou déjà envoyé' 
        });
      }
      
      res.json({
        message: 'Feedback envoyé avec succès',
        feedback
      });
    } catch (error) {
      console.error('Erreur envoi feedback:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Statistiques des feedbacks pour un chef
  getStatistiquesChef: async (req, res) => {
    try {
      const id_chef = req.user.id;
      
      const [total, brouillons, envoyes, traites] = await Promise.all([
        Feedback.countDocuments({ id_chef }),
        Feedback.countDocuments({ id_chef, statut: 'brouillon' }),
        Feedback.countDocuments({ id_chef, statut: 'envoye' }),
        Feedback.countDocuments({ id_chef, statut: 'traite' })
      ]);
      
      const reponses = await Feedback.countDocuments({ 
        id_chef, 
        reponse: { $exists: true, $ne: null } 
      });
      
      res.json({
        total,
        brouillons,
        envoyes,
        traites,
        reponses,
        tauxReponse: total > 0 ? Math.round((reponses / total) * 100) : 0
      });
    } catch (error) {
      console.error('Erreur statistiques feedback:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Marquer un feedback comme lu
  marquerCommeLu: async (req, res) => {
    try {
      const { id } = req.params;
      const id_chef = req.user.id;
      
      console.log('=== MARQUAGE FEEDBACK ===');
      console.log('Feedback ID:', id);
      console.log('Chef ID:', id_chef);
      
      // Vérifier que le feedback appartient au chef connecté
      const feedback = await Feedback.findOne({ _id: id, id_chef });
      if (!feedback) {
        return res.status(404).json({ 
          message: 'Feedback non trouvé ou vous n\'avez pas les droits pour le marquer comme lu' 
        });
      }
      
      // Mettre à jour le statut du feedback
      const updatedFeedback = await Feedback.findByIdAndUpdate(
        id,
        { lu: true },
        { new: true }
      );
      
      if (!updatedFeedback) {
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du feedback' });
      }
      
      res.json({
        message: 'Feedback marqué comme lu avec succès',
        feedback: updatedFeedback
      });
    } catch (error) {
      console.error('Erreur marquage lu:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Répondre à un feedback
  repondreAuFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const { reponse } = req.body;
      
      if (!reponse || reponse.trim() === '') {
        return res.status(400).json({ 
          message: 'La réponse est requise' 
        });
      }
      
      const feedback = await Feedback.findByIdAndUpdate(
        id,
        { 
          reponse: reponse.trim(),
          statut: 'traite',
          date_reponse: new Date(),
          repondu_par: 'admin'
        },
        { new: true }
      )
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere')
        .populate('id_programme', 'nom licence semestre');
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback non trouvé' });
      }
      
      res.json({
        message: 'Réponse envoyée avec succès',
        feedback
      });
    } catch (error) {
      console.error('Erreur réponse feedback:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Supprimer un feedback
  supprimerFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      
      const feedback = await Feedback.findByIdAndDelete(id);
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback non trouvé' });
      }
      
      res.json({
        message: 'Feedback supprimé avec succès',
        feedback
      });
    } catch (error) {
      console.error('Erreur suppression feedback:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les feedbacks avec filtres avancés
  getFeedbacksAvecFiltres: async (req, res) => {
    try {
      console.log('=== RÉCUPÉRATION FEEDBACKS FILTRÉS ===');
      console.log('Query params:', req.query);
      
      // Pour l'instant, retourner tous les feedbacks
      const feedbacks = await Feedback.find({})
        .populate('id_chef', 'nom prenom classe')
        .populate('id_cours', 'nom_matiere')
        .populate('id_programme', 'nom licence semestre')
        .sort({ date: -1 });
      
      res.json({
        feedbacks,
        pagination: {
          page: 1,
          limit: 100,
          total: feedbacks.length,
          pages: 1
        }
      });
    } catch (error) {
      console.error('Erreur récupération feedbacks filtrés:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Dashboard stats pour admin
  getDashboardStats: async (req, res) => {
    try {
      console.log('=== RÉCUPÉRATION STATS DASHBOARD ===');
      
      // Pour l'instant, retourner les mêmes stats que getStatistiquesGlobales
      const [total, brouillons, envoyes, traites] = await Promise.all([
        Feedback.countDocuments({}),
        Feedback.countDocuments({ statut: 'brouillon' }),
        Feedback.countDocuments({ statut: 'envoye' }),
        Feedback.countDocuments({ statut: 'traite' })
      ]);
      
      const reponses = await Feedback.countDocuments({ 
        reponse: { $exists: true, $ne: null, $ne: '' } 
      });
      
      const stats = {
        total,
        brouillons,
        envoyes,
        traites,
        reponses,
        tauxReponse: total > 0 ? Math.round((reponses / total) * 100) : 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Erreur stats dashboard:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Statistiques globales pour l'admin
  getStatistiquesGlobales: async (req, res) => {
    try {
      console.log('=== RÉCUPÉRATION STATS GLOBALES ===');
      
      const [total, brouillons, envoyes, traites] = await Promise.all([
        Feedback.countDocuments({}),
        Feedback.countDocuments({ statut: 'brouillon' }),
        Feedback.countDocuments({ statut: 'envoye' }),
        Feedback.countDocuments({ statut: 'traite' })
      ]);
      
      const reponses = await Feedback.countDocuments({ 
        reponse: { $exists: true, $ne: null, $ne: '' } 
      });
      
      const stats = {
        total,
        brouillons,
        envoyes,
        traites,
        reponses,
        tauxReponse: total > 0 ? Math.round((reponses / total) * 100) : 0
      };
      
      console.log('Stats calculées:', stats);
      res.json(stats);
    } catch (error) {
      console.error('Erreur stats globales feedback:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Marquer un feedback comme lu pour l'admin
  marquerCommeLuAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log('=== MARQUAGE FEEDBACK ADMIN ===');
      console.log('Feedback ID:', id);
      
      const feedback = await Feedback.findByIdAndUpdate(
        id,
        { lu: true, date_lecture: new Date() },
        { new: true }
      );
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback non trouvé' });
      }
      
      console.log('Feedback marqué comme lu:', feedback.id_feedback);
      res.json({
        message: 'Feedback marqué comme lu',
        feedback
      });
    } catch (error) {
      console.error('Erreur marquage lu admin:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = feedbackController;
