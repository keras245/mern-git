import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const menuItems = [
  { title: 'Tableau de bord', path: '/admin/dashboard', icon: '📊' },
  { title: 'Utilisateurs', path: '/admin/management', icon: '⚙️' },
  { title: 'Pédagogie', path: '/admin/pedagogie', icon: '🎓' },
  { title: 'Emplois du temps', path: '/admin/schedules', icon: '📅' },
  { title: 'Présences', path: '/admin/attendance', icon: '✅' },
  { title: 'Feedback', path: '/admin/feedback', icon: '💬' },
  { title: 'Notifications', path: '/admin/notifications', icon: '🔔' },
  
];

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 240 }}
        animate={{ width: isCollapsed ? 80 : 240 }}
        className="bg-white shadow-lg relative"
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-white rounded-full p-1.5 shadow-md"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            ))}

            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              {!isCollapsed && <span className="ml-3">Déconnexion</span>}
            </button>
          </nav>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.title || 'Tableau de bord'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user.nom} {user.prenom}</span>
              <div className="relative">
                <img
                  src={user.photo || "/images/user.png"}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
