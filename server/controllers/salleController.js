const Salle = require('../models/Salle');
const csv = require('csv-parse');
const xlsx = require('xlsx');
const fs = require('fs');

const salleController = {
  creerSalle: async (req, res) => {
    try {
      const { nom, capacite, type } = req.body;

      const salle = new Salle({
        nom,
        capacite: parseInt(capacite),
        type
      });

      await salle.save();
      res.status(201).json(salle);
    } catch (error) {
      console.error('Erreur création salle:', error);
      res.status(400).json({ message: error.message });
    }
  },

  getAllSalles: async (req, res) => {
    try {
      const salles = await Salle.find();
      res.status(200).json(salles);
    } catch (error) {
      console.error('Erreur récupération salles:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getSalleById: async (req, res) => {
    try {
      const salle = await Salle.findById(req.params.id);
      if (!salle) {
        return res.status(404).json({ message: "Salle non trouvée" });
      }
      res.status(200).json(salle);
    } catch (error) {
      console.error('Erreur récupération salle:', error);
      res.status(500).json({ message: error.message });
    }
  },

  updateSalle: async (req, res) => {
    try {
      const { nom, capacite, type } = req.body;
      const updateData = {};

      // Ne mettre à jour que les champs fournis
      if (nom !== undefined) updateData.nom = nom;
      if (capacite !== undefined) updateData.capacite = parseInt(capacite);
      if (type !== undefined) updateData.type = type;

      const salle = await Salle.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!salle) {
        return res.status(404).json({ message: "Salle non trouvée" });
      }

      res.status(200).json(salle);
    } catch (error) {
      console.error('Erreur mise à jour salle:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: "Données invalides", details: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  },

  deleteSalle: async (req, res) => {
    try {
      const salle = await Salle.findByIdAndDelete(req.params.id);
      if (!salle) {
        return res.status(404).json({ message: "Salle non trouvée" });
      }
      res.status(200).json({ message: "Salle supprimée avec succès" });
    } catch (error) {
      console.error('Erreur suppression salle:', error);
      res.status(500).json({ message: error.message });
    }
  },

  importManual: async (req, res) => {
    try {
      const { salles } = req.body;
      
      // Transformation des données
      const sallesFormatted = salles.map(salle => {
        const disponibilite = [];
        const creneauxParJour = {};
        
        // Grouper les créneaux par jour
        salle.creneaux.forEach(creneau => {
          const [jour, horaire] = creneau.split(' ');
          if (!creneauxParJour[jour]) {
            creneauxParJour[jour] = [];
          }
          creneauxParJour[jour].push(horaire);
        });
        
        // Formater pour le modèle
        Object.entries(creneauxParJour).forEach(([jour, creneaux]) => {
          disponibilite.push({ jour, creneaux });
        });

        return {
          id_salle: `S${Math.random().toString(36).substr(2, 6)}`,
          nom: salle.nom,
          type_salle: salle.nom.toLowerCase().includes('machine') ? 'Machine' : 'Ordinaire',
          capacite: 30,
          disponibilite
        };
      });

      await Salle.insertMany(sallesFormatted);
      res.status(201).json({ message: 'Salles importées avec succès' });
    } catch (error) {
      console.error('Erreur import manuel:', error);
      res.status(500).json({ message: error.message });
    }
  },

  importFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier fourni' });
      }

      let salles = [];
      
      if (req.file.mimetype === 'text/csv') {
        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const records = await new Promise((resolve, reject) => {
          csv.parse(fileContent, {
            columns: true,
            skip_empty_lines: true
          }, (err, records) => {
            if (err) reject(err);
            else resolve(records);
          });
        });
        
        salles = records.map(record => ({
          id_salle: record.id_salle || `S${Math.random().toString(36).substr(2, 6)}`,
          nom: record.nom,
          type_salle: record.type_salle || 'Ordinaire',
          capacite: parseInt(record.capacite) || 30,
          disponibilite: JSON.parse(record.disponibilite || '[]')
        }));
      } else {
        const workbook = xlsx.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        salles = data.map(row => ({
          id_salle: row.id_salle || `S${Math.random().toString(36).substr(2, 6)}`,
          nom: row.nom,
          type_salle: row.type_salle || 'Ordinaire',
          capacite: parseInt(row.capacite) || 30,
          disponibilite: JSON.parse(row.disponibilite || '[]')
        }));
      }

      fs.unlinkSync(req.file.path);
      await Salle.insertMany(salles);
      res.status(201).json({ message: 'Fichier importé avec succès' });
    } catch (error) {
      console.error('Erreur import fichier:', error);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = salleController;

