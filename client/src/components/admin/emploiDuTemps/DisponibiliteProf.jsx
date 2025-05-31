import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const DisponibiliteProf = () => {
  const [professeurs, setProfesseurs] = useState([]);
  const [selectedProf, setSelectedProf] = useState('');
  const [disponibilites, setDisponibilites] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('visualiser'); // 'visualiser' ou 'definir'
  const { showNotification } = useNotification();

  const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const CRENEAUX = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

  const JOURS_ICONS = {
    'Lundi': '📅',
    'Mardi': '📅', 
    'Mercredi': '📅',
    'Jeudi': '📅',
    'Vendredi': '📅',
    'Samedi': '📅'
  };

  const tabs = [
    {
      id: 'visualiser',
      title: 'Visualiser',
      icon: '👁️',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Consulter les disponibilités existantes'
    },
    {
      id: 'definir',
      title: 'Définir',
      icon: '✏️',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      description: 'Modifier les créneaux de disponibilité'
    }
  ];

  useEffect(() => {
    loadProfesseurs();
  }, []);

  const loadProfesseurs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/professeurs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfesseurs(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des professeurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfesseurChange = (profId) => {
    setSelectedProf(profId);
    const prof = professeurs.find(p => p._id === profId);
    if (prof) {
      const dispos = {};
      JOURS.forEach(jour => {
        dispos[jour] = prof.disponibilite?.find(d => d.jour === jour)?.creneaux || [];
      });
      setDisponibilites(dispos);
    } else {
      setDisponibilites({});
    }
  };

  const toggleCreneau = (jour, creneau) => {
    if (activeTab !== 'definir') return; // Empêcher la modification en mode visualisation
    
    setDisponibilites(prev => {
      const newDispos = { ...prev };
      if (!newDispos[jour]) newDispos[jour] = [];
      
      if (newDispos[jour].includes(creneau)) {
        newDispos[jour] = newDispos[jour].filter(c => c !== creneau);
      } else {
        newDispos[jour] = [...newDispos[jour], creneau];
      }
      
      return newDispos;
    });
  };

  const handleSubmit = async () => {
    if (!selectedProf || activeTab !== 'definir') return;

    const disponibilitesArray = Object.entries(disponibilites)
      .filter(([_, creneaux]) => creneaux.length > 0)
      .map(([jour, creneaux]) => ({
        jour,
        creneaux
      }));

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3832/api/professeurs/${selectedProf}/disponibilite`,
        { disponibilite: disponibilitesArray },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      showNotification('Disponibilités mises à jour avec succès', 'success');
      // Recharger les données pour mettre à jour l'affichage
      await loadProfesseurs();
      handleProfesseurChange(selectedProf);
    } catch (error) {
      showNotification('Erreur lors de la mise à jour des disponibilités', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedProfesseur = professeurs.find(p => p._id === selectedProf);
  const totalCreneauxSelectionnes = Object.values(disponibilites).reduce((total, creneaux) => total + creneaux.length, 0);
  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Disponibilité des Professeurs</h1>
              <p className="text-gray-600 mt-1">Visualisez et gérez les créneaux de disponibilité de vos enseignants</p>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex gap-4 mb-6">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${tab.bgColor} ${tab.borderColor} ${tab.textColor} border-2 shadow-md`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.title}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className={`w-2 h-2 bg-gradient-to-r ${tab.color} rounded-full`}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Description de l'onglet actif */}
          <div className={`${activeTabConfig.bgColor} rounded-xl border ${activeTabConfig.borderColor} p-4 mb-6`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeTabConfig.icon}</span>
              <div>
                <h3 className={`font-semibold ${activeTabConfig.textColor}`}>
                  Mode {activeTabConfig.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {activeTabConfig.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sélection du professeur */}
          <div className="max-w-md">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              👨‍🏫 Sélectionner un professeur
            </label>
            <div className="relative">
              <select
                value={selectedProf}
                onChange={(e) => handleProfesseurChange(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Choisir un professeur...</option>
                {professeurs.map((prof) => (
                  <option key={prof._id} value={prof._id}>
                    {prof.nom} {prof.prenom}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Informations du professeur sélectionné */}
          <AnimatePresence>
            {selectedProfesseur && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedProfesseur.nom.charAt(0)}{selectedProfesseur.prenom.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedProfesseur.nom} {selectedProfesseur.prenom}
                    </h3>
                    <p className="text-sm text-gray-600">
                      📧 {selectedProfesseur.email} • 📞 {selectedProfesseur.telephone}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm text-gray-500">Créneaux disponibles</div>
                    <div className="text-2xl font-bold text-blue-600">{totalCreneauxSelectionnes}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Grille des disponibilités */}
        <AnimatePresence>
          {selectedProf && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Instructions selon le mode */}
              <div className={`${activeTabConfig.bgColor} border ${activeTabConfig.borderColor} rounded-xl p-4`}>
                <div className="flex items-center gap-2">
                  <span className={activeTabConfig.textColor}>
                    {activeTab === 'visualiser' ? '👁️' : '💡'}
                  </span>
                  <p className={`${activeTabConfig.textColor} font-medium`}>
                    {activeTab === 'visualiser' 
                      ? 'Consultez les créneaux de disponibilité actuels du professeur'
                      : 'Cliquez sur les créneaux pour définir les disponibilités du professeur'
                    }
                  </p>
                </div>
              </div>

              {/* Grille des jours */}
              <div className="grid gap-6">
                {JOURS.map((jour, index) => (
                  <motion.div
                    key={jour}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{JOURS_ICONS[jour]}</span>
                        <h3 className="text-xl font-bold text-gray-900">{jour}</h3>
                        <div className="ml-auto">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            activeTab === 'visualiser' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {disponibilites[jour]?.length || 0} créneaux
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {CRENEAUX.map((creneau, creneauIndex) => {
                          const isSelected = disponibilites[jour]?.includes(creneau);
                          const isClickable = activeTab === 'definir';
                          
                          return (
                            <motion.div
                              key={creneau}
                              whileHover={isClickable ? { scale: 1.02 } : {}}
                              whileTap={isClickable ? { scale: 0.98 } : {}}
                              onClick={() => isClickable && toggleCreneau(jour, creneau)}
                              className={`p-4 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                                isSelected
                                  ? activeTab === 'visualiser'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500 shadow-lg'
                                  : activeTab === 'visualiser'
                                    ? 'bg-gray-100 text-gray-500 border-gray-200'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                              } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-lg">
                                  {isSelected 
                                    ? (activeTab === 'visualiser' ? '✅' : '✅')
                                    : (activeTab === 'visualiser' ? '❌' : '⏰')
                                  }
                                </span>
                                <span>{creneau}</span>
                              </div>
                              {activeTab === 'visualiser' && (
                                <div className="text-xs mt-1 opacity-75">
                                  {isSelected ? 'Disponible' : 'Non disponible'}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bouton de sauvegarde - uniquement en mode définir */}
              {activeTab === 'definir' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center pt-6"
                >
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="flex items-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">💾</span>
                          <span>Enregistrer les disponibilités</span>
                        </>
                      )}
                    </div>
                  </button>
                </motion.div>
              )}

              {/* Résumé en mode visualisation */}
              {activeTab === 'visualiser' && totalCreneauxSelectionnes > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">📊</span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">
                      Résumé des disponibilités
                    </h3>
                    <p className="text-blue-700">
                      Ce professeur est disponible sur <strong>{totalCreneauxSelectionnes} créneaux</strong> dans la semaine
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* État vide */}
        {!selectedProf && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">👨‍🏫</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sélectionnez un professeur
            </h3>
            <p className="text-gray-600">
              Choisissez un professeur dans la liste pour {activeTab === 'visualiser' ? 'consulter' : 'gérer'} ses disponibilités
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DisponibiliteProf; 