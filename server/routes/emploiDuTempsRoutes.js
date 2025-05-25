const express = require('express');
const router = express.Router();
const emploiDuTempsController = require('../controllers/emploiDuTempsController');
const auth = require('../middleware/auth');

// Routes pour la génération et gestion des emplois du temps
router.post('/generer-automatique', auth, emploiDuTempsController.genererEmploiAutomatique);
router.post('/attribution-manuelle', auth, emploiDuTempsController.attribuerCoursManuel);
router.get('/:programmeId/:groupe', auth, emploiDuTempsController.getEmploiByProgrammeAndGroupe);
router.put('/:id', auth, emploiDuTempsController.updateEmploi);
router.delete('/:id', auth, emploiDuTempsController.deleteEmploi);

module.exports = router;
