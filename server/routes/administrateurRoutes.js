const express = require('express');
const router = express.Router();
const adminController = require('../controllers/administrateurController');
const auth = require('../middleware/auth');

// Route publique pour l'authentification
router.post('/login', adminController.login);

// Route temporaire pour créer le premier admin (NON PROTÉGÉE)
router.post('/creer-premier', adminController.creerAdmin);

// Routes protégées
router.post('/creer', auth, adminController.creerAdmin);
router.get('/', auth, adminController.getAllAdmins);
router.get('/:id', auth, adminController.getAdminById);
router.put('/:id', auth, adminController.updateAdmin);
router.delete('/:id', auth, adminController.deleteAdmin);

module.exports = router;
