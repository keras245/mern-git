import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  UserCog, 
  Search, 
  Filter,
  Download,
  Upload,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import AdminsManagement from '../../components/admin/AdminsManagement';
import ChefsManagement from '../../components/admin/ChefsManagement';
import ProfsManagement from '../../components/admin/ProfsManagement';

const Management = () => {
  const [activeTab, setActiveTab] = useState('admins');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { 
      id: 'admins', 
      label: 'Administrateurs', 
      icon: UserCog,
      count: 5,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Gérer les comptes administrateurs'
    },
    { 
      id: 'chefs', 
      label: 'Chefs de classe', 
      icon: Users,
      count: 12,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      description: 'Gérer les chefs de classe'
    },
    { 
      id: 'profs', 
      label: 'Professeurs', 
      icon: GraduationCap,
      count: 45,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Gérer les enseignants'
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-8">
      {/* En-tête avec statistiques */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des utilisateurs</h1>
            <p className="text-blue-100 text-lg">
              Administrez tous les comptes utilisateurs de la plateforme
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold">62</div>
              <div className="text-blue-200 text-sm">Total utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold flex items-center">
                <TrendingUp className="w-6 h-6 mr-1" />
                +8%
              </div>
              <div className="text-blue-200 text-sm">Ce mois</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Barre d'outils */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
            <button className="flex items-center px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Filter className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Filtres</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Upload className="w-5 h-5 mr-2" />
              Importer
            </button>
            <button className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Download className="w-5 h-5 mr-2" />
              Exporter
            </button>
            <button className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <BarChart3 className="w-5 h-5 mr-2" />
              Statistiques
            </button>
          </div>
        </div>
      </motion.div>

      {/* Onglets modernes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        {/* Navigation des onglets */}
        <div className="border-b border-gray-100 dark:border-gray-700">
          <nav className="flex">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex items-center justify-center px-6 py-6 font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Indicateur actif */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-3 rounded-xl ${isActive ? `${tab.bgColor} dark:bg-opacity-20` : 'bg-gray-100 dark:bg-gray-700'} transition-colors duration-200`}>
                      <Icon className={`w-6 h-6 ${isActive ? `bg-gradient-to-r ${tab.color} bg-clip-text text-transparent` : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{tab.label}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                          {tab.count}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* En-tête de l'onglet actif */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {currentTab?.label}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{currentTab?.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-xl ${currentTab?.bgColor} dark:bg-opacity-20 flex items-center space-x-2`}>
                <currentTab.icon className={`w-5 h-5 bg-gradient-to-r ${currentTab?.color} bg-clip-text text-transparent`} />
                <span className="font-semibold text-gray-700 dark:text-gray-300">{currentTab?.count} utilisateurs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'admins' && <AdminsManagement searchTerm={searchTerm} />}
            {activeTab === 'chefs' && <ChefsManagement searchTerm={searchTerm} />}
            {activeTab === 'profs' && <ProfsManagement searchTerm={searchTerm} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Management; 