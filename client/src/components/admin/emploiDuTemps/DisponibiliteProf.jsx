import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const DisponibiliteProf = () => {
  const [professeurs, setProfesseurs] = useState([]);
  const [selectedProf, setSelectedProf] = useState('');
  const [disponibilites, setDisponibilites] = useState({});
  const [loading, setLoading] = useState(false);
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
    if (!selectedProf) return;

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
    } catch (error) {
      showNotification('Erreur lors de la mise à jour des disponibilités', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedProfesseur = professeurs.find(p => p._id === selectedProf);
  const totalCreneauxSelectionnes = Object.values(disponibilites).reduce((total, creneaux) => total + creneaux.length, 0);

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
              <p className="text-gray-600 mt-1">Gérez les créneaux de disponibilité de vos enseignants</p>
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
                    <div className="text-sm text-gray-500">Créneaux sélectionnés</div>
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
              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">💡</span>
                  <p className="text-amber-800 font-medium">
                    Cliquez sur les créneaux pour définir les disponibilités du professeur
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
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {disponibilites[jour]?.length || 0} créneaux
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {CRENEAUX.map((creneau, creneauIndex) => {
                          const isSelected = disponibilites[jour]?.includes(creneau);
                          return (
                            <motion.button
                              key={creneau}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleCreneau(jour, creneau)}
                              className={`p-4 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg'
                                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-lg">
                                  {isSelected ? '✅' : '⏰'}
                                </span>
                                <span>{creneau}</span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bouton de sauvegarde */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center pt-6"
              >
                <button
                  onClick={handleSubmit}
                  disabled={loading || totalCreneauxSelectionnes === 0}
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
              Choisissez un professeur dans la liste pour gérer ses disponibilités
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DisponibiliteProf; 