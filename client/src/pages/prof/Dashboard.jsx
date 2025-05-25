import { useState } from 'react';
import { motion } from 'framer-motion';

const ProfDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Professeur</h1>
        <p className="mt-2 text-gray-600">Bienvenue dans votre espace professeur</p>
      </motion.div>

      {/* Ajoutez ici le contenu du dashboard professeur */}
    </div>
  );
};

export default ProfDashboard; 