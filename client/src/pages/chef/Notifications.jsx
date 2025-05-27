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
  StarOff
} from 'lucide-react';

const notificationTypes = {
  info: { icon: Info, color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  success: { icon: CheckCircle, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-600' },
  warning: { icon: AlertCircle, color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
  error: { icon: X, color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-600' },
  message: { icon: MessageSquare, color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  schedule: { icon: Calendar, color: 'indigo', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' }
};

const mockNotifications = [
  {
    id: 1,
    type: 'schedule',
    title: 'Modification d\'emploi du temps',
    message: 'Le cours de Mathématiques de demain (14h-16h) a été déplacé en salle B205.',
    time: '2024-01-15T10:30:00Z',
    read: false,
    important: true,
    sender: 'Administration'
  },
  {
    id: 2,
    type: 'info',
    title: 'Nouvelle attribution temporaire',
    message: 'Prof. Martin remplacera Prof. Dubois pour le cours de Physique cette semaine.',
    time: '2024-01-15T09:15:00Z',
    read: false,
    important: false,
    sender: 'Département'
  },
  {
    id: 3,
    type: 'success',
    title: 'Feedback traité',
    message: 'Votre feedback concernant l\'équipement informatique a été pris en compte.',
    time: '2024-01-14T16:45:00Z',
    read: true,
    important: false,
    sender: 'Support Technique'
  },
  {
    id: 4,
    type: 'warning',
    title: 'Présence non déclarée',
    message: 'Rappel : La présence pour le cours d\'Anglais d\'hier n\'a pas été déclarée.',
    time: '2024-01-14T14:20:00Z',
    read: false,
    important: true,
    sender: 'Système'
  },
  {
    id: 5,
    type: 'message',
    title: 'Message du directeur',
    message: 'Réunion des chefs de classe prévue vendredi 19 janvier à 10h en salle de conférence.',
    time: '2024-01-14T11:00:00Z',
    read: true,
    important: true,
    sender: 'Direction'
  },
  {
    id: 6,
    type: 'info',
    title: 'Mise à jour système',
    message: 'Le système sera en maintenance dimanche de 2h à 6h du matin.',
    time: '2024-01-13T18:30:00Z',
    read: true,
    important: false,
    sender: 'IT Support'
  },
  {
    id: 7,
    type: 'error',
    title: 'Problème technique',
    message: 'Le projecteur de la salle A101 est en panne. Merci de signaler tout problème similaire.',
    time: '2024-01-13T15:20:00Z',
    read: false,
    important: true,
    sender: 'Maintenance'
  },
  {
    id: 8,
    type: 'success',
    title: 'Présence validée',
    message: 'Toutes les présences de la semaine dernière ont été validées avec succès.',
    time: '2024-01-12T17:00:00Z',
    read: true,
    important: false,
    sender: 'Système'
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Statistiques
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    important: notifications.filter(n => n.important).length,
    today: notifications.filter(n => {
      const today = new Date().toDateString();
      return new Date(n.time).toDateString() === today;
    }).length
  };

  // Filtrage des notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.read) ||
                         (filterStatus === 'unread' && !notification.read) ||
                         (filterStatus === 'important' && notification.important);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Formatage du temps
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

  // Actions sur les notifications
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAsUnread = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
  };

  const toggleImportant = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, important: !n.important } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Gérez vos notifications et messages importants</p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Check size={16} />
              <span>Tout marquer lu</span>
            </motion.button>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings size={20} className="text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'blue', icon: Bell },
            { label: 'Non lues', value: stats.unread, color: 'red', icon: AlertCircle },
            { label: 'Importantes', value: stats.important, color: 'yellow', icon: Star },
            { label: 'Aujourd\'hui', value: stats.today, color: 'green', icon: Clock }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Actions de sélection */}
          {selectedNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2"
            >
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} sélectionnée(s)
              </span>
              <button
                onClick={deleteSelected}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center space-x-1"
              >
                <Trash2 size={16} />
                <span>Supprimer</span>
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Désélectionner
              </button>
            </motion.div>
          )}

          {/* Boutons de sélection */}
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAll}
              className="px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm"
            >
              Tout sélectionner
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Tous les types</option>
                    <option value="info">Information</option>
                    <option value="success">Succès</option>
                    <option value="warning">Avertissement</option>
                    <option value="error">Erreur</option>
                    <option value="message">Message</option>
                    <option value="schedule">Emploi du temps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="unread">Non lues</option>
                    <option value="read">Lues</option>
                    <option value="important">Importantes</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.map((notification, index) => {
            const typeConfig = notificationTypes[notification.type];
            const Icon = typeConfig.icon;
            const isSelected = selectedNotifications.includes(notification.id);

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-green-500' : 'border-gray-100'
                } ${isSelected ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox de sélection */}
                  <motion.button
                    onClick={() => toggleSelectNotification(notification.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </motion.button>

                  {/* Icône du type */}
                  <div className={`p-3 rounded-xl ${typeConfig.bgColor} flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${typeConfig.textColor}`} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {notification.important && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{formatTime(notification.time)}</span>
                        <div className="relative group">
                          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>
                          
                          {/* Menu contextuel */}
                          <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                              onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Eye size={16} />
                              <span>{notification.read ? 'Marquer non lu' : 'Marquer lu'}</span>
                            </button>
                            <button
                              onClick={() => toggleImportant(notification.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              {notification.important ? <StarOff size={16} /> : <Star size={16} />}
                              <span>{notification.important ? 'Retirer importance' : 'Marquer important'}</span>
                            </button>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Trash2 size={16} />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 leading-relaxed">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-500">{notification.sender}</span>
                      </div>
                      
                      {!notification.read && (
                        <motion.button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Marquer lu
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Message si aucune notification */}
        {filteredNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification trouvée</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Essayez de modifier vos critères de recherche ou filtres.'
                : 'Vous n\'avez aucune notification pour le moment.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}