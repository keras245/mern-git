const EmploiDuTemps = require('../models/EmploiDuTemps');
const Cours = require('../models/Cours');
const Professeur = require('../models/Professeur');
const Salle = require('../models/Salle');
const Programme = require('../models/Programme');
const AttributionTemporaire = require('../models/AttributionTemporaire');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const path = require('path');

const emploiDuTempsController = {
  // Analyser les données avant génération
  analyserDonnees: async (req, res) => {
    try {
      const { programme, groupe } = req.body;

      // Récupérer les données
      const [cours, professeurs, salles, programmeInfo] = await Promise.all([
        Cours.find({ id_programme: programme }).populate('id_prof'),
        Professeur.find(),
        Salle.find(),
        Programme.findById(programme)
      ]);

      console.log(`Analyse pour programme ${programme}, groupe ${groupe}`);
      console.log(`Cours trouvés: ${cours.length}`);
      console.log(`Professeurs: ${professeurs.length}`);
      console.log(`Salles: ${salles.length}`);

      // Analyser les disponibilités
      const profsAvecDisponibilite = professeurs.filter(p => p.disponibilite && p.disponibilite.length > 0);
      const sallesAvecDisponibilite = salles.filter(s => s.disponibilite && s.disponibilite.length > 0);

      // Détecter les problèmes potentiels
      const problemes = [];
      
      if (cours.length === 0) {
        problemes.push("Aucun cours trouvé pour ce programme");
      }
      
      if (profsAvecDisponibilite.length === 0) {
        problemes.push("Aucun professeur n'a de disponibilités définies");
      }
      
      if (sallesAvecDisponibilite.length === 0) {
        problemes.push("Aucune salle n'a de disponibilités définies");
      }

      // Vérifier les cours sans professeurs
      const coursSansProfs = cours.filter(c => !c.id_prof || c.id_prof.length === 0);
      if (coursSansProfs.length > 0) {
        problemes.push(`${coursSansProfs.length} cours n'ont pas de professeurs assignés`);
      }

      // Calculer les statistiques
      const totalCreneaux = 6 * 3; // 6 jours * 3 créneaux
      const creneauxDisponibles = sallesAvecDisponibilite.reduce((total, salle) => {
        return total + salle.disponibilite.reduce((acc, jour) => acc + jour.creneaux.length, 0);
      }, 0);

      const analyse = {
        totalCours: cours.length,
        profsDisponibles: profsAvecDisponibilite.length,
        sallesDisponibles: sallesAvecDisponibilite.length,
        totalCreneaux,
        creneauxDisponibles,
        tauxDisponibilite: Math.round((creneauxDisponibles / (salles.length * totalCreneaux)) * 100),
        problemes,
        recommandations: []
      };

      // Générer des recommandations
      if (analyse.tauxDisponibilite < 50) {
        analyse.recommandations.push("Augmenter les disponibilités des salles pour améliorer la flexibilité");
      }
      
      if (profsAvecDisponibilite.length < cours.length) {
        analyse.recommandations.push("Définir les disponibilités pour plus de professeurs");
      }

      res.json(analyse);
    } catch (error) {
      console.error('Erreur analyse données:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer les groupes d'un programme
  getGroupesProgramme: async (req, res) => {
    try {
      const { programmeId } = req.params;
      console.log('Récupération groupes pour programme:', programmeId);
      
      // Vérifier si l'ID est valide
      if (!programmeId || !programmeId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "ID de programme invalide" });
      }
      
      const programme = await Programme.findById(programmeId);
      
      if (!programme) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }

      // Retourner le nombre de groupes disponibles
      const groupes = [];
      for (let i = 1; i <= programme.groupe; i++) {
        groupes.push(i);
      }

      console.log('Groupes trouvés:', groupes);
      res.json({ groupes, maxGroupes: programme.groupe });
    } catch (error) {
      console.error('Erreur récupération groupes:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // ALGORITHME AMÉLIORÉ avec 6 heures et noms des profs
  genererEmploiAutomatique: async (req, res) => {
    try {
      const { id_programme, groupe } = req.body;
      
      console.log('\n=== GÉNÉRATION AVEC 6 HEURES ===');
      console.log('Programme:', id_programme, 'Groupe:', groupe);

      if (!id_programme) {
        return res.status(400).json({ message: "Programme est requis" });
      }

      // 1. Récupérer les cours avec LEUR professeur assigné
      const cours = await Cours.find({ id_programme: id_programme })
        .populate({
          path: 'id_prof',
          select: 'nom prenom disponibilite'
        });
      
      console.log(`📚 Cours trouvés: ${cours.length}`);
      
      if (cours.length === 0) {
        return res.status(400).json({
          message: "Aucun cours trouvé pour ce programme"
        });
      }

      // 2. Récupérer toutes les salles
      const salles = await Salle.find({ 
        disponibilite: { $exists: true, $ne: [] } 
      });
      
      console.log(`🏢 Salles disponibles: ${salles.length}`);

      // 3. Récupérer les créneaux déjà occupés
      const emploisExistants = await EmploiDuTemps.find({});
      const creneauxOccupes = new Set();
      
      emploisExistants.forEach(emploi => {
        emploi.seances.forEach(seance => {
          creneauxOccupes.add(`prof-${seance.professeur}-${seance.jour}-${seance.creneau}`);
          creneauxOccupes.add(`salle-${seance.salle}-${seance.jour}-${seance.creneau}`);
          creneauxOccupes.add(`groupe-${emploi.programme}-${emploi.groupe}-${seance.jour}-${seance.creneau}`);
        });
      });

      const conflitsDetailles = [];
      const seances = [];

      // 4. LOGIQUE AMÉLIORÉE pour chaque cours
      for (const coursItem of cours) {
        console.log(`\n📖 Cours: ${coursItem.nom_matiere}`);
        
        // Récupérer LE professeur du cours
        if (!coursItem.id_prof || coursItem.id_prof.length === 0) {
          conflitsDetailles.push({
            cours: coursItem.nom_matiere,
            type: 'Aucun professeur assigné',
            details: `Le cours "${coursItem.nom_matiere}" n'a pas de professeur assigné`,
            suggestions: ['Assigner un professeur au cours']
          });
          continue;
        }

        const professeur = coursItem.id_prof[0];
        console.log(`👨‍🏫 Professeur: ${professeur.nom} ${professeur.prenom}`);

        // Vérifier que le prof a des disponibilités
        if (!professeur.disponibilite || professeur.disponibilite.length === 0) {
          conflitsDetailles.push({
            cours: coursItem.nom_matiere,
            type: 'Professeur sans disponibilités',
            details: `${professeur.nom} ${professeur.prenom} n'a pas de disponibilités définies`,
            suggestions: ['Définir les disponibilités du professeur']
          });
          continue;
        }

        // ✅ NOUVEAU: Calculer le nombre total de créneaux disponibles du prof
        const totalCreneauxProf = professeur.disponibilite.reduce((total, dispo) => {
          return total + dispo.creneaux.length;
        }, 0);

        console.log(`📅 Total créneaux disponibles du prof: ${totalCreneauxProf}`);

        // ✅ LOGIQUE 6 HEURES: Si le prof a 2+ créneaux, essayer d'attribuer 2 créneaux
        const creneauxAAttribuer = totalCreneauxProf >= 2 ? 2 : 1;
        console.log(`🎯 Créneaux à attribuer pour ce cours: ${creneauxAAttribuer} (${creneauxAAttribuer * 3}h)`);

        let creneauxTrouves = [];
        let detailsRecherche = [];

        // Créer une liste de tous les créneaux disponibles du prof
        const creneauxProfDisponibles = [];
        professeur.disponibilite.forEach(dispo => {
          dispo.creneaux.forEach(creneau => {
            creneauxProfDisponibles.push({
              jour: dispo.jour,
              creneau: creneau
            });
          });
        });

        console.log(`📋 Créneaux prof disponibles:`, creneauxProfDisponibles);

        // Chercher les créneaux nécessaires
        for (const creneauProf of creneauxProfDisponibles) {
          if (creneauxTrouves.length >= creneauxAAttribuer) break;

          const { jour, creneau } = creneauProf;
          console.log(`\n⏰ Test: ${jour} ${creneau}`);

          // Vérifier si le professeur n'est pas déjà occupé
          const keyProf = `prof-${professeur._id}-${jour}-${creneau}`;
          if (creneauxOccupes.has(keyProf)) {
            console.log(`   ❌ Prof ${professeur.nom} ${professeur.prenom} déjà occupé ce créneau`);
            detailsRecherche.push(`${jour} ${creneau}: Prof occupé (${professeur.nom} ${professeur.prenom})`);
            continue;
          }

          // Vérifier si le groupe n'est pas déjà occupé
          const keyGroupe = `groupe-${id_programme}-${groupe}-${jour}-${creneau}`;
          const groupeOccupe = creneauxOccupes.has(keyGroupe) || 
              seances.some(s => s.jour === jour && s.creneau === creneau) ||
              creneauxTrouves.some(c => c.jour === jour && c.creneau === creneau);
          
          if (groupeOccupe) {
            console.log(`   ❌ Groupe déjà occupé ce créneau`);
            detailsRecherche.push(`${jour} ${creneau}: Groupe occupé`);
            continue;
          }

          // CHERCHER UNE SALLE LIBRE
          let salleLibre = null;
          for (const salle of salles) {
            // Vérifier que la salle est disponible ce jour/créneau
            const salleDisponible = salle.disponibilite.some(d => 
              d.jour === jour && d.creneaux.includes(creneau)
            );
            
            if (!salleDisponible) continue;

            // Vérifier que la salle n'est pas occupée
            const keySalle = `salle-${salle._id}-${jour}-${creneau}`;
            const salleOccupee = creneauxOccupes.has(keySalle) || 
                seances.some(s => s.salle.toString() === salle._id.toString() && s.jour === jour && s.creneau === creneau) ||
                creneauxTrouves.some(c => c.salle && c.salle._id.toString() === salle._id.toString() && c.jour === jour && c.creneau === creneau);

            if (!salleOccupee) {
              salleLibre = salle;
              break;
            }
          }

          if (salleLibre) {
            // ✅ CRÉNEAU TROUVÉ !
            creneauxTrouves.push({
              jour,
              creneau,
              professeur: professeur,
              salle: salleLibre
            });

            console.log(`   ✅ Créneau ${creneauxTrouves.length}/${creneauxAAttribuer} trouvé: ${jour} ${creneau} - Salle ${salleLibre.nom}`);
          } else {
            console.log(`   ❌ Aucune salle libre`);
            detailsRecherche.push(`${jour} ${creneau}: Aucune salle libre`);
          }
        }

        // Vérifier si on a trouvé assez de créneaux
        if (creneauxTrouves.length > 0) {
          // 🎉 ATTRIBUTION RÉUSSIE (même si pas l'idéal)
          creneauxTrouves.forEach(creneauInfo => {
            const nouvelleSeance = {
              cours: coursItem._id,
              professeur: creneauInfo.professeur._id,
              salle: creneauInfo.salle._id,
              jour: creneauInfo.jour,
              creneau: creneauInfo.creneau
            };

            seances.push(nouvelleSeance);

            // Marquer comme occupé
            creneauxOccupes.add(`prof-${creneauInfo.professeur._id}-${creneauInfo.jour}-${creneauInfo.creneau}`);
            creneauxOccupes.add(`salle-${creneauInfo.salle._id}-${creneauInfo.jour}-${creneauInfo.creneau}`);
            creneauxOccupes.add(`groupe-${id_programme}-${groupe}-${creneauInfo.jour}-${creneauInfo.creneau}`);

            console.log(`✅ Séance créée: ${creneauInfo.jour} ${creneauInfo.creneau} - Prof ${creneauInfo.professeur.nom} - Salle ${creneauInfo.salle.nom}`);
          });

          const heuresAttribuees = creneauxTrouves.length * 3;
          const heuresIdeales = creneauxAAttribuer * 3;
          
          if (creneauxTrouves.length < creneauxAAttribuer) {
            console.log(`⚠️ COURS PARTIELLEMENT ATTRIBUÉ: ${creneauxTrouves.length}/${creneauxAAttribuer} créneaux (${heuresAttribuees}h/${heuresIdeales}h)`);
            
            // Ajouter un avertissement mais pas un conflit bloquant
            conflitsDetailles.push({
              cours: coursItem.nom_matiere,
              type: 'Attribution partielle',
              details: `Cours attribué avec seulement ${heuresAttribuees}h au lieu de ${heuresIdeales}h idéales pour ${professeur.nom} ${professeur.prenom}`,
              suggestions: ['Ajouter plus de créneaux disponibles pour compléter les heures']
            });
          } else {
            console.log(`🎉 COURS COMPLÈTEMENT ATTRIBUÉ: ${creneauxTrouves.length} créneaux (${heuresAttribuees}h)`);
          }
        } else {
          console.log(`❌ CONFLIT TOTAL: Aucun créneau trouvé`);
          
          conflitsDetailles.push({
            cours: coursItem.nom_matiere,
            type: 'Aucun créneau disponible',
            details: `Aucun créneau libre trouvé pour ${professeur.nom} ${professeur.prenom}. Problèmes: ${detailsRecherche.slice(-3).join('; ')}`,
            suggestions: ['Ajouter plus de salles disponibles', 'Augmenter les disponibilités des professeurs']
          });
        }
      }

      // 5. Créer l'emploi du temps
      let emploiDuTemps = null;
      if (seances.length > 0) {
        emploiDuTemps = new EmploiDuTemps({
          programme: id_programme,
          groupe: groupe || 1,
          seances: seances,
          statut: conflitsDetailles.length > 0 ? 'brouillon' : 'actif',
          dateCreation: new Date()
        });

        await emploiDuTemps.save();
        
        // Peupler les données
        emploiDuTemps = await EmploiDuTemps.findById(emploiDuTemps._id)
          .populate('seances.cours', 'nom_matiere duree')
          .populate('seances.professeur', 'nom prenom')
          .populate('seances.salle', 'nom type');
      }

      const totalHeures = seances.length * 3;
      console.log(`\n🏁 RÉSULTAT: ${seances.length} créneaux (${totalHeures}h) planifiés, ${conflitsDetailles.length} conflits`);

      res.json({
        message: `Génération terminée. ${seances.length} créneaux (${totalHeures}h) planifiés, ${conflitsDetailles.length} conflits détectés.`,
        emploiDuTemps: emploiDuTemps,
        seances: seances.length,
        conflits: conflitsDetailles,
        statut: conflitsDetailles.length > 0 ? 'brouillon' : 'actif'
      });

    } catch (error) {
      console.error('Erreur génération automatique:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Ajouter une séance manuellement
  ajouterSeance: async (req, res) => {
    try {
      const { emploiDuTempsId, seance } = req.body;

      const emploiDuTemps = await EmploiDuTemps.findById(emploiDuTempsId);
      if (!emploiDuTemps) {
        return res.status(404).json({ message: "Emploi du temps non trouvé" });
      }

      // Vérifier les conflits
      const conflitGroupe = emploiDuTemps.seances.some(s => 
        s.jour === seance.jour && s.creneau === seance.creneau
      );

      if (conflitGroupe) {
        return res.status(400).json({ message: "Ce créneau est déjà occupé pour ce groupe" });
      }

      // Ajouter la séance
      emploiDuTemps.seances.push(seance);
      await emploiDuTemps.save();

      // Retourner l'emploi du temps mis à jour
      const emploiMisAJour = await EmploiDuTemps.findById(emploiDuTempsId)
        .populate('seances.cours', 'nom_matiere duree')
        .populate('seances.professeur', 'nom prenom')
        .populate('seances.salle', 'nom type');

      res.json(emploiMisAJour);
    } catch (error) {
      console.error('Erreur ajout séance:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Modifier une séance
  modifierSeance: async (req, res) => {
    try {
      const { emploiDuTempsId, ancienneSeance, nouvelleSeance } = req.body;

      const emploiDuTemps = await EmploiDuTemps.findById(emploiDuTempsId);
      if (!emploiDuTemps) {
        return res.status(404).json({ message: "Emploi du temps non trouvé" });
      }

      // Trouver et supprimer l'ancienne séance
      const index = emploiDuTemps.seances.findIndex(s => 
        s.jour === ancienneSeance.jour && s.creneau === ancienneSeance.creneau
      );

      if (index === -1) {
        return res.status(404).json({ message: "Séance non trouvée" });
      }

      // Remplacer la séance
      emploiDuTemps.seances[index] = nouvelleSeance;
      await emploiDuTemps.save();

      // Retourner l'emploi du temps mis à jour
      const emploiMisAJour = await EmploiDuTemps.findById(emploiDuTempsId)
        .populate('seances.cours', 'nom_matiere duree')
        .populate('seances.professeur', 'nom prenom')
        .populate('seances.salle', 'nom type');

      res.json(emploiMisAJour);
    } catch (error) {
      console.error('Erreur modification séance:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Supprimer une séance
  supprimerSeance: async (req, res) => {
    try {
      const { emploiDuTempsId, jour, creneau } = req.body;

      const emploiDuTemps = await EmploiDuTemps.findById(emploiDuTempsId);
      if (!emploiDuTemps) {
        return res.status(404).json({ message: "Emploi du temps non trouvé" });
      }

      // Supprimer la séance
      emploiDuTemps.seances = emploiDuTemps.seances.filter(s => 
        !(s.jour === jour && s.creneau === creneau)
      );

      await emploiDuTemps.save();

      // Retourner l'emploi du temps mis à jour
      const emploiMisAJour = await EmploiDuTemps.findById(emploiDuTempsId)
        .populate('seances.cours', 'nom_matiere duree')
        .populate('seances.professeur', 'nom prenom')
        .populate('seances.salle', 'nom type');

      res.json(emploiMisAJour);
    } catch (error) {
      console.error('Erreur suppression séance:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Exporter l'emploi du temps
  exporterEmploi: async (req, res) => {
    try {
      const { format } = req.params;
      const { emploiDuTempsId } = req.body;

      const emploiDuTemps = await EmploiDuTemps.findById(emploiDuTempsId)
        .populate('programme', 'nom licence semestre')
        .populate('seances.cours', 'nom_matiere')
        .populate('seances.professeur', 'nom prenom')
        .populate('seances.salle', 'nom type');

      if (!emploiDuTemps) {
        return res.status(404).json({ message: "Emploi du temps non trouvé" });
      }

      if (format === 'pdf') {
        await exporterPDF(emploiDuTemps, res);
      } else if (format === 'excel') {
        await exporterExcel(emploiDuTemps, res);
      } else {
        res.status(400).json({ message: "Format non supporté" });
      }
    } catch (error) {
      console.error('Erreur export:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Attribution manuelle d'un cours (méthode existante)
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

  // Méthode existante
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
    },

  // Analyser les créneaux libres
  analyserCreneauxLibres: async (req, res) => {
    try {
      const { filtres } = req.body;

      // Récupérer tous les professeurs et salles avec leurs disponibilités
      const [professeurs, salles, emploisDuTemps] = await Promise.all([
        Professeur.find(),
        Salle.find(),
        EmploiDuTemps.find().populate('seances.professeur seances.salle')
      ]);

      // Créer une map des créneaux occupés
      const creneauxOccupes = new Map();
      emploisDuTemps.forEach(emploi => {
        emploi.seances.forEach(seance => {
          const key = `${seance.professeur._id}-${seance.jour}-${seance.creneau}`;
          creneauxOccupes.set(key, true);
          
          const salleKey = `${seance.salle._id}-${seance.jour}-${seance.creneau}`;
          creneauxOccupes.set(salleKey, true);
        });
      });

      // Filtrer les professeurs libres
      const professeursLibres = professeurs.filter(prof => {
        if (!prof.disponibilite || prof.disponibilite.length === 0) return false;
        
        // Vérifier s'il a au moins un créneau libre
        return prof.disponibilite.some(dispo => 
          dispo.creneaux.some(creneau => {
            const key = `${prof._id}-${dispo.jour}-${creneau}`;
            return !creneauxOccupes.has(key);
          })
        );
      }).map(prof => ({
        ...prof.toObject(),
        disponibilite: prof.disponibilite.map(dispo => ({
          jour: dispo.jour,
          creneaux: dispo.creneaux.filter(creneau => {
            const key = `${prof._id}-${dispo.jour}-${creneau}`;
            return !creneauxOccupes.has(key);
          })
        })).filter(dispo => dispo.creneaux.length > 0)
      }));

      // Filtrer les salles libres
      const sallesLibres = salles.filter(salle => {
        if (!salle.disponibilite || salle.disponibilite.length === 0) return false;
        
        return salle.disponibilite.some(dispo => 
          dispo.creneaux.some(creneau => {
            const key = `${salle._id}-${dispo.jour}-${creneau}`;
            return !creneauxOccupes.has(key);
          })
        );
      }).map(salle => ({
        ...salle.toObject(),
        disponibilite: salle.disponibilite.map(dispo => ({
          jour: dispo.jour,
          creneaux: dispo.creneaux.filter(creneau => {
            const key = `${salle._id}-${dispo.jour}-${creneau}`;
            return !creneauxOccupes.has(key);
          })
        })).filter(dispo => dispo.creneaux.length > 0)
      }));

      // Calculer les statistiques
      const totalCreneauxLibres = professeursLibres.reduce((acc, prof) => 
        acc + prof.disponibilite.reduce((acc2, dispo) => acc2 + dispo.creneaux.length, 0), 0
      ) + sallesLibres.reduce((acc, salle) => 
        acc + salle.disponibilite.reduce((acc2, dispo) => acc2 + dispo.creneaux.length, 0), 0
      );

      const totalCreneauxPossibles = (professeurs.length + salles.length) * 6 * 3; // 6 jours * 3 créneaux
      const tauxUtilisation = Math.round(((totalCreneauxPossibles - totalCreneauxLibres) / totalCreneauxPossibles) * 100);

      // Générer des suggestions
      const suggestions = [];
      if (tauxUtilisation < 50) {
        suggestions.push({
          titre: "Faible utilisation des ressources",
          description: "Vous pourriez programmer plus de cours ou optimiser les horaires.",
          action: "Voir les créneaux disponibles"
        });
      }
      if (professeursLibres.length > sallesLibres.length * 2) {
        suggestions.push({
          titre: "Manque de salles",
          description: "Vous avez plus de professeurs disponibles que de salles.",
          action: "Configurer plus de salles"
        });
      }

      const statistiques = {
        totalProfsLibres: professeursLibres.length,
        totalSallesLibres: sallesLibres.length,
        totalCreneauxLibres,
        tauxUtilisation,
        suggestions
      };

      res.json({
        professeurs: professeursLibres,
        salles: sallesLibres,
        statistiques
      });

    } catch (error) {
      console.error('Erreur analyse créneaux libres:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Proposer des créneaux pour un cours
  proposerCreneau: async (req, res) => {
    try {
      const { coursId } = req.body;

      const cours = await Cours.findById(coursId).populate('id_prof');
      if (!cours) {
        return res.status(404).json({ message: "Cours non trouvé" });
      }

      // Logique pour proposer les meilleurs créneaux
      // (basée sur les disponibilités des professeurs et salles)
      
      res.json({ message: "Créneaux proposés", cours });
    } catch (error) {
      console.error('Erreur proposition créneaux:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Réserver un créneau
  reserverCreneau: async (req, res) => {
    try {
      const { professeurId, salleId, jour, creneau } = req.body;

      // Logique pour réserver un créneau spécifique
      // (marquer comme occupé temporairement)
      
      res.json({ message: "Créneau réservé avec succès" });
    } catch (error) {
      console.error('Erreur réservation créneau:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Nettoyer automatiquement les attributions expirées
  nettoyerAttributionsExpirees: async () => {
    try {
      const result = await AttributionTemporaire.updateMany(
        { 
          dateExpiration: { $lt: new Date() },
          statut: 'active'
        },
        { statut: 'expiree' }
      );
      
      console.log(`${result.modifiedCount} attributions temporaires marquées comme expirées`);
    } catch (error) {
      console.error('Erreur nettoyage attributions expirées:', error);
    }
  },

  // Récupérer toutes les attributions temporaires actives
  getAttributionsTemporaires: async (req, res) => {
    try {
      console.log('Récupération des attributions temporaires...');
      
      const attributions = await AttributionTemporaire.find({ 
        statut: 'active',
        dateExpiration: { $gte: new Date() }
      })
      .populate('professeur', 'nom prenom')
      .populate('salle', 'nom type')
      .populate('cours', 'nom_matiere')
      .populate('programme', 'nom')
      .sort({ dateCreation: -1 });

      console.log(`${attributions.length} attributions temporaires trouvées`);
      res.json(attributions);
    } catch (error) {
      console.error('Erreur récupération attributions temporaires:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Attribuer temporairement un créneau
  attribuerTemporaire: async (req, res) => {
    try {
      console.log('=== DÉBUT ATTRIBUTION TEMPORAIRE ===');
      console.log('Body reçu:', req.body);
      console.log('User:', req.user);

      const { 
        professeur, 
        salle, 
        cours, 
        programme, 
        groupe, 
        jour, 
        creneau, 
        dateExpiration 
      } = req.body;

      // Validation des données requises
      if (!professeur || !salle || !cours || !programme || !groupe || !jour || !creneau) {
        console.log('Validation échouée - champs manquants');
        return res.status(400).json({ 
          message: 'Tous les champs sont requis pour l\'attribution temporaire',
          received: { professeur, salle, cours, programme, groupe, jour, creneau }
        });
      }

      console.log('Validation OK, vérification des conflits...');

      // Vérifier que le créneau n'est pas déjà occupé dans l'emploi du temps principal
      const conflitEmploi = await EmploiDuTemps.findOne({
        programme,
        groupe: parseInt(groupe),
        'seances': {
          $elemMatch: {
            jour,
            creneau,
            $or: [
              { 'professeur': professeur },
              { 'salle': salle }
            ]
          }
        }
      });

      if (conflitEmploi) {
        console.log('Conflit avec emploi du temps principal détecté');
        return res.status(400).json({ 
          message: 'Ce créneau est déjà occupé dans l\'emploi du temps principal' 
        });
      }

      // Vérifier les conflits avec d'autres attributions temporaires
      const conflitTemporaire = await AttributionTemporaire.findOne({
        jour,
        creneau,
        statut: 'active',
        dateExpiration: { $gte: new Date() },
        $or: [
          { professeur },
          { salle }
        ]
      });

      if (conflitTemporaire) {
        console.log('Conflit avec attribution temporaire détecté');
        return res.status(400).json({ 
          message: 'Ce créneau est déjà attribué temporairement' 
        });
      }

      console.log('Aucun conflit détecté, création de l\'attribution...');

      // Créer l'attribution temporaire
      const attribution = new AttributionTemporaire({
        professeur,
        salle,
        cours,
        programme,
        groupe: parseInt(groupe),
        jour,
        creneau,
        dateExpiration: new Date(dateExpiration),
        creePar: req.user.id
      });

      console.log('Attribution à sauvegarder:', attribution);

      await attribution.save();
      console.log('Attribution sauvegardée avec succès');

      // Populer les données pour la réponse
      await attribution.populate([
        { path: 'professeur', select: 'nom prenom' },
        { path: 'salle', select: 'nom type' },
        { path: 'cours', select: 'nom_matiere' },
        { path: 'programme', select: 'nom' }
      ]);

      console.log('Attribution populée:', attribution);
      console.log('=== FIN ATTRIBUTION TEMPORAIRE ===');

      res.status(201).json({
        message: 'Créneau attribué temporairement avec succès',
        attribution
      });
    } catch (error) {
      console.error('=== ERREUR ATTRIBUTION TEMPORAIRE ===');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('=== FIN ERREUR ===');
      
      res.status(500).json({ 
        message: 'Erreur lors de l\'attribution temporaire',
        error: error.message 
      });
    }
  },

  // Supprimer une attribution temporaire
  supprimerAttributionTemporaire: async (req, res) => {
    try {
      const { id } = req.params;
      console.log('Suppression attribution temporaire:', id);

      const attribution = await AttributionTemporaire.findByIdAndDelete(id);

      if (!attribution) {
        return res.status(404).json({ message: 'Attribution temporaire non trouvée' });
      }

      console.log('Attribution temporaire supprimée avec succès');
      res.json({ message: 'Attribution temporaire supprimée avec succès' });
    } catch (error) {
      console.error('Erreur suppression attribution temporaire:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Nouvelle méthode pour récupérer tous les emplois du temps sauvegardés
  getAllEmplois: async (req, res) => {
    try {
      const emplois = await EmploiDuTemps.find()
        .populate('programme', 'nom licence semestre')
        .populate('seances.cours', 'nom_matiere')
        .populate('seances.professeur', 'nom prenom')
        .populate('seances.salle', 'nom type')
        .sort({ createdAt: -1 });

      res.json(emplois);
    } catch (error) {
      console.error('Erreur récupération emplois:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer un emploi du temps par ID
  getEmploiById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const emploiDuTemps = await EmploiDuTemps.findById(id)
        .populate('seances.cours', 'nom_matiere duree')
        .populate('seances.professeur', 'nom prenom')
        .populate('seances.salle', 'nom type')
        .populate('programme', 'nom licence semestre');

      if (!emploiDuTemps) {
        return res.status(404).json({ message: "Emploi du temps non trouvé" });
      }

      res.json(emploiDuTemps);
    } catch (error) {
      console.error('Erreur récupération emploi:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Nouvelle méthode pour sauvegarder un emploi du temps
  sauvegarderEmploi: async (req, res) => {
    try {
      const { nom, description, programme, groupe, seances, statut } = req.body;

      // Validation des données
      if (!nom || !programme || !groupe) {
        return res.status(400).json({ 
          message: 'Le nom, le programme et le groupe sont requis' 
        });
      }

      // MODIFICATION : Supprimer l'ancien emploi du temps s'il existe pour ce programme/groupe
      await EmploiDuTemps.deleteMany({ programme, groupe });

      // Créer le nouvel emploi du temps
      const nouvelEmploi = new EmploiDuTemps({
        nom: nom.trim(),
        description: description?.trim() || '',
        programme,
        groupe,
        seances: seances || [],
        statut: statut || 'actif',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const emploiSauvegarde = await nouvelEmploi.save();

      // Populer les données pour la réponse
      const emploiComplet = await EmploiDuTemps.findById(emploiSauvegarde._id)
        .populate('programme', 'nom licence semestre')
        .populate('seances.cours', 'nom_matiere')
        .populate('seances.professeur', 'nom prenom')
        .populate('seances.salle', 'nom type');

      res.status(201).json({
        message: 'Emploi du temps sauvegardé avec succès',
        emploi: emploiComplet
      });
    } catch (error) {
      console.error('Erreur sauvegarde emploi:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // NOUVEAU: Créer un emploi du temps vide
  creerEmploiVide: async (req, res) => {
    try {
      const { programme, groupe } = req.body;
      
      console.log('Création emploi vide:', { programme, groupe });

      if (!programme) {
        return res.status(400).json({ message: "Programme est requis" });
      }

      const emploiDuTemps = new EmploiDuTemps({
        programme: programme,
        groupe: groupe || 1,
        seances: [], // Emploi vide
        statut: 'brouillon',
        dateCreation: new Date()
      });

      await emploiDuTemps.save();
      
      // Retourner avec populate pour l'affichage
      const emploiComplet = await EmploiDuTemps.findById(emploiDuTemps._id)
        .populate('programme', 'nom licence semestre');

      res.json(emploiComplet);
    } catch (error) {
      console.error('Erreur création emploi vide:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

// Exécuter le nettoyage toutes les heures (APRÈS l'export)
setInterval(() => {
  if (emploiDuTempsController.nettoyerAttributionsExpirees) {
    emploiDuTempsController.nettoyerAttributionsExpirees();
  }
}, 60 * 60 * 1000);

// Fonction pour exporter en PDF avec design optimisé pour une page
const exporterPDF = async (emploiDuTemps, res) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Organiser les séances par jour et créneau
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const creneaux = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];
    
    const grille = {};
    jours.forEach(jour => {
      grille[jour] = {};
      creneaux.forEach(creneau => {
        grille[jour][creneau] = null;
      });
    });
    
    // Remplir la grille avec les séances
    emploiDuTemps.seances.forEach(seance => {
      if (grille[seance.jour] && grille[seance.jour][seance.creneau] !== undefined) {
        grille[seance.jour][seance.creneau] = seance;
      }
    });

    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Emploi du Temps</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 10px;
            }
            
            .container {
                max-width: 100%;
                margin: 0 auto;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                color: white;
                padding: 15px 20px;
                text-align: center;
                position: relative;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                opacity: 0.3;
            }
            
            .header-content {
                position: relative;
                z-index: 1;
            }
            
            .university-logo {
                width: 50px;
                height: 50px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                margin: 0 auto 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
            }
            
            .title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 5px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .subtitle {
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 10px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                margin-top: 10px;
            }
            
            .info-card {
                background: rgba(255,255,255,0.1);
                padding: 8px;
                border-radius: 8px;
                text-align: center;
                backdrop-filter: blur(10px);
            }
            
            .info-label {
                font-size: 10px;
                opacity: 0.8;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 3px;
            }
            
            .info-value {
                font-size: 12px;
                font-weight: 600;
            }
            
            .schedule-container {
                padding: 15px;
            }
            
            .schedule-table {
                width: 100%;
                border-collapse: collapse;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .schedule-table th {
                background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
                color: white;
                padding: 12px 8px;
                text-align: center;
                font-weight: 600;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .schedule-table th:first-child {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                width: 120px;
            }
            
            .schedule-table td {
                padding: 0;
                border: 1px solid #ecf0f1;
                height: 80px;
                vertical-align: top;
                position: relative;
            }
            
            .time-cell {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                font-weight: 600;
                color: #2c3e50;
                text-align: center;
                vertical-align: middle;
                font-size: 11px;
                border-right: 3px solid #3498db;
                padding: 5px;
            }
            
            .course-cell {
                background: #ffffff;
                transition: all 0.3s ease;
            }
            
            .course-card {
                height: 100%;
                padding: 8px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                color: white;
                border-radius: 6px;
                margin: 2px;
                box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .course-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #f39c12, #e67e22, #e74c3c);
            }
            
            .course-name {
                font-weight: 700;
                font-size: 11px;
                margin-bottom: 4px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            
            .course-details {
                font-size: 9px;
                opacity: 0.9;
                line-height: 1.2;
            }
            
            .course-prof {
                font-weight: 600;
                margin-bottom: 1px;
            }
            
            .course-room {
                background: rgba(255,255,255,0.2);
                padding: 1px 4px;
                border-radius: 3px;
                display: inline-block;
                margin-top: 2px;
            }
            
            .empty-cell {
                background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%);
                opacity: 0.3;
            }
            
            .footer {
                background: #2c3e50;
                color: white;
                padding: 10px 15px;
                text-align: center;
                font-size: 10px;
            }
            
            .footer-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 8px;
            }
            
            .footer-item {
                text-align: center;
            }
            
            .footer-label {
                opacity: 0.7;
                margin-bottom: 3px;
            }
            
            .footer-value {
                font-weight: 600;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .container {
                    box-shadow: none;
                    border-radius: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="header-content">
                    <div class="university-logo">UNC</div>
                    <h1 class="title">EMPLOI DU TEMPS</h1>
                    <p class="subtitle">Université Nongo Conakry - Département de Génie Informatique</p>
                    
                    <div class="info-grid">
                        <div class="info-card">
                            <div class="info-label">Programme</div>
                            <div class="info-value">${emploiDuTemps.programme.nom}</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">Niveau</div>
                            <div class="info-value">Licence ${emploiDuTemps.programme.licence}</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">Semestre</div>
                            <div class="info-value">Semestre ${emploiDuTemps.programme.semestre}</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">Groupe</div>
                            <div class="info-value">Groupe ${emploiDuTemps.groupe}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="schedule-container">
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th>Horaires</th>
                            ${jours.map(jour => `<th>${jour}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${creneaux.map(creneau => `
                            <tr>
                                <td class="time-cell">
                                    ${creneau}
                                </td>
                                ${jours.map(jour => {
                                    const seance = grille[jour][creneau];
                                    if (seance) {
                                        return `
                                            <td class="course-cell">
                                                <div class="course-card">
                                                    <div class="course-name">${seance.cours.nom_matiere}</div>
                                                    <div class="course-details">
                                                        <div class="course-prof">👨‍🏫 ${seance.professeur.prenom} ${seance.professeur.nom}</div>
                                                        <div class="course-room">📍 ${seance.salle.nom}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        `;
                                    } else {
                                        return `<td class="course-cell empty-cell"></td>`;
                                    }
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="footer">
                <div class="footer-grid">
                    <div class="footer-item">
                        <div class="footer-label">Date de génération</div>
                        <div class="footer-value">${new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div class="footer-item">
                        <div class="footer-label">Nombre de cours</div>
                        <div class="footer-value">${emploiDuTemps.seances.length} séances</div>
                    </div>
                    <div class="footer-item">
                        <div class="footer-label">Système</div>
                        <div class="footer-value">EduTime Manager</div>
                    </div>
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); opacity: 0.7;">
                    © ${new Date().getFullYear()} Université Nongo Conakry
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '5mm',
        left: '5mm'
      },
      printBackground: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=emploi-du-temps-${emploiDuTemps.programme.nom.replace(/\s+/g, '-')}-Groupe${emploiDuTemps.groupe}.pdf`);
    res.send(pdf);

  } finally {
    await browser.close();
  }
};

// Fonction pour exporter en Excel avec design simple
const exporterExcel = async (emploiDuTemps, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Emploi du Temps');

    // Configuration de la page
    worksheet.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5
      }
    };

    // Titre principal
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'EMPLOI DU TEMPS - UNIVERSITÉ NONGO CONAKRY';
    titleCell.font = { size: 14, bold: true };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D5DBDB' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 25;

    // Informations du programme
    worksheet.mergeCells('A2:H2');
    const infoCell = worksheet.getCell('A2');
    infoCell.value = `${emploiDuTemps.programme.nom} - Licence ${emploiDuTemps.programme.licence} - Semestre ${emploiDuTemps.programme.semestre} - Groupe ${emploiDuTemps.groupe}`;
    infoCell.font = { size: 11, bold: true };
    infoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    // Ligne vide
    worksheet.getRow(3).height = 10;

    // En-têtes
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const creneaux = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

    // Ligne d'en-tête
    worksheet.getCell('A4').value = 'Horaires';
    jours.forEach((jour, index) => {
      worksheet.getCell(4, index + 2).value = jour;
    });

    // Style des en-têtes
    const headerRow = worksheet.getRow(4);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'AED6F1' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 20;

    // Organiser les séances
    const grille = {};
    jours.forEach(jour => {
      grille[jour] = {};
      creneaux.forEach(creneau => {
        grille[jour][creneau] = null;
      });
    });

    emploiDuTemps.seances.forEach(seance => {
      if (grille[seance.jour] && grille[seance.jour][seance.creneau] !== undefined) {
        grille[seance.jour][seance.creneau] = seance;
      }
    });

    // Remplir les données
    creneaux.forEach((creneau, creneauIndex) => {
      const rowIndex = creneauIndex + 5;
      
      // Colonne horaire
      const timeCell = worksheet.getCell(rowIndex, 1);
      timeCell.value = creneau;
      timeCell.font = { bold: true };
      timeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8F9FA' } };
      timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Colonnes des jours
      jours.forEach((jour, jourIndex) => {
        const cell = worksheet.getCell(rowIndex, jourIndex + 2);
        const seance = grille[jour][creneau];
        
        if (seance) {
          cell.value = `${seance.cours.nom_matiere}\n${seance.professeur.prenom} ${seance.professeur.nom}\n${seance.salle.nom}`;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F6F3' } };
          cell.font = { bold: true };
        } else {
          cell.value = '';
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FDFEFE' } };
        }
        
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      worksheet.getRow(rowIndex).height = 50;
    });

    // Ajuster les largeurs des colonnes
    worksheet.getColumn(1).width = 18;
    jours.forEach((_, index) => {
      worksheet.getColumn(index + 2).width = 20;
    });

    // Pied de page
    const footerRow = creneaux.length + 6;
    worksheet.mergeCells(`A${footerRow}:H${footerRow}`);
    const footerCell = worksheet.getCell(`A${footerRow}`);
    footerCell.value = `Généré le ${new Date().toLocaleDateString('fr-FR')} - ${emploiDuTemps.seances.length} séances programmées`;
    footerCell.font = { italic: true, size: 10 };
    footerCell.alignment = { horizontal: 'center' };

    // Générer le buffer Excel
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=emploi-du-temps-${emploiDuTemps.programme.nom.replace(/\s+/g, '-')}-Groupe${emploiDuTemps.groupe}.xlsx`);
    res.send(buffer);

    } catch (error) {
    console.error('Erreur export Excel:', error);
    throw error;
    }
};

module.exports = emploiDuTempsController;

