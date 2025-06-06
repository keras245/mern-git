const express = require('express');
const router = express.Router();
const mobileController = require('../controllers/mobileController');
const auth = require('../middleware/auth');

// ===== CRÉATION D'ENTITÉS (pour tests) =====
router.post('/test/etudiant', mobileController.creerEtudiant);
router.post('/test/comptable', mobileController.creerComptable);
router.post('/test/vigile', mobileController.creerVigile);

// ===== AUTHENTIFICATION =====
router.post('/login/etudiant', mobileController.loginEtudiant);
router.post('/login/comptable', mobileController.loginComptable);  
router.post('/login/vigile', mobileController.loginVigile);

// ===== COMPTABLE (protégé) =====
router.get('/comptable/etudiants', auth, mobileController.getEtudiants);
router.post('/comptable/paiement', auth, mobileController.enregistrerPaiement);

// ✅ NOUVELLES ROUTES - GESTION COMPTABLES
router.get('/comptable/comptables', auth, mobileController.getComptables);
router.put('/comptable/comptable/:id', auth, mobileController.modifierComptable);
router.delete('/comptable/comptable/:id', auth, mobileController.supprimerComptable);

// ✅ NOUVELLES ROUTES - GESTION VIGILES  
router.get('/comptable/vigiles', auth, mobileController.getVigiles);
router.put('/comptable/vigile/:id', auth, mobileController.modifierVigile);
router.delete('/comptable/vigile/:id', auth, mobileController.supprimerVigile);

// ===== VIGILE (protégé) =====
router.post('/vigile/scan-qr', auth, mobileController.scanQRCode);
router.get('/vigile/historique', auth, mobileController.getHistoriqueAcces);

// ===== UTILS =====
router.post('/test/valider-etudiant', mobileController.validerEtudiant);

module.exports = router; 