import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import CoursModal from './CoursModal';

const CoursManagement = () => {
  const [cours, setCours] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCours, setSelectedCours] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadCours();
  }, []);

  const loadCours = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/cours', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCours(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des cours', 'error');
    }
  };

  const handleEdit = (cours) => {
    setSelectedCours(cours);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3832/api/cours/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification('Cours supprimé avec succès', 'success');
      loadCours();
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Liste des Cours</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gérez les cours disponibles
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCours(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Cours
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cours.map((cours) => (
          <div
            key={cours._id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">{cours.nom_matiere}</h3>
            <p className="text-gray-600 mb-2">Durée: {cours.duree}h</p>
            <p className="text-gray-600 mb-2">
              Programme: {cours.programme?.nom || 'Non assigné'}
            </p>
            <p className="text-gray-600 mb-2">
              Professeurs: {cours.professeurs?.length || 0}
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(cours)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(cours._id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CoursModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cours={selectedCours}
        onSuccess={() => {
          loadCours();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default CoursManagement; 