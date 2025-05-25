const Salle = require('../models/Salle');

exports.creerSalle = async (req, res) => {
    try {
        const salle = new Salle(req.body);
        await salle.save();
        res.status(201).json(salle);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.getAllSalles = async (req, res) => {
    try {
        const salles = await Salle.find();
        res.status(200).json(salles);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.getSalleById = async (req, res) => {
    try {
        const salle = await Salle.findById(req.params.id);
        if(!salle) return res.status(404).json({ message : "Aucune salle trouvée "});
        res.status(200).json(salle);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.updateSalle = async (req, res) => {
    try {
        const salle = await Salle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!salle) return res.status(404).json({ message : "Aucune salle trouvée" });
        res.status(200).json(salle);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.deleteSalle = async (req, res) => {
    try {
        const salle = await Salle.findByIdAndDelete(req.params.id);
        if(!salle) return res.status(404).json({ message : "Aucune salle trouvée" });
        res.status(200).json({ message : "Salle supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

