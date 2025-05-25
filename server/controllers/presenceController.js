const Presence = require('../models/Presence');

exports.creerPresence = async (req, res) => {
    try {
        const presence = new Presence(req.body);
        await presence.save();
        res.status(201).json(presence);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.getAllPresences = async (req, res) => {
    try {
        const presence = await Presence.find();
        res.status(200).json(presence);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.getPresenceById = async (req, res) => {
    try {
        const presence = await Presence.findById(req.params.id);
        if(!presence) return res.status(404).json({ message : "Presence non trouvée "});
        res.status(200).json(presence);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.updatePresence = async (req, res) => {
    try {
        const presence = await Presence.findByIdAndUpdate(req.params.id, req.body, { new : true });
        if (!presence) return res.status(404).json({ message : "Presence non trouvée " });
        res.status(200).json(presence);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.deletePresence = async (req, res) => {
    try {
        const presence = await Presence.findByIdAndDelete(req.params.id);
        if (!presence) return res.status(404).json({ message : "Presence non trouvée "});
        res.status(200).json({ message : "Presence supprimée avec succès "});
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

