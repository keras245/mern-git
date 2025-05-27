import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  MapPin, 
  Clock, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  CalendarPlus,
  Timer,
  Save,
  X
} from 'lucide-react';

const CreneauxLibres = () => {
  const [programmes, setProgrammes] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [salles, setSalles] = useState([]);
  const [creneauxLibres, setCreneauxLibres] = useState({
    professeurs: [],
    salles: [],
    statistiques: {}
  });
  const [filtres, setFiltres] = useState({
    jour: '',
    creneau: '',
    type: 'tous' // tous, professeurs, salles
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('vue-globale');

  const { showNotification } = useNotification();

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const creneaux = ['08h30 - 11h30', '12h00 - 15h00', '15h30 - 18h30'];

  // Nouveaux états pour l'attribution temporaire
  const [modalAttribution, setModalAttribution] = useState(false);
  const [attributionData, setAttributionData] = useState({
    professeur: '',
    salle: '',
    cours: '',
    jour: '',
    creneau: '',
    programme: '',
    groupe: ''
  });
  const [cours, setCours] = useState([]);
  const [attributionsTemporaires, setAttributionsTemporaires] = useState([]);

  // Nouveaux états pour la gestion dynamique des groupes
  const [groupesDisponibles, setGroupesDisponibles] = useState([]);

  // Charger les données initiales
  useEffect(() => {
    chargerDonneesInitiales();
    analyserCreneauxLibres();
    chargerCours();
    chargerAttributionsTemporaires();
  }, []);

  // Recharger l'analyse quand les filtres changent
  useEffect(() => {
    analyserCreneauxLibres();
  }, [filtres]);

  const chargerDonneesInitiales = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [progRes, profRes, salleRes] = await Promise.all([
        axios.get('http://localhost:3832/api/programmes', { headers }),
        axios.get('http://localhost:3832/api/professeurs', { headers }),
        axios.get('http://localhost:3832/api/salles', { headers })
      ]);

      setProgrammes(progRes.data);
      setProfesseurs(profRes.data);
      setSalles(salleRes.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des données', 'error');
    }
  };

  const analyserCreneauxLibres = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:3832/api/emplois/analyser-creneaux-libres',
        { filtres },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setCreneauxLibres(response.data);
    } catch (error) {
      showNotification('Erreur lors de l\'analyse des créneaux libres', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Charger les cours et attributions temporaires
  const chargerCours = async () => {
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

  const chargerAttributionsTemporaires = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/emplois/attributions-temporaires', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAttributionsTemporaires(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des attributions temporaires:', error);
    }
  };

  // Charger les groupes quand un programme est sélectionné
  const chargerGroupesProgramme = async (programmeId) => {
    if (!programmeId) {
      setGroupesDisponibles([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3832/api/emplois/groupes/${programmeId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setGroupesDisponibles(response.data.groupes || []);
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
      setGroupesDisponibles([]);
    }
  };

  // Proposer un créneau libre pour un cours
  const proposerCreneau = async (coursId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:3832/api/emplois/proposer-creneau',
        { coursId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      showNotification('Créneaux proposés avec succès', 'success');
      return response.data;
    } catch (error) {
      showNotification('Erreur lors de la proposition de créneaux', 'error');
    }
  };

  // Réserver un créneau libre
  const reserverCreneau = async (professeurId, salleId, jour, creneau) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        'http://localhost:3832/api/emplois/reserver-creneau',
        { professeurId, salleId, jour, creneau },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      showNotification('Créneau réservé avec succès', 'success');
      analyserCreneauxLibres(); // Recharger les données
    } catch (error) {
      showNotification('Erreur lors de la réservation', 'error');
    }
  };

  // Filtrer les créneaux selon les critères
  const filtrerCreneaux = (creneauxData) => {
    return creneauxData.filter(item => {
      if (filtres.jour && !item.disponibilite.some(d => d.jour === filtres.jour)) {
        return false;
      }
      if (filtres.creneau && !item.disponibilite.some(d => d.creneaux.includes(filtres.creneau))) {
        return false;
      }
      return true;
    });
  };

  // Modifier la fonction ouvrirModalAttribution
  const ouvrirModalAttribution = (professeur, salle, jour, creneau) => {
    setAttributionData({
      professeur: professeur?._id || '',
      salle: salle?._id || '',
      cours: '',
      jour,
      creneau,
      programme: '',
      groupe: ''
    });
    setGroupesDisponibles([]); // Reset des groupes
    setModalAttribution(true);
  };

  // Améliorer la fonction attribuerCreneauTemporaire avec plus de logs
  const attribuerCreneauTemporaire = async () => {
    try {
      console.log('=== DÉBUT ATTRIBUTION CÔTÉ CLIENT ===');
      console.log('Données attribution avant validation:', attributionData);

      // Validation côté client
      if (!attributionData.cours || !attributionData.professeur || !attributionData.salle || !attributionData.programme || !attributionData.groupe) {
        console.log('Validation échouée côté client');
        console.log('Champs manquants:', {
          cours: !attributionData.cours,
          professeur: !attributionData.professeur,
          salle: !attributionData.salle,
          programme: !attributionData.programme,
          groupe: !attributionData.groupe
        });
        showNotification('Veuillez remplir tous les champs requis', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      console.log('Token présent:', !!token);
      
      // Calculer la date d'expiration (1 semaine)
      const dateExpiration = new Date();
      dateExpiration.setDate(dateExpiration.getDate() + 7);

      const dataToSend = {
        professeur: attributionData.professeur,
        salle: attributionData.salle,
        cours: attributionData.cours,
        programme: attributionData.programme,
        groupe: parseInt(attributionData.groupe), // Conversion en nombre
        jour: attributionData.jour,
        creneau: attributionData.creneau,
        dateExpiration: dateExpiration.toISOString()
      };

      console.log('Données envoyées pour attribution temporaire:', dataToSend);

      const response = await axios.post(
        'http://localhost:3832/api/emplois/attribuer-temporaire',
        dataToSend,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000 // 10 secondes de timeout
        }
      );

      console.log('Réponse serveur:', response.data);
      console.log('=== SUCCÈS ATTRIBUTION ===');

      showNotification('Créneau attribué temporairement avec succès', 'success');
      setModalAttribution(false);
      chargerAttributionsTemporaires();
      analyserCreneauxLibres();
    } catch (error) {
      console.error('=== ERREUR ATTRIBUTION CÔTÉ CLIENT ===');
      console.error('Error object:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Request data:', error.config?.data);
      console.error('=== FIN ERREUR CLIENT ===');
      
      const message = error.response?.data?.message || 'Erreur lors de l\'attribution temporaire';
      showNotification(message, 'error');
    }
  };

  // Supprimer une attribution temporaire
  const supprimerAttributionTemporaire = async (attributionId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:3832/api/emplois/attributions-temporaires/${attributionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      showNotification('Attribution temporaire supprimée', 'success');
      chargerAttributionsTemporaires();
      analyserCreneauxLibres();
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const StatistiquesCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          Gestion des créneaux libres
        </h2>
        <p className="text-gray-600">
          Visualisez et gérez les créneaux disponibles pour optimiser l'utilisation des ressources
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres d'analyse
          </h3>
          <button
            onClick={analyserCreneauxLibres}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Analyser
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jour
            </label>
            <select
              value={filtres.jour}
              onChange={(e) => setFiltres({...filtres, jour: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les jours</option>
              {jours.map(jour => (
                <option key={jour} value={jour}>{jour}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Créneau
            </label>
            <select
              value={filtres.creneau}
              onChange={(e) => setFiltres({...filtres, creneau: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les créneaux</option>
              {creneaux.map(creneau => (
                <option key={creneau} value={creneau}>{creneau}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de ressource
            </label>
            <select
              value={filtres.type}
              onChange={(e) => setFiltres({...filtres, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="tous">Tous</option>
              <option value="professeurs">Professeurs uniquement</option>
              <option value="salles">Salles uniquement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {creneauxLibres.statistiques && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatistiquesCard
            title="Professeurs disponibles"
            value={creneauxLibres.statistiques.totalProfsLibres || 0}
            icon={Users}
            color="text-blue-600"
            description={`Sur ${professeurs.length} professeurs`}
          />
          <StatistiquesCard
            title="Salles disponibles"
            value={creneauxLibres.statistiques.totalSallesLibres || 0}
            icon={MapPin}
            color="text-green-600"
            description={`Sur ${salles.length} salles`}
          />
          <StatistiquesCard
            title="Créneaux libres"
            value={creneauxLibres.statistiques.totalCreneauxLibres || 0}
            icon={Clock}
            color="text-purple-600"
            description="Créneaux disponibles"
          />
          <StatistiquesCard
            title="Taux d'utilisation"
            value={`${creneauxLibres.statistiques.tauxUtilisation || 0}%`}
            icon={TrendingUp}
            color="text-orange-600"
            description="Ressources utilisées"
          />
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'vue-globale', label: 'Vue globale', icon: BarChart3 },
              { id: 'professeurs', label: 'Professeurs libres', icon: Users },
              { id: 'salles', label: 'Salles libres', icon: MapPin },
              { id: 'attributions-temporaires', label: 'Attributions temporaires', icon: Timer },
              { id: 'optimisation', label: 'Suggestions', icon: TrendingUp }
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
          {/* Vue globale */}
          {activeTab === 'vue-globale' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grille des créneaux libres */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Disponibilité par créneau
                  </h4>
                  <div className="space-y-3">
                    {jours.map(jour => (
                      <div key={jour} className="bg-white rounded p-3">
                        <div className="font-medium text-sm text-gray-700 mb-2">{jour}</div>
                        <div className="grid grid-cols-3 gap-2">
                          {creneaux.map(creneau => {
                            const disponibles = creneauxLibres.statistiques.parCreneau?.[jour]?.[creneau] || 0;
                            const total = professeurs.length + salles.length;
                            const pourcentage = total > 0 ? Math.round((disponibles / total) * 100) : 0;
                            
                            return (
                              <div key={creneau} className="text-center">
                                <div className="text-xs text-gray-600 mb-1">
                                  {creneau.split(' - ')[0]}
                                </div>
                                <div className={`text-sm font-medium ${
                                  pourcentage > 70 ? 'text-green-600' :
                                  pourcentage > 40 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {pourcentage}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ressources les plus disponibles */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Ressources les plus disponibles
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Professeurs</div>
                      {filtrerCreneaux(creneauxLibres.professeurs || []).slice(0, 3).map(prof => (
                        <div key={prof._id} className="flex justify-between items-center py-1">
                          <span className="text-sm">{prof.nom} {prof.prenom}</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {prof.disponibilite.reduce((acc, d) => acc + d.creneaux.length, 0)} créneaux
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Salles</div>
                      {filtrerCreneaux(creneauxLibres.salles || []).slice(0, 3).map(salle => (
                        <div key={salle._id} className="flex justify-between items-center py-1">
                          <span className="text-sm">{salle.nom} ({salle.type})</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {salle.disponibilite.reduce((acc, d) => acc + d.creneaux.length, 0)} créneaux
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Professeurs libres */}
          {activeTab === 'professeurs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800">
                  Professeurs disponibles ({filtrerCreneaux(creneauxLibres.professeurs || []).length})
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrerCreneaux(creneauxLibres.professeurs || []).map(prof => (
                  <div key={prof._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-gray-800">
                          {prof.nom} {prof.prenom}
                        </div>
                        <div className="text-sm text-gray-600">
                          {prof.disponibilite.reduce((acc, d) => acc + d.creneaux.length, 0)} créneaux libres
                        </div>
                      </div>
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    
                    <div className="space-y-2">
                      {prof.disponibilite.map(dispo => (
                        <div key={dispo.jour} className="text-sm">
                          <div className="font-medium text-gray-700">{dispo.jour}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dispo.creneaux.map(creneau => (
                              <button
                                key={creneau}
                                onClick={() => ouvrirModalAttribution(prof, null, dispo.jour, creneau)}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center"
                                title="Attribuer temporairement"
                              >
                                {creneau.split(' - ')[0]}
                                <CalendarPlus className="w-3 h-3 ml-1" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salles libres */}
          {activeTab === 'salles' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800">
                  Salles disponibles ({filtrerCreneaux(creneauxLibres.salles || []).length})
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrerCreneaux(creneauxLibres.salles || []).map(salle => (
                  <div key={salle._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-gray-800">{salle.nom}</div>
                        <div className="text-sm text-gray-600">
                          {salle.type} • {salle.disponibilite.reduce((acc, d) => acc + d.creneaux.length, 0)} créneaux libres
                        </div>
                      </div>
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    
                    <div className="space-y-2">
                      {salle.disponibilite.map(dispo => (
                        <div key={dispo.jour} className="text-sm">
                          <div className="font-medium text-gray-700">{dispo.jour}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dispo.creneaux.map(creneau => (
                              <button
                                key={creneau}
                                onClick={() => ouvrirModalAttribution(null, salle, dispo.jour, creneau)}
                                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors flex items-center"
                                title="Attribuer temporairement"
                              >
                                {creneau.split(' - ')[0]}
                                <CalendarPlus className="w-3 h-3 ml-1" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nouvel onglet : Attributions temporaires */}
          {activeTab === 'attributions-temporaires' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Timer className="w-5 h-5 mr-2" />
                  Attributions temporaires ({attributionsTemporaires.length})
                </h4>
                <div className="text-sm text-gray-600">
                  Les attributions expirent automatiquement après 7 jours
                </div>
              </div>

              {attributionsTemporaires.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Aucune attribution temporaire</p>
                  <p className="text-sm text-gray-500">
                    Utilisez les onglets "Professeurs libres" ou "Salles libres" pour attribuer des créneaux
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attributionsTemporaires.map(attribution => {
                    const joursRestants = Math.ceil((new Date(attribution.dateExpiration) - new Date()) / (1000 * 60 * 60 * 24));
                    const estExpireSoon = joursRestants <= 2;
                    
                    return (
                      <div key={attribution._id} className={`rounded-lg p-4 border-2 ${
                        estExpireSoon ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Timer className={`w-5 h-5 mr-2 ${estExpireSoon ? 'text-red-600' : 'text-blue-600'}`} />
                            <div className="font-medium text-gray-800">
                              {attribution.jour} - {attribution.creneau.split(' - ')[0]}
                            </div>
                          </div>
                          <button
                            onClick={() => supprimerAttributionTemporaire(attribution._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer l'attribution"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">{attribution.cours?.nom_matiere}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{attribution.professeur?.nom} {attribution.professeur?.prenom}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{attribution.salle?.nom}</span>
                          </div>

                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{attribution.programme?.nom} - Groupe {attribution.groupe}</span>
                          </div>

                          <div className={`text-xs mt-3 px-2 py-1 rounded ${
                            estExpireSoon ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {joursRestants > 0 ? `Expire dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}` : 'Expiré'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Suggestions d'optimisation */}
          {activeTab === 'optimisation' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Suggestions d'optimisation
                </h4>
                
                <div className="space-y-4">
                  {creneauxLibres.statistiques.suggestions?.map((suggestion, index) => (
                    <div key={index} className="bg-white rounded p-4 border border-blue-200">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-800">{suggestion.titre}</div>
                          <div className="text-sm text-blue-700 mt-1">{suggestion.description}</div>
                          {suggestion.action && (
                            <button className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                              {suggestion.action}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-blue-700">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                      <p className="font-medium">Optimisation excellente !</p>
                      <p className="text-sm">Votre utilisation des ressources est déjà bien optimisée.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'attribution temporaire */}
      {modalAttribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <CalendarPlus className="w-5 h-5 mr-2" />
                Attribution temporaire
              </h3>
              <button
                onClick={() => setModalAttribution(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="text-sm text-blue-800">
                  <strong>Créneau :</strong> {attributionData.jour} - {attributionData.creneau}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Cette attribution sera automatiquement supprimée dans 7 jours
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programme
                </label>
                <select
                  value={attributionData.programme}
                  onChange={(e) => {
                    const programmeId = e.target.value;
                    setAttributionData({
                      ...attributionData, 
                      programme: programmeId,
                      groupe: '' // Reset du groupe quand on change de programme
                    });
                    chargerGroupesProgramme(programmeId); // Charger les groupes du programme
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un programme</option>
                  {programmes.map(prog => (
                    <option key={prog._id} value={prog._id}>{prog.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Groupe
                </label>
                <select
                  value={attributionData.groupe}
                  onChange={(e) => setAttributionData({...attributionData, groupe: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  disabled={!attributionData.programme}
                >
                  <option value="">Sélectionner un groupe</option>
                  {groupesDisponibles.map(groupe => (
                    <option key={groupe} value={groupe}>Groupe {groupe}</option>
                  ))}
                </select>
                {!attributionData.programme && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sélectionnez d'abord un programme
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cours
                </label>
                <select
                  value={attributionData.cours}
                  onChange={(e) => setAttributionData({...attributionData, cours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  disabled={!attributionData.programme}
                >
                  <option value="">Sélectionner un cours</option>
                  {cours.filter(c => !attributionData.programme || c.id_programme?._id === attributionData.programme).map(c => (
                    <option key={c._id} value={c._id}>{c.nom_matiere}</option>
                  ))}
                </select>
                {!attributionData.programme && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sélectionnez d'abord un programme
                  </p>
                )}
              </div>

              {!attributionData.professeur && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professeur
                  </label>
                  <select
                    value={attributionData.professeur}
                    onChange={(e) => setAttributionData({...attributionData, professeur: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner un professeur</option>
                    {professeurs.map(prof => (
                      <option key={prof._id} value={prof._id}>{prof.nom} {prof.prenom}</option>
                    ))}
                  </select>
                </div>
              )}

              {!attributionData.salle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salle
                  </label>
                  <select
                    value={attributionData.salle}
                    onChange={(e) => setAttributionData({...attributionData, salle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner une salle</option>
                    {salles.map(salle => (
                      <option key={salle._id} value={salle._id}>{salle.nom} ({salle.type})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setModalAttribution(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={attribuerCreneauTemporaire}
                disabled={!attributionData.cours || !attributionData.professeur || !attributionData.salle || !attributionData.programme || !attributionData.groupe}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Attribuer (7 jours)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreneauxLibres; 