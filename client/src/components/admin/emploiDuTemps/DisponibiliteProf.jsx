import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import DisponibiliteSelector from './DisponibiliteSelector';

const DisponibiliteProf = () => {
  const [professeurs, setProfesseurs] = useState([]);
  const [selectedProf, setSelectedProf] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    loadProfesseurs();
  }, []);

  const loadProfesseurs = async () => {
    try {
      const response = await axios.get('http://localhost:3832/api/professeurs');
      setProfesseurs(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des professeurs', 'error');
    }
  };

  const handleDisponibiliteChange = async (disponibilites) => {
    if (!selectedProf) return;
    
    try {
      await axios.put(`http://localhost:3832/api/professeurs/${selectedProf}/disponibilite`, {
        disponibilite: disponibilites
      });
      showNotification('Disponibilités mises à jour avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la mise à jour des disponibilités', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="w-full max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un professeur
        </label>
        <select
          value={selectedProf}
          onChange={(e) => setSelectedProf(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choisir un professeur</option>
          {professeurs.map((prof) => (
            <option key={prof._id} value={prof._id}>
              {prof.nom} {prof.prenom} - {prof.matiere}
            </option>
          ))}
        </select>
      </div>

      {selectedProf && (
        <DisponibiliteSelector
          value={professeurs.find(p => p._id === selectedProf)?.disponibilite || []}
          onChange={handleDisponibiliteChange}
        />
      )}
    </div>
  );
};

export default DisponibiliteProf; 