const express = require('express');
const router = express.Router();
const profController = require('../controllers/professeurController');
const auth = require('../middleware/auth');


// Routes protégées
router.post('/creer', auth, profController.creerProf);
router.get('/', auth, profController.getAllProfs);
router.get('/:id', auth, profController.getProfById);
router.put('/:id', auth, profController.updateProf);
router.delete('/:id', auth, profController.deleteProf);

module.exports = router;
