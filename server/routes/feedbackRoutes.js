const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');

// POST /api/feedbacks/creer - Créer un nouveau feedback
router.post('/creer', auth, feedbackController.creerFeedback);

// GET /api/feedbacks/cours-disponibles - Récupérer les cours du chef connecté
router.get('/cours-disponibles', auth, feedbackController.getCoursDisponibles);

// GET /api/feedbacks - Récupérer tous les feedbacks
router.get('/', auth, feedbackController.getAllFeedbacks);

// GET /api/feedbacks/chef/:chefId - Récupérer feedbacks par chef
router.get('/chef/:chefId', auth, feedbackController.getFeedbacksByChef);

// GET /api/feedbacks/statistiques - Statistiques
router.get('/statistiques', auth, feedbackController.getStatistiques);

// GET /api/feedbacks/:id - Récupérer un feedback par ID
router.get('/:id', auth, feedbackController.getFeedbackById);

// PUT /api/feedbacks/:id - Mettre à jour un feedback
router.put('/:id', auth, feedbackController.updateFeedback);

// PUT /api/feedbacks/:id/repondre - Répondre à un feedback
router.put('/:id/repondre', auth, feedbackController.repondreFeedback);

// DELETE /api/feedbacks/:id - Supprimer un feedback
router.delete('/:id', auth, feedbackController.deleteFeedback);

module.exports = router;
