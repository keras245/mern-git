import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Building2, Save, Plus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';

const SalleModal = ({ isOpen, onClose, salle, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    capacite: '',
    type: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showNotification } = useNotification();

  const typesSalle = ['Machine', 'Ordinaire'];

  useEffect(() => {
    if (salle) {
      setFormData({
        nom: salle.nom || '',
        capacite: salle.capacite || '',
        type: salle.type || ''
      });
    } else {
      setFormData({
        nom: '',
        capacite: '',
        type: ''
      });
    }
    setErrors({});
  }, [salle, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) newErrors.nom = 'Nom de la salle requis';
    if (!formData.capacite) newErrors.capacite = 'Capacité requise';
    if (!formData.type) newErrors.type = 'Type de salle requis';

    // Validation capacité
    if (formData.capacite && (isNaN(formData.capacite) || formData.capacite <= 0)) {
      newErrors.capacite = 'La capacité doit être un nombre positif';
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
      const dataToSend = {
        ...formData,
        capacite: parseInt(formData.capacite)
      };

      if (salle) {
        await axios.put(
          `http://localhost:3832/api/salles/${salle._id}`,
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Salle modifiée avec succès', 'success');
      } else {
        await axios.post(
          'http://localhost:3832/api/salles/creer',
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Salle créée avec succès', 'success');
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
      : 'border-gray-200 bg-gray-50 focus:ring-purple-500 focus:border-purple-500 focus:bg-white'
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
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {salle ? <Building2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {salle ? 'Modifier la salle' : 'Nouvelle salle'}
                  </h2>
                  <p className="text-purple-100">
                    {salle ? 'Mettre à jour les informations de la salle' : 'Créer un nouvel espace de cours'}
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
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Informations de la salle</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la salle *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className={inputClasses('nom')}
                        placeholder="Nom descriptif de la salle"
                      />
                    </div>
                    {errors.nom && (
                      <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacité *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        value={formData.capacite}
                        onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
                        className={inputClasses('capacite')}
                        placeholder="Nombre de places"
                      />
                    </div>
                    {errors.capacite && (
                      <p className="mt-1 text-sm text-red-600">{errors.capacite}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de salle *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className={inputClasses('type')}
                      >
                        <option value="">Sélectionner le type</option>
                        {typesSalle.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Note informative */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-900">Information</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      L'ID de la salle sera généré automatiquement. Les types disponibles sont :
                    </p>
                    <ul className="text-sm text-purple-700 mt-1 ml-4">
                      <li>• <strong>Machine</strong> : Salle équipée d'ordinateurs et matériel informatique</li>
                      <li>• <strong>Ordinaire</strong> : Salle de cours classique</li>
                    </ul>
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
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Enregistrement...' : salle ? 'Modifier' : 'Créer'}</span>
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SalleModal; 