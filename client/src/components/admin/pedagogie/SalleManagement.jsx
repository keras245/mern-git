import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import SalleModal from './SalleModal';

const SalleManagement = () => {
  const [salles, setSalles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalle, setSelectedSalle] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadSalles();
  }, []);

  const loadSalles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/salles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSalles(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des salles', 'error');
    }
  };

  const handleEdit = (salle) => {
    setSelectedSalle(salle);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3832/api/salles/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification('Salle supprimée avec succès', 'success');
      loadSalles();
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Liste des Salles</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gérez les salles disponibles
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedSalle(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle Salle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salles.map((salle) => (
          <div
            key={salle._id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">{salle.nom}</h3>
            <p className="text-gray-600 mb-2">Capacité: {salle.capacite} places</p>
            <p className="text-gray-600 mb-2">Type: {salle.type}</p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(salle)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(salle._id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <SalleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        salle={selectedSalle}
        onSuccess={() => {
          loadSalles();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default SalleManagement; 