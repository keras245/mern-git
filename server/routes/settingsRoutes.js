const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');

// Toutes les routes sont protégées par authentification
router.use(auth);

// Routes principales des paramètres
router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/reset', settingsController.resetSettings);

// Routes du profil
router.put('/profile', settingsController.updateProfile);
router.post('/change-password', settingsController.changePassword);
router.get('/profile/stats', settingsController.getProfileStats);

// Route upload avatar
router.post('/upload-avatar', 
  settingsController.uploadMiddleware,
  settingsController.uploadAvatar
);

// Routes d'import/export
router.get('/export', settingsController.exportSettings);
router.post('/import', settingsController.importSettings);

module.exports = router; 