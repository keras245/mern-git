const Professeur = require('../models/Professeur');

const professeurController = {

  // Créer un professeur
  creerProf: async (req, res) => {
    try {
      const { id_prof, nom, prenom, adresse, telephone, disponibilite } = req.body;
      const newProf = new Professeur({
        id_prof,
        nom,
        prenom,
        adresse,
        telephone,
        disponibilite
      });

      await newProf.save();
      res.status(201).json({ message: "Professeur créé avec succès" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Obtenir tous les professeurs
  getAllProfs: async (req, res) => {
    try {
      const professeurs = await Professeur.find().select('-mot_de_passe');
      res.json(professeurs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Obtenir un professeur par ID
  getProfById: async (req, res) => {
    try {
      const professeur = await Professeur.findById(req.params.id).select('-mot_de_passe');
      if (!professeur) {
        return res.status(404).json({ message: "Professeur non trouvé" });
      }
      res.json(professeur);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Mettre à jour un professeur
  updateProf: async (req, res) => {
    try {
      const { nom, prenom, adresse, telephone, disponibilite } = req.body;
      const updatedProf = await Professeur.findByIdAndUpdate(
        req.params.id,
        { nom, prenom, adresse, telephone, disponibilite },
        { new: true }
      );
      res.json(updatedProf);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Supprimer un professeur
  deleteProf: async (req, res) => {
    try {
      await Professeur.findByIdAndDelete(req.params.id);
      res.json({ message: "Professeur supprimé avec succès" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Mettre à jour la disponibilité d'un professeur
  updateDisponibilite: async (req, res) => {
    try {
      const { disponibilite } = req.body;
      console.log('Mise à jour disponibilité pour prof:', req.params.id);
      console.log('Nouvelles disponibilités:', disponibilite);

      const updatedProf = await Professeur.findByIdAndUpdate(
        req.params.id,
        { disponibilite },
        { new: true }
      );

      if (!updatedProf) {
        return res.status(404).json({ message: "Professeur non trouvé" });
      }

      res.json(updatedProf);
    } catch (err) {
      console.error('Erreur mise à jour disponibilité:', err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = professeurController;
