import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, BookOpen, User, Clock, Search, Filter, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';
import CoursModal from './CoursModal';

const CoursManagement = () => {
  const [cours, setCours] = useState([]);
  const [filteredCours, setFilteredCours] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCours, setSelectedCours] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadCours();
  }, []);

  useEffect(() => {
    filterCours();
  }, [cours, searchTerm, filterType]);

  const loadCours = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/cours', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Vérifier que la réponse est un tableau
      const coursData = Array.isArray(response.data) ? response.data : [];
      setCours(coursData);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      setError('Erreur lors du chargement des cours');
      showNotification('Erreur lors du chargement des cours', 'error');
      setCours([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCours = () => {
    try {
      let filtered = [...cours];

      if (searchTerm && searchTerm.trim()) {
        filtered = filtered.filter(c => {
          const nom = c?.nom_matiere || '';
          const description = c?.description || '';
          const searchLower = searchTerm.toLowerCase();
          return nom.toLowerCase().includes(searchLower) || 
                 description.toLowerCase().includes(searchLower);
        });
      }

      if (filterType && filterType.trim()) {
        filtered = filtered.filter(c => c?.type === filterType);
      }

      setFilteredCours(filtered);
    } catch (error) {
      console.error('Erreur lors du filtrage:', error);
      setFilteredCours([]);
    }
  };

  const handleEdit = (coursItem) => {
    if (coursItem && coursItem._id) {
      setSelectedCours(coursItem);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3832/api/cours/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification('Cours supprimé avec succès', 'success');
      loadCours();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Cours Magistral': 'bg-blue-100 text-blue-800',
      'Travaux Dirigés': 'bg-green-100 text-green-800',
      'Travaux Pratiques': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const safeGetValue = (obj, key, defaultValue = '') => {
    try {
      return obj && obj[key] !== undefined && obj[key] !== null ? String(obj[key]) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadCours}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            <span>Gestion des Cours</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Organisez et gérez tous les cours et matières
          </p>
        </div>
        
        <motion.button
          onClick={() => {
            setSelectedCours(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Cours
        </motion.button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Total Cours</p>
              <p className="text-3xl font-bold">{cours.length}</p>
            </div>
            <BookOpen className="w-12 h-12 text-emerald-200" />
          </div>
        </motion.div>

        {['Cours Magistral', 'Travaux Dirigés', 'Travaux Pratiques'].map((type, index) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{type}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cours.filter(c => c?.type === type).length}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(type)}`}>
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="">Tous les types</option>
                <option value="Cours Magistral">Cours Magistral</option>
                <option value="Travaux Dirigés">Travaux Dirigés</option>
                <option value="Travaux Pratiques">Travaux Pratiques</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCours.map((coursItem, index) => {
            // Vérification de sécurité pour chaque cours
            if (!coursItem || !coursItem._id) return null;

            return (
              <motion.div
                key={coursItem._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {safeGetValue(coursItem, 'nom_matiere', 'Nom non défini')}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {safeGetValue(coursItem, 'description', 'Aucune description')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Programme: {coursItem.id_programme?.nom ? 
                        `${coursItem.id_programme.nom} - L${coursItem.id_programme.licence} S${coursItem.id_programme.semestre} G${coursItem.id_programme.groupe}` : 
                        'Non assigné'
                      }
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      {safeGetValue(coursItem, 'duree', '0')} heures
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm">
                      <User className="w-4 h-4 mr-2" />
                      Prof: {coursItem.id_prof && coursItem.id_prof.length > 0 ? 
                        `${coursItem.id_prof[0].prenom} ${coursItem.id_prof[0].nom}` : 
                        'Non assigné'
                      }
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      ID: {coursItem._id ? String(coursItem._id).slice(-6) : 'N/A'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => handleEdit(coursItem)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(coursItem._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCours.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours trouvé</h3>
          <p className="text-gray-500">
            {searchTerm || filterType 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre premier cours'
            }
          </p>
        </motion.div>
      )}

      {isModalOpen && (
        <CoursModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCours(null);
          }}
          cours={selectedCours}
          onSuccess={() => {
            loadCours();
            setIsModalOpen(false);
            setSelectedCours(null);
          }}
        />
      )}
    </div>
  );
};

export default CoursManagement; 