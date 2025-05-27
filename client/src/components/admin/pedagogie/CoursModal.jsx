import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, BookOpen, Save, Plus, User, GraduationCap, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';

const CoursModal = ({ isOpen, onClose, cours, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom_matiere: '',
    description: '',
    duree: '',
    id_prof: '',
    id_programme: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [professeurs, setProfesseurs] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loadingProfs, setLoadingProfs] = useState(true);
  const [loadingProgrammes, setLoadingProgrammes] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen) {
      fetchProfesseurs();
      fetchProgrammes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (cours) {
      setFormData({
        nom_matiere: cours.nom_matiere || '',
        description: cours.description || '',
        duree: cours.duree || '',
        id_prof: cours.id_prof && cours.id_prof.length > 0 ? cours.id_prof[0]._id || cours.id_prof[0] : '',
        id_programme: cours.id_programme?._id || cours.id_programme || ''
      });
    } else {
      setFormData({
        nom_matiere: '',
        description: '',
        duree: '',
        id_prof: '',
        id_programme: ''
      });
    }
    setErrors({});
  }, [cours, isOpen]);

  const fetchProfesseurs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/professeurs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfesseurs(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des professeurs:', error);
      showNotification('Erreur lors du chargement des professeurs', 'error');
    } finally {
      setLoadingProfs(false);
    }
  };

  const fetchProgrammes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/programmes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProgrammes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
      showNotification('Erreur lors du chargement des programmes', 'error');
    } finally {
      setLoadingProgrammes(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom_matiere.trim()) newErrors.nom_matiere = 'Nom du cours requis';
    if (!formData.duree) newErrors.duree = 'Durée requise';
    if (!formData.id_prof) newErrors.id_prof = 'Professeur requis';
    if (!formData.id_programme) newErrors.id_programme = 'Programme requis';

    // Validation durée
    if (formData.duree && (isNaN(formData.duree) || formData.duree <= 0)) {
      newErrors.duree = 'La durée doit être un nombre positif';
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
      // Préparer les données selon le format attendu par le backend
      const dataToSend = {
        nom_matiere: formData.nom_matiere.trim(),
        duree: parseInt(formData.duree),
        id_programme: formData.id_programme,
        id_prof: [formData.id_prof] // Convertir en tableau comme attendu par le backend
      };

      console.log('Données envoyées:', dataToSend);

      if (cours) {
        await axios.put(
          `http://localhost:3832/api/cours/${cours._id}`,
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Cours modifié avec succès', 'success');
      } else {
        await axios.post(
          'http://localhost:3832/api/cours/creer',
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Cours créé avec succès', 'success');
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      
      // Afficher le message d'erreur détaillé du serveur
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      const errorDetails = error.response?.data?.details;
      
      if (errorDetails) {
        if (Array.isArray(errorDetails)) {
          showNotification(`${errorMessage}: ${errorDetails.join(', ')}`, 'error');
        } else {
          showNotification(`${errorMessage}: ${errorDetails}`, 'error');
        }
      } else {
        showNotification(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (fieldName) => `
    w-full px-4 py-3 pl-12 border rounded-xl transition-all duration-200 
    ${errors[fieldName] 
      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-200 bg-gray-50 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
    }
  `;

  if (!isOpen) return null;

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
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {cours ? <BookOpen className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {cours ? 'Modifier le cours' : 'Nouveau cours'}
                  </h2>
                  <p className="text-emerald-100">
                    {cours ? 'Mettre à jour les informations du cours' : 'Créer un nouveau cours ou matière'}
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
              {/* Informations de base */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informations du cours</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du cours *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nom_matiere}
                        onChange={(e) => setFormData({ ...formData, nom_matiere: e.target.value })}
                        className={inputClasses('nom_matiere')}
                        placeholder="Nom de la matière"
                      />
                    </div>
                    {errors.nom_matiere && (
                      <p className="mt-1 text-sm text-red-600">{errors.nom_matiere}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée (heures) *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        value={formData.duree}
                        onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                        className={inputClasses('duree')}
                        placeholder="Nombre d'heures"
                      />
                    </div>
                    {errors.duree && (
                      <p className="mt-1 text-sm text-red-600">{errors.duree}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programme *
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.id_programme}
                        onChange={(e) => setFormData({ ...formData, id_programme: e.target.value })}
                        className={inputClasses('id_programme')}
                        disabled={loadingProgrammes}
                      >
                        <option value="">
                          {loadingProgrammes ? 'Chargement des programmes...' : 'Sélectionner un programme'}
                        </option>
                        {programmes.map(programme => (
                          <option key={programme._id} value={programme._id}>
                            {`${programme.nom} - L${programme.licence} S${programme.semestre} G${programme.groupe}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.id_programme && (
                      <p className="mt-1 text-sm text-red-600">{errors.id_programme}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professeur responsable *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.id_prof}
                        onChange={(e) => setFormData({ ...formData, id_prof: e.target.value })}
                        className={inputClasses('id_prof')}
                        disabled={loadingProfs}
                      >
                        <option value="">
                          {loadingProfs ? 'Chargement des professeurs...' : 'Sélectionner un professeur'}
                        </option>
                        {professeurs.map(prof => (
                          <option key={prof._id} value={prof._id}>
                            {`${prof.prenom} ${prof.nom} (${prof.id_prof})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.id_prof && (
                      <p className="mt-1 text-sm text-red-600">{errors.id_prof}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 pl-12 border border-gray-200 bg-gray-50 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200 resize-none"
                        rows="4"
                        placeholder="Description détaillée du cours, objectifs, prérequis..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Note informative */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-emerald-900">Information</h4>
                    <p className="text-sm text-emerald-700 mt-1">
                      Chaque cours doit être associé à un programme spécifique et à un professeur responsable.
                      La durée correspond au nombre d'heures total du cours dans le semestre.
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Enregistrement...' : cours ? 'Modifier' : 'Créer'}</span>
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CoursModal; 