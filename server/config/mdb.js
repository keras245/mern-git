const mongoose = require('mongoose');
require('dotenv').config();

const connexionDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/git');
        console.log("MongoDB connectée :)");
    } catch (err) {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    }
}

module.exports = connexionDB;
