const express = require('express');
const router = express.Router();
const courController = require('../controllers/coursController');

//Routes CRUD pour les cours
router.post('/', courController.creerCours);
router.get('/', courController.getAllCours);
router.get('/:id', courController.getCourById);
router.put('/:id', courController.updateCour);
router.delete('/:id', courController.deleteCour);

module.exports = router;