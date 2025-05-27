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
  X
} from 'lucide-react';
import api from '../../services/api';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      
      // Charger les cours (simulé)
      const coursData = [
        { id: 1, nom_matiere: 'Mathématiques', professeur: 'Dr. Diallo' },
        { id: 2, nom_matiere: 'Physique', professeur: 'Prof. Camara' },
        { id: 3, nom_matiere: 'Informatique', professeur: 'Dr. Touré' },
        { id: 4, nom_matiere: 'Anglais', professeur: 'Mme. Barry' },
        { id: 5, nom_matiere: 'Base de données', professeur: 'Dr. Konaté' }
      ];
      setCours(coursData);

      // Charger les feedbacks (simulé)
      const feedbacksData = [
        {
          id: 1,
          id_cours: 1,
          cours: 'Mathématiques',
          professeur: 'Dr. Diallo',
          contenu: 'Les étudiants ont des difficultés avec les équations différentielles. Il serait bien d\'avoir plus d\'exercices pratiques.',
          type: 'pedagogique',
          priorite: 'haute',
          statut: 'envoye',
          date: '2024-01-15',
          reponse: null,
          lu: true
        },
        {
          id: 2,
          id_cours: 2,
          cours: 'Physique',
          professeur: 'Prof. Camara',
          contenu: 'Excellent cours sur la mécanique quantique. Les étudiants sont très engagés.',
          type: 'general',
          priorite: 'normale',
          statut: 'envoye',
          date: '2024-01-14',
          reponse: 'Merci pour ce retour positif !',
          lu: true
        },
        {
          id: 3,
          id_cours: 3,
          cours: 'Informatique',
          professeur: 'Dr. Touré',
          contenu: 'Problème avec le projecteur en salle C301. Cela perturbe les cours de programmation.',
          type: 'technique',
          priorite: 'urgente',
          statut: 'envoye',
          date: '2024-01-13',
          reponse: null,
          lu: false
        },
        {
          id: 4,
          id_cours: 4,
          cours: 'Anglais',
          professeur: 'Mme. Barry',
          contenu: 'Suggestion d\'organiser des sessions de conversation en petits groupes.',
          type: 'pedagogique',
          priorite: 'normale',
          statut: 'brouillon',
          date: '2024-01-12',
          reponse: null,
          lu: false
        }
      ];
      setFeedbacks(feedbacksData);

      // Calculer les statistiques
      calculerStatistiques(feedbacksData);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculerStatistiques = (feedbacksData) => {
    const total = feedbacksData.length;
    const envoyes = feedbacksData.filter(f => f.statut === 'envoye').length;
    const brouillons = feedbacksData.filter(f => f.statut === 'brouillon').length;
    const reponses = feedbacksData.filter(f => f.reponse).length;

    setStats({ total, envoyes, brouillons, reponses });
  };

  const ouvrirModalFeedback = (feedback = null) => {
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

  const sauvegarderFeedback = async () => {
    try {
      if (!nouveauFeedback.id_cours || !nouveauFeedback.contenu.trim()) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const coursSelectionne = cours.find(c => c.id === parseInt(nouveauFeedback.id_cours));
      
      const feedbackData = {
        ...nouveauFeedback,
        id: editingFeedback ? editingFeedback.id : Date.now(),
        cours: coursSelectionne?.nom_matiere || '',
        professeur: coursSelectionne?.professeur || '',
        date: new Date().toISOString().split('T')[0],
        reponse: editingFeedback?.reponse || null,
        lu: false
      };

      let updatedFeedbacks;
      if (editingFeedback) {
        updatedFeedbacks = feedbacks.map(f => f.id === editingFeedback.id ? feedbackData : f);
      } else {
        updatedFeedbacks = [...feedbacks, feedbackData];
      }

      setFeedbacks(updatedFeedbacks);
      calculerStatistiques(updatedFeedbacks);

      // Ici, vous ajouteriez l'appel API pour sauvegarder en base
      // await api.post('/feedbacks', feedbackData);

      setShowModal(false);
      setEditingFeedback(null);
      setNouveauFeedback({
        id_cours: '',
        contenu: '',
        type: 'general',
        priorite: 'normale',
        statut: 'brouillon'
      });

    } catch (error) {
      console.error('Erreur sauvegarde feedback:', error);
    }
  };

  const envoyerFeedback = async (feedbackId) => {
    try {
      const updatedFeedbacks = feedbacks.map(f => 
        f.id === feedbackId ? { ...f, statut: 'envoye' } : f
      );
      setFeedbacks(updatedFeedbacks);
      calculerStatistiques(updatedFeedbacks);

      // Ici, vous ajouteriez l'appel API
      // await api.put(`/feedbacks/${feedbackId}`, { statut: 'envoye' });

    } catch (error) {
      console.error('Erreur envoi feedback:', error);
    }
  };

  const supprimerFeedback = async (feedbackId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce feedback ?')) return;

    try {
      const updatedFeedbacks = feedbacks.filter(f => f.id !== feedbackId);
      setFeedbacks(updatedFeedbacks);
      calculerStatistiques(updatedFeedbacks);

      // Ici, vous ajouteriez l'appel API
      // await api.delete(`/feedbacks/${feedbackId}`);

    } catch (error) {
      console.error('Erreur suppression feedback:', error);
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

  // Filtrage des feedbacks
  const feedbacksFiltres = feedbacks.filter(feedback => {
    const matchSearch = feedback.contenu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       feedback.cours.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       feedback.professeur.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatut = filtreStatut === 'tous' || feedback.statut === filtreStatut;
    const matchCours = filtreCours === '' || feedback.id_cours === parseInt(filtreCours);
    
    return matchSearch && matchStatut && matchCours;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
              Gestion des feedbacks
            </h1>
            <p className="text-gray-600">
              Communiquez avec l'administration sur les cours de la classe {user.classe}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={chargerDonnees}
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

      {/* Statistiques */}
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
                <option key={c.id} value={c.id}>{c.nom_matiere}</option>
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

      {/* Liste des feedbacks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Mes feedbacks</h2>

        {feedbacksFiltres.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun feedback trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer votre premier feedback.
            </p>
            <button
              onClick={() => ouvrirModalFeedback()}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Créer un feedback
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacksFiltres.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 ${getTypeColor(feedback.type)} rounded-lg flex items-center justify-center text-white`}>
                      {getTypeIcon(feedback.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{feedback.cours}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioriteStyle(feedback.priorite)}`}>
                          {priorites.find(p => p.value === feedback.priorite)?.label}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getStatutIcon(feedback.statut)}
                          <span className="text-xs text-gray-500 capitalize">{feedback.statut}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{feedback.professeur}</p>
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
                          <span>{new Date(feedback.date).toLocaleDateString('fr-FR')}</span>
                        </span>
                        <span className="capitalize">{typesFeedback.find(t => t.value === feedback.type)?.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => ouvrirModalFeedback(feedback)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {feedback.statut === 'brouillon' && (
                      <button
                        onClick={() => envoyerFeedback(feedback.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Envoyer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => supprimerFeedback(feedback.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de création/édition de feedback */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
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

                <div className="space-y-6">
                  {/* Sélection du cours */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cours concerné *
                    </label>
                    <select
                      value={nouveauFeedback.id_cours}
                      onChange={(e) => setNouveauFeedback({...nouveauFeedback, id_cours: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner un cours</option>
                      {cours.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nom_matiere} - {c.professeur}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type et priorité */}
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

                  {/* Contenu */}
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
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={() => {
                      setNouveauFeedback({...nouveauFeedback, statut: 'brouillon'});
                      sauvegarderFeedback();
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Sauvegarder en brouillon
                  </button>
                  
                  <button
                    onClick={() => {
                      setNouveauFeedback({...nouveauFeedback, statut: 'envoye'});
                      sauvegarderFeedback();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer</span>
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