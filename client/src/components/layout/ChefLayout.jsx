import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  BarChart3,
  Calendar,
  CheckSquare,
  MessageSquare,
  Bell,
  User,
  Settings,
  Users,
  UserCheck
} from 'lucide-react';
import api from '../../services/api';

const menuItems = [
  { title: 'Tableau de bord', path: '/chef/dashboard', icon: BarChart3, color: 'from-green-500 to-green-600' },
  { title: 'Emploi du temps', path: '/chef/emploi-temps', icon: Calendar, color: 'from-blue-500 to-blue-600' },
  { title: 'Présences', path: '/chef/presences', icon: CheckSquare, color: 'from-purple-500 to-purple-600' },
  { title: 'Feedback', path: '/chef/feedback', icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
  { title: 'Notifications', path: '/chef/notifications', icon: Bell, color: 'from-red-500 to-red-600' },
  { title: 'Ma Classe', path: '/chef/ma-classe', icon: Users, color: 'from-indigo-500 to-indigo-600' },
  { title: 'Validation Présences', path: '/chef/validation-presences', icon: UserCheck, color: 'from-teal-500 to-teal-600' },
];

export default function ChefLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem?.title || 'Tableau de bord';
  };

  const handleSettingsClick = () => {
    navigate('/chef/settings');
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Charger le nombre de notifications non lues
  useEffect(() => {
    const chargerNotificationsNonLues = async () => {
      try {
        const response = await api.get('/notifications');
        if (response.data.stats) {
          setUnreadCount(response.data.stats.unread || 0);
        } else if (Array.isArray(response.data)) {
          const unread = response.data.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Erreur chargement notifications:', error);
        setUnreadCount(0);
      }
    };

    chargerNotificationsNonLues();
    const interval = setInterval(chargerNotificationsNonLues, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar - SANS SECTION PROFIL */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed h-screen bg-white shadow-2xl border-r border-gray-200 flex flex-col z-50"
      >
        {/* Header de la sidebar */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <motion.div 
            className="flex items-center"
            animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              E
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="ml-3"
                >
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    EduFlex
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Chef de Classe</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Toggle button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-20 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </motion.div>
        </motion.button>

        {/* Navigation - Prend maintenant tout l'espace disponible */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-50 to-teal-50 text-green-600 shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <div className={`relative p-2 rounded-lg ${isActive ? `bg-gradient-to-r ${item.color}` : 'bg-gray-100 group-hover:bg-gray-200'} transition-all duration-200`}>
                    <Icon 
                      size={20} 
                      className={isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-700'} 
                    />
                  </div>
                  
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-4 font-medium"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Badge de notification dynamique pour les notifications */}
                  {item.title === 'Notifications' && !isCollapsed && unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Section Profil SIMPLIFIÉE */}
        <div className="p-4 border-t border-gray-100 mt-auto">
          <AnimatePresence>
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.prenom?.[0]}{user.nom?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.prenom} {user.nom}
                    </p>
                    <p className="text-xs text-gray-500 truncate">Chef de classe</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Déconnexion
                  </button>
                </div>
                  </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Déconnexion"
          >
                  <LogOut size={20} />
                </button>
              </motion.div>
              )}
            </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.div 
        className="flex-1 flex flex-col"
        animate={{ marginLeft: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header avec UNE SEULE section profil */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-900"
              >
                {getCurrentPageTitle()}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-1"
              >
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </motion.p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <motion.button
                onClick={() => navigate('/chef/notifications')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Paramètres */}
              <motion.button
                onClick={handleSettingsClick}
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="Paramètres"
              >
                <Settings size={20} className="text-gray-600" />
              </motion.button>

              {/* Profil avec menu déroulant */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-xs text-gray-600">Classe {user.classe}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.prenom?.[0]}{user.nom?.[0]}
                </div>
                </motion.button>

                {/* Menu déroulant profil */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      <button
                        onClick={() => {
                          navigate('/chef/profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <User size={16} className="mr-3" />
                        Mon profil
                      </button>
                      <button
                        onClick={handleSettingsClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Settings size={16} className="mr-3" />
                        Paramètres
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut size={16} className="mr-3" />
                        Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}
