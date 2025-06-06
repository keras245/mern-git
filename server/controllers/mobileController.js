const Etudiant = require('../models/Etudiant');
const Comptable = require('../models/Comptable');
const Vigile = require('../models/Vigile');
const Paiement = require('../models/Paiement');
const AccesEntree = require('../models/AccesEntree');
const PresenceEtudiant = require('../models/PresenceEtudiant');
const EmploiDuTemps = require('../models/EmploiDuTemps');
const Programme = require('../models/Programme');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===== CRÉATION D'ENTITÉS (pour tests) =====

exports.creerEtudiant = async (req, res) => {
  try {
    const {
      matricule,
      nom,
      prenom,
      email,
      telephone,
      mot_de_passe,
      programme_id,
      groupe
    } = req.body;

    // Validation des champs obligatoires
    if (!matricule || !nom || !prenom || !email || !telephone || !mot_de_passe || !programme_id || !groupe) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires'
      });
    }

    // Vérifier si l'étudiant existe déjà
    const etudiantExistant = await Etudiant.findOne({
      $or: [{ matricule }, { email }]
    });

    if (etudiantExistant) {
      return res.status(400).json({
        success: false,
        message: 'Un étudiant avec ce matricule ou cet email existe déjà'
      });
    }

    // Générer le QR code
    const qrCode = `EDU-${matricule}-${Date.now()}`;

    // Hasher le mot de passe
    const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);

    // Créer l'étudiant
    const nouvelEtudiant = new Etudiant({
      matricule,
      nom,
      prenom,
      email,
      telephone,
      mot_de_passe: motDePasseHash,
      programme_id,
      groupe,
      qr_code: qrCode,
      pourcentage_paiement: 0,
      pourcentage_paiement_seuil: 75
    });

    await nouvelEtudiant.save();

    res.status(201).json({
      success: true,
      message: 'Étudiant créé avec succès',
      etudiant: {
        id: nouvelEtudiant._id,
        matricule: nouvelEtudiant.matricule,
        nom: nouvelEtudiant.nom,
        prenom: nouvelEtudiant.prenom,
        email: nouvelEtudiant.email,
        qr_code: nouvelEtudiant.qr_code
      }
    });

  } catch (error) {
    console.error('Erreur création étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'étudiant'
    });
  }
};

