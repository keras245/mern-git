const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');

// Routes protégées
router.post('/creer', auth, feedbackController.creerFeedback);
router.get('/', auth, feedbackController.getAllFeedbacks);
router.get('/:id', auth, feedbackController.getFeedbackById);
router.put('/:id', auth, feedbackController.updateFeedback);
router.delete('/:id', auth, feedbackController.deleteFeedback);

module.exports = router;
