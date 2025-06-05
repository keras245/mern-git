import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Play, 
  Edit3, 
  Save, 
  X, 
  Plus,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Target,
  Search,
  Archive,
  FileText,
  History
} from 'lucide-react';

const GenererEmploi = () => {
  const [activeTab, setActiveTab] = useState('automatique');
  const [programmes, setProgrammes] = useState([]);
  const [cours, setCours] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [salles, setSalles] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState('');
  const [groupesDisponibles, setGroupesDisponibles] = useState([]);
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyseDonnees, setAnalyseDonnees] = useState(null);
  const [conflits, setConflits] = useState([]);
  const [showAnalyse, setShowAnalyse] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [seanceEnEdition, setSeanceEnEdition] = useState(null);
  const [filtres, setFiltres] = useState({
    professeur: '',
    matiere: '',
    salle: '',
    jour: ''
  });
  
  // Nouveaux états pour la gestion des emplois sauvegardés
  const [emploisSauvegardes, setEmploisSauvegardes] = useState([]);
  const [loadingEmplois, setLoadingEmplois] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Nouveaux états pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(1); // 1 emploi par page

  // Nouveaux états pour la sélection simple
  const [emploiSelectionne, setEmploiSelectionne] = useState('');

  // Ajouter un état pour savoir si on charge depuis les sauvegardes
  const [chargementDepuisSauvegardes, setChargementDepuisSauvegardes] = useState(false);

  const { showNotification } = useNotification();

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const creneaux = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

  // Charger les données initiales
  useEffect(() => {
    chargerDonneesInitiales();
  }, []);

  // Charger les emplois sauvegardés quand on va sur l'onglet
  useEffect(() => {
    if (activeTab === 'sauvegardes') {
      chargerEmploisSauvegardes();
    }
  }, [activeTab]);

  // Charger les groupes quand un programme est sélectionné
  useEffect(() => {
    if (selectedProgramme) {
      chargerGroupesProgramme();
    } else {
      setGroupesDisponibles([]);
      setSelectedGroupe('');
    }
  }, [selectedProgramme]);

  // Modifier le useEffect problématique pour ne pas réinitialiser quand on charge depuis les sauvegardes
  useEffect(() => {
    // Ne pas réinitialiser l'emploi du temps si on est en train de charger depuis les sauvegardes
    // ou si on est sur l'onglet sauvegardes
    if (!chargementDepuisSauvegardes && activeTab !== 'sauvegardes') {
    setEmploiDuTemps(null);
    setConflits([]);
    setAnalyseDonnees(null);
    setShowAnalyse(false);
    }
  }, [selectedProgramme, selectedGroupe, chargementDepuisSauvegardes, activeTab]);

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
    if (!selectedProgramme) {
      setGroupesDisponibles([]);
      setSelectedGroupe('');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      console.log('Chargement groupes pour programme:', selectedProgramme);
      
      const response = await axios.get(
        `http://localhost:3832/api/emplois/groupes/${selectedProgramme}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log('Groupes reçus:', response.data);
      setGroupesDisponibles(response.data.groupes);
      
      // Ne pas changer automatiquement le groupe si on est en train de charger depuis les sauvegardes
      // ou si on est sur l'onglet sauvegardes
      if (!chargementDepuisSauvegardes && activeTab !== 'sauvegardes') {
      if (response.data.groupes && response.data.groupes.length > 0) {
        setSelectedGroupe(response.data.groupes[0]);
      } else {
        setSelectedGroupe('');
        }
      }
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
      showNotification('Erreur lors du chargement des groupes', 'error');
      setGroupesDisponibles([1]); // Fallback
      if (!chargementDepuisSauvegardes && activeTab !== 'sauvegardes') {
      setSelectedGroupe(1);
      }
    }
  };

  // Analyser les données avant génération
  const analyserDonnees = async () => {
    if (!selectedProgramme) {
      showNotification('Veuillez sélectionner un programme', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:3832/api/emplois/analyser-donnees',
        { programme: selectedProgramme, groupe: selectedGroupe },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setAnalyseDonnees(response.data);
      setShowAnalyse(true);
    } catch (error) {
      showNotification('Erreur lors de l\'analyse', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Générer l'emploi du temps automatiquement
  const genererEmploiAutomatique = async () => {
    if (!selectedProgramme || !selectedGroupe) {
      showNotification('Veuillez sélectionner un programme et un groupe', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Génération avec:', { id_programme: selectedProgramme, groupe: selectedGroupe });
      
      const response = await axios.post(
        'http://localhost:3832/api/emplois/generer-automatique',
        { 
          id_programme: selectedProgramme,
          groupe: parseInt(selectedGroupe)
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log('Réponse backend:', response.data);

      // CORRECTION: Adapter la structure de réponse
      if (response.data.emploiDuTemps) {
        // Récupérer l'emploi du temps avec les données peuplées
        const emploiComplet = await axios.get(
          `http://localhost:3832/api/emplois/${response.data.emploiDuTemps._id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setEmploiDuTemps(emploiComplet.data);
      } else {
        // Aucun emploi du temps créé (tous les cours en conflit)
        setEmploiDuTemps({ seances: [] });
      }
      
      setConflits(response.data.conflits || []);
      
      if (response.data.conflits && response.data.conflits.length > 0) {
        showNotification(
          `Emploi du temps généré avec ${response.data.conflits.length} conflit(s)`, 
          'warning'
        );
      } else {
        showNotification('Emploi du temps généré avec succès !', 'success');
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      const message = error.response?.data?.message || 'Erreur lors de la génération';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Modifier une séance
  const modifierSeance = (jour, creneau, seance = null) => {
    setSeanceEnEdition({
      jour,
      creneau,
      cours: seance?.cours?._id || '',
      professeur: seance?.professeur?._id || '',
      salle: seance?.salle?._id || '',
      isNew: !seance
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
      } else {
        // Modifier séance existante
        const response = await axios.put(
          `http://localhost:3832/api/emplois/modifier-seance`,
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
      }

      setModeEdition(false);
      setSeanceEnEdition(null);
      showNotification('Séance mise à jour avec succès', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Erreur lors de la modification', 'error');
    }
  };

  // Supprimer une séance
  const supprimerSeance = async (jour, creneau) => {
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
      showNotification('Séance supprimée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  // Exporter l'emploi du temps
  const exporterEmploi = async (format) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:3832/api/emplois/exporter/${format}`,
        { emploiDuTempsId: emploiDuTemps._id },
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emploi-du-temps.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotification(`Emploi du temps exporté en ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showNotification('Erreur lors de l\'export', 'error');
    }
  };

  // Filtrer les cours disponibles pour le programme sélectionné
  const coursFiltres = cours.filter(c => 
    c.id_programme?._id === selectedProgramme &&
    (!filtres.matiere || c.nom_matiere.toLowerCase().includes(filtres.matiere.toLowerCase()))
  );

  // Filtrer les professeurs disponibles
  const professeursFiltres = professeurs.filter(p =>
    !filtres.professeur || 
    `${p.nom} ${p.prenom}`.toLowerCase().includes(filtres.professeur.toLowerCase())
  );

  // Filtrer les salles disponibles
  const sallesFiltrees = salles.filter(s =>
    !filtres.salle || s.nom.toLowerCase().includes(filtres.salle.toLowerCase())
  );

  // Composant d'analyse des données
  const AnalyseDonnees = () => {
    if (!showAnalyse || !analyseDonnees) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-blue-800 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Analyse des données
          </h3>
          <button
            onClick={() => setShowAnalyse(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cours à programmer</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-800">{analyseDonnees.totalCours}</div>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Professeurs disponibles</span>
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-800">{analyseDonnees.profsDisponibles}</div>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Salles disponibles</span>
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-800">{analyseDonnees.sallesDisponibles}</div>
          </div>
        </div>

        {analyseDonnees.problemes?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Problèmes détectés
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {analyseDonnees.problemes.map((probleme, index) => (
                <li key={index}>• {probleme}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Composant de la grille d'emploi du temps
  const GrilleEmploiDuTemps = () => {
    if (!emploiDuTemps) return null;

    // Trouver le programme pour afficher le nom complet
    const programme = programmes.find(p => p._id === selectedProgramme);
    const nomComplet = programme 
      ? `${programme.nom} Licence ${programme.licence} Semestre ${programme.semestre} (Groupe ${selectedGroupe})`
      : `Emploi du temps (Groupe ${selectedGroupe})`;

    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <h3 className="font-medium text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Emploi du temps - {nomComplet}
          </h3>
          <div className="flex space-x-2">
            {/* Remplacer Sauvegarder par Supprimer dans l'onglet sauvegardes */}
            {activeTab === 'sauvegardes' && emploiSelectionne && (
              <button
                onClick={() => {
                  const emploi = emploisSauvegardes.find(e => e._id === emploiSelectionne);
                  if (emploi && confirm(`Êtes-vous sûr de vouloir supprimer l'emploi "${emploi.nom}" ?`)) {
                    supprimerEmploiSauvegarde(emploiSelectionne);
                    setEmploiSelectionne('');
                    setEmploiDuTemps(null);
                  }
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>
            )}
            
            {/* Garder Sauvegarder pour les autres onglets */}
            {activeTab !== 'sauvegardes' && (
              <button
                onClick={sauvegarderEmploiDuTemps}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </button>
            )}
            
            <button
              onClick={() => exporterEmploi('pdf')}
              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download className="w-3 h-3 mr-1" />
              PDF
            </button>
            <button
              onClick={() => exporterEmploi('excel')}
              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download className="w-3 h-3 mr-1" />
              Excel
            </button>
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
                    const seance = emploiDuTemps.seances?.find(s => s.jour === jour && s.creneau === creneau);
                  return (
                      <td key={jour} className="px-2 py-6 border-r relative">
                      {seance ? (
                          <div 
                            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => activeTab === 'manuel' && modifierSeance(jour, creneau, seance)}
                          >
                            <div className="font-semibold text-sm mb-1 leading-tight">
                              {seance.cours?.nom_matiere || 'Cours'}
                              </div>
                            <div className="text-xs opacity-90 space-y-1">
                              <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                                {seance.professeur?.prenom} {seance.professeur?.nom}
                            </div>
                              <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {seance.salle?.nom}
                            </div>
                          </div>
                            {activeTab === 'manuel' && (
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  supprimerSeance(jour, creneau);
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                            )}
                          </div>
                        ) : (
                          <div 
                            className={`h-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs ${
                              activeTab === 'manuel' ? 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer' : ''
                            }`}
                            onClick={() => activeTab === 'manuel' && modifierSeance(jour, creneau)}
                          >
                            {activeTab === 'manuel' ? (
                              <Plus className="w-4 h-4" />
                            ) : (
                              'Libre'
                            )}
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
    );
  };

  // Modal d'édition de séance
  const ModalEditionSeance = () => {
    if (!modeEdition || !seanceEnEdition) return null;

    return (
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
                {coursFiltres.map(c => (
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
                {professeursFiltres.map(p => (
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
                {sallesFiltrees.map(s => (
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
    );
  };

  // Nouvelle fonction pour charger les emplois sauvegardés
  const chargerEmploisSauvegardes = async () => {
    try {
      setLoadingEmplois(true);
      const token = localStorage.getItem('token');
      
      console.log('Chargement des emplois sauvegardés...');
      
      const response = await axios.get('http://localhost:3832/api/emplois', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Emplois chargés:', response.data);
      setEmploisSauvegardes(response.data);
      
    } catch (error) {
      console.error('Erreur chargement emplois:', error);
      showNotification('Erreur lors du chargement des emplois sauvegardés', 'error');
      setEmploisSauvegardes([]); // Réinitialiser en cas d'erreur
    } finally {
      setLoadingEmplois(false);
    }
  };

  // Simplifier la fonction de chargement (sans useCallback problématique)
  const chargerEmploiSelectionne = async (emploiId) => {
    if (!emploiId) {
      setEmploiDuTemps(null);
      return;
    }

    console.log('=== DEBUT chargerEmploiSelectionne ===');
    console.log('emploiId:', emploiId);

    try {
      setLoading(true);
      setChargementDepuisSauvegardes(true); // Indiquer qu'on charge depuis les sauvegardes
      
      const token = localStorage.getItem('token');
      
      console.log('Appel API pour emploi ID:', emploiId);
      
      const response = await axios.get(`http://localhost:3832/api/emplois/${emploiId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const emploi = response.data;
      console.log('Emploi reçu:', emploi);
      
      // Mettre à jour les états et l'emploi du temps de manière synchrone
      setSelectedProgramme(emploi.programme._id);
      setSelectedGroupe(emploi.groupe);
      setEmploiDuTemps(emploi);
      
      console.log('États mis à jour');
      showNotification('Emploi du temps chargé avec succès', 'success');
      
      // Remettre le flag à false après un délai plus long pour s'assurer que tous les effets sont terminés
      setTimeout(() => {
        setChargementDepuisSauvegardes(false);
        console.log('Flag chargementDepuisSauvegardes remis à false');
      }, 500); // Délai augmenté à 500ms
      
    } catch (error) {
      console.error('Erreur chargement emploi:', error);
      showNotification('Erreur lors du chargement de l\'emploi du temps', 'error');
      setChargementDepuisSauvegardes(false);
    } finally {
      setLoading(false);
      console.log('=== FIN chargerEmploiSelectionne ===');
    }
  };

  // Composant pour l'onglet des emplois sauvegardés (gestionnaire simplifié)
  const EmploisSauvegardes = () => {
    const handleAfficherClick = () => {
      console.log('=== CLIC AFFICHER ===');
      console.log('emploiSelectionne:', emploiSelectionne);
      console.log('loading:', loading);
      
      if (emploiSelectionne && !loading) {
        chargerEmploiSelectionne(emploiSelectionne);
      }
    };

    return (
      <div className="space-y-6">
        {/* Interface simplifiée : juste un sélecteur et un bouton */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emplois du temps sauvegardés
              </label>
              <select
                value={emploiSelectionne}
                onChange={(e) => {
                  console.log('Sélection changée:', e.target.value);
                  setEmploiSelectionne(e.target.value);
                  // Réinitialiser l'emploi affiché quand on change de sélection
                  if (!e.target.value) {
                    setEmploiDuTemps(null);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="">-- Sélectionner un emploi du temps --</option>
                {emploisSauvegardes.map((emploi) => (
                  <option key={emploi._id} value={emploi._id}>
                    {emploi.programme?.nom || 'Programme inconnu'} - Groupe {emploi.groupe} ({emploi.seances?.length || 0} séances)
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAfficherClick}
              disabled={!emploiSelectionne || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Chargement...' : 'Afficher'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Fonction pour générer le diminutif du programme
  const genererDiminutif = (nomProgramme) => {
    // Génie Logiciel -> GL, Génie Informatique -> GI, etc.
    if (nomProgramme.toLowerCase().includes('génie logiciel')) {
      return 'GL';
    } else if (nomProgramme.toLowerCase().includes('génie informatique')) {
      return 'GI';
    } else if (nomProgramme.toLowerCase().includes('génie civil')) {
      return 'GC';
    } else if (nomProgramme.toLowerCase().includes('génie électrique')) {
      return 'GE';
    } else {
      // Fallback: prendre les premières lettres des mots principaux
      return nomProgramme
        .split(' ')
        .filter(mot => mot.length > 2)
        .map(mot => mot[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
  };

  const sauvegarderEmploiDuTemps = async () => {
    if (!emploiDuTemps) {
      showNotification('Aucun emploi du temps à sauvegarder', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Générer automatiquement le nom basé sur le programme (nom complet + diminutif licence/semestre)
      const programme = programmes.find(p => p._id === selectedProgramme);
      const nomAuto = `${programme?.nom || 'Emploi'} L${programme?.licence}S${programme?.semestre} - Groupe ${selectedGroupe}`;
      
      const dataToSave = {
        nom: nomAuto,
        description: '', // Pas de description
        programme: selectedProgramme,
        groupe: selectedGroupe,
        seances: emploiDuTemps.seances || [],
        statut: 'actif'
      };

      console.log('Données à sauvegarder:', dataToSave);

      const response = await axios.post(
        'http://localhost:3832/api/emplois/sauvegarder',
        dataToSave,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log('Réponse sauvegarde:', response.data);

      showNotification('Emploi du temps sauvegardé avec succès !', 'success');
      
      // Recharger la liste si on est sur l'onglet sauvegardes
      if (activeTab === 'sauvegardes') {
        await chargerEmploisSauvegardes();
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un emploi sauvegardé
  const supprimerEmploiSauvegarde = async (emploiId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet emploi du temps ?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:3832/api/emplois/${emploiId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      showNotification('Emploi du temps supprimé avec succès', 'success');
      
      // Recharger la liste des emplois
      await chargerEmploisSauvegardes();
      
    } catch (error) {
      console.error('Erreur suppression emploi:', error);
      showNotification('Erreur lors de la suppression de l\'emploi du temps', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          Génération des emplois du temps
        </h2>
        <p className="text-gray-600">
          Créez et gérez les emplois du temps avec attribution automatique ou manuelle
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'automatique', label: 'Génération automatique', icon: Zap },
              { id: 'manuel', label: 'Attribution manuelle', icon: Edit3 },
              { id: 'analyse', label: 'Analyse & Optimisation', icon: Target },
              { id: 'sauvegardes', label: 'Sauvegardes', icon: Archive }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Sélection du programme et groupe - SEULEMENT pour les autres onglets */}
          {activeTab !== 'sauvegardes' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programme
                </label>
        <select
          value={selectedProgramme}
                  onChange={(e) => {
                    setSelectedProgramme(e.target.value);
                    chargerGroupesProgramme(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Sélectionner un programme</option>
                  {programmes.map(programme => (
                    <option key={programme._id} value={programme._id}>
                      {programme.nom} - L{programme.licence} S{programme.semestre}
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
                  onClick={analyserDonnees}
                  disabled={!selectedProgramme || loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Analyser les données
                </button>
              </div>
            </div>
          )}

          {/* Analyse des données */}
          <AnalyseDonnees />

          {/* Génération automatique */}
          {activeTab === 'automatique' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Génération automatique intelligente
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  L'algorithme optimise automatiquement l'attribution des cours en tenant compte des disponibilités, 
                  des contraintes de salles et des préférences pédagogiques.
                </p>
                
                <div className="flex space-x-3">
        <button
          onClick={genererEmploiAutomatique}
          disabled={!selectedProgramme || loading}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Génération en cours...' : 'Générer automatiquement'}
                  </button>
                  
                  {emploiDuTemps && (
                    <>
                      <button
                        type="button"
                        onClick={sauvegarderEmploiDuTemps}
                        disabled={loading}
                        className="flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {loading ? 'Sauvegarde...' : 'Sauvegarder l\'emploi'}
                      </button>
                    <button
                      onClick={() => setEmploiDuTemps(null)}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Nouveau
                    </button>
                    </>
                  )}
                </div>
              </div>

              {conflits.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-red-800 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Problèmes détectés ({conflits.length})
                  </h4>
                  <div className="space-y-2">
                    {conflits.map((conflit, index) => (
                      <div key={index} className="bg-white border border-red-200 rounded p-3">
                        <div className="font-medium text-red-900 mb-1">
                          📚 {conflit.cours}
                        </div>
                        <div className="text-sm text-red-700 mb-2">
                          ⚠️ {conflit.details}
                        </div>
                        {conflit.suggestions && (
                          <div className="text-xs text-red-600">
                            💡 <span className="font-medium">Solutions:</span> {conflit.suggestions.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attribution manuelle */}
          {activeTab === 'manuel' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Edit3 className="w-5 h-5 mr-2" />
                  Attribution manuelle
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Créez ou modifiez l'emploi du temps manuellement en cliquant sur les créneaux. 
                  Idéal pour les ajustements personnalisés et les cas particuliers.
                </p>
                
                <div className="flex space-x-3">
                  {!emploiDuTemps ? (
                  <button
                    onClick={() => setEmploiDuTemps({ seances: [], programme: selectedProgramme, groupe: selectedGroupe })}
                    disabled={!selectedProgramme}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un emploi du temps vide
        </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={sauvegarderEmploiDuTemps}
                        disabled={loading}
                        className="flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {loading ? 'Sauvegarde...' : 'Sauvegarder l\'emploi'}
                      </button>
                      <button
                        onClick={() => setEmploiDuTemps(null)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Nouveau
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analyse et optimisation */}
          {activeTab === 'analyse' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Analyse et optimisation
                </h3>
                <p className="text-sm text-purple-700 mb-4">
                  Analysez les performances de votre emploi du temps et obtenez des suggestions d'optimisation.
                </p>
                
                {emploiDuTemps && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded border">
                      <div className="text-sm text-gray-600">Taux d'occupation</div>
                      <div className="text-2xl font-bold text-purple-800">
                        {Math.round((emploiDuTemps.seances?.length || 0) / (jours.length * creneaux.length) * 100)}%
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="text-sm text-gray-600">Conflits détectés</div>
                      <div className="text-2xl font-bold text-red-800">{conflits.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="text-sm text-gray-600">Séances programmées</div>
                      <div className="text-2xl font-bold text-green-800">{emploiDuTemps.seances?.length || 0}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emplois sauvegardés */}
          {activeTab === 'sauvegardes' && (
            <EmploisSauvegardes />
          )}
        </div>
      </div>

      {/* Grille d'emploi du temps - CONDITION CORRIGÉE */}
      {emploiDuTemps && <GrilleEmploiDuTemps />}

      {/* Modal d'édition */}
      <ModalEditionSeance />
    </div>
  );
};

export default GenererEmploi; 