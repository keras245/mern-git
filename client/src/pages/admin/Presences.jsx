import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Save,
  X,
  TrendingUp,
  BarChart3,
  RefreshCw,
  MessageSquare,
  CheckSquare,
  Info,
  MapPin,
  BookOpen,
  Building,
  UserCheck,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';

const AdminPresences = () => {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [seancesJour, setSeancesJour] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPresence, setEditingPresence] = useState(null);
  const [viewMode, setViewMode] = useState('global'); // 'global', 'details', 'stats'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour les statistiques globales
  const [statsGlobales, setStatsGlobales] = useState({
    totalClasses: 0,
    totalSeances: 0,
    totalPresents: 0,
    totalAbsents: 0,
    totalRetards: 0,
    tauxPresenceGlobal: 0
  });

  // États pour la vue détaillée par classe
  const [presencesParClasse, setPresencesParClasse] = useState([]);
  const [expandedClasses, setExpandedClasses] = useState(new Set());

  // Ajouter un état pour les groupes disponibles
  const [groupesDisponibles, setGroupesDisponibles] = useState([]);

  useEffect(() => {
    chargerProgrammes();
    if (viewMode === 'global') {
      chargerStatsGlobales();
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    if (selectedProgramme && selectedGroupe && viewMode === 'details') {
      chargerSeancesClasse();
    }
  }, [selectedProgramme, selectedGroupe, selectedDate, viewMode]);

  useEffect(() => {
    if (selectedProgramme && viewMode === 'details') {
      chargerGroupesProgramme();
    } else {
      setGroupesDisponibles([]);
      setSelectedGroupe('');
    }
  }, [selectedProgramme, viewMode]);

  const chargerProgrammes = async () => {
    try {
      const response = await api.get('/programmes');
      setProgrammes(response.data);
    } catch (error) {
      console.error('Erreur chargement programmes:', error);
      setError('Erreur lors du chargement des programmes');
    }
  };

  const chargerStatsGlobales = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/presences/stats/globales/${selectedDate}`);
      console.log('Stats globales:', response.data);
      
      setStatsGlobales(response.data.stats);
      setPresencesParClasse(response.data.presencesParClasse || []);

    } catch (error) {
      console.error('Erreur chargement stats globales:', error);
      setError('Erreur lors du chargement des statistiques');
      setStatsGlobales({
        totalClasses: 0,
        totalSeances: 0,
        totalPresents: 0,
        totalAbsents: 0,
        totalRetards: 0,
        tauxPresenceGlobal: 0
      });
      setPresencesParClasse([]);
    } finally {
      setLoading(false);
    }
  };

  const chargerSeancesClasse = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(`/presences/emploi/${selectedDate}/${selectedProgramme}/${selectedGroupe}`);
      setSeancesJour(response.data.seances || []);

    } catch (error) {
      console.error('Erreur chargement séances:', error);
      if (error.response?.status === 404) {
        setError('Aucun emploi du temps trouvé pour cette classe à cette date.');
      } else {
        setError('Erreur lors du chargement des séances');
      }
      setSeancesJour([]);
    } finally {
      setLoading(false);
    }
  };

  const chargerGroupesProgramme = async () => {
    try {
      setError('');
      const response = await api.get(`/emplois/groupes/${selectedProgramme}`);
      console.log('Groupes récupérés:', response.data);
      setGroupesDisponibles(response.data.groupes || []);
      
      // Sélectionner automatiquement le premier groupe s'il existe
      if (response.data.groupes && response.data.groupes.length > 0) {
        setSelectedGroupe(response.data.groupes[0]);
      }
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
      setError('Erreur lors du chargement des groupes');
      setGroupesDisponibles([]);
    }
  };

  const modifierPresence = async (seanceId, statut, commentaire = '') => {
    try {
      setSaving(true);
      setError('');

      console.log('=== MODIFICATION PRÉSENCE FRONTEND ===');
      console.log('Paramètres:', { seanceId, statut, commentaire, date: selectedDate });

      // Utiliser la nouvelle route admin
      const response = await api.put(`/presences/admin/modifier`, {
        id_seance: seanceId,
        statut,
        commentaire,
        date: selectedDate
      });

      console.log('Réponse serveur:', response.data);

      setSuccess(response.data.message || 'Présence modifiée avec succès');
      
      // Recharger selon le mode
      if (viewMode === 'global') {
        chargerStatsGlobales();
      } else {
        chargerSeancesClasse();
      }
      
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Erreur modification présence:', error);
      console.error('Détails erreur:', error.response?.data);
      setError(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const sauvegarderPresence = async () => {
    if (!editingPresence) return;

    console.log('=== SAUVEGARDE PRÉSENCE ===');
    console.log('EditingPresence:', editingPresence);

    // Si pas de présence existante et pas de statut sélectionné, on ferme juste
    if (!editingPresence.presence && !editingPresence.nouveauStatut) {
      setShowModal(false);
      setEditingPresence(null);
      return;
    }

    // Si un statut est sélectionné, on modifie/crée
    if (editingPresence.nouveauStatut) {
      // Utiliser l'ID de la séance, pas l'ID de la présence
      await modifierPresence(
        editingPresence._id, // C'est l'ID de la séance
        editingPresence.nouveauStatut,
        editingPresence.nouveauCommentaire
      );
    }
    
    setShowModal(false);
    setEditingPresence(null);
  };

  const toggleExpandClasse = (classeId) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classeId)) {
      newExpanded.delete(classeId);
    } else {
      newExpanded.add(classeId);
    }
    setExpandedClasses(newExpanded);
  };

  const exporterDonnees = async () => {
    try {
      let url = `/presences/export/${selectedDate}`;
      if (viewMode === 'details' && selectedProgramme && selectedGroupe) {
        url += `/${selectedProgramme}/${selectedGroupe}`;
      }

      const response = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url2 = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url2;
      link.download = `presences_${selectedDate}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url2);
      
      setSuccess('Export réalisé avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur export:', error);
      setError('Erreur lors de l\'export');
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'présent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'retard': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'présent': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'retard': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSeances = seancesJour.filter(seance =>
    seance.cours?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seance.professeur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seance.salle?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ouvrirModalPresence = (seance) => {
    console.log('=== OUVERTURE MODAL ===');
    console.log('Séance reçue:', seance);
    
    setEditingPresence({
      ...seance,
      nouveauStatut: seance.presence?.statut || '',
      nouveauCommentaire: seance.presence?.commentaire || ''
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestion des Présences
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Vue d'ensemble et gestion des présences de toutes les classes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sélecteur de mode */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('global')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'global' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Vue globale
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'details' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Détails classe
            </button>
          </div>

          {/* Date */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Export */}
          <button
            onClick={exporterDonnees}
            className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>

          {/* Actualiser */}
          <button
            onClick={() => viewMode === 'global' ? chargerStatsGlobales() : chargerSeancesClasse()}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </motion.div>

      {/* Messages d'état */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg"
          >
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vue globale */}
      {viewMode === 'global' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Classes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsGlobales.totalClasses}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Séances</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsGlobales.totalSeances}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Présents</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statsGlobales.totalPresents}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absents</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statsGlobales.totalAbsents}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Retards</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statsGlobales.totalRetards}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux global</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statsGlobales.tauxPresenceGlobal}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Liste des classes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Présences par classe</h3>
              <p className="text-gray-600 dark:text-gray-400">Détails des présences pour chaque classe</p>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
                </div>
              ) : presencesParClasse.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Aucune donnée de présence pour cette date</p>
                </div>
              ) : (
                presencesParClasse.map((classe) => (
                  <div key={classe._id} className="p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleExpandClasse(classe._id)}
                    >
                      <div className="flex items-center space-x-4">
                        {expandedClasses.has(classe._id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {classe.nom} - L{classe.licence} S{classe.semestre} G{classe.groupe}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {classe.totalSeances} séance(s) programmée(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {classe.presents}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                            <XCircle className="w-3 h-3 mr-1" />
                            {classe.absents}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {classe.retards}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {classe.tauxPresence}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Taux présence</p>
                        </div>
                      </div>
                    </div>

                    {/* Détails de la classe */}
                    <AnimatePresence>
                      {expandedClasses.has(classe._id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 ml-9 space-y-3"
                        >
                          {classe.seances?.map((seance) => (
                            <div
                              key={seance._id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900 dark:text-white">{seance.creneau}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">{seance.cours?.nom}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    <span className="flex items-center">
                                      <Users className="w-4 h-4 mr-1" />
                                      {seance.professeur?.nom}
                                    </span>
                                    <span className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {seance.salle?.nom}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                {seance.presence ? (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatutBadge(seance.presence.statut)}`}>
                                    {getStatutIcon(seance.presence.statut)}
                                    <span className="ml-1 capitalize">{seance.presence.statut}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Non déclarée
                                  </span>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    ouvrirModalPresence(seance);
                                  }}
                                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Vue détaillée par classe */}
      {viewMode === 'details' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Sélecteurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Programme
              </label>
              <select
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un programme</option>
                {programmes.map((programme) => (
                  <option key={programme._id} value={programme._id}>
                    {programme.nom} - L{programme.licence} S{programme.semestre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Groupe
              </label>
              <select
                value={selectedGroupe}
                onChange={(e) => setSelectedGroupe(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                disabled={!selectedProgramme}
              >
                <option value="">Sélectionner un groupe</option>
                {groupesDisponibles.map((groupe) => (
                  <option key={groupe} value={groupe}>
                    Groupe {groupe}
                  </option>
                ))}
              </select>
              {!selectedProgramme && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sélectionnez d'abord un programme
                </p>
              )}
            </div>
          </div>

          {/* Recherche */}
          {selectedProgramme && selectedGroupe && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un cours, professeur ou salle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Liste des séances */}
          {selectedProgramme && selectedGroupe && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Séances du {new Date(selectedDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Chargement des séances...</p>
                  </div>
                ) : filteredSeances.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm ? 'Aucune séance trouvée' : 'Aucune séance programmée pour cette date'}
                    </p>
                  </div>
                ) : (
                  filteredSeances.map((seance) => (
                    <div
                      key={seance._id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{seance.cours?.nom}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {seance.creneau}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {seance.professeur?.nom}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {seance.salle?.nom}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {seance.presence ? (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatutBadge(seance.presence.statut)}`}>
                              {getStatutIcon(seance.presence.statut)}
                              <span className="ml-2 capitalize">{seance.presence.statut}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-500">
                              <Clock className="w-4 h-4 mr-2" />
                              Non déclarée
                            </span>
                          )}

                          <button
                            onClick={() => ouvrirModalPresence(seance)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {seance.presence?.commentaire && (
                        <div className="mt-3 ml-16">
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <MessageSquare className="w-4 h-4 inline mr-2" />
                              {seance.presence.commentaire}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal de modification de présence */}
      <AnimatePresence>
        {showModal && editingPresence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingPresence?.presence ? 'Modifier la présence' : 'Consulter la séance'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{editingPresence?.cours?.nom}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {editingPresence?.creneau} • {editingPresence?.professeur?.nom} • {editingPresence?.salle?.nom}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut {editingPresence?.presence ? '(actuel)' : '(à définir)'}
                  </label>
                  <select
                    value={editingPresence?.nouveauStatut || ''}
                    onChange={(e) => setEditingPresence({
                      ...editingPresence,
                      nouveauStatut: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      {editingPresence?.presence ? 'Sélectionner un nouveau statut' : 'Aucune présence déclarée'}
                    </option>
                    <option value="présent">Présent</option>
                    <option value="absent">Absent</option>
                    <option value="retard">Retard</option>
                  </select>
                  {!editingPresence?.presence && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      ⚠️ Cette action créera une nouvelle présence. Normalement, seul le chef de classe peut déclarer les présences.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commentaire
                  </label>
                  <textarea
                    value={editingPresence?.nouveauCommentaire || ''}
                    onChange={(e) => setEditingPresence({
                      ...editingPresence,
                      nouveauCommentaire: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={editingPresence?.presence 
                      ? "Modifier le commentaire..." 
                      : "Ajouter un commentaire (optionnel)..."
                    }
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Fermer
                  </button>
                  
                  {(editingPresence?.presence || editingPresence?.nouveauStatut) && (
                    <button
                      onClick={sauvegarderPresence}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-2 inline" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2 inline" />
                          {editingPresence?.presence ? 'Modifier' : 'Créer'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPresences; 