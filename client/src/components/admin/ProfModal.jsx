import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Mail, Phone, MapPin, Save, UserPlus, GraduationCap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';

const ProfModal = ({ prof, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id_prof: '',
    nom: '',
    prenom: '',
    adresse: '',
    telephone: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showNotification } = useNotification();

  useEffect(() => {
    if (prof) {
      setFormData({
        id_prof: prof.id_prof || '',
        nom: prof.nom || '',
        prenom: prof.prenom || '',
        adresse: prof.adresse || '',
        telephone: prof.telephone || '',
      });
    }
  }, [prof]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id_prof.trim()) newErrors.id_prof = 'ID Professeur requis';
    if (!formData.nom.trim()) newErrors.nom = 'Nom requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Prénom requis';
    if (!formData.telephone.trim()) newErrors.telephone = 'Téléphone requis';
    
    // Validation téléphone
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (formData.telephone && !phoneRegex.test(formData.telephone)) {
      newErrors.telephone = 'Format téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      if (prof) {
        await axios.put(
          `http://localhost:3832/api/professeurs/${prof._id}`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Professeur modifié avec succès', 'success');
      } else {
        await axios.post(
          'http://localhost:3832/api/professeurs/creer',
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Professeur créé avec succès', 'success');
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(error.response?.data?.message || 'Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (fieldName) => `
    w-full px-4 py-3 pl-12 border rounded-xl transition-all duration-200 
    ${errors[fieldName] 
      ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-purple-500 focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white'
    }
  `;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {prof ? <GraduationCap className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {prof ? 'Modifier le professeur' : 'Nouveau professeur'}
                  </h2>
                  <p className="text-purple-100">
                    {prof ? 'Mettre à jour les informations' : 'Ajouter un nouveau enseignant'}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informations personnelles</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID Professeur *
                    </label>
                    <div className="relative">
                      <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={formData.id_prof}
                        onChange={(e) => setFormData({ ...formData, id_prof: e.target.value })}
                        className={inputClasses('id_prof')}
                        placeholder="Ex: PROF001"
                      />
                    </div>
                    {errors.id_prof && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id_prof}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className={inputClasses('nom')}
                        placeholder="Nom de famille"
                      />
                    </div>
                    {errors.nom && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        className={inputClasses('prenom')}
                        placeholder="Prénom"
                      />
                    </div>
                    {errors.prenom && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prenom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="tel"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        className={inputClasses('telephone')}
                        placeholder="+224 xxx xxx xxx"
                      />
                    </div>
                    {errors.telephone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telephone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                        className={inputClasses('adresse')}
                        placeholder="Adresse complète"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {prof ? 'Modifier' : 'Créer'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfModal; 