import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Search,
  Calendar,
  MapPin,
  User,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ConfirmationPresences = () => {
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('en_attente');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    chargerPresences();
  }, [filter]);

  const chargerPresences = async () => {
    try {
      setLoading(true);
      
      // ✅ Utiliser la vraie API pour récupérer les présences
      const response = await api.get('/mobile/presences/en-attente', {
        params: { classe: user.classe }
      });
      
      // ✅ Vérifier si des données existent
      if (response.data && Array.isArray(response.data)) {
        const presencesTransformees = response.data.map(presence => ({
          id: presence._id,
          etudiant: {
            nom: presence.etudiant?.nom || 'Inconnu',
            prenom: presence.etudiant?.prenom || 'Inconnu',
            matricule: presence.etudiant?.matricule || 'Inconnu'
          },
          cours: {
            matiere: presence.cours?.matiere || 'Non définie',
            professeur: presence.cours?.professeur || 'Non défini',
            salle: presence.cours?.salle || 'Non définie',
            heureDebut: presence.cours?.heureDebut || '00:00',
            heureFin: presence.cours?.heureFin || '00:00'
          },
          date: presence.date ? new Date(presence.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          heureDeclaration: presence.heureDeclaration ? new Date(presence.heureDeclaration).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
          statut: presence.statut || 'en_attente'
        }));
        setPresences(presencesTransformees);
      } else {
        // ✅ Aucune donnée trouvée - liste vide
        setPresences([]);
      }
    } catch (error) {
      console.error('Erreur chargement présences:', error);
      
      // ✅ En cas d'erreur, afficher une liste vide avec message d'erreur
      setPresences([]);
      
      if (error.response?.status === 404) {
        // Route non trouvée - pas d'erreur toast, juste liste vide
        console.log('Route de présences non encore implémentée');
      } else {
        toast.error('Erreur lors du chargement des présences');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmerPresence = async (presenceId) => {
    try {
      await api.patch(`/mobile/presences/${presenceId}/confirmer`);
      toast.success('Présence confirmée avec succès !');
      chargerPresences();
    } catch (error) {
      console.error('Erreur confirmation présence:', error);
      toast.error('Erreur lors de la confirmation');
    }
  };

  const rejeterPresence = async (presenceId, raison = '') => {
    try {
      await api.patch(`/mobile/presences/${presenceId}/rejeter`, { raison });
      toast.success('Présence rejetée');
      chargerPresences();
    } catch (error) {
      console.error('Erreur rejet présence:', error);
      toast.error('Erreur lors du rejet');
    }
  };

  const presencesFiltrees = presences.filter(presence => {
    const matchSearch = presence.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       presence.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       presence.etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       presence.cours.matiere.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDate = !selectedDate || presence.date === selectedDate;
    
    return matchSearch && matchDate;
  });

  const stats = {
    total: presences.length,
    enAttente: presences.filter(p => p.statut === 'en_attente').length,
    confirmees: presences.filter(p => p.statut === 'confirmee').length,
    rejetees: presences.filter(p => p.statut === 'rejetee').length
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Validation des Présences
          </h1>
          <p className="text-gray-600">
            Confirmez ou rejetez les déclarations de présence de vos étudiants
          </p>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enAttente}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Confirmées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Rejetées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejetees}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un étudiant ou une matière..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="min-w-0 md:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en_attente">En attente</option>
                <option value="confirmee">Confirmées</option>
                <option value="rejetee">Rejetées</option>
                <option value="toutes">Toutes</option>
              </select>
            </div>
            <div className="min-w-0 md:w-48">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Liste des présences OU Message d'attente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          {presencesFiltrees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Étudiant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cours
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Heure
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {presencesFiltrees.map((presence, index) => (
                    <motion.tr
                      key={presence.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {presence.etudiant.prenom.charAt(0)}{presence.etudiant.nom.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {presence.etudiant.prenom} {presence.etudiant.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {presence.etudiant.matricule}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                          {presence.cours.matiere}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {presence.cours.salle} • {presence.cours.heureDebut}-{presence.cours.heureFin}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(presence.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          Déclarée à {presence.heureDeclaration}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          presence.statut === 'confirmee'
                            ? 'bg-green-100 text-green-800'
                            : presence.statut === 'rejetee'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {presence.statut === 'confirmee' ? 'Confirmée' : 
                           presence.statut === 'rejetee' ? 'Rejetée' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {presence.statut === 'en_attente' && (
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => confirmerPresence(presence.id)}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                              title="Confirmer la présence"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => rejeterPresence(presence.id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                              title="Rejeter la présence"
                            >
                              <XCircle className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                        {presence.statut !== 'en_attente' && (
                          <span className="text-sm text-gray-400">Traitée</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune demande de présence
              </h3>
              <p className="text-gray-600 mb-4">
                Les étudiants n'ont pas encore envoyé de demandes de validation de présence.
              </p>
              <p className="text-sm text-gray-500">
                Les demandes apparaîtront ici une fois que les étudiants déclareront leur présence via l'application mobile.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationPresences; 