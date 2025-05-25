import { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';

const ProgrammeModal = ({ isOpen, onClose, programme, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    niveau: '',
    semestre: '',
    groupe: '',
    description: ''
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    if (programme) {
      setFormData({
        nom: programme.nom,
        niveau: programme.niveau,
        semestre: programme.semestre,
        groupe: programme.groupe,
        description: programme.description
      });
    } else {
      setFormData({
        nom: '',
        niveau: '',
        semestre: '',
        groupe: '',
        description: ''
      });
    }
  }, [programme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.nom || !formData.niveau || !formData.semestre || !formData.groupe || !formData.description) {
        showNotification('Tous les champs sont requis', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      const data = {
        nom: formData.nom,
        niveau: parseInt(formData.niveau),
        semestre: parseInt(formData.semestre),
        groupe: formData.groupe,
        description: formData.description
      };

      if (programme) {
        await axios.put(
          `http://localhost:3832/api/programmes/${programme._id}`,
          data,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Programme mis à jour avec succès', 'success');
      } else {
        const response = await axios.post(
          'http://localhost:3832/api/programmes/creer',
          data,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Programme créé avec succès', 'success');
      }
      onSuccess();
    } catch (error) {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      showNotification(message, 'error');
      console.error('Erreur détaillée:', error.response?.data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {programme ? 'Modifier le programme' : 'Nouveau programme'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du programme
            </label>
            <select
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner un programme</option>
              <option value="Génie Informatique et Télécommunications">
                Génie Informatique et Télécommunications
              </option>
              <option value="MIAGE">MIAGE</option>
              <option value="Génie Logiciel">Génie Logiciel</option>
              <option value="Réseaux et Télécoms">Réseaux et Télécoms</option>
              <option value="Génie Civil">Génie Civil</option>
              <option value="Génie Electronique">Génie Electronique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau
            </label>
            <select
              value={formData.niveau}
              onChange={(e) => setFormData({ ...formData, niveau: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner un niveau</option>
              <option value="1">Licence 1</option>
              <option value="2">Licence 2</option>
              <option value="3">Licence 3</option>
              <option value="4">Master 1</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semestre
            </label>
            <select
              value={formData.semestre}
              onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner un semestre</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>Semestre {num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Groupe
            </label>
            <input
              type="number"
              min="1"
              value={formData.groupe}
              onChange={(e) => setFormData({ ...formData, groupe: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows="4"
              required
            />
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
              {programme ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgrammeModal; 