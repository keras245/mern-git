const express = require('express');
const router = express.Router();
const presenceController = require('../controllers/presenceController');
const auth = require('../middleware/auth');

// Routes protégées - Les routes spécifiques DOIVENT être avant les routes avec paramètres
router.post('/creer-maj', auth, presenceController.creerOuMajPresence);
router.get('/', auth, presenceController.getAllPresences);
router.get('/statistiques', auth, presenceController.getStatistiques);

// Route pour la modification de présences par l'admin - AVANT /:id
router.put('/admin/modifier', auth, presenceController.modifierPresenceAdmin);

router.get('/date/:date', auth, presenceController.getPresencesByDate);
router.get('/date/:date/programme/:programmeId', auth, presenceController.getPresencesByDateAndProgramme);
router.get('/emploi/:date/:programmeId/:groupe', auth, presenceController.getEmploiEtPresences);
router.get('/chef/:chefId', auth, presenceController.getPresencesByChef);
router.get('/stats/globales/:date', auth, presenceController.getStatsGlobales);
router.get('/export/:date', auth, presenceController.exportPresences);
router.get('/export/:date/:programmeId/:groupe', auth, presenceController.exportPresences);

// Route pour récupérer les groupes (redirection vers emplois)
router.get('/groupes/:programmeId', auth, async (req, res) => {
  try {
    // Rediriger vers le contrôleur d'emploi du temps
    const emploiDuTempsController = require('../controllers/emploiDuTempsController');
    await emploiDuTempsController.getGroupesProgramme(req, res);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des groupes',
      error: error.message 
    });
  }
});

// Routes avec paramètres - DOIVENT être à la fin
router.get('/:id', auth, presenceController.getPresenceById);
router.put('/:id', auth, presenceController.updatePresence);
router.delete('/:id', auth, presenceController.deletePresence);

module.exports = router;
