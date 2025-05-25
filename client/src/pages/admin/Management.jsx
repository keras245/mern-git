import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, UserCog } from 'lucide-react';
import AdminsManagement from '../../components/admin/AdminsManagement';
import ChefsManagement from '../../components/admin/ChefsManagement';
import ProfsManagement from '../../components/admin/ProfsManagement';

const Management = () => {
  const [activeTab, setActiveTab] = useState('admins');

  const tabs = [
    { id: 'admins', label: 'Administrateurs', icon: UserCog },
    { id: 'chefs', label: 'Chefs de classe', icon: Users },
    { id: 'profs', label: 'Professeurs', icon: GraduationCap }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
        <p className="text-gray-600">Gérez les administrateurs, chefs de classe et professeurs</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'admins' && <AdminsManagement />}
        {activeTab === 'chefs' && <ChefsManagement />}
        {activeTab === 'profs' && <ProfsManagement />}
      </div>
    </div>
  );
};

export default Management; 