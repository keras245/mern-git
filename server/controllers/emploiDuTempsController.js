const EmploiDuTemps = require('../models/EmploiDuTemps');
const Cours = require('../models/Cours');
const Professeur = require('../models/Professeur');
const Salle = require('../models/Salle');

const emploiDuTempsController = {
  // Génération automatique de l'emploi du temps
  genererEmploiAutomatique: async (req, res) => {
    try {
      const { programme, groupe } = req.body;

      // 1. Récupérer tous les cours du programme
      const cours = await Cours.find({ programme }).populate('professeurs');
      
      // 2. Récupérer toutes les salles disponibles
      const salles = await Salle.find();
      
      // 3. Récupérer tous les professeurs avec leurs disponibilités
      const professeurs = await Professeur.find();

      // Tableau pour stocker les séances générées
      const seances = [];

      // Pour chaque cours
      for (const cours of cours) {
        // Déterminer le type de salle préféré (Machine/Ordinaire)
        const typeSallePreferee = cours.nom_matiere.toLowerCase().includes('tp') ? 'Machine' : 'Ordinaire';

        // Trouver une salle disponible du type préféré
        const sallesDisponibles = salles.filter(salle => {
          return salle.type === typeSallePreferee && salle.disponibilite.length > 0;
        });

        // Si pas de salle du type préféré, prendre n'importe quelle salle disponible
        const toutesLesSalles = sallesDisponibles.length ? sallesDisponibles : salles;

        // Trouver un professeur disponible qui enseigne ce cours
        const profsDisponibles = professeurs.filter(prof => {
          return cours.professeurs.includes(prof._id) && prof.disponibilite.length > 0;
        });

        if (!profsDisponibles.length || !toutesLesSalles.length) {
          continue; // Passer au cours suivant si pas de ressources disponibles
        }

        // Pour chaque jour de la semaine
        const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const creneaux = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

        // Trouver un créneau disponible
        let creneauTrouve = false;
        for (const jour of jours) {
          if (creneauTrouve) break;

          for (const creneau of creneaux) {
            // Vérifier si le créneau est libre pour la salle et le professeur
            const salle = toutesLesSalles.find(s => 
              s.disponibilite.some(d => d.jour === jour && d.creneaux.includes(creneau))
            );

            const prof = profsDisponibles.find(p => 
              p.disponibilite.some(d => d.jour === jour && d.creneaux.includes(creneau))
            );

            if (salle && prof) {
              // Vérifier s'il n'y a pas déjà une séance à ce créneau pour ce groupe
              const creneauOccupe = seances.some(s => 
                s.jour === jour && 
                s.creneau === creneau
              );

              if (!creneauOccupe) {
                seances.push({
                  cours: cours._id,
                  professeur: prof._id,
                  salle: salle._id,
                  jour,
                  creneau
                });
                creneauTrouve = true;
                break;
              }
            }
          }
        }
      }

      // Créer le nouvel emploi du temps
      const emploiDuTemps = new EmploiDuTemps({
        programme,
        groupe,
        seances
      });

      await emploiDuTemps.save();

      // Retourner l'emploi du temps avec toutes les références peuplées
      const emploiComplet = await EmploiDuTemps.findById(emploiDuTemps._id)
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
          select: 'nom type'
        });

      res.status(201).json(emploiComplet);

    } catch (error) {
      console.error('Erreur génération emploi du temps:', error);
      res.status(500).json({
        message: "Erreur lors de la génération de l'emploi du temps",
        error: error.message
      });
    }
  },

  // Attribution manuelle d'un cours
  attribuerCoursManuel: async (req, res) => {
    try {
      const { emploiDuTempsId, seance } = req.body;

      // Vérifier les conflits
      const emploiDuTemps = await EmploiDuTemps.findById(emploiDuTempsId);
      
      const conflit = emploiDuTemps.seances.some(s => 
        s.jour === seance.jour && 
        s.creneau === seance.creneau
      );

      if (conflit) {
        return res.status(400).json({
          message: "Il existe déjà un cours sur ce créneau"
        });
      }

      // Ajouter la nouvelle séance
      emploiDuTemps.seances.push(seance);
      await emploiDuTemps.save();

      // Retourner l'emploi du temps mis à jour avec les références peuplées
      const emploiMisAJour = await EmploiDuTemps.findById(emploiDuTempsId)
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
          select: 'nom type'
        });

      res.status(200).json(emploiMisAJour);

    } catch (error) {
      console.error('Erreur attribution cours:', error);
      res.status(400).json({
        message: "Erreur lors de l'attribution du cours",
        error: error.message
      });
    }
  },

  // Méthode manquante qui causait l'erreur
  getEmploiByProgrammeAndGroupe: async (req, res) => {
    try {
      const { programmeId, groupe } = req.params;
      
      const emploiDuTemps = await EmploiDuTemps.findOne({ 
        programme: programmeId, 
        groupe: parseInt(groupe) 
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
        select: 'nom type'
      });

      if (!emploiDuTemps) {
        return res.status(404).json({ 
          message: "Aucun emploi du temps trouvé pour ce programme et ce groupe" 
        });
      }

      res.status(200).json(emploiDuTemps);
    } catch (error) {
      console.error('Erreur récupération emploi du temps:', error);
      res.status(500).json({ message: error.message });
    }
  },

  updateEmploi: async (req, res) => {
    try {
      const emploi = await EmploiDuTemps.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true }
      );
      if (!emploi) {
        return res.status(404).json({ message: "Emploi du temps non trouvé" });
      }
      res.status(200).json(emploi);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteEmploi: async (req, res) => {
    try {
      const emploi = await EmploiDuTemps.findByIdAndDelete(req.params.id);
      if (!emploi) {
        return res.status(404).json({ message: "Emploi du temps non trouvé" });
      }
      res.status(200).json({ message: "Emploi du temps supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = emploiDuTempsController;

exports.creerEmploi = async (req, res) => {
    try {
        const emploi = new EmploiDuTemps(req.body);
        await emploi.save();
        res.status(201).json(emploi);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.getAllEmplois = async (req, res) => {
    try {
        const emplois = await EmploiDuTemps.find();
        res.status(200).json(emplois);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.getEmploiById = async (req, res) => {
    try {
        const emploi = await EmploiDuTemps.findById(req.params.id);
        if (!emploi) return res.status(404).json({ message : "Emploi du temps non trouvé"});
        res.status(200).json(emploi);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

