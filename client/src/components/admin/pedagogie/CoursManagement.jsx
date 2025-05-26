import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
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

  // Fonction pour formater l'affichage des professeurs
  const formatProfesseurs = (professeurs) => {
    if (!professeurs || professeurs.length === 0) {
      return (
        <span className="text-gray-400 italic">
          <Users className="inline w-4 h-4 mr-1" />
          Aucun professeur assigné
        </span>
      );
    }

    if (professeurs.length === 1) {
      const prof = professeurs[0];
      return (
        <span className="text-green-600">
          <Users className="inline w-4 h-4 mr-1" />
          {prof.prenom} {prof.nom}
        </span>
      );
    }

    return (
      <div className="text-blue-600">
        <Users className="inline w-4 h-4 mr-1" />
        <span className="font-medium">{professeurs.length} professeurs:</span>
        <div className="text-sm mt-1 space-y-1">
          {professeurs.map((prof, index) => (
            <div key={prof._id || index} className="text-gray-600">
              • {prof.prenom} {prof.nom}
            </div>
          ))}
        </div>
      </div>
    );
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
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="mb-3">
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {cours.id_cours}
              </span>
            </div>
            
            <h3 className="font-semibold text-lg mb-3 text-gray-800">{cours.nom_matiere}</h3>
            
            <div className="space-y-2 mb-4">
              <p className="text-gray-600 flex items-center">
                <span className="font-medium mr-2">Durée:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {cours.duree}h
                </span>
              </p>
              
              <p className="text-gray-600">
                <span className="font-medium">Programme:</span> 
                <span className="ml-2 text-purple-600">
                  {cours.id_programme?.nom || 'Non assigné'}
                </span>
              </p>
              
              <div className="pt-2 border-t border-gray-100">
                {formatProfesseurs(cours.id_prof)}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleEdit(cours)}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                title="Modifier"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(cours._id)}
                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {cours.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours</h3>
          <p className="text-gray-500">Commencez par créer votre premier cours.</p>
        </div>
      )}

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