const Presence = require('../models/Presence');
const Professeur = require('../models/Professeur');
const Cours = require('../models/Cours');
const EmploiDuTemps = require('../models/EmploiDuTemps');
const Programme = require('../models/Programme');

const presenceController = {
  // Créer ou mettre à jour une présence
  creerOuMajPresence: async (req, res) => {
    try {
      console.log('=== CRÉATION/MAJ PRÉSENCE ===');
      console.log('Body reçu:', req.body);
      console.log('User:', req.user);
      
      const { 
        date, 
        statut, 
        id_prof, 
        id_cours,
        nom_matiere,
        creneau,
        salle,
        type_cours,
        id_programme,
        nom_programme,
        groupe,
        commentaire,
        heure_arrivee
      } = req.body;
      
      // Validation des données requises
      if (!date || !statut || !id_prof || !creneau || !id_programme || !groupe) {
        console.error('Données manquantes:', { date, statut, id_prof, creneau, id_programme, groupe });
        return res.status(400).json({ 
          message: 'Données requises manquantes',
          manquantes: {
            date: !date,
            statut: !statut,
            id_prof: !id_prof,
            creneau: !creneau,
            id_programme: !id_programme,
            groupe: !groupe
          }
        });
      }
      
      const enregistre_par = req.user.id; // ID du chef de classe connecté
      console.log('Enregistré par:', enregistre_par);
      
      // Vérifier si une présence existe déjà pour ce professeur, cette date, ce créneau ET ce groupe
      let presence = await Presence.findOne({
        date: new Date(date),
        id_prof,
        creneau,
        groupe: parseInt(groupe)
      });
      
      console.log('Présence existante trouvée:', presence);
      
      let isUpdate = false;
      
      if (presence) {
        // Mettre à jour la présence existante
        presence.statut = statut;
        presence.heure_arrivee = heure_arrivee || (statut === 'présent' ? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null);
        presence.commentaire = commentaire || presence.commentaire;
        presence.updatedAt = Date.now();
        isUpdate = true;
        console.log('Mise à jour de la présence existante');
      } else {
        // Créer une nouvelle présence
        console.log('Création nouvelle présence');
        
        // Récupérer le nom du professeur
        const professeur = await Professeur.findById(id_prof);
        if (!professeur) {
          console.error('Professeur non trouvé:', id_prof);
          return res.status(404).json({ message: 'Professeur non trouvé' });
        }
        
        const nom_prof = `${professeur.prenom} ${professeur.nom}`;
        console.log('Professeur trouvé:', nom_prof);
        
        presence = new Presence({
          date: new Date(date),
          statut,
          id_prof,
          nom_prof,
          id_cours: id_cours || null,
          nom_matiere: nom_matiere || '',
          creneau,
          salle: salle || '',
          type_cours: type_cours || 'Cours',
          id_programme,
          nom_programme: nom_programme || '',
          groupe: parseInt(groupe),
          enregistre_par,
          commentaire: commentaire || '',
          heure_arrivee: heure_arrivee || (statut === 'présent' ? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null)
        });
      }
      
      console.log('Données présence avant sauvegarde:', presence.toObject());
      
      await presence.save();
      console.log('Présence sauvegardée avec ID:', presence.id_presence);
      
      // Retourner la présence avec les données populées
      const presencePopulee = await Presence.findById(presence._id)
        .populate('id_prof', 'nom prenom email')
        .populate('enregistre_par', 'nom prenom classe');
      
      console.log('Réponse finale:', presencePopulee);
      
      res.status(201).json({
        message: isUpdate ? 'Présence mise à jour avec succès' : 'Présence enregistrée avec succès',
        presence: presencePopulee
      });
    } catch (error) {
      console.error('=== ERREUR CRÉATION/MAJ PRÉSENCE ===');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      
      // Gérer les erreurs de validation MongoDB
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ 
          message: 'Erreur de validation',
          details: messages
        });
      }
      
      // Gérer les erreurs de duplication
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Cette présence existe déjà',
          details: 'Une présence est déjà enregistrée pour ce professeur à ce créneau'
        });
      }
      
      res.status(500).json({ 
        message: 'Erreur serveur lors de l\'enregistrement de la présence',
        error: error.message
      });
    }
  },

  // Récupérer les présences pour une date et un programme donné
  getPresencesByDateAndProgramme: async (req, res) => {
    try {
      const { date, programmeId } = req.params;
      const presences = await Presence.find({ 
        date: new Date(date),
        id_programme: programmeId
      })
        .populate('id_prof', 'nom prenom email')
        .populate('enregistre_par', 'nom prenom classe')
        .sort({ creneau: 1 });
      
      res.json(presences);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer l'emploi du temps et les présences pour une date donnée
  getEmploiEtPresences: async (req, res) => {
    try {
      const { date, programmeId, groupe } = req.params;
      
      console.log('=== RÉCUPÉRATION EMPLOI ET PRÉSENCES ===');
      console.log('Paramètres:', { date, programmeId, groupe });
      
      // Obtenir le jour de la semaine
      const dateObj = new Date(date);
      const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const jourSemaine = jours[dateObj.getDay()];
      
      console.log('Jour de la semaine:', jourSemaine);
      
      // Récupérer l'emploi du temps pour ce programme et groupe
      const emploiDuTemps = await EmploiDuTemps.findOne({
        programme: programmeId,
        groupe: parseInt(groupe),
        statut: 'actif'
      }).populate('seances.cours seances.professeur seances.salle');
      
      console.log('Emploi du temps trouvé:', emploiDuTemps ? 'Oui' : 'Non');
      
      if (!emploiDuTemps) {
        return res.json({ 
          seances: [],
          presences: [],
          message: 'Aucun emploi du temps actif trouvé pour ce programme' 
        });
      }
      
      // Filtrer les séances du jour
      const seancesDuJour = emploiDuTemps.seances.filter(s => s.jour === jourSemaine);
      console.log(`Séances du ${jourSemaine}:`, seancesDuJour.length);
      
      // Récupérer les présences existantes pour cette date
      const presences = await Presence.find({
        date: dateObj,
        id_programme: programmeId,
        groupe: parseInt(groupe)
      });
      
      console.log('Présences trouvées:', presences.length);
      
      // Formater la réponse
      const seancesAvecPresences = seancesDuJour.map(seance => {
        const presence = presences.find(p => 
          p.id_prof.toString() === seance.professeur._id.toString() && 
          p.creneau === seance.creneau
        );
        
        return {
          seance: {
            id: seance._id,
            jour: seance.jour,
            creneau: seance.creneau,
            cours: {
              id: seance.cours._id,
              nom: seance.cours.nom_matiere,
              type: seance.cours.type || 'Cours'
            },
            professeur: {
              id: seance.professeur._id,
              nom: `${seance.professeur.prenom} ${seance.professeur.nom}`
            },
            salle: {
              id: seance.salle._id,
              nom: seance.salle.nom
            }
          },
          presence: presence ? {
            id: presence._id,
            statut: presence.statut,
            heure_arrivee: presence.heure_arrivee,
            commentaire: presence.commentaire
          } : null
        };
      });
      
      console.log('Réponse finale:', { 
        date, 
        jour: jourSemaine, 
        seances: seancesAvecPresences.length 
      });
      
      res.json({
        date: date,
        jour: jourSemaine,
        seances: seancesAvecPresences
      });
      
    } catch (error) {
      console.error('Erreur récupération emploi et présences:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer toutes les présences
  getAllPresences: async (req, res) => {
    try {
      const presences = await Presence.find()
        .populate('id_prof', 'nom prenom')
        .populate('enregistre_par', 'nom prenom classe')
        .sort({ date: -1, creneau: 1 });
      
      res.json(presences);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer une présence par ID
  getPresenceById: async (req, res) => {
    try {
      const { id } = req.params;
      const presence = await Presence.findById(id)
        .populate('id_prof', 'nom prenom email')
        .populate('enregistre_par', 'nom prenom classe');
      
      if (!presence) {
        return res.status(404).json({ message: 'Présence non trouvée' });
      }
      
      res.json(presence);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les présences par date
  getPresencesByDate: async (req, res) => {
    try {
      const { date } = req.params;
      const presences = await Presence.find({ 
        date: new Date(date) 
      })
        .populate('id_prof', 'nom prenom')
        .populate('enregistre_par', 'nom prenom classe')
        .sort({ creneau: 1 });
      
      res.json(presences);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les présences par chef de classe
  getPresencesByChef: async (req, res) => {
    try {
      const { chefId } = req.params;
      const presences = await Presence.find({ enregistre_par: chefId })
        .populate('id_prof', 'nom prenom')
        .sort({ date: -1, creneau: 1 });
      
      res.json(presences);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Mettre à jour une présence
  updatePresence: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      updates.updatedAt = Date.now();
      
      const presence = await Presence.findByIdAndUpdate(id, updates, { new: true })
        .populate('id_prof', 'nom prenom')
        .populate('enregistre_par', 'nom prenom classe');
      
      if (!presence) {
        return res.status(404).json({ message: 'Présence non trouvée' });
      }
      
      res.json({
        message: 'Présence mise à jour avec succès',
        presence
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Supprimer une présence
  deletePresence: async (req, res) => {
    try {
      const { id } = req.params;
      const presence = await Presence.findByIdAndDelete(id);
      
      if (!presence) {
        return res.status(404).json({ message: 'Présence non trouvée' });
      }
      
      res.json({ message: 'Présence supprimée avec succès' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Statistiques de présence
  getStatistiques: async (req, res) => {
    try {
      const { chefId, dateDebut, dateFin, programmeId } = req.query;
      
      const filter = {};
      if (chefId) filter.enregistre_par = chefId;
      if (programmeId) filter.id_programme = programmeId;
      if (dateDebut && dateFin) {
        filter.date = { $gte: new Date(dateDebut), $lte: new Date(dateFin) };
      }
      
      const presences = await Presence.find(filter);
      const total = presences.length;
      const presents = presences.filter(p => p.statut === 'présent').length;
      const retards = presences.filter(p => p.statut === 'retard').length;
      const absents = presences.filter(p => p.statut === 'absent').length;
      const tauxPresence = total > 0 ? Math.round((presents / total) * 100) : 0;
      const tauxRetard = total > 0 ? Math.round((retards / total) * 100) : 0;
      const tauxAbsence = total > 0 ? Math.round((absents / total) * 100) : 0;
      
      // Statistiques par professeur
      const statsProfesseurs = {};
      presences.forEach(p => {
        const profId = p.id_prof.toString();
        if (!statsProfesseurs[profId]) {
          statsProfesseurs[profId] = {
            nom: p.nom_prof,
            total: 0,
            presents: 0,
            absents: 0,
            retards: 0
          };
        }
        statsProfesseurs[profId].total++;
        if (p.statut === 'présent') statsProfesseurs[profId].presents++;
        else if (p.statut === 'absent') statsProfesseurs[profId].absents++;
        else if (p.statut === 'retard') statsProfesseurs[profId].retards++;
      });
      
      res.json({
        total,
        presents,
        absents,
        retards,
        tauxPresence,
        tauxAbsence,
        tauxRetard,
        statsProfesseurs: Object.values(statsProfesseurs)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = presenceController;

