const express = require('express');
const router = express.Router();
const coursController = require('../controllers/coursController');
const auth = require('../middleware/auth');

// Routes CRUD de base
router.post('/creer', auth, coursController.creerCours);
router.get('/', auth, coursController.getAllCours);
router.get('/:id', auth, coursController.getCoursById);
router.put('/:id', auth, coursController.updateCours);
router.delete('/:id', auth, coursController.deleteCours);

module.exports = router; 