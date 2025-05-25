const Cours = require('../models/Cours');

const coursController = {
  creerCours: async (req, res) => {
    try {
      console.log('Données reçues:', req.body);

      const { nom_matiere, duree, programme, professeurs } = req.body;

      // Vérifier si un cours avec le même nom existe déjà
      const coursExistant = await Cours.findOne({ nom_matiere: nom_matiere?.trim() });
      if (coursExistant) {
        return res.status(400).json({
          message: "Un cours avec ce nom existe déjà",
          details: "Veuillez choisir un nom différent"
        });
      }

      // Création du cours
      const coursData = {
        nom_matiere: nom_matiere?.trim(),
        duree: duree ? parseInt(duree) : undefined,
        programme: programme,
        professeurs: Array.isArray(professeurs) ? professeurs : []
      };

      const cours = new Cours(coursData);
      const nouveauCours = await cours.save();

      // Récupération avec populate
      const coursComplet = await Cours.findById(nouveauCours._id)
        .populate('programme', 'nom niveau groupe')
        .populate('professeurs', 'nom prenom');

      res.status(201).json(coursComplet);

    } catch (error) {
      console.error('Erreur détaillée:', error);

      // Erreur de validation Mongoose
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          message: "Validation échouée",
          details: messages
        });
      }

      // Erreur de type de données
      if (error.name === 'CastError') {
        return res.status(400).json({
          message: "Format de données invalide",
          field: error.path,
          value: error.value
        });
      }

      // Erreur de duplication
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Un cours avec ce nom existe déjà",
          details: "Veuillez choisir un nom différent"
        });
      }

      // Autres erreurs
      res.status(500).json({
        message: "Erreur lors de la création du cours",
        error: error.message
      });
    }
  },

  getAllCours: async (req, res) => {
    try {
      const cours = await Cours.find()
        .populate('programme', 'nom niveau groupe')
        .populate('professeurs', 'nom prenom');
      res.status(200).json(cours);
    } catch (error) {
      console.error('Erreur récupération cours:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getCoursById: async (req, res) => {
    try {
      const cours = await Cours.findById(req.params.id)
        .populate('programme', 'nom niveau groupe')
        .populate('professeurs', 'nom prenom');
      if (!cours) {
        return res.status(404).json({ message: "Cours non trouvé" });
      }
      res.status(200).json(cours);
    } catch (error) {
      console.error('Erreur récupération cours:', error);
      res.status(500).json({ message: error.message });
    }
  },

  updateCours: async (req, res) => {
    try {
      const { nom_matiere, duree, programme, professeurs } = req.body;

      // Si le nom est modifié, vérifier qu'il n'existe pas déjà (sauf pour le cours actuel)
      if (nom_matiere) {
        const coursExistant = await Cours.findOne({
          nom_matiere: nom_matiere.trim(),
          _id: { $ne: req.params.id } // Exclure le cours actuel de la recherche
        });

        if (coursExistant) {
          return res.status(400).json({
            message: "Un cours avec ce nom existe déjà",
            details: "Veuillez choisir un nom différent"
          });
        }
      }

      // Préparer les données à mettre à jour
      const updateData = {};
      if (nom_matiere) updateData.nom_matiere = nom_matiere.trim();
      if (duree) updateData.duree = parseInt(duree);
      if (programme) updateData.programme = programme;
      if (professeurs) updateData.professeurs = Array.isArray(professeurs) ? professeurs : [];

      const cours = await Cours.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { 
          new: true, 
          runValidators: true 
        }
      ).populate('programme', 'nom niveau groupe')
        .populate('professeurs', 'nom prenom');

      if (!cours) {
        return res.status(404).json({ message: "Cours non trouvé" });
      }

      res.status(200).json(cours);
    } catch (error) {
      console.error('Erreur mise à jour cours:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: "Validation échouée",
          details: Object.values(error.errors).map(err => err.message)
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          message: "Format de données invalide",
          field: error.path,
          value: error.value
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Un cours avec ce nom existe déjà",
          details: "Veuillez choisir un nom différent"
        });
      }

      res.status(500).json({
        message: "Erreur lors de la mise à jour du cours",
        error: error.message
      });
    }
  },

  deleteCours: async (req, res) => {
    try {
      const cours = await Cours.findByIdAndDelete(req.params.id);
      if (!cours) {
        return res.status(404).json({ message: "Cours non trouvé" });
      }
      res.status(200).json({ message: "Cours supprimé avec succès" });
    } catch (error) {
      console.error('Erreur suppression cours:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = coursController;
