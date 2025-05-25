const EmploiDuTemps = require('../models/EmploiDuTemps');

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

exports.updateEmploi = async (req, res) => {
    try {
        const emploi = await EmploiDuTemps.findByIdAndUpdate(req.params.id, req.body, { new : true });
        if (!emploi) return res.status(404).json({ message : "Emploi du temps non trouvé" });
        res.status(200).json(emploi);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.deleteEmploi = async (req, res) => {
    try {
        const emploi = await EmploiDuTemps.findByIdAndDelete(req.params.id);
        if (!emploi) return res.status(404).json({ message : "Emploi du temps non trouvée" });
        res.status(200).json({ message : "Emploi du temps supprimé avec succès "});
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

