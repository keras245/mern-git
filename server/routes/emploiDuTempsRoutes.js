const express = require('express');
const router = express.Router();
const emploiDuTempsController = require('../controllers/emploiDuTempsController');
const auth = require('../middleware/auth');

// Routes spécifiques DOIVENT être définies AVANT les routes avec paramètres
// Route pour récupérer les groupes d'un programme
router.get('/groupes/:programmeId', auth, emploiDuTempsController.getGroupesProgramme);

// Routes pour la génération et gestion des emplois du temps
router.post('/generer-automatique', auth, emploiDuTempsController.genererEmploiAutomatique);
router.post('/attribution-manuelle', auth, emploiDuTempsController.attribuerCoursManuel);
router.post('/analyser-donnees', auth, emploiDuTempsController.analyserDonnees);
router.post('/ajouter-seance', auth, emploiDuTempsController.ajouterSeance);
router.put('/modifier-seance', auth, emploiDuTempsController.modifierSeance);
router.delete('/supprimer-seance', auth, emploiDuTempsController.supprimerSeance);
router.post('/exporter/:format', auth, emploiDuTempsController.exporterEmploi);

// Routes avec paramètres génériques DOIVENT être à la fin
router.get('/:programmeId/:groupe', auth, emploiDuTempsController.getEmploiByProgrammeAndGroupe);
router.put('/:id', auth, emploiDuTempsController.updateEmploi);
router.delete('/:id', auth, emploiDuTempsController.deleteEmploi);

module.exports = router;
