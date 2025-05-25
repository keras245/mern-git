import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  BookOpen,
  Bell,
  BarChart2,
  Settings,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, role }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('emploi-du-temps');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const tabs = [
    { id: 'emploi-du-temps', label: 'Emploi du temps', icon: Calendar },
    { id: 'presences', label: 'Présences', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart2 },
    { id: 'parametres', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {role === 'admin' ? 'Admin Panel' : 'Chef de Classe Panel'}
          </h2>
        </div>
        <nav className="mt-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ x: 10 }}
              className={`flex items-center gap-3 w-full px-6 py-3 text-left ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;