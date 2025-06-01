import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical, 
  Check, 
  X, 
  Eye, 
  Trash2,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Calendar,
  User,
  MessageSquare,
  Settings,
  Archive,
  Star,
  StarOff,
  Send,
  Plus,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  Edit,
  Target,
  Megaphone,
  Zap
} from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const notificationTypes = {
  info: { icon: Info, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600', label: 'Information' },
  success: { icon: CheckCircle, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-600', label: 'Succès' },
  warning: { icon: AlertCircle, color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', label: 'Avertissement' },
  error: { icon: X, color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-600', label: 'Erreur' },
  message: { icon: MessageSquare, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-600', label: 'Message' },
  schedule: { icon: Calendar, color: 'indigo', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', label: 'Emploi du temps' }
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRecipient, setFilterRecipient] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    important: 0,
    today: 0,
    byType: {},
    byRecipient: {}
  });
  const [pageActuelle, setPageActuelle] = useState(1);
  const [notificationsParPage] = useState(15);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    important: false,
    recipientType: 'all',
    specificRecipient: ''
  });
  const [sendingNotification, setSendingNotification] = useState(false);
  const [chefs, setChefs] = useState([]);

  const { showNotification } = useNotification();

  useEffect(() => {
    chargerNotifications();
    chargerChefs();
    chargerStatistiques();
  }, []);

  const chargerNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/admin');
      console.log('Notifications admin reçues:', response.data);
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setNotifications([]);
      showNotification('Erreur lors du chargement des notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const chargerChefs = async () => {
    try {
      const response = await api.get('/administrateurs/chefs');
      console.log('Chefs reçus:', response.data);
      setChefs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur chargement chefs:', error);
      setChefs([]);
      showNotification('Erreur lors du chargement des chefs de classe', 'error');
    }
  };

  const chargerStatistiques = async () => {
    try {
      const response = await api.get('/notifications/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      calculerStatsLocales();
    }
  };

  const calculerStatsLocales = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const important = notifications.filter(n => n.important).length;
    const today = notifications.filter(n => {
      const today = new Date().toDateString();
      return new Date(n.createdAt).toDateString() === today;
    }).length;

    // Stats par type
    const byType = {};
    notifications.forEach(n => {
      byType[n.type] = (byType[n.type] || 0) + 1;
    });

    // Stats par destinataire
    const byRecipient = {};
    notifications.forEach(n => {
      const key = n.recipientType === 'all' ? 'Tous' : 'Spécifique';
      byRecipient[key] = (byRecipient[key] || 0) + 1;
    });

    setStats({ total, unread, important, today, byType, byRecipient });
  };

  // Recalculer les stats quand les notifications changent
  useEffect(() => {
    if (notifications.length > 0) {
      calculerStatsLocales();
    }
  }, [notifications]);

  const filtrerNotifications = () => {
    let resultat = [...notifications];

    // Filtre par recherche
    if (searchTerm.trim()) {
      const termes = searchTerm.toLowerCase().trim();
      resultat = resultat.filter(n => 
        n.title.toLowerCase().includes(termes) ||
        n.message.toLowerCase().includes(termes) ||
        n.sender.toLowerCase().includes(termes)
      );
    }

    // Filtre par type
    if (filterType !== 'all') {
      resultat = resultat.filter(n => n.type === filterType);
    }

    // Filtre par statut
    if (filterStatus === 'read') {
      resultat = resultat.filter(n => n.read);
    } else if (filterStatus === 'unread') {
      resultat = resultat.filter(n => !n.read);
    } else if (filterStatus === 'important') {
      resultat = resultat.filter(n => n.important);
    }

    // Filtre par destinataire
    if (filterRecipient === 'all_recipients') {
      resultat = resultat.filter(n => n.recipientType === 'all');
    } else if (filterRecipient === 'specific') {
      resultat = resultat.filter(n => n.recipientType !== 'all');
    }

    // Tri par date (plus récent en premier)
    resultat.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return resultat;
  };

  const notificationsFiltrees = filtrerNotifications();
  const indexDerniere = pageActuelle * notificationsParPage;
  const indexPremiere = indexDerniere - notificationsParPage;
  const notificationsActuelles = notificationsFiltrees.slice(indexPremiere, indexDerniere);
  const nombrePages = Math.ceil(notificationsFiltrees.length / notificationsParPage);

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const creerNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (newNotification.recipientType === 'specific' && !newNotification.specificRecipient) {
      showNotification('Veuillez sélectionner un destinataire', 'error');
      return;
    }

    try {
      setSendingNotification(true);
      
      const notificationData = {
        title: newNotification.title.trim(),
        message: newNotification.message.trim(),
        type: newNotification.type,
        important: newNotification.important,
        sender: 'Administration',
        senderType: 'admin'
      };

      if (newNotification.recipientType === 'all') {
        notificationData.recipient = 'all';
        notificationData.recipientType = 'chef';
      } else {
        notificationData.recipient = newNotification.specificRecipient;
        notificationData.recipientType = 'chef';
      }

      console.log('Envoi notification:', notificationData);
      const response = await api.post('/notifications/admin/create', notificationData);
      
      setShowCreateModal(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        important: false,
        recipientType: 'all',
        specificRecipient: ''
      });
      
      chargerNotifications();
      chargerStatistiques();
      
      if (response.data.count) {
        showNotification(`Notification envoyée à ${response.data.count} chef(s) de classe`, 'success');
      } else {
        showNotification('Notification envoyée avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur création notification:', error);
      showNotification('Erreur lors de l\'envoi de la notification', 'error');
    } finally {
      setSendingNotification(false);
    }
  };

  const supprimerNotification = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      return;
    }

    try {
      await api.delete(`/notifications/admin/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      showNotification('Notification supprimée avec succès', 'success');
      chargerStatistiques();
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const supprimerSelections = async () => {
    if (selectedNotifications.length === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedNotifications.length} notification(s) ?`)) {
      return;
    }

    try {
      await api.delete('/notifications/admin/bulk', {
        data: { ids: selectedNotifications }
      });
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
      setSelectedNotifications([]);
      showNotification(`${selectedNotifications.length} notification(s) supprimée(s)`, 'success');
      chargerStatistiques();
    } catch (error) {
      console.error('Erreur suppression multiple:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(notificationsActuelles.map(n => n._id));
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  const exporterNotifications = () => {
    const dataExport = notificationsFiltrees.map(n => ({
      ID: n._id,
      Titre: n.title,
      Message: n.message,
      Type: notificationTypes[n.type]?.label || n.type,
      Destinataire: n.recipientType === 'all' ? 'Tous les chefs' : 'Spécifique',
      Expéditeur: n.sender,
      Important: n.important ? 'Oui' : 'Non',
      Date: new Date(n.createdAt).toLocaleDateString('fr-FR'),
      Heure: new Date(n.createdAt).toLocaleTimeString('fr-FR')
    }));

    const csv = [
      Object.keys(dataExport[0]).join(','),
      ...dataExport.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications_admin_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Notifications
            </h1>
            <p className="text-gray-600">
              Créez et gérez les notifications pour tous les chefs de classe
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvelle notification
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={chargerNotifications}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exporterNotifications}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter
            </motion.button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500', icon: Bell },
            { label: 'Non lues', value: stats.unread, color: 'bg-red-500', icon: AlertCircle },
            { label: 'Importantes', value: stats.important, color: 'bg-yellow-500', icon: Star },
            { label: 'Aujourd\'hui', value: stats.today, color: 'bg-green-500', icon: Clock }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                    <IconComponent className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            {Object.entries(notificationTypes).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          {/* Filtre statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
            <option value="important">Importantes</option>
          </select>

          {/* Filtre destinataire */}
          <select
            value={filterRecipient}
            onChange={(e) => setFilterRecipient(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les destinataires</option>
            <option value="all_recipients">Envoi groupé</option>
            <option value="specific">Envoi spécifique</option>
          </select>
        </div>

        {/* Actions de sélection */}
        {selectedNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between"
          >
            <span className="text-sm text-gray-600">
              {selectedNotifications.length} notification(s) sélectionnée(s)
            </span>
            <div className="flex gap-2">
              <button
                onClick={supprimerSelections}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Désélectionner
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Liste des notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        {notificationsActuelles.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">Aucune notification trouvée</p>
            <p className="text-gray-400">
              {notifications.length === 0 
                ? "Aucune notification n'a encore été créée"
                : "Modifiez vos filtres pour voir plus de résultats"
              }
            </p>
            {notifications.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                Créer la première notification
              </motion.button>
            )}
          </div>
        ) : (
          <>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {notificationsFiltrees.length} notification{notificationsFiltrees.length !== 1 ? 's' : ''} trouvée{notificationsFiltrees.length !== 1 ? 's' : ''}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    Tout sélectionner
                  </button>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    Page {pageActuelle} sur {nombrePages}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {notificationsActuelles.map((notification, index) => {
                  const typeConfig = notificationTypes[notification.type];
                  const Icon = typeConfig.icon;
                  const isSelected = selectedNotifications.includes(notification._id);

                  return (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-orange-500 ring-opacity-50 bg-orange-50' : 'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => toggleSelectNotification(notification._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Checkbox */}
                          <motion.div
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-orange-500 border-orange-500' 
                                : 'border-gray-300 hover:border-orange-400'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {isSelected && <Check size={12} className="text-white" />}
                          </motion.div>

                          {/* Icône du type */}
                          <div className={`p-3 rounded-xl ${typeConfig.bgColor} flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${typeConfig.textColor}`} />
                          </div>

                          {/* Contenu */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              {notification.important && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                                {typeConfig.label}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mb-3 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                <User className="w-4 h-4 inline mr-1" />
                                {notification.sender}
                              </span>
                              <span>
                                <Target className="w-4 h-4 inline mr-1" />
                                {notification.recipientType === 'all' ? 'Tous les chefs' : 'Spécifique'}
                              </span>
                              <span>
                                <Clock className="w-4 h-4 inline mr-1" />
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              supprimerNotification(notification._id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {nombrePages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Affichage de {indexPremiere + 1} à {Math.min(indexDerniere, notificationsFiltrees.length)} sur {notificationsFiltrees.length}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPageActuelle(prev => Math.max(prev - 1, 1))}
                      disabled={pageActuelle === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                    
                    {[...Array(nombrePages)].map((_, i) => {
                      const numero = i + 1;
                      if (
                        numero === 1 || 
                        numero === nombrePages || 
                        (numero >= pageActuelle - 1 && numero <= pageActuelle + 1)
                      ) {
                        return (
                          <button
                            key={numero}
                            onClick={() => setPageActuelle(numero)}
                            className={`px-3 py-1 border rounded ${
                              pageActuelle === numero
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {numero}
                          </button>
                        );
                      } else if (
                        (numero === pageActuelle - 2 && numero > 1) ||
                        (numero === pageActuelle + 2 && numero < nombrePages)
                      ) {
                        return <span key={numero} className="px-2">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setPageActuelle(prev => Math.min(prev + 1, nombrePages))}
                      disabled={pageActuelle === nombrePages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modal création notification */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Créer une nouvelle notification
                    </h3>
                    <p className="text-gray-600">
                      Envoyez une notification à tous les chefs de classe ou à un chef spécifique
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre de la notification"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={newNotification.message}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Contenu de la notification"
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={newNotification.type}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {Object.entries(notificationTypes).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Destinataire */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destinataire
                      </label>
                      <select
                        value={newNotification.recipientType}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, recipientType: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="all">Tous les chefs de classe</option>
                        <option value="specific">Chef spécifique</option>
                      </select>
                    </div>
                  </div>

                  {/* Chef spécifique */}
                  {newNotification.recipientType === 'specific' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chef de classe
                      </label>
                      <select
                        value={newNotification.specificRecipient}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, specificRecipient: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un chef</option>
                        {chefs.map(chef => (
                          <option key={chef._id} value={chef._id}>
                            {chef.prenom} {chef.nom} - {chef.classe}
                          </option>
                        ))}
                      </select>
                      {chefs.length === 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Aucun chef de classe disponible
                        </p>
                      )}
                    </div>
                  )}

                  {/* Important */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="important"
                      checked={newNotification.important}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, important: e.target.checked }))}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="important" className="ml-2 text-sm text-gray-700">
                      Marquer comme importante
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={creerNotification}
                    disabled={sendingNotification || !newNotification.title.trim() || !newNotification.message.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingNotification ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {sendingNotification ? 'Envoi...' : 'Envoyer'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNotifications; 