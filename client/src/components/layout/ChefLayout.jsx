import { Link, Outlet, useLocation } from 'react-router-dom';

const menuItems = [
  { title: 'Tableau de bord', path: '/chef/dashboard', icon: '📊' },
  { title: 'Emploi du temps', path: '/chef/schedule', icon: '📅' },
  { title: 'Présences', path: '/chef/attendance', icon: '✅' },
  { title: 'Feedback', path: '/chef/feedback', icon: '💬' },
  { title: 'Notifications', path: '/chef/notifications', icon: '🔔' },
];

export default function ChefLayout({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col py-8 px-4">
        <div className="mb-8 text-2xl font-bold text-primary-600">Espace Chef</div>
        <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-100 transition ${
                location.pathname === item.path ? 'bg-primary-100 font-semibold' : ''
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-end bg-white shadow px-6 h-16">
          <div className="flex items-center space-x-3">
            <span className="font-medium text-gray-700">{user?.nom} {user?.prenom}</span>
            <img
              src={user?.photo || '/default-avatar.png'}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border"
            />
          </div>
        </header>
        <main className="flex-1 p-6">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
