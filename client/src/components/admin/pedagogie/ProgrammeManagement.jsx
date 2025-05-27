import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, GraduationCap, Users, BookOpen, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../context/NotificationContext';
import ProgrammeModal from './ProgrammeModal';

const ProgrammeManagement = () => {
  const [programmes, setProgrammes] = useState([]);
  const [filteredProgrammes, setFilteredProgrammes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLicence, setFilterLicence] = useState('');
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadProgrammes();
  }, []);

  useEffect(() => {
    filterProgrammes();
  }, [programmes, searchTerm, filterLicence]);

  const loadProgrammes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3832/api/programmes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProgrammes(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement des programmes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterProgrammes = () => {
    let filtered = programmes;

    if (searchTerm) {
      filtered = filtered.filter(programme =>
        programme.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programme.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLicence) {
      filtered = filtered.filter(programme => programme.licence.toString() === filterLicence);
    }

    setFilteredProgrammes(filtered);
  };

  const handleEdit = (programme) => {
    setSelectedProgramme(programme);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3832/api/programmes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification('Programme supprimé avec succès', 'success');
      loadProgrammes();
    } catch (error) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const getLicenceColor = (licence) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-purple-100 text-purple-800',
      4: 'bg-orange-100 text-orange-800'
    };
    return colors[licence] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span>Programmes de Formation</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Gérez et organisez tous les programmes académiques
          </p>
        </div>
        
        <motion.button
          onClick={() => {
            setSelectedProgramme(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Programme
        </motion.button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Programmes</p>
              <p className="text-3xl font-bold">{programmes.length}</p>
            </div>
            <GraduationCap className="w-12 h-12 text-blue-200" />
          </div>
        </motion.div>

        {[1, 2, 3, 4].map((licence, index) => (
          <motion.div
            key={licence}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Licence {licence}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {programmes.filter(p => p.licence === licence).length}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getLicenceColor(licence)}`}>
                <span className="font-bold">L{licence}</span>
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
                placeholder="Rechercher un programme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterLicence}
                onChange={(e) => setFilterLicence(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tous les niveaux</option>
                <option value="1">Licence 1</option>
                <option value="2">Licence 2</option>
                <option value="3">Licence 3</option>
                <option value="4">Licence 4</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des programmes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredProgrammes.map((programme, index) => (
            <motion.div
              key={programme._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {programme.nom}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {programme.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLicenceColor(programme.licence)}`}>
                    Licence {programme.licence}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <BookOpen className="w-4 h-4 mr-1" />
                    S{programme.semestre}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    G{programme.groupe}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    ID: {programme.id_programme}
                  </span>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => handleEdit(programme)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(programme._id)}
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

      {filteredProgrammes.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun programme trouvé</h3>
          <p className="text-gray-500">
            {searchTerm || filterLicence 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre premier programme'
            }
          </p>
        </motion.div>
      )}

      <ProgrammeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programme={selectedProgramme}
        onSuccess={() => {
          loadProgrammes();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProgrammeManagement; 