import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';

const ProfModal = ({ prof, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id_prof: '',
    nom: '',
    prenom: '',
    adresse: '',
    telephone: '',
    disponibilite: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (prof) {
      setFormData({
        id_prof: prof.id_prof || '',
        nom: prof.nom || '',
        prenom: prof.prenom || '',
        adresse: prof.adresse || '',
        telephone: prof.telephone || '',
        disponibilite: prof.disponibilite || []
      });
    }
  }, [prof]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const dataToSend = { ...formData };

      if (prof) {
        await axios.put(
          `http://localhost:3832/api/professeurs/${prof._id}`,
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Professeur modifié avec succès', 'success');
      } else {
        await axios.post(
          'http://localhost:3832/api/professeurs/creer',
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Professeur créé avec succès', 'success');
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {prof ? 'Modifier' : 'Ajouter'} un professeur
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">ID Professeur</label>
            <input
              type="text"
              value={formData.id_prof}
              onChange={(e) => setFormData({ ...formData, id_prof: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">Prénom</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-bold text-gray-800 mb-2 block">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {prof ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>

      </div>
    </motion.div>
  );
};

export default ProfModal; 