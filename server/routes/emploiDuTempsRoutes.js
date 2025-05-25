const express = require('express');
const router = express.Router();
const emploiController = require('../controllers/emploiDuTempsController');
const auth = require('../middleware/auth');

// Routes protégées
router.post('/creer', auth, emploiController.creerEmploi);
router.get('/', auth, emploiController.getAllEmplois);
router.get('/:id', auth, emploiController.getEmploiById);
router.put('/:id', auth, emploiController.updateEmploi);
router.delete('/:id', auth, emploiController.deleteEmploi);

module.exports = router;
