import { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';

const SalleModal = ({ isOpen, onClose, salle, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    capacite: '',
    type: ''
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    if (salle) {
      setFormData({
        nom: salle.nom,
        capacite: salle.capacite,
        type: salle.type
      });
    } else {
      setFormData({
        nom: '',
        capacite: '',
        type: ''
      });
    }
  }, [salle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.nom || !formData.capacite || !formData.type) {
        showNotification('Tous les champs sont requis', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      const data = {
        nom: formData.nom,
        capacite: parseInt(formData.capacite),
        type: formData.type
      };

      if (salle) {
        await axios.put(
          `http://localhost:3832/api/salles/${salle._id}`,
          data,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Salle mise à jour avec succès', 'success');
      } else {
        await axios.post(
          'http://localhost:3832/api/salles/creer',
          data,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Salle créée avec succès', 'success');
      }
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      showNotification(message, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {salle ? 'Modifier la salle' : 'Nouvelle salle'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la salle
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacité
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacite}
              onChange={(e) => setFormData({ ...formData, capacite: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de salle
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="Ordinaire">Ordinaire</option>
              <option value="Machine">Machine</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {salle ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalleModal; 