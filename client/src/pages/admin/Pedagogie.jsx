import { useState } from 'react';
import { BookOpen, GraduationCap, Building2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgrammeManagement from '../../components/admin/pedagogie/ProgrammeManagement';
import CoursManagement from '../../components/admin/pedagogie/CoursManagement';
import SalleManagement from '../../components/admin/pedagogie/SalleManagement';

const Pedagogie = () => {
  const [activeTab, setActiveTab] = useState('programmes');

  const tabs = [
    { 
      id: 'programmes', 
      label: 'Programmes', 
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      description: 'Gérer les programmes de formation'
    },
    { 
      id: 'cours', 
      label: 'Cours', 
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-600',
      description: 'Organiser les cours et matières'
    },
    { 
      id: 'salles', 
      label: 'Salles', 
      icon: Building2,
      color: 'from-purple-500 to-violet-600',
      description: 'Administrer les espaces de cours'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* En-tête avec gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Gestion Pédagogique</h1>
                <p className="text-xl text-indigo-100">
                  Orchestrez l'excellence académique avec nos outils de gestion
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation par onglets moderne */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="border-b border-gray-100">
            <nav className="flex" aria-label="Tabs">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 relative py-6 px-8 text-center transition-all duration-300 border-b-4
                      ${isActive
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg border-transparent`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-200'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <tab.icon className="w-6 h-6" />
                      <span className="font-semibold text-lg">{tab.label}</span>
                      <span className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {tab.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-8">
            {activeTab === 'programmes' && (
              <motion.div
                key="programmes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProgrammeManagement />
              </motion.div>
            )}
            
            {activeTab === 'cours' && (
              <motion.div
                key="cours"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CoursManagement />
              </motion.div>
            )}
            
            {activeTab === 'salles' && (
              <motion.div
                key="salles"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SalleManagement />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pedagogie; 