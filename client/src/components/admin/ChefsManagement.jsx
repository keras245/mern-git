import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import ChefModal from './ChefModal';

const ChefsManagement = () => {
  const [chefs, setChefs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChef, setSelectedChef] = useState(null);
  const { showNotification } = useNotification();

  const fetchChefs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/chefdeclasses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Réponse API chefs:', response.data);
      const chefsData = response.data.data || response.data;
      setChefs(Array.isArray(chefsData) ? chefsData : []);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors du chargement des chefs de classe', 'error');
      setChefs([]);
    }
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chef de classe ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3832/api/chefdeclasses/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        showNotification('Chef de classe supprimé avec succès', 'success');
        fetchChefs();
      } catch (error) {
        console.error('Erreur de suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Liste des chefs de classe</h2>
        <button
          onClick={() => {
            setSelectedChef(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un chef de classe
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chefs.map((chef) => (
              <tr key={chef._id}>
                <td className="px-6 py-4 whitespace-nowrap">{chef.matricule}</td>
                <td className="px-6 py-4 whitespace-nowrap">{chef.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{chef.prenom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{chef.classe}</td>
                <td className="px-6 py-4 whitespace-nowrap">{chef.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => {
                      setSelectedChef(chef);
                      setIsModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(chef._id)}
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
        <ChefModal
          chef={selectedChef}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchChefs();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ChefsManagement; 