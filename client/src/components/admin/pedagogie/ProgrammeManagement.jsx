import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import ProgrammeModal from './ProgrammeModal';

const ProgrammeManagement = () => {
  const [programmes, setProgrammes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadProgrammes();
  }, []);

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

  const handleEdit = (programme) => {
    setSelectedProgramme(programme);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3832/api/programmes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification('Programme supprimé avec succès', 'success');
      loadProgrammes();
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Liste des Programmes</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gérez les programmes de formation disponibles
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProgramme(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Programme
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programmes.map((programme) => (
            <div
              key={programme._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{programme.nom}</h3>
              <p className="text-gray-600 mb-2">Licence: {programme.licence}</p>
              <p className="text-gray-600 mb-2">Semestre: {programme.semestre}</p>
              <p className="text-gray-600 mb-2">Groupe: {programme.groupe}</p>
              <p className="text-gray-600 mb-4">{programme.description}</p>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(programme)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(programme._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProgrammeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programme={selectedProgramme}
        onSuccess={() => {
          loadProgrammes();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProgrammeManagement; 