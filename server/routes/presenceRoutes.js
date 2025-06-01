const express = require('express');
const router = express.Router();
const presenceController = require('../controllers/presenceController');
const auth = require('../middleware/auth');

// Routes protégées
router.post('/creer-maj', auth, presenceController.creerOuMajPresence);
router.get('/', auth, presenceController.getAllPresences);
router.get('/statistiques', auth, presenceController.getStatistiques);
router.get('/date/:date', auth, presenceController.getPresencesByDate);
router.get('/date/:date/programme/:programmeId', auth, presenceController.getPresencesByDateAndProgramme);
router.get('/emploi/:date/:programmeId/:groupe', auth, presenceController.getEmploiEtPresences);
router.get('/chef/:chefId', auth, presenceController.getPresencesByChef);
router.get('/:id', auth, presenceController.getPresenceById);
router.put('/:id', auth, presenceController.updatePresence);
router.delete('/:id', auth, presenceController.deletePresence);

module.exports = router;
