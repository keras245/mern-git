const express = require('express');
const router = express.Router();
const salleController = require('../controllers/salleController');
const auth = require('../middleware/auth');

// Routes protégées
router.post('/creer', auth, salleController.creerSalle);
router.get('/', auth, salleController.getAllSalles);
router.get('/:id', auth, salleController.getSalleById);
router.put('/:id', auth, salleController.updateSalle);
router.delete('/:id', auth, salleController.deleteSalle);

module.exports = router;
