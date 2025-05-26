import { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';

const CoursModal = ({ isOpen, onClose, cours, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom_matiere: '',
    duree: '',
    id_programme: '',
    id_prof: []
  });
  const [programmes, setProgrammes] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadProgrammes();
    loadProfesseurs();
  }, []);

  useEffect(() => {
    if (cours) {
      setFormData({
        nom_matiere: cours.nom_matiere,
        duree: cours.duree,
        id_programme: cours.id_programme?._id || '',
        id_prof: cours.id_prof?.map(p => p._id) || []
      });
    } else {
      setFormData({
        nom_matiere: '',
        duree: '',
        id_programme: '',
        id_prof: []
      });
    }
  }, [cours]);

  const loadProgrammes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/programmes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProgrammes(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des programmes', 'error');
    }
  };

  const loadProfesseurs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/professeurs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfesseurs(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des professeurs', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.nom_matiere || !formData.duree || !formData.id_programme) {
        showNotification('Tous les champs sont requis', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      const data = {
        nom_matiere: formData.nom_matiere,
        duree: parseInt(formData.duree),
        id_programme: formData.id_programme,
        id_prof: formData.id_prof
      };

      if (cours) {
        await axios.put(
          `http://localhost:3832/api/cours/${cours._id}`,
          data,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Cours mis à jour avec succès', 'success');
      } else {
        await axios.post(
          'http://localhost:3832/api/cours/creer',
          data,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Cours créé avec succès', 'success');
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
            {cours ? 'Modifier le cours' : 'Nouveau cours'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la matière
            </label>
            <input
              type="text"
              value={formData.nom_matiere}
              onChange={(e) => setFormData({ ...formData, nom_matiere: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durée (heures)
            </label>
            <input
              type="number"
              min="1"
              value={formData.duree}
              onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Programme
            </label>
            <select
              value={formData.id_programme}
              onChange={(e) => setFormData({ ...formData, id_programme: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner un programme</option>
              {programmes.map((prog) => (
                <option key={prog._id} value={prog._id}>
                  {prog.nom} - Licence {prog.licence} - Groupe {prog.groupe}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professeurs
            </label>
            <select
              multiple
              value={formData.id_prof}
              onChange={(e) => setFormData({
                ...formData,
                id_prof: Array.from(e.target.selectedOptions, option => option.value)
              })}
              className="w-full px-3 py-2 border rounded-lg"
              size="4"
            >
              {professeurs.map((prof) => (
                <option key={prof._id} value={prof._id}>
                  {prof.nom} {prof.prenom}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs professeurs
            </p>
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
              {cours ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoursModal; 