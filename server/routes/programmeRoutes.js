const express = require('express');
const router = express.Router();
const programmeController = require('../controllers/programmeController');
const auth = require('../middleware/auth');

// Routes CRUD de base
router.post('/creer', auth, programmeController.creerProgramme);
router.get('/', auth, programmeController.getAllProgrammes);
router.get('/:id', auth, programmeController.getProgrammeById);
router.put('/:id', auth, programmeController.updateProgramme);
router.delete('/:id', auth, programmeController.deleteProgramme);

// Routes pour la gestion des matières
router.post('/:id/matieres', auth, programmeController.ajouterMatiere);
router.delete('/:programmeId/matieres/:matiereId', auth, programmeController.supprimerMatiere);

module.exports = router; 