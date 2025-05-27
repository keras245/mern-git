import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  Trash2,
  Move,
  RefreshCw,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';

const ModificationEDT = () => {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState('');
  const [groupesDisponibles, setGroupesDisponibles] = useState([]);
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [cours, setCours] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [seanceEnEdition, setSeanceEnEdition] = useState(null);
  const [draggedSeance, setDraggedSeance] = useState(null);
  const [modifications, setModifications] = useState([]);

  const { showNotification } = useNotification();

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const creneaux = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

  // Charger les données initiales
  useEffect(() => {
    chargerDonneesInitiales();
  }, []);

  // Charger les groupes quand un programme est sélectionné
  useEffect(() => {
    if (selectedProgramme) {
      chargerGroupesProgramme();
    } else {
      setGroupesDisponibles([]);
      setSelectedGroupe('');
    }
  }, [selectedProgramme]);

  // Charger l'emploi du temps quand programme et groupe sont sélectionnés
  useEffect(() => {
    if (selectedProgramme && selectedGroupe) {
      chargerEmploiDuTemps();
    }
  }, [selectedProgramme, selectedGroupe]);

  const chargerDonneesInitiales = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [progRes, coursRes, profRes, salleRes] = await Promise.all([
        axios.get('http://localhost:3832/api/programmes', { headers }),
        axios.get('http://localhost:3832/api/cours', { headers }),
        axios.get('http://localhost:3832/api/professeurs', { headers }),
        axios.get('http://localhost:3832/api/salles', { headers })
      ]);

      setProgrammes(progRes.data);
      setCours(coursRes.data);
      setProfesseurs(profRes.data);
      setSalles(salleRes.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des données', 'error');
    }
  };

  const chargerGroupesProgramme = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:3832/api/emplois/groupes/${selectedProgramme}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setGroupesDisponibles(response.data.groupes);
      if (response.data.groupes && response.data.groupes.length > 0) {
        setSelectedGroupe(response.data.groupes[0]);
      }
    } catch (error) {
      showNotification('Erreur lors du chargement des groupes', 'error');
    }
  };

  const chargerEmploiDuTemps = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:3832/api/emplois/${selectedProgramme}/${selectedGroupe}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setEmploiDuTemps(response.data);
      setModifications([]);
    } catch (error) {
      if (error.response?.status === 404) {
        setEmploiDuTemps(null);
        showNotification('Aucun emploi du temps trouvé pour ce programme et groupe', 'info');
      } else {
        showNotification('Erreur lors du chargement de l\'emploi du temps', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Organiser les séances par jour et créneau
  const organiserSeances = () => {
    const grille = {};
    jours.forEach(jour => {
      grille[jour] = {};
      creneaux.forEach(creneau => {
        grille[jour][creneau] = null;
      });
    });

    if (emploiDuTemps?.seances) {
      emploiDuTemps.seances.forEach(seance => {
        if (grille[seance.jour] && grille[seance.jour][seance.creneau] !== undefined) {
          grille[seance.jour][seance.creneau] = seance;
        }
      });
    }

    return grille;
  };

  // Gestion du drag and drop
  const handleDragStart = (e, seance, jour, creneau) => {
    setDraggedSeance({ seance, jour, creneau });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, nouveauJour, nouveauCreneau) => {
    e.preventDefault();
    
    if (!draggedSeance) return;

    const { seance, jour: ancienJour, creneau: ancienCreneau } = draggedSeance;

    // Vérifier si on déplace vers la même position
    if (ancienJour === nouveauJour && ancienCreneau === nouveauCreneau) {
      setDraggedSeance(null);
      return;
    }

    // Vérifier si la nouvelle position est occupée
    const grille = organiserSeances();
    if (grille[nouveauJour][nouveauCreneau]) {
      showNotification('Ce créneau est déjà occupé', 'error');
      setDraggedSeance(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Supprimer l'ancienne séance
      await axios.delete(
        'http://localhost:3832/api/emplois/supprimer-seance',
        {
          data: {
            emploiDuTempsId: emploiDuTemps._id,
            jour: ancienJour,
            creneau: ancienCreneau
          },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Ajouter la nouvelle séance
      const response = await axios.post(
        'http://localhost:3832/api/emplois/ajouter-seance',
        {
          emploiDuTempsId: emploiDuTemps._id,
          seance: {
            cours: seance.cours._id,
            professeur: seance.professeur._id,
            salle: seance.salle._id,
            jour: nouveauJour,
            creneau: nouveauCreneau
          }
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setEmploiDuTemps(response.data);
      
      // Enregistrer la modification
      const modification = {
        type: 'deplacement',
        cours: seance.cours.nom_matiere,
        ancienCreneau: `${ancienJour} ${ancienCreneau}`,
        nouveauCreneau: `${nouveauJour} ${nouveauCreneau}`,
        timestamp: new Date()
      };
      setModifications(prev => [...prev, modification]);

      showNotification('Séance déplacée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors du déplacement', 'error');
    }

    setDraggedSeance(null);
  };

  // Modifier une séance
  const modifierSeance = (jour, creneau, seance) => {
    setSeanceEnEdition({
      jour,
      creneau,
      cours: seance?.cours?._id || '',
      professeur: seance?.professeur?._id || '',
      salle: seance?.salle?._id || '',
      isNew: !seance,
      original: seance
    });
    setModeEdition(true);
  };

  // Sauvegarder une séance modifiée
  const sauvegarderSeance = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (seanceEnEdition.isNew) {
        // Ajouter nouvelle séance
        const response = await axios.post(
          'http://localhost:3832/api/emplois/ajouter-seance',
          {
            emploiDuTempsId: emploiDuTemps._id,
            seance: {
              cours: seanceEnEdition.cours,
              professeur: seanceEnEdition.professeur,
              salle: seanceEnEdition.salle,
              jour: seanceEnEdition.jour,
              creneau: seanceEnEdition.creneau
            }
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setEmploiDuTemps(response.data);

        const modification = {
          type: 'ajout',
          cours: cours.find(c => c._id === seanceEnEdition.cours)?.nom_matiere,
          creneau: `${seanceEnEdition.jour} ${seanceEnEdition.creneau}`,
          timestamp: new Date()
        };
        setModifications(prev => [...prev, modification]);
      } else {
        // Modifier séance existante
        const response = await axios.put(
          'http://localhost:3832/api/emplois/modifier-seance',
          {
            emploiDuTempsId: emploiDuTemps._id,
            ancienneSeance: { jour: seanceEnEdition.jour, creneau: seanceEnEdition.creneau },
            nouvelleSeance: {
              cours: seanceEnEdition.cours,
              professeur: seanceEnEdition.professeur,
              salle: seanceEnEdition.salle,
              jour: seanceEnEdition.jour,
              creneau: seanceEnEdition.creneau
            }
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setEmploiDuTemps(response.data);

        const modification = {
          type: 'modification',
          cours: cours.find(c => c._id === seanceEnEdition.cours)?.nom_matiere,
          creneau: `${seanceEnEdition.jour} ${seanceEnEdition.creneau}`,
          timestamp: new Date()
        };
        setModifications(prev => [...prev, modification]);
      }

      setModeEdition(false);
      setSeanceEnEdition(null);
      showNotification('Séance mise à jour avec succès', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erreur lors de la modification', 'error');
    }
  };

  // Supprimer une séance
  const supprimerSeance = async (jour, creneau, seance) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        'http://localhost:3832/api/emplois/supprimer-seance',
        {
          data: {
            emploiDuTempsId: emploiDuTemps._id,
            jour,
            creneau
          },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setEmploiDuTemps(response.data);

      const modification = {
        type: 'suppression',
        cours: seance.cours.nom_matiere,
        creneau: `${jour} ${creneau}`,
        timestamp: new Date()
      };
      setModifications(prev => [...prev, modification]);

      showNotification('Séance supprimée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const grille = organiserSeances();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
          <Edit3 className="w-6 h-6 mr-2" />
          Modification de l'emploi du temps
        </h2>
        <p className="text-gray-600">
          Modifiez, déplacez ou supprimez les séances de l'emploi du temps avec une interface intuitive
        </p>
      </div>

      {/* Sélection du programme et groupe */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programme
            </label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un programme</option>
              {programmes.map(prog => (
                <option key={prog._id} value={prog._id}>
                  {prog.nom} - L{prog.licence} S{prog.semestre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Groupe
            </label>
            <select
              value={selectedGroupe}
              onChange={(e) => setSelectedGroupe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedProgramme}
            >
              <option value="">Sélectionner un groupe</option>
              {groupesDisponibles.map(groupe => (
                <option key={groupe} value={groupe}>
                  Groupe {groupe}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={chargerEmploiDuTemps}
              disabled={!selectedProgramme || !selectedGroupe || loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Charger l'emploi du temps
            </button>
          </div>
        </div>
      </div>

      {/* Historique des modifications */}
      {modifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Historique des modifications ({modifications.length})
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {modifications.slice(-5).reverse().map((modif, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span className="capitalize font-medium">{modif.type}</span>
                <span className="mx-2">•</span>
                <span>{modif.cours}</span>
                {modif.ancienCreneau && (
                  <>
                    <span className="mx-2">de</span>
                    <span className="font-medium">{modif.ancienCreneau}</span>
                    <span className="mx-2">vers</span>
                    <span className="font-medium">{modif.nouveauCreneau}</span>
                  </>
                )}
                {modif.creneau && !modif.ancienCreneau && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-medium">{modif.creneau}</span>
                  </>
                )}
                <span className="ml-auto text-xs text-gray-400">
                  {modif.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grille d'emploi du temps */}
      {emploiDuTemps && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <h3 className="font-medium text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Emploi du temps - {programmes.find(p => p._id === selectedProgramme)?.nom} (Groupe {selectedGroupe})
            </h3>
            <div className="text-sm text-gray-600">
              Glissez-déposez les cours pour les déplacer
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Horaire
                  </th>
                  {jours.map(jour => (
                    <th key={jour} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                      {jour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creneaux.map((creneau, creneauIndex) => (
                  <tr key={creneau} className={creneauIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-6 whitespace-nowrap text-sm font-medium text-gray-900 border-r bg-gray-100">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        {creneau}
                      </div>
                    </td>
                    {jours.map(jour => {
                      const seance = grille[jour][creneau];
                      return (
                        <td
                          key={jour}
                          className="border-r border-gray-200 h-24 relative"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, jour, creneau)}
                        >
                          {seance ? (
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, seance, jour, creneau)}
                              className="h-full m-1 p-3 bg-blue-100 border border-blue-300 rounded cursor-move hover:bg-blue-200 transition-colors group"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="font-medium text-sm text-blue-800 truncate">
                                  {seance.cours.nom_matiere}
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => modifierSeance(jour, creneau, seance)}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="Modifier"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => supprimerSeance(jour, creneau, seance)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-xs text-blue-600 space-y-1">
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  {seance.professeur.prenom} {seance.professeur.nom}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {seance.salle.nom}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full m-1 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                              <button
                                onClick={() => modifierSeance(jour, creneau, null)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Ajouter un cours"
                              >
                                <Plus className="w-6 h-6" />
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message si pas d'emploi du temps */}
      {!emploiDuTemps && selectedProgramme && selectedGroupe && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Aucun emploi du temps trouvé
          </h3>
          <p className="text-yellow-700 mb-4">
            Il n'y a pas encore d'emploi du temps généré pour ce programme et ce groupe.
          </p>
          <p className="text-sm text-yellow-600">
            Veuillez d'abord générer un emploi du temps dans la section "Générer Emploi".
          </p>
        </div>
      )}

      {/* Modal d'édition */}
      {modeEdition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {seanceEnEdition.isNew ? 'Ajouter un cours' : 'Modifier le cours'}
              </h3>
              <button
                onClick={() => setModeEdition(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Créneau
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {seanceEnEdition.jour} - {seanceEnEdition.creneau}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cours
                </label>
                <select
                  value={seanceEnEdition.cours}
                  onChange={(e) => setSeanceEnEdition({...seanceEnEdition, cours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un cours</option>
                  {cours.filter(c => c.id_programme?._id === selectedProgramme).map(c => (
                    <option key={c._id} value={c._id}>{c.nom_matiere}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professeur
                </label>
                <select
                  value={seanceEnEdition.professeur}
                  onChange={(e) => setSeanceEnEdition({...seanceEnEdition, professeur: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un professeur</option>
                  {professeurs.map(p => (
                    <option key={p._id} value={p._id}>{p.nom} {p.prenom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salle
                </label>
                <select
                  value={seanceEnEdition.salle}
                  onChange={(e) => setSeanceEnEdition({...seanceEnEdition, salle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une salle</option>
                  {salles.map(s => (
                    <option key={s._id} value={s._id}>{s.nom} ({s.type})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setModeEdition(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={sauvegarderSeance}
                disabled={!seanceEnEdition.cours || !seanceEnEdition.professeur || !seanceEnEdition.salle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModificationEDT; 