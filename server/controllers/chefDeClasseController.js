const ChefDeClasse = require("../models/ChefDeClasse");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.creerChef = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.mot_de_passe, salt);

        const chef = new ChefDeClasse({
            ...req.body,
            mot_de_passe: hashedPassword
        });
        
        await chef.save();
        res.status(201).json(chef);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.getAllChefs = async (req, res) => {
    try {
        const chefs = await ChefDeClasse.find();
        res.status(200).json(chefs);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.getChefById = async (req, res) => {
    try {
        const chef = await ChefDeClasse.findById(req.params.id);
        if (!chef) return res.status(404).json({ message : "Chef de classe non trouvé" });
        res.status(200).json(chef);
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
};

exports.updateChef = async (req, res) => {
    try {
        const chef = await ChefDeClasse.findByIdAndUpdate(req.params.id, req.body, { new : true});
        if (!chef) return res.status(404).json({ message : "Chef de classe non trouvé "});
        res.status(200).json(chef);
    } catch (error) {
        res.status(400).json({ message : error.message });
    }
};

exports.deleteChef = async (req, res) => {
    try {
        const chef = await ChefDeClasse.findByIdAndDelete(req.params.id);
        if (!chef) return res.status(404).json({ message : "Chef de classe non trouvé "});
        res.status(200).json({ message : "Chef de classe supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message : error.message });
    }
}


exports.login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;
        
        // Vérifier si le chef de classe existe
        const chef = await ChefDeClasse.findOne({ email });
        if (!chef) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(mot_de_passe, chef.mot_de_passe);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Générer le token
        const token = jwt.sign(
            { id: chef._id, role: 'chef' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: {
                matricule: chef.matricule,
                nom: chef.nom,
                prenom: chef.prenom,
                adresse: chef.adresse,
                telephone: chef.telephone,
                email: chef.email,
                classe: chef.classe,
                mot_de_passe: chef.mot_de_passe
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

