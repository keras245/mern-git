import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
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
  Settings
} from 'lucide-react';

const menuItems = [
  { title: 'Tableau de bord', path: '/chef/dashboard', icon: BarChart3, color: 'from-green-500 to-green-600' },
  { title: 'Emploi du temps', path: '/chef/emploi-temps', icon: Calendar, color: 'from-blue-500 to-blue-600' },
  { title: 'Présences', path: '/chef/presences', icon: CheckSquare, color: 'from-purple-500 to-purple-600' },
  { title: 'Feedback', path: '/chef/feedback', icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
  { title: 'Notifications', path: '/chef/notifications', icon: Bell, color: 'from-red-500 to-red-600' },
];

export default function ChefLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem?.title || 'Tableau de bord';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative bg-white shadow-2xl border-r border-gray-200"
      >
        {/* Header de la sidebar */}
        <div className="p-6 border-b border-gray-100">
          <motion.div 
            className="flex items-center"
            animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              👨‍🏫
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="ml-3"
                >
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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

        {/* Navigation */}
        <nav className="p-4 space-y-2">
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
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {/* Indicateur actif */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Icône avec gradient */}
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

                  {/* Badge de notification */}
                  {item.title === 'Notifications' && !isCollapsed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
                    >
                      5
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Profil utilisateur */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-3`}>
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.prenom?.[0]}{user.nom?.[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3"
                  >
                    <p className="text-sm font-medium text-gray-900">{user.prenom} {user.nom}</p>
                    <p className="text-xs text-gray-500">Chef de Classe - {user.classe}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bouton de déconnexion */}
          <motion.button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform duration-200" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-4 font-medium"
                >
                  Déconnexion
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Bell size={20} className="text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  5
                </span>
              </motion.button>

              {/* Profil */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-xs text-gray-600">Classe {user.classe}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.prenom?.[0]}{user.nom?.[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
