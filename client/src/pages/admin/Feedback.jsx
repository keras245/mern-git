import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Eye,
  Reply,
  Trash2,
  Filter,
  Search,
  Calendar,
  User,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  X,
  TrendingUp,
  BarChart,
  Users,
  MessageCircle,
  PieChart,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Star,
  Flag
} from "lucide-react";
import api from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtres, setFiltres] = useState({
    statut: 'tous',
    type: 'tous',
    priorite: 'tous',
    date: '',
    recherche: ''
  });
  const [feedbackSelectionne, setFeedbackSelectionne] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReponse, setModalReponse] = useState(false);
  const [reponse, setReponse] = useState('');
  const [envoyantReponse, setEnvoyantReponse] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    envoyes: 0,
    brouillons: 0,
    traites: 0,
    reponses: 0
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pageActuelle, setPageActuelle] = useState(1);
  const [feedbacksParPage] = useState(10);
  
  const { showNotification } = useNotification();

  useEffect(() => {
    chargerFeedbacks();
    chargerStatistiques();
  }, []);

  const chargerFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedbacks');
      console.log('Feedbacks reçus:', response.data);
      setFeedbacks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur chargement feedbacks:', error);
      setFeedbacks([]);
      showNotification('Erreur lors du chargement des feedbacks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const chargerStatistiques = async () => {
    try {
      const response = await api.get('/feedbacks/stats/global');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      // Si l'endpoint n'existe pas, calculer les stats localement
      calculerStatsLocales();
    }
  };

  const calculerStatsLocales = () => {
    const total = feedbacks.length;
    const envoyes = feedbacks.filter(f => f.statut === 'envoye').length;
    const brouillons = feedbacks.filter(f => f.statut === 'brouillon').length;
    const traites = feedbacks.filter(f => f.statut === 'traite').length;
    const reponses = feedbacks.filter(f => f.reponse && f.reponse.trim()).length;
    
    setStats({ total, envoyes, brouillons, traites, reponses });
  };

  // Recalculer les stats quand les feedbacks changent
  useEffect(() => {
    if (feedbacks.length > 0) {
      calculerStatsLocales();
    }
  }, [feedbacks]);

  const filtrerFeedbacks = () => {
    let resultat = [...feedbacks];

    // Filtre par statut
    if (filtres.statut !== 'tous') {
      resultat = resultat.filter(f => f.statut === filtres.statut);
    }

    // Filtre par type
    if (filtres.type !== 'tous') {
      resultat = resultat.filter(f => f.type === filtres.type);
    }

    // Filtre par priorité
    if (filtres.priorite !== 'tous') {
      resultat = resultat.filter(f => f.priorite === filtres.priorite);
    }

    // Filtre par date
    if (filtres.date) {
      const dateFiltre = new Date(filtres.date);
      resultat = resultat.filter(f => {
        const dateFeedback = new Date(f.date || f.createdAt);
        return dateFeedback.toDateString() === dateFiltre.toDateString();
      });
    }

    // Recherche textuelle
    if (filtres.recherche.trim()) {
      const termes = filtres.recherche.toLowerCase().trim();
      resultat = resultat.filter(f => 
        f.contenu.toLowerCase().includes(termes) ||
        (f.id_chef?.nom && f.id_chef.nom.toLowerCase().includes(termes)) ||
        (f.id_chef?.prenom && f.id_chef.prenom.toLowerCase().includes(termes)) ||
        (f.id_chef?.classe && f.id_chef.classe.toLowerCase().includes(termes)) ||
        (f.id_cours?.nom_matiere && f.id_cours.nom_matiere.toLowerCase().includes(termes))
      );
    }

    // Tri
    resultat.sort((a, b) => {
      let valeurA, valeurB;
      
      switch (sortBy) {
        case 'date':
          valeurA = new Date(a.date || a.createdAt);
          valeurB = new Date(b.date || b.createdAt);
          break;
        case 'statut':
          valeurA = a.statut;
          valeurB = b.statut;
          break;
        case 'priorite':
          const ordrepriorite = { 'faible': 1, 'normale': 2, 'elevee': 3, 'urgente': 4 };
          valeurA = ordrepriorite[a.priorite] || 0;
          valeurB = ordrepriorite[b.priorite] || 0;
          break;
        case 'chef':
          valeurA = a.id_chef?.nom || '';
          valeurB = b.id_chef?.nom || '';
          break;
        default:
          valeurA = a[sortBy] || '';
          valeurB = b[sortBy] || '';
      }

      if (sortOrder === 'asc') {
        return valeurA > valeurB ? 1 : -1;
      } else {
        return valeurA < valeurB ? 1 : -1;
      }
    });

    return resultat;
  };

  const feedbacksFiltres = filtrerFeedbacks();
  const indexDernierFeedback = pageActuelle * feedbacksParPage;
  const indexPremierFeedback = indexDernierFeedback - feedbacksParPage;
  const feedbacksActuels = feedbacksFiltres.slice(indexPremierFeedback, indexDernierFeedback);
  const nombrePages = Math.ceil(feedbacksFiltres.length / feedbacksParPage);

  const voirDetails = (feedback) => {
    setFeedbackSelectionne(feedback);
    setModalVisible(true);
    marquerCommeLu(feedback._id);
  };

  const marquerCommeLu = async (feedbackId) => {
    try {
      await api.put(`/feedbacks/${feedbackId}/lu`);
      // Mettre à jour le feedback dans la liste
      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackId ? { ...f, lu: true } : f
      ));
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const ouvrirModalReponse = (feedback) => {
    setFeedbackSelectionne(feedback);
    setReponse(feedback.reponse || '');
    setModalReponse(true);
  };

  const envoyerReponse = async () => {
    if (!reponse.trim()) {
      showNotification('Veuillez saisir une réponse', 'error');
      return;
    }

    try {
      setEnvoyantReponse(true);
      const response = await api.put(`/feedbacks/${feedbackSelectionne._id}/repondre`, {
        reponse: reponse.trim()
      });

      // Mettre à jour le feedback dans la liste
      setFeedbacks(prev => prev.map(f => 
        f._id === feedbackSelectionne._id 
          ? { ...f, reponse: reponse.trim(), statut: 'traite', repondu_par: 'admin', date_reponse: new Date() }
          : f
      ));

      setModalReponse(false);
      setReponse('');
      setFeedbackSelectionne(null);
      showNotification('Réponse envoyée avec succès', 'success');
      chargerStatistiques();
    } catch (error) {
      console.error('Erreur envoi réponse:', error);
      showNotification('Erreur lors de l\'envoi de la réponse', 'error');
    } finally {
      setEnvoyantReponse(false);
    }
  };

  const supprimerFeedback = async (feedbackId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce feedback ?')) {
      return;
    }

    try {
      await api.delete(`/feedbacks/${feedbackId}`);
      setFeedbacks(prev => prev.filter(f => f._id !== feedbackId));
      setModalVisible(false);
      setFeedbackSelectionne(null);
      showNotification('Feedback supprimé avec succès', 'success');
      chargerStatistiques();
    } catch (error) {
      console.error('Erreur suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const getStatutBadge = (statut) => {
    const configs = {
      'brouillon': { color: 'bg-gray-100 text-gray-700', icon: Clock },
      'envoye': { color: 'bg-blue-100 text-blue-700', icon: Send },
      'traite': { color: 'bg-green-100 text-green-700', icon: CheckCircle2 }
    };
    
    const config = configs[statut] || configs.envoye;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statut === 'brouillon' ? 'Brouillon' : 
         statut === 'envoye' ? 'Envoyé' : 'Traité'}
      </span>
    );
  };

  const getPrioriteBadge = (priorite) => {
    const configs = {
      'faible': { color: 'bg-green-100 text-green-700', icon: '●' },
      'normale': { color: 'bg-blue-100 text-blue-700', icon: '●' },
      'elevee': { color: 'bg-orange-100 text-orange-700', icon: '●' },
      'urgente': { color: 'bg-red-100 text-red-700', icon: '●' }
    };
    
    const config = configs[priorite] || configs.normale;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {priorite.charAt(0).toUpperCase() + priorite.slice(1)}
      </span>
    );
  };

  const exporterFeedbacks = () => {
    const dataExport = feedbacksFiltres.map(f => ({
      ID: f.id_feedback,
      Date: new Date(f.date || f.createdAt).toLocaleDateString('fr-FR'),
      Chef: `${f.id_chef?.prenom || ''} ${f.id_chef?.nom || ''}`,
      Classe: f.id_chef?.classe || '',
      Cours: f.id_cours?.nom_matiere || 'Général',
      Type: f.type,
      Priorité: f.priorite,
      Statut: f.statut,
      Contenu: f.contenu,
      Réponse: f.reponse || ''
    }));

    const csv = [
      Object.keys(dataExport[0]).join(','),
      ...dataExport.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedbacks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 dark:border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Gestion des Feedbacks
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Consultez et gérez tous les feedbacks des chefs de classe
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={chargerFeedbacks}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exporterFeedbacks}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter
            </motion.button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500', icon: MessageCircle },
            { label: 'Brouillons', value: stats.brouillons, color: 'bg-gray-500', icon: Clock },
            { label: 'Envoyés', value: stats.envoyes, color: 'bg-orange-500', icon: Send },
            { label: 'Traités', value: stats.traites, color: 'bg-green-500', icon: CheckCircle2 },
            { label: 'Réponses', value: stats.reponses, color: 'bg-purple-500', icon: Reply }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                    <IconComponent className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')} dark:opacity-80`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filtres.recherche}
                onChange={(e) => setFiltres(prev => ({ ...prev, recherche: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre statut */}
          <select
            value={filtres.statut}
            onChange={(e) => setFiltres(prev => ({ ...prev, statut: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="tous">Tous les statuts</option>
            <option value="brouillon">Brouillons</option>
            <option value="envoye">Envoyés</option>
            <option value="traite">Traités</option>
          </select>

          {/* Filtre type */}
          <select
            value={filtres.type}
            onChange={(e) => setFiltres(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="tous">Tous les types</option>
            <option value="general">Général</option>
            <option value="cours">Cours</option>
            <option value="technique">Technique</option>
            <option value="suggestion">Suggestion</option>
          </select>

          {/* Filtre priorité */}
          <select
            value={filtres.priorite}
            onChange={(e) => setFiltres(prev => ({ ...prev, priorite: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="tous">Toutes priorités</option>
            <option value="faible">Faible</option>
            <option value="normale">Normale</option>
            <option value="elevee">Élevée</option>
            <option value="urgente">Urgente</option>
          </select>

          {/* Filtre date */}
          <input
            type="date"
            value={filtres.date}
            onChange={(e) => setFiltres(prev => ({ ...prev, date: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Tri */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Trier par :</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="date">Date</option>
            <option value="statut">Statut</option>
            <option value="priorite">Priorité</option>
            <option value="chef">Chef de classe</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
          </button>
        </div>
      </motion.div>

      {/* Liste des feedbacks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
      >
        {feedbacksActuels.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">Aucun feedback trouvé</p>
            <p className="text-gray-400 dark:text-gray-500">
              {feedbacks.length === 0 
                ? "Aucun feedback n'a encore été envoyé"
                : "Modifiez vos filtres pour voir plus de résultats"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feedbacksFiltres.length} feedback{feedbacksFiltres.length !== 1 ? 's' : ''} trouvé{feedbacksFiltres.length !== 1 ? 's' : ''}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {pageActuelle} sur {nombrePages}
                </div>
              </div>

              <div className="space-y-4">
                {feedbacksActuels.map((feedback, index) => (
                  <motion.div
                    key={feedback._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                      !feedback.lu 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }`}
                    onClick={() => voirDetails(feedback)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {feedback.id_chef?.prenom} {feedback.id_chef?.nom}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {feedback.id_chef?.classe}
                          </span>
                          {!feedback.lu && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          {getStatutBadge(feedback.statut)}
                          {getPrioriteBadge(feedback.priorite)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            {feedback.type}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-2">
                          {feedback.contenu}
                        </p>

                        {feedback.id_cours && (
                          <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mb-2">
                            <BookOpen className="w-4 h-4" />
                            {feedback.id_cours.nom_matiere}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(feedback.date || feedback.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(feedback.date || feedback.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            voirDetails(feedback);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>

                        {(feedback.statut === 'envoye' || feedback.reponse) && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              ouvrirModalReponse(feedback);
                            }}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                            title="Répondre"
                          >
                            <Reply className="w-4 h-4" />
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            supprimerFeedback(feedback._id);
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {nombrePages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Affichage de {indexPremierFeedback + 1} à {Math.min(indexDernierFeedback, feedbacksFiltres.length)} sur {feedbacksFiltres.length}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPageActuelle(prev => Math.max(prev - 1, 1))}
                      disabled={pageActuelle === 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Précédent
                    </button>
                    
                    {[...Array(nombrePages)].map((_, i) => {
                      const numero = i + 1;
                      if (
                        numero === 1 || 
                        numero === nombrePages || 
                        (numero >= pageActuelle - 1 && numero <= pageActuelle + 1)
                      ) {
                        return (
                          <button
                            key={numero}
                            onClick={() => setPageActuelle(numero)}
                            className={`px-3 py-1 border rounded ${
                              pageActuelle === numero
                                ? 'bg-orange-500 dark:bg-orange-600 text-white border-orange-500 dark:border-orange-600'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {numero}
                          </button>
                        );
                      } else if (
                        (numero === pageActuelle - 2 && numero > 1) ||
                        (numero === pageActuelle + 2 && numero < nombrePages)
                      ) {
                        return <span key={numero} className="px-2 text-gray-500 dark:text-gray-400">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setPageActuelle(prev => Math.min(prev + 1, nombrePages))}
                      disabled={pageActuelle === nombrePages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modal détails feedback */}
      <AnimatePresence>
        {modalVisible && feedbackSelectionne && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setModalVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Détails du Feedback
                    </h3>
                    <div className="flex items-center gap-3">
                      {getStatutBadge(feedbackSelectionne.statut)}
                      {getPrioriteBadge(feedbackSelectionne.priorite)}
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {feedbackSelectionne.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalVisible(false)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Informations chef */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Informations du chef de classe</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Nom complet :</span>
                        <p className="font-medium text-gray-900 dark:text-white">{feedbackSelectionne.id_chef?.prenom} {feedbackSelectionne.id_chef?.nom}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Classe :</span>
                        <p className="font-medium text-gray-900 dark:text-white">{feedbackSelectionne.id_chef?.classe}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cours concerné */}
                  {feedbackSelectionne.id_cours && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cours concerné</h4>
                      <p className="text-blue-700 dark:text-blue-400 font-medium">{feedbackSelectionne.id_cours.nom_matiere}</p>
                    </div>
                  )}

                  {/* Contenu */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Contenu du feedback</h4>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {feedbackSelectionne.contenu}
                      </p>
                    </div>
                  </div>

                  {/* Réponse existante */}
                  {feedbackSelectionne.reponse && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Réponse de l'administration</h4>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-400 dark:border-green-500">
                        <p className="text-green-700 dark:text-green-400 leading-relaxed whitespace-pre-wrap">
                          {feedbackSelectionne.reponse}
                        </p>
                        {feedbackSelectionne.date_reponse && (
                          <p className="text-sm text-green-600 dark:text-green-500 mt-2">
                            Répondu le {new Date(feedbackSelectionne.date_reponse).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Métadonnées */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Informations</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">ID Feedback :</span>
                        <p className="font-mono text-gray-900 dark:text-white">{feedbackSelectionne.id_feedback}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Date de création :</span>
                        <p className="text-gray-900 dark:text-white">{new Date(feedbackSelectionne.date || feedbackSelectionne.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Heure :</span>
                        <p className="text-gray-900 dark:text-white">{new Date(feedbackSelectionne.date || feedbackSelectionne.createdAt).toLocaleTimeString('fr-FR')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Lu :</span>
                        <p className="text-gray-900 dark:text-white">{feedbackSelectionne.lu ? 'Oui' : 'Non'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {(feedbackSelectionne.statut === 'envoye' || feedbackSelectionne.reponse) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setModalVisible(false);
                        ouvrirModalReponse(feedbackSelectionne);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      {feedbackSelectionne.reponse ? 'Modifier la réponse' : 'Répondre'}
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => supprimerFeedback(feedbackSelectionne._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal réponse */}
      <AnimatePresence>
        {modalReponse && feedbackSelectionne && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setModalReponse(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {feedbackSelectionne.reponse ? 'Modifier la réponse' : 'Répondre au feedback'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      De : {feedbackSelectionne.id_chef?.prenom} {feedbackSelectionne.id_chef?.nom}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalReponse(false)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Contenu original */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Feedback original :</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {feedbackSelectionne.contenu}
                    </p>
                  </div>

                  {/* Textarea réponse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Votre réponse :
                    </label>
                    <textarea
                      value={reponse}
                      onChange={(e) => setReponse(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Rédigez votre réponse ici..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalReponse(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={envoyerReponse}
                    disabled={envoyantReponse || !reponse.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {envoyantReponse ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {feedbackSelectionne.reponse ? 'Modifier' : 'Envoyer'}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFeedback; 