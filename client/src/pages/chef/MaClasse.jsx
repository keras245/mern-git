import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MaClasse = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('tous');
  const [showModal, setShowModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    programme_id: '',
    mot_de_passe: '',
    groupe: '1'
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    chargerEtudiants();
    chargerProgrammes();
  }, []);

  const chargerProgrammes = async () => {
    try {
      const response = await api.get('/mobile/programmes');
      setProgrammes(response.data);
    } catch (error) {
      console.error('Erreur chargement programmes:', error);
      setProgrammes([]);
      toast.error('Erreur lors du chargement des programmes');
    }
  };

  const chargerEtudiants = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/mobile/etudiants', {
        params: { classe: user.classe }
      });
      
      const etudiantsTransformes = response.data.map(etudiant => {
        return {
          id: etudiant._id,
          matricule: etudiant.matricule,
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          email: etudiant.email,
          telephone: etudiant.telephone,
          classe: etudiant.programme_id 
            ? `${etudiant.programme_id.nom} - ${etudiant.programme_id.licence} ${etudiant.programme_id.semestre}` 
            : 'Non définie',
          classeSimple: etudiant.programme_id?.nom || 'Non définie',
          groupe: etudiant.groupe,
          dateInscription: etudiant.createdAt || new Date().toISOString(),
        };
      });
      
      setEtudiants(etudiantsTransformes);
      
      if (etudiantsTransformes.length === 0) {
        toast.info('Aucun étudiant trouvé pour votre classe');
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement étudiants:', error);
      toast.error('Erreur lors du chargement des étudiants');
      setEtudiants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEtudiant = () => {
    setModalMode('create');
    
    let programmeSelectionne = '';
    if (user.classe && programmes.length > 0) {
      const classeBase = user.classe.split(' - ')[0];
      const programmeCorrespondant = programmes.find(p => 
        p.nom.toLowerCase().includes(classeBase.toLowerCase()) ||
        classeBase.toLowerCase().includes(p.nom.toLowerCase())
      );
      if (programmeCorrespondant) {
        programmeSelectionne = programmeCorrespondant._id;
      }
    }
    
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      programme_id: programmeSelectionne,
      mot_de_passe: '',
      groupe: '1'
    });
    setSelectedEtudiant(null);
    setShowModal(true);
  };

  const handleEditEtudiant = (etudiant) => {
    setModalMode('edit');
    
    const programmeId = programmes.find(p => p.nom === etudiant.classeSimple)?._id || '';
    
    setFormData({
      matricule: etudiant.matricule,
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      email: etudiant.email,
      telephone: etudiant.telephone,
      programme_id: programmeId,
      mot_de_passe: '',
      groupe: etudiant.groupe
    });
    setSelectedEtudiant(etudiant);
    setShowModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (modalMode === 'create') {
        response = await api.post('/mobile/test/etudiant', formData);
        toast.success(`✅ Étudiant ${formData.prenom} ${formData.nom} créé avec succès !`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        response = await api.put(`/mobile/etudiants/${selectedEtudiant.id}`, formData);
        toast.success(`✅ Étudiant ${formData.prenom} ${formData.nom} modifié avec succès !`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      setShowModal(false);
      chargerEtudiants();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde étudiant:', error);
      
      const errorMessage = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleDeleteEtudiant = async (etudiantId, etudiantNom, etudiantPrenom) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant ${etudiantPrenom} ${etudiantNom} ?`)) {
      try {
        await api.delete(`/mobile/etudiants/${etudiantId}`);
        
        toast.success(`✅ Étudiant ${etudiantPrenom} ${etudiantNom} supprimé avec succès !`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        chargerEtudiants();
      } catch (error) {
        console.error('Erreur suppression étudiant:', error);
        
        const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
        toast.error(`❌ ${errorMessage}`, {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const etudiantsFiltres = etudiants.filter(etudiant => {
    const matchSearch = etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchFilter = selectedFilter === 'tous';
    
    return matchSearch && matchFilter;
  });

  const stats = {
    total: etudiants.length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ma Classe - {user.classe || 'Non définie'}
            </h1>
            <p className="text-gray-600">
              Gestion des étudiants de votre classe
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateEtudiant}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nouvel Étudiant
          </motion.button>
        </motion.div>

        {/* Statistiques - Simplifiées */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Étudiants</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Programmes Disponibles</p>
                <p className="text-3xl font-bold text-gray-900">{programmes.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Classe Actuelle</p>
                <p className="text-lg font-bold text-gray-900 truncate">{user.classe || 'Non définie'}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtres et recherche - Simplifiés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tableau des étudiants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programme
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Groupe
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {etudiantsFiltres.map((etudiant, index) => (
                  <motion.tr
                    key={etudiant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {etudiant.prenom[0]}{etudiant.nom[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {etudiant.prenom} {etudiant.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {etudiant.matricule}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {etudiant.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {etudiant.telephone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{etudiant.classe}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Groupe {etudiant.groupe}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditEtudiant(etudiant)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteEtudiant(etudiant.id, etudiant.nom, etudiant.prenom)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          title="Supprimer"
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
          
          {etudiantsFiltres.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun étudiant trouvé
              </h3>
              <p className="text-gray-600">
                {etudiants.length === 0 
                  ? 'Aucun étudiant dans votre classe pour le moment.'
                  : 'Aucun étudiant ne correspond aux critères de recherche.'
                }
              </p>
            </div>
          )}
        </motion.div>

        {/* Modal de création/modification */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                {/* Header du modal */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {modalMode === 'create' ? 'Nouvel Étudiant' : 'Modifier l\'Étudiant'}
                      </h2>
                      <p className="text-blue-100 mt-1">
                        {modalMode === 'create' 
                          ? 'Ajouter un nouvel étudiant à votre classe' 
                          : 'Modifier les informations de l\'étudiant'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Corps du modal */}
                <div className="p-6">
                  <form onSubmit={handleSubmitForm} className="space-y-6">
                    {/* Informations personnelles */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        Informations personnelles
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Matricule *
                          </label>
                          <input
                            type="text"
                            value={formData.matricule}
                            onChange={(e) => setFormData({...formData, matricule: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Ex: ETU2024001"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Programme *
                          </label>
                          <select
                            value={formData.programme_id}
                            onChange={(e) => setFormData({...formData, programme_id: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            required
                          >
                            <option value="">Sélectionner un programme</option>
                            {programmes.map(programme => (
                              <option key={programme._id} value={programme._id}>
                                {programme.nom} - {programme.licence} {programme.semestre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({...formData, nom: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Nom de famille"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            value={formData.prenom}
                            onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Prénom"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Téléphone *
                          </label>
                          <input
                            type="tel"
                            value={formData.telephone}
                            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="+224 xxx xxx xxx"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Groupe *
                          </label>
                          <select
                            value={formData.groupe}
                            onChange={(e) => setFormData({...formData, groupe: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            required
                          >
                            <option value="">Sélectionner un groupe</option>
                            <option value="1">Groupe 1</option>
                            <option value="2">Groupe 2</option>
                            <option value="3">Groupe 3</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Informations de connexion */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        Informations de connexion
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="email@example.com"
                            required
                          />
                        </div>

                        {modalMode === 'create' && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mot de passe *
                            </label>
                            <input
                              type="password"
                              value={formData.mot_de_passe}
                              onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="Mot de passe sécurisé"
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-lg"
                      >
                        {modalMode === 'create' ? 'Créer l\'étudiant' : 'Sauvegarder les modifications'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MaClasse; 