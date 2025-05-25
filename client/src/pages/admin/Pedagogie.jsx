import { useState } from 'react';
import { BookOpen, GraduationCap, Building2 } from 'lucide-react';
import ProgrammeManagement from '../../components/admin/pedagogie/ProgrammeManagement';
import CoursManagement from '../../components/admin/pedagogie/CoursManagement';
import SalleManagement from '../../components/admin/pedagogie/SalleManagement';

const Pedagogie = () => {
  const [activeTab, setActiveTab] = useState('programmes');

  const tabs = [
    { id: 'programmes', label: 'Programmes', icon: GraduationCap },
    { id: 'cours', label: 'Cours', icon: BookOpen },
    { id: 'salles', label: 'Salles', icon: Building2 }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion Pédagogique</h1>
        <p className="mt-2 text-gray-600">Gérez les programmes, cours et salles</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {<tab.icon className="h-5 w-5 mr-2" />}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'programmes' && <ProgrammeManagement />}
          {activeTab === 'cours' && <CoursManagement />}
          {activeTab === 'salles' && <SalleManagement />}
        </div>
      </div>
    </div>
  );
};

export default Pedagogie; 