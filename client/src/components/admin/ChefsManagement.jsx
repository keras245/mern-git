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
  Clock
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import ChefModal from './ChefModal';

const ChefsManagement = ({ searchTerm }) => {
  const [chefs, setChefs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChef, setSelectedChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const { showNotification } = useNotification();

  const fetchChefs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/chefdeclasses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const chefsData = response.data.data || response.data;
      setChefs(Array.isArray(chefsData) ? chefsData : []);
    } catch (error) {
      console.error('Erreur complète:', error.response || error);
      showNotification('Erreur lors du chargement des chefs de classe', 'error');
      setChefs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chef de classe ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3832/api/chefdeclasses/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        showNotification('Chef de classe supprimé avec succès', 'success');
        fetchChefs();
      } catch (error) {
        console.error('Erreur de suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  const filteredChefs = chefs.filter(chef => {
    const matchesSearch = chef.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chef.classe?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !filterClass || chef.classe?.toLowerCase().includes(filterClass.toLowerCase());
    
    return matchesSearch && matchesClass;
  });

  // Statistiques
  const stats = {
    total: chefs.length,
    active: chefs.length, // Tous sont considérés comme actifs pour l'instant
    thisMonth: Math.floor(Math.random() * 5) + 1, // Simulation
    classes: [...new Set(chefs.map(chef => chef.classe))].length
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Grille
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Tableau
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >
            <Filter className="w-5 h-5 mr-2 text-gray-500" />
            Filtres
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </button>
          <motion.button
            onClick={() => {
              setSelectedChef(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau chef de classe
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
                <input
                  type="text"
                  placeholder="Filtrer par classe..."
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option>Tous</option>
                  <option>Actif</option>
                  <option>Inactif</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'ajout</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilterClass('')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-green-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Actifs</p>
              <p className="text-2xl font-bold text-blue-900">{stats.active}</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Classes gérées</p>
              <p className="text-2xl font-bold text-purple-900">{stats.classes}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Ce mois</p>
              <p className="text-2xl font-bold text-orange-900">+{stats.thisMonth}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {viewMode === 'grid' ? (
        /* Vue en grille */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChefs.map((chef, index) => (
            <motion.div
              key={chef._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {chef.nom?.charAt(0)}{chef.prenom?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{chef.nom} {chef.prenom}</h3>
                    <p className="text-sm text-gray-500">Chef de classe</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-3 text-gray-400" />
                  {chef.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  {chef.telephone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <GraduationCap className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="font-medium text-green-600">{chef.classe}</span>
                </div>
                {chef.adresse && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    {chef.adresse}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Actif
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {chef.classe}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => {
                      setSelectedChef(chef);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(chef._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Vue en tableau */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chef de classe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChefs.map((chef, index) => (
                  <motion.tr
                    key={chef._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm mr-4">
                          {chef.nom?.charAt(0)}{chef.prenom?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {chef.nom} {chef.prenom}
                          </div>
                          <div className="text-sm text-gray-500">Chef de classe</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {chef.classe}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{chef.email}</div>
                      <div className="text-sm text-gray-500">{chef.telephone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Actif
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          onClick={() => {
                            setSelectedChef(chef);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(chef._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {filteredChefs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun chef de classe trouvé</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterClass ? 'Aucun résultat pour vos critères de recherche.' : 'Commencez par ajouter votre premier chef de classe.'}
          </p>
          <button
            onClick={() => {
              setSelectedChef(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un chef de classe
          </button>
        </motion.div>
      )}

      {/* Modal pour ajouter/modifier */}
      <AnimatePresence>
        {isModalOpen && (
          <ChefModal
            chef={selectedChef}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              fetchChefs();
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChefsManagement; 