const Settings = require('../models/Settings');
const Administrateur = require('../models/Administrateur');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration Multer pour upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/avatars/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
    }
  }
});

const settingsController = {
  // Récupérer les paramètres
  getSettings: async (req, res) => {
    try {
      let settings = await Settings.findOne({ administrateur: req.user.id })
        .populate('administrateur', '-mot_de_passe');
      
      // Si pas de paramètres, créer des paramètres par défaut
      if (!settings) {
        settings = new Settings({
          administrateur: req.user.id
        });
        await settings.save();
        await settings.populate('administrateur', '-mot_de_passe');
      }
      
      res.json(settings);
    } catch (error) {
      console.error('Erreur récupération paramètres:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des paramètres' });
    }
  },
  
  // Mettre à jour une section de paramètres
  updateSettings: async (req, res) => {
    try {
      const { section, data } = req.body;
      
      if (!section || !data) {
        return res.status(400).json({ message: 'Section et données requises' });
      }
      
      const validSections = ['general', 'security', 'notifications', 'appearance', 'profile'];
      if (!validSections.includes(section)) {
        return res.status(400).json({ message: 'Section invalide' });
      }
      
      let settings = await Settings.findOne({ administrateur: req.user.id });
      
      if (!settings) {
        settings = new Settings({
          administrateur: req.user.id,
          [section]: data
        });
      } else {
        settings[section] = { ...settings[section].toObject(), ...data };
      }
      
      await settings.save();
      
      res.json({ 
        message: `Paramètres ${section} mis à jour avec succès`,
        settings: settings[section]
      });
    } catch (error) {
      console.error('Erreur mise à jour paramètres:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres' });
    }
  },
  
  // Mettre à jour le profil administrateur
  updateProfile: async (req, res) => {
    try {
      const { nom, prenom, email, telephone, adresse, bio } = req.body;
      
      // Vérifier si l'email existe déjà (sauf pour cet admin)
      if (email) {
        const existingAdmin = await Administrateur.findOne({ 
          email: email, 
          _id: { $ne: req.user.id } 
        });
        
        if (existingAdmin) {
          return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
      }
      
      // Mettre à jour l'administrateur
      const admin = await Administrateur.findByIdAndUpdate(
        req.user.id,
        { nom, prenom, email, telephone, adresse },
        { new: true, runValidators: true }
      ).select('-mot_de_passe');
      
      // Mettre à jour la bio dans les paramètres
      let settings = await Settings.findOne({ administrateur: req.user.id });
      if (!settings) {
        settings = new Settings({ administrateur: req.user.id });
      }
      
      if (bio !== undefined) {
        settings.profile.bio = bio;
        await settings.save();
      }
      
      res.json({ 
        message: 'Profil mis à jour avec succès',
        admin,
        bio: settings.profile.bio
      });
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
    }
  },
  
  // Changer le mot de passe
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Les nouveaux mots de passe ne correspondent pas' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      
      // Vérifier le mot de passe actuel
      const admin = await Administrateur.findById(req.user.id);
      const isMatch = await bcrypt.compare(currentPassword, admin.mot_de_passe);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
      }
      
      // Mettre à jour le mot de passe
      admin.mot_de_passe = newPassword; // Le hook pre('save') se chargera du hachage
      await admin.save();
      
      res.json({ message: 'Mot de passe changé avec succès' });
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
    }
  },
  
  // Upload avatar
  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier sélectionné' });
      }
      
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      // Mettre à jour les paramètres avec la nouvelle image
      let settings = await Settings.findOne({ administrateur: req.user.id });
      if (!settings) {
        settings = new Settings({ administrateur: req.user.id });
      }
      
      // Supprimer l'ancien avatar s'il existe
      if (settings.profile.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', settings.profile.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      settings.profile.avatar = avatarUrl;
      await settings.save();
      
      res.json({ 
        message: 'Avatar mis à jour avec succès',
        avatarUrl 
      });
    } catch (error) {
      console.error('Erreur upload avatar:', error);
      res.status(500).json({ message: 'Erreur lors de l\'upload de l\'avatar' });
    }
  },
  
  // Middleware upload
  uploadMiddleware: upload.single('avatar'),
  
  // Réinitialiser les paramètres
  resetSettings: async (req, res) => {
    try {
      const { section } = req.body;
      
      let settings = await Settings.findOne({ administrateur: req.user.id });
      if (!settings) {
        return res.status(404).json({ message: 'Paramètres non trouvés' });
      }
      
      if (section && section !== 'all') {
        // Réinitialiser une section spécifique
        const defaultSettings = new Settings({ administrateur: req.user.id });
        settings[section] = defaultSettings[section];
      } else {
        // Réinitialiser tous les paramètres
        const adminId = settings.administrateur;
        await Settings.findByIdAndDelete(settings._id);
        settings = new Settings({ administrateur: adminId });
      }
      
      await settings.save();
      
      res.json({ 
        message: section === 'all' ? 'Tous les paramètres ont été réinitialisés' : `Paramètres ${section} réinitialisés`,
        settings: section && section !== 'all' ? settings[section] : settings
      });
    } catch (error) {
      console.error('Erreur réinitialisation paramètres:', error);
      res.status(500).json({ message: 'Erreur lors de la réinitialisation des paramètres' });
    }
  },

  // Obtenir les statistiques du profil
  getProfileStats: async (req, res) => {
    try {
      const adminId = req.user.id;
      
      // Compter les différentes entités créées par cet admin
      const [emploisCount, notificationsCount, feedbacksCount] = await Promise.all([
        // Compter les emplois du temps (si vous avez un champ createdBy)
        // EmploiDuTemps.countDocuments({ createdBy: adminId }),
        24, // Valeur fictive pour l'instant
        
        // Compter les notifications envoyées
        // Notification.countDocuments({ sender: adminId }),
        156, // Valeur fictive pour l'instant
        
        // Compter les feedbacks traités
        // Feedback.countDocuments({ repondu_par: 'admin' }),
        89 // Valeur fictive pour l'instant
      ]);
      
      // Calculer la date de création du compte
      const admin = await Administrateur.findById(adminId);
      const accountAge = Math.floor((Date.now() - admin.createdAt) / (1000 * 60 * 60 * 24 * 30)); // en mois
      
      const stats = {
        monthsActive: Math.max(1, accountAge),
        totalLogins: 156, // À implémenter avec un système de tracking
        emploisCreated: emploisCount,
        activityRate: 89 // Calculé selon votre logique
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Erreur statistiques profil:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
  },

  // Exporter les paramètres
  exportSettings: async (req, res) => {
    try {
      const settings = await Settings.findOne({ administrateur: req.user.id })
        .populate('administrateur', 'nom prenom email');
      
      if (!settings) {
        return res.status(404).json({ message: 'Paramètres non trouvés' });
      }
      
      const exportData = {
        exportDate: new Date().toISOString(),
        user: settings.administrateur,
        settings: {
          general: settings.general,
          security: {
            ...settings.security,
            ipWhitelist: settings.security.ipWhitelist // Garder les IPs mais masquer les autres données sensibles
          },
          notifications: settings.notifications,
          appearance: settings.appearance,
          profile: {
            bio: settings.profile.bio,
            preferences: settings.profile.preferences
          }
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=settings-export.json');
      res.json(exportData);
    } catch (error) {
      console.error('Erreur export paramètres:', error);
      res.status(500).json({ message: 'Erreur lors de l\'export des paramètres' });
    }
  },

  // Importer les paramètres
  importSettings: async (req, res) => {
    try {
      const { settingsData } = req.body;
      
      if (!settingsData) {
        return res.status(400).json({ message: 'Données de paramètres requises' });
      }
      
      let settings = await Settings.findOne({ administrateur: req.user.id });
      if (!settings) {
        settings = new Settings({ administrateur: req.user.id });
      }
      
      // Mettre à jour uniquement les sections valides
      const allowedSections = ['general', 'notifications', 'appearance', 'profile'];
      
      allowedSections.forEach(section => {
        if (settingsData[section]) {
          settings[section] = { ...settings[section].toObject(), ...settingsData[section] };
        }
      });
      
      await settings.save();
      
      res.json({ 
        message: 'Paramètres importés avec succès',
        settings 
      });
    } catch (error) {
      console.error('Erreur import paramètres:', error);
      res.status(500).json({ message: 'Erreur lors de l\'import des paramètres' });
    }
  }
};

module.exports = settingsController; 