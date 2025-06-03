const Administrateur = require('../models/Administrateur');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createSession } = require('./sessionController');

const administrateurController = {
  login: async (req, res) => {
    try {
      console.log('Tentative de connexion administrateur:', req.body);
      const { email, mot_de_passe } = req.body;
      
      // Validation des champs requis
      if (!email || !mot_de_passe) {
        console.log('Champs manquants:', { email: !!email, mot_de_passe: !!mot_de_passe });
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      
      console.log('Recherche administrateur avec email:', email);
      const admin = await Administrateur.findOne({ email });

      if (!admin) {
        console.log('Administrateur non trouvé pour email:', email);
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      console.log('Administrateur trouvé:', admin.email);
      console.log('Comparaison mot de passe...');
      const isMatch = await bcrypt.compare(mot_de_passe, admin.mot_de_passe);
      console.log('Résultat comparaison:', isMatch);
      
      if (!isMatch) {
        console.log('Mot de passe incorrect pour:', email);
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      console.log('Génération du token...');
      const token = jwt.sign(
        { id: admin._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Créer une session pour cette connexion
      try {
        await createSession(admin._id, 'administrateur', token, req);
        console.log('Session créée avec succès pour:', email);
      } catch (sessionError) {
        console.error('Erreur création session:', sessionError);
        // Ne pas empêcher la connexion si la session échoue
      }

      console.log('Connexion réussie pour:', email);
      res.json({
        token,
        admin: {
          id_admin: admin.id_admin,
          nom: admin.nom,
          prenom: admin.prenom,
          email: admin.email,
          adresse: admin.adresse,
          telephone: admin.telephone
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  creerAdmin: async (req, res) => {
    try {
      const { id_admin, nom, prenom, adresse, email, telephone, mot_de_passe } = req.body;
      const newAdmin = new Administrateur({
        id_admin,
        nom,
        prenom,
        adresse,
        email,
        telephone,
        mot_de_passe
      });

      await newAdmin.save();
      res.status(201).json({ message: "Administrateur créé avec succès" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAllAdmins: async (req, res) => {
    try {
      const admins = await Administrateur.find().select('-mot_de_passe');
      res.json(admins);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAdminById: async (req, res) => {
    try {
      const admin = await Administrateur.findById(req.params.id).select('-mot_de_passe');
      if (!admin) {
        return res.status(404).json({ message: "Administrateur non trouvé" });
      }
      res.json(admin);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateAdmin: async (req, res) => {
    try {
      const { nom, prenom, adresse, email, telephone, mot_de_passe } = req.body;
      
      // Utiliser findById puis save() pour déclencher les hooks
      const admin = await Administrateur.findById(req.params.id);
        if (!admin) {
        return res.status(404).json({ message: "Administrateur non trouvé" });
      }

      // Mettre à jour les champs
      admin.nom = nom;
      admin.prenom = prenom;
      admin.adresse = adresse;
      admin.email = email;
      admin.telephone = telephone;
      
      // Mettre à jour le mot de passe seulement s'il est fourni
      if (mot_de_passe) {
        admin.mot_de_passe = mot_de_passe;
      }

      // Sauvegarder (déclenche le hook pre('save'))
      const updatedAdmin = await admin.save();
      
      // Retourner sans le mot de passe
      const adminResponse = updatedAdmin.toObject();
      delete adminResponse.mot_de_passe;
      
      res.json(adminResponse);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      await Administrateur.findByIdAndDelete(req.params.id);
      res.json({ message: "Administrateur supprimé avec succès" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      console.log('Tentative changement mot de passe pour user:', req.user.id);
      const { currentPassword, newPassword } = req.body;
      
      // Validation des champs requis
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false,
          message: "Mot de passe actuel et nouveau mot de passe requis" 
        });
      }
      
      // Validation du nouveau mot de passe
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          success: false,
          message: "Le nouveau mot de passe doit contenir au moins 8 caractères" 
        });
      }

      // Récupérer l'administrateur
      const admin = await Administrateur.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ 
          success: false,
          message: "Administrateur non trouvé" 
        });
      }

      // Vérifier le mot de passe actuel
      console.log('Vérification mot de passe actuel...');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.mot_de_passe);
      
      if (!isCurrentPasswordValid) {
        console.log('Mot de passe actuel incorrect');
        // CORRECTION : Utiliser 400 au lieu de 401 pour éviter la déconnexion
        return res.status(400).json({ 
          success: false,
          message: "Le mot de passe actuel est incorrect",
          errorType: "CURRENT_PASSWORD_INVALID" // Ajouter un type d'erreur
        });
      }

      // Vérifier que le nouveau mot de passe est différent de l'actuel
      const isSamePassword = await bcrypt.compare(newPassword, admin.mot_de_passe);
      if (isSamePassword) {
        return res.status(400).json({ 
          success: false,
          message: "Le nouveau mot de passe doit être différent de l'actuel" 
        });
      }

      // Mettre à jour le mot de passe (le hachage se fait automatiquement via le hook pre('save'))
      admin.mot_de_passe = newPassword;
      await admin.save();

      console.log('Mot de passe mis à jour avec succès pour:', admin.email);
      
      res.json({
        success: true,
        message: "Mot de passe mis à jour avec succès"
      });

    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      res.status(500).json({ 
        success: false,
        message: "Erreur lors du changement de mot de passe" 
      });
    }
  }
};

module.exports = administrateurController;

