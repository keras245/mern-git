const express = require('express');
const router = express.Router();
const emploiDuTempsController = require('../controllers/emploiDuTempsController');
const auth = require('../middleware/auth');

// Routes spécifiques DOIVENT être définies AVANT les routes avec paramètres
// Route pour récupérer les groupes d'un programme
router.get('/groupes/:programmeId', auth, emploiDuTempsController.getGroupesProgramme);

// Nouvelles routes pour les attributions temporaires (AVANT les routes génériques)
router.get('/attributions-temporaires', auth, emploiDuTempsController.getAttributionsTemporaires);
router.post('/attribuer-temporaire', auth, emploiDuTempsController.attribuerTemporaire);
router.delete('/attributions-temporaires/:id', auth, emploiDuTempsController.supprimerAttributionTemporaire);

// Routes pour la génération et gestion des emplois du temps
router.post('/generer-automatique', auth, emploiDuTempsController.genererEmploiAutomatique);
router.post('/attribution-manuelle', auth, emploiDuTempsController.attribuerCoursManuel);
router.post('/analyser-donnees', auth, emploiDuTempsController.analyserDonnees);
router.post('/ajouter-seance', auth, emploiDuTempsController.ajouterSeance);
router.put('/modifier-seance', auth, emploiDuTempsController.modifierSeance);
router.delete('/supprimer-seance', auth, emploiDuTempsController.supprimerSeance);
router.post('/exporter/:format', auth, emploiDuTempsController.exporterEmploi);

// Nouvelles routes pour la sauvegarde et gestion des emplois du temps
router.get('/', auth, emploiDuTempsController.getAllEmplois);
router.post('/sauvegarder', auth, emploiDuTempsController.sauvegarderEmploi);

// Routes pour la gestion des créneaux libres
router.post('/analyser-creneaux-libres', auth, emploiDuTempsController.analyserCreneauxLibres);
router.post('/proposer-creneau', auth, emploiDuTempsController.proposerCreneau);
router.post('/reserver-creneau', auth, emploiDuTempsController.reserverCreneau);

// Routes avec paramètres génériques DOIVENT être à la fin
router.get('/:id', auth, emploiDuTempsController.getEmploiById);
router.get('/:programmeId/:groupe', auth, emploiDuTempsController.getEmploiByProgrammeAndGroupe);
router.put('/:id', auth, emploiDuTempsController.updateEmploi);
router.delete('/:id', auth, emploiDuTempsController.deleteEmploi);

module.exports = router;
