const ChefDeClasse = require("../models/ChefDeClasse");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.creerChef = async (req, res) => {
    try {
        console.log('=== CRÉATION CHEF ===');
        console.log('Données reçues:', req.body);
        
        // NE PAS hasher ici car le modèle le fait automatiquement avec le hook pre('save')
        const chef = new ChefDeClasse(req.body);
        
        await chef.save();
        
        // Retourner sans le mot de passe
        const chefResponse = chef.toObject();
        delete chefResponse.mot_de_passe;
        
        console.log('Chef créé avec succès:', chefResponse);
        res.status(201).json(chefResponse);
    } catch (error) {
        console.error('Erreur création chef:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getAllChefs = async (req, res) => {
    try {
        const chefs = await ChefDeClasse.find().select('-mot_de_passe');
        res.status(200).json(chefs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getChefById = async (req, res) => {
    try {
        const chef = await ChefDeClasse.findById(req.params.id).select('-mot_de_passe');
        if (!chef) return res.status(404).json({ message: "Chef de classe non trouvé" });
        res.status(200).json(chef);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateChef = async (req, res) => {
    try {
        console.log('=== MODIFICATION CHEF ===');
        console.log('ID:', req.params.id);
        console.log('Données:', req.body);
        
        // Si le mot de passe est modifié, le modèle le hashera automatiquement
        const chef = await ChefDeClasse.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).select('-mot_de_passe');
        
        if (!chef) return res.status(404).json({ message: "Chef de classe non trouvé" });
        
        console.log('Chef modifié:', chef);
        res.status(200).json(chef);
    } catch (error) {
        console.error('Erreur modification chef:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.deleteChef = async (req, res) => {
    try {
        const chef = await ChefDeClasse.findByIdAndDelete(req.params.id);
        if (!chef) return res.status(404).json({ message: "Chef de classe non trouvé" });
        res.status(200).json({ message: "Chef de classe supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('=== TENTATIVE DE CONNEXION CHEF ===');
        console.log('Email:', req.body.email);
        console.log('Mot de passe reçu:', req.body.mot_de_passe ? 'Oui' : 'Non');
        
        const { email, mot_de_passe } = req.body;
        
        if (!email || !mot_de_passe) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }
        
        // Vérifier si le chef de classe existe
        const chef = await ChefDeClasse.findOne({ email });
        console.log('Chef trouvé:', chef ? 'Oui' : 'Non');
        
        if (!chef) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        console.log('Mot de passe hashé en DB:', chef.mot_de_passe);
        
        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(mot_de_passe, chef.mot_de_passe);
        console.log('Mot de passe correspond:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Générer le token
        const token = jwt.sign(
            { id: chef._id, role: 'chef' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Token généré:', token ? 'Oui' : 'Non');
        console.log('=== FIN CONNEXION CHEF ===');

        res.status(200).json({
            token,
            chef: {
                _id: chef._id,
                matricule: chef.matricule,
                nom: chef.nom,
                prenom: chef.prenom,
                adresse: chef.adresse,
                telephone: chef.telephone,
                email: chef.email,
                classe: chef.classe
            }
        });
    } catch (error) {
        console.error('Erreur login chef:', error);
        res.status(500).json({ message: error.message });
    }
};

