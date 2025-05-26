import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import ProfModal from './ProfModal';

const ProfsManagement = () => {
  const [profs, setProfs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const { showNotification } = useNotification();

  const fetchProfs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/professeurs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Réponse API profs:', response.data);
      const profsData = response.data.data || response.data;
      setProfs(Array.isArray(profsData) ? profsData : []);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors du chargement des professeurs', 'error');
      setProfs([]);
    }
  };

  useEffect(() => {
    fetchProfs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3832/api/professeurs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        showNotification('Professeur supprimé avec succès', 'success');
        fetchProfs();
      } catch (error) {
        console.error('Erreur de suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Liste des professeurs</h2>
        <button
          onClick={() => {
            setSelectedProf(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un professeur
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Prof</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profs.map((prof) => (
              <tr key={prof._id}>
                <td className="px-6 py-4 whitespace-nowrap">{prof.id_prof}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prof.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prof.prenom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prof.adresse}</td>
                <td className="px-6 py-4 whitespace-nowrap">{prof.telephone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => {
                      setSelectedProf(prof);
                      setIsModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(prof._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProfModal
          prof={selectedProf}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchProfs();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ProfsManagement; 