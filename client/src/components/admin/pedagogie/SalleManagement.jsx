import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Building2, Users, MapPin, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';
import SalleModal from './SalleModal';

const SalleManagement = () => {
  const [salles, setSalles] = useState([]);
  const [filteredSalles, setFilteredSalles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalle, setSelectedSalle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadSalles();
  }, []);

  useEffect(() => {
    filterSalles();
  }, [salles, searchTerm, filterType]);

  const loadSalles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/salles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSalles(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des salles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterSalles = () => {
    let filtered = salles;

    if (searchTerm) {
      filtered = filtered.filter(salle =>
        salle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salle.batiment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(salle => salle.type === filterType);
    }

    setFilteredSalles(filtered);
  };

  const handleEdit = (salle) => {
    setSelectedSalle(salle);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3832/api/salles/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification('Salle supprimée avec succès', 'success');
      loadSalles();
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Amphithéâtre': 'bg-purple-100 text-purple-800',
      'Salle de cours': 'bg-blue-100 text-blue-800',
      'Laboratoire': 'bg-green-100 text-green-800',
      'Salle informatique': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getCapacityColor = (capacite) => {
    if (capacite >= 100) return 'text-purple-600';
    if (capacite >= 50) return 'text-blue-600';
    if (capacite >= 25) return 'text-green-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-purple-600" />
            <span>Gestion des Salles</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Administrez tous les espaces de cours et laboratoires
          </p>
        </div>
        
        <motion.button
          onClick={() => {
            setSelectedSalle(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Salle
        </motion.button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Salles</p>
              <p className="text-3xl font-bold">{salles.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Capacité Totale</p>
              <p className="text-2xl font-bold text-gray-900">
                {salles.reduce((sum, salle) => sum + salle.capacite, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Laboratoires</p>
              <p className="text-2xl font-bold text-gray-900">
                {salles.filter(s => s.type === 'Laboratoire').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Amphithéâtres</p>
              <p className="text-2xl font-bold text-gray-900">
                {salles.filter(s => s.type === 'Amphithéâtre').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une salle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="">Tous les types</option>
                <option value="Amphithéâtre">Amphithéâtre</option>
                <option value="Salle de cours">Salle de cours</option>
                <option value="Laboratoire">Laboratoire</option>
                <option value="Salle informatique">Salle informatique</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des salles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredSalles.map((salle, index) => (
            <motion.div
              key={salle._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {salle.nom}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {salle.batiment}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(salle.type)}`}>
                    {salle.type}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      Capacité
                    </div>
                    <span className={`text-2xl font-bold ${getCapacityColor(salle.capacite)}`}>
                      {salle.capacite}
                    </span>
                  </div>
                  
                  {salle.equipements && salle.equipements.length > 0 && (
                    <div className="text-gray-500 text-sm">
                      <span className="font-medium">Équipements:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {salle.equipements.slice(0, 3).map((eq, idx) => (
                          <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {eq}
                          </span>
                        ))}
                        {salle.equipements.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{salle.equipements.length - 3} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    ID: {salle.id_salle}
                  </span>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => handleEdit(salle)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(salle._id)}
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
          ))}
        </AnimatePresence>
      </div>

      {filteredSalles.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune salle trouvée</h3>
          <p className="text-gray-500">
            {searchTerm || filterType 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre première salle'
            }
          </p>
        </motion.div>
      )}

      <SalleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        salle={selectedSalle}
        onSuccess={() => {
          loadSalles();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default SalleManagement; 