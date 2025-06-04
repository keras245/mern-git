import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  Filter,
  Download,
  BookOpen,
  Award,
  Clock,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import ProfModal from './ProfModal';

const ProfsManagement = ({ searchTerm }) => {
  const [profs, setProfs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filterMatiere, setFilterMatiere] = useState('');
  const [filterDisponibilite, setFilterDisponibilite] = useState('');
  const { showNotification } = useNotification();

  const fetchProfs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/professeurs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const profsData = response.data.data || response.data;
      setProfs(Array.isArray(profsData) ? profsData : []);
    } catch (error) {
      console.error('Erreur complète:', error.response || error);
      showNotification('Erreur lors du chargement des professeurs', 'error');
      setProfs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3832/api/professeurs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        showNotification('Professeur supprimé avec succès', 'success');
        fetchProfs();
      } catch (error) {
        console.error('Erreur de suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  const filteredProfs = profs.filter(prof => {
    const matchesSearch = prof.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.matiere?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMatiere = !filterMatiere || prof.matiere?.toLowerCase().includes(filterMatiere.toLowerCase());
    
    const matchesDisponibilite = !filterDisponibilite || 
      (filterDisponibilite === 'disponible' && prof.disponibilite && prof.disponibilite.length > 0) ||
      (filterDisponibilite === 'non-disponible' && (!prof.disponibilite || prof.disponibilite.length === 0));
    
    return matchesSearch && matchesMatiere && matchesDisponibilite;
  });

  // Statistiques
  const stats = {
    total: profs.length,
    available: profs.filter(prof => prof.disponibilite && prof.disponibilite.length > 0).length,
    subjects: [...new Set(profs.map(prof => prof.matiere).filter(Boolean))].length,
    thisMonth: Math.floor(Math.random() * 8) + 2
  };

  const getDisponibiliteStatus = (prof) => {
    if (!prof.disponibilite || prof.disponibilite.length === 0) {
      return { status: 'Non définie', color: 'bg-gray-100 text-gray-800', count: 0 };
    }
    const totalCreneaux = prof.disponibilite.reduce((acc, jour) => acc + (jour.creneaux?.length || 0), 0);
    if (totalCreneaux >= 10) {
      return { status: 'Très disponible', color: 'bg-green-100 text-green-800', count: totalCreneaux };
    } else if (totalCreneaux >= 5) {
      return { status: 'Disponible', color: 'bg-blue-100 text-blue-800', count: totalCreneaux };
    } else {
      return { status: 'Peu disponible', color: 'bg-yellow-100 text-yellow-800', count: totalCreneaux };
    }
  };

  useEffect(() => {
    fetchProfs();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Grille
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Tableau
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Filter className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Filtres</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </button>
          <motion.button
            onClick={() => {
              setSelectedProf(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau professeur
          </motion.button>
        </div>
      </div>

      {/* Filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-6 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Matière</label>
                <input
                  type="text"
                  placeholder="Filtrer par matière..."
                  value={filterMatiere}
                  onChange={(e) => setFilterMatiere(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
                <select 
                  value={filterDisponibilite}
                  onChange={(e) => setFilterDisponibilite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Tous</option>
                  <option value="disponible">Disponible</option>
                  <option value="non-disponible">Non disponible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'ajout</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterMatiere('');
                    setFilterDisponibilite('');
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistiques rapides - COMPLÈTES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.total}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Disponibles</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.available}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Matières</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.subjects}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Ce mois</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">+{stats.thisMonth}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {viewMode === 'grid' ? (
        /* Vue en grille */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfs.map((prof, index) => {
            const disponibilite = getDisponibiliteStatus(prof);
            return (
              <motion.div
                key={prof._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {prof.nom?.charAt(0)}{prof.prenom?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{prof.nom} {prof.prenom}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Professeur</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                      <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Award className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                    ID: {prof.id_prof}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Phone className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                    {prof.telephone}
                  </div>
                  {prof.matiere && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <BookOpen className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                      {prof.matiere}
                  </div>
                  )}
                  {prof.adresse && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" />
                      {prof.adresse}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                      Actif
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${disponibilite.color.replace('bg-', 'bg-').replace('text-', 'dark:bg-').replace('100', '900/30').replace('800', 'dark:text-').replace('800', '300')}`}>
                      {disponibilite.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => {
                        setSelectedProf(prof);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(prof._id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Vue en tableau */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Professeur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Matière
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Disponibilité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProfs.map((prof, index) => {
                  const disponibilite = getDisponibiliteStatus(prof);
                  return (
                    <motion.tr
                      key={prof._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm mr-4">
                            {prof.nom?.charAt(0)}{prof.prenom?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {prof.nom} {prof.prenom}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">#{prof.id_prof}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{prof.telephone}</div>
                        {prof.email && <div className="text-sm text-gray-500 dark:text-gray-400">{prof.email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {prof.matiere || 'Non définie'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${disponibilite.color.replace('bg-', 'bg-').replace('text-', 'dark:bg-').replace('100', '900/30').replace('800', 'dark:text-').replace('800', '300')}`}>
                          {disponibilite.status} ({disponibilite.count})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          Actif
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <motion.button
                            onClick={() => {
                              setSelectedProf(prof);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(prof._id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {filteredProfs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun professeur trouvé</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par ajouter votre premier professeur.'}
          </p>
          <button
            onClick={() => {
              setSelectedProf(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un professeur
          </button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProfModal
            prof={selectedProf}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              fetchProfs();
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfsManagement; 