const express = require('express');
const router = express.Router();
const presenceController = require('../controllers/presenceController');
const auth = require('../middleware/auth');

// Routes protégées
router.post('/creer', auth, presenceController.creerPresence);
router.get('/', auth, presenceController.getAllPresences);
router.get('/:id', auth, presenceController.getPresenceById);
router.put('/:id', auth, presenceController.updatePresence);
router.delete('/:id', auth, presenceController.deletePresence);

module.exports = router;
