const Administrateur = require('../models/Administrateur');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const administrateurController = {
  login: async (req, res) => {
    try {
      const { email, mot_de_passe } = req.body;
      const admin = await Administrateur.findOne({ email });

      if (!admin) {
        return res.status(400).json({ message: "Administrateur non trouvé" });
      }

      const isMatch = await bcrypt.compare(mot_de_passe, admin.mot_de_passe);
      if (!isMatch) {
        return res.status(400).json({ message: "Mot de passe incorrect" });
      }

      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

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
      const updatedAdmin = await Administrateur.findByIdAndUpdate(
        req.params.id,
        { nom, prenom, adresse, email, telephone, mot_de_passe },
        { new: true }
      );
      res.json(updatedAdmin);
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
  }
};

module.exports = administrateurController;

