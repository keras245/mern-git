import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, GraduationCap, Save, Plus, BookOpen, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';

const ProgrammeModal = ({ isOpen, onClose, programme, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    licence: '',
    semestre: '',
    groupe: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showNotification } = useNotification();

  const programmesDisponibles = [
    'Génie Informatique et Télécommunications',
    'MIAGE',
    'Génie Logiciel',
    'Réseaux et Télécoms',
    'Génie Civil',
    'Génie Electronique'
  ];

  useEffect(() => {
    if (programme) {
      setFormData({
        nom: programme.nom || '',
        licence: programme.licence || '',
        semestre: programme.semestre || '',
        groupe: programme.groupe || '',
        description: programme.description || ''
      });
    } else {
      setFormData({
        nom: '',
        licence: '',
        semestre: '',
        groupe: '',
        description: ''
      });
    }
    setErrors({});
  }, [programme, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) newErrors.nom = 'Nom du programme requis';
    if (!formData.licence) newErrors.licence = 'Niveau de licence requis';
    if (!formData.semestre) newErrors.semestre = 'Semestre requis';
    if (!formData.groupe) newErrors.groupe = 'Groupe requis';
    if (!formData.description.trim()) newErrors.description = 'Description requise';

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
      const dataToSend = {
        ...formData,
        licence: parseInt(formData.licence),
        semestre: parseInt(formData.semestre),
        groupe: parseInt(formData.groupe)
      };

      if (programme) {
        await axios.put(
          `http://localhost:3832/api/programmes/${programme._id}`,
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Programme modifié avec succès', 'success');
      } else {
        await axios.post(
          'http://localhost:3832/api/programmes/creer',
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Programme créé avec succès', 'success');
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
      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-200 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white'
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {programme ? <GraduationCap className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {programme ? 'Modifier le programme' : 'Nouveau programme'}
                  </h2>
                  <p className="text-blue-100">
                    {programme ? 'Mettre à jour les informations du programme' : 'Créer un nouveau programme de formation'}
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
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informations du programme</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du programme *
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className={inputClasses('nom')}
                      >
                        <option value="">Sélectionner un programme</option>
                        {programmesDisponibles.map(prog => (
                          <option key={prog} value={prog}>{prog}</option>
                        ))}
                      </select>
                    </div>
                    {errors.nom && (
                      <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau de licence *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.licence}
                        onChange={(e) => setFormData({ ...formData, licence: e.target.value })}
                        className={inputClasses('licence')}
                      >
                        <option value="">Sélectionner le niveau</option>
                        <option value="1">Licence 1</option>
                        <option value="2">Licence 2</option>
                        <option value="3">Licence 3</option>
                        <option value="4">Licence 4</option>
                      </select>
                    </div>
                    {errors.licence && (
                      <p className="mt-1 text-sm text-red-600">{errors.licence}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semestre *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.semestre}
                        onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                        className={inputClasses('semestre')}
                      >
                        <option value="">Sélectionner le semestre</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                          <option key={sem} value={sem}>Semestre {sem}</option>
                        ))}
                      </select>
                    </div>
                    {errors.semestre && (
                      <p className="mt-1 text-sm text-red-600">{errors.semestre}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Groupe *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        value={formData.groupe}
                        onChange={(e) => setFormData({ ...formData, groupe: e.target.value })}
                        className={inputClasses('groupe')}
                        placeholder="Numéro du groupe"
                      />
                    </div>
                    {errors.groupe && (
                      <p className="mt-1 text-sm text-red-600">{errors.groupe}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 pl-12 border border-gray-200 bg-gray-50 rounded-xl focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none"
                        rows="4"
                        placeholder="Description détaillée du programme..."
                      />
                    </div>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Note informative */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <GraduationCap className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Information</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      L'ID du programme sera généré automatiquement selon le format : 
                      [NomCourt]-L[Niveau]-S[Semestre]-G[Groupe]
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Enregistrement...' : programme ? 'Modifier' : 'Créer'}</span>
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProgrammeModal; 