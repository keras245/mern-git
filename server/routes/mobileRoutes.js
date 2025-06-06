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

// ✅ NOUVELLES ROUTES - GESTION PAIEMENTS
router.get('/comptable/etudiant/matricule/:matricule', auth, mobileController.rechercherEtudiantParMatricule);
router.put('/comptable/etudiant/:id/paiement', auth, mobileController.mettreAJourPaiementEtudiant);

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

// ===== ÉTUDIANT (protégé) =====
router.get('/etudiant/emploi-du-temps', auth, mobileController.getEmploiDuTempsEtudiant);
router.post('/etudiant/demande-presence', auth, mobileController.envoyerDemandePresence);
router.get('/etudiant/profil', auth, mobileController.getProfilEtudiant);

// ✅ AJOUT NOUVELLES ROUTES CHEF DE CLASSE =====
// Routes pour "Ma Classe" - CRUD étudiants
router.get('/etudiants', mobileController.getEtudiants);
router.get('/etudiants/:id', mobileController.getEtudiantById);
router.put('/etudiants/:id', auth, mobileController.updateEtudiant);
router.delete('/etudiants/:id', auth, mobileController.deleteEtudiant);
router.patch('/etudiants/:id/validate', auth, mobileController.validerEtudiant);

// Routes pour "Validation Présences"
router.get('/presences/en-attente', mobileController.getPresencesEnAttente);
router.patch('/presences/:id/confirmer', auth, mobileController.confirmerPresence);
router.patch('/presences/:id/rejeter', auth, mobileController.rejeterPresence);

// Route pour obtenir les programmes (pour le formulaire étudiant)
router.get('/programmes', mobileController.getProgrammes);

// ===== UTILS =====
router.post('/test/valider-etudiant', mobileController.validerEtudiant);

module.exports = router; 