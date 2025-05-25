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
    matiere: '',
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
        matiere: prof.matiere || '',
        disponibilite: prof.disponibilite || []
      });
    }
  }, [prof]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (prof) {
        await axios.put(
          `http://localhost:3832/api/professeurs/${prof._id}`,
          formData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        showNotification('Professeur modifié avec succès', 'success');
      } else {
        await axios.post(
          'http://localhost:3832/api/professeurs/creer',
          formData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {prof ? 'Modifier' : 'Ajouter'} un professeur
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Professeur</label>
            <input
              type="text"
              value={formData.id_prof}
              onChange={(e) => setFormData({ ...formData, id_prof: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prénom</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />  
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Matière</label>
            <input
              type="text"
              value={formData.matiere}
              onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />  
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">Disponibilité</label>
            <input
              type="text"
              value={formData.disponibilite}
              onChange={(e) => setFormData({ ...formData, disponibilite: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div> */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
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