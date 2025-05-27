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
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

const Presences = () => {
  const [presences, setPresences] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [emploiDuTemps, setEmploiDuTemps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCours, setSelectedCours] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPresence, setEditingPresence] = useState(null);
  const [stats, setStats] = useState({
    totalPresences: 0,
    presents: 0,
    absents: 0,
    tauxPresence: 0
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    chargerDonnees();
  }, [selectedDate]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      
      // Charger les professeurs
      const profsResponse = await api.get('/professeurs');
      setProfesseurs(profsResponse.data);

      // Charger l'emploi du temps du jour pour la classe
      const emploiData = getEmploiDuJour(selectedDate);
      setEmploiDuTemps(emploiData);

      // Charger les présences existantes pour cette date
      const presencesData = await chargerPresencesDuJour(selectedDate);
      setPresences(presencesData);

      // Calculer les statistiques
      calculerStatistiques(presencesData);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmploiDuJour = (date) => {
    const jourSemaine = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' });
    const jourCapitalized = jourSemaine.charAt(0).toUpperCase() + jourSemaine.slice(1);
    
    // Simuler l'emploi du temps du jour (à remplacer par de vraies données API)
    const emploiComplet = [
      {
        id: 1,
        jour: 'Lundi',
        creneau: '08h30 - 11h30',
        matiere: 'Mathématiques',
        professeur: 'Dr. Diallo',
        professeurId: '1',
        salle: 'A101'
      },
      {
        id: 2,
        jour: 'Lundi',
        creneau: '12h00 - 15h00',
        matiere: 'Physique',
        professeur: 'Prof. Camara',
        professeurId: '2',
        salle: 'B205'
      },
      {
        id: 3,
        jour: 'Mardi',
        creneau: '08h30 - 11h30',
        matiere: 'Informatique',
        professeur: 'Dr. Touré',
        professeurId: '3',
        salle: 'C301'
      },
      {
        id: 4,
        jour: 'Mardi',
        creneau: '15h30 - 18h30',
        matiere: 'Anglais',
        professeur: 'Mme. Barry',
        professeurId: '4',
        salle: 'A203'
      },
      {
        id: 5,
        jour: 'Mercredi',
        creneau: '12h00 - 15h00',
        matiere: 'Base de données',
        professeur: 'Dr. Konaté',
        professeurId: '5',
        salle: 'C102'
      },
      {
        id: 6,
        jour: 'Jeudi',
        creneau: '08h30 - 11h30',
        matiere: 'Réseaux',
        professeur: 'Prof. Sylla',
        professeurId: '6',
        salle: 'C201'
      },
      {
        id: 7,
        jour: 'Vendredi',
        creneau: '12h00 - 15h00',
        matiere: 'Génie Logiciel',
        professeur: 'Dr. Bah',
        professeurId: '7',
        salle: 'A105'
      },
      {
        id: 8,
        jour: 'Samedi',
        creneau: '08h30 - 11h30',
        matiere: 'Projet',
        professeur: 'Dr. Touré',
        professeurId: '3',
        salle: 'C301'
      }
    ];

    return emploiComplet.filter(cours => cours.jour === jourCapitalized);
  };

  const chargerPresencesDuJour = async (date) => {
    try {
      // Simuler des données de présence (à remplacer par de vraies données API)
      const presencesSimulees = [
        {
          id: 1,
          date: date,
          coursId: 1,
          professeurId: '1',
          professeur: 'Dr. Diallo',
          matiere: 'Mathématiques',
          creneau: '08h30 - 11h30',
          statut: 'présent',
          heure: '08h25',
          commentaire: ''
        },
        {
          id: 2,
          date: date,
          coursId: 2,
          professeurId: '2',
          professeur: 'Prof. Camara',
          matiere: 'Physique',
          creneau: '12h00 - 15h00',
          statut: 'absent',
          heure: '',
          commentaire: 'Maladie signalée'
        }
      ];

      return presencesSimulees;
    } catch (error) {
      console.error('Erreur chargement présences:', error);
      return [];
    }
  };

  const calculerStatistiques = (presencesData) => {
    const total = presencesData.length;
    const presents = presencesData.filter(p => p.statut === 'présent').length;
    const absents = total - presents;
    const tauxPresence = total > 0 ? Math.round((presents / total) * 100) : 0;

    setStats({
      totalPresences: total,
      presents,
      absents,
      tauxPresence
    });
  };

  const declarerPresence = async (coursId, professeurId, statut, commentaire = '') => {
    try {
      const cours = emploiDuTemps.find(c => c.id === coursId);
      if (!cours) return;

      const nouvellePresence = {
        id: Date.now(),
        date: selectedDate,
        coursId,
        professeurId,
        professeur: cours.professeur,
        matiere: cours.matiere,
        creneau: cours.creneau,
        statut,
        heure: statut === 'présent' ? new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
        commentaire
      };

      // Mettre à jour l'état local
      const presencesUpdated = presences.filter(p => p.coursId !== coursId);
      presencesUpdated.push(nouvellePresence);
      setPresences(presencesUpdated);

      // Recalculer les statistiques
      calculerStatistiques(presencesUpdated);

      // Ici, vous ajouteriez l'appel API pour sauvegarder en base
      // await api.post('/presences', nouvellePresence);

      console.log('Présence déclarée:', nouvellePresence);
    } catch (error) {
      console.error('Erreur déclaration présence:', error);
    }
  };

  const ouvrirModalPresence = (cours) => {
    const presenceExistante = presences.find(p => p.coursId === cours.id);
    setEditingPresence({
      cours,
      presence: presenceExistante || {
        statut: '',
        commentaire: ''
      }
    });
    setShowModal(true);
  };

  const sauvegarderPresence = async () => {
    if (!editingPresence) return;

    await declarerPresence(
      editingPresence.cours.id,
      editingPresence.cours.professeurId,
      editingPresence.presence.statut,
      editingPresence.presence.commentaire
    );

    setShowModal(false);
    setEditingPresence(null);
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'présent':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
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
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">En attente</span>;
    }
  };

  const exporterPresences = () => {
    // Fonction d'export à implémenter
    console.log('Export présences');
  };

  const coursFiltered = emploiDuTemps.filter(cours =>
    cours.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cours.professeur.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Gestion des présences
            </h1>
            <p className="text-gray-600">
              Déclarez les présences des enseignants pour la classe {user.classe}
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
              onClick={exporterPresences}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
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
          transition={{ delay: 0.4 }}
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
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

        {coursFiltered.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun cours programmé
            </h3>
            <p className="text-gray-600">
              Il n'y a pas de cours programmé pour cette date.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {coursFiltered.map((cours, index) => {
              const presence = presences.find(p => p.coursId === cours.id);
              
              return (
                <motion.div
                  key={cours.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {cours.matiere.charAt(0)}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">{cours.matiere}</h4>
                      <p className="text-sm text-gray-600">{cours.professeur}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{cours.creneau}</span>
                        </span>
                        <span>Salle {cours.salle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {presence ? (
                      <div className="flex items-center space-x-3">
                        {getStatutIcon(presence.statut)}
                        {getStatutBadge(presence.statut)}
                        {presence.heure && (
                          <span className="text-xs text-gray-500">
                            à {presence.heure}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                        En attente
                      </span>
                    )}

                    <button
                      onClick={() => ouvrirModalPresence(cours)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-600 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modal de déclaration de présence */}
      <AnimatePresence>
        {showModal && editingPresence && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Déclarer présence
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900">{editingPresence.cours.matiere}</h4>
                  <p className="text-sm text-gray-600">{editingPresence.cours.professeur}</p>
                  <p className="text-xs text-gray-500">{editingPresence.cours.creneau} • Salle {editingPresence.cours.salle}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut de présence
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setEditingPresence({
                        ...editingPresence,
                        presence: { ...editingPresence.presence, statut: 'présent' }
                      })}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                        editingPresence.presence.statut === 'présent'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Présent</span>
                    </button>
                    
                    <button
                      onClick={() => setEditingPresence({
                        ...editingPresence,
                        presence: { ...editingPresence.presence, statut: 'absent' }
                      })}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                        editingPresence.presence.statut === 'absent'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={editingPresence.presence.commentaire}
                    onChange={(e) => setEditingPresence({
                      ...editingPresence,
                      presence: { ...editingPresence.presence, commentaire: e.target.value }
                    })}
                    placeholder="Ajouter un commentaire..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={sauvegarderPresence}
                  disabled={!editingPresence.presence.statut}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Presences; 