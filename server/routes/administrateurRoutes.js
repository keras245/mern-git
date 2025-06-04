const express = require('express');
const router = express.Router();
const adminController = require('../controllers/administrateurController');
const { getChefsForAdmin } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Route publique pour l'authentification
router.post('/login', adminController.login);

// Route temporaire pour créer le premier admin (NON PROTÉGÉE)
router.post('/creer-premier', adminController.creerAdmin);

// IMPORTANT: Routes spécifiques AVANT les routes avec paramètres
router.get('/chefs', auth, getChefsForAdmin);

// Routes protégées avec paramètres
router.post('/creer', auth, adminController.creerAdmin);
router.get('/', auth, adminController.getAllAdmins);
router.get('/:id', auth, adminController.getAdminById);
router.put('/:id', auth, adminController.updateAdmin);
router.delete('/:id', auth, adminController.deleteAdmin);

// Route changement de mot de passe
router.patch('/change-password', auth, adminController.changePassword);

// NOUVELLES ROUTES avec code
router.post('/forgot-password', adminController.requestPasswordReset);
router.post('/reset-password-with-code', adminController.resetPasswordWithCode);

module.exports = router;
