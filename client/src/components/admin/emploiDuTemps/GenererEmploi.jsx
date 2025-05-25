import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';

const GenererEmploi = () => {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState(1);
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  // Récupérer les programmes
  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const response = await axios.get('/api/programmes');
        if (Array.isArray(response.data)) {
          setProgrammes(response.data);
        } else {
          console.error('Les données reçues ne sont pas un tableau:', response.data);
          setProgrammes([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des programmes:', error);
        showNotification('Erreur lors de la récupération des programmes', 'error');
        setProgrammes([]);
      }
    };
    fetchProgrammes();
  }, []);

  // Générer l'emploi du temps automatiquement
  const genererEmploiAutomatique = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/emplois/generer-automatique', {
        programme: selectedProgramme,
        groupe: selectedGroupe
      });
      setEmploiDuTemps(response.data);
      showNotification('Emploi du temps généré avec succès', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erreur lors de la génération', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Afficher l'emploi du temps
  const EmploiDuTempsTable = () => {
    if (!emploiDuTemps) return null;

    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const creneaux = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">Horaire</th>
              {jours.map(jour => (
                <th key={jour} className="border p-2">{jour}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {creneaux.map(creneau => (
              <tr key={creneau}>
                <td className="border p-2">{creneau}</td>
                {jours.map(jour => {
                  const seance = emploiDuTemps.seances.find(
                    s => s.jour === jour && s.creneau === creneau
                  );
                  return (
                    <td key={`${jour}-${creneau}`} className="border p-2">
                      {seance ? (
                        <div>
                          <div>{seance.cours.nom_matiere}</div>
                          <div className="text-sm text-gray-600">
                            {seance.professeur.nom} {seance.professeur.prenom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {seance.salle.nom}
                          </div>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gestion des Emplois du Temps</h2>
      
      <div className="flex gap-4 mb-4">
        <select
          value={selectedProgramme}
          onChange={(e) => setSelectedProgramme(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sélectionner un programme</option>
          {Array.isArray(programmes) && programmes.map(prog => (
            <option key={prog._id} value={prog._id}>
              {prog.nom}
            </option>
          ))}
        </select>

        <select
          value={selectedGroupe}
          onChange={(e) => setSelectedGroupe(parseInt(e.target.value))}
          className="border p-2 rounded"
        >
          <option value="1">Groupe 1</option>
          <option value="2">Groupe 2</option>
        </select>

        <button
          onClick={genererEmploiAutomatique}
          disabled={!selectedProgramme || loading}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:bg-gray-400"
        >
          {loading ? 'Génération...' : 'Générer Automatiquement'}
        </button>
      </div>

      <EmploiDuTempsTable />
    </div>
  );
};

export default GenererEmploi; 