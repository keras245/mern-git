const Cours = require('../models/Cours');

exports.creerCours = async (req, res) => {
    try {
        const cour = new Cours(req.body);
        await cour.save();
        res.status(201).json(cour);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.getAllCours = async (req, res) => {
    try {
        const cours = await Cours.find();
        res.status(200).json(cours);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.getCourById = async (req, res) => {
    try {
        const cour = await Cours.findById(req.params.id);
        if (!cour) return res.status(404).json({ message : "Cour non trouvé" });
        res.status(200).json(cour);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.updateCour = async (req, res) => {
    try {
        const cour = await Cours.findByIdAndUpdate(req.params.id, req.body, { new : true });
        if (!cour) return res.status(404).json({ message : "Cour non trouvée" });
        res.status(200).json(cour);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.deleteCour = async (req, res) => {
    try {
        const cour = await Cours.findByIdAndDelete(req.params.id);
        if (!cour) return res.status(404).json({ message : "Cour non trouvé" });
        res.status(200).json({ message : "Cour supprimé aves succès" });
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
}
