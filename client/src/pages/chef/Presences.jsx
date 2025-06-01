import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
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
  Users,
  TrendingUp,
  BarChart3,
  RefreshCw,
  MessageSquare,
  CheckSquare,
  Info,
  MapPin,
  BookOpen
} from 'lucide-react';
import api from '../../services/api';

const Presences = () => {
  const [seancesJour, setSeancesJour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [programme, setProgramme] = useState(null);
  const [classeInfo, setClasseInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPresence, setEditingPresence] = useState(null);
  const [stats, setStats] = useState({
    totalPresences: 0,
    presents: 0,
    absents: 0,
    retards: 0,
    enAttente: 0,
    tauxPresence: 0
  });
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    chargerProgrammeChef();
  }, []);

  useEffect(() => {
    if (programme && classeInfo) {
      chargerDonnees();
    }
  }, [selectedDate, programme, classeInfo]);

  // Fonction pour parser la classe du chef et extraire les composants
  const parseClasseChef = (classeString) => {
    if (!classeString) return null;
    
    console.log('Analyse de la classe:', classeString);
    
    // Format attendu: "Génie Civil - L4 S7 G1"
    const regex = /^(.+?)\s*-\s*L(\d+)\s*S(\d+)\s*G(\d+)$/;
    const match = classeString.match(regex);
    
    if (match) {
      return {
        nom: match[1].trim(),
        licence: parseInt(match[2]),
        semestre: parseInt(match[3]),
        groupe: parseInt(match[4])
      };
    }
    
    console.log('Format de classe non reconnu:', classeString);
    return null;
  };

  // Fonction pour trouver le programme correspondant
  const trouverProgrammeCorrespondant = (programmes, classeInfo) => {
    if (!classeInfo || !programmes) return null;
    
    console.log('Recherche du programme pour:', classeInfo);
    
    const programme = programmes.find(p => 
      p.nom === classeInfo.nom &&
      p.licence === classeInfo.licence &&
      p.semestre === classeInfo.semestre &&
      p.groupe >= classeInfo.groupe
    );
    
    console.log('Programme trouvé:', programme);
    return programme;
  };

  const chargerProgrammeChef = async () => {
    try {
      setError('');
      
      if (!user.classe) {
        setError('Votre classe n\'est pas définie. Contactez l\'administration.');
        return;
      }

      // 1. Parser la classe du chef
      const classeInfoParsed = parseClasseChef(user.classe);
      if (!classeInfoParsed) {
        setError(`Format de classe invalide: "${user.classe}". Format attendu: "Programme - L# S# G#"`);
        return;
      }

      setClasseInfo(classeInfoParsed);

      // 2. Récupérer tous les programmes
      const programmesResponse = await api.get('/programmes');
      console.log('Programmes récupérés:', programmesResponse.data);

      // 3. Trouver le programme correspondant
      const programmeCorrespondant = trouverProgrammeCorrespondant(programmesResponse.data, classeInfoParsed);

      if (!programmeCorrespondant) {
        setError(`Aucun programme trouvé pour "${classeInfoParsed.nom}" niveau L${classeInfoParsed.licence} S${classeInfoParsed.semestre}. Contactez l'administration.`);
        return;
      }

      console.log('Programme correspondant trouvé:', programmeCorrespondant);
      setProgramme(programmeCorrespondant);

    } catch (error) {
      console.error('Erreur chargement programme:', error);
      setError('Erreur lors du chargement du programme');
    }
  };

  const chargerDonnees = async () => {
    if (!programme || !classeInfo) return;

    try {
      setLoading(true);
      setError('');

      console.log('Chargement présences pour:', { 
        date: selectedDate, 
        programme: programme._id, 
        groupe: classeInfo.groupe 
      });

      // Charger l'emploi du temps et les présences pour la date sélectionnée
      const response = await api.get(`/presences/emploi/${selectedDate}/${programme._id}/${classeInfo.groupe}`);
      
      console.log('Réponse emploi et présences:', response.data);
      setSeancesJour(response.data.seances || []);
      
      // Calculer les statistiques
      calculerStatistiques(response.data.seances || []);

    } catch (error) {
      console.error('Erreur chargement données:', error);
      if (error.response?.status === 404) {
        setError('Aucun emploi du temps trouvé pour votre classe à cette date.');
      } else {
        setError('Erreur lors du chargement des données');
      }
      setSeancesJour([]);
    } finally {
      setLoading(false);
    }
  };

  const calculerStatistiques = (seances) => {
    const total = seances.length;
    const presents = seances.filter(s => s.presence?.statut === 'présent').length;
    const absents = seances.filter(s => s.presence?.statut === 'absent').length;
    const retards = seances.filter(s => s.presence?.statut === 'retard').length;
    const enAttente = total - presents - absents - retards;
    const tauxPresence = total > 0 ? Math.round((presents / total) * 100) : 0;

    setStats({
      totalPresences: total,
      presents,
      absents,
      retards,
      enAttente,
      tauxPresence
    });
  };

  const declarerPresence = async (seance, statut, commentaire = '') => {
    try {
      setSaving(true);
      setError(''); // Reset error
      
      console.log('=== DÉCLARATION PRÉSENCE ===');
      console.log('Seance reçue:', seance);
      console.log('Statut:', statut);
      console.log('Programme:', programme);
      console.log('ClasseInfo:', classeInfo);
      
      // Vérification que nous avons toutes les données nécessaires
      if (!seance || !seance.professeur || !seance.cours) {
        throw new Error('Données de séance incomplètes');
      }
      
      if (!programme || !classeInfo) {
        throw new Error('Programme ou informations de classe manquantes');
      }
      
      const data = {
        date: selectedDate,
        statut,
        id_prof: seance.professeur._id,
        id_cours: seance.cours._id,
        nom_matiere: seance.cours?.nom || seance.cours?.nom_matiere,
        creneau: seance.creneau,
        salle: seance.salle?.nom,
        type_cours: seance.cours.type,
        id_programme: programme._id,
        nom_programme: programme.nom,
        groupe: classeInfo.groupe,
        commentaire: commentaire || '',
        heure_arrivee: statut === 'présent' ? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null
      };

      console.log('Données à envoyer:', data);

      const response = await api.post('/presences/creer-maj', data);
      console.log('Réponse API:', response.data);
      
      // Recharger les données
      await chargerDonnees();
      
      // Fermer la modal si elle est ouverte
      if (showModal) {
        setShowModal(false);
        setEditingPresence(null);
      }

      console.log('Présence déclarée avec succès');

    } catch (error) {
      console.error('=== ERREUR DÉCLARATION PRÉSENCE ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
        
        // Afficher l'erreur spécifique du serveur
        const serverMessage = error.response.data?.message || error.response.data || 'Erreur serveur inconnue';
        setError(`Erreur serveur: ${serverMessage}`);
      } else if (error.request) {
        console.error('Request:', error.request);
        setError('Erreur de connexion: Aucune réponse du serveur');
      } else {
        console.error('Setup Error:', error.message);
        setError(`Erreur: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const ouvrirModalPresence = (seanceData) => {
    setEditingPresence({
      ...seanceData,
      nouveauStatut: seanceData.presence?.statut || '',
      nouveauCommentaire: seanceData.presence?.commentaire || ''
    });
    setShowModal(true);
  };

  const sauvegarderPresence = () => {
    if (!editingPresence.nouveauStatut) {
      setError('Veuillez sélectionner un statut de présence');
      return;
    }

    declarerPresence(editingPresence, editingPresence.nouveauStatut, editingPresence.nouveauCommentaire);
    setShowModal(false);
    setEditingPresence(null);
  };

  const handleQuickPresence = (seanceData, statut) => {
    console.log('=== QUICK PRESENCE DEBUG ===');
    console.log('SeanceData structure:', seanceData);
    console.log('Professeur:', seanceData.professeur);
    console.log('Cours:', seanceData.cours);
    console.log('Salle:', seanceData.salle);
    
    declarerPresence(seanceData, statut);
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'présent':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'retard':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'présent':
        return <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Présent</span>;
      case 'absent':
        return <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Absent</span>;
      case 'retard':
        return <span className="px-3 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">Retard</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">En attente</span>;
    }
  };

  const exporterPresences = async () => {
    try {
      if (seancesJour.length === 0) {
        alert('Aucune donnée à exporter');
        return;
      }

      // Générer un CSV des présences
      const headers = ['Date', 'Créneau', 'Matière', 'Professeur', 'Salle', 'Statut', 'Heure arrivée', 'Commentaire'];
      const rows = seancesJour.map(s => [
        selectedDate,
        s.creneau,
        s.cours?.nom,
        s.professeur?.nom,
        s.salle?.nom,
        s.presence?.statut || 'En attente',
        s.presence?.heure_arrivee || '-',
        s.presence?.commentaire || '-'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `presences-${user.classe.replace(/\s+/g, '-')}-${selectedDate}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Erreur export:', error);
      setError('Erreur lors de l\'export');
    }
  };

  const seancesFiltrees = seancesJour.filter(s =>
    s.cours?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.professeur?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !programme) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Chargement de votre programme...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestion des présences
            </h1>
            <p className="text-gray-600">
              Enregistrez les présences des enseignants pour la classe {user.classe}
            </p>
            {programme && classeInfo && (
              <p className="text-sm text-gray-500 mt-1">
                Programme : {programme.nom} - Licence {programme.licence} Semestre {programme.semestre} - Groupe {classeInfo.groupe}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={chargerDonnees}
              disabled={loading || !programme}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            
            <button
              onClick={exporterPresences}
              disabled={seancesJour.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Message d'erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Erreur
              </h3>
              <p className="text-red-700 mb-3">{error}</p>
              <div className="text-sm text-red-600 bg-red-100 rounded-lg p-3 mb-3">
                <strong>Informations de débogage :</strong><br />
                Classe enregistrée : <code>{user.classe}</code><br />
                Format attendu : <code>Programme - L# S# G#</code>
              </div>
              <button
                onClick={chargerProgrammeChef}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {programme && classeInfo && (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total cours</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPresences}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Présents</p>
                  <p className="text-2xl font-bold text-green-600">{stats.presents}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absents</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absents}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Retards</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.retards}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux présence</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.tauxPresence}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </motion.div>
          </div>

          {/* Filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un cours ou un professeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64"
                />
              </div>
            </div>
          </motion.div>

          {/* Liste des cours du jour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Cours du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Chargement des cours...</span>
              </div>
            ) : seancesFiltrees.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun cours programmé
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Aucun cours ne correspond à votre recherche.'
                    : 'Il n\'y a pas de cours programmé pour cette date.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {seancesFiltrees.map((seanceData, index) => (
                  <motion.div
                    key={`${seanceData.creneau}-${seanceData.professeur.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {seanceData.cours?.nom?.charAt(0) || 'C'}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{seanceData.cours?.nom}</h4>
                        <p className="text-sm text-gray-600">{seanceData.professeur?.nom}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{seanceData.creneau}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>Salle {seanceData.salle?.nom}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{seanceData.cours?.type || 'Cours'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Statut actuel */}
                      <div className="flex items-center space-x-2">
                        {seanceData.presence && (
                          <div className="flex flex-col items-end">
                            {getStatutBadge(seanceData.presence.statut)}
                            {seanceData.presence.heure_arrivee && (
                              <span className="text-xs text-gray-500 mt-1">
                                Arrivé à {seanceData.presence.heure_arrivee}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions rapides */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuickPresence(seanceData, 'présent')}
                          disabled={saving}
                          className={`p-2 rounded-lg transition-all ${
                            seanceData.presence?.statut === 'présent'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 hover:bg-green-100 text-gray-600 hover:text-green-600'
                          }`}
                          title="Marquer présent"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => handleQuickPresence(seanceData, 'absent')}
                          disabled={saving}
                          className={`p-2 rounded-lg transition-all ${
                            seanceData.presence?.statut === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600'
                          }`}
                          title="Marquer absent"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => handleQuickPresence(seanceData, 'retard')}
                          disabled={saving}
                          className={`p-2 rounded-lg transition-all ${
                            seanceData.presence?.statut === 'retard'
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-200 hover:bg-orange-100 text-gray-600 hover:text-orange-600'
                          }`}
                          title="Marquer en retard"
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => ouvrirModalPresence(seanceData)}
                          disabled={saving}
                          className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg transition-all"
                          title="Plus d'options"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Modal de présence détaillée */}
      <AnimatePresence>
        {showModal && editingPresence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Déclarer la présence
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingPresence(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Informations du cours */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {editingPresence.cours?.nom}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Professeur : {editingPresence.professeur?.nom}
                  </p>
                  <p className="text-sm text-gray-600">
                    Créneau : {editingPresence.creneau}
                  </p>
                  <p className="text-sm text-gray-600">
                    Salle : {editingPresence.salle?.nom}
                  </p>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut de présence *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setEditingPresence({
                        ...editingPresence,
                        nouveauStatut: 'présent'
                      })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        editingPresence.nouveauStatut === 'présent'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Présent</span>
                    </button>
                    
                    <button
                      onClick={() => setEditingPresence({
                        ...editingPresence,
                        nouveauStatut: 'absent'
                      })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        editingPresence.nouveauStatut === 'absent'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <XCircle className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Absent</span>
                    </button>
                    
                    <button
                      onClick={() => setEditingPresence({
                        ...editingPresence,
                        nouveauStatut: 'retard'
                      })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        editingPresence.nouveauStatut === 'retard'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Retard</span>
                    </button>
                  </div>
                </div>

                {/* Commentaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={editingPresence.nouveauCommentaire || ''}
                    onChange={(e) => setEditingPresence({
                      ...editingPresence,
                      nouveauCommentaire: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Ex: Justification d'absence, retard signalé, remarques..."
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingPresence(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={sauvegarderPresence}
                    disabled={!editingPresence.nouveauStatut || saving}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Presences; 