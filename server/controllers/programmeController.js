const Programme = require('../models/Programme');

const programmeController = {
  // Créer un nouveau programme
  creerProgramme: async (req, res) => {
    try {
      const { nom, licence, semestre, groupe, description } = req.body;

      // Validation des données requises
      if (!nom || !licence || !semestre || !groupe || !description) {
        return res.status(400).json({ 
          message: "Tous les champs sont requis (nom, licence, semestre, groupe, description)" 
        });
      }

      // Vérifier si la licence et le semestre sont des nombres
      const licenceNum = parseInt(licence);
      const semestreNum = parseInt(semestre);
      if (isNaN(licenceNum) || isNaN(semestreNum)) {
        return res.status(400).json({ 
          message: "La licence et le semestre doivent être des nombres" 
        });
      }

      // Ne plus générer manuellement l'id_programme, laisser le hook le faire
      const programme = new Programme({
        nom,
        licence: licenceNum,
        semestre: semestreNum,
        groupe,
        description
      });

      const nouveauProgramme = await programme.save();
      res.status(201).json(nouveauProgramme);
    } catch (error) {
      console.error('Erreur création programme:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: "Erreur de validation",
          details: Object.values(error.errors).map(err => err.message)
        });
      }
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: "Un programme avec cet identifiant existe déjà" 
        });
      }
      res.status(500).json({ message: "Erreur serveur lors de la création du programme" });
    }
  },

  // Récupérer tous les programmes
  getAllProgrammes: async (req, res) => {
    try {
      const programmes = await Programme.find();  // Supprimé le populate car nous n'avons plus de matieres
      res.status(200).json(programmes);
    } catch (error) {
      console.error('Erreur récupération programmes:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer un programme par ID
  getProgrammeById: async (req, res) => {
    try {
      const programme = await Programme.findById(req.params.id)
        .populate('matieres.professeurs', 'nom prenom matiere');
      
      if (!programme) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }
      res.status(200).json(programme);
    } catch (error) {
      console.error('Erreur récupération programme:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour un programme
  updateProgramme: async (req, res) => {
    try {
      const { nom, licence, semestre, groupe, description } = req.body;
      
      // Validation des données requises
      if (!nom || !licence || !semestre || !groupe || !description) {
        return res.status(400).json({ 
          message: "Tous les champs sont requis (nom, licence, semestre, groupe, description)" 
        });
      }

      // Conversion en nombres
      const licenceNum = parseInt(licence);
      const semestreNum = parseInt(semestre);
      
      if (isNaN(licenceNum) || isNaN(semestreNum)) {
        return res.status(400).json({ 
          message: "La licence et le semestre doivent être des nombres" 
        });
      }

      console.log('Mise à jour programme avec:', {
        nom,
        licence: licenceNum,
        semestre: semestreNum,
        groupe,
        description
      });

      const programme = await Programme.findByIdAndUpdate(
        req.params.id,
        {
          nom,
          licence: licenceNum,
          semestre: semestreNum,
          groupe,
          description
        },
        { new: true, runValidators: true }
      );

      if (!programme) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }
      
      console.log('Programme mis à jour:', programme);
      res.status(200).json(programme);
    } catch (error) {
      console.error('Erreur mise à jour programme:', error);
      res.status(400).json({ message: error.message });
    }
  },

  // Supprimer un programme
  deleteProgramme: async (req, res) => {
    try {
      const programme = await Programme.findByIdAndDelete(req.params.id);
      
      if (!programme) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }
      res.status(200).json({ message: "Programme supprimé avec succès" });
    } catch (error) {
      console.error('Erreur suppression programme:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Ajouter une matière à un programme
  ajouterMatiere: async (req, res) => {
    try {
      const programme = await Programme.findById(req.params.id);
      if (!programme) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }

      programme.matieres.push(req.body);
      await programme.save();
      
      res.status(200).json(programme);
    } catch (error) {
      console.error('Erreur ajout matière:', error);
      res.status(400).json({ message: error.message });
    }
  },

  // Supprimer une matière d'un programme
  supprimerMatiere: async (req, res) => {
    try {
      const programme = await Programme.findById(req.params.programmeId);
      if (!programme) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }

      programme.matieres = programme.matieres.filter(
        matiere => matiere.id_matiere !== req.params.matiereId
      );
      await programme.save();
      
      res.status(200).json(programme);
    } catch (error) {
      console.error('Erreur suppression matière:', error);
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = programmeController; 