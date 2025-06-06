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
    const { matricule, nom, prenom, email, telephone, mot_de_passe, programme_id, groupe } = req.body;
    
    // Vérifier que le programme existe
    const programme = await Programme.findById(programme_id);
    if (!programme) {
      return res.status(400).json({ message: 'Programme non trouvé' });
    }

    const etudiant = new Etudiant({
      matricule,
      nom,
      prenom,
      email,
      telephone,
      mot_de_passe,
      programme_id,
      groupe
    });

    await etudiant.save();

    const etudiantPopule = await Etudiant.findById(etudiant._id)
      .populate('programme_id', 'nom licence semestre')
      .select('-mot_de_passe');

    res.status(201).json({
      message: 'Étudiant créé avec succès',
      etudiant: etudiantPopule
    });

  } catch (error) {
    console.error('Erreur création étudiant:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `${field} déjà utilisé` });
    }
    res.status(500).json({ message: 'Erreur serveur' });
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
    
    if (etudiant.statut_compte !== 'valide') {
      return res.status(403).json({ 
        message: 'Votre compte est en attente de validation par le chef de classe' 
      });
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
        statut_compte: etudiant.statut_compte,
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
    const { search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { nom: { $regex: search, $options: 'i' } },
          { prenom: { $regex: search, $options: 'i' } },
          { matricule: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const etudiants = await Etudiant.find(query)
      .populate('programme_id', 'nom licence semestre')
      .select('-mot_de_passe')
      .limit(20);

    res.json({ etudiants });

  } catch (error) {
    console.error('Erreur récupération étudiants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== FONCTIONS VIGILE =====

exports.scanQRCode = async (req, res) => {
  try {
    const { qr_code } = req.body;
    const vigile_id = req.user.id;
    
    console.log('Scan QR:', { qr_code, vigile_id });
    
    // Trouver l'étudiant par QR code
    const etudiant = await Etudiant.findOne({ qr_code })
      .populate('programme_id', 'nom');
    
    if (!etudiant) {
      return res.json({ 
        autorisation: false,
        message: 'QR Code invalide',
        son: 'error'
      });
    }
    
    // Vérifier le statut du compte
    if (etudiant.statut_compte !== 'valide') {
      await AccesEntree.create({
        etudiant_id: etudiant._id,
        vigile_id,
        qr_code_scanne: qr_code,
        autorisation: false,
        pourcentage_paiement: 0,
        motif_refus: 'Compte non validé'
      });
      
      return res.json({
        autorisation: false,
        message: 'Compte étudiant non validé',
        etudiant: {
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          matricule: etudiant.matricule
        },
        son: 'error'
      });
    }
    
    // Vérifier les paiements
    const dernierPaiement = await Paiement.findOne({ etudiant_id: etudiant._id })
      .sort({ createdAt: -1 });
    
    const pourcentagePaiement = dernierPaiement ? dernierPaiement.pourcentage_paye : 0;
    const seuilRequis = etudiant.pourcentage_paiement_seuil;
    
    const autorisation = pourcentagePaiement >= seuilRequis;
    
    // Enregistrer l'accès
    await AccesEntree.create({
      etudiant_id: etudiant._id,
      vigile_id,
      qr_code_scanne: qr_code,
      autorisation,
      pourcentage_paiement: pourcentagePaiement,
      motif_refus: autorisation ? null : 'Paiement insuffisant'
    });
    
    // Mettre à jour la dernière entrée si autorisé
    if (autorisation) {
      etudiant.derniere_entree_fac = new Date();
      await etudiant.save();
    }
    
    res.json({
      autorisation,
      message: autorisation 
        ? 'Accès autorisé ✅' 
        : `Paiement insuffisant ❌ (${pourcentagePaiement}% / ${seuilRequis}% requis)`,
      etudiant: {
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        matricule: etudiant.matricule,
        programme: etudiant.programme_id?.nom,
        pourcentage_paiement: pourcentagePaiement,
        seuil_requis: seuilRequis
      },
      son: autorisation ? 'success' : 'error'
    });
    
  } catch (error) {
    console.error('Erreur scan QR:', error);
    res.status(500).json({ 
      autorisation: false,
      message: 'Erreur système',
      son: 'error'
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
        statut_compte: 'valide',
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

module.exports = exports; 