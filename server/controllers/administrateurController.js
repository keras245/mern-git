const Administrateur = require('../models/Administrateur');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createSession } = require('./sessionController');
const ResetToken = require('../models/ResetToken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ResetCode = require('../models/ResetCode');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

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
  },

  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      
      // Vérifier si l'admin existe
      const admin = await Administrateur.findOne({ email });
      if (!admin) {
        return res.status(404).json({ 
          success: false, 
          message: 'Aucun administrateur trouvé avec cet email' 
        });
      }

      // Supprimer les anciens codes pour cet admin
      await ResetCode.deleteMany({ adminId: admin._id });

      // Générer un code à 6 chiffres
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Sauvegarder le code
      await ResetCode.create({
        adminId: admin._id,
        code,
        email: admin.email
      });

      // Envoyer l'email avec le code
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: 'Code de réinitialisation - UNNC',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🔒 Code de Réinitialisation</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Université Nongo Conakry</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="margin: 0 0 20px 0; font-size: 16px;">Bonjour <strong>${admin.prenom}</strong>,</p>
              
              <p style="margin: 0 0 30px 0; color: #6b7280;">
                Vous avez demandé la réinitialisation de votre mot de passe administrateur. 
                Utilisez le code ci-dessous :
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #f3f4f6; border: 2px dashed #9ca3af; border-radius: 10px; padding: 20px; display: inline-block;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Votre code de vérification :</p>
                  <div style="font-size: 36px; font-weight: bold; color: #1f2937; letter-spacing: 8px; font-family: monospace;">
                    ${code}
                  </div>
                </div>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 25px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ⚠️ <strong>Important :</strong> Ce code expire dans 15 minutes et ne peut être utilisé que 3 fois maximum.
                </p>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: 'Code de vérification envoyé par email'
      });
    } catch (error) {
      console.error('Erreur envoi code:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du code'
      });
    }
  },

  resetPasswordWithCode: async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      // Validation des champs
      if (!email || !code || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, code et nouveau mot de passe requis'
        });
      }

      // Validation du mot de passe
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          success: false,
          message: "Le nouveau mot de passe doit contenir au moins 8 caractères" 
        });
      }

      // Trouver le code de réinitialisation
      const resetCode = await ResetCode.findOne({ email, code });
      if (!resetCode) {
        return res.status(400).json({
          success: false,
          message: 'Code invalide ou expiré'
        });
      }

      // Vérifier le nombre de tentatives
      if (resetCode.attempts >= 3) {
        await ResetCode.deleteOne({ _id: resetCode._id });
        return res.status(400).json({
          success: false,
          message: 'Trop de tentatives. Demandez un nouveau code.'
        });
      }

      // Incrémenter les tentatives
      resetCode.attempts += 1;
      await resetCode.save();

      // Vérifier l'expiration (15 minutes)
      if (Date.now() > resetCode.createdAt.getTime() + 900000) {
        await ResetCode.deleteOne({ _id: resetCode._id });
        return res.status(400).json({
          success: false,
          message: 'Code expiré. Demandez un nouveau code.'
        });
      }

      // Mettre à jour le mot de passe
      const admin = await Administrateur.findById(resetCode.adminId);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Administrateur non trouvé'
        });
      }

      admin.mot_de_passe = newPassword;
      await admin.save();

      // Supprimer le code utilisé
      await ResetCode.deleteOne({ _id: resetCode._id });

      res.status(200).json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      });
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la réinitialisation'
      });
    }
  }
};

module.exports = administrateurController;

