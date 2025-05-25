const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const salleController = require('../controllers/salleController');
const auth = require('../middleware/auth');

// Routes CRUD de base
router.post('/creer', auth, salleController.creerSalle);
router.get('/', auth, salleController.getAllSalles);
router.get('/:id', auth, salleController.getSalleById);
router.put('/:id', auth, salleController.updateSalle);
router.delete('/:id', auth, salleController.deleteSalle);

// Routes d'import
router.post('/import-manual', salleController.importManual);
router.post('/import-file', upload.single('file'), salleController.importFile);

module.exports = router;
