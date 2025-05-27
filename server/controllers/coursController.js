const Cours = require('../models/Cours');

const coursController = {
  creerCours: async (req, res) => {
    try {
      console.log('Données reçues:', req.body);

      const { nom_matiere, duree, id_programme, id_prof } = req.body;

      // Vérifier si un cours avec le même nom existe déjà DANS LE MÊME PROGRAMME
      // (Un même cours peut exister dans différents programmes)
      const coursExistant = await Cours.findOne({ 
        nom_matiere: nom_matiere?.trim(),
        id_programme: id_programme
      });
      
      if (coursExistant) {
        console.log('Cours existant trouvé:', coursExistant);
        return res.status(400).json({
          message: "Un cours avec ce nom existe déjà dans ce programme",
          details: "Veuillez choisir un nom différent ou sélectionner un autre programme"
        });
      }

      // Création du cours (id_cours sera généré automatiquement)
      const coursData = {
        nom_matiere: nom_matiere?.trim(),
        duree: duree ? parseInt(duree) : undefined,
        id_programme: id_programme,
        id_prof: Array.isArray(id_prof) ? id_prof : (id_prof ? [id_prof] : [])
      };

      console.log('Données du cours à créer:', coursData);

      const cours = new Cours(coursData);
      const nouveauCours = await cours.save();

      // Récupération avec populate
      const coursComplet = await Cours.findById(nouveauCours._id)
        .populate('id_programme', 'nom licence semestre groupe')
        .populate('id_prof', 'nom prenom id_prof');

      console.log('Cours créé avec succès:', coursComplet);
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

      // Erreur de duplication (au niveau de la base de données)
      if (error.code === 11000) {
        // Vérifier si c'est une duplication sur id_cours ou sur nom_matiere+id_programme
        if (error.message.includes('id_cours')) {
          return res.status(400).json({
            message: "Erreur de génération d'identifiant",
            details: "Veuillez réessayer"
          });
        } else {
          return res.status(400).json({
            message: "Un cours avec ce nom existe déjà dans ce programme",
            details: "Veuillez choisir un nom différent"
          });
        }
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
        .populate('id_programme', 'nom licence semestre groupe')
        .populate('id_prof', 'nom prenom id_prof');
      res.status(200).json(cours);
    } catch (error) {
      console.error('Erreur récupération cours:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getCoursById: async (req, res) => {
    try {
      const cours = await Cours.findById(req.params.id)
        .populate('id_programme', 'nom licence semestre groupe')
        .populate('id_prof', 'nom prenom id_prof');
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
      const { nom_matiere, duree, id_programme, id_prof } = req.body;

      // Si le nom ou le programme est modifié, vérifier qu'il n'existe pas déjà dans ce programme
      if (nom_matiere || id_programme) {
        const coursExistant = await Cours.findOne({
          nom_matiere: nom_matiere ? nom_matiere.trim() : undefined,
          id_programme: id_programme,
          _id: { $ne: req.params.id } // Exclure le cours actuel de la recherche
        });

        if (coursExistant) {
          return res.status(400).json({
            message: "Un cours avec ce nom existe déjà dans ce programme",
            details: "Veuillez choisir un nom différent ou sélectionner un autre programme"
          });
        }
      }

      // Préparer les données à mettre à jour (sans toucher à id_cours)
      const updateData = {};
      if (nom_matiere) updateData.nom_matiere = nom_matiere.trim();
      if (duree) updateData.duree = parseInt(duree);
      if (id_programme) updateData.id_programme = id_programme;
      if (id_prof) updateData.id_prof = Array.isArray(id_prof) ? id_prof : (id_prof ? [id_prof] : []);

      const cours = await Cours.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { 
          new: true, 
          runValidators: true 
        }
      ).populate('id_programme', 'nom licence semestre groupe')
        .populate('id_prof', 'nom prenom id_prof');

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
          message: "Un cours avec ce nom existe déjà dans ce programme",
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
