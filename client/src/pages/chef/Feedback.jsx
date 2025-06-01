import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  X,
  Save
} from 'lucide-react';
import api from '../../services/api';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCours, setLoadingCours] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtreCours, setFiltreCours] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    envoyes: 0,
    brouillons: 0,
    reponses: 0
  });

  const [nouveauFeedback, setNouveauFeedback] = useState({
    id_cours: '',
    contenu: '',
    type: 'general',
    priorite: 'normale',
    statut: 'brouillon'
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const typesFeedback = [
    { value: 'general', label: 'Général', icon: MessageSquare, color: 'bg-blue-500' },
    { value: 'pedagogique', label: 'Pédagogique', icon: BookOpen, color: 'bg-green-500' },
    { value: 'technique', label: 'Technique', icon: AlertCircle, color: 'bg-orange-500' },
    { value: 'comportement', label: 'Comportement', icon: User, color: 'bg-purple-500' }
  ];

  const priorites = [
    { value: 'basse', label: 'Basse', color: 'text-green-600 bg-green-100' },
    { value: 'normale', label: 'Normale', color: 'text-blue-600 bg-blue-100' },
    { value: 'haute', label: 'Haute', color: 'text-orange-600 bg-orange-100' },
    { value: 'urgente', label: 'Urgente', color: 'text-red-600 bg-red-100' }
  ];

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ajouter un state pour la notification globale
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' // 'success' | 'error'
  });

  // State pour forcer le re-render toutes les minutes
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    chargerFeedbacks();
    chargerCours();
  }, []);

  // Effet pour mettre à jour le temps toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Mettre à jour toutes les minutes

    return () => clearInterval(interval);
  }, []);

  const chargerFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token manquant');
        setFeedbacks([]);
        return;
      }

      const userInfo = JSON.parse(atob(token.split('.')[1]));
      
      const response = await api.get(`/feedbacks/chef/${userInfo.id}`);

      console.log('Réponse API feedbacks:', response.data);

      const feedbacksData = Array.isArray(response.data) ? response.data : [];
      
      // Debug pour vérifier la structure des feedbacks
      console.log('Feedbacks data structure:', feedbacksData.map(f => ({
        id: f._id,
        statut: f.statut,
        contenu: f.contenu.substring(0, 50) + '...'
      })));
      
      setFeedbacks(feedbacksData);
      
      if (feedbacksData.length > 0) {
        const stats = {
          total: feedbacksData.length,
          envoyes: feedbacksData.filter(f => f.statut === 'envoye').length,
          traites: feedbacksData.filter(f => f.statut === 'traite').length,
          enAttente: feedbacksData.filter(f => f.statut === 'en_attente').length
        };
        stats.tauxReponse = stats.total > 0 ? Math.round((stats.traites / stats.total) * 100) : 0;
        setStats(stats);
      } else {
        setStats({
          total: 0,
          envoyes: 0,
          traites: 0,
          enAttente: 0,
          tauxReponse: 0
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des feedbacks:', error);
      setFeedbacks([]);
      setShowError(true);
      setErrorMessage('Erreur lors du chargement des feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  const chargerCours = async () => {
    try {
      setLoadingCours(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Token manquant');
        setCours([]);
        return;
      }

      console.log('Chargement des cours disponibles...');
      
      const response = await api.get('/feedbacks/cours-disponibles');

      console.log('Cours récupérés:', response.data);
      
      const coursData = Array.isArray(response.data) ? response.data : [];
      setCours(coursData);
      
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      setCours([]);
      
      if (error.response?.status === 404) {
        console.log('Aucun cours trouvé pour cette classe');
      }
    } finally {
      setLoadingCours(false);
    }
  };

  const ouvrirModalFeedback = (feedback = null) => {
    if (cours.length === 0 && !loadingCours) {
      chargerCours();
    }

    if (feedback) {
      setEditingFeedback(feedback);
      setNouveauFeedback({
        id_cours: feedback.id_cours,
        contenu: feedback.contenu,
        type: feedback.type,
        priorite: feedback.priorite,
        statut: feedback.statut
      });
    } else {
      setEditingFeedback(null);
      setNouveauFeedback({
        id_cours: '',
        contenu: '',
        type: 'general',
        priorite: 'normale',
        statut: 'brouillon'
      });
    }
    setShowModal(true);
  };

  // Fonction pour afficher une notification globale
  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto-hide après 4 secondes
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const soumettreNouveauFeedback = async (statut = 'envoye') => {
    if (!nouveauFeedback.contenu.trim()) {
      setShowError(true);
      setErrorMessage('Le contenu du feedback ne peut pas être vide.');
        return;
      }

    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setShowError(true);
        setErrorMessage('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      const feedbackData = {
        contenu: nouveauFeedback.contenu.trim(),
        type: nouveauFeedback.type,
        priorite: nouveauFeedback.priorite,
        statut: statut
      };

      // Ajouter id_cours seulement si un cours est sélectionné
      if (nouveauFeedback.id_cours && nouveauFeedback.id_cours !== '') {
        feedbackData.id_cours = nouveauFeedback.id_cours;
      }

      console.log('=== ENVOI FEEDBACK ===');
      console.log('Données à envoyer:', feedbackData);

      const response = await api.post('/feedbacks/creer', feedbackData);

      if (response.data) {
        // Fermer le modal immédiatement
      setShowModal(false);
        
        // Réinitialiser le formulaire
      setNouveauFeedback({
        contenu: '',
        type: 'general',
        priorite: 'normale',
          id_cours: '' 
        });
        
        // Réinitialiser les états d'erreur du modal
        setShowError(false);
        setShowSuccess(false);
        
        // Recharger la liste des feedbacks
        await chargerFeedbacks();
        
        // Afficher la notification globale
        if (statut === 'brouillon') {
          showNotification('Feedback sauvegardé en brouillon !', 'success');
        } else {
          showNotification('Feedback envoyé avec succès !', 'success');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      setShowError(true);
      
      // Meilleure gestion des erreurs
      if (error.response?.status === 400) {
        const errorDetails = error.response.data.details || [];
        if (errorDetails.length > 0) {
          setErrorMessage(`Erreur de validation: ${errorDetails.join(', ')}`);
        } else {
          setErrorMessage(`Erreur de validation: ${error.response.data.message}`);
        }
      } else if (error.response?.status === 401) {
        setErrorMessage('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 404) {
        setErrorMessage('Service non disponible. Contactez l\'administrateur.');
      } else if (error.response?.data?.message) {
        setErrorMessage(`Erreur serveur: ${error.response.data.message}`);
      } else {
        setErrorMessage('Erreur de connexion. Vérifiez votre réseau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour sauvegarder en brouillon (depuis le modal)
  const sauvegarderBrouillon = async () => {
    await soumettreNouveauFeedback('brouillon');
  };

  // Fonction pour envoyer (depuis le modal)
  const envoyerNouveauFeedback = async () => {
    await soumettreNouveauFeedback('envoye');
  };

  // Fonction pour envoyer un feedback existant (depuis la liste)
  const envoyerFeedbackExistant = async (feedbackId) => {
    try {
      console.log('=== ENVOI FEEDBACK EXISTANT ===');
      console.log('Feedback ID:', feedbackId);
      console.log('Type de l\'ID:', typeof feedbackId);
      
      if (!feedbackId || typeof feedbackId !== 'string') {
        console.error('ID de feedback invalide:', feedbackId);
        showNotification('Erreur: ID de feedback invalide', 'error');
        return;
      }

      const response = await api.put(`/feedbacks/${feedbackId}`, {
        statut: 'envoye'
      });

      if (response.data) {
        // Recharger la liste des feedbacks
        await chargerFeedbacks();
        showNotification('Feedback envoyé avec succès !', 'success');
      }
    } catch (error) {
      console.error('Erreur envoi feedback:', error);
      console.error('URL appelée:', `/feedbacks/${feedbackId}`);
      console.error('Response:', error.response?.data);
      
      if (error.response?.status === 404) {
        showNotification('Feedback non trouvé', 'error');
      } else if (error.response?.status === 400) {
        showNotification(`Erreur: ${error.response.data.message}`, 'error');
      } else {
        showNotification('Erreur lors de l\'envoi du feedback', 'error');
      }
    }
  };

  // Fonction pour supprimer un feedback
  const supprimerFeedback = async (feedbackId) => {
    try {
      console.log('=== SUPPRESSION FEEDBACK ===');
      console.log('Feedback ID:', feedbackId);
      
      if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce feedback ?')) {
        return;
      }

      if (!feedbackId || typeof feedbackId !== 'string') {
        console.error('ID de feedback invalide:', feedbackId);
        showNotification('Erreur: ID de feedback invalide', 'error');
        return;
      }

      const response = await api.delete(`/feedbacks/${feedbackId}`);

      if (response.data) {
        await chargerFeedbacks();
        showNotification('Feedback supprimé avec succès !', 'success');
      }
    } catch (error) {
      console.error('Erreur suppression feedback:', error);
      
      if (error.response?.status === 403) {
        showNotification('Ce feedback ne peut plus être supprimé (délai de 15 minutes dépassé)', 'error');
      } else if (error.response?.status === 404) {
        showNotification('Feedback non trouvé', 'error');
      } else if (error.response?.status === 400) {
        showNotification(`Erreur: ${error.response.data.message}`, 'error');
      } else {
        showNotification('Erreur lors de la suppression du feedback', 'error');
      }
    }
  };

  const getTypeIcon = (type) => {
    const typeInfo = typesFeedback.find(t => t.value === type);
    const Icon = typeInfo?.icon || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeColor = (type) => {
    const typeInfo = typesFeedback.find(t => t.value === type);
    return typeInfo?.color || 'bg-gray-500';
  };

  const getPrioriteStyle = (priorite) => {
    const prioriteInfo = priorites.find(p => p.value === priorite);
    return prioriteInfo?.color || 'text-gray-600 bg-gray-100';
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'envoye':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'brouillon':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const feedbacksFiltres = Array.isArray(feedbacks) ? feedbacks.filter(feedback => {
    const matchesSearch = feedback.contenu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (feedback.id_cours?.nom_matiere || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filtreStatut === 'tous' || feedback.statut === filtreStatut;
    return matchesSearch && matchesFilter;
  }) : [];

  // Fonction pour vérifier si un feedback peut être modifié (15 minutes après envoi)
  const peutEtreModifie = (feedback) => {
    // Les brouillons peuvent toujours être modifiés
    if (feedback.statut === 'brouillon') {
      return true;
    }
    
    // Pour les feedbacks envoyés, vérifier le délai de 15 minutes
    if (feedback.statut === 'envoye') {
      const dateEnvoi = new Date(feedback.date);
      const maintenant = new Date();
      const differenceMinutes = (maintenant - dateEnvoi) / (1000 * 60); // Différence en minutes
      
      return differenceMinutes <= 15;
    }
    
    // Les feedbacks traités ne peuvent pas être modifiés
    return false;
  };

  // Fonction pour calculer le temps restant pour la modification
  const getTempsRestant = (feedback) => {
    if (feedback.statut !== 'envoye') {
      return null;
    }
    
    const dateEnvoi = new Date(feedback.date);
    const maintenant = new Date();
    const differenceMinutes = (maintenant - dateEnvoi) / (1000 * 60);
    const minutesRestantes = Math.max(0, 15 - differenceMinutes);
    
    if (minutesRestantes <= 0) {
      return null;
    }
    
    if (minutesRestantes < 1) {
      return `${Math.round(minutesRestantes * 60)}s`;
    }
    
    return `${Math.round(minutesRestantes)}min`;
  };

  // Fonction pour formater le temps d'envoi
  const getTempsDepuisEnvoi = (feedback) => {
    const dateEnvoi = new Date(feedback.date);
    const maintenant = new Date();
    const differenceMinutes = (maintenant - dateEnvoi) / (1000 * 60);
    
    if (differenceMinutes < 1) {
      return 'À l\'instant';
    } else if (differenceMinutes < 60) {
      return `Il y a ${Math.round(differenceMinutes)}min`;
    } else if (differenceMinutes < 1440) { // 24h
      return `Il y a ${Math.round(differenceMinutes / 60)}h`;
    } else {
      return dateEnvoi.toLocaleDateString('fr-FR');
    }
  };

  const renderFeedbacks = () => {
    if (loading) {
      return <div className="text-center py-8">Chargement des feedbacks...</div>;
    }

    if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Aucun feedback trouvé
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {feedbacksFiltres.map((feedback, index) => {
          const peutModifier = peutEtreModifie(feedback);
          const tempsRestant = getTempsRestant(feedback);
          
          return (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-xl p-6 hover:shadow-md transition-all duration-200 group relative ${
                feedback.statut === 'brouillon' 
                  ? 'border-yellow-200 bg-yellow-50' 
                  : feedback.statut === 'envoye'
                  ? 'border-blue-200 bg-blue-50'
                  : feedback.statut === 'traite'
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Indicateur de temps restant pour modification */}
              {feedback.statut === 'envoye' && tempsRestant && (
                <div className="absolute top-3 right-3">
                  <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                    Modifiable {tempsRestant}
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 ${getTypeColor(feedback.type)} rounded-lg flex items-center justify-center text-white`}>
                    {getTypeIcon(feedback.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {feedback.id_cours?.nom_matiere || 'Feedback général'}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioriteStyle(feedback.priorite)}`}>
                        {priorites.find(p => p.value === feedback.priorite)?.label}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getStatutIcon(feedback.statut)}
                        <span className={`text-xs font-medium capitalize ${
                          feedback.statut === 'brouillon' ? 'text-yellow-600' :
                          feedback.statut === 'envoye' ? 'text-blue-600' :
                          feedback.statut === 'traite' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          {feedback.statut}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-800 mb-3">{feedback.contenu}</p>
                    
                    {feedback.reponse && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">Réponse de l'administration :</p>
                        <p className="text-sm text-blue-800">{feedback.reponse}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getTempsDepuisEnvoi(feedback)}</span>
                      </span>
                      <span className="capitalize">{typesFeedback.find(t => t.value === feedback.type)?.label}</span>
                      
                      {/* Indicateur de statut de modification */}
                      {feedback.statut === 'envoye' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          peutModifier 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {peutModifier ? '🔓 Modifiable' : '🔒 Verrouillé'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Bouton Envoyer - seulement pour les brouillons */}
                  {feedback.statut === 'brouillon' && (
                    <button
                      onClick={() => {
                        console.log('Clic envoyer - Feedback ID:', feedback._id);
                        envoyerFeedbackExistant(feedback._id);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Envoyer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Bouton Modifier - brouillons OU envoyés dans les 15 minutes */}
                  {peutModifier && (
                    <button
                      onClick={() => ouvrirModalFeedback(feedback)}
                      className={`p-2 transition-colors ${
                        feedback.statut === 'brouillon' 
                          ? 'text-gray-400 hover:text-blue-600' 
                          : 'text-gray-400 hover:text-orange-600'
                      }`}
                      title={
                        feedback.statut === 'brouillon' 
                          ? 'Modifier' 
                          : `Modifier (${tempsRestant} restant)`
                      }
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Bouton Supprimer - brouillons OU envoyés dans les 15 minutes */}
                  {peutModifier && (
                    <button
                      onClick={() => {
                        console.log('Clic supprimer - Feedback ID:', feedback._id);
                        supprimerFeedback(feedback._id);
                      }}
                      className={`p-2 transition-colors ${
                        feedback.statut === 'brouillon' 
                          ? 'text-gray-400 hover:text-red-600' 
                          : 'text-gray-400 hover:text-orange-600'
                      }`}
                      title={
                        feedback.statut === 'brouillon' 
                          ? 'Supprimer' 
                          : `Supprimer (${tempsRestant} restant)`
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Icône d'information pour les feedbacks verrouillés */}
                  {feedback.statut === 'envoye' && !peutModifier && (
                    <div className="p-2 text-gray-300" title="Ce feedback ne peut plus être modifié (délai de 15 minutes dépassé)">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification globale */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-[60] max-w-md"
          >
            <div className={`p-4 rounded-lg shadow-lg border ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start space-x-3">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className={`text-${notification.type === 'success' ? 'green' : 'red'}-400 hover:text-${notification.type === 'success' ? 'green' : 'red'}-600`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestion des feedbacks
            </h1>
            <p className="text-gray-600">
              Communiquez avec l'administration sur les cours de la classe {user.classe}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={chargerFeedbacks}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
            
            <button
              onClick={() => ouvrirModalFeedback()}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau feedback</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total feedbacks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Envoyés</p>
              <p className="text-2xl font-bold text-green-600">{stats.envoyes}</p>
            </div>
            <Send className="w-8 h-8 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Brouillons</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.brouillons}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
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
              <p className="text-sm font-medium text-gray-600">Réponses reçues</p>
              <p className="text-2xl font-bold text-purple-600">{stats.reponses}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="tous">Tous les statuts</option>
                <option value="brouillon">Brouillons</option>
                <option value="envoye">Envoyés</option>
              </select>
            </div>

            <select
              value={filtreCours}
              onChange={(e) => setFiltreCours(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Tous les cours</option>
              {cours.map(c => (
                <option key={c._id} value={c._id}>{c.nom_matiere}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Mes feedbacks</h2>

        {renderFeedbacks()}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingFeedback ? 'Modifier le feedback' : 'Nouveau feedback'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {showError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-800">{errorMessage}</p>
                      </div>
                      <button
                        onClick={() => setShowError(false)}
                        className="ml-auto text-red-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cours concerné (optionnel)
                    </label>
                    <select
                      value={nouveauFeedback.id_cours}
                      onChange={(e) => setNouveauFeedback({...nouveauFeedback, id_cours: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={loadingCours}
                    >
                      <option value="">
                        {loadingCours ? 'Chargement des cours...' : 'Sélectionner un cours (optionnel)'}
                      </option>
                      {cours.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.nom_matiere} - {c.professeur}
                        </option>
                      ))}
                    </select>
                    {cours.length === 0 && !loadingCours && (
                      <p className="mt-1 text-sm text-gray-500">
                        Aucun cours disponible pour votre classe
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de feedback
                      </label>
                      <select
                        value={nouveauFeedback.type}
                        onChange={(e) => setNouveauFeedback({...nouveauFeedback, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {typesFeedback.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priorité
                      </label>
                      <select
                        value={nouveauFeedback.priorite}
                        onChange={(e) => setNouveauFeedback({...nouveauFeedback, priorite: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {priorites.map(priorite => (
                          <option key={priorite.value} value={priorite.value}>
                            {priorite.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={nouveauFeedback.contenu}
                      onChange={(e) => setNouveauFeedback({...nouveauFeedback, contenu: e.target.value})}
                      placeholder="Décrivez votre feedback de manière détaillée..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={6}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {nouveauFeedback.contenu.length}/500 caractères
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-8">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowError(false);
                      setShowSuccess(false);
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={sauvegarderBrouillon}
                    disabled={isSubmitting || !nouveauFeedback.contenu.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sauvegarde...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Sauvegarder en brouillon</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={envoyerNouveauFeedback}
                    disabled={isSubmitting || !nouveauFeedback.contenu.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer</span>
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

export default Feedback; 