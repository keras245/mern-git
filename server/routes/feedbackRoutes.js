const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');

// ⚠️ IMPORTANT: Routes spécifiques DOIVENT être AVANT les routes avec paramètres

// Routes spécifiques pour l'admin
router.get('/stats/global', auth, feedbackController.getStatistiquesGlobales);
router.get('/stats/dashboard', auth, feedbackController.getDashboardStats);
router.get('/filtres', auth, feedbackController.getFeedbacksAvecFiltres);
router.get('/cours-disponibles', auth, feedbackController.getCoursDisponibles);
router.get('/statistiques', auth, feedbackController.getStatistiquesChef);

// Routes principales
router.post('/creer', auth, feedbackController.creerFeedback);
router.get('/', auth, feedbackController.getAllFeedbacks);

// Routes avec paramètres spécifiques
router.get('/chef/:chefId', auth, feedbackController.getFeedbacksByChef);
router.put('/:id/lu', auth, feedbackController.marquerCommeLuAdmin);
router.put('/:id/repondre', auth, feedbackController.repondreAuFeedback);
router.put('/:id/envoyer', auth, feedbackController.envoyerFeedback);

// Routes génériques avec paramètres (EN DERNIER)
router.get('/:id', auth, feedbackController.getFeedbackById);
router.put('/:id', auth, feedbackController.updateFeedback);
router.delete('/:id', auth, feedbackController.supprimerFeedback);

module.exports = router;
