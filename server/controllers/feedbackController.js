const Feedback = require('../models/Feedback');

exports.creerFeedback = async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.status(201).json(feedback);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message : "Feedback non trouvé"});
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.updateFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new : true });
        if (!feedback) return res.status(404).json({ message : "Feedback non trouvé" });
        res.status(200).json(feedback);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) return res.status(404).json({ message : "Feedback non trouvée" });
        res.status(200).json({ message : "Feedback supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};