exports.creerComptable = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, mot_de_passe } = req.body;
    
    const comptable = new Comptable({
      nom,
      prenom,
      email,
      telephone,
      mot_de_passe
    });

    await comptable.save();

    const comptableSafe = await Comptable.findById(comptable._id).select('-mot_de_passe');

    res.status(201).json({
      message: 'Comptable créé avec succès',
      comptable: comptableSafe
    });

  } catch (error) {
    console.error('Erreur création comptable:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.creerVigile = async (req, res) => {
  try {
    const { nom, prenom, telephone, code_acces } = req.body;
    
    const vigile = new Vigile({
      nom,
      prenom,
      telephone,
      code_acces
    });

    await vigile.save();

    const vigileSafe = await Vigile.findById(vigile._id).select('-code_acces');

    res.status(201).json({
      message: 'Vigile créé avec succès',
      vigile: vigileSafe
    });

  } catch (error) {
    console.error('Erreur création vigile:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Téléphone déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== AUTHENTIFICATION =====

// Login Étudiant
exports.loginEtudiant = async (req, res) => {
  try {
    const { matricule, mot_de_passe } = req.body;
    
    const etudiant = await Etudiant.findOne({ matricule })
      .populate('programme_id', 'nom licence semestre');
    
    if (!etudiant) {
      return res.status(401).json({ message: 'Matricule ou mot de passe incorrect' });
    }
    
    const isMatch = await bcrypt.compare(mot_de_passe, etudiant.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ message: 'Matricule ou mot de passe incorrect' });
    }
    
    const token = jwt.sign(
      { 
        id: etudiant._id, 
        matricule: etudiant.matricule,
        type: 'etudiant'
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        id: etudiant._id,
        matricule: etudiant.matricule,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        qr_code: etudiant.qr_code,
        programme: etudiant.programme_id,
        groupe: etudiant.groupe,
        type: 'etudiant'
      }
    });
    
  } catch (error) {
    console.error('Erreur login étudiant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Login Comptable
exports.loginComptable = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    
    const comptable = await Comptable.findOne({ email, statut: 'actif' });
    
    if (!comptable) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const isMatch = await bcrypt.compare(mot_de_passe, comptable.mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const token = jwt.sign(
      { 
        id: comptable._id, 
        email: comptable.email,
        type: 'comptable'
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        id: comptable._id,
        id_comptable: comptable.id_comptable,
        nom: comptable.nom,
        prenom: comptable.prenom,
        email: comptable.email,
        type: 'comptable'
      }
    });
    
  } catch (error) {
    console.error('Erreur login comptable:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Login Vigile
exports.loginVigile = async (req, res) => {
  try {
    const { telephone, code_acces } = req.body;
    
    const vigile = await Vigile.findOne({ telephone, statut: 'actif' });
    
    if (!vigile) {
      return res.status(401).json({ message: 'Téléphone ou code incorrect' });
    }
    
    const isMatch = await bcrypt.compare(code_acces, vigile.code_acces);
    if (!isMatch) {
      return res.status(401).json({ message: 'Téléphone ou code incorrect' });
    }
    
    const token = jwt.sign(
      { 
        id: vigile._id, 
        telephone: vigile.telephone,
        type: 'vigile'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({
      token,
      user: {
        id: vigile._id,
        nom: vigile.nom,
        prenom: vigile.prenom,
        telephone: vigile.telephone,
        poste: vigile.poste,
        type: 'vigile'
      }
    });
    
  } catch (error) {
    console.error('Erreur login vigile:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== FONCTIONS COMPTABLE =====

exports.enregistrerPaiement = async (req, res) => {
  try {
    const { etudiant_id, montant_paye, montant_total_requis, type_paiement, remarques } = req.body;
    const comptable_id = req.user.id;

    // Vérifier que l'étudiant existe
    const etudiant = await Etudiant.findById(etudiant_id);
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    const paiement = new Paiement({
      etudiant_id,
      montant_paye,
      montant_total_requis,
      type_paiement,
      comptable_id,
      remarques
    });

    await paiement.save();

    const paiementPopule = await Paiement.findById(paiement._id)
      .populate('etudiant_id', 'matricule nom prenom')
      .populate('comptable_id', 'nom prenom id_comptable');

    res.status(201).json({
      message: 'Paiement enregistré avec succès',
      paiement: paiementPopule
    });

  } catch (error) {
    console.error('Erreur enregistrement paiement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getEtudiants = async (req, res) => {
  try {
    console.log('📥 Paramètres de recherche étudiants:', req.query);
    
    const { classe, statut, search } = req.query;
    
    let filter = {};
    
    if (statut) {
      filter.statut_compte = statut;
    }
    
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { matricule: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 Récupération de tous les étudiants...');
    let etudiants = await Etudiant.find(filter)
      .populate('programme_id', 'nom licence semestre')
      .select('-mot_de_passe')
      .sort({ nom: 1, prenom: 1 });
    
    console.log(`📊 ${etudiants.length} étudiants trouvés avant filtrage`);
    console.log('📋 Détails étudiants:', etudiants.map(e => ({
      nom: e.nom,
      programme: e.programme_id?.nom
    })));
    
    // ✅ Filtrage par classe si spécifiée
    if (classe) {
      console.log('🔍 Filtrage par classe:', classe);
      
      etudiants = etudiants.filter(e => {
        if (!e.programme_id || !e.programme_id.nom) return false;
        
        const programmeNom = e.programme_id.nom.toLowerCase();
        const classeRecherchee = classe.toLowerCase();
        
        // Essayer différentes stratégies de matching
        const match1 = programmeNom.includes(classeRecherchee.split(' - ')[0]); // "Génie Civil"
        const match2 = classeRecherchee.includes(programmeNom); // "Génie Civil - L4 S7 G1" contient "Génie Civil"
        const match3 = programmeNom === classeRecherchee; // Match exact
        
        console.log(`🔍 Test "${programmeNom}" vs "${classeRecherchee}": match1=${match1}, match2=${match2}, match3=${match3}`);
        
        return match1 || match2 || match3;
      });
      
      console.log(`📊 ${etudiants.length} étudiants après filtrage par classe`);
    }
    
    console.log(`✅ Résultat final: ${etudiants.length} étudiants`);
    
    // ✅ CORRECTION MAJEURE : Retourner directement le tableau
    res.json(etudiants);
  } catch (error) {
    console.error('❌ Erreur récupération étudiants:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des étudiants',
      error: error.message
    });
  }
};

// ===== FONCTIONS VIGILE =====

exports.scanQRCode = async (req, res) => {
  try {
    const { qr_code } = req.body;

    if (!qr_code) {
      return res.status(400).json({
        success: false,
        message: 'QR code requis'
      });
    }

    // Chercher l'étudiant avec ce QR code
    const etudiant = await Etudiant.findOne({ qr_code }).populate('programme_id');

    if (!etudiant) {
      return res.status(404).json({
        success: false,
        message: 'QR code invalide'
      });
    }

    // Vérifier le paiement
    const paiementValide = etudiant.pourcentage_paiement >= etudiant.pourcentage_paiement_seuil;

    // Enregistrer l'accès
    const acces = new AccesEntree({
      etudiant_id: etudiant._id,
      date_entree: new Date(),
      statut_acces: paiementValide ? 'autorise' : 'refuse',
      raison: paiementValide ? 'Paiement conforme' : 'Paiement insuffisant'
    });

    await acces.save();

    // Mettre à jour la dernière entrée
    if (paiementValide) {
      etudiant.derniere_entree_fac = new Date();
      await etudiant.save();
    }

    res.json({
      success: true,
      acces_autorise: paiementValide,
      message: paiementValide ? 'Accès autorisé' : 'Accès refusé - Paiement insuffisant',
      etudiant: {
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        matricule: etudiant.matricule,
        programme: etudiant.programme_id?.nom || 'Non défini',
        pourcentage_paiement: etudiant.pourcentage_paiement,
        seuil_requis: etudiant.pourcentage_paiement_seuil
      }
    });

  } catch (error) {
    console.error('Erreur scan QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ===== UTILS =====

exports.validerEtudiant = async (req, res) => {
  try {
    const { etudiant_id } = req.body;
    
    const etudiant = await Etudiant.findByIdAndUpdate(
      etudiant_id,
      { 
        statut_compte: 'actif',
        date_validation_compte: new Date()
      },
      { new: true }
    ).populate('programme_id', 'nom licence semestre');

    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    res.json({
      message: 'Étudiant validé avec succès',
      etudiant
    });

  } catch (error) {
    console.error('Erreur validation étudiant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== GESTION COMPTABLES =====

exports.getComptables = async (req, res) => {
  try {
    const comptables = await Comptable.find({ statut: 'actif' })
      .select('-mot_de_passe')
      .sort({ createdAt: -1 });

    res.json({ comptables });
  } catch (error) {
    console.error('Erreur récupération comptables:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.modifierComptable = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, mot_de_passe } = req.body;

    const updateData = { nom, prenom, email, telephone };
    
    // Si un nouveau mot de passe est fourni
    if (mot_de_passe && mot_de_passe.trim() !== '') {
      const bcrypt = require('bcryptjs');
      updateData.mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
    }

    const comptable = await Comptable.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-mot_de_passe');

    if (!comptable) {
      return res.status(404).json({ message: 'Comptable non trouvé' });
    }

    res.json({
      message: 'Comptable modifié avec succès',
      comptable
    });
  } catch (error) {
    console.error('Erreur modification comptable:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.supprimerComptable = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le comptable existe
    const comptable = await Comptable.findById(id);
    if (!comptable) {
      return res.status(404).json({ message: 'Comptable non trouvé' });
    }

    // Marquer comme inactif au lieu de supprimer
    await Comptable.findByIdAndUpdate(id, { statut: 'inactif' });

    res.json({ message: 'Comptable supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression comptable:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== GESTION VIGILES =====

exports.getVigiles = async (req, res) => {
  try {
    const vigiles = await Vigile.find({ statut: 'actif' })
      .select('-code_acces')
      .sort({ createdAt: -1 });

    res.json({ vigiles });
  } catch (error) {
    console.error('Erreur récupération vigiles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.modifierVigile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, telephone, code_acces, poste } = req.body;

    const updateData = { nom, prenom, telephone, poste };
    
    // Si un nouveau code d'accès est fourni
    if (code_acces && code_acces.trim() !== '') {
      const bcrypt = require('bcryptjs');
      updateData.code_acces = await bcrypt.hash(code_acces, 10);
    }

    const vigile = await Vigile.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-code_acces');

    if (!vigile) {
      return res.status(404).json({ message: 'Vigile non trouvé' });
    }

    res.json({
      message: 'Vigile modifié avec succès',
      vigile
    });
  } catch (error) {
    console.error('Erreur modification vigile:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Téléphone déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.supprimerVigile = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le vigile existe
    const vigile = await Vigile.findById(id);
    if (!vigile) {
      return res.status(404).json({ message: 'Vigile non trouvé' });
    }

    // Marquer comme inactif au lieu de supprimer
    await Vigile.findByIdAndUpdate(id, { statut: 'inactif' });

    res.json({ message: 'Vigile supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression vigile:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== VIGILE - HISTORIQUE =====

exports.getHistoriqueAcces = async (req, res) => {
  try {
    const vigile_id = req.user.id;
    
    const historique = await AccesEntree.find({ vigile_id })
      .populate('etudiant_id', 'nom prenom matricule programme_id')
      .populate({
        path: 'etudiant_id',
        populate: {
          path: 'programme_id',
          select: 'nom licence'
        }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ historique });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== NOUVELLES FONCTIONS POUR CHEF DE CLASSE =====

// Fonction getEtudiantById (si elle n'existe pas déjà)
exports.getEtudiantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const etudiant = await Etudiant.findById(id)
      .populate('programme_id', 'nom licence semestre')
      .select('-mot_de_passe');
    
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    res.json(etudiant);
  } catch (error) {
    console.error('Erreur récupération étudiant:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de l\'étudiant',
      error: error.message
    });
  }
};

// Fonction updateEtudiant 
exports.updateEtudiant = async (req, res) => {
  try {
    const { id } = req.params;
    const { matricule, nom, prenom, email, telephone, programme_id, groupe } = req.body;
    
    const updateData = { matricule, nom, prenom, email, telephone, programme_id, groupe };
    
    const etudiant = await Etudiant.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('programme_id', 'nom licence semestre').select('-mot_de_passe');
    
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    res.json({
      message: 'Étudiant modifié avec succès',
      etudiant
    });
  } catch (error) {
    console.error('Erreur modification étudiant:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `${field} déjà utilisé` });
    }
    res.status(500).json({
      message: 'Erreur serveur lors de la modification',
      error: error.message
    });
  }
};

// Fonction deleteEtudiant
exports.deleteEtudiant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const etudiant = await Etudiant.findByIdAndDelete(id);
    
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    res.json({ message: 'Étudiant supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression étudiant:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la suppression',
      error: error.message
    });
  }
};

// Fonction getProgrammes 
exports.getProgrammes = async (req, res) => {
  try {
    const programmes = await Programme.find({})
      .select('nom licence semestre')
      .sort({ nom: 1 });
    
    res.json(programmes);
  } catch (error) {
    console.error('Erreur récupération programmes:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des programmes',
      error: error.message
    });
  }
};

// Fonction getPresencesEnAttente
exports.getPresencesEnAttente = async (req, res) => {
  try {
    const { classe } = req.query;
    
    let filter = { statut: 'en_attente' };
    
    // Si une classe est spécifiée, filtrer par classe
    if (classe) {
      // Récupérer les étudiants de cette classe
      const etudiants = await Etudiant.find()
        .populate('programme_id', 'nom')
        .select('_id');
      
      const etudiantsClasse = etudiants.filter(e => 
        e.programme_id && e.programme_id.nom.toLowerCase().includes(classe.toLowerCase())
      );
      
      const etudiantIds = etudiantsClasse.map(e => e._id);
      filter.etudiant_id = { $in: etudiantIds };
    }
    
    const presences = await PresenceEtudiant.find(filter)
      .populate('etudiant_id', 'nom prenom matricule programme_id')
      .populate('cours_id', 'nom')
      .populate({
        path: 'etudiant_id',
        populate: {
          path: 'programme_id',
          select: 'nom licence'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(presences);
  } catch (error) {
    console.error('Erreur récupération présences en attente:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des présences',
      error: error.message
    });
  }
};

// Fonction confirmerPresence
exports.confirmerPresence = async (req, res) => {
  try {
    const { id } = req.params;
    const chef_id = req.user?.id; // ID du chef de classe connecté
    
    const presence = await PresenceEtudiant.findByIdAndUpdate(
      id,
      { 
        statut: 'confirmee',
        chef_validateur: chef_id,
        date_validation: new Date()
      },
      { new: true }
    ).populate('etudiant_id', 'nom prenom matricule');
    
    if (!presence) {
      return res.status(404).json({ message: 'Présence non trouvée' });
    }
    
    res.json({
      message: 'Présence confirmée avec succès',
      presence
    });
  } catch (error) {
    console.error('Erreur confirmation présence:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la confirmation',
      error: error.message
    });
  }
};

// Fonction rejeterPresence
exports.rejeterPresence = async (req, res) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;
    const chef_id = req.user?.id;
    
    const presence = await PresenceEtudiant.findByIdAndUpdate(
      id,
      { 
        statut: 'rejetee',
        chef_validateur: chef_id,
        date_validation: new Date(),
        motif_rejet: motif
      },
      { new: true }
    ).populate('etudiant_id', 'nom prenom matricule');
    
    if (!presence) {
      return res.status(404).json({ message: 'Présence non trouvée' });
    }
    
    res.json({
      message: 'Présence rejetée avec succès',
      presence
    });
  } catch (error) {
    console.error('Erreur rejet présence:', error);
    res.status(500).json({
      message: 'Erreur serveur lors du rejet',
      error: error.message
    });
  }
};

// ===== FONCTIONS ÉTUDIANT =====

// Récupérer l'emploi du temps de l'étudiant
exports.getEmploiDuTempsEtudiant = async (req, res) => {
  try {
    const etudiant_id = req.user.id;
    
    console.log('🔍 Récupération emploi du temps pour étudiant:', etudiant_id);
    
    // Récupérer l'étudiant avec son programme
    const etudiant = await Etudiant.findById(etudiant_id)
      .populate('programme_id', 'nom licence semestre');
    
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    console.log('👤 Étudiant trouvé:', {
      nom: etudiant.nom,
      programme: etudiant.programme_id?.nom,
      groupe: etudiant.groupe
    });
    
    // ✅ CORRECTION : Utiliser le bon modèle EmploiDuTemps avec seances
    const emploiDuTemps = await EmploiDuTemps.findOne({
      programme: etudiant.programme_id._id,
      groupe: etudiant.groupe,
      statut: 'actif'
    })
    .populate({
      path: 'seances.cours',
      select: 'nom_matiere duree'
    })
    .populate({
      path: 'seances.professeur',
      select: 'nom prenom'
    })
    .populate({
      path: 'seances.salle',
      select: 'nom batiment'
    });
    
    console.log('📅 Emploi du temps trouvé:', emploiDuTemps ? 'Oui' : 'Non');
    
    if (!emploiDuTemps || !emploiDuTemps.seances || emploiDuTemps.seances.length === 0) {
      console.log('❌ Aucune séance trouvée');
      return res.json({
        etudiant: {
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          programme: etudiant.programme_id.nom,
          groupe: etudiant.groupe
        },
        emploi_du_temps: []
      });
    }
    
    // ✅ TRANSFORMATION des seances en format attendu par le mobile
    const coursTransformes = emploiDuTemps.seances.map(seance => {
      console.log('🎯 Transformation seance:', {
        cours: seance.cours?.nom_matiere,
        professeur: seance.professeur?.nom,
        salle: seance.salle?.nom,
        jour: seance.jour,
        creneau: seance.creneau
      });
      
      return {
        _id: seance._id,
        cours_id: {
          _id: seance.cours?._id || '',
          nom: seance.cours?.nom_matiere || 'Cours non défini'
        },
        professeur_id: {
          _id: seance.professeur?._id || '',
          nom: seance.professeur?.nom || '',
          prenom: seance.professeur?.prenom || '',
          nom_complet: seance.professeur ? `${seance.professeur.prenom} ${seance.professeur.nom}` : 'Professeur non défini'
        },
        salle_id: {
          _id: seance.salle?._id || '',
          nom: seance.salle?.nom || 'Salle non définie'
        },
        jour: seance.jour.toLowerCase(),
        creneau: seance.creneau,
        heure_debut: seance.creneau.split(' - ')[0] || '',
        heure_fin: seance.creneau.split(' - ')[1] || ''
      };
    });
    
    console.log('📚 Nombre de cours transformés:', coursTransformes.length);
    console.log('📚 Premier cours exemple:', coursTransformes[0]);
    
    res.json({
      etudiant: {
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        programme: etudiant.programme_id.nom,
        groupe: etudiant.groupe
      },
      emploi_du_temps: coursTransformes
    });
    
  } catch (error) {
    console.error('Erreur récupération emploi du temps étudiant:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Envoyer une demande de présence
exports.envoyerDemandePresence = async (req, res) => {
  try {
    const etudiant_id = req.user.id;
    const { cours_id, emploi_du_temps_id, date_cours, justification } = req.body;
    
    // Vérifier que l'étudiant existe et qu'il a accès à la faculté
    const etudiant = await Etudiant.findById(etudiant_id);
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    // Vérifier si l'étudiant est entré dans la faculté aujourd'hui
    const aujourd_hui = new Date();
    aujourd_hui.setHours(0, 0, 0, 0);
    
    const acces_aujourd_hui = await AccesEntree.findOne({
      etudiant_id: etudiant_id,
      autorisation: true,
      createdAt: { $gte: aujourd_hui }
    });
    
    if (!acces_aujourd_hui) {
      return res.status(403).json({ 
        message: 'Vous devez d\'abord scanner votre QR code à l\'entrée de la faculté' 
      });
    }
    
    // Vérifier qu'il n'y a pas déjà une demande pour ce cours
    const demandeExistante = await PresenceEtudiant.findOne({
      etudiant_id,
      cours_id,
      date_cours: new Date(date_cours)
    });
    
    if (demandeExistante) {
      return res.status(400).json({ 
        message: 'Vous avez déjà envoyé une demande pour ce cours' 
      });
    }
    
    // Créer la demande de présence
    const presence = new PresenceEtudiant({
      etudiant_id,
      cours_id,
      emploi_du_temps_id,
      date_cours: new Date(date_cours),
      jour: new Date(date_cours).toLocaleDateString('fr-FR', { weekday: 'long' }),
      creneau: `${new Date().getHours()}h${String(new Date().getMinutes()).padStart(2, '0')}`,
      est_entre_fac: true,
      remarques: justification
    });
    
    await presence.save();
    
    const presencePopulee = await PresenceEtudiant.findById(presence._id)
      .populate('cours_id', 'nom')
      .populate('etudiant_id', 'nom prenom matricule');
    
    res.status(201).json({
      message: 'Demande de présence envoyée avec succès',
      presence: presencePopulee
    });
    
  } catch (error) {
    console.error('Erreur envoi demande présence:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer le profil de l'étudiant
exports.getProfilEtudiant = async (req, res) => {
  try {
    const etudiant_id = req.user.id;
    
    const etudiant = await Etudiant.findById(etudiant_id)
      .populate('programme_id', 'nom licence semestre')
      .select('-mot_de_passe');
    
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    // Récupérer les dernières présences
    const presences = await PresenceEtudiant.find({ etudiant_id })
      .populate('cours_id', 'nom')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      etudiant,
      dernieres_presences: presences
    });
    
  } catch (error) {
    console.error('Erreur récupération profil étudiant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ AJOUT: Rechercher un étudiant par matricule (pour comptable)
exports.rechercherEtudiantParMatricule = async (req, res) => {
  try {
    const { matricule } = req.params;
    
    console.log('🔍 Recherche étudiant par matricule:', matricule);
    
    const etudiant = await Etudiant.findOne({ matricule })
      .populate('programme_id', 'nom licence semestre')
      .select('-mot_de_passe');
    
    if (!etudiant) {
      return res.status(404).json({ 
        message: 'Aucun étudiant trouvé avec ce matricule' 
      });
    }
    
    console.log('✅ Étudiant trouvé:', etudiant.nom, etudiant.prenom);
    
    res.json({
      success: true,
      etudiant: etudiant
    });
    
  } catch (error) {
    console.error('Erreur recherche étudiant par matricule:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la recherche',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ CORRECTION COMPLÈTE: Fonction simplifiée sans montants
exports.mettreAJourPaiementEtudiant = async (req, res) => {
  try {
    const { id } = req.params;
    const { pourcentage_paiement, pourcentage_paiement_seuil, remarques } = req.body;

    console.log(`📝 Mise à jour paiement étudiant ${id}:`, {
      pourcentage_paiement,
      pourcentage_paiement_seuil,
      remarques
    });

    // Validation
    if (pourcentage_paiement < 0 || pourcentage_paiement > 100) {
      return res.status(400).json({
        success: false,
        message: 'Le pourcentage de paiement doit être entre 0 et 100'
      });
    }

    if (pourcentage_paiement_seuil < 0 || pourcentage_paiement_seuil > 100) {
      return res.status(400).json({
        success: false,
        message: 'Le seuil de paiement doit être entre 0 et 100'
      });
    }

    // Trouver l'étudiant
    const etudiant = await Etudiant.findById(id);
    if (!etudiant) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    // Mettre à jour les champs
    etudiant.pourcentage_paiement = pourcentage_paiement;
    etudiant.pourcentage_paiement_seuil = pourcentage_paiement_seuil;

    await etudiant.save();

    // Mettre à jour ou créer l'enregistrement de paiement
    const paiementData = {
      etudiant_id: etudiant._id,
      pourcentage_paye: pourcentage_paiement,
      statut: pourcentage_paiement >= pourcentage_paiement_seuil ? 'complet' : 'partiel',
      remarques: remarques || '',
      date_mise_a_jour: new Date()
    };

    const paiementExistant = await Paiement.findOne({ etudiant_id: etudiant._id });
    
    if (paiementExistant) {
      await Paiement.findByIdAndUpdate(paiementExistant._id, paiementData);
    } else {
      const nouveauPaiement = new Paiement(paiementData);
      await nouveauPaiement.save();
    }

    console.log('✅ Paiement mis à jour avec succès');

    res.json({
      success: true,
      message: 'Paiement mis à jour avec succès',
      etudiant: {
        id: etudiant._id,
        matricule: etudiant.matricule,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        pourcentage_paiement: etudiant.pourcentage_paiement,
        pourcentage_paiement_seuil: etudiant.pourcentage_paiement_seuil
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour paiement étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du paiement'
    });
  }
};

module.exports = exports; 