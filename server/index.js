const express = require('express');
const cors = require('cors');
const connexionDB = require("./config/mdb");
require("dotenv").config();
const PORT = process.env.PORT || 3832;

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à la base de données
connexionDB();

// Routes
const adminRoutes = require('./routes/administrateurRoutes');
app.use('/api/administrateurs', adminRoutes);

const chefRoutes = require('./routes/chefDeClasseRoutes');
app.use('/api/chefdeclasses', chefRoutes);

const courRoutes = require('./routes/courRoutes');
app.use('/api/cours', courRoutes);

const emploiRoutes = require('./routes/emploiDuTempsRoutes');
app.use('/api/emplois', emploiRoutes);

const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/api/feedbacks', feedbackRoutes);

const presenceRoutes = require('./routes/presenceRoutes');
app.use('/api/presences', presenceRoutes);

const profRoutes = require('./routes/professeurRoutes');
app.use('/api/professeurs', profRoutes);

const salleRoutes = require('./routes/salleRoutes');
app.use('/api/salles', salleRoutes);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});


