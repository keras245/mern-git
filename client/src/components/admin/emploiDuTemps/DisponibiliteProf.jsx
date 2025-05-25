import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';

const DisponibiliteProf = () => {
  const [professeurs, setProfesseurs] = useState([]);
  const [selectedProf, setSelectedProf] = useState('');
  const [disponibilites, setDisponibilites] = useState({});
  const { showNotification } = useNotification();

  const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const CRENEAUX = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

  useEffect(() => {
    loadProfesseurs();
  }, []);

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

  const handleProfesseurChange = (profId) => {
    setSelectedProf(profId);
    const prof = professeurs.find(p => p._id === profId);
    if (prof) {
      const dispos = {};
      JOURS.forEach(jour => {
        dispos[jour] = prof.disponibilite?.find(d => d.jour === jour)?.creneaux || [];
      });
      setDisponibilites(dispos);
    } else {
      setDisponibilites({});
    }
  };

  const toggleCreneau = (jour, creneau) => {
    setDisponibilites(prev => {
      const newDispos = { ...prev };
      if (!newDispos[jour]) newDispos[jour] = [];
      
      if (newDispos[jour].includes(creneau)) {
        newDispos[jour] = newDispos[jour].filter(c => c !== creneau);
      } else {
        newDispos[jour] = [...newDispos[jour], creneau];
      }
      
      return newDispos;
    });
  };

  const handleSubmit = async () => {
    if (!selectedProf) return;

    const disponibilitesArray = Object.entries(disponibilites)
      .filter(([_, creneaux]) => creneaux.length > 0)
      .map(([jour, creneaux]) => ({
        jour,
        creneaux
      }));

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3832/api/professeurs/${selectedProf}/disponibilite`,
        { disponibilite: disponibilitesArray },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
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
          onChange={(e) => handleProfesseurChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
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
        <div className="space-y-6">
          {JOURS.map(jour => (
            <div key={jour} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">{jour}</h3>
              <div className="flex flex-wrap gap-2">
                {CRENEAUX.map(creneau => (
                  <button
                    key={creneau}
                    onClick={() => toggleCreneau(jour, creneau)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${disponibilites[jour]?.includes(creneau)
                        ? 'bg-primary-100 text-primary-800 border-2 border-primary-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                  >
                    {creneau}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Enregistrer les disponibilités
          </button>
        </div>
      )}
    </div>
  );
};

export default DisponibiliteProf; 