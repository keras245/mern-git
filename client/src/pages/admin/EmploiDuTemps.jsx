import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DisponibiliteProf from '../../components/admin/emploiDuTemps/DisponibiliteProf';
import ImportDonnees from '../../components/admin/emploiDuTemps/ImportDonnees';
import GenererEmploi from '../../components/admin/emploiDuTemps/GenererEmploi';
import ModificationEDT from '../../components/admin/emploiDuTemps/ModificationEDT';
import CreneauxLibres from '../../components/admin/emploiDuTemps/CreneauxLibres';
import { useNotification } from '../../context/NotificationContext';

const EmploiDuTemps = () => {
  const [activeSection, setActiveSection] = useState('disponibilite');
  const { showNotification } = useNotification();

  const sections = [
    {
      id: 'disponibilite',
      title: 'Disponibilité',
      icon: '⏰',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Gérez les créneaux de disponibilité des professeurs'
    },
    {
      id: 'import',
      title: 'Import des données',
      icon: '📊',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      description: 'Importez les données de la scolarité (salles, créneaux)'
    },
    {
      id: 'attribution',
      title: 'Générer l\'emploi',
      icon: '🎯',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      description: 'Génération automatique des emplois du temps'
    },
    {
      id: 'modification',
      title: 'Modification',
      icon: '✏️',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      description: 'Modifiez manuellement les emplois du temps'
    },
    {
      id: 'creneaux',
      title: 'Créneaux libres',
      icon: '📅',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-700',
      description: 'Visualisez et gérez les créneaux disponibles'
    }
  ];

  const activeTab = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header principal */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900">Emplois du Temps</h1>
              <p className="text-gray-600 text-lg">Gestion complète des plannings académiques</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation moderne en cartes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(section.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                  activeSection === section.id
                    ? `${section.bgColor} ${section.borderColor} shadow-lg`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                    activeSection === section.id 
                      ? `bg-gradient-to-r ${section.color}` 
                      : 'bg-gray-100'
                  }`}>
                    <span className="text-2xl">
                      {activeSection === section.id ? '✨' : section.icon}
                    </span>
                  </div>
                  <h3 className={`font-semibold text-sm mb-2 ${
                    activeSection === section.id ? section.textColor : 'text-gray-700'
                  }`}>
                    {section.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-tight">
                    {section.description}
                  </p>
                </div>
                
                {/* Indicateur actif */}
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r ${section.color} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Contenu de la section active */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Header de la section active */}
            <div className={`${activeTab.bgColor} rounded-2xl border-2 ${activeTab.borderColor} p-6 mb-6`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-r ${activeTab.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${activeTab.textColor}`}>
                    {activeTab.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {activeTab.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu spécifique à chaque section */}
            <div className="relative">
              {activeSection === 'disponibilite' && <DisponibiliteProf />}
              {activeSection === 'import' && <ImportDonnees />}
              {activeSection === 'attribution' && <GenererEmploi />}
              {activeSection === 'modification' && <ModificationEDT />}
              {activeSection === 'creneaux' && <CreneauxLibres />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmploiDuTemps; 